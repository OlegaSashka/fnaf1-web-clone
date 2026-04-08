import BaseScene from './BaseScene.js';
import Preloader from '../Preloader.js';

import GameProgress from '../managers/GameProgress.js';

import { COMMON_NIGHT_ASSETS, NightAssetIds } from '../config/NightAssets.js';

import MenuScene from './MenuScene.js';
import { SceneNames } from '../config/SceneNames.js';

import Images from '../managers/ImageLibrary.js';

import { NightAssetPaths } from '../config/NightAssets.js';

import SceneTransitionManager from '../managers/SceneTransitionManager.js';
import LoadingScreen from '../managers/LoadingScreen.js';

import AnimatedSprite from '../AnimatedSprite.js';

import Sounds from '../managers/SoundLibrary.js';
import Sound from '../managers/SoundManager.js';

import PowerOutManager from '../managers/PowerOutManager.js';

import { TransitionAssets, TransitionAssetIds } from '../config/TransitionAssets.js';

import CameraSystem from '../managers/CameraSystem.js';

import { cameraButtonIds } from '../config/CameraConfigs.js';

import AnimatronicStateManager from '../config/AnimatronicStateManager.js';
import AnimatronicMovementManager from '../managers/AnimatronicMovementManager.js';
import { AnimatronicConfigs } from '../config/AnimatronicConfigs.js';

import CameraStateResolver from '../managers/CameraStateResolver.js';

import JumpscareManager from '../managers/JumpscareManager.js';

import RareEventManager from '../managers/RareEventManager.js';

class NightScene extends BaseScene {
  constructor(game, config) {
    super(game);
    this.root = null;
    this.config = config;

    this.officeBaseSprite = null;
    this.fanSprite = null;

    this.lookDirection = 0;
    this.lookBaseSpeed = 5;
    this.lookSpeedMultiplier = 1;
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
    this.isVictorySequencePlaying = false;

    this.monitorTransitionSprite = null;
    this.isMonitorOpen = false;
    this.isMonitorAnimating = false;

    this.monitorToggleSprite = null;
    this.monitorCloseSprite = null;

    this.monitorUsageSprite = null;

    this.cameraSystem = null;
    this.currentCameraId = '1A';

    this.animatronicStateManager = null;
    this.animatronicMovementManager = null;
    this.cameraStateResolver = null;
    
    this.leftControlsBroken = false;
    this.bonnieMonitorPunishTimeout = null;

    this.rightControlsBroken = false;
    this.lastOfficeIntruderId = null;

    this.leftThreatSoundPlayed = false;
    this.rightThreatSoundPlayed = false;

    this.jumpscareManager = null;
    this.isGameOver = false;
    
    this.rareEventManager = null;

    this.powerOutManager = null;
    this.isPowerOut = false;

    this.powerOutOverlayEl = null;
    this.powerOutFreddyBlinkTimeout = null;
    this.powerOutFreddyBlinkFrame = 0;

    this.doorScareCooldowns = new Map();

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
    
    this.threatTimers = new Map();

    this.kitchenSoundIds = [
      NightAssetIds.KITCHEN_SOUND_1,
      NightAssetIds.KITCHEN_SOUND_2,
      NightAssetIds.KITCHEN_SOUND_3,
      NightAssetIds.KITCHEN_SOUND_4
    ];
    this.activeKitchenSoundId = null;
    this.lastKitchenSoundId = null;
    this.kitchenSoundTimeoutId = null;

    this.cameraButtonIds = [...cameraButtonIds];
  }

  async preload(onProgress) {
    const assets = [
      ...COMMON_NIGHT_ASSETS,
      ...(this.config?.extraAssets ?? [])
    ];

    if (this.config?.phoneGuy.src) {
      assets.push({ type: 'audio', id: this.config.phoneGuy.id, src: this.config.phoneGuy.src});
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
          duration: 500
        }
      },

      afterShow: async () => {
        await LoadingScreen.playEffect({
          spriteSheet: NightAssetPaths.MONITOR_BLINK,
          fps: 30,
          holdLastFrame: false,
          clearOnFinish: true,
          sound: {
            id: TransitionAssetIds.BLIP,
            src: TransitionAssets.BLIP,
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

        this.animatronicMovementManager?.startAnimatronic('bonnie');
        this.animatronicMovementManager?.startAnimatronic('chica');
      }
    });

    const officeViewport = document.getElementById('office-viewport');

    if (officeViewport) {
      officeViewport.addEventListener('mousemove', this.onOfficeViewportMouseMove);
      officeViewport.addEventListener('mouseleave', this.onOfficeViewportMouseLeave);
    }

    for (const id of this.cameraButtonIds) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', this.onCameraButtonClick);
      }
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

    this.animatronicMovementManager?.stopAll();
    this.animatronicMovementManager = null;
    this.animatronicStateManager = null;
    this.cameraStateResolver?.clearAllBlackouts();
    this.cameraStateResolver = null;

    for (const id of this.cameraButtonIds) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.removeEventListener('click', this.onCameraButtonClick);
      }
    }

    this.stopPowerOutFreddyBlink();
    this.stopFreddyPowerOutMusic();
    this.setPowerOutOverlayVisible(false);

    this.powerOutManager?.stop();
    this.powerOutManager = null;
    this.isPowerOut = false;

    this.rareEventManager?.clear();
    this.rareEventManager = null;

    this.clearAllThreatTimers();
    this.leftControlsBroken = false;

    this.rightControlsBroken = false;
    this.lastOfficeIntruderId = null;

    if (this.jumpscareManager) {
      this.jumpscareManager.destroy();
      this.jumpscareManager = null;
    } 

    this.stopKitchenSoundLoop();

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
    this.lookSpeedMultiplier = 0;
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

    LoadingScreen.hideVictorySequence();

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

    const cameraStaticCanvas = document.getElementById('camera-static-canvas');
    const cameraBlinkCanvas = document.getElementById('camera-blink-canvas');

    const jumpscareCanvas = document.getElementById('jumpscare-canvas');

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
      !monitorUsageCanvas || !monitorCloseCanvas || !monitorToggleCanvas || !cameraStaticCanvas || !cameraBlinkCanvas ||
      !jumpscareCanvas
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

    jumpscareCanvas.style.display = 'block';
    jumpscareCanvas.width = worldWidth;
    jumpscareCanvas.height = worldHeight;

    nightUsageCanvas.style.display = 'block';

    monitorUsageCanvas.style.display = 'block';

    monitorToggleCanvas.style.display = 'block';

    monitorCloseCanvas.style.display = 'block';

    monitorTransitionCanvas.width = 1920;
    monitorTransitionCanvas.height = 1080;
    monitorTransitionCanvas.style.display = 'block';

    this.cameraSystem = new CameraSystem({
      cameraWorld,
      cameraWorldCanvas,
      autoOffsetSpeed: 0.8,
      autoOffsetPauseMs: 650,
      cameraStaticCanvas: cameraStaticCanvas,
      cameraBlinkCanvas: cameraBlinkCanvas,
      cameraNameText: monitorCameraNameText,
      initialCameraId: this.currentCameraId,
      onBlinkSound: () => this.playCameraBlinkSound()
    });

    await this.cameraSystem.init();

    this.animatronicStateManager = new AnimatronicStateManager();

    this.rareEventManager = new RareEventManager();

    window.rareDebug = {
      setRoll: (value) => this.rareEventManager?.setForcedRoll(value),
      clearRoll: () => this.rareEventManager?.clearForcedRoll(),
      setQueue: (...values) => this.rareEventManager?.setRollQueue(values),
      clearQueue: () => this.rareEventManager?.clearRollQueue(),
      state: () => ({
        lastRoll: this.rareEventManager?.lastRoll ?? null,
        lastCameraId: this.rareEventManager?.lastCameraId ?? null,
        forcedRoll: this.rareEventManager?.debugForcedRoll ?? null,
        queue: [...(this.rareEventManager?.debugQueue ?? [])]
      })
    };

    this.animatronicMovementManager = new AnimatronicMovementManager({
      animatronicConfigs: AnimatronicConfigs,
      stateManager: this.animatronicStateManager,
      cameraSystem: this.cameraSystem,
      hooks: {
        isLeftDoorClosed: () => this.leftDoorClosed,
        isRightDoorClosed: () => this.rightDoorClosed,
        isMonitorOpen: () => this.isMonitorOpen,

        onAnimatronicEnteredOfficeAttack: async ({ animatronicId }) => {
          await this.refreshOfficeLight();
        },

        onAnimatronicAttackFailed: async ({ animatronicId }) => {
          await this.refreshOfficeLight();
        },
        onAnimatronicAttackSucceeded: async ({ animatronicId }) => {
          this.lastOfficeIntruderId = animatronicId;

          if (animatronicId === 'bonnie') {
            this.leftControlsBroken = true;

            if (this.leftLightOn) this.leftLightOn = false;
            if (this.leftDoorClosed) this.leftDoorClosed = false;
          }

          if (animatronicId === 'chica') {
            this.rightControlsBroken = true;

            if (this.rightLightOn) this.rightLightOn = false;
            if (this.rightDoorClosed) this.rightDoorClosed = false;
          }

          await this.updateControlPanels();
          await this.updateNightHud();
          await this.refreshOfficeLight();
        },

        onKitchenOccupancyChanged: async () => {
          this.refreshKitchenSoundLoop();
        },
      },
      onAnimatronicMoved: async ({ animatronicId, fromNode, toNode }) => {
        console.log(`[MOVE] ${animatronicId}: ${fromNode} -> ${toNode}`);

        this.animatronicMovementManager?.playMoveSound({
          animatronicId,
          fromNode,
          toNode,
          currentCameraId: this.currentCameraId,
          isMonitorOpen: this.isMonitorOpen
        });

        this.cameraStateResolver?.setTransitionBlackout(fromNode, toNode);
        await this.cameraStateResolver?.updateCurrentCameraView();
      }
    });

    this.animatronicMovementManager.initAnimatronic('bonnie');
    this.animatronicMovementManager.initAnimatronic('chica');
    this.animatronicMovementManager.initAnimatronic('freddy');

    // this.animatronicMovementManager.setForcedRoll('chica', 1);

    this.cameraStateResolver = new CameraStateResolver({
      cameraSystem: this.cameraSystem,
      animatronicStateManager: this.animatronicStateManager,
      resolveStateOverride: ({ cameraId, baseState }) => {
        const rareState = this.rareEventManager?.resolveRareState({
          cameraId,
          baseState
        });

        return rareState ?? baseState;
      }
    });

    this.jumpscareManager = new JumpscareManager({
      canvas: jumpscareCanvas
    });

    this.powerOutManager = new PowerOutManager({
      scene: this,
      powerDownSoundId: NightAssetIds.POWER_DOWN_SOUND,
      powerDownSoundPath: NightAssetPaths.POWER_DOWN_SOUND
    });

    await this.jumpscareManager.init();

    this.monitorTransitionSprite = new AnimatedSprite(
      monitorTransitionCanvas,
      Images.get(NightAssetIds.MONITOR_TRANSITION),
      35,
      {
        frameWidth: 1280,
        frameHeight: 720,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: monitorTransitionCanvas.width,
        drawHeight: monitorTransitionCanvas.height
      }
    );
    

    this.monitorCloseSprite = new AnimatedSprite(
      monitorCloseCanvas,
      Images.get(NightAssetIds.MONITOR_TOGGLE),
      1,
      {
        frameWidth: 598,
        frameHeight: 45,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 598*1.3,
        drawHeight: 45*1.3
      }
    );

    await this.monitorCloseSprite.showFrame(0);

    this.monitorToggleSprite = new AnimatedSprite(
      monitorToggleCanvas,
      Images.get(NightAssetIds.MONITOR_TOGGLE),
      1,
      {
        frameWidth: 598,
        frameHeight: 45,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 598*1.3,
        drawHeight: 45*1.3
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
      Images.get(NightAssetIds.OFFICE_LIGHT),
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
      Images.get(NightAssetIds.OFFICE_BASE),
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
      Images.get(NightAssetIds.FAN),
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
      Images.get(NightAssetIds.DOOR_SHEET),
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
      Images.get(NightAssetIds.DOOR_SHEET),
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
      Images.get(NightAssetIds.LEFT_DOOR_BUTTON),
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
      Images.get(NightAssetIds.RIGHT_DOOR_BUTTON),
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
      Images.get(NightAssetIds.USAGE_METER),
      1,
      {
        frameWidth: 103,
        frameHeight: 32,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 103*1.3,
        drawHeight: 32*1.3
      }
    );

    await this.usageSprite.showFrame(0);

    this.monitorUsageSprite = new AnimatedSprite(
      monitorUsageCanvas,
      Images.get(NightAssetIds.USAGE_METER),
      1,
      {
        frameWidth: 103,
        frameHeight: 32,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: 103*1.3,
        drawHeight: 32*1.3
      }
    );

    await this.monitorUsageSprite.showFrame(0);

    await this.updateControlPanels();
    await this.updateNightHud();

    this.stopNightClock();
    this.stopPowerDrain();
  }

  async playJumpscareByAnimatronic(animatronicId, options = {}) {
    if (!this.jumpscareManager) return;

    const { soundDelayMs = 0 } = options;

    switch (animatronicId) {
      case 'bonnie':
        await this.jumpscareManager.playBonnie({ soundDelayMs });
        return;

      case 'chica':
        await this.jumpscareManager.playChica?.({ soundDelayMs });
        return;

      default:
        console.warn(`[NightScene] Неизвестный jumpscare для animatronicId="${animatronicId}"`);
    }
  }

    async triggerGameOverByAnimatronic(animatronicId, options = {}) {
      if (this.isNightComplete || this.isVictorySequencePlaying || this.isGameOver) return;

      const {
        hideHud = false,
        keepMonitorTransitionVisible = false,
        soundDelayMs = 0,
        closePromise = null
      } = options;

      this.isGameOver = true;

      this.disableGameplayForJumpscare({
        hideHud,
        disableMonitorToggle: true,
        stopAmbientSounds: true,
        clearMonitorView: false,
        keepMonitorTransitionVisible
      });

      const jumpscarePromise = this.playJumpscareByAnimatronic(animatronicId, {
        soundDelayMs
      });

      await Promise.all([
        jumpscarePromise,
        closePromise
      ]);

      this.isMonitorAnimating = false;

      if (this.isNightComplete || this.isVictorySequencePlaying) {
        return;
      }

      await this.goToGameOver();
    }

  async completeNight() {
    if (this.isNightComplete || this.isVictorySequencePlaying) return;
    await this.triggerVictorySequence();
  }

  ensureBackgroundAmbienceSound() {
    if (!NightAssetPaths.BACKGROUND_AMBIENCE_SOUND) return;

    if (!Sounds.has(NightAssetIds.BACKGROUND_AMBIENCE_SOUND)) {
      Sounds.add(NightAssetIds.BACKGROUND_AMBIENCE_SOUND, NightAssetPaths.BACKGROUND_AMBIENCE_SOUND, {
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
        this.currentPower = 0;
        await this.updateNightHud();
        await this.triggerPowerOut();
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

    this.animatronicMovementManager?.onHourChanged(this.currentHour);

    this.nightTimeInterval = setInterval(async () => {
      const nextHour = this.getNextNightHour(this.currentHour);

      this.currentHour = nextHour;
      this.animatronicMovementManager?.onHourChanged(this.currentHour);
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

    this.updateHudTexts();
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
    if (!NightAssetPaths.BACKGROUND_AMBIENCE_SOUND) return;
    this.ensureBackgroundAmbienceSound();
    Sound.play(NightAssetIds.BACKGROUND_AMBIENCE_SOUND);
  }

  stopBackgroundAmbience() {
    if (!Sounds.has(NightAssetIds.BACKGROUND_AMBIENCE_SOUND)) return;
    Sound.stop(NightAssetIds.BACKGROUND_AMBIENCE_SOUND);
  }

  ensureFanHumSound() {
    if (!NightAssetPaths.FAN_HUM) return;

    if (!Sounds.has(NightAssetIds.FAN_HUM_SOUND)) {
      Sounds.add(NightAssetIds.FAN_HUM_SOUND, NightAssetPaths.FAN_HUM, {
        loop: true,
        volume: 0.2
      });
    }
  }

  playFanHum() {
    if (!NightAssetPaths.FAN_HUM) return;
    this.ensureFanHumSound();
    Sound.play(NightAssetIds.FAN_HUM_SOUND);
  }

  stopFanHum() {
    if (!Sounds.has(NightAssetIds.FAN_HUM_SOUND)) return;
    Sound.stop(NightAssetIds.FAN_HUM_SOUND);
  }

  updatePhoneGuyMuteButton() {
    const phoneGuyMuteBtn = document.getElementById('phone-guy-mute-btn');
    if (!phoneGuyMuteBtn) return;

    phoneGuyMuteBtn.classList.toggle('is-muted', this.isPhoneGuyMuted);
    phoneGuyMuteBtn.textContent = this.isPhoneGuyMuted ? 'Call Muted' : 'Mute Call';
  }

  schedulePhoneGuyMuteButton() {
      const muteBtn = document.getElementById('phone-guy-mute-btn');
      const muteFo = document.getElementById('global-ui-layer-svg');

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

    const howl = Sounds.get(soundId);
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
    const muteFo = document.getElementById('global-ui-layer-svg');

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
    if (!this.config?.phoneGuy.src) return null;

    const soundId = this.config?.phoneGuy.id;

    this.phoneGuySoundId = soundId;

    if (!Sounds.has(soundId)) {
      Sounds.add(soundId, this.config.phoneGuy.src, {
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

    if (!Sounds.has(NightAssetIds.FREDDY_NOSE_SOUND)) {
      Sounds.add(NightAssetIds.FREDDY_NOSE_SOUND, NightAssetPaths.FREDDY_NOSE_SOUND, {
        loop: false,
        volume: 0.5
      });
    }
  }

  onFreddyNoseClick() {
    if (this.isPowerOut) return;

    this.ensureFreddyNoseSound();
    Sound.play(NightAssetIds.FREDDY_NOSE_SOUND);
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
    if (this.isMonitorOpen || this.isMonitorAnimating) return;
    
    const officeViewport = document.getElementById('office-viewport');
    if (!officeViewport) return;

    const rect = officeViewport.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const normalizedX = localX / rect.width;

    const segment = 1 / 7;

    if (normalizedX < segment) {
      this.lookDirection = 1;
      this.lookSpeedMultiplier = 1.5;
    } else if (normalizedX < segment * 2) {
      this.lookDirection = 1;
      this.lookSpeedMultiplier = 1;
    } else if (normalizedX < segment * 3) {
      this.lookDirection = 1;
      this.lookSpeedMultiplier = 0.5;
    } else if (normalizedX < segment * 4) {
      this.lookDirection = 0;
      this.lookSpeedMultiplier = 0;
    } else if (normalizedX < segment * 5) {
      this.lookDirection = -1;
      this.lookSpeedMultiplier = 0.5;
    } else if (normalizedX < segment * 6) {
      this.lookDirection = -1;
      this.lookSpeedMultiplier = 1;
    } else {
      this.lookDirection = -1;
      this.lookSpeedMultiplier = 1.5;
    }

    if (this.lookDirection !== 0) {
      this.startLookMovement();
    }
  }

  onOfficeViewportMouseLeave() {
    this.lookDirection = 0;
    this.lookSpeedMultiplier = 0;
    this.stopLookMovement();
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
        this.setOfficeOffset(this.officeOffsetX + this.lookDirection * this.lookBaseSpeed * this.lookSpeedMultiplier);
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
    if (this.isPowerOut) return;

    if (this.leftControlsBroken) {
      this.playErrorButtonSound();
      return;
    }

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
    if (this.isPowerOut) return;

    if (this.rightControlsBroken) {
      this.playErrorButtonSound();
      return;
    }

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
    const leftFrame = this.leftControlsBroken
      ? 0
      : this.getControlPanelFrame(this.leftDoorClosed, this.leftLightOn);

    const rightFrame = this.rightControlsBroken
      ? 0
      : this.getControlPanelFrame(this.rightDoorClosed, this.rightLightOn);

    if (this.leftControlPanelSprite) {
      await this.leftControlPanelSprite.showFrame(leftFrame);
    }

    if (this.rightControlPanelSprite) {
      await this.rightControlPanelSprite.showFrame(rightFrame);
    }
  }

  async onLeftLightHitboxClick() {
    if (this.isPowerOut) return;

    if (this.leftControlsBroken) {
      this.playErrorButtonSound();
      return;
    }

    if (this.isLeftLightAnimating) return;

    this.isLeftLightAnimating = true;

    try {
      const nextState = !this.leftLightOn;

      this.leftThreatSoundPlayed = false;

      this.leftLightOn = nextState;
      this.rightLightOn = false;

      if (nextState) {
        this.rightThreatSoundPlayed = false;
      }

      await this.updateControlPanels();
      await this.updateNightHud();
      await this.refreshOfficeLight();
    } finally {
      this.isLeftLightAnimating = false;
    }
  }

  async onRightLightHitboxClick() {
    if (this.isPowerOut) return;

    if (this.rightControlsBroken) {
      this.playErrorButtonSound();
      return;
    }

    if (this.isRightLightAnimating) return;

    this.isRightLightAnimating = true;

    try {
      const nextState = !this.rightLightOn;

      this.rightThreatSoundPlayed = false;

      this.rightLightOn = nextState;
      this.leftLightOn = false;

      if (nextState) {
        this.leftThreatSoundPlayed = false;
      }

      await this.updateControlPanels();
      await this.updateNightHud();
      await this.refreshOfficeLight();
    } finally {
      this.isRightLightAnimating = false;
    }
  }

  ensureDoorToggleSound() {
    if (!Sounds.has(NightAssetIds.DOOR_TOGGLE_SOUND)) {
      Sounds.add(NightAssetIds.DOOR_TOGGLE_SOUND, NightAssetPaths.DOOR_TOGGLE_SOUND, {
        loop: false,
        volume: 0.4
      });
    }
  }

  playDoorToggleSound() {
    if (!NightAssetPaths.DOOR_TOGGLE_SOUND) return;

    this.ensureDoorToggleSound();
    Sound.play(NightAssetIds.DOOR_TOGGLE_SOUND);
  }

  ensureLightSounds() {
    if (!NightAssetPaths.LIGHT_ON_SOUND) return;

    if (!Sounds.has(NightAssetIds.LIGHT_ON_SOUND)) {
      Sounds.add(NightAssetIds.LIGHT_ON_SOUND, NightAssetPaths.LIGHT_ON_SOUND, {
        loop: false,
        volume: 0.35
      });
    }
  }

  playLightOnSound() {
    if (!NightAssetPaths.LIGHT_ON_SOUND) return;
    this.ensureLightSounds();
    Sound.stop(NightAssetIds.LIGHT_ON_SOUND);
    Sound.play(NightAssetIds.LIGHT_ON_SOUND);
  }

  stopLightSound() {
    if (!Sounds.has(NightAssetIds.LIGHT_ON_SOUND)) return;
    Sound.stop(NightAssetIds.LIGHT_ON_SOUND);
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

  async showOfficeBonnieAtDoor() {
    if (!this.officeLightSprite) return;

    // ВСТАВЬ НУЖНЫЙ КАДР BONNIE У ЛЕВОЙ ДВЕРИ
    const frameIndex = 2;
    await this.officeLightSprite.showFrame(frameIndex);
    this.playLightOnSound();
  }

  async showOfficeChicaAtDoor() {
    if (!this.officeLightSprite) return;

    const frameIndex = 3;
    await this.officeLightSprite.showFrame(frameIndex);
    this.playLightOnSound();
  }

  async refreshOfficeLight() {
    if (this.leftControlsBroken && this.leftLightOn) {
      this.leftLightOn = false;
    }

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
    const threat = this.getDoorThreatBySide(this.activeLightSide);

    if (threat) {
      await this.showDoorThreatBySide(threat);

      if (threat.side === 'left') {
        if (!this.leftThreatSoundPlayed && !threat.doorClosed) {
          this.leftThreatSoundPlayed = true;
          this.playDoorScareSound({
            animatronicId: threat.animatronicId,
            side: threat.side
          });
        }
      }

      if (threat.side === 'right') {
        if (!this.rightThreatSoundPlayed) {
          this.rightThreatSoundPlayed = true;
          this.playDoorScareSound({
            animatronicId: threat.animatronicId,
            side: threat.side
          });
        }
      }

      return;
    }

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
    if (this.isPowerOut) return;

    console.log('open monitor');
    await this.openMonitor();
  }

  async openMonitor() {
    if (this.isMonitorAnimating || this.isMonitorOpen || !this.monitorTransitionSprite) return;

    this.lookDirection = 0;
    this.lookSpeedMultiplier = 0;
    this.stopLookMovement();

    const officeUiLayer = document.getElementById('office-ui-layer');
    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');
    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    this.isMonitorAnimating = true;

    const officeThreatId = this.getLastOfficeThreat();
    if (officeThreatId) {
      this.startOfficeMonitorPunishTimer(officeThreatId);
    }

    if (monitorTransitionLayer) monitorTransitionLayer.hidden = false;
    
    this.playMonitorToggleSound();

    await this.monitorTransitionSprite.playOnce({
      fromFrame: 0,
      toFrame: this.monitorTransitionSprite.totalFrames - 1,
      holdLastFrame: true
    });

    this.setFanHumVolume(0.1);

    await this.applyResolvedStateToCurrentCamera();

    if (officeUiLayer) officeUiLayer.hidden = true;
    if (monitorTransitionLayer) monitorTransitionLayer.hidden = true;
    if (monitorScreenLayer) monitorScreenLayer.hidden = false;
    if (monitorUiLayer) monitorUiLayer.hidden = false;

    await this.cameraSystem.startStatic();

    this.isMonitorOpen = true;  
    await this.updateNightHud();
    this.isMonitorAnimating = false;
    await this.cameraSystem.playBlinkEffect();
    this.refreshAnimatronicMoveSoundMix();
    this.refreshKitchenSoundLoop();
  }

  async closeMonitor() {
    const officeThreatId = this.getLastOfficeThreat();
    const hasOfficeThreat = Boolean(officeThreatId);

    if (hasOfficeThreat) {
      this.clearAllThreatTimers();
    }

    if (this.isMonitorAnimating || !this.isMonitorOpen || !this.monitorTransitionSprite) return;

    const officeUiLayer = document.getElementById('office-ui-layer');
    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');
    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    this.isMonitorAnimating = true;

    if (!hasOfficeThreat && !this.isGameOver) {
      this.rareEventManager?.rollForCamera(this.currentCameraId);
    }

    if (hasOfficeThreat) {
      this.prepareForOfficeJumpscare();
    }

    if (monitorScreenLayer) monitorScreenLayer.hidden = true;
    if (monitorUiLayer) monitorUiLayer.hidden = true;
    if (monitorTransitionLayer) monitorTransitionLayer.hidden = false;
    if (officeUiLayer) officeUiLayer.hidden = false;

    await this.cameraSystem.stopStatic();

    this.playMonitorToggleSound();
    this.setFanHumVolume(0.2);

    this.isMonitorOpen = false;
    await this.updateNightHud();

    const closePromise = this.monitorTransitionSprite.playOnceReverse({
      fromFrame: this.monitorTransitionSprite.totalFrames - 1,
      toFrame: 0,
      holdLastFrame: true,
      clearOnFinish: false
    });

    if (hasOfficeThreat) {
      await this.triggerGameOverByAnimatronic(officeThreatId, {
        hideHud: true,
        keepMonitorTransitionVisible: true,
        soundDelayMs: 40,
        closePromise
      });
      return;
    }

    await closePromise;

    if (monitorTransitionLayer) {
      monitorTransitionLayer.hidden = true;
    }

    this.isMonitorAnimating = false;
    this.refreshAnimatronicMoveSoundMix();
    this.refreshKitchenSoundLoop();
  }

  async onMonitorCloseMouseEnter() {
    if (this.isPowerOut) return;
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

  ensureMonitorSounds() {
    if (NightAssetPaths.MONITOR_TOGGLE_SOUND && !Sounds.has(NightAssetIds.MONITOR_TOGGLE_SOUND)) {
      Sounds.add(NightAssetIds.MONITOR_TOGGLE_SOUND, NightAssetPaths.MONITOR_TOGGLE_SOUND, {
        loop: false,
        volume: 0.45
      });
    }
  }

  playMonitorToggleSound() {
    this.ensureMonitorSounds();
    if (Sounds.has(NightAssetIds.MONITOR_TOGGLE_SOUND)) {
      Sound.stop(NightAssetIds.MONITOR_TOGGLE_SOUND);
      Sound.playOnce(NightAssetIds.MONITOR_TOGGLE_SOUND);
    }
  }

  setFanHumVolume(volume) {
    if (!Sounds.has(NightAssetIds.FAN_HUM_SOUND)) return;

    Sound.setVolume(NightAssetIds.FAN_HUM_SOUND, volume);
  }

  async onCameraButtonClick(event) {
    if (this.isPowerOut) return;

    if (!this.cameraSystem || this.isMonitorAnimating || !this.isMonitorOpen) return;

    const button = event.currentTarget;
    if (!button) return;

    const cameraId = button.id
      .replace('cam-btn-', '')
      .toUpperCase();

    const initialState = this.getResolvedCameraStateFor(cameraId);

    await this.cameraSystem.setCurrentCamera(cameraId, initialState);
    
    this.currentCameraId = this.cameraSystem.currentCameraId;

    this.refreshAnimatronicMoveSoundMix();
    this.refreshKitchenSoundLoop();

    await this.cameraStateResolver?.updateCurrentCameraView();
  }

  ensureCameraBlinkSound() {
    if (!Sounds.has(TransitionAssetIds.BLIP)) {
      Sounds.add(TransitionAssetIds.BLIP, TransitionAssets.BLIP, {
        loop: false,
        volume: 0.3
      });
    }
  }

  playCameraBlinkSound() {
    this.ensureCameraBlinkSound();
    Sound.stop(TransitionAssetIds.BLIP);
    Sound.play(TransitionAssetIds.BLIP, { volume: 0.3 });
  }

  ensureErrorButtonSound() {
    if (!NightAssetPaths.ERROR_BUTTON_SOUND) return;

    if (!Sounds.has(NightAssetIds.ERROR_BUTTON_SOUND)) {
      Sounds.add(NightAssetIds.ERROR_BUTTON_SOUND, NightAssetPaths.ERROR_BUTTON_SOUND, {
        loop: false,
        volume: 0.5
      });
    }
  }

  playErrorButtonSound() {
    if (!NightAssetPaths.ERROR_BUTTON_SOUND) return;

    this.ensureErrorButtonSound();
    Sound.stop(NightAssetIds.ERROR_BUTTON_SOUND);
    Sound.play(NightAssetIds.ERROR_BUTTON_SOUND);
  }

  prepareForOfficeJumpscare() {
    this.lookDirection = 0;
    this.lookSpeedMultiplier = 0;
    this.stopLookMovement();

    this.setOfficeOffset(0);

    const officeViewport = document.getElementById('office-viewport');
    if (officeViewport) {
      officeViewport.removeEventListener('mousemove', this.onOfficeViewportMouseMove);
      officeViewport.removeEventListener('mouseleave', this.onOfficeViewportMouseLeave);
    }
  }

  restoreOfficeLookControls() {
    const officeViewport = document.getElementById('office-viewport');
    if (officeViewport) {
      officeViewport.addEventListener('mousemove', this.onOfficeViewportMouseMove);
      officeViewport.addEventListener('mouseleave', this.onOfficeViewportMouseLeave);
    }
  }

  disableGameplayForJumpscare({
    hideHud = false,
    disableMonitorToggle = true,
    stopAmbientSounds = true,
    clearMonitorView = false,
    keepMonitorTransitionVisible = false
  } = {}) {
    this.lookDirection = 0;
    this.lookSpeedMultiplier = 0;
    this.stopLookMovement();

    this.clearAllThreatTimers();  
    this.stopNightClock();
    this.stopPowerDrain();
    this.clearLightFlicker();
    this.stopKitchenSoundLoop();

    if (stopAmbientSounds) {
      this.stopPhoneGuy();
      this.stopBackgroundAmbience();
      this.stopFanHum();
    }

    this.animatronicMovementManager?.stopAll();
    this.cameraSystem?.stopStatic();

    const officeViewport = document.getElementById('office-viewport');
    if (officeViewport) {
      officeViewport.removeEventListener('mousemove', this.onOfficeViewportMouseMove);
      officeViewport.removeEventListener('mouseleave', this.onOfficeViewportMouseLeave);
    }

    const monitorToggleCanvas = document.getElementById('monitor-toggle-canvas');
    const monitorCloseCanvas = document.getElementById('monitor-close-canvas');
    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    if (disableMonitorToggle && monitorToggleCanvas) {
      monitorToggleCanvas.hidden = true;
      monitorToggleCanvas.style.display = 'none';
      monitorToggleCanvas.style.pointerEvents = 'none';
    }

    if (monitorCloseCanvas) {
      monitorCloseCanvas.style.pointerEvents = 'none';
    }

    if (clearMonitorView) {
      if (monitorScreenLayer) monitorScreenLayer.hidden = true;
      if (monitorUiLayer) monitorUiLayer.hidden = true;
    }

    this.isMonitorOpen = false;

    if (hideHud) {
      this.setHudVisible(false);
    }
  }

  setHudVisible(isVisible) {
    const officeUiLayer = document.getElementById('office-ui-layer');
    if (officeUiLayer) {
      officeUiLayer.hidden = !isVisible;
    }
  }

  setMonitorToggleVisible(isVisible) {
    const monitorToggleCanvas = document.getElementById('monitor-toggle-canvas');
    if (!monitorToggleCanvas) return;

    monitorToggleCanvas.hidden = !isVisible;
    monitorToggleCanvas.style.display = isVisible ? 'block' : 'none';
    monitorToggleCanvas.style.pointerEvents = isVisible ? 'auto' : 'none';
  }

  async goToGameOver() {
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
          enabled: true,
          from: 0,
          to: 1,
          duration: 600
        },
        fadeOut: {
          enabled: false,
          from: 1,
          to: 1,
          duration: 0
        }
      },
      confirm: {
        mode: 'auto',
        minDuration: 1000
      }
    });

    const menuScene = new MenuScene(this.game);
    menuScene.setEntryMode('return');

    await this.game.state.change(SceneNames.MENU, menuScene);
  }

  getResolvedCameraStateFor(cameraId) {
    const baseState = this.cameraStateResolver?.getInitialStateForCamera(cameraId) ?? null;
    if (!baseState) return null;

    const rareState = this.rareEventManager?.resolveRareState({
      cameraId,
      baseState
    });

    return rareState ?? baseState;
  }

  async applyResolvedStateToCurrentCamera() {
    if (!this.cameraSystem) return;

    const cameraId = this.cameraSystem.currentCameraId;
    if (!cameraId) return;

    const finalState = this.getResolvedCameraStateFor(cameraId);
    if (!finalState) return;

    await this.cameraSystem.setCurrentState(finalState);
  }

  pauseNightForVictory() {
    this.lookDirection = 0;
    this.lookSpeedMultiplier = 0;
    this.stopLookMovement();

    this.clearAllThreatTimers();
    this.stopNightClock();
    this.stopPowerDrain();
    this.clearLightFlicker();
    this.stopKitchenSoundLoop();

    this.animatronicMovementManager?.stopAll();
    this.cameraSystem?.stopStatic();

    this.stopPhoneGuy();
    this.stopBackgroundAmbience();
    this.stopFanHum();

    if (this.fanSprite) {
      this.fanSprite.stop({ clear: false });
    }

    const officeViewport = document.getElementById('office-viewport');
    if (officeViewport) {
      officeViewport.removeEventListener('mousemove', this.onOfficeViewportMouseMove);
      officeViewport.removeEventListener('mouseleave', this.onOfficeViewportMouseLeave);
    }

    const monitorToggleCanvas = document.getElementById('monitor-toggle-canvas');
    const monitorCloseCanvas = document.getElementById('monitor-close-canvas');
    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const monitorUiLayer = document.getElementById('monitor-ui-layer');
    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');

    if (monitorToggleCanvas) {
      monitorToggleCanvas.hidden = true;
      monitorToggleCanvas.style.display = 'none';
      monitorToggleCanvas.style.pointerEvents = 'none';
    }

    if (monitorCloseCanvas) {
      monitorCloseCanvas.style.pointerEvents = 'none';
    }

    if (monitorScreenLayer) monitorScreenLayer.hidden = true;
    if (monitorUiLayer) monitorUiLayer.hidden = true;
    if (monitorTransitionLayer) monitorTransitionLayer.hidden = true;

    this.isMonitorOpen = false;
    this.isMonitorAnimating = false;

    this.setHudVisible(false);
  }

  async triggerVictorySequence() {
    if (this.isVictorySequencePlaying) return;

    this.isVictorySequencePlaying = true;
    this.isNightComplete = true;
    this.isGameOver = false;

    if (this.jumpscareManager) {
      this.jumpscareManager.stop({ clear: true });
    }

    this.pauseNightForVictory();

    const currentNight = this.config?.nightNumber ?? GameProgress.getCurrentNight() ?? 1;
    const nextNight = currentNight + 1;
    GameProgress.setCurrentNight(nextNight);

    await LoadingScreen.playVictorySequence({
      startHour: 5,
      endHour: 6,
      bellSoundId: NightAssetIds.VICTORY_BELLS_SOUND,
      cheerSoundId: NightAssetIds.VICTORY_KIDS_CHEER_SOUND
    });

    this.isVictorySequencePlaying = false;

    const menuScene = new MenuScene(this.game);
    menuScene.setEntryMode('return');

    await this.game.state.change(SceneNames.MENU, menuScene);
  }

  setThreatTimer(key, callback, delay) {
    this.clearThreatTimer(key);

    const timerId = setTimeout(async () => {
      this.threatTimers.delete(key);
      await callback();
    }, delay);

    this.threatTimers.set(key, timerId);
    return timerId;
  }

  clearThreatTimer(key) {
    const timerId = this.threatTimers.get(key);
    if (!timerId) return;

    clearTimeout(timerId);
    this.threatTimers.delete(key);
  }

  clearAllThreatTimers() {
    for (const timerId of this.threatTimers.values()) {
      clearTimeout(timerId);
    }

    this.threatTimers.clear();
  }

  refreshAnimatronicMoveSoundMix() {
    this.animatronicMovementManager?.refreshMoveSoundMix({
      currentCameraId: this.currentCameraId,
      isMonitorOpen: this.isMonitorOpen
    });
  }

  getDoorThreatBySide(side) {
    if (side === 'left') {
      const bonnieState = this.animatronicStateManager?.get('bonnie');
      const isAtDoor = bonnieState?.currentNode === 'office-attack';

      if (isAtDoor) {
        return {
          animatronicId: 'bonnie',
          side: 'left',
          doorClosed: this.leftDoorClosed
        };
      }
    }

    if (side === 'right') {
      const chicaState = this.animatronicStateManager?.get('chica');
      const isAtDoor = chicaState?.currentNode === 'office-attack';

      if (isAtDoor) {
        return {
          animatronicId: 'chica',
          side: 'right',
          doorClosed: this.rightDoorClosed
        };
      }
    }

    return null;
  }

  async showDoorThreatBySide(threat) {
    if (!threat) return false;

    if (threat.animatronicId === 'bonnie' && threat.side === 'left') {
      await this.showOfficeBonnieAtDoor();
      return true;
    }

    if (threat.animatronicId === 'chica' && threat.side === 'right') {
      await this.showOfficeChicaAtDoor?.();
      return true;
    }

    return false;
  }

  ensureDoorScareSound() {
    if (!NightAssetPaths.DOOR_SCARE_SOUND) return null;

    if (!Sounds.has(NightAssetIds.DOOR_SCARE_SOUND)) {
      Sounds.add(NightAssetIds.DOOR_SCARE_SOUND, NightAssetPaths.DOOR_SCARE_SOUND, {
        loop: false,
        volume: 0.7
      });
    }

    return NightAssetIds.DOOR_SCARE_SOUND;
  }

  playDoorScareSound({ animatronicId, side } = {}) {
    const soundId = this.ensureDoorScareSound();
    if (!soundId) return;

    const cooldownKey = `${animatronicId}:${side}`;
    const now = performance.now();
    const cooldownMs = 1200;

    const lastAt = this.doorScareCooldowns.get(cooldownKey) ?? 0;
    if (now - lastAt < cooldownMs) return;

    this.doorScareCooldowns.set(cooldownKey, now);

    Sound.stop(soundId);
    Sound.play(soundId, { volume: 0.75 });

    console.log(`[door-scare] ${animatronicId} side=${side}`);
  }

  isKitchenOccupied() {
    const chicaInKitchen = this.animatronicStateManager?.get('chica')?.currentNode === '6';
    const freddyInKitchen = this.animatronicStateManager?.get('freddy')?.currentNode === '6';

    return chicaInKitchen || freddyInKitchen;
  }

  getKitchenVolume() {
    return this.isMonitorOpen && this.currentCameraId === '6' ? 0.6 : 0.11;
  }

  stopKitchenSoundLoop() {
    if (this.kitchenSoundTimeoutId) {
      clearTimeout(this.kitchenSoundTimeoutId);
      this.kitchenSoundTimeoutId = null;
    }

    for (const soundId of this.kitchenSoundIds) {
      if (Sounds.has(soundId)) {
        Sound.stop(soundId);
      }
    }

    this.activeKitchenSoundId = null;
  }

  pickNextKitchenSoundId() {
    const pool = this.kitchenSoundIds.filter((id) => id !== this.lastKitchenSoundId);
    if (!pool.length) return this.kitchenSoundIds[0] ?? null;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  scheduleNextKitchenSound() {
    if (!this.isKitchenOccupied()) {
      this.stopKitchenSoundLoop();
      return;
    }

    const nextSoundId = this.pickNextKitchenSoundId();
    if (!nextSoundId) return;

    this.activeKitchenSoundId = nextSoundId;
    this.lastKitchenSoundId = nextSoundId;

    const sound = Sound.play(nextSoundId, { volume: this.getKitchenVolume() });

    const durationMs =
      sound && typeof sound.duration === 'function'
        ? Math.max(0, sound.duration() * 1000)
        : 0;

    this.kitchenSoundTimeoutId = setTimeout(() => {
      this.activeKitchenSoundId = null;
      this.scheduleNextKitchenSound();
    }, durationMs > 0 ? durationMs : 300);
  }

  refreshKitchenSoundLoop() {
    if (!this.isKitchenOccupied()) {
      this.stopKitchenSoundLoop();
      return;
    }

    if (!this.activeKitchenSoundId) {
      this.scheduleNextKitchenSound();
      return;
    }

    Sound.setVolume(this.activeKitchenSoundId, this.getKitchenVolume());
  }

  getAnimatronicOfficeSide(animatronicId) {
    if (animatronicId === 'bonnie') return 'left';
    if (animatronicId === 'chica') return 'right';
    return null;
  }

  isAnimatronicInOffice(animatronicId) {
    return this.animatronicStateManager?.get(animatronicId)?.attackPhase === 'in-office';
  }

  getLastOfficeThreat() {
    const lastId = this.lastOfficeIntruderId;

    if (lastId && this.isAnimatronicInOffice(lastId)) {
      return lastId;
    }

    if (this.isAnimatronicInOffice('chica')) return 'chica';
    if (this.isAnimatronicInOffice('bonnie')) return 'bonnie';

    return null;
  }

  startOfficeMonitorPunishTimer(animatronicId) {
    this.stopOfficeMonitorPunishTimer();

    if (!this.isAnimatronicInOffice(animatronicId)) return;

    this.setThreatTimer('office-monitor-punish', async () => {
      const activeThreatId = this.getLastOfficeThreat();
      if (!activeThreatId || !this.isMonitorOpen) return;

      await this.forceCloseMonitorAndJumpscare(activeThreatId);
    }, 30000);
  }

  stopOfficeMonitorPunishTimer() {
    this.clearThreatTimer('office-monitor-punish');
  }

  async forceCloseMonitorAndJumpscare(animatronicId) {
    if (this.isMonitorAnimating) return;

    if (this.isMonitorOpen) {
      await this.closeMonitor();
      return;
    }

    await this.triggerGameOverByAnimatronic(animatronicId, {
      hideHud: true,
      keepMonitorTransitionVisible: true,
      soundDelayMs: 40,
      closePromise: Promise.resolve()
    });
  }

  async closeMonitorForPowerOut() {
    if (this.isMonitorAnimating || !this.isMonitorOpen || !this.monitorTransitionSprite) return;

    const officeUiLayer = document.getElementById('office-ui-layer');
    const monitorTransitionLayer = document.getElementById('monitor-transition-layer');
    const monitorScreenLayer = document.getElementById('monitor-screen-layer');
    const monitorUiLayer = document.getElementById('monitor-ui-layer');

    this.isMonitorAnimating = true;

    if (monitorScreenLayer) monitorScreenLayer.hidden = true;
    if (monitorUiLayer) monitorUiLayer.hidden = true;
    if (monitorTransitionLayer) monitorTransitionLayer.hidden = false;
    if (officeUiLayer) officeUiLayer.hidden = true;

    await this.cameraSystem?.stopStatic();

    this.isMonitorOpen = false;
    await this.updateNightHud();

    await this.monitorTransitionSprite.playOnceReverse({
      fromFrame: this.monitorTransitionSprite.totalFrames - 1,
      toFrame: 0,
      holdLastFrame: true,
      clearOnFinish: false
    });

    if (monitorTransitionLayer) {
      monitorTransitionLayer.hidden = true;
    }

    this.isMonitorAnimating = false;
  }

  async triggerPowerOut() {
    if (this.isPowerOut || this.isGameOver || this.isNightComplete || this.isVictorySequencePlaying) {
      return;
    }

    this.isPowerOut = true;
    await this.powerOutManager?.start();
  }

  stopAllNightSfx() {
    this.stopPhoneGuy();
    this.stopBackgroundAmbience();
    this.stopFanHum();
    this.stopKitchenSoundLoop();
    this.stopLightSound();
  }

  async forceOpenDoorsForPowerOut() {
    const tasks = [];

    if (this.leftDoorClosed && this.leftDoorSprite && !this.isLeftDoorAnimating) {
      this.isLeftDoorAnimating = true;
      this.leftDoorClosed = false;

      tasks.push(
        this.leftDoorSprite.playOnceReverse({
          fromFrame: this.leftDoorSprite.totalFrames - 1,
          toFrame: 0,
          holdLastFrame: true
        }).finally(() => {
          this.isLeftDoorAnimating = false;
        })
      );
    }

    if (this.rightDoorClosed && this.rightDoorSprite && !this.isRightDoorAnimating) {
      this.isRightDoorAnimating = true;
      this.rightDoorClosed = false;

      tasks.push(
        this.rightDoorSprite.playOnceReverse({
          fromFrame: this.rightDoorSprite.totalFrames - 1,
          toFrame: 0,
          holdLastFrame: true
        }).finally(() => {
          this.isRightDoorAnimating = false;
        })
      );
    }

    if (tasks.length > 0) {
      this.playDoorToggleSound();
      await Promise.all(tasks);
    }
  }

  async setOfficeVisualState(state = 'base') {
    if (!this.officeBaseSprite) return;

    if (state === 'power-out') {
      await this.officeBaseSprite.setSourceById(NightAssetIds.OFFICE_FREDDY, {
        showFrame: 0
      });
      return;
    }

    await this.officeBaseSprite.setSourceById(NightAssetIds.OFFICE_BASE, {
      showFrame: 0
    });
  }

  hideOfficeSidePanels() {
    const leftPanelCanvas = document.getElementById('office-left-panel-canvas');
    const rightPanelCanvas = document.getElementById('office-right-panel-canvas');

    if (this.leftControlPanelSprite) {
      this.leftControlPanelSprite.stop({ clear: true });
    }

    if (this.rightControlPanelSprite) {
      this.rightControlPanelSprite.stop({ clear: true });
    }

    if (leftPanelCanvas) {
      leftPanelCanvas.style.display = 'none';
    }

    if (rightPanelCanvas) {
      rightPanelCanvas.style.display = 'none';
    }
  }

  async showOfficeSidePanels() {
    const leftPanelCanvas = document.getElementById('office-left-panel-canvas');
    const rightPanelCanvas = document.getElementById('office-right-panel-canvas');

    if (leftPanelCanvas) {
      leftPanelCanvas.style.display = 'block';
    }

    if (rightPanelCanvas) {
      rightPanelCanvas.style.display = 'block';
    }

    await this.updateControlPanels();
  }

  ensurePowerOutOverlay() {
    let overlay = document.getElementById('office-powerout-overlay');
    if (overlay) {
      this.powerOutOverlayEl = overlay;
      return overlay;
    }

    const officeLayer = document.getElementById('office-layer') ?? document.getElementById('game-screen');
    if (!officeLayer) return null;

    overlay = document.createElement('div');
    overlay.id = 'office-powerout-overlay';

    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      background: '#000',
      opacity: '0',
      display: 'none',
      pointerEvents: 'none',
      zIndex: '20',
      transition: 'opacity 300ms linear'
    });

    officeLayer.appendChild(overlay);
    this.powerOutOverlayEl = overlay;
    return overlay;
  }

  setPowerOutOverlayVisible(isVisible, opacity = 1) {
    const overlay = this.ensurePowerOutOverlay();
    if (!overlay) return;

    if (!isVisible) {
      overlay.style.opacity = '0';
      overlay.style.display = 'none';
      return;
    }

    overlay.style.display = 'block';
    overlay.style.opacity = String(opacity);
  }

  async setPowerOutFreddyFrame(frame = 0) {
    if (!this.officeBaseSprite) return;
    await this.officeBaseSprite.showFrame(frame);
  }

  startPowerOutFreddyBlink() {
    this.stopPowerOutFreddyBlink();

    const tick = async () => {
      if (!this.isPowerOut) return;

      this.powerOutFreddyBlinkFrame = this.powerOutFreddyBlinkFrame === 0 ? 1 : 0;
      await this.setPowerOutFreddyFrame(this.powerOutFreddyBlinkFrame);

      const nextDelay = 120 + Math.floor(Math.random() * 260);

      this.powerOutFreddyBlinkTimeout = setTimeout(() => {
        tick();
      }, nextDelay);
    };

    this.powerOutFreddyBlinkFrame = 0;
    this.setPowerOutFreddyFrame(0);

    const firstDelay = 180 + Math.floor(Math.random() * 240);
    this.powerOutFreddyBlinkTimeout = setTimeout(() => {
      tick();
    }, firstDelay);
  }

  stopPowerOutFreddyBlink() {
    if (this.powerOutFreddyBlinkTimeout) {
      clearTimeout(this.powerOutFreddyBlinkTimeout);
      this.powerOutFreddyBlinkTimeout = null;
    }

    this.powerOutFreddyBlinkFrame = 0;
  }

  ensureFreddyPowerOutMusicSound() {
    if (!NightAssetPaths.FREDDY_POWEROUT_MUSIC_SOUND) return false;

    if (!Sounds.has(NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND)) {
      Sounds.add(
        NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND,
        NightAssetPaths.FREDDY_POWEROUT_MUSIC_SOUND,
        {
          loop: false,
          volume: 0.8
        }
      );
    }

    return true;
  }

  playFreddyPowerOutMusic() {
    if (!this.ensureFreddyPowerOutMusicSound()) return;

    Sound.stop(NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND);
    Sound.play(NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND);
  }

  stopFreddyPowerOutMusic() {
    if (!Sounds.has(NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND)) return;
    Sound.stop(NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND);
  }

  playFreddyPowerOutStepSound() {
    if (this.isFreddyPowerOutMusicPlaying()) return;

    if (!NightAssetIds.ANIMATRONIC_MOVE_SOUND) return;
    if (!Sounds.has(NightAssetIds.ANIMATRONIC_MOVE_SOUND)) return;

    Sound.stop(NightAssetIds.ANIMATRONIC_MOVE_SOUND);
    Sound.play(NightAssetIds.ANIMATRONIC_MOVE_SOUND, { volume: 0.55 });
  }

  isFreddyPowerOutMusicPlaying() {
    const sound = Sounds.get(NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND);
    return Boolean(sound?.playing?.());
  }

  async triggerFreddyPowerOutJumpscare() {
    if (this.isGameOver || this.isNightComplete || this.isVictorySequencePlaying) return;
    if (!this.jumpscareManager) return;

    this.isGameOver = true;

    this.disableGameplayForJumpscare({
      hideHud: true,
      disableMonitorToggle: true,
      stopAmbientSounds: true,
      clearMonitorView: true
    });

    this.stopPowerOutFreddyBlink();
    this.stopFreddyPowerOutMusic();
    this.setPowerOutOverlayVisible(false);

    this.setJumpscareCanvasScreenSpace();
    
    await this.jumpscareManager.play({
      imageId: NightAssetIds.FREDDY_JUMPSCARE_ALT,
      soundId: NightAssetIds.JUMPSCARE_SOUND,
      soundDelayMs: 40,
      frameWidth: 1280,
      frameHeight: 720,
      direction: 'vertical',
      fps: 25,
      hideOnStop: false
    });

    await this.goToGameOver();
  }

  setJumpscareCanvasWorldSpace() {
    const jumpscareCanvas = document.getElementById('jumpscare-canvas');
    const officeWorld = document.getElementById('office-world');

    if (!jumpscareCanvas || !officeWorld) return;

    const worldWidth = Math.round(officeWorld.offsetWidth);
    const worldHeight = Math.round(officeWorld.offsetHeight);

    jumpscareCanvas.width = worldWidth;
    jumpscareCanvas.height = worldHeight;

    jumpscareCanvas.style.width = `${worldWidth}px`;
    jumpscareCanvas.style.height = `${worldHeight}px`;

    jumpscareCanvas.style.left = '';
    jumpscareCanvas.style.top = '';
    jumpscareCanvas.style.right = '';
    jumpscareCanvas.style.bottom = '';
    jumpscareCanvas.style.inset = '';
    jumpscareCanvas.style.transform = '';
  }

  setJumpscareCanvasScreenSpace() {
    const jumpscareCanvas = document.getElementById('jumpscare-canvas');
    const officeViewport = document.getElementById('office-viewport');

    if (!jumpscareCanvas || !officeViewport) return;

    const screenWidth = Math.round(officeViewport.offsetWidth);
    const screenHeight = Math.round(officeViewport.offsetHeight);

    jumpscareCanvas.width = screenWidth;
    jumpscareCanvas.height = screenHeight;

    jumpscareCanvas.style.width = `${screenWidth}px`;
    jumpscareCanvas.style.height = `${screenHeight}px`;

    jumpscareCanvas.style.position = 'absolute';
    jumpscareCanvas.style.left = '0';
    jumpscareCanvas.style.top = '0';
    jumpscareCanvas.style.inset = '0';
    jumpscareCanvas.style.transform = 'none';
  }

}   

export default NightScene;