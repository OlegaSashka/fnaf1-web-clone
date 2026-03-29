class AnimatedSprite {
  constructor(canvas, src, fps = 8) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.img = new Image();

    this.frameHeight = 720;
    this.totalFrames = 0;
    this.currentFrame = 0;

    this.fps = fps;
    this.frameTime = 1000 / fps;
    this.lastTime = 0;

    this.running = false;
    this.ready = false;
    this.failed = false;

    this.behaviorRunning = false;
    this.behaviorTimeouts = [];

    this.rafId = null;
    this.activePlayToken = 0;
    this.onComplete = null;
    this.loop = true;
    this.playToFrame = 0;
    this.holdLastFrame = true;
    this.clearOnFinish = false;

    this.img.onload = () => {
      this.#calcFrames();
    };

    this.img.onerror = () => {
      this.failed = true;
      console.error('[AnimatedSprite] Ошибка загрузки:', src);
    };

    this.img.src = src;

    if (this.img.complete && this.img.naturalHeight !== 0) {
      this.#calcFrames();
    }
  }

  #calcFrames() {
    if (this.img.height <= 0 || this.frameHeight <= 0) {
      this.ready = false;
      this.failed = true;
      return;
    }

    this.totalFrames = Math.floor(this.img.height / this.frameHeight);
    if (this.totalFrames < 1) this.totalFrames = 1;
    this.ready = true;
  }

  async #waitForReady() {
    if (this.ready) return;
    if (this.failed) throw new Error('Картинка не загрузилась');

    return new Promise((resolve, reject) => {
      const check = () => {
        if (this.ready) {
          resolve();
          return;
        }

        if (this.failed) {
          reject(new Error('Картинка не загрузилась'));
          return;
        }

        setTimeout(check, 50);
      };

      check();
    });
  }

  #draw() {
    if (!this.ready) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.drawImage(
      this.img,
      0,
      this.currentFrame * this.frameHeight,
      this.img.width,
      this.frameHeight,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  #addBehaviorTimeout(callback, delay) {
    const id = setTimeout(() => {
      this.behaviorTimeouts = this.behaviorTimeouts.filter((x) => x !== id);
      callback();
    }, delay);

    this.behaviorTimeouts.push(id);
    return id;
  }

  #clearBehaviorTimeouts() {
    for (const id of this.behaviorTimeouts) {
      clearTimeout(id);
    }
    this.behaviorTimeouts = [];
  }

  #randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  #finishPlayback(token) {
    if (token !== this.activePlayToken) return;

    this.running = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.clearOnFinish) {
      this.clear();
    } else if (this.holdLastFrame) {
      this.#draw();
    }

    const callback = this.onComplete;
    this.onComplete = null;

    if (typeof callback === 'function') {
      callback();
    }
  }

  async showFrame(frameIndex) {
    await this.#waitForReady();

    const maxFrame = this.totalFrames - 1;
    this.currentFrame = Math.max(0, Math.min(frameIndex, maxFrame));
    this.#draw();
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  stop({ clear = false } = {}) {
    this.running = false;
    this.onComplete = null;
    this.activePlayToken++;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (clear) {
      this.clear();
    }
  }

  async play() {
    await this.#waitForReady();

    this.stop();
    this.stopBehavior();

    this.loop = true;
    this.holdLastFrame = true;
    this.clearOnFinish = false;
    this.playToFrame = this.totalFrames - 1;
    this.lastTime = 0;
    this.running = true;

    const token = ++this.activePlayToken;
    this.#animateLoop(performance.now(), token);
  }

  #animateLoop(time, token) {
    if (!this.running || !this.ready || token !== this.activePlayToken) return;

    const delta = time - this.lastTime;
    if (delta >= this.frameTime) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.lastTime = time;
      this.#draw();
    }

    this.rafId = requestAnimationFrame((t) => this.#animateLoop(t, token));
  }

  async playOnce({
    fromFrame = 0,
    toFrame = null,
    holdLastFrame = true,
    clearOnFinish = false,
    onComplete = null
  } = {}) {
    await this.#waitForReady();

    this.stop();
    this.stopBehavior();

    const maxFrame = this.totalFrames - 1;
    const safeFrom = Math.max(0, Math.min(fromFrame, maxFrame));
    const safeTo = Math.max(safeFrom, Math.min(toFrame ?? maxFrame, maxFrame));

    this.currentFrame = safeFrom;
    this.loop = false;
    this.playToFrame = safeTo;
    this.holdLastFrame = holdLastFrame;
    this.clearOnFinish = clearOnFinish;
    this.lastTime = 0;
    this.running = true;

    this.#draw();

    return new Promise((resolve) => {
      this.onComplete = () => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
        resolve();
      };

      const token = ++this.activePlayToken;

      if (safeFrom >= safeTo) {
        this.#finishPlayback(token);
        return;
      }

      this.#animateOnce(performance.now(), token);
    });
  }

  #animateOnce(time, token) {
    if (!this.running || !this.ready || token !== this.activePlayToken) return;

    const delta = time - this.lastTime;
    if (delta >= this.frameTime) {
      if (this.currentFrame >= this.playToFrame) {
        this.#finishPlayback(token);
        return;
      }

      this.currentFrame += 1;
      this.lastTime = time;
      this.#draw();

      if (this.currentFrame >= this.playToFrame) {
        this.#finishPlayback(token);
        return;
      }
    }

    this.rafId = requestAnimationFrame((t) => this.#animateOnce(t, token));
  }

  async startRandomBurstBehavior({
    idleFrame = 0,
    minPause = 2000,
    maxPause = 8000,
    minBurstFrames = 1,
    maxBurstFrames = null,
    minFrame = 1,
    maxFrame = null,
    frameDuration = null,
    uniqueFrames = false
  } = {}) {
    await this.#waitForReady();

    this.stop();
    this.stopBehavior();

    this.behaviorRunning = true;

    const actualMaxFrame = maxFrame ?? (this.totalFrames - 1);
    const actualMaxBurstFrames = maxBurstFrames ?? Math.max(1, actualMaxFrame);
    const actualFrameDuration = frameDuration ?? this.frameTime;

    await this.showFrame(idleFrame);

    const runCycle = () => {
      if (!this.behaviorRunning) return;

      const pause = this.#randomInt(minPause, maxPause);

      this.#addBehaviorTimeout(async () => {
        if (!this.behaviorRunning) return;

        const burstCount = this.#randomInt(
          minBurstFrames,
          Math.min(actualMaxBurstFrames, Math.max(1, actualMaxFrame - minFrame + 1))
        );

        const sequence = [];
        const used = new Set();

        for (let i = 0; i < burstCount; i++) {
          let frame;

          if (uniqueFrames) {
            const available = [];
            for (let f = minFrame; f <= actualMaxFrame; f++) {
              if (!used.has(f)) available.push(f);
            }

            if (available.length === 0) break;

            frame = available[this.#randomInt(0, available.length - 1)];
            used.add(frame);
          } else {
            frame = this.#randomInt(minFrame, actualMaxFrame);
          }

          sequence.push(frame);
        }

        const playSequence = (index = 0) => {
          if (!this.behaviorRunning) return;

          if (index >= sequence.length) {
            this.showFrame(idleFrame);
            runCycle();
            return;
          }

          this.currentFrame = sequence[index];
          this.#draw();

          this.#addBehaviorTimeout(() => {
            playSequence(index + 1);
          }, actualFrameDuration);
        };

        if (sequence.length === 0) {
          this.showFrame(idleFrame);
          runCycle();
          return;
        }

        playSequence(0);
      }, pause);
    };

    runCycle();
  }

  async randomMenuBehavior() {
    await this.startRandomBurstBehavior({
      idleFrame: 0,
      minPause: 500,
      maxPause: 8000,
      minBurstFrames: 1,
      maxBurstFrames: 1,
      minFrame: 1,
      maxFrame: Math.min(3, this.totalFrames - 1),
      frameDuration: 250,
      uniqueFrames: false
    });
  }

  stopBehavior() {
    this.behaviorRunning = false;
    this.#clearBehaviorTimeouts();
  }

  stopMenuBehavior() {
    this.stopBehavior();
    this.stop();
  }
}

export default AnimatedSprite;