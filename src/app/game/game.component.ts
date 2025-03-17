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
    size: 20,
    image: new Image(),
    rotation: 0
  };
  private cactusImage = new Image();
  private pipes: Array<{ x: number, gapY: number, passed?: boolean }> = [];
  private score = 0;
  private gameOver = false;
  public gameStarted = false;
  private animationFrame: number | null = null;
  private coins: Array<{x: number, y: number, vx: number, vy: number, size: number, rotation: number, rotationSpeed: number}> = [];
  private coinAnimationShown = false;

  constructor() {
    this.bird.image.src = 'assets/bird.svg';
    this.cactusImage.src = 'assets/cactus.svg';
  }

  ngOnInit(): void {
    this.initGame();
  }

  private initGame(): void {
    this.bird.y = 200;
    this.bird.velocity = 0;
    this.bird.rotation = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.coins = [];
    this.coinAnimationShown = false;
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
        // Reload the page instead of just restarting the game
        window.location.reload();
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

  private createCoinExplosion(): void {
    // Create 20 coins that explode from the center of the screen
    const canvasWidth = this.canvasRef.nativeElement.width;
    const canvasHeight = this.canvasRef.nativeElement.height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    for (let i = 0; i < 20; i++) {
      // Random velocity for each coin
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 5; // Initial upward bias

      this.coins.push({
        x: centerX,
        y: centerY,
        vx: vx,
        vy: vy,
        size: 15 + Math.random() * 10, // Random size
        rotation: Math.random() * Math.PI * 2, // Random initial rotation
        rotationSpeed: (Math.random() - 0.5) * 0.2 // Random rotation speed
      });
    }
  }

  private updateCoins(): void {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      
      // Update position
      coin.x += coin.vx;
      coin.y += coin.vy;
      
      // Add gravity
      coin.vy += 0.2;
      
      // Update rotation
      coin.rotation += coin.rotationSpeed;
      
      // Remove coins that are off-screen
      if (coin.y > 600 || coin.x < 0 || coin.x > 400) {
        this.coins.splice(i, 1);
      }
    }
  }

  private drawCoins(): void {
    this.ctx.fillStyle = '#FFD700'; // Gold color
    
    this.coins.forEach(coin => {
      this.ctx.save();
      this.ctx.translate(coin.x, coin.y);
      this.ctx.rotate(coin.rotation);
      
      // Draw a circle coin with a dollar sign
      this.ctx.beginPath();
      this.ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add a highlight to make it look more 3D
      this.ctx.fillStyle = '#FFF9C4';
      this.ctx.beginPath();
      this.ctx.arc(-coin.size / 6, -coin.size / 6, coin.size / 6, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw dollar sign
      this.ctx.fillStyle = '#996515';
      this.ctx.font = `bold ${coin.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('$', 0, 0);
      
      this.ctx.restore();
    });
  }

  private animate(): void {
    if (this.gameOver) return;

    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.ctx.clearRect(0, 0, 400, 600);

    // Update bird position
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Calculate bird rotation based on velocity
    // Limit the rotation angle between -30 and 45 degrees
    const targetRotation = this.bird.velocity * 2;
    // Smooth rotation transition
    this.bird.rotation = this.bird.rotation * 0.8 + targetRotation * 0.2;
    this.bird.rotation = Math.max(Math.min(this.bird.rotation, Math.PI/4), -Math.PI/6);

    // Draw bird with image and rotation
    const birdSize = this.bird.size * 2;
    this.ctx.save();
    this.ctx.translate(this.bird.x, this.bird.y);
    this.ctx.rotate(this.bird.rotation);
    this.ctx.drawImage(
      this.bird.image, 
      -birdSize/2, 
      -birdSize/2, 
      birdSize, 
      birdSize
    );
    this.ctx.restore();

    // Update and draw pipes (cacti)
    this.pipes.forEach((pipe, index) => {
      pipe.x -= 2;
      
      // Draw cacti instead of rectangle pipes
      // Top cactus (flipped upside down)
      this.ctx.save();
      this.ctx.translate(pipe.x, pipe.gapY);
      this.ctx.scale(1, -1); // Flip vertically
      this.ctx.drawImage(this.cactusImage, 0, 0, 50, pipe.gapY);
      this.ctx.restore();
      
      // Bottom cactus
      this.ctx.drawImage(
        this.cactusImage, 
        pipe.x, 
        pipe.gapY + 150, 
        50, 
        600 - (pipe.gapY + 150)
      );

      // Check collision
      if (this.checkCollision(pipe)) {
        this.gameOver = true;
      }

      // Update score
      if (pipe.x + 50 < this.bird.x && !pipe.passed) {
        this.score++;
        pipe.passed = true;
        
        // Check if score reached 10 and show coin explosion
        if (this.score === 10 && !this.coinAnimationShown) {
          this.createCoinExplosion();
          this.coinAnimationShown = true;
        }
      }

      // Remove off-screen pipes
      if (pipe.x < -50) {
        this.pipes.splice(index, 1);
      }
    });

    // Update and draw coins
    if (this.coins.length > 0) {
      this.updateCoins();
      this.drawCoins();
    }

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
      const canvasWidth = this.canvasRef.nativeElement.width;
      const canvasHeight = this.canvasRef.nativeElement.height;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      this.ctx.fillStyle = '#000';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Game Over text
      this.ctx.font = '48px Arial';
      this.ctx.fillText('Game Over!', centerX, centerY - 30);
      
      // Restart instruction
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press Space to Restart', centerX, centerY + 30);
      
      // Reset text alignment for other text rendering
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'alphabetic';
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