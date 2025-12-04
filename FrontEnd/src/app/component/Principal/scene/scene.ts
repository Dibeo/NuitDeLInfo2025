import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.html',
  styleUrls: ['./scene.css'],
})
export class Scene implements AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() public cameraZ = 700;
  @Input() public fieldOfView = 75;
  @Input('nearClip') public nearClipPlane = 1;
  @Input('farClip') public farClipPlane = 1000;

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  private objMesh!: THREE.Group;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  ngAfterViewInit(): void {
    // Création de la scène et chargement du modèle 3D
    this.createScene();
    this.loadOBJModel('assets/VisualisationAudio/dtagon.obj', [
      'assets/VisualisationAudio/MAPS/M_Dragon_Base_color.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Emissive.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Height.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Metallic.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Mixed_AO.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Normal.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Roughness.png',
    ]).then(() => {
      this.startRenderingLoop();
    });
  }

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

    // Lumières pour éclairer correctement le modèle
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }

  private async loadOBJModel(path: string, texturePaths: string[] = []): Promise<void> {
    const textures = await this.loadTextures(texturePaths);
    const loader = new OBJLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        path,
        async (obj: any) => {
          this.objMesh = obj;
          this.objMesh.scale.set(1, 1, 1);

          if (textures.length) {
            await this.applyTexturesToOBJ(this.objMesh, textures);
          }

          this.scene.add(this.objMesh);
          resolve();
        },
        undefined,
        (error: any) => {
          console.error('Error loading OBJ file:', error);
          reject(error);
        }
      );
    });
  }

  private loadTextures(texturePaths: string[]): Promise<THREE.Texture[]> {
    const loader = new THREE.TextureLoader();
    const promises = texturePaths.map(
      (path) =>
        new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            path,
            (texture) => resolve(texture),
            undefined,
            (err) => reject(err)
          );
        })
    );
    return Promise.all(promises);
  }

  private async applyTexturesToOBJ(obj: THREE.Group, textures: THREE.Texture[]) {
    let textureIndex = 0;

    obj.traverse((child: any) => {
      if (child.isMesh) {
        const texture = textures[textureIndex % textures.length];
        child.material = new THREE.MeshStandardMaterial({ map: texture });
        textureIndex++;
      }
    });
  }

  private startRenderingLoop(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    const render = () => {
      requestAnimationFrame(render);

      // Plus d'animation, l'objet est simplement affiché
      this.renderer.render(this.scene, this.camera);
    };

    render();
  }
}

