import AnimatedSprite from '../AnimatedSprite.js';
import Sound from './SoundManager.js';
import Sounds from './SoundLibrary.js';

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
      hint: document.getElementById('loading-continue-hint'),

      victorySequence: document.getElementById('loading-victory-sequence'),
      victoryBackdrop: document.getElementById('loading-victory-backdrop'),
      victorySvg: document.getElementById('loading-victory-svg'),
      victoryHourLabel: document.getElementById('loading-victory-hour-label'),
      victoryHourCurrent: document.getElementById('loading-victory-hour-current'),
      victoryHourNext: document.getElementById('loading-victory-hour-next'),
      victoryHourClipRect: document.getElementById('loading-victory-hour-clip-rect'),
      victoryHourClipDebug: document.getElementById('loading-victory-hour-clip-debug')
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

    this.hideVictorySequence();

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

  static setContent({
    title,
    text,
    showProgress,
    uiMode,
    showButton,
    buttonText,
    waitForScreenClick,
    continueText,
    onContinue
  } = {}) {
    const {
      screen,
      overlay,
      titleNode,
      textNode,
      progressNode,
      button,
      hint
    } = this.getNodes();

    this.cleanupHandlers();

    if (!screen || !overlay) return;

    if (uiMode !== undefined) {
      overlay.classList.remove('loading-overlay--center', 'loading-overlay--bottom-right');
      overlay.classList.add(
        uiMode === 'bottom-right'
          ? 'loading-overlay--bottom-right'
          : 'loading-overlay--center'
      );
    }

    if (title !== undefined && titleNode) {
      titleNode.textContent = title;
    }

    if (text !== undefined && textNode) {
      textNode.textContent = text;
    }

    if (showProgress !== undefined && progressNode) {
      progressNode.hidden = !showProgress;
      if (!showProgress) {
        progressNode.textContent = '';
      }
    }

    if (showButton !== undefined && button) {
      button.hidden = !showButton;
    }

    if (buttonText !== undefined && button) {
      button.textContent = buttonText;
    }

    if (waitForScreenClick !== undefined && hint) {
      hint.hidden = !waitForScreenClick;
    }

    if (continueText !== undefined && hint) {
      hint.textContent = continueText;
    }

    if (showButton && onContinue && button) {
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

    if (sound?.id && sound?.src && !Sounds.has(sound.id)) {
      Sounds.add(sound.id, sound.src, {
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

  static hideVictorySequence() {
    const {
      victorySequence,
      victoryBackdrop,
      victoryHourLabel,
      victoryHourCurrent,
      victoryHourNext
    } = this.getNodes();

    if (victorySequence) {
      victorySequence.hidden = true;
      victorySequence.style.display = 'none';
    }

    if (victoryBackdrop) {
      victoryBackdrop.style.opacity = '0';
    }

    if (victoryHourLabel) {
      victoryHourLabel.style.opacity = '0';
    }

    if (victoryHourCurrent) {
      victoryHourCurrent.textContent = '5';
      victoryHourCurrent.style.opacity = '1';
    }

    if (victoryHourNext) {
      victoryHourNext.textContent = '6';
      victoryHourNext.style.opacity = '1';
    }

    this.applyVictoryLayout({
      clipX: 760,
      clipY: 200,
      clipSize: 220,
      labelOffsetX: 50,
      labelOffsetY: 50,
      debug: true
    });
  }
  
  static async playVictorySequence({
    startHour = 5,
    endHour = 6,
    bellSoundId = null,
    cheerSoundId = null
  } = {}) {
    const {
      screen,
      overlay,
      imageNode,
      effectCanvas,
      progressNode,
      button,
      hint,
      victorySequence,
      victoryBackdrop,
      victoryHourLabel,
      victoryHourCurrent,
      victoryHourNext
    } = this.getNodes();

    if (
      !screen ||
      !victorySequence ||
      !victoryBackdrop ||
      !victoryHourLabel ||
      !victoryHourCurrent ||
      !victoryHourNext
    ) {
      return;
    }

    this.cleanupHandlers();
    this.stopEffect();
    this.hideVictorySequence();

    screen.classList.remove('hidden');
    screen.style.background = '#000';
    screen.style.opacity = '1';

    if (overlay) overlay.style.display = 'none';
    if (imageNode) imageNode.style.display = 'none';
    if (effectCanvas) effectCanvas.style.display = 'none';
    if (progressNode) progressNode.hidden = true;
    if (button) button.hidden = true;
    if (hint) hint.hidden = true;

    victorySequence.hidden = false;
    victorySequence.style.display = 'block';

    victoryHourCurrent.textContent = String(startHour);
    victoryHourNext.textContent = String(endHour);

    const layout = this.applyVictoryLayout({
      clipX: 760,
      clipY: 360,
      clipSize: 220,
      labelOffsetX: -20,
      labelOffsetY: 120,
      debug: false
    });

    if (bellSoundId) {
      Sound.stop(bellSoundId);
      Sound.play(bellSoundId);
    }

    if (cheerSoundId) {
      Sound.stop(cheerSoundId);
      Sound.play(cheerSoundId);
    }

    await new Promise((resolve) => {
      anime.timeline({
        easing: 'easeInOutSine',
        complete: resolve
      })
      .add({
        targets: victoryBackdrop,
        opacity: [0, 1],
        duration: 1400,
        easing: 'easeOutQuad'
      }, 0)
      .add({
        targets: [victoryHourLabel, victoryHourCurrent],
        opacity: [0, 1],
        duration: 900,
        easing: 'easeOutSine'
      }, 250)
      .add({
        targets: victoryHourCurrent,
        y: [layout.centerY, layout.centerY - layout.clipSize],
        duration: 5000,
        easing: 'linear'
      }, 1300)
      .add({
        targets: victoryHourNext,
        y: [layout.nextStartY, layout.centerY],
        duration: 5000,
        easing: 'linear'
      }, 1300)
    });

    await Promise.all([
      this.waitForSoundEnd(bellSoundId),
      this.waitForSoundEnd(cheerSoundId)
    ]);
  }

  static waitForSoundEnd(soundId) {
    return new Promise((resolve) => {
      if (!soundId) {
        resolve();
        return;
      }

      const sound = Sounds.get(soundId);
      if (!sound) {
        resolve();
        return;
      }

      const durationMs =
        typeof sound.duration === 'function'
          ? Math.max(0, sound.duration() * 1000)
          : 0;

      if (durationMs <= 0) {
        resolve();
        return;
      }

      setTimeout(resolve, durationMs);
    });
  }
  
  static applyVictoryLayout({
    clipX = 760,
    clipY = 300,
    clipSize = 220,
    labelOffsetX = 50,
    labelOffsetY = 10,
    debug = false
  } = {}) {
    const {
      victoryHourLabel,
      victoryHourCurrent,
      victoryHourNext,
      victoryHourClipRect,
      victoryHourClipDebug
    } = this.getNodes();

    const centerX = clipX + clipSize / 2;
    const centerY = clipY + clipSize / 2;
    const nextStartY = centerY + clipSize;

    if (victoryHourClipRect) {
      victoryHourClipRect.setAttribute('x', String(clipX));
      victoryHourClipRect.setAttribute('y', String(clipY));
      victoryHourClipRect.setAttribute('width', String(clipSize));
      victoryHourClipRect.setAttribute('height', String(clipSize));
    }

    if (victoryHourClipDebug) {
      victoryHourClipDebug.setAttribute('x', String(clipX));
      victoryHourClipDebug.setAttribute('y', String(clipY));
      victoryHourClipDebug.setAttribute('width', String(clipSize));
      victoryHourClipDebug.setAttribute('height', String(clipSize));
      victoryHourClipDebug.style.display = debug ? 'block' : 'none';
    }

    if (victoryHourLabel) {
      victoryHourLabel.setAttribute('x', String(clipX + clipSize + labelOffsetX));
      victoryHourLabel.setAttribute('y', String(clipY + labelOffsetY));
    }

    if (victoryHourCurrent) {
      victoryHourCurrent.setAttribute('x', String(centerX));
      victoryHourCurrent.setAttribute('y', String(centerY));
    }

    if (victoryHourNext) {
      victoryHourNext.setAttribute('x', String(centerX));
      victoryHourNext.setAttribute('y', String(nextStartY));
    }

    return {
      clipX,
      clipY,
      clipSize,
      centerX,
      centerY,
      nextStartY
    };
  }

}

export default LoadingScreen;