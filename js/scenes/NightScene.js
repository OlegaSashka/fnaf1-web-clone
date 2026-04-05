import BaseScene from './BaseScene.js';
import Preloader from '../Preloader.js';

import GameProgress from '../managers/GameProgress.js';

import { COMMON_NIGHT_ASSETS } from '../config/NightAssets.js';

import MenuScene from './MenuScene.js';
import { SceneNames } from '../config/SceneNames.js';

import { NightAssetPaths } from '../config/NightAssets.js';

import SceneTransitionManager from '../managers/SceneTransitionManager.js';
import LoadingScreen from '../managers/LoadingScreen.js';

import AnimatedSprite from '../AnimatedSprite.js';

import Sound from '../managers/SoundManager.js';

import CameraSystem from '../managers/СameraSystem.js';

class NightScene extends BaseScene {
  constructor(game, config) {
    super(game);
    this.root = null;
    this.config = config;

    this.officeBaseSprite = null;
    this.fanSprite = null;

    this.lookDirection = 0;
    this.lookSpeed = 8;
    this.lookRafId = null;

    this.phoneGuySoundId = null;
    this.isPhoneGuyMuted = false;
    this.isPhoneGuyStarted = false;
    this.phoneGuyMuteShowTimeout = null;
    this.phoneGuyMuteHideTimeout = null;

    this.leftDoorSprite = null
    this.rightDoorSprite = null

    this.leftDoorClosed = false
    this.rightDoorClosed = false

    this.isLeftDoorAnimating = false;
    this.isRightDoorAnimating = false;

    this.leftControlPanelSprite = null;
    this.rightControlPanelSprite = null;

    this.leftLightOn = false;
    this.rightLightOn = false;

    this.lightSoundId = 'light-on';
    this.backgroundAmbienceSoundId = 'night-ambience';
    this.fanHumSoundId = 'fan-hum';
    this.monitorToggleSoundId = 'monitor-toggle';

    this.lightFlickerRunning = false;

    this.officeLightSprite = null;

    this.isLeftLightAnimating = false;
    this.isRightLightAnimating = false;

    this.lightFlickerTimeouts = [];
    this.activeLightSide = null;

    this.currentPower = this.config?.power?.start ?? 1000;
    this.maxPower = this.config?.power?.max ?? this.currentPower;

    this.currentHour = this.config?.time?.startHour ?? 12;
    this.endHour = this.config?.time?.endHour ?? 6;
    this.hourDurationMs = this.config?.time?.hourDurationMs ?? 90000;

    this.nightTimeInterval = null;
    this.powerDrainInterval = null;

    this.usageSprite = null;
    this.currentUsageLevel = 1;

    this.isNightComplete = false;

    this.monitorTransitionSprite = null;
    this.isMonitorOpen = false;
    this.isMonitorAnimating = false;

    this.monitorToggleSprite = null;
    this.monitorCloseSprite = null;

    this.monitorUsageSprite = null;

    this.cameraOffsetX = 0;

    this.cameraSystem = null;
    this.cameraOffsetX = 0;
    this.currentCameraId = '1A';

    this.onCameraButtonClick = this.onCameraButtonClick.bind(this);
    this.onMonitorToggleMouseEnter = this.onMonitorToggleMouseEnter.bind(this);
    this.onMonitorCloseMouseEnter = this.onMonitorCloseMouseEnter.bind(this);

    this.onLeftDoorHitboxClick = this.onLeftDoorHitboxClick.bind(this);
    this.onLeftLightHitboxClick = this.onLeftLightHitboxClick.bind(this);
    this.onRightDoorHitboxClick = this.onRightDoorHitboxClick.bind(this);
    this.onRightLightHitboxClick = this.onRightLightHitboxClick.bind(this);

    this.onOfficeViewportMouseMove = this.onOfficeViewportMouseMove.bind(this);
    this.onOfficeViewportMouseLeave = this.onOfficeViewportMouseLeave.bind(this);

    this.onPhoneGuyMuteClick = this.onPhoneGuyMuteClick.bind(this);
    this.onFreddyNoseClick = this.onFreddyNoseClick.bind(this);

    this.cameraButtonIds = [
      'cam-btn-1a',
      'cam-btn-1b',
      'cam-btn-1c',
      'cam-btn-2a',
      'cam-btn-2b',
      'cam-btn-3',
      'cam-btn-4a',
      'cam-btn-4b',
      'cam-btn-5',
      'cam-btn-6',
      'cam-btn-7'
    ];
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

  async enter() {
    const gameScreen = document.getElementById('game-screen');
    const menuScreen = document.getElementById('menu-screen');

    const leftDoorHitbox = document.getElementById('left-door-hitbox');
    const leftLightHitbox = document.getElementById('left-light-hitbox');
    const rightDoorHitbox = document.getElementById('right-door-hitbox');
    const rightLightHitbox = document.getElementById('right-light-hitbox');

    const freddyNoseHitbox = document.getElementById('freddy-nose-hitbox');

    const monitorToggleCanvas = document.getElementById('monitor-toggle-canvas');
    const monitorCloseCanvas = document.getElementById('monitor-close-canvas');

    if (menuScreen) menuScreen.hidden = true;
    if (gameScreen) gameScreen.hidden = false;

    await SceneTransitionManager.go({
      game: this.game,
      skipSceneChange: true,

      loading: {
        background: '#000',
        title: '',
        text: '',
        uiMode: 'center',
        showProgress: false,
        fadeIn: {
          enabled: false,
          from: 1,
          to: 1,
          duration: 0
        },
        fadeOut: {
          enabled: true,
          from: 1,
          to: 0,
          duration: 1500
        }
      },

      afterShow: async () => {
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
      },

      beforePreload: async () => {
        LoadingScreen.setContent({
          title: this.config?.intro?.title ?? '12:00 AM',
          text: this.config?.intro?.subtitle ?? `Night ${this.config?.nightNumber ?? 1}`,
          uiMode: 'center',
          showProgress: true
        });
      },

      preload: (onProgress) => this.preload(onProgress),

      afterPreload: async () => {
        await this.setupOfficeScene();
        this.setOfficeOffset(0);
      },
      
      confirm: {
        mode: 'screen',
        continueText: 'Click anywhere to continue'
      },

      onFadeOutStart: async () => {
        this.playPhoneGuy();
        this.playBackgroundAmbience();
        this.playFanHum();
        this.fanSprite.play();

        this.startNightClock();
        this.startPowerDrain();
      }
    });

    for (const id of this.cameraButtonIds) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', this.onCameraButtonClick);
      }
    }

    const officeViewport = document.getElementById('office-viewport');

    if (officeViewport) {
      officeViewport.addEventListener('mousemove', this.onOfficeViewportMouseMove);
      officeViewport.addEventListener('mouseleave', this.onOfficeViewportMouseLeave);
    }

    if (leftDoorHitbox) {
      leftDoorHitbox.addEventListener('click', this.onLeftDoorHitboxClick);
    }

    if (leftLightHitbox) {
      leftLightHitbox.addEventListener('click', this.onLeftLightHitboxClick);
    }

    if (rightDoorHitbox) {
      rightDoorHitbox.addEventListener('click', this.onRightDoorHitboxClick);
    }

    if (rightLightHitbox) {
      rightLightHitbox.addEventListener('click', this.onRightLightHitboxClick);
    }

    if (freddyNoseHitbox) {
      freddyNoseHitbox.addEventListener('click', this.onFreddyNoseClick);
    }

    const phoneGuyMuteBtn = document.getElementById('phone-guy-mute-btn');

    if (phoneGuyMuteBtn) {
      phoneGuyMuteBtn.addEventListener('click', this.onPhoneGuyMuteClick);
    }

    if (monitorToggleCanvas) {
      monitorToggleCanvas.addEventListener('mouseenter', this.onMonitorToggleMouseEnter);
    }
    
    if (monitorCloseCanvas) {
      monitorCloseCanvas.addEventListener('mouseenter', this.onMonitorCloseMouseEnter);
    }

    this.updatePhoneGuyMuteButton();
  }
  
  async exit() {
    const gameScreen = document.getElementById('game-screen');

    const officeCanvas = document.getElementById('office-world-canvas');
    const officeFanCanvas = document.getElementById('office-fan-canvas');
    const officeUiLayer = document.getElementById('office-ui-layer');

    const leftDoorHitbox = document.getElementById('left-door-hitbox');
    const leftLightHitbox = document.getElementById('left-light-hitbox');
    const rightDoorHitbox = document.getElementById('right-door-hitbox');
    const rightLightHitbox = document.getElementById('right-light-hitbox');

    const officeLightCanvas = document.getElementById('office-light-canvas');

    const officeViewport = document.getElementById('office-viewport');

    const phoneGuyMuteBtn = document.getElementById('phone-guy-mute-btn');

    const freddyNoseHitbox = document.getElementById('freddy-nose-hitbox');

    const monitorToggleCanvas = document.getElementById('monitor-toggle-canvas');
    const monitorCloseCanvas = document.getElementById('monitor-close-canvas');

    for (const id of this.cameraButtonIds) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.removeEventListener('click', this.onCameraButtonClick);
      }
    }

    if (monitorCloseCanvas) {
      monitorCloseCanvas.removeEventListener('mouseenter', this.onMonitorCloseMouseEnter);
    }

    if (monitorToggleCanvas) {
      monitorToggleCanvas.removeEventListener('mouseenter', this.onMonitorToggleMouseEnter);
    }

    if (freddyNoseHitbox) {
      freddyNoseHitbox.removeEventListener('click', this.onFreddyNoseClick);
    }

    if (phoneGuyMuteBtn) {
      phoneGuyMuteBtn.removeEventListener('click', this.onPhoneGuyMuteClick);
    }

    if (officeViewport) {
      officeViewport.removeEventListener('mousemove', this.onOfficeViewportMouseMove);
      officeViewport.removeEventListener('mouseleave', this.onOfficeViewportMouseLeave);
    }

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

    if (this.officeBaseSprite) {
      this.officeBaseSprite.stop({ clear: false });
      this.officeBaseSprite = null;
    }

    if (this.fanSprite) {
      this.fanSprite.stop({ clear: false });
      this.fanSprite = null;
    }

    if (leftDoorHitbox) {
      leftDoorHitbox.removeEventListener('click', this.onLeftDoorHitboxClick);
    }

    if (leftLightHitbox) {
      leftLightHitbox.removeEventListener('click', this.onLeftLightHitboxClick);
    }

    if (rightDoorHitbox) {
      rightDoorHitbox.removeEventListener('click', this.onRightDoorHitboxClick);
    }

    if (rightLightHitbox) {
      rightLightHitbox.removeEventListener('click', this.onRightLightHitboxClick);
    }

    this.lookDirection = 0;
    this.stopLookMovement();

    if (officeUiLayer) {
      officeUiLayer.hidden = true;
    }

    if (officeLightCanvas) {
      const ctx = officeLightCanvas.getContext('2d');
      ctx.clearRect(0, 0, officeLightCanvas.width, officeLightCanvas.height);
      officeLightCanvas.style.display = 'none';
    }

    if (this.officeLightSprite) {
      this.officeLightSprite.stop({ clear: true });
      this.officeLightSprite = null;
    }

    this.clearLightFlicker();

    this.stopBackgroundAmbience();
    this.stopFanHum();
    this.stopPhoneGuy();

    this.root = null;
  }

  async setupOfficeScene() {
    const officeCanvas = document.getElementById('office-world-canvas');
    const officeFanCanvas = document.getElementById('office-fan-canvas');

    const officeLeftDoorCanvas = document.getElementById('office-left-door-canvas');
    const officeRightDoorCanvas = document.getElementById('office-right-door-canvas');

    const leftDoorWrap = document.getElementById('left-door-wrap');
    const rightDoorWrap = document.getElementById('right-door-wrap');

    const officeLightCanvas = document.getElementById('office-light-canvas');

    const officeWorld = document.getElementById('office-world');
    const officeUiLayer = document.getElementById('office-ui-layer');

    const officeLeftPanelCanvas = document.getElementById('office-left-panel-canvas');
    const officeRightPanelCanvas = document.getElementById('office-right-panel-canvas');

    const nightUsageCanvas = document.getElementById('night-usage-canvas');

    const monitorToggleCanvas = document.getElementById('monitor-toggle-canvas');
    const monitorTransitionCanvas = document.getElementById('monitor-transition-canvas');

    const monitorCloseCanvas = document.getElementById('monitor-close-canvas');
    const monitorUsageCanvas = document.getElementById('monitor-usage-canvas');

    const cameraWorld = document.getElementById('camera-world');
    const cameraWorldCanvas = document.getElementById('camera-world-canvas');
    const monitorCameraNameText = document.getElementById('monitor-camera-name-text');

    const worldWidth = Math.round(officeWorld.offsetWidth);
    const worldHeight = Math.round(officeWorld.offsetHeight);

    if (
      !officeCanvas ||
      !officeFanCanvas ||
      !leftDoorWrap || !rightDoorWrap ||
      !officeLeftDoorCanvas || !officeRightDoorCanvas ||
      !officeLeftPanelCanvas ||
      !officeRightPanelCanvas ||
      !officeWorld || 
      !officeUiLayer ||
      !officeLightCanvas ||
      !nightUsageCanvas || !monitorTransitionCanvas || 
      !monitorUsageCanvas || !monitorCloseCanvas || !monitorToggleCanvas
    ) {
      console.error('[NightScene] Не найдены office-элементы');
      return;
    }

    if (officeUiLayer) {
      officeUiLayer.hidden = false;
    }

    const leftDoorWidth = Math.round(leftDoorWrap.offsetWidth);
    const rightDoorWidth = Math.round(rightDoorWrap.offsetWidth);
    const doorHeight = Math.round(officeWorld.offsetHeight);

    this.root = officeCanvas;

    officeCanvas.style.display = 'block';
    officeCanvas.width = worldWidth;
    officeCanvas.height = worldHeight;

    officeLightCanvas.style.display = 'block';
    officeLightCanvas.width = worldWidth;
    officeLightCanvas.height = worldHeight;

    officeFanCanvas.style.display = 'block';
    officeFanCanvas.width = worldWidth;
    officeFanCanvas.height = worldHeight;

    officeLeftDoorCanvas.style.display = 'block';
    officeLeftDoorCanvas.width = leftDoorWidth;
    officeLeftDoorCanvas.height = doorHeight;

    officeRightDoorCanvas.style.display = 'block';
    officeRightDoorCanvas.width = rightDoorWidth;
    officeRightDoorCanvas.height = doorHeight;

    officeLeftPanelCanvas.style.display = 'block';
    officeLeftPanelCanvas.width = 92;
    officeLeftPanelCanvas.height = 247;

    officeRightPanelCanvas.style.display = 'block';
    officeRightPanelCanvas.width = 92;
    officeRightPanelCanvas.height = 247;

    nightUsageCanvas.style.display = 'block';
    nightUsageCanvas.width = 103;
    nightUsageCanvas.height = 32;

    monitorUsageCanvas.style.display = 'block';
    monitorUsageCanvas.width = 103;
    monitorUsageCanvas.height = 32;

    monitorToggleCanvas.style.display = 'block';
    monitorToggleCanvas.width = 598;
    monitorToggleCanvas.height = 45;

    monitorTransitionCanvas.width = 1920;
    monitorTransitionCanvas.height = 1080;
    monitorTransitionCanvas.style.display = 'block';

    this.cameraSystem = new CameraSystem({
      cameraWorld,
      cameraWorldCanvas,
      cameraNameText: monitorCameraNameText,
      initialCameraId: this.currentCameraId
    });

    await this.cameraSystem.init();
    this.updateActiveCameraButton();
    
    this.monitorTransitionSprite = new AnimatedSprite(
      monitorTransitionCanvas,
      NightAssetPaths.MONITOR_TRANSITION,
      25,
      {
        frameWidth: 1280,
        frameHeight: 720,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 1920,
        drawHeight: 1080
      }
    );
    

    this.monitorCloseSprite = new AnimatedSprite(
      monitorCloseCanvas,
      NightAssetPaths.MONITOR_TOGGLE,
      1,
      {
        frameWidth: 598,
        frameHeight: 45,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 598,
        drawHeight: 45
      }
    );

    await this.monitorCloseSprite.showFrame(0);

    this.monitorToggleSprite = new AnimatedSprite(
      monitorToggleCanvas,
      NightAssetPaths.MONITOR_TOGGLE,
      1,
      {
        frameWidth: 598,
        frameHeight: 45,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 598,
        drawHeight: 45
      }
    );

    await this.monitorToggleSprite.showFrame(0);

    if (!officeWorld || !officeCanvas || !officeFanCanvas) {
      console.error('[NightScene] Не найдены office-элементы');
      return;
    }

    if (!officeCanvas || !officeFanCanvas) {
      console.error('[NightScene] Не найдены canvas офиса');
      return;
    }

    this.officeLightSprite = new AnimatedSprite(
      officeLightCanvas,
      NightAssetPaths.OFFICE_LIGHT,
      1,
      {
        frameWidth: 1600,
        frameHeight: 720,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: officeLightCanvas.width,
        drawHeight: officeLightCanvas.height,
      }
    );

    this.officeLightSprite.clear();

    this.officeBaseSprite = new AnimatedSprite(
      officeCanvas,
      NightAssetPaths.OFFICE_BASE,
      1,
      {
        frameWidth: 1600,
        frameHeight: 720,
        direction: 'vertical',

        drawX: 0,
        drawY: 0,
        drawWidth: officeCanvas.width,
        drawHeight: officeCanvas.height,
      }
    );

    await this.officeBaseSprite.showFrame(0);

    this.fanSprite = new AnimatedSprite(
      officeFanCanvas,
      NightAssetPaths.FAN,
      30,
      {
        frameWidth: 1600,
        frameHeight: 720,
        direction: 'vertical',

        drawX: 0,
        drawY: 0,
        drawWidth: officeFanCanvas.width,
        drawHeight: officeFanCanvas.height,
      }
    );

    await this.fanSprite.showFrame(0);

    this.leftDoorSprite = new AnimatedSprite(
      officeLeftDoorCanvas,
      NightAssetPaths.DOOR_SHEET,
      35,
      {
        frameWidth: 229,
        frameHeight: 720,
        direction: 'horizontal',
        drawX: 0,
        drawY: 0,
        drawWidth: officeLeftDoorCanvas.width,
        drawHeight: officeLeftDoorCanvas.height,
        flipX: true
      }
    );
    await this.leftDoorSprite.showFrame(0);

    this.rightDoorSprite = new AnimatedSprite(
      officeRightDoorCanvas,
      NightAssetPaths.DOOR_SHEET,
      35,
      {
        frameWidth: 229,
        frameHeight: 720,
        direction: 'horizontal',
        drawX: 0,
        drawY: 0,
        drawWidth: officeRightDoorCanvas.width,
        drawHeight: officeRightDoorCanvas.height,
      }
    );
    await this.rightDoorSprite.showFrame(0);

    this.leftControlPanelSprite = new AnimatedSprite(
      officeLeftPanelCanvas,
      NightAssetPaths.LEFT_DOOR_BUTTON,
      1,
      {
        frameWidth: 92,
        frameHeight: 247,
        direction: 'horizontal',
        drawX: 0,
        drawY: 0,
        drawWidth: 92,
        drawHeight: 247
      }
    );

    this.rightControlPanelSprite = new AnimatedSprite(
      officeRightPanelCanvas,
      NightAssetPaths.RIGHT_DOOR_BUTTON,
      1,
      {
        frameWidth: 92,
        frameHeight: 247,
        direction: 'horizontal',
        drawX: 0,
        drawY: 0,
        drawWidth: 92,
        drawHeight: 247
      }
    );

    this.usageSprite = new AnimatedSprite(
      nightUsageCanvas,
      NightAssetPaths.USAGE_METER,
      1,
      {
        frameWidth: 103,
        frameHeight: 32,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 103,
        drawHeight: 32
      }
    );

    await this.usageSprite.showFrame(0);

    this.monitorUsageSprite = new AnimatedSprite(
      monitorUsageCanvas,
      NightAssetPaths.USAGE_METER,
      1,
      {
        frameWidth: 103,
        frameHeight: 32,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 103,
        drawHeight: 32
      }
    );

    await this.monitorUsageSprite.showFrame(0);

    await this.updateControlPanels();
    await this.updateNightHud();

    this.stopNightClock();
    this.stopPowerDrain();
  }

  async completeNight() {
    if (this.isNightComplete) return;
    this.isNightComplete = true;

    this.stopNightClock();
    this.stopPowerDrain();

    this.stopPhoneGuy();
    this.stopBackgroundAmbience();
    this.stopFanHum();

    const currentNight = this.config?.nightNumber ?? GameProgress.getCurrentNight() ?? 1;
    const nextNight = currentNight + 1;
    GameProgress.setCurrentNight(nextNight);

    await SceneTransitionManager.go({
      game: this.game,
      skipSceneChange: true,
      loading: {
        background: '#000',
        title: '6:00 AM',
        text: 'Night Complete',
        uiMode: 'center',
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
          duration: 1200
        }
      },
      confirm: {
        mode: 'auto',
        minDuration: 1500
      }
    });

    const menuScene = new MenuScene(this.game);
    menuScene.setEntryMode('return');

    await this.game.state.change(SceneNames.MENU, menuScene);
  }

  ensureBackgroundAmbienceSound() {
    if (!NightAssetPaths.BACKGROUND_AMBIENCE) return;

    if (!Sound.sounds[this.backgroundAmbienceSoundId]) {
      Sound.add(this.backgroundAmbienceSoundId, NightAssetPaths.BACKGROUND_AMBIENCE, {
        loop: true,
        volume: 1
      });
    }
  }

  startPowerDrain() {
    this.stopPowerDrain();

    this.powerDrainInterval = setInterval(async () => {
      const usage = this.calculateUsageLevel();

      this.currentPower = Math.max(0, this.currentPower - usage);
      await this.updateNightHud();

      if (this.currentPower <= 0) {
        this.stopPowerDrain();
      }
    }, 1000);
  }

  stopPowerDrain() {
    if (this.powerDrainInterval) {
      clearInterval(this.powerDrainInterval);
      this.powerDrainInterval = null;
    }
  }

  startNightClock() {
    this.stopNightClock();

    this.nightTimeInterval = setInterval(async () => {
      const nextHour = this.getNextNightHour(this.currentHour);

      this.currentHour = nextHour;
      await this.updateNightHud();

      if (this.currentHour === this.endHour) {
        await this.completeNight();
      }
    }, this.hourDurationMs);
  }

  getNextNightHour(hour) {
    if (hour === 12) return 1;
    if (hour >= 1 && hour < 6) return hour + 1;
    return this.endHour;
  }

  stopNightClock() {
    if (this.nightTimeInterval) {
      clearInterval(this.nightTimeInterval);
      this.nightTimeInterval = null;
    }
  }

  async updateNightHud() {
    this.updateNightLabel();
    this.updateNightTimeText();
    this.updatePowerText();
    await this.updateUsage();
  }

  updateNightLabel() {
    const nightLabelText = document.getElementById('night-label-text');
    if (!nightLabelText) return;

    const nightNumber = this.config?.nightNumber ?? 1;
    nightLabelText.textContent = `Night ${nightNumber}`;
  }

  updateNightTimeText() {
    const nightTimeText = document.getElementById('night-time-text');
    if (!nightTimeText) return;

    const displayHour = this.currentHour === 0 ? 12 : this.currentHour;
    nightTimeText.textContent = `${displayHour} AM`;
  }

  updatePowerText() {
    const powerValueText = document.getElementById('night-power-value-text');
    if (!powerValueText) return;

    const percent = Math.max(
      0,
      Math.ceil((this.currentPower / this.maxPower) * 100)
    );

    powerValueText.textContent = `${percent}%`;
  }

  calculateUsageLevel() {
    let usage = 1;

    if (this.leftDoorClosed) usage += 1;
    if (this.rightDoorClosed) usage += 1;
    if (this.leftLightOn) usage += 1;
    if (this.rightLightOn) usage += 1;
    if (this.isMonitorOpen) usage += 1;

    return Math.min(usage, 5);
  }

  async updateUsage() {
    this.currentUsageLevel = this.calculateUsageLevel();

    const frameIndex = Math.max(0, this.currentUsageLevel - 1);

    if (this.usageSprite) {
      await this.usageSprite.showFrame(frameIndex);
    }

    if (this.monitorUsageSprite) {
      await this.monitorUsageSprite.showFrame(frameIndex);
    }
  }

  playBackgroundAmbience() {
    if (!NightAssetPaths.BACKGROUND_AMBIENCE) return;
    this.ensureBackgroundAmbienceSound();
    Sound.play(this.backgroundAmbienceSoundId);
  }

  stopBackgroundAmbience() {
    if (!Sound.sounds[this.backgroundAmbienceSoundId]) return;
    Sound.stop(this.backgroundAmbienceSoundId);
  }

  ensureFanHumSound() {
    if (!NightAssetPaths.FAN_HUM) return;

    if (!Sound.sounds[this.fanHumSoundId]) {
      Sound.add(this.fanHumSoundId, NightAssetPaths.FAN_HUM, {
        loop: true,
        volume: 0.2
      });
    }
  }

  playFanHum() {
    if (!NightAssetPaths.FAN_HUM) return;
    this.ensureFanHumSound();
    Sound.play(this.fanHumSoundId);
  }

  stopFanHum() {
    if (!Sound.sounds[this.fanHumSoundId]) return;
    Sound.stop(this.fanHumSoundId);
  }

  updatePhoneGuyMuteButton() {
    const phoneGuyMuteBtn = document.getElementById('phone-guy-mute-btn');
    if (!phoneGuyMuteBtn) return;

    phoneGuyMuteBtn.classList.toggle('is-muted', this.isPhoneGuyMuted);
    phoneGuyMuteBtn.textContent = this.isPhoneGuyMuted ? 'Call Muted' : 'Mute Call';
  }

  schedulePhoneGuyMuteButton() {
      const muteBtn = document.getElementById('phone-guy-mute-btn');
      const muteFo = document.getElementById('phone-guy-mute-fo');

      if (!muteBtn) return;

      muteBtn.hidden = true;
      muteBtn.style.display = 'none';

      if (muteFo) {
        muteFo.style.display = 'none';
      }

      if (this.phoneGuyMuteShowTimeout) {
        clearTimeout(this.phoneGuyMuteShowTimeout);
        this.phoneGuyMuteShowTimeout = null;
      }

      const delay = this.config?.phoneGuyUi?.muteShowDelay ?? 19000;

      this.phoneGuyMuteShowTimeout = setTimeout(() => {
        if (this.isPhoneGuyMuted || !this.isPhoneGuyStarted) return;

        muteBtn.hidden = false;
        muteBtn.style.display = 'block';

        if (muteFo) {
          muteFo.style.display = 'block';
        }
      }, delay);
  }

  schedulePhoneGuyMuteHide(soundId) {
    const muteBtn = document.getElementById('phone-guy-mute-btn');
    const muteFo = document.getElementById('phone-guy-mute-fo');

    if (!muteBtn) return;

    if (this.phoneGuyMuteHideTimeout) {
      clearTimeout(this.phoneGuyMuteHideTimeout);
      this.phoneGuyMuteHideTimeout = null;
    }

    const howl = Sound.sounds[soundId];
    if (!howl || typeof howl.duration !== 'function') return;

    const durationMs = Math.max(0, howl.duration() * 1000) * 0.9;

    this.phoneGuyMuteHideTimeout = setTimeout(() => {
      if (muteBtn) {
        muteBtn.hidden = true;
        muteBtn.style.display = 'none';
      }

      if (muteFo) {
        muteFo.style.display = 'none';
      }

      this.isPhoneGuyStarted = false;
    }, durationMs);
  }

  hidePhoneGuyMuteButton() {
    const muteBtn = document.getElementById('phone-guy-mute-btn');
    const muteFo = document.getElementById('phone-guy-mute-fo');

    if (muteBtn) {
      muteBtn.hidden = true;
      muteBtn.style.display = 'none';
    }

    if (muteFo) {
      muteFo.style.display = 'none';
    }

    if (this.phoneGuyMuteShowTimeout) {
      clearTimeout(this.phoneGuyMuteShowTimeout);
      this.phoneGuyMuteShowTimeout = null;
    }

    if (this.phoneGuyMuteHideTimeout) {
      clearTimeout(this.phoneGuyMuteHideTimeout);
      this.phoneGuyMuteHideTimeout = null;
    }
  }

  onPhoneGuyMuteClick() {
    if (!this.phoneGuySoundId && !this.isPhoneGuyStarted) return;

    this.isPhoneGuyMuted = true;
    this.stopPhoneGuy();
    this.hidePhoneGuyMuteButton();
  }
  
  getPhoneGuySoundId() {
    const nightNumber = this.config?.nightNumber ?? 'default';
    console.log(`nightNumber ${nightNumber}`);
    return `phone-guy-night-${nightNumber}`;
  }

  ensurePhoneGuySound() {
    if (!this.config?.phoneGuy) return null;

    const soundId = this.getPhoneGuySoundId();

    this.phoneGuySoundId = soundId;

    if (!Sound.sounds[soundId]) {
      Sound.add(soundId, this.config.phoneGuy, {
        loop: false,
        volume: 0.5
      });
    }

    return soundId;
  }

  playPhoneGuy() {
    if (this.isPhoneGuyMuted) return;

    const soundId = this.ensurePhoneGuySound();
    if (!soundId) return;

    Sound.play(soundId);
    this.isPhoneGuyStarted = true;

    this.schedulePhoneGuyMuteButton();
    this.schedulePhoneGuyMuteHide(soundId);
  }

  stopPhoneGuy() {
    if (this.phoneGuySoundId) {
      Sound.stop(this.phoneGuySoundId);
    }

    this.isPhoneGuyStarted = false;
    this.hidePhoneGuyMuteButton();
  }

  ensureFreddyNoseSound() {
    if (!NightAssetPaths.FREDDY_NOSE_SOUND) return;

    if (!Sound.sounds['freddy-nose']) {
      Sound.add('freddy-nose', NightAssetPaths.FREDDY_NOSE_SOUND, {
        loop: false,
        volume: 0.5
      });
    }
  }

  onFreddyNoseClick() {
    this.ensureFreddyNoseSound();
    Sound.play('freddy-nose');
  }

  setOfficeOffset(offsetX = 0) {
    const officeWorld = document.getElementById('office-world');
    if (!officeWorld) return;

    const maxOffset = this.getOfficeMaxOffset();
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, offsetX));

    this.officeOffsetX = clampedOffset;
    officeWorld.style.transform = `translateX(calc(-50% + ${clampedOffset}px))`;
  }

  onOfficeViewportMouseMove(event) {
    const officeViewport = document.getElementById('office-viewport');
    if (!officeViewport) return;

    const rect = officeViewport.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const normalizedX = localX / rect.width;

    if (normalizedX <= 0.33) {
      this.lookDirection = 1;
      this.startLookMovement();
      return;
    }

    if (normalizedX >= 0.67) {
      this.lookDirection = -1;
      this.startLookMovement();
      return;
    }

    this.lookDirection = 0;
  }

  onOfficeViewportMouseLeave() {
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
  
  async onLeftDoorHitboxClick() {
    if (!this.leftDoorSprite || this.isLeftDoorAnimating) return;

    this.isLeftDoorAnimating = true;

    const nextClosed = !this.leftDoorClosed;
    this.leftDoorClosed = nextClosed;
    await this.updateControlPanels();
    await this.updateNightHud();

    this.playDoorToggleSound();

    try {
      if (nextClosed) {
        await this.leftDoorSprite.playOnce({
          fromFrame: 0,
          toFrame: this.leftDoorSprite.totalFrames - 1,
          holdLastFrame: true
        });
      } else {
        await this.leftDoorSprite.playOnceReverse({
          fromFrame: this.leftDoorSprite.totalFrames - 1,
          toFrame: 0,
          holdLastFrame: true
        });
      }
    } catch (error) {
      this.leftDoorClosed = !nextClosed;
      await this.updateControlPanels();
      throw error;
    } finally {
      this.isLeftDoorAnimating = false;
    }
  }

  async onRightDoorHitboxClick() {
    if (!this.rightDoorSprite || this.isRightDoorAnimating) return;

    this.isRightDoorAnimating = true;

    const nextClosed = !this.rightDoorClosed;
    this.rightDoorClosed = nextClosed;
    await this.updateControlPanels();
    await this.updateNightHud();

    this.playDoorToggleSound();

    try {
      if (nextClosed) {
        await this.rightDoorSprite.playOnce({
          fromFrame: 0,
          toFrame: this.rightDoorSprite.totalFrames - 1,
          holdLastFrame: true
        });
      } else {
        await this.rightDoorSprite.playOnceReverse({
          fromFrame: this.rightDoorSprite.totalFrames - 1,
          toFrame: 0,
          holdLastFrame: true
        });
      }
    } catch (error) {
      this.rightDoorClosed = !nextClosed;
      await this.updateControlPanels();
      throw error;
    } finally {
      this.isRightDoorAnimating = false;
    }
  }

  getControlPanelFrame(isDoorClosed, isLightOn) {
    if (isDoorClosed && isLightOn) return 3;
    if (isLightOn) return 1;
    if (isDoorClosed) return 2;
    return 0;
  }

  async updateControlPanels() {
    const leftFrame = this.getControlPanelFrame(this.leftDoorClosed, this.leftLightOn);
    const rightFrame = this.getControlPanelFrame(this.rightDoorClosed, this.rightLightOn);

    if (this.leftControlPanelSprite) {
      await this.leftControlPanelSprite.showFrame(leftFrame);
    }

    if (this.rightControlPanelSprite) {
      await this.rightControlPanelSprite.showFrame(rightFrame);
    }
  }

  async onLeftLightHitboxClick() {
    if (this.isLeftLightAnimating) return;

    this.isLeftLightAnimating = true;

    try {
      const nextState = !this.leftLightOn;

      this.leftLightOn = nextState;
      this.rightLightOn = false;

      await this.updateControlPanels();
      await this.updateNightHud();
      await this.refreshOfficeLight();
    } finally {
      this.isLeftLightAnimating = false;
    }
  }

  async onRightLightHitboxClick() {
    if (this.isRightLightAnimating) return;

    this.isRightLightAnimating = true;

    try {
      const nextState = !this.rightLightOn;

      this.rightLightOn = nextState;
      this.leftLightOn = false;

      await this.updateControlPanels();
      await this.updateNightHud();
      await this.refreshOfficeLight();
    } finally {
      this.isRightLightAnimating = false;
    }
  }

  ensureDoorToggleSound() {
    if (!Sound.sounds['door-toggle']) {
      Sound.add('door-toggle', NightAssetPaths.DOOR_TOGGLE_SOUND, {
        loop: false,
        volume: 0.4
      });
    }
  }

  playDoorToggleSound() {
    if (!NightAssetPaths.DOOR_TOGGLE_SOUND) return;

    this.ensureDoorToggleSound();
    Sound.play('door-toggle');
  }

  ensureLightSounds() {
    if (!NightAssetPaths.LIGHT_ON_SOUND) return;

    if (!Sound.sounds[this.lightSoundId]) {
      Sound.add(this.lightSoundId, NightAssetPaths.LIGHT_ON_SOUND, {
        loop: false,
        volume: 0.35
      });
    }
  }

  playLightOnSound() {
    if (!NightAssetPaths.LIGHT_ON_SOUND) return;
    this.ensureLightSounds();
    Sound.stop(this.lightSoundId);
    Sound.play(this.lightSoundId);
  }

  stopLightSound() {
    if (!Sound.sounds[this.lightSoundId]) return;
    Sound.stop(this.lightSoundId);
  }

  queueLightFlicker(callback, delay) {
    const id = setTimeout(() => {
      this.lightFlickerTimeouts = this.lightFlickerTimeouts.filter(x => x !== id);
      callback();
    }, delay);

    this.lightFlickerTimeouts.push(id);
    return id;
  }

  async showOfficeLight(side = 'left') {
    if (!this.officeLightSprite) return;

    const frameIndex = side === 'right' ? 1 : 0;
    await this.officeLightSprite.showFrame(frameIndex);
  }

  async refreshOfficeLight() {
    const isAnyLightOn = this.leftLightOn || this.rightLightOn;

    if (!isAnyLightOn) {
      this.activeLightSide = null;
      this.clearLightFlicker();
      this.hideOfficeLight();
      return;
    }

    this.activeLightSide = this.leftLightOn ? 'left' : 'right';
    await this.playLightFlickerSequence();
  }

  hideOfficeLight() {
    if (!this.officeLightSprite) return;
    this.officeLightSprite.clear();
  }

  clearLightFlicker() {
    this.lightFlickerRunning = false;

    for (const id of this.lightFlickerTimeouts) {
      clearTimeout(id);
    }

    this.lightFlickerTimeouts = [];
    this.stopLightSound();
  }

  async lightOnStep() {
    await this.showOfficeLight(this.activeLightSide);
    this.playLightOnSound();
  }

  lightOffStep() {
    this.hideOfficeLight();
    this.stopLightSound();
  }

  scheduleNextLightFlickerCycle() {
    if (!this.lightFlickerRunning) return;

    const offDelay1 = 60 + Math.floor(Math.random() * 120);
    const onDelay1 = offDelay1 + 40 + Math.floor(Math.random() * 90);
    const offDelay2 = onDelay1 + 70 + Math.floor(Math.random() * 160);
    const onDelay2 = offDelay2 + 35 + Math.floor(Math.random() * 80);
    const nextCycleDelay = onDelay2 + 140 + Math.floor(Math.random() * 260);

    this.queueLightFlicker(() => {
      if (!this.lightFlickerRunning) return;
      this.lightOffStep();
    }, offDelay1);

    this.queueLightFlicker(async () => {
      if (!this.lightFlickerRunning) return;
      await this.lightOnStep();
    }, onDelay1);

    this.queueLightFlicker(() => {
      if (!this.lightFlickerRunning) return;
      this.lightOffStep();
    }, offDelay2);

    this.queueLightFlicker(async () => {
      if (!this.lightFlickerRunning) return;
      await this.lightOnStep();
    }, onDelay2);

    this.queueLightFlicker(() => {
      if (!this.lightFlickerRunning) return;
      this.scheduleNextLightFlickerCycle();
    }, nextCycleDelay);
  }

  async playLightFlickerSequence() {
    this.clearLightFlicker();
    this.lightFlickerRunning = true;

    await this.lightOnStep();
    this.scheduleNextLightFlickerCycle();
  }

  async onMonitorToggleMouseEnter() {
    console.log('open monitor');
    await this.openMonitor();
  }

  async openMonitor() {
    if (this.isMonitorAnimating || this.isMonitorOpen || !this.monitorTransitionSprite) return;

    const officeUiLayer = document.getElementById('office-ui-layer');
    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');
    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    this.isMonitorAnimating = true;

    if (monitorTransitionLayer) monitorTransitionLayer.hidden = false;
    
    this.playMonitorToggleSound();

    await this.monitorTransitionSprite.playOnce({
      fromFrame: 0,
      toFrame: this.monitorTransitionSprite.totalFrames - 1,
      holdLastFrame: true
    });

    this.setFanHumVolume(0.1);

    if (officeUiLayer) officeUiLayer.hidden = true;
    if (monitorTransitionLayer) monitorTransitionLayer.hidden = true;
    if (monitorScreenLayer) monitorScreenLayer.hidden = false;
    if (monitorUiLayer) monitorUiLayer.hidden = false;

    this.isMonitorOpen = true;
    await this.updateNightHud();
    this.isMonitorAnimating = false;
  }

  async closeMonitor() {
    if (this.isMonitorAnimating || !this.isMonitorOpen || !this.monitorTransitionSprite) return;

    const officeUiLayer = document.getElementById('office-ui-layer');
    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');
    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    this.isMonitorAnimating = true;

    if (monitorScreenLayer) monitorScreenLayer.hidden = true;
    if (monitorUiLayer) monitorUiLayer.hidden = true;
    if (monitorTransitionLayer) monitorTransitionLayer.hidden = false;
    if (officeUiLayer) officeUiLayer.hidden = false;

    this.playMonitorToggleSound();
    this.setFanHumVolume(0.2);

    this.isMonitorOpen = false;
    await this.updateNightHud();

    await this.monitorTransitionSprite.playOnceReverse({
      fromFrame: this.monitorTransitionSprite.totalFrames - 1,
      toFrame: 0,
      holdLastFrame: false,
      clearOnFinish: true
    });

    if (monitorTransitionLayer) monitorTransitionLayer.hidden = true;

    this.isMonitorAnimating = false;
  }

  async onMonitorCloseMouseEnter() {
    await this.closeMonitor();
  }

  setTextIfExists(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }

  updateHudTexts() {
    const nightNumber = this.config?.nightNumber ?? 1;
    const displayHour = this.currentHour === 0 ? 12 : this.currentHour;
    const percent = Math.max(
      0,
      Math.ceil((this.currentPower / this.maxPower) * 100)
    );

    this.setTextIfExists('night-label-text', `Night ${nightNumber}`);
    this.setTextIfExists('monitor-night-text', `Night ${nightNumber}`);

    this.setTextIfExists('night-time-text', `${displayHour} AM`);
    this.setTextIfExists('monitor-time-text', `${displayHour} AM`);

    this.setTextIfExists('night-power-value-text', `${percent}%`);
    this.setTextIfExists('monitor-power-value-text', `${percent}%`);
  }

  async updateNightHud() {
    this.updateHudTexts();
    await this.updateUsage();
  }

  ensureMonitorSounds() {
    if (NightAssetPaths.MONITOR_TOGGLE_SOUND && !Sound.sounds[this.monitorToggleSoundId]) {
      Sound.add(this.monitorToggleSoundId, NightAssetPaths.MONITOR_TOGGLE_SOUND, {
        loop: false,
        volume: 0.45
      });
    }
  }

  playMonitorToggleSound() {
    this.ensureMonitorSounds();
    if (Sound.sounds[this.monitorToggleSoundId]) {
      Sound.stop(this.monitorToggleSoundId);
      Sound.playOnce(this.monitorToggleSoundId);
    }
  }

  setFanHumVolume(volume) {
    const howl = Sound.sounds[this.fanHumSoundId];
    if (!howl) return;

    howl.volume(volume);
  }

  async onCameraButtonClick(event) {
    if (!this.cameraSystem) return;

    const button = event.currentTarget;
    if (!button) return;

    const cameraId = button.id
      .replace('cam-btn-', '')
      .toUpperCase();

    await this.cameraSystem.setCurrentCamera(cameraId);
    this.currentCameraId = cameraId;

    this.updateActiveCameraButton();
  }

  updateActiveCameraButton() {
    for (const id of this.cameraButtonIds) {
      const btn = document.getElementById(id);
      if (!btn) continue;

      const buttonCameraId = id.replace('cam-btn-', '').toUpperCase();
      btn.classList.toggle('is-active', buttonCameraId === this.currentCameraId);
    }
  }
} 

export default NightScene;