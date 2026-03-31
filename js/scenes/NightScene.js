import BaseScene from './BaseScene.js';
import Preloader from '../Preloader.js';

import { COMMON_NIGHT_ASSETS } from '../config/NightAssets.js';

import LoadingScreen from '../managers/LoadingScreen.js';

import AnimatedSprite from '../AnimatedSprite.js';

class NightScene extends BaseScene {
  constructor(game, config) {
    super(game);
    this.root = null;
    this.config = config;

    this.officeBaseSprite = null;
    this.fanSprite = null;

    this.lookDirection = 0; // -1 = влево, 0 = стоп, 1 = вправо
    this.lookSpeed = 8;
    this.lookRafId = null;

    this.onLookLeftEnter = this.onLookLeftEnter.bind(this);
    this.onLookCenterEnter = this.onLookCenterEnter.bind(this);
    this.onLookRightEnter = this.onLookRightEnter.bind(this);

    this.onLookLeftLeave = this.onLookLeftLeave.bind(this);
    this.onLookCenterLeave = this.onLookCenterLeave.bind(this);
    this.onLookRightLeave = this.onLookRightLeave.bind(this);
  }

  async preload(onProgress) {
    const assets = [
      ...COMMON_NIGHT_ASSETS,
      ...(this.config?.extraAssets ?? [])
    ];

    if (this.config?.phoneGuy) {
      assets.push({ type: 'audio', src: this.config.phoneGuy });
    }

    const results = await Preloader.loadAssets(assets, onProgress, {
      continueOnError: true
    });

    const failed = results.filter((x) => !x.ok);

    if (failed.length > 0) {
      console.warn(
        `[NightScene] Часть ассетов не загрузилась: ${failed.length}`,
        failed.map((x) => x.asset.src)
      );
    }
  }

  async runIntroAndPreload() {
    const title = this.config?.intro?.title ?? '12:00 AM';
    const subtitle = this.config?.intro?.subtitle ?? `Night ${this.config?.nightNumber ?? 1}`;

    // 1. Открываем loading screen пустым, только как фон под blink
    await LoadingScreen.show({
      background: '#000',
      title: '',
      text: '',
      uiMode: 'center',
      showProgress: false,
      fadeIn: {
        enabled: true,
        from: 0,
        to: 1,
        duration: 300
      }
    });

    // 2. Проигрываем blink-эффект поверх loading screen
    await LoadingScreen.playEffect({
      spriteSheet: 'assets/images/ui/Blink/Menu-blink-camera.png',
      fps: 30,
      holdLastFrame: false,
      clearOnFinish: true,
      sound: {
        id: 'camera-intro-blip',
        src: 'assets/sounds/ui/blip3.wav',
        volume: 1,
        playOnce: true
      }
    });

    // 3. После blink показываем, какая сейчас ночь
    await LoadingScreen.show({
      background: '#000',
      title,
      text: subtitle,
      uiMode: 'center',
      showProgress: true,
      fadeIn: {
        enabled: false,
        from: 1,
        to: 1,
        duration: 0
      }
    });

    // 4. Грузим ассеты ночи
    await this.preload((progress) => {
      LoadingScreen.setProgress(progress);
    });

    // 5. После загрузки ждем клик
    await new Promise(async (resolve) => {
      await LoadingScreen.show({
        background: '#000',
        title,
        text: subtitle,
        uiMode: 'center',
        showProgress: false,
        waitForScreenClick: true,
        continueText: 'Click anywhere to continue',
        onContinue: resolve,
        fadeIn: {
          enabled: false,
          from: 1,
          to: 1,
          duration: 0
        }
      });
    });

    // 6. Убираем loading screen
    await LoadingScreen.hide({
      fadeOut: {
        enabled: true,
        from: 1,
        to: 0,
        duration: 300
      }
    });
  }

async enter() {
  const gameScreen = document.getElementById('game-screen');
  const menuScreen = document.getElementById('menu-screen');

  const officeWorld = document.getElementById('office-world');
  const officeCanvas = document.getElementById('office-world-canvas');
  const officeFanCanvas = document.getElementById('office-fan-canvas');
  const officeUiLayer = document.getElementById('office-ui-layer');

  if (!officeWorld || !officeCanvas || !officeFanCanvas) {
    console.error('[NightScene] Не найдены office-элементы');
    return;
  }

  if (menuScreen) menuScreen.hidden = true;
  if (gameScreen) gameScreen.hidden = false;

  const worldWidth = Math.round(officeWorld.offsetWidth);
  const worldHeight = Math.round(officeWorld.offsetHeight);

  officeCanvas.style.display = 'block';
  officeCanvas.width = worldWidth;
  officeCanvas.height = worldHeight;

  officeFanCanvas.style.display = 'block';
  officeFanCanvas.width = worldWidth;
  officeFanCanvas.height = worldHeight;

  if (officeUiLayer) {
    officeUiLayer.hidden = false;
  }

  this.root = officeCanvas;

  await this.runIntroAndPreload();
  await this.setupOfficeScene();

  const lookZoneLeft = document.getElementById('look-zone-left');
  const lookZoneCenter = document.getElementById('look-zone-center');
  const lookZoneRight = document.getElementById('look-zone-right');

  if (lookZoneLeft) {
    lookZoneLeft.addEventListener('mouseenter', this.onLookLeftEnter);
    lookZoneLeft.addEventListener('mouseleave', this.onLookLeftLeave);
  }

  if (lookZoneCenter) {
    lookZoneCenter.addEventListener('mouseenter', this.onLookCenterEnter);
    lookZoneCenter.addEventListener('mouseleave', this.onLookCenterLeave);
  }

  if (lookZoneRight) {
    lookZoneRight.addEventListener('mouseenter', this.onLookRightEnter);
    lookZoneRight.addEventListener('mouseleave', this.onLookRightLeave);
  }

  this.setOfficeOffset(0);
}

async exit() {
  const gameScreen = document.getElementById('game-screen');

  const officeCanvas = document.getElementById('office-world-canvas');
  const officeFanCanvas = document.getElementById('office-fan-canvas');
  const officeUiLayer = document.getElementById('office-ui-layer');

  const lookZoneLeft = document.getElementById('look-zone-left');
  const lookZoneCenter = document.getElementById('look-zone-center');
  const lookZoneRight = document.getElementById('look-zone-right');

  if (gameScreen) gameScreen.hidden = true;

  if (officeCanvas) {
    const ctx = officeCanvas.getContext('2d');
    ctx.clearRect(0, 0, officeCanvas.width, officeCanvas.height);
    officeCanvas.style.display = 'none';
  }

  if (officeFanCanvas) {
    const ctx = officeFanCanvas.getContext('2d');
    ctx.clearRect(0, 0, officeFanCanvas.width, officeFanCanvas.height);
    officeFanCanvas.style.display = 'none';
  }

  if (this.fanSprite) {
    this.fanSprite.stop({ clear: false });
    this.fanSprite = null;
  }

  if (lookZoneLeft) {
    lookZoneLeft.removeEventListener('mouseenter', this.onLookLeftEnter);
    lookZoneLeft.removeEventListener('mouseleave', this.onLookLeftLeave);
  }

  if (lookZoneCenter) {
    lookZoneCenter.removeEventListener('mouseenter', this.onLookCenterEnter);
    lookZoneCenter.removeEventListener('mouseleave', this.onLookCenterLeave);
  }

  if (lookZoneRight) {
    lookZoneRight.removeEventListener('mouseenter', this.onLookRightEnter);
    lookZoneRight.removeEventListener('mouseleave', this.onLookRightLeave);
  }

  this.lookDirection = 0;
  this.stopLookMovement();

  if (officeUiLayer) {
    officeUiLayer.hidden = true;
  }

  this.root = null;
}

