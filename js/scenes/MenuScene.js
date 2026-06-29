import BaseScene from './BaseScene.js';

import Preloader from '../Preloader.js';
import Images from '../managers/ImageLibrary.js';

import { getNightConfig } from '../config/NightConfigs.js';
import GameProgress from '../managers/GameProgress.js';

import AnimatedSprite from '../AnimatedSprite.js';
import VerticalSweepLine from '../VerticalSweepLine.js';
import CanvasEffectController from '../CanvasEffectController.js';

import Sound from '../managers/SoundManager.js';
import SceneTransitionManager from '../managers/SceneTransitionManager.js';

import { SceneNames } from '../config/SceneNames.js';

import { TransitionAssets, TransitionAssetIds} from '../config/TransitionAssets.js';
import { TRANSITION_ASSETS } from '../config/TransitionAssets.js';

import { MenuAssetIds } from '../config/MenuAsstets.js';
import { MENU_ASSETS } from '../config/MenuAsstets.js';

import NightScene from './NightScene.js';

const LOCALIZATION = {
  ru: {
    menu_title_line1: 'ПЯТЬ НОЧЕЙ',
    menu_title_line2: "У ФРЕДДИ",
    menu_new_game: 'НОВАЯ ИГРА',
    menu_continue: 'ПРОДОЛЖИТЬ',
    menu_version: 'ВЕРСИЯ 0.5',
    menu_copyright: '©2026 Scott Cawthon/OlegSashKa',
    menu_night_suffix: 'Ночь '
  },
  en: {
    menu_title_line1: 'FIVE NIGHTS',
    menu_title_line2: "AT FREDDY'S",
    menu_new_game: 'NEW GAME',
    menu_continue: 'CONTINUE',
    menu_version: 'V. 0.5',
    menu_copyright: '©2026 Scott Cawthon/OlegSashKa',
    menu_night_suffix: 'Night '
  }
};

class MenuScene extends BaseScene {
  constructor(game) {
    super(game);
    this.currentLang = 'ru';
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

  t(key) {
    return LOCALIZATION[this.currentLang][key] || '';
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
        title: isBootEntry ? 'ПРЕДУПРЕЖДЕНИЕ' : '',
        text: isBootEntry
          ? 'Эта игра содержит громкие звуки, мигающие огни и скримеры.'
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
            buttonText: 'Начать'
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

    Sound.stop(MenuAssetIds.MUSIC_MENU);
    Sound.stop(TransitionAssetIds.MUSIC_TV_SOUND);

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

    const newGameCanvas = document.getElementById('menu-new-game-canvas');
    const continueCanvas = document.getElementById('menu-continue-canvas');

    // Новая игра (остается как было)
    newGameBtn.addEventListener('mouseenter', () => {
      this.onHover();
      this.drawButtonText(newGameCanvas, this.t('menu_new_game'), true);
    });
    newGameBtn.addEventListener('mouseleave', () => {
      this.drawButtonText(newGameCanvas, this.t('menu_new_game'), false);
    });
    newGameBtn.addEventListener('click', this.onNewGameClick);

    // Продолжить (теперь вызывает один чистый метод перерисовки всего холста)
    continueBtn.addEventListener('mouseenter', () => {
      this.onHover();
      this.drawContinueButton(continueCanvas, true); // Перерисовываем со стрелочками и Ночью X
    });
    continueBtn.addEventListener('mouseleave', () => {
      this.drawContinueButton(continueCanvas, false); // Возвращаем чистое состояние
    });
    continueBtn.addEventListener('click', this.onContinueClick);
    
    this.refreshContinueState();
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

    Sound.play(MenuAssetIds.MUSIC_MENU);
    Sound.play(TransitionAssetIds.MUSIC_TV_SOUND);

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
    
    const freddyImage = Images.get(MenuAssetIds.MENU_FREDDY);
    const noiseImage = Images.get(TransitionAssetIds.TV_NOISE);
    const blinkImage = Images.get(MenuAssetIds.MENU_BLINK);

    if (!freddyImage || !noiseImage || !blinkImage) {
      console.error('[MenuScene] Не найдены предзагруженные изображения меню');
      return;
    }

    if (!this.freddySprite) {
      this.freddySprite = new AnimatedSprite(
        freddyCanvas,
        freddyImage,
        20
      );
    }

    if (!this.noiseStatic) {
      this.noiseStatic = new AnimatedSprite(
        staticCanvas,
        noiseImage,
        40
      );
    }

    if (!this.blinkSprite) {
      this.blinkSprite = new AnimatedSprite(
        blinkCanvas,
        blinkImage,
        2
      );
    }

    await this.freddySprite.showFrame(0);
    await this.noiseStatic.showFrame(0);
    await this.blinkSprite.showFrame(0);

    this.renderMenuText();

    this.staticPrepared = true;
  }

  onContinueEnter() {
    this.showContinueHint();
  }

  onContinueLeave() {
    this.hideContinueHint();
  }

  async preload(onProgress) {
    await Preloader.loadAssets(
      [
        ...MENU_ASSETS,
        ...TRANSITION_ASSETS
      ],
      onProgress,
      {
        continueOnError: true
      }
    );
  }

  onHover() {
    Sound.play(TransitionAssetIds.BLIP);
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
      hint.textContent = canContinue ? `Ночь ${continueNight}` : '';
    }
  }

