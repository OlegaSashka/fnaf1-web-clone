import BaseScene from './BaseScene.js';
import Preloader from '../Preloader.js';

import { COMMON_NIGHT_ASSETS } from '../config/NightAssets.js';

import LoadingScreen from '../managers/LoadingScreen.js';


class NightScene extends BaseScene {
  constructor(game, config) {
    super(game);
    this.root = null;
    this.config = config;
  }

  async preload(onProgress) {
    const assets = [
      ...COMMON_NIGHT_ASSETS,
      ...(this.config?.extraAssets ?? [])
    ];

    if (this.config?.officeBackground) {
      assets.push({ type: 'image', src: this.config.officeBackground });
    }

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

    const officeCanvas = document.getElementById('office-canvas');
    const officeUiLayer = document.getElementById('office-ui-layer');
    const officeUi = document.getElementById('office-ui');

    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');
    const monitorTransitionCanvas = document.getElementById('monitor-transition-canvas');

    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const cameraCanvas = document.getElementById('camera-canvas');
    const cameraStaticCanvas = document.getElementById('camera-static-canvas');
    const cameraBlinkCanvas = document.getElementById('camera-blink-canvas');

    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    if (menuScreen) menuScreen.hidden = true;
    if (gameScreen) gameScreen.hidden = false;

    officeCanvas.style.display = 'block';
    officeCanvas.width = this.game.width;
    officeCanvas.height = this.game.height;

    officeUiLayer.hidden = false;
    monitorTransitionLayer.hidden = true;
    monitorScreenLayer.hidden = true;
    monitorUiLayer.hidden = true;

    monitorTransitionCanvas.width = this.game.width;
    monitorTransitionCanvas.height = this.game.height;

    cameraCanvas.width = this.game.width;
    cameraCanvas.height = this.game.height;

    cameraStaticCanvas.width = this.game.width;
    cameraStaticCanvas.height = this.game.height;

    cameraBlinkCanvas.width = this.game.width;
    cameraBlinkCanvas.height = this.game.height;

    this.root = officeCanvas;

    // const ctx = officeCanvas.getContext('2d');
    // const img = new Image();

    // const officeBackground =
    //   this.config?.officeBackground ?? 'assets/images/night/night-office-placeholder.png';

    // await new Promise((resolve, reject) => {
    //   img.onload = resolve;
    //   img.onerror = reject;
    //   img.src = officeBackground;
    // });

    // ctx.clearRect(0, 0, officeCanvas.width, officeCanvas.height);
    // ctx.drawImage(img, 0, 0, officeCanvas.width, officeCanvas.height);

    await this.runIntroAndPreload();
  }

  async exit() {
    const gameScreen = document.getElementById('game-screen');

    const officeCanvas = document.getElementById('office-canvas');
    const officeUiLayer = document.getElementById('office-ui-layer');
    const officeUi = document.getElementById('office-ui');

    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');
    const monitorTransitionCanvas = document.getElementById('monitor-transition-canvas');

    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const cameraCanvas = document.getElementById('camera-canvas');
    const cameraStaticCanvas = document.getElementById('camera-static-canvas');
    const cameraBlinkCanvas = document.getElementById('camera-blink-canvas');

    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    if (gameScreen) gameScreen.hidden = true;

    if (officeCanvas) {
      const ctx = officeCanvas.getContext('2d');
      ctx.clearRect(0, 0, officeCanvas.width, officeCanvas.height);
      officeCanvas.style.display = 'none';
    }

    if (monitorTransitionCanvas) {
      const ctx = monitorTransitionCanvas.getContext('2d');
      ctx.clearRect(0, 0, monitorTransitionCanvas.width, monitorTransitionCanvas.height);
    }

    if (cameraCanvas) {
      const ctx = cameraCanvas.getContext('2d');
      ctx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
    }

    if (cameraStaticCanvas) {
      const ctx = cameraStaticCanvas.getContext('2d');
      ctx.clearRect(0, 0, cameraStaticCanvas.width, cameraStaticCanvas.height);
    }

    if (cameraBlinkCanvas) {
      const ctx = cameraBlinkCanvas.getContext('2d');
      ctx.clearRect(0, 0, cameraBlinkCanvas.width, cameraBlinkCanvas.height);
    }

    if (officeUi) {
      officeUi.innerHTML = '';
    }

    officeUiLayer.hidden = true;
    monitorTransitionLayer.hidden = true;
    monitorScreenLayer.hidden = true;
    monitorUiLayer.hidden = true;

    this.root = null;
  }
}

export default NightScene;