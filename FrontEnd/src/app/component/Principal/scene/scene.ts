import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

@Component({
  selector: 'app-scene',
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
  private cubeSpeed = 0.1;  // vitesse d’approche

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  private landscapeGLTF!: THREE.Group;
  private treeGLTF!: THREE.Group;
  private movingGLTF: THREE.Group[] = [];


  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  // ---------------------------------- Init -----------------------------------------------------

  ngAfterViewInit(): void {
    // Création de la scène et chargement du modèle 3D
    this.createScene();


    //this.startRenderingLoop();
    this.startSpawningGLTF();

    this.canvas.addEventListener('click', (event) => this.onClick(event), false);

    // Usage
    this.loadGLTFModel('assets/Principal/landcape/voxel_landscape.glb')
    .then(obj => this.landscapeGLTF = obj);
    this.loadGLTFModel('assets/Principal/tree/voxel_tutorial_-_scene_2.glb')
    .then(obj => this.treeGLTF = obj)
    .then(() => this.startRenderingLoop());

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


    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
    cube.position.set(0, -2, 2);
    cube.scale.z = 5000;
    cube.scale.x = 5;

    //HDRI
    const loader = new RGBELoader();
    loader.load('assets/Principal/HDRI/HDR_rich_blue_nebulae_2.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.scene.environment = texture;
    });


    // Lumières pour éclairer correctement le modèle
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }



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



  private updateMovingGLTF(): void {
    for (let i = this.movingGLTF.length - 1; i >= 0; i--) {
      const obj = this.movingGLTF[i];
      obj.position.z += this.cubeSpeed;

      if (obj.position.z > this.camera.position.z + 1) {
        this.scene.remove(obj);
        this.movingGLTF.splice(i, 1);
      }
    }
  }


  private startSpawningGLTF(): void {
    setInterval(() => {
      if (this.treeGLTF && this.movingGLTF.length < 30) {
        this.spawnMovingGLTF();
      }
    }, 1000);
  }

  private startRenderingLoop(): void {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);


    const render = () => {
      requestAnimationFrame(render);
      this.updateMovingGLTF();  // ← ajout ici
      this.renderer.render(this.scene, this.camera);
    };

      render();
  }


  private onClick(event: MouseEvent): void {
    // Coordonnées normalisées (-1 à +1) pour Three.js
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Mettre à jour le raycaster depuis la caméra
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Vérifier les intersections avec tous les cubes (ou objets cliquables)
    const intersects = this.raycaster.intersectObjects(this.movingCubes, true);


    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      //Clique sur le cube
      if ((clickedObject as THREE.Mesh).isMesh) {
        const mesh = clickedObject as THREE.Mesh;
        (mesh.material as THREE.MeshStandardMaterial).color.set(0xffffff);
      }


    }
  }


  private spawnMovingGLTF(): void {
    if (!this.treeGLTF || !this.treeGLTF) return;

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

    clone1.position.set(x, -5, -50);
    clone2.position.set(x, -5, -50);

    // Optionnel : scale aléatoire
    const scale = THREE.MathUtils.randFloat(0.5, 2);
    clone1.scale.set(scale, scale, scale);
    clone2.scale.set(0.15, 0.15, 0.15);

    this.scene.add(clone1);
    this.movingGLTF.push(clone1);
    this.scene.add(clone2);
    this.movingGLTF.push(clone2);

  }
}
