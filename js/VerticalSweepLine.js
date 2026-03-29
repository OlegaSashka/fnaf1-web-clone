class VerticalSweepLine {
  constructor(element, speed = 40) {
    this.element = element;
    this.speed = speed; // пикселей в секунду
    this.y = -20;
    this.lastTime = 0;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    this.running = false;
  }

  animate(time) {
    if (!this.running) return;

    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    const screenHeight = window.innerHeight;
    this.y += this.speed * delta;

    if (this.y > screenHeight) {
      this.y = -this.element.offsetHeight;
    }

    this.element.style.transform = `translateY(${this.y}px)`;

    requestAnimationFrame(this.animate.bind(this));
  }
}

export default VerticalSweepLine;