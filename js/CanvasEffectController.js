class CanvasEffectController {
  constructor(element) {
    this.element = element;
    this.running = false;
    this.timeouts = [];
  }

  #addTimeout(callback, delay) {
    const id = setTimeout(() => {
      this.timeouts = this.timeouts.filter(x => x !== id);
      callback();
    }, delay);

    this.timeouts.push(id);
    return id;
  }

  #clearTimeouts() {
    for (const id of this.timeouts) {
      clearTimeout(id);
    }
    this.timeouts = [];
  }

  setOpacity(value) {
    this.element.style.opacity = String(value);
  }

  setBrightness(value) {
    this.element.style.filter = `brightness(${value})`;
  }

  reset() {
    this.element.style.opacity = '';
    this.element.style.filter = '';
  }

  stop() {
    this.running = false;
    this.#clearTimeouts();
    this.reset();
  }

  startRandomOpacityDip({
    minPause = 2000,
    maxPause = 7000,
    minOpacity = 0.55,
    maxOpacity = 0.85,
    minDuration = 60,
    maxDuration = 180,
    baseOpacity = 1
  } = {}) {
    this.stop();
    this.running = true;
    this.setOpacity(baseOpacity);

    const randomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const randomFloat = (min, max) =>
      Math.random() * (max - min) + min;

    const runCycle = () => {
      if (!this.running) return;

      const pause = randomInt(minPause, maxPause);

      this.#addTimeout(() => {
        if (!this.running) return;

        const nextOpacity = randomFloat(minOpacity, maxOpacity);
        const duration = randomInt(minDuration, maxDuration);

        this.setOpacity(nextOpacity);

        this.#addTimeout(() => {
          if (!this.running) return;

          this.setOpacity(baseOpacity);
          runCycle();
        }, duration);
      }, pause);
    };

    runCycle();
  }

  startRandomBrightnessPulse({
    minPause = 1500,
    maxPause = 5000,
    minBrightness = 1.05,
    maxBrightness = 1.25,
    minDuration = 80,
    maxDuration = 220,
    baseBrightness = 1
  } = {}) {
    this.stop();
    this.running = true;
    this.setBrightness(baseBrightness);

    const randomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const randomFloat = (min, max) =>
      Math.random() * (max - min) + min;

    const runCycle = () => {
      if (!this.running) return;

      const pause = randomInt(minPause, maxPause);

      this.#addTimeout(() => {
        if (!this.running) return;

        const nextBrightness = randomFloat(minBrightness, maxBrightness);
        const duration = randomInt(minDuration, maxDuration);

        this.setBrightness(nextBrightness);

        this.#addTimeout(() => {
          if (!this.running) return;

          this.setBrightness(baseBrightness);
          runCycle();
        }, duration);
      }, pause);
    };

    runCycle();
  }
}

export default CanvasEffectController;