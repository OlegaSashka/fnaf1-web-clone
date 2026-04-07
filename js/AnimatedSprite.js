import Images from './managers/ImageLibrary.js';

class AnimatedSprite {
  constructor(canvas, source, fps = 8, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.img = null;

    this.frameWidth = options.frameWidth ?? null;
    this.frameHeight = options.frameHeight ?? 720;
    this.direction = options.direction ?? 'vertical'; // 'vertical' | 'horizontal'

    this.drawX = options.drawX ?? 0;
    this.drawY = options.drawY ?? 0;
    this.drawWidth = options.drawWidth ?? this.canvas.width;
    this.drawHeight = options.drawHeight ?? this.canvas.height;

    this.flipX = options.flipX ?? false;

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

    this.#initImage(source);
  }

  #initImage(source) {
    if (source instanceof HTMLImageElement) {
      this.img = source;

      if (this.img.complete && this.img.naturalWidth > 0 && this.img.naturalHeight > 0) {
        this.#calcFrames();
        return;
      }

      this.img.onload = () => {
        this.#calcFrames();
      };

      this.img.onerror = () => {
        this.failed = true;
        console.error('[AnimatedSprite] Ошибка загрузки переданного Image');
      };

      return;
    }

    if (typeof source === 'string') {
      this.img = new Image();

      this.img.onload = () => {
        this.#calcFrames();
      };

      this.img.onerror = () => {
        this.failed = true;
        console.error('[AnimatedSprite] Ошибка загрузки:', source);
      };

      this.img.src = source;

      if (this.img.complete && this.img.naturalWidth > 0 && this.img.naturalHeight !== 0) {
        this.#calcFrames();
      }

      return;
    }

    this.failed = true;
    console.error('[AnimatedSprite] Некорректный source:', source);
  }

  #calcFrames() {
    this.frameWidth ??= this.img.width;
    this.frameHeight ??= this.img.height;

    if (this.frameWidth <= 0 || this.frameHeight <= 0) {
      this.ready = false;
      this.failed = true;
      return;
    }

    if (this.direction === 'vertical') {
      this.totalFrames = Math.floor(this.img.height / this.frameHeight);
    } else if (this.direction === 'horizontal') {
      this.totalFrames = Math.floor(this.img.width / this.frameWidth);
    } else {
      this.ready = false;
      this.failed = true;
      console.error('[AnimatedSprite] Неизвестное направление:', this.direction);
      return;
    }

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

    let sx = 0;
    let sy = 0;
    let sw = this.frameWidth;
    let sh = this.frameHeight;

    if (this.direction === 'vertical') {
      sy = this.currentFrame * this.frameHeight;
    } else if (this.direction === 'horizontal') {
      sx = this.currentFrame * this.frameWidth;
    }

    const dx = (this.canvas.width - this.drawWidth) / 2 + this.drawX;
    const dy = (this.canvas.height - this.drawHeight) / 2 + this.drawY;

    this.ctx.save();

    if (this.flipX) {
      this.ctx.translate(dx + this.drawWidth, dy);
      this.ctx.scale(-1, 1);

      this.ctx.drawImage(
        this.img,
        sx, sy,
        sw, sh,
        0, 0,
        this.drawWidth, this.drawHeight
      );
    } else {
      this.ctx.drawImage(
        this.img,
        sx, sy,
        sw, sh,
        dx, dy,
        this.drawWidth, this.drawHeight
      );
    }

    this.ctx.restore();
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

  async setSourceById(imageId, options = {}) {
    const nextImg = Images.get(imageId);

    if (!nextImg) {
      throw new Error(`[AnimatedSprite] ImageLibrary: не найден imageId "${imageId}"`);
    }

    this.stop({ clear: options.clearBefore ?? true });
    this.stopBehavior();

    this.failed = false;
    this.ready = false;

    this.img = nextImg;

    if (options.frameWidth != null) this.frameWidth = options.frameWidth;
    if (options.frameHeight != null) this.frameHeight = options.frameHeight;
    if (options.direction != null) this.direction = options.direction;

    if (options.drawX != null) this.drawX = options.drawX;
    if (options.drawY != null) this.drawY = options.drawY;
    if (options.drawWidth != null) this.drawWidth = options.drawWidth;
    if (options.drawHeight != null) this.drawHeight = options.drawHeight;

    if (options.flipX != null) this.flipX = options.flipX;
    if (options.fps != null) {
      this.fps = options.fps;
      this.frameTime = 1000 / this.fps;
    }

    this.currentFrame = 0;
    this.lastTime = 0;

    if (this.img.complete && this.img.naturalWidth > 0 && this.img.naturalHeight > 0) {
      this.#calcFrames();
    } else {
      await new Promise((resolve, reject) => {
        this.img.onload = () => {
          this.#calcFrames();
          resolve();
        };

        this.img.onerror = () => {
          this.failed = true;
          reject(new Error(`[AnimatedSprite] Ошибка загрузки imageId "${imageId}"`));
        };
      });
    }

    if (options.showFrame != null) {
      await this.showFrame(options.showFrame);
    } else if (options.redraw !== false) {
      await this.showFrame(0);
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

  async playOnceReverse({
    fromFrame = null,
    toFrame = 0,
    holdLastFrame = true,
    clearOnFinish = false,
    onComplete = null
  } = {}) {
    await this.#waitForReady();

    this.stop();
    this.stopBehavior();

    const maxFrame = this.totalFrames - 1;
    const safeFrom = Math.max(0, Math.min(fromFrame ?? maxFrame, maxFrame));
    const safeTo = Math.max(0, Math.min(toFrame, safeFrom));

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

      if (safeFrom <= safeTo) {
        this.#finishPlayback(token);
        return;
      }

      this.#animateReverse(performance.now(), token);
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

  #animateReverse(time, token) {
    if (!this.running || !this.ready || token !== this.activePlayToken) return;

    const delta = time - this.lastTime;
    if (delta >= this.frameTime) {
      if (this.currentFrame <= this.playToFrame) {
        this.#finishPlayback(token);
        return;
      }

      this.currentFrame -= 1;
      this.lastTime = time;
      this.#draw();

      if (this.currentFrame <= this.playToFrame) {
        this.#finishPlayback(token);
        return;
      }
    }

    this.rafId = requestAnimationFrame((t) => this.#animateReverse(t, token));
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