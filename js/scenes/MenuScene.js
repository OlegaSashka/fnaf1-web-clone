import BaseScene from './BaseScene.js';

import Preloader from '../Preloader.js';

import { getNightConfig } from '../config/NightConfigs.js';
import GameProgress from '../managers/GameProgress.js';

import AnimatedSprite from '../AnimatedSprite.js';
import VerticalSweepLine from '../VerticalSweepLine.js';
import CanvasEffectController from '../CanvasEffectController.js';

import Sound from '../managers/SoundManager.js';
import SceneTransitionManager from '../managers/SceneTransitionManager.js';

import { SceneNames } from '../config/SceneNames.js';

import { TransitionImages } from '../config/TransitionAssets.js';
import { TRANSITION_ASSETS } from '../config/TransitionAssets.js';

import NightScene from './NightScene.js';

const BOOT_ASSETS = [
  //для меню
  { type: 'image', src: 'assets/images/ui/Background/Menu-freddy.png' },
  { type: 'image', src: 'assets/images/ui/NoiseTV/Noise.png' },
  //музыка
  { type: 'audio', src: 'assets/sounds/music/main-darkness-music.wav' },
  { type: 'audio', src: 'assets/sounds/music/static2-menu.wav' },
  { type: 'audio', src: 'assets/sounds/ui/blip3.wav' },

  //для экрана шагрузки
  ...TRANSITION_ASSETS,
];

class MenuScene extends BaseScene {
  constructor(game) {
    super(game);
    this.freddySprite = null;
    this.noiseStatic = null;
    this.blinkSprite = null;

    this.sweepLine = null;

    this.continueHint = null;

    this.freddyEffects = null;
    this.staticEffects = null;

    this.staticPrepared = false;
    this.liveStarted = false;

    this.entryMode = 'boot';

    this.onNewGameClick = this.onNewGameClick.bind(this);
    this.onContinueClick = this.onContinueClick.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onContinueEnter = this.onContinueEnter.bind(this);
    this.onContinueLeave = this.onContinueLeave.bind(this);
  }

  hideMenuVisualsForTransition() {
    const menuContent = document.getElementById('menu-content');
    const freddyCanvas = document.getElementById('freddy-canvas');
    const staticCanvas = document.getElementById('static-canvas');
    const blinkCanvas = document.getElementById('blink-canvas');
    const sweepLine = document.getElementById('scanline-sweep');

    if (menuContent) menuContent.style.display = 'none';
    if (freddyCanvas) freddyCanvas.style.display = 'none';
    if (staticCanvas) staticCanvas.style.display = 'none';
    if (blinkCanvas) blinkCanvas.style.display = 'none';
    if (sweepLine) sweepLine.style.display = 'none';
  }

  bindMenuEvents() {
    const newGameBtn = document.querySelector('[data-action="new"]');
    const continueBtn = document.querySelector('[data-action="continue"]');

    newGameBtn.addEventListener('click', this.onNewGameClick);
    continueBtn.addEventListener('click', this.onContinueClick);
    newGameBtn.addEventListener('mouseenter', this.onHover);
    continueBtn.addEventListener('mouseenter', this.onHover);

    this.ensureContinueHint();
    this.refreshContinueState();

    continueBtn.addEventListener('mouseenter', this.onContinueEnter);
    continueBtn.addEventListener('mouseleave', this.onContinueLeave);
  }

  async startLiveVisuals() {
    if (this.liveStarted) return;

    const freddyCanvas = document.getElementById('freddy-canvas');
    const staticCanvas = document.getElementById('static-canvas');
    const sweepLine = document.getElementById('scanline-sweep');

    if (!this.sweepLine && sweepLine) {
      this.sweepLine = new VerticalSweepLine(sweepLine, 40);
    }

    if (this.sweepLine && sweepLine) {
      sweepLine.style.display = 'block';
      this.sweepLine.start();
    }

    if (!this.freddyEffects) {
      this.freddyEffects = new CanvasEffectController(freddyCanvas);
    }

    if (!this.staticEffects) {
      this.staticEffects = new CanvasEffectController(staticCanvas);
    }

    this.freddyEffects.startRandomOpacityDip({
      minPause: 200,
      maxPause: 1000,
      minOpacity: 0.2,
      maxOpacity: 0.8,
      minDuration: 200,
      maxDuration: 400,
      baseOpacity: 1
    });

    this.staticEffects.startRandomBrightnessPulse({
      minPause: 5000,
      maxPause: 10000,
      minBrightness: 1.03,
      maxBrightness: 1.5,
      minDuration: 500,
      maxDuration: 800,
      baseBrightness: 1
    });

    if (!Sound.sounds['music-menu']) {
      Sound.add('music-menu', 'assets/sounds/music/main-darkness-music.wav', {
        loop: true,
        volume: 0.6
      });
    }

    if (!Sound.sounds['music-tv']) {
      Sound.add('music-tv', 'assets/sounds/music/static2-menu.wav', {
        loop: true,
        volume: 0.3
      });
    }

    if (!Sound.sounds['menu-hover']) {
      Sound.add('menu-hover', 'assets/sounds/ui/blip3.wav', { volume: 0.3 });
    }

    this.freddySprite.randomMenuBehavior();
    this.noiseStatic.play();

    this.blinkSprite.startRandomBurstBehavior({
      idleFrame: 0,
      minPause: 2000,
      maxPause: 8000,
      minBurstFrames: 3,
      maxBurstFrames: this.blinkSprite.totalFrames - 1,
      minFrame: 1,
      maxFrame: this.blinkSprite.totalFrames - 1,
      frameDuration: 150,
      uniqueFrames: true
    });

    Sound.play('music-menu');
    Sound.play('music-tv');

    this.liveStarted = true;
  }

  async prepareStaticVisuals() {
    const freddyCanvas = document.getElementById('freddy-canvas');
    const staticCanvas = document.getElementById('static-canvas');
    const blinkCanvas = document.getElementById('blink-canvas');
    const menuContent = document.getElementById('menu-content');
    const sweepLine = document.getElementById('scanline-sweep');

    if (!freddyCanvas || !staticCanvas || !blinkCanvas || !menuContent) {
      console.error('[MenuScene] Не найдены элементы меню для static prepare');
      return;
    }

    menuContent.style.display = 'block';
    freddyCanvas.style.display = 'block';
    staticCanvas.style.display = 'block';
    blinkCanvas.style.display = 'block';
    if (sweepLine) sweepLine.style.display = 'none';

    freddyCanvas.width = this.game.width;
    freddyCanvas.height = this.game.height;
    staticCanvas.width = this.game.width;
    staticCanvas.height = this.game.height;
    blinkCanvas.width = this.game.width;
    blinkCanvas.height = this.game.height;

    if (!this.freddySprite) {
      this.freddySprite = new AnimatedSprite(
        freddyCanvas,
        'assets/images/ui/Background/Menu-freddy.png',
        20
      );
    }

    if (!this.noiseStatic) {
      this.noiseStatic = new AnimatedSprite(
        staticCanvas,
        'assets/images/ui/NoiseTV/Noise.png',
        40
      );
    }

    if (!this.blinkSprite) {
      this.blinkSprite = new AnimatedSprite(
        blinkCanvas,
        'assets/images/ui/Blink/Menu-blink.png',
        2
      );
    }

    await this.freddySprite.showFrame(0);
    await this.noiseStatic.showFrame(0);
    await this.blinkSprite.showFrame(0);

    this.staticPrepared = true;
  }

  async enter() {
    const isBootEntry = this.entryMode === 'boot';

    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');

    if (menuScreen) menuScreen.hidden = false;
    if (gameScreen) gameScreen.hidden = true;

    await SceneTransitionManager.go({
      game: this.game,
      skipSceneChange: true,

      loading: {
        background: '#000',
        title: isBootEntry ? 'WARNING' : '',
        text: isBootEntry
          ? 'This game contains loud sounds, flashing lights and jump scares.'
          : '',
        uiMode: 'center',
        showProgress: isBootEntry,
        fadeOut: {
          enabled: true,
          from: 1,
          to: 0,
          duration: isBootEntry ? 300 : 500
        }
      },

      preload: (onProgress) => this.preload(onProgress),

      afterPreload: async () => {
        await this.prepareStaticVisuals();
        this.ensureContinueHint();
        this.refreshContinueState();
      },

      confirm: isBootEntry
        ? {
            mode: 'button',
            buttonText: 'Start'
          }
        : {
            mode: 'auto',
            minDuration: 800
          },

      onFadeOutStart: async () => {
        await this.startLiveVisuals();
        this.bindMenuEvents();
      }
    });

    this.entryMode = 'boot';
  }

  onContinueEnter() {
    this.showContinueHint();
  }

  onContinueLeave() {
    this.hideContinueHint();
  }

  async preload(onProgress) {
    await Preloader.loadAssets(BOOT_ASSETS, onProgress, {
      continueOnError: true
    });
  }

  async exit() {
    const menuContent = document.getElementById('menu-content');
    const freddyCanvas = document.getElementById('freddy-canvas');
    const staticCanvas = document.getElementById('static-canvas');
    const blinkCanvas = document.getElementById('blink-canvas');
    const sweepLine = document.getElementById('scanline-sweep');

    const newGameBtn = document.querySelector('[data-action="new"]');
    const continueBtn = document.querySelector('[data-action="continue"]');

    if (menuContent) menuContent.style.display = 'none';
    if (freddyCanvas) freddyCanvas.style.display = 'none';
    if (staticCanvas) staticCanvas.style.display = 'none';
    if (blinkCanvas) blinkCanvas.style.display = 'none';
    if (sweepLine) sweepLine.style.display = 'none';

    if (this.freddyEffects) {
      this.freddyEffects.stop();
      this.freddyEffects = null;
    }

    if (this.staticEffects) {
      this.staticEffects.stop();
      this.staticEffects = null;
    }

    if (this.freddySprite) {
      this.freddySprite.stopMenuBehavior();
      await this.freddySprite.showFrame(0);
    }

    if (this.noiseStatic) {
      this.noiseStatic.stop();
      await this.noiseStatic.showFrame(0);
    }

    if (this.blinkSprite) {
      this.blinkSprite.stopBehavior();
      await this.blinkSprite.showFrame(0);
    }

    if (this.sweepLine) {
      this.sweepLine.stop();
      this.sweepLine = null;
    }

    Sound.stop('music-menu');
    Sound.stop('music-tv');

    if (newGameBtn) {
      newGameBtn.removeEventListener('click', this.onNewGameClick);
      newGameBtn.removeEventListener('mouseenter', this.onHover);
    }

    if (continueBtn) {
      continueBtn.removeEventListener('click', this.onContinueClick);
      continueBtn.removeEventListener('mouseenter', this.onHover);
      continueBtn.removeEventListener('mouseenter', this.onContinueEnter);
      continueBtn.removeEventListener('mouseleave', this.onContinueLeave);
    }

    this.hideContinueHint();

    this.liveStarted = false;
    this.staticPrepared = false;
  }

  onHover() {
    Sound.play('menu-hover');
  }

  ensureContinueHint() {
    if (this.continueHint) return this.continueHint;

    const continueBtn = document.querySelector('[data-action="continue"]');
    if (!continueBtn || !continueBtn.parentElement) return null;

    let wrapper = continueBtn.closest('.continue-slot');

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'continue-slot';

      continueBtn.parentNode.insertBefore(wrapper, continueBtn);
      wrapper.appendChild(continueBtn);
    }

    const hint = document.createElement('div');
    hint.className = 'continue-night-hint';
    hint.hidden = true;

    wrapper.appendChild(hint);
    this.continueHint = hint;

    return hint;
  }

  refreshContinueState() {
    const continueBtn = document.querySelector('[data-action="continue"]');
    const hint = this.ensureContinueHint();
    const continueNight = GameProgress.getContinueNight();

    if (!continueBtn) return;

    const canContinue = continueNight !== null;

    continueBtn.disabled = !canContinue;
    continueBtn.classList.toggle('menu-btn--disabled', !canContinue);

    const wrapper = continueBtn.closest('.continue-slot');
    if (wrapper) {
      wrapper.classList.toggle('continue-slot--disabled', !canContinue);
    }

    if (hint) {
      hint.hidden = true;
      hint.textContent = canContinue ? `Night ${continueNight}` : '';
    }
  }

  showContinueHint() {
    const hint = this.ensureContinueHint();
    const continueNight = GameProgress.getContinueNight();

    if (!hint || continueNight === null) return;

    hint.textContent = `Night ${continueNight}`;
    hint.hidden = false;
  }

  hideContinueHint() {
    if (!this.continueHint) return;
    this.continueHint.hidden = true;
  }

  async startNightByNumber(nightNumber, { useMenuTransition = false } = {}) {
    const config = getNightConfig(nightNumber);
    const nightScene = new NightScene(this.game, config);

    if (!useMenuTransition) {
      await this.game.state.change(SceneNames.NIGHT, nightScene);
      return;
    }

    await SceneTransitionManager.go({
      game: this.game,
      sceneName: SceneNames.NIGHT,
      nextScene: nightScene,

      preload: null,

      loading: {
        image: TransitionImages.NEW_GAME,
        background: '#000',
        title: '',
        text: '',
        showProgress: false,
        fadeIn: {
          enabled: true,
          from: 0,
          to: 1,
          duration: 3000
        },
        fadeOut: {
          enabled: true,
          from: 1,
          to: 0,
          duration: 3000
        }
      },

      confirm: {
        mode: 'auto',
        minDuration: 5000
      },

      afterShow: async () => {
        this.hideMenuVisualsForTransition();
      },

      disposeCurrentSceneOnStart: false
    });
  }

  async onNewGameClick() {
    const firstNight = GameProgress.startNewGame();
    await this.startNightByNumber(firstNight, { useMenuTransition: true });
  }

  async onContinueClick() {
    const continueNight = GameProgress.getContinueNight();

    if (continueNight === null) {
      return;
    }

    await this.startNightByNumber(continueNight, { useMenuTransition: false });
  }

  setEntryMode(mode = 'boot') {
    this.entryMode = mode;
  }
}

export default MenuScene;