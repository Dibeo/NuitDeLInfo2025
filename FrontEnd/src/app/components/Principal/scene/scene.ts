import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import QuizController from '../../../../core/questions/QuizController.js';
import { XpBar } from '../../xp-bar/xp-bar.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


@Component({
  selector: 'app-scene',
  imports: [XpBar],
  templateUrl: './scene.html',
  styleUrls: ['./scene.css'],
})
export class Scene implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() public cameraZ = 2;
  @Input() public fieldOfView = 75;
  @Input('nearClip') public nearClipPlane = 1;
  @Input('farClip') public farClipPlane = 500;

  private movingCubes: THREE.Mesh[] = [];
  private cubeSpeed = 0;  // vitesse d’approche

  private cube1!: THREE.Mesh;
  private cube2!: THREE.Mesh;

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  private solGLTF!: THREE.Group;
  private landscapeGLTF!: THREE.Group;
  private treeGLTF!: THREE.Group;
  private movingGLTF: THREE.Object3D[] = [];

  private textQuestion!: THREE.Object3D;
  private textAnswer1!: THREE.Object3D;
  private textAnswer2!: THREE.Object3D;

  //controller
  private controller: QuizController = new QuizController();

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private worldz: number = 0;
  private advanceDistance: number = 0.2; // distance à avancer par scroll ou flèche

  private counter: number = 0;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  // ---------------------------------- Init -----------------------------------------------------

  ngAfterViewInit(): void {
    // Création de la scène et chargement du modèle 3D
    this.createScene();

    this.setupControls();

    this.canvas.addEventListener('click', (event) => this.onClick(event), false);

    window.addEventListener('resize', () => this.onWindowResize(), false);

    // Appel initial pour que le canvas prenne tout l'écran

    // Usage
    this.loadGLTFModel('assets/Principal/landcape/voxel_landscape.glb')
    .then(obj => this.landscapeGLTF = obj);
    this.loadGLTFModel('assets/Principal/tree/voxel_tutorial_-_scene_2.glb')
    .then(obj => this.treeGLTF = obj)
    .then(() => this.startRenderingLoop());

    this.startSpawningGLTF();

    this.onWindowResize();

  }

  // ---------------------------------- Scene ----------------------------------------------------
  private createScene(): void {
    this.scene = new THREE.Scene();

    const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClipPlane,
      this.farClipPlane
    );

    this.camera.position.z = this.cameraZ;

    //this.scene.fog = new THREE.Fog(0x000000, 10, 100);
    this.scene.fog = new THREE.FogExp2(0x2a3d14, 0.02);


    //faire spwn les cubes de question
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });


    this.cube1 = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube1);
    this.cube1.position.set(-1, 0, -20);
    this.cube1.scale.set(1,1,1);

    this.cube2 = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube2);
    this.cube2.position.set(1, 0, -20);
    this.cube2.scale.set(1,1,1);

    // Les ajouter à movingGLTF pour avancer avec le scroll
    this.movingGLTF.push(this.cube1, this.cube2);


    //HDRI
    /*const loader = new RGBELoader();
    loader.load('assets/Principal/HDRI/HDR_rich_blue_nebulae_2.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.scene.environment = texture;
    });*/

    // Charger une police

    let txt: string = this.controller.getQuestion();
    this.LoadText(this.controller.getQuestion()).then(group => {
      this.textQuestion = group;
      this.textQuestion.position.set(this.cube1.position.x, this.cube1.position.y + 1.5 , this.cube1.position.z);
    });
    txt = this.controller.getAnswers()[0];
    this.LoadText(this.controller.getQuestion()).then(group => {
      this.textAnswer1 = group;
      this.textAnswer1.position.set(this.cube1.position.x, this.cube1.position.y, this.cube1.position.z + 1 );
    });
    txt = this.controller.getAnswers()[1];
    this.LoadText(this.controller.getQuestion()).then(group => {
      this.textAnswer2 = group;
      this.textAnswer2.position.set(this.cube2.position.x, this.cube2.position.y, this.cube2.position.z + 1);
    });


    this.loadGLTFModel('assets/Principal/Sol/scene1.glb')
    .then(obj => {
      this.solGLTF = obj;
      this.solGLTF.position.set(0, -1.5, 0);
      this.solGLTF.rotation.set(0, Math.PI/2, 0);
      this.solGLTF.scale.set(2, 2, 2.5);
      this.scene.add(this.solGLTF);
    });

    //animations
    this.loadGLTFAnime('assets/Principal/poule/crazycock_character_low_poly_animated.glb')
      .then(({ model, mixer, animations }) => {
        this.scene.add(model);

        // Choisir le clip original
        const originalClip = animations[0]; // ou celui voulu

        // Créer un sous-clip (frames de début et fin à ajuster selon ton animation)
        // startFrame et endFrame en indices de frame (par ex. 0 et 50)
        const subClip = THREE.AnimationUtils.subclip(originalClip, 'loopPart', 50, 100);

        const action = mixer.clipAction(subClip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();

        const clock = new THREE.Clock();
        const animate = () => {
          requestAnimationFrame(animate);
          const delta = clock.getDelta();
          mixer.update(delta);
        };
        animate();
    });

    // Lumières pour éclairer correctement le modèle
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }

  //------------------------------------ Load Model ----------------------------------------------


  private async loadGLTFModel(path: string): Promise<THREE.Group> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const obj = gltf.scene;
          obj.scale.set(1, 1, 1);
          resolve(obj);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }


  private async loadGLTFAnime(path: string): Promise<{ model: THREE.Group; mixer: THREE.AnimationMixer; animations: THREE.AnimationClip[] }> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
            model.scale.set(0.005, 0.005, 0.005);
            model.rotation.set(0, Math.PI + Math.PI/10, 0);
            model.position.set(1.5, -1, 0.5);

          if (!gltf.animations || gltf.animations.length === 0) {
            reject(new Error('Le GLTF ne contient pas d’animations'));
            return;
          }

          const mixer = new THREE.AnimationMixer(model);

          resolve({ model, mixer, animations: gltf.animations });
        },
        undefined,
        (error) => reject(error)
      );
    });
  }


  private startSpawningGLTF(): void {

    setInterval(() => {
      if (this.treeGLTF && this.movingGLTF.length < 30) {
        if (this.counter < 30) this.spawnInit();
        else this.spawnMovingGLTF();
      }
    }, 1);
  }


private startRenderingLoop(): void {

  this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize(window.innerWidth, window.innerHeight);


    const clock = new THREE.Clock();

    const render = () => {
        requestAnimationFrame(render);

        const delta = clock.getDelta();

        // Mettre à jour l'animation avec le delta
        //this.updateMovingGLTF(delta);

        // Rendu de la scène
        this.renderer.render(this.scene, this.camera);
    };

    render(); // démarrage de la boucle
}


  private LoadText(txt: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json',
        (font) => {
          const lines = txt.split('\n');
          const size = 0.1;
          const height = 0.01;
          const spacing = 0.2;
          const textGroup = new THREE.Group();

          lines.forEach((line, index) => {
            const geometry = new TextGeometry(line, { font, size, depth: height, curveSegments: 12 });
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, -index * spacing, 0);
            textGroup.add(mesh);
          });

          this.scene.add(textGroup);
          resolve(textGroup);
        },
        undefined,
        (err) => reject(err)
      );
    });
  }




  private onClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    let result: boolean = false;

    // Tester séparément les deux cubes
    const intersectsRight = this.raycaster.intersectObjects([this.cube1], true);
    const intersectsLeft = this.raycaster.intersectObjects([this.cube2], true);

    if (intersectsRight.length > 0) {
      const mesh = intersectsRight[0].object as THREE.Mesh;
      if (this.controller.choose('B')) {
        console.log("B est true");
        (mesh.material as THREE.MeshStandardMaterial).color.set(0xff0000);
      }
      else console.log("Be est false");

    }

    if (intersectsLeft.length > 0) {
      const mesh = intersectsLeft[0].object as THREE.Mesh;
      if (this.controller.choose('A')) {
          (mesh.material as THREE.MeshStandardMaterial).color.set(0xff0000);
          console.log("A est true");
      }

      else console.log("A est false");
    }
  }


  private spawnInit(): void {

    if (!this.treeGLTF) return;

    this.counter += 1;
    // Clone en profondeur
    const clone1 = this.treeGLTF.clone(true);
    const clone2 = this.landscapeGLTF.clone(true);
    console.log("debug");


    // Position aléatoire comme pour les cubes
    let x: number;
    if (Math.random() < 0.5) {
      x = THREE.MathUtils.randFloat(-10, -5);
    } else {
      x = THREE.MathUtils.randFloat(5, 10);
    }

    clone1.position.set(x, -5, THREE.MathUtils.randFloat(2, -50));
    clone2.position.set(x, -5, THREE.MathUtils.randFloat(2, -50));

    // Optionnel : scale aléatoire
    const scale = THREE.MathUtils.randFloat(0.5, 2);
    clone1.scale.set(scale, scale, scale);
    clone2.scale.set(0.15, 0.15, 0.15);

    this.scene.add(clone1);
    this.movingGLTF.push(clone1);
    this.scene.add(clone2);
    this.movingGLTF.push(clone2);



  }

  private spawnMovingGLTF(): void {
    if (!this.treeGLTF) return;

    // Clone en profondeur
    const clone1 = this.treeGLTF.clone(true);
    const clone2 = this.landscapeGLTF.clone(true);



    // Position aléatoire comme pour les cubes
    let x: number;
    if (Math.random() < 0.5) {
      x = THREE.MathUtils.randFloat(-10, -5);
    } else {
      x = THREE.MathUtils.randFloat(5, 10);
    }

    clone1.position.set(x, -5,  -50);
    clone2.position.set(x, -5,  -50);

    // Optionnel : scale aléatoire
    const scale = THREE.MathUtils.randFloat(0.5, 2);
    clone1.scale.set(scale, scale, scale);
    clone2.scale.set(0.15, 0.15, 0.15);

    this.scene.add(clone1);
    this.movingGLTF.push(clone1);
    this.scene.add(clone2);
    this.movingGLTF.push(clone2);

  }

  private advanceSolTexture(delta: number): void {
    if (!this.solGLTF) return;

    this.solGLTF.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.map) {
          material.map.offset.y += delta;
          material.map.needsUpdate = true;
        }
      }
    });
  }