  showContinueHint() {
    const hint = this.ensureContinueHint();
    const continueNight = GameProgress.getContinueNight();

    if (!hint || continueNight === null) return;

    hint.textContent = `Ночь ${continueNight}`;
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
        image: TransitionAssets.NEW_GAME,
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


  renderMenuText() {
    const titleCanvas = document.getElementById('menu-title-canvas');
    const newGameCanvas = document.getElementById('menu-new-game-canvas');
    const continueCanvas = document.getElementById('menu-continue-canvas');
    const versionCanvas = document.getElementById('menu-version-canvas');
    const copyrightCanvas = document.getElementById('menu-copyright-canvas');

    // Заголовок
    if (titleCanvas) {
      const ctx = titleCanvas.getContext('2d');
      ctx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 90px "Courier New", monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(this.t('menu_title_line1'), 0, 0);
      ctx.fillText(this.t('menu_title_line2'), 0, 100);
    }

    // Статичные надписи (Версия и Автор)
    if (versionCanvas) {
      const ctx = versionCanvas.getContext('2d');
      ctx.clearRect(0, 0, versionCanvas.width, versionCanvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px "Courier New", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left'; // Выравнивание по левому краю холста
      ctx.fillText(this.t('menu_version'), 0, versionCanvas.height / 2);
    }

    if (copyrightCanvas) {
      const ctx = copyrightCanvas.getContext('2d');
      ctx.clearRect(0, 0, copyrightCanvas.width, copyrightCanvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 20px "Courier New", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right'; // Выравнивание по ПРАВОМУ краю холста
      
      ctx.fillText(this.t('menu_copyright'), copyrightCanvas.width, copyrightCanvas.height / 2);
    }

    this.drawButtonText(newGameCanvas, this.t('menu_new_game'), false);
    this.drawContinueButton(continueCanvas, false);
  }

  drawButtonText(canvas, text, isHovered) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.textBaseline = 'middle';
    ctx.font = '700 42px "Courier New", monospace';

    const textX = 100; // Отступ 100px дает идеальное выравнивание с заголовка и простор для стрелочек
    const textY = canvas.height / 2;

    // Текст теперь всегда чисто БЕЛЫЙ
    ctx.fillStyle = '#ffffff'; 
    ctx.fillText(text, textX, textY);

    if (isHovered) {
      // Рисуем стрелочки далеко слева (на координате 20px вместо 10px)
      ctx.fillText('>>', 20, textY);
    }
  }

  drawContinueButton(canvas, isHovered) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Текст всегда чисто БЕЛЫЙ
    ctx.fillStyle = '#ffffff'; 
    ctx.textBaseline = 'top'; 

    const textX = 100;
    const continueY = 10;
    const gapBetween = 5;

    ctx.font = '700 42px "Courier New", monospace';
    ctx.fillText(this.t('menu_continue'), textX, continueY);

    if (isHovered) {

      ctx.fillText('>>', 20, continueY);

      ctx.font = '700 24px "Courier New", monospace';
      ctx.fillStyle = '#ffffffff'; // Цвет для Ночи Х
      
      const savedNight = this.gameProgress?.getNight() || 1;
      const hintText = this.t('menu_night_suffix') + savedNight;
      
      const hintY = continueY + 42 + gapBetween; 
      ctx.fillText(hintText, textX, hintY);
    }
  }
}

export default MenuScene;