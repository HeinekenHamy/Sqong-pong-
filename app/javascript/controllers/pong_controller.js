import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["canvas", "score"];
  static values  = { submitUrl: String, guest: Boolean };

  connect() {
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas.bind(this));

    this.paddleY      = this.height / 2 - 40;
    this.paddleHeight = 54;
    this.paddleSpeed  = 0;
    this.ballX        = this.width  / 2;
    this.ballY        = this.height / 2;
    this.ballVX       = 4;
    this.ballVY       = 3;
    this.score        = 0;
    this.gameOver     = false;

    window.addEventListener("keydown", this.handleKey.bind(this));
    window.addEventListener("keyup",   this.stopMove.bind(this));

    this.frame = requestAnimationFrame(this.update.bind(this));
  }

  disconnect() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.resizeCanvas);
    window.removeEventListener("keydown", this.handleKey);
    window.removeEventListener("keyup",   this.stopMove);
  }

  resizeCanvas() {
    const rect = this.canvasTarget.getBoundingClientRect();
    this.canvasTarget.width  = rect.width;
    this.canvasTarget.height = rect.height;
    this.ctx    = this.canvasTarget.getContext("2d");
    this.width  = rect.width;
    this.height = rect.height;
  }

  handleKey(e) {
    const k = e.key.toLowerCase();
    if (k === "w") { this.paddleSpeed = -8; e.preventDefault(); }
    if (k === "s") { this.paddleSpeed =  8; e.preventDefault(); }
  }

  stopMove(e) {
    this.paddleSpeed = 0;
    e.preventDefault();
  }

  moveUp()   { if (!this.gameOver) this.paddleSpeed = -8; }
  moveDown() { if (!this.gameOver) this.paddleSpeed =  8; }

  update() {
    if (this.gameOver) return;

    //Move paddle
    this.paddleY = Math.max(
      0,
      Math.min(this.height - this.paddleHeight, this.paddleY + this.paddleSpeed)
    );

    //Move ball
    this.ballX += this.ballVX;
    this.ballY += this.ballVY;

    //Bounce off top/bottom
    if (this.ballY <= 0 || this.ballY >= this.height) this.ballVY *= -1;

    //Paddle collision
    if (
      this.ballX <= 20 &&
      this.ballY >= this.paddleY &&
      this.ballY <= this.paddleY + this.paddleHeight
    ) {
      this.ballVX *= -1;
      this.score++;
      this.scoreTarget.textContent = this.score;
    }

    //Missed?
    if (this.ballX < 0) return this.endGame();

    //Right wall bounce
    if (this.ballX >= this.width) this.ballVX *= -1;

    this.draw();
    this.frame = requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    //Gradient background
    const bg = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    bg.addColorStop(0, "#93c5fd");
    bg.addColorStop(0.5, "#a78bfa");
    bg.addColorStop(1, "#fbcfe8");
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.width, this.height);

    //Walls
    this.ctx.lineWidth   = 6;
    this.ctx.strokeStyle = "#4f46e5";
    this.ctx.strokeRect(0, 0, this.width, this.height);

    //Paddle
    this.ctx.fillStyle   = "#f59e0b";
    this.ctx.fillRect(0, this.paddleY, 10, this.paddleHeight);

    //Ball
    this.ctx.fillStyle = "#ef4444";
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, 10, 0, Math.PI * 2);
    this.ctx.fill();
  }

  endGame() {
    this.gameOver = true;
    cancelAnimationFrame(this.frame);
    
    fetch(this.submitUrlValue, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content
      },
      body: JSON.stringify({ value: this.score })
    })
    .then(() => {
      alert(`Game over! Your score is ${this.score}.`);
      window.location.href = "/scores";
    });
  }
}
