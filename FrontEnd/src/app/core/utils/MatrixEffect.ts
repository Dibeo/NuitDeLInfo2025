// src/app/shared/utils/matrix-effect.ts

export class MatrixEffect {
  private ctx!: CanvasRenderingContext2D;
  private drops: number[] = [];
  private fontSize = 14;
  private animationInterval: any;
  private matrixChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}'.split('');

  constructor(private canvas: HTMLCanvasElement, private color = '#00ff90') {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Impossible d’obtenir le contexte 2D du canvas.');
    this.ctx = ctx;
    this.init();
  }

  private init() {
    this.resizeCanvas();
    const columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = Array.from({ length: columns }, () => 1);
    this.start();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private draw() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const text = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
      ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

      if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
  }

  private start() {
    if (this.animationInterval) clearInterval(this.animationInterval);
    this.animationInterval = setInterval(() => this.draw(), 50);
  }

  public stop() {
    clearInterval(this.animationInterval);
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }
}