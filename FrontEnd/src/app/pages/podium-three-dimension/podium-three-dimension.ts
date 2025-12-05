import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import UserProgressRepository, { User } from '../../../core/UserProgressAPI/UserProgressRepository';
import QuizController from '../../../core/questions/QuizController';

const FETCH_WAIT_TIME: number = 2000;

@Component({
  selector: 'app-podium-three-dimension',
  standalone: true,
  imports: [],
  templateUrl: './podium-three-dimension.html',
  styleUrl: './podium-three-dimension.css',
})
export class PodiumThreeDimension implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas')
  public canvasRef!: ElementRef<HTMLCanvasElement>;

  private _guestId: string = UserProgressRepository.getUniqueId();
  private _users: Array<User> = [];
  private _intervalId: any;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private barsGroup: THREE.Group = new THREE.Group();
  private animationId: number | null = null;

  public width: number = 800;
  public height: number = 600;

  public async ngOnInit(): Promise<void> {
    await this.fetchUsers();
    this._intervalId = setInterval(async () => {
      await this.fetchUsers();
    }, FETCH_WAIT_TIME);

    let controller: QuizController = new QuizController();
    console.log(controller.getQuestion());
  }

  public ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
  }

  public ngOnDestroy(): void {
    if (this._intervalId) clearInterval(this._intervalId);
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
  }

  private async fetchUsers(): Promise<void> {
    const users = await UserProgressRepository.getAll();
    this._users = users.sort((a, b) => b.xp - a.xp);
    this.update3DPodium();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
    this.camera.position.set(60, 75, 60);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-50, 100, 50);
    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;

    this.scene.add(dirLight);

    // const axesHelper = new THREE.AxesHelper( 50 );
    // this.scene.add( axesHelper );

    this.scene.add(this.barsGroup);
  }

  private update3DPodium(): void {
    if (!this.scene) return;

    while (this.barsGroup.children.length > 0) {
      const child = this.barsGroup.children[0] as THREE.Mesh;
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        (child.material as THREE.Material).dispose();
      }
      this.barsGroup.remove(child);
    }

    const maxUsersToShow = 10;
    const displayUsers = this._users.slice(0, maxUsersToShow);

    const barWidth = 10;
    const spacing = 20;
    const startX = -((displayUsers.length * spacing) / 2) + spacing / 2;

    displayUsers.forEach((user, index) => {
      const barHeight = Math.max(2, user.xp / 1.5);

      const geometry = new THREE.BoxGeometry(barWidth, barHeight, barWidth);

      const colorHex = this.getBarColorHex(index);
      const material = new THREE.MeshPhongMaterial({
        color: colorHex,
        shininess: 100,
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(startX + index * spacing, barHeight / 2, 0);
      cube.castShadow = true;
      cube.receiveShadow = true;
      this.barsGroup.add(cube);

      const nameMesh = this.createNameLabel(user.name || 'User');

      // Positionnement du texte : même X, Y à ras du sol (0.1), Z devant la barre
      nameMesh.position.set(startX + index * spacing, 0.1, barWidth / 2 + 8);

      // Rotation -90deg sur X pour être à plat sur le sol
      nameMesh.rotation.x = -Math.PI / 2;

      this.barsGroup.add(nameMesh);
    });
  }

  private createNameLabel(text: string): THREE.Mesh {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Taille haute résolution pour le texte
    canvas.width = 256;
    canvas.height = 64;

    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = 'Bold 24px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Taille du plan dans la scène 3D (ajuster selon échelle de la scène)
    const geometry = new THREE.PlaneGeometry(20, 5);

    return new THREE.Mesh(geometry, material);
  }

  private getBarColorHex(rank: number): number {
    if (rank === 0) return 0xffd700;
    if (rank === 1) return 0xc0c0c0;
    if (rank === 2) return 0xcd7f32;
    return 0x4bc0c0;
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
