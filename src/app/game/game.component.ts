import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private bird = {
    x: 50,
    y: 200,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    size: 20
  };
  private pipes: Array<{ x: number, gapY: number, passed?: boolean }> = [];
  private score = 0;
  private gameOver = false;
  public gameStarted = false;
  private animationFrame: number | null = null;

  constructor() { }

  ngOnInit(): void {
    this.initGame();
  }

  private initGame(): void {
    this.bird.y = 200;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      if (!this.gameStarted) {
        this.gameStarted = true;
        this.startGame();
      } else if (!this.gameOver) {
        this.bird.velocity = this.bird.jump;
      } else {
        this.initGame();
        this.startGame();
      }
    }
  }

  private startGame(): void {
    this.animate();
    this.generatePipes();
  }

  private generatePipes(): void {
    if (this.gameOver) return;
    
    const gapHeight = 150;
    const gapY = Math.random() * (400 - gapHeight);
    this.pipes.push({
      x: 400,
      gapY: gapY
    });

    setTimeout(() => this.generatePipes(), 2000);
  }

  private animate(): void {
    if (this.gameOver) return;

    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.ctx.clearRect(0, 0, 400, 600);

    // Update bird position
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Draw bird
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Update and draw pipes
    this.pipes.forEach((pipe, index) => {
      pipe.x -= 2;
      
      // Draw pipes
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.fillRect(pipe.x, 0, 50, pipe.gapY);
      this.ctx.fillRect(pipe.x, pipe.gapY + 150, 50, 600 - (pipe.gapY + 150));

      // Check collision
      if (this.checkCollision(pipe)) {
        this.gameOver = true;
      }

      // Update score
      if (pipe.x + 50 < this.bird.x && !pipe.passed) {
        this.score++;
        pipe.passed = true;
      }

      // Remove off-screen pipes
      if (pipe.x < -50) {
        this.pipes.splice(index, 1);
      }
    });

    // Draw score
    this.ctx.fillStyle = '#000';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    // Check if bird is out of bounds
    if (this.bird.y < 0 || this.bird.y > 600) {
      this.gameOver = true;
    }

    // Draw game over message
    if (this.gameOver) {
      this.ctx.fillStyle = '#000';
      this.ctx.font = '48px Arial';
      this.ctx.fillText('Game Over!', 100, 300);
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press Space to Restart', 80, 350);
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  private checkCollision(pipe: { x: number, gapY: number }): boolean {
    return (
      this.bird.x + this.bird.size > pipe.x &&
      this.bird.x - this.bird.size < pipe.x + 50 &&
      (this.bird.y - this.bird.size < pipe.gapY ||
        this.bird.y + this.bird.size > pipe.gapY + 150)
    );
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
} 