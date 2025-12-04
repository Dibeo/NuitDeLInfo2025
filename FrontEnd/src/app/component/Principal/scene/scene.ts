import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

  private gltfMesh!: THREE.Group;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  ngAfterViewInit(): void {
    // Création de la scène et chargement du modèle 3D
    this.createScene();


    this.startRenderingLoop();
    this.startSpawningCubes();

    window.addEventListener('resize', () => this.onWindowResize(), false);


    /*this.loadGLTFModel('assets/Principal/HORNET.glb')
      .then(() => {
      })
      .catch((error) => {
        console.error('Erreur lors du chargement du modèle GLB:', error);
      });*/
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
    cube.scale.z = 500;
    cube.scale.x = 5;


    // Lumières pour éclairer correctement le modèle
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }



  private async loadGLTFModel(path: string): Promise<void> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          this.gltfMesh = gltf.scene; // l'objet chargé
          this.gltfMesh.scale.set(1, 1, 1);
          this.scene.add(this.gltfMesh);
          resolve();
        },
        undefined,
        (error) => {
          console.error('Error loading GLTF/GLB file:', error);
          reject(error);
        }
      );
    });
  }



  private updateMovingCubes(): void {
    for (let i = this.movingCubes.length - 1; i >= 0; i--) {
      const cube = this.movingCubes[i];
      cube.position.z += this.cubeSpeed;

      if (cube.position.z > this.camera.position.z + 1) {
        this.scene.remove(cube);
        cube.geometry.dispose();
        (cube.material as THREE.Material).dispose();
        this.movingCubes.splice(i, 1);
      }
    }
  }

  private startSpawningCubes(): void {
    setInterval(() => {
      if (this.movingCubes.length < 30) {
        this.spawnMovingCube();
      }
    }, 1000); // un cube maximum toutes les 1 seconde
  }

  private spawnMovingCube(): void {
    const size = THREE.MathUtils.randFloat(0.5, 2);
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff
    });

    const cube = new THREE.Mesh(geometry, material);

    // Placement aléatoire sur un large axe X et Y
    cube.position.set(
      THREE.MathUtils.randFloat(-10, 10), // gauche/droite
      THREE.MathUtils.randFloat(-5, 5),   // haut/bas
      -50                                  // loin devant caméra
    );

    this.scene.add(cube);
    this.movingCubes.push(cube);
  }


  private startRenderingLoop(): void {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
      this.renderer.setPixelRatio(devicePixelRatio);
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);


  const render = () => {
    requestAnimationFrame(render);
    this.updateMovingCubes();  // ← ajout ici
    this.renderer.render(this.scene, this.camera);
  };

      render();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Mettre à jour la caméra
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Mettre à jour le renderer
    this.renderer.setSize(width, height);
  }
}
