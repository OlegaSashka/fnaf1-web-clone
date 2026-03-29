import AnimatedSprite from '../AnimatedSprite.js';
import Sound from './SoundManager.js';

class LoadingScreen {
  static screenClickHandler = null;

  static effectSprite = null;
  static effectSoundId = null;

  static wait(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async animateOpacity(node, config = {}) {
    const {
      enabled = false,
      from = 1,
      to = 1,
      duration = 0
    } = config;

    if (!node) return;
    if (!enabled || duration <= 0 || from === to) {
      node.style.opacity = String(to);
      return;
    }

    node.style.transition = 'none';
    node.style.opacity = String(from);

    void node.offsetWidth;

    await new Promise((resolve) => {
      const handleEnd = (event) => {
        if (event.target !== node || event.propertyName !== 'opacity') return;
        node.removeEventListener('transitionend', handleEnd);
        node.style.transition = '';
        resolve();
      };

      node.addEventListener('transitionend', handleEnd);
      node.style.transition = `opacity ${duration}ms ease`;
      node.style.opacity = String(to);
    });
  }

  static getNodes() {
    return {
      screen: document.getElementById('loading-screen'),
      overlay: document.getElementById('loading-overlay'),
      imageNode: document.getElementById('loading-image'),
      effectCanvas: document.getElementById('loading-effect-canvas'),
      titleNode: document.getElementById('loading-title'),
      textNode: document.getElementById('loading-text'),
      progressNode: document.getElementById('loading-progress'),
      button: document.getElementById('loading-continue-btn'),
      hint: document.getElementById('loading-continue-hint')
    };
  }

  static cleanupHandlers() {
    const { screen, button, hint } = this.getNodes();

    if (button) {
      button.onclick = null;
      button.hidden = true;
    }

    if (this.screenClickHandler && screen) {
      screen.removeEventListener('click', this.screenClickHandler);
      this.screenClickHandler = null;
    }

    if (hint) {
      hint.hidden = true;
      hint.textContent = '';
    }
  }

  static stopEffect({ clear = true } = {}) {
    const { effectCanvas } = this.getNodes();

    if (this.effectSprite) {
      this.effectSprite.stop({ clear: false });
      this.effectSprite = null;
    }

    if (this.effectSoundId) {
      Sound.stop(this.effectSoundId);
      this.effectSoundId = null;
    }

    if (effectCanvas) {
      const ctx = effectCanvas.getContext('2d');
      ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
      effectCanvas.style.display = 'none';
      effectCanvas.style.opacity = '1';
    }

    if (!clear || !effectCanvas) return;
  }

  static cleanup() {
    const {
      overlay,
      imageNode,
      titleNode,
      textNode,
      progressNode,
      button,
      hint
    } = this.getNodes();

    this.cleanupHandlers();
    this.stopEffect();

    if (overlay) {
      overlay.classList.remove('loading-overlay--center', 'loading-overlay--bottom-right');
      overlay.classList.add('loading-overlay--center');
    }

    if (imageNode) {
      imageNode.removeAttribute('src');
      imageNode.style.display = 'none';
    }

    if (titleNode) titleNode.textContent = '';
    if (textNode) textNode.textContent = '';

    if (progressNode) {
      progressNode.textContent = '';
      progressNode.hidden = true;
    }

    if (button) {
      button.hidden = true;
      button.textContent = 'Continue';
    }

    if (hint) {
      hint.hidden = true;
      hint.textContent = '';
    }
  }

  static async show({
    image = null,
    background = '#000',
    title = 'LOADING',
    text = '',
    showButton = false,
    showProgress = true,
    uiMode = 'center',
    buttonText = 'Continue',
    waitForScreenClick = false,
    continueText = 'Click anywhere to continue',
    onContinue = null,
    fadeIn = {
      enabled: false,
      from: 0,
      to: 1,
      duration: 0
    }
  } = {}) {
    const {
      screen,
      overlay,
      imageNode,
      titleNode,
      textNode,
      progressNode,
      button,
      hint
    } = this.getNodes();

    this.cleanupHandlers();
    this.stopEffect();

    screen.classList.remove('hidden');
    screen.style.background = background;
    screen.style.opacity = '1';

    overlay.classList.remove('loading-overlay--center', 'loading-overlay--bottom-right');
    overlay.classList.add(
      uiMode === 'bottom-right'
        ? 'loading-overlay--bottom-right'
        : 'loading-overlay--center'
    );

    if (image) {
      imageNode.src = image;
      imageNode.style.display = 'block';
    } else {
      imageNode.removeAttribute('src');
      imageNode.style.display = 'none';
    }

    titleNode.textContent = title;
    textNode.textContent = text;

    if (showProgress) {
      progressNode.hidden = false;
      progressNode.textContent = '';
    } else {
      progressNode.hidden = true;
      progressNode.textContent = '';
    }

    button.hidden = !showButton;
    button.textContent = buttonText;

    if (hint) {
      hint.hidden = !waitForScreenClick;
      hint.textContent = waitForScreenClick ? continueText : '';
    }

    if (showButton && onContinue) {
      button.onclick = onContinue;
    }

    if (waitForScreenClick && onContinue) {
      this.screenClickHandler = async (event) => {
        if (event.target === button) return;

        screen.removeEventListener('click', this.screenClickHandler);
        this.screenClickHandler = null;

        await onContinue();
      };

      screen.addEventListener('click', this.screenClickHandler);
    }

    await this.animateOpacity(screen, fadeIn);
  }

  static setProgress(progress) {
    const { progressNode } = this.getNodes();
    if (progressNode) {
      progressNode.hidden = false;
      progressNode.textContent = `Loading... ${progress}%`;
    }
  }

  static async playEffect({
    spriteSheet,
    fps = 12,
    opacity = 1,
    clearOnFinish = false,
    holdLastFrame = true,
    sound = null
  } = {}) {
    const { effectCanvas } = this.getNodes();

    if (!effectCanvas || !spriteSheet) return null;

    this.stopEffect();

    effectCanvas.style.display = 'block';
    effectCanvas.width = effectCanvas.clientWidth || effectCanvas.offsetWidth || window.innerWidth;
    effectCanvas.height = effectCanvas.clientHeight || effectCanvas.offsetHeight || window.innerHeight;
    effectCanvas.style.opacity = String(opacity);

    this.effectSprite = new AnimatedSprite(effectCanvas, spriteSheet, fps);

    if (sound?.id && sound?.src && !Sound.sounds[sound.id]) {
      Sound.add(sound.id, sound.src, {
        volume: sound.volume ?? 1,
        loop: sound.loop ?? false
      });
    }

    if (sound?.id) {
      this.effectSoundId = sound.id;
      if (sound.playOnce) {
        Sound.playOnce(sound.id);
      } else {
        Sound.play(sound.id);
      }
    }

    await this.effectSprite.playOnce({
      fromFrame: 0,
      holdLastFrame,
      clearOnFinish
    });

    return this.effectSprite;
  }

  static async hide({
    fadeOut = {
      enabled: false,
      from: 1,
      to: 0,
      duration: 0
    }
  } = {}) {
    const { screen } = this.getNodes();

    this.cleanupHandlers();
    this.stopEffect();

    await this.animateOpacity(screen, fadeOut);

    screen.classList.add('hidden');
    screen.style.transition = '';
    screen.style.opacity = '1';
  }

  static setError(text = 'Ошибка загрузки. Проверь консоль.') {
    const { overlay, progressNode } = this.getNodes();

    if (overlay) {
      overlay.classList.remove('loading-overlay--center', 'loading-overlay--bottom-right');
      overlay.classList.add('loading-overlay--center');
    }

    if (progressNode) {
      progressNode.hidden = false;
      progressNode.textContent = text;
    }
  }
}

export default LoadingScreen;