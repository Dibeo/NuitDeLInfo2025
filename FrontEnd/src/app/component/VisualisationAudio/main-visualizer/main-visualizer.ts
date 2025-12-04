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

@Component({
  selector: 'app-main-visualizer',
  templateUrl: './main-visualizer.html',
  styleUrls: ['./main-visualizer.css'],
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
  public modelName = signal('Boîte de substitution (Échec du chargement du dragon)');

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private objMesh: THREE.Group | THREE.Mesh | THREE.Object3D | any = null;
  private cloudParticles: THREE.Points[] = [];
  private planetMesh: THREE.Group | THREE.Mesh | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private animations: THREE.AnimationClip[] = [];
  private currentAction: THREE.AnimationAction | null = null;
  private currentAnimationIndex = 0;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;

  private clock = new THREE.Clock();

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    this.createScene();
    await this.initAudio();

    // Chemin du modèle
    const dragonModelPath = 'assets/VisualisationAudio/fire_dragon_minecraft/scene.gltf';

    // 1) on essaye d'abord d'utiliser ton ModelLoaderService si tu veux (s'il renvoie animations)
    // 2) sinon on tombe back to GLTFLoader pour s'assurer d'avoir animations + mixer
    try {
      // Essayer ModelLoaderService si tu veux garder son comportement — mais on vérifie animations
      const maybeObj = await ModelLoaderService.loadGLTFModel(dragonModelPath, [], 20).catch(() => null);

      if (maybeObj && (maybeObj as any).animations && (maybeObj as any).animations.length > 0) {
        // ModelLoaderService a renvoyé quelque chose avec animations
        this.objMesh = maybeObj as any;
        this.scene.add(this.objMesh);
        this.modelName.set('Dragon (chargé via ModelLoaderService)');
        this.setupAnimationsFromObject(this.objMesh as any);
      } else {
        // Fallback : charger directement avec GLTFLoader pour garantir les animations
        const result = await this.loadGLTFWithAnimations(dragonModelPath, 20);
        this.objMesh = result.model;
        this.animations = result.animations;
        this.scene.add(this.objMesh);
        this.modelName.set('Dragon (chargé via GLTFLoader)');
        this.setupAnimationsFromClips(this.objMesh, this.animations);
      }
    } catch (err) {
      console.warn('Erreur chargement dragon :', err);
      this.modelName.set('Boîte de substitution');
      this.createPlaceholderMesh();
    } finally {
      await this.createPlanet();
      this.createClouds(2000);
      this.isLoading.set(false);
      this.startRenderingLoop();
    }
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
      title: 'Choisissez un fichier audio',
      input: 'file',
      inputAttributes: {
        accept: 'audio/*',
        'aria-label': 'Choisissez un fichier audio',
      },
      showCancelButton: true,
    });

    if (!file) return;

    const audioElement = this.systemAudioRef.nativeElement;
    audioElement.src = URL.createObjectURL(file as File);
    audioElement.load();

    // connect audio graph
    const source = this.audioContext!.createMediaElementSource(audioElement);
    source.connect(this.analyser!);
    this.analyser!.connect(this.audioContext!.destination);

    await audioElement.play().catch(() => {
      console.warn('Lecture automatique bloquée. L’utilisateur devra cliquer pour démarrer l’audio.');
    });

    this.isAudioReady.set(true);

    audioElement.onended = () => {
      this.isAudioReady.set(false);
      this.askForAudio();
    };
  }

  private getAudioLevel(): number {
    if (!this.isAudioReady() || !this.analyser || !this.frequencyData) return 0;

    this.analyser.getByteFrequencyData(this.frequencyData);
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) sum += this.frequencyData[i];
    return (sum / this.frequencyData.length) / 255;
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
    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(10, 10, 10);
    this.scene.add(dir);
  }

  private async createPlanet(): Promise<void> {
    const planetModelPath = 'assets/VisualisationAudio/lava_planet/scene.gltf';

    try {
      const planet = await ModelLoaderService.loadGLTFModel(planetModelPath);
      this.planetMesh = planet;
      this.planetMesh.scale.set(10, 10, 10);
      this.planetMesh.position.set(0, -100, -200);
      this.scene.add(this.planetMesh);
    } catch (error) {
      console.warn('Erreur lors du chargement du modèle de planète, création d’une sphère par défaut.', error);
      const geometry = new THREE.SphereGeometry(60, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x3d9d69,
        roughness: 0.8,
        metalness: 0.1,
      });
      this.planetMesh = new THREE.Mesh(geometry, material);
      this.planetMesh.position.set(0, -100, -200);
      this.scene.add(this.planetMesh);
    }
  }

  private createClouds(count: number): void {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    for (let i = 0; i < count; i++) {
      vertices.push(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500
      );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 3,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const clouds = new THREE.Points(geometry, material);
    this.cloudParticles.push(clouds);
    this.scene.add(clouds);
  }

  private createPlaceholderMesh(): void {
    const geometry = new THREE.BoxGeometry(30, 30, 30);
    const material = new THREE.MeshStandardMaterial({ color: 0x4a5568 });
    this.objMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.objMesh);
  }

  // ----- animations helpers -----
  private setupAnimationsFromObject(obj: any) {
    // si ModelLoaderService a placé animations sur l'objet
    const animations: THREE.AnimationClip[] = (obj as any).animations || [];
    this.setupAnimationsFromClips(obj, animations);
  }

  private setupAnimationsFromClips(obj: THREE.Object3D, clips: THREE.AnimationClip[]) {
    if (!clips || clips.length === 0) return;

    this.mixer = new THREE.AnimationMixer(obj);
    this.animations = clips;

    // play first clip
    this.currentAnimationIndex = 0;
    this.currentAction = this.mixer.clipAction(this.animations[this.currentAnimationIndex]);
    this.currentAction.play();
  }

  private loadGLTFWithAnimations(path: string, scale = 1): Promise<{ model: THREE.Group; animations: THREE.AnimationClip[] }> {
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
        (err) => reject(err)
      );
    });
  }

  // extrait fréquences (bass/treble)
  private getFrequencyRangeLevel(startBin: number, endBin: number): number {
    if (!this.isAudioReady() || !this.analyser || !this.frequencyData) return 0;
    let sum = 0;
    const count = Math.max(1, endBin - startBin);
    this.analyser.getByteFrequencyData(this.frequencyData);
    for (let i = startBin; i < endBin && i < this.frequencyData.length; i++) sum += this.frequencyData[i];
    return sum / count / 255;
  }

  private animateOBJ(): void {
    const delta = this.clock.getDelta();

    if (this.mixer) this.mixer.update(delta);

    if (!this.objMesh || !this.frequencyData) return;

    const bass = this.getFrequencyRangeLevel(0, 20);
    const treble = this.getFrequencyRangeLevel(60, Math.min(127, this.frequencyData.length));

    const targetY = (treble - bass) * 30;
    // lerp position Y
    this.objMesh.position.y = THREE.MathUtils.lerp(this.objMesh.position.y, targetY, 0.08);

    // garder rotation Y fixe (si tu veux animer)
    this.objMesh.rotation.y = 11;

    if (this.planetMesh) {
      this.planetMesh.rotation.z += 0.005;
    }

    this.cloudParticles.forEach((p) => {
      p.rotation.y -= 0.001;
      p.rotation.x += 0.0005;
    });
  }

  private startRenderingLoop(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setClearColor(0x05051a, 1);

    const onResize = () => {
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);
    onResize();

    const render = () => {
      requestAnimationFrame(render);
      this.animateOBJ();
      this.renderer.render(this.scene, this.camera);
    };

    render();
  }
}
