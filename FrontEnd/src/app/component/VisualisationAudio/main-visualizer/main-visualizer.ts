import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

@Component({
  selector: 'app-main-visualizer',
  templateUrl: './main-visualizer.html',
  styleUrls: ['./main-visualizer.css'],
})
export class MainVisualizer implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() public cameraZ = 700;
  @Input() public fieldOfView = 75;
  @Input('nearClip') public nearClipPlane = 1;
  @Input('farClip') public farClipPlane = 1000;

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private frequencyData!: Uint8Array<ArrayBuffer>;
  private isAudioReady = false;

  private objMesh!: THREE.Group;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    await this.initAudio();
    this.createScene();
    await this.loadOBJModel('assets/VisualisationAudio/dtagon.obj', [
      'assets/VisualisationAudio/MAPS/M_Dragon_Base_color.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Emissive.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Height.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Metallic.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Mixed_AO.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Normal.png',
      'assets/VisualisationAudio/MAPS/M_Dragon_Roughness.png',
    ]);
    this.startRenderingLoop();
  }

  private async initAudio(): Promise<void> {
    this.audioContext = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();

    this.analyser.fftSize = 256;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    source.connect(this.analyser);
    this.isAudioReady = true;
  }

  private getAudioLevel(): number {
    if (!this.isAudioReady) return 0;

    this.analyser.getByteFrequencyData(this.frequencyData);

    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
    }
    return sum / this.frequencyData.length;
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
        (xhr: any) => {
          console.log(`OBJLoader: ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error: any) => {
          console.error('Error loading OBJ file:', error);
          reject(error);
        }
      );
    });
  }

  private animateOBJ(): void {
    if (!this.objMesh) return;

    const level = this.getAudioLevel() / 255;

    this.objMesh.rotation.y += 0.01 + level * 10;
    //this.objMesh.rotation.x += 0.005 + level * 10;
    const scale = 1 + level * 0.5;
    this.objMesh.scale.set(scale, scale, scale);
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

      this.animateOBJ();
      this.renderer.render(this.scene, this.camera);
    };

    render();
  }
}
