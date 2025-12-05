import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import Swal from 'sweetalert2';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelLoaderService } from '../../../core/VisualisationAudio/model-loader.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-visualizer',
  templateUrl: './main-visualizer.html',
  styleUrls: ['./main-visualizer.css'],
  imports: [FormsModule],
})
export class MainVisualizer implements OnInit, AfterViewInit {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('systemAudio', { static: true }) private systemAudioRef!: ElementRef<HTMLAudioElement>;

  @Input() public cameraZ = 150;
  @Input() public cameraX = 0;
  @Input() public cameraY = 0;
  @Input() public fieldOfView = 50;
  @Input('nearClip') public nearClipPlane = 0.1;
  @Input('farClip') public farClipPlane = 2000;

  public isAudioReady = signal(false);
  public isLoading = signal(true);
  private _audioLevel = signal(0);
  public audioLevel = () => this._audioLevel();

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  private objMesh: THREE.Group | THREE.Mesh | THREE.Object3D | any = null;
  private planetMesh: THREE.Group | THREE.Mesh | null = null;
  private cloudParticles: THREE.Points[] = [];

  private mixer: THREE.AnimationMixer | null = null;
  private animations: THREE.AnimationClip[] = [];
  private currentAction: THREE.AnimationAction | null = null;
  private currentAnimationIndex = 0;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;

  private clock = new THREE.Clock();

  public volume = 0.5;

  playAudio() {
    const audio = this.systemAudioRef.nativeElement;
    audio.play();
  }

  pauseAudio() {
    const audio = this.systemAudioRef.nativeElement;
    audio.pause();
  }

  stopAudio() {
    const audio = this.systemAudioRef.nativeElement;
    audio.pause();
    audio.currentTime = 0;
  }

  changeVolume(event: any) {
    const audio = this.systemAudioRef.nativeElement;
    audio.volume = this.volume;
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    this.createScene();

    await this.loadMainModel();
    await this.createPlanet();
    this.createClouds(2000);

    this.startRenderingLoop();
    this.isLoading.set(false);

    await this.initAudio();
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
    this.camera.position.set(400, 0, 0);
    this.camera.rotation.set(0.7, 1.5, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 10, 10);

    this.scene.add(ambientLight, dirLight);
  }

  private async loadMainModel(): Promise<void> {
    const path = 'assets/VisualisationAudio/fire_dragon_minecraft/scene.gltf';

    try {
      const maybeObj = await ModelLoaderService.loadGLTFModel(path, [], 20).catch(() => null);

      if (maybeObj && (maybeObj as any).animations?.length > 0) {
        this.objMesh = maybeObj as any;
        this.scene.add(this.objMesh);
        this.setupAnimationsFromObject(this.objMesh);
      } else {
        const result = await this.loadGLTFWithAnimations(path, 40);
        this.objMesh = result.model;
        this.animations = result.animations;
        this.scene.add(this.objMesh);
        this.setupAnimationsFromClips(this.objMesh, this.animations);
      }
    } catch (err) {
      console.warn('Erreur chargement dragon :', err);
      this.createPlaceholderMesh();
    }
  }

  private createPlaceholderMesh(): void {
    const geo = new THREE.BoxGeometry(30, 30, 30);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a5568 });
    this.objMesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.objMesh);
  }

  private async createPlanet(): Promise<void> {
    const path = 'assets/VisualisationAudio/planet/scene.gltf';

    try {
      const planet = await ModelLoaderService.loadGLTFModel(path, [], 2);
      this.planetMesh = planet;
    } catch {
      const geo = new THREE.SphereGeometry(60, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3d9d69,
        roughness: 0.8,
        metalness: 0.1,
      });
      this.planetMesh = new THREE.Mesh(geo, mat);
    }

    this.planetMesh.position.set(0, -180, -200);
    this.scene.add(this.planetMesh);
  }

  private createClouds(count: number): void {
    const vertices: number[] = [];
    for (let i = 0; i < count; i++) {
      vertices.push(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 3,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const clouds = new THREE.Points(geo, mat);
    this.cloudParticles.push(clouds);
    this.scene.add(clouds);
  }

  private loadGLTFWithAnimations(
    path: string,
    scale = 1
  ): Promise<{ model: THREE.Group; animations: THREE.AnimationClip[] }> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(scale, scale, scale);
          resolve({ model: model as THREE.Group, animations: gltf.animations || [] });
        },
        undefined,
        reject
      );
    });
  }

  private setupAnimationsFromObject(obj: any) {
    this.setupAnimationsFromClips(obj, obj.animations || []);
  }

  private setupAnimationsFromClips(obj: THREE.Object3D, clips: THREE.AnimationClip[]) {
    if (!clips?.length) return;

    this.mixer = new THREE.AnimationMixer(obj);
    this.animations = clips;

    this.currentAnimationIndex = 0;
    this.currentAction = this.mixer.clipAction(clips[0]);
    this.currentAction.play();
  }

  private async initAudio(): Promise<void> {
    if (typeof AudioContext === 'undefined') {
      console.warn('AudioContext non supporté.');
      return;
    }

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    await this.askForAudio();
  }

  private async askForAudio(): Promise<void> {
    const { value: file } = await Swal.fire({
      position: 'top-start',
      title: 'Choisissez un fichier audio',
      input: 'file',
      inputAttributes: { accept: 'audio/*' },
      showCancelButton: true,
    });

    if (!file) return;

    const audioEl = this.systemAudioRef.nativeElement;
    audioEl.src = URL.createObjectURL(file);
    audioEl.load();

    const source = this.audioContext!.createMediaElementSource(audioEl);
    source.connect(this.analyser!);
    this.analyser!.connect(this.audioContext!.destination);

    await audioEl.play().catch(() => {});

    this.isAudioReady.set(true);

    audioEl.onended = () => {
      this.isAudioReady.set(false);
      this.askForAudio();
    };
  }

  private getAudioLevel(): number {
    if (!this.isAudioReady() || !this.analyser || !this.frequencyData) return 0;

    this.analyser.getByteFrequencyData(this.frequencyData);
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) sum += this.frequencyData[i];

    return sum / this.frequencyData.length / 255;
  }

  private getFrequencyRangeLevel(start: number, end: number): number {
    if (!this.isAudioReady() || !this.analyser || !this.frequencyData) return 0;

    this.analyser.getByteFrequencyData(this.frequencyData);
    let sum = 0;
    const count = Math.max(1, end - start);

    for (let i = start; i < end && i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
    }
    return sum / count / 255;
  }

  private animateOBJ(): void {
    const delta = this.clock.getDelta();
    const audioLevel = this.getAudioLevel();

    if (this.mixer) this.mixer.update(delta);
    if (!this.objMesh) return;

    const minRotation = -Math.PI / 16;
    const maxRotation = Math.PI / 2;
    this.objMesh.rotation.x = THREE.MathUtils.lerp(minRotation, maxRotation, audioLevel);

    const rotationSpeed = audioLevel * 0.2;
    if (this.planetMesh) {
      this.planetMesh.rotation.y += rotationSpeed;
      this.planetMesh.rotation.z += 0.001;
    }
    this.cloudParticles.forEach((p) => {
      p.rotation.x += rotationSpeed * 0.2;
      p.rotation.y += 0.0005;
    });
  }

  private startRenderingLoop(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(0x05051a, 1);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      requestAnimationFrame(render);
      this.animateOBJ();
      this.renderer.render(this.scene, this.camera);
    };

    render();
  }
}