private updateMovingGLTF(deltaZ: number = 0, deltaTexture: number = 0): void {
    for (let i = this.movingGLTF.length - 1; i >= 0; i--) {
      const obj = this.movingGLTF[i];
      obj.position.z += deltaZ;

      // Ne supprimer que les arbres et paysages, pas les cubes si besoin
      if (obj !== this.cube1 && obj !== this.cube2) {
        if (obj.position.z > this.camera.position.z + 3) {
          this.scene.remove(obj);
          this.movingGLTF.splice(i, 1);
        }
      }
    }

    this.textQuestion.position.set(this.cube1.position.x, this.cube1.position.y + 1.5 , this.cube1.position.z);
    this.textAnswer1.position.set(this.cube1.position.x, this.cube1.position.y, this.cube1.position.z + 1 );
    this.textAnswer2.position.set(this.cube2.position.x, this.cube2.position.y, this.cube2.position.z + 1);


    if (deltaTexture !== 0) {
      this.advanceSolTexture(deltaTexture);
    }
}



  private setupControls(): void {
    window.addEventListener('wheel', (event: WheelEvent) => {
      // Vérification : si les cubes sont au-delà de -5, aucun mouvement n’est appliqué
      if (this.cube1.position.z > -0.5) return;

      const direction = event.deltaY < 0 ? 1 : -1;
      this.updateMovingGLTF(direction * this.advanceDistance, direction * 0.03);
    });

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        // Vérification identique pour les touches
        if (this.cube1.position.z > -5) return;

        this.updateMovingGLTF(this.advanceDistance, 0.01);
      }
    });
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

}