  async setupOfficeScene() {
    const officeCanvas = document.getElementById('office-world-canvas');
    const officeFanCanvas = document.getElementById('office-fan-canvas');

    if (!officeCanvas || !officeFanCanvas) {
      console.error('[NightScene] Не найдены canvas офиса');
      return;
    }

    const ctx = officeCanvas.getContext('2d');

    const bg = new Image();
    bg.src = 'assets/images/office/Office_Base.png';

    await new Promise((resolve, reject) => {
      bg.onload = resolve;
      bg.onerror = reject;
    });

    console.log('[NightScene] Office_Base loaded:', bg.width, bg.height);
    console.log('[NightScene] officeCanvas size:', officeCanvas.width, officeCanvas.height);

    ctx.clearRect(0, 0, officeCanvas.width, officeCanvas.height);

    ctx.drawImage(
      bg,
      0,
      0,
      bg.width,
      bg.height,
      0,
      0,
      officeCanvas.width,
      officeCanvas.height
    );

    this.fanSprite = new AnimatedSprite(
      officeFanCanvas,
      'assets/images/Fan/Fan.png',
      12,
      {
        frameWidth: 1600,
        frameHeight: 720,
        drawX: 0,
        drawY: 0,
        drawWidth: officeFanCanvas.width,
        drawHeight: officeFanCanvas.height
      }
    );

    await this.fanSprite.showFrame(0);
    this.fanSprite.play();
  }

  setOfficeOffset(offsetX = 0) {
    const officeWorld = document.getElementById('office-world');
    if (!officeWorld) return;

    const maxOffset = this.getOfficeMaxOffset();
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, offsetX));

    this.officeOffsetX = clampedOffset;
    officeWorld.style.transform = `translateX(calc(-50% + ${clampedOffset}px))`;
  }

  onLookLeftEnter() {
    this.lookDirection = 1;
    this.startLookMovement();
  }

  onLookCenterEnter() {
    this.lookDirection = 0;
  }

  onLookRightEnter() {
    this.lookDirection = -1;
    this.startLookMovement();
  }

  onLookRightLeave() {
    this.lookDirection = 0;
  }
  
  onLookLeftLeave() {
    this.lookDirection = 0;
  }

  onLookCenterLeave() {
    this.lookDirection = 0;
  }

  getOfficeMaxOffset() {
    const officeWorld = document.getElementById('office-world');
    const officeViewport = document.getElementById('office-viewport');

    if (!officeWorld || !officeViewport) return 0;

    return Math.max(
      0,
      (officeWorld.offsetWidth - officeViewport.offsetWidth) / 2
    );
  }

  startLookMovement() {
    if (this.lookRafId) return;

    const step = () => {
      if (this.lookDirection !== 0) {
        this.setOfficeOffset(this.officeOffsetX + this.lookDirection * this.lookSpeed);
      }

      this.lookRafId = requestAnimationFrame(step);
    };

    this.lookRafId = requestAnimationFrame(step);
  }

  stopLookMovement() {
    if (this.lookRafId) {
      cancelAnimationFrame(this.lookRafId);
      this.lookRafId = null;
    }
  }

}

export default NightScene;