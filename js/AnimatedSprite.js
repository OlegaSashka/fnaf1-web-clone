class AnimatedSprite {
  constructor(canvas, src, fps = 8) {
    console.log('[AnimatedSprite] Конструктор вызван');
    console.log('[AnimatedSprite] Получен src:', src);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.img = new Image();
    this.img.src = src;
    this.frameHeight = 720;       // фиксированная высота одного кадра
    this.totalFrames = 0;         // посчитаем после загрузки
    this.currentFrame = 0;
    this.fps = fps;
    this.frameTime = 1000 / fps;
    this.lastTime = 0;
    this.running = false;
    this.ready = false;           // флаг готовности (изображение загружено и totalFrames вычислено)

    // Если изображение уже загружено (из кэша), сразу вычисляем кадры
    if (this.img.complete && this.img.naturalHeight !== 0) {
      this.#calcFrames();
      return;
    }

    this.img.onload = () => {
      this.#calcFrames();
    };

    this.img.onerror = () => {
      console.error('[AnimatedSprite] ОШИБКА ЗАГРУЗКИ ИЗОБРАЖЕНИЯ!');
      console.error('[AnimatedSprite] Путь:', src);
    };
  }

  #calcFrames() {
    if (this.img.height <= 0 || this.frameHeight <= 0) {
      console.warn('[AnimatedSprite] Некорректные размеры');
      this.ready = false;
      return;
    }
    this.totalFrames = Math.floor(this.img.height / this.frameHeight);
    if (this.totalFrames < 1) this.totalFrames = 1;
    this.ready = true; // Помечаем, что готово к использованию
  }

  // Начать анимацию
  play() {
    if (!this.ready) {
      console.warn('[play] Спрайт ещё не готов');
      return;
    }
    this.running = true;
    
    this.animate(performance.now());
  }

  // Остановить
  stop() {
    this.running = false;
  }

  // Перейти на конкретный кадр
  async showFrame(frameIndex) {

    await this.#waitForReady();

    // Убедимся, что frameIndex в допустимых пределах
    const maxFrame = this.totalFrames - 1;
    this.currentFrame = Math.max(0, Math.min(frameIndex, maxFrame));
    this.#draw();
  }

  async #waitForReady() {
    if (this.ready) {
      return;
    }

    return new Promise((resolve, reject) => {
      const check = () => {
        if (this.ready) {
          resolve();
        } else if (this.img.naturalHeight === 0 && this.img.src) {
          // Если изображение не загрузилось (ошибка)
          reject(new Error('Картинка не загрузилась'));
        } else {
          setTimeout(check, 50); // проверяем каждые 50 мс
        }
      };

      check();
    });
  }

  animate(time) {
    if (!this.running || !this.ready) return;

    const delta = time - this.lastTime;
    if (delta >= this.frameTime) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.lastTime = time;
      this.#draw();
    }

    requestAnimationFrame(t => this.animate(t));
  }

  #draw() {
    if (!this.ready) return; // защита

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.drawImage(
      this.img,
      0, this.currentFrame * this.frameHeight,
      this.img.width, this.frameHeight,
      0, 0,
      this.canvas.width, this.canvas.height
    );
  }

  // Асинхронный метод для случайного поведения в меню
  async randomMenuBehavior() {
    
    await this.#waitForReady(); // Ждём готовности

    if (this.running) {
      return;
    }
    this.running = true;

    const scheduleNextGlitch = () => {
      if (!this.running) {
        return;
      }

      const delayToNext = 500 + Math.random() * 8000;

      setTimeout(() => {
        if (!this.running) return;

        // Выбираем случайный кадр от 1 до (totalFrames-1), но не более 3 (если кадров меньше, то до max)
        const maxGlitchFrame = Math.min(3, this.totalFrames - 1);
        if (maxGlitchFrame < 1) {
          return;
        }
        const randomFrame = 1 + Math.floor(Math.random() * maxGlitchFrame);
        this.currentFrame = randomFrame;
        this.#draw();

        // Длительность глитча: 200-800 мс
        const glitchDuration = 200 + Math.random() * 600;

        setTimeout(() => {
          if (!this.running) return;

          this.currentFrame = 0;
          this.#draw();

          // После возврата планируем следующий глитч
          scheduleNextGlitch();
        }, glitchDuration);
      }, delayToNext);
    };

    // Запускаем цикл
    scheduleNextGlitch();
  }

  // Остановить цикл меню
  stopMenuBehavior() {
    this.running = false;
  }
}