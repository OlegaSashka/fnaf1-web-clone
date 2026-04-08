import AnimatedSprite from '../AnimatedSprite.js';
import { CameraConfigs } from '../config/CameraConfigs.js';
import { TransitionAssetIds } from '../config/TransitionAssets.js';
import { NightAssetIds } from '../config/NightAssets.js';
import Images from '../managers/ImageLibrary.js';
import { cameraButtonIds } from '../config/CameraConfigs.js';

import { CameraBehaviorConfigs } from '../config/CameraBehaviorConfigs.js';
import CameraBehaviorManager from './CameraBehaviorManager.js';

class CameraSystem {
  constructor(options = {}) {
    this.cameraWorld = options.cameraWorld ?? null;
    this.cameraWorldCanvas = options.cameraWorldCanvas ?? null;
    this.cameraNameText = options.cameraNameText ?? null;
    
    this.audioOnlyNoticeEl = options.audioOnlyNoticeEl ?? document.getElementById('monitor-audio-only-notice');

    this.currentCameraId = options.initialCameraId ?? '1A';
    this.currentCameraState = options.initialCameraState ?? null;

    this.cameraOffsetX = 0;

    this.autoOffsetSpeed = options.autoOffsetSpeed ?? 0.35;
    this.autoOffsetDirection = options.autoOffsetDirection ?? 1;
    this.autoOffsetRafId = null;

    this.autoOffsetPauseMinMs = options.autoOffsetPauseMinMs ?? 400;
    this.autoOffsetPauseMaxMs = options.autoOffsetPauseMaxMs ?? 1100;
    this.autoOffsetPauseUntil = 0;

    this.cameraStaticCanvas = options.cameraStaticCanvas ?? document.getElementById('camera-static-canvas');
    this.cameraBlinkCanvas = options.cameraBlinkCanvas ?? document.getElementById('camera-blink-canvas');;

    this.cameraStaticSprite = null;
    this.cameraBlinkSprite = null;

    this.onBlinkSound = options.onBlinkSound ?? null;

    this.cameraSprite = null;
    this.specialAnimationSprite = null;

    this.CameraConfigs = CameraConfigs;

    this.cameraBehaviorConfigs = options.cameraBehaviorConfigs ?? CameraBehaviorConfigs;
    this.cameraBehaviorManager = new CameraBehaviorManager({
      cameraSystem: this,
      behaviorConfigs: this.cameraBehaviorConfigs
    });
        
    this.cameraButtonIds = [...cameraButtonIds];
  }

  updateAudioOnlyNotice() {
    if (!this.audioOnlyNoticeEl) return;

    const shouldShow = this.currentCameraId === '6';
    this.audioOnlyNoticeEl.setAttribute('display', shouldShow ? 'block' : 'none');
  }

  startBehaviorForCurrentCamera() {
    const config = this.cameraBehaviorConfigs?.[this.currentCameraId];
    if (!config?.autoStart) return;

    const variantKey = config.defaultVariant ?? 'default';
    this.cameraBehaviorManager.start(this.currentCameraId, variantKey);
  }

  stopCurrentBehavior({ resetToFirstFrame = false } = {}) {
    if (!this.cameraBehaviorManager) return;
    this.cameraBehaviorManager.stop({ resetToFirstFrame });
  }

  setBehaviorVariant(cameraId, variantKey) {
    if (!this.cameraBehaviorManager) return;
    this.cameraBehaviorManager.setVariant(cameraId, variantKey);
  }

  resetBehaviorVariant(cameraId) {
    if (!this.cameraBehaviorManager) return;
    this.cameraBehaviorManager.resetVariant(cameraId);
  }

  async setupEffectSprites() {
      if (this.cameraBlinkCanvas && !this.cameraBlinkSprite) {
      this.cameraBlinkSprite = new AnimatedSprite(
        this.cameraBlinkCanvas,
        Images.get(NightAssetIds.MONITOR_BLINK),
        30,
        {
          frameWidth: 1280,
          frameHeight: 720,
          direction: 'vertical',
          drawX: 0,
          drawY: 0,
          drawWidth: this.cameraBlinkCanvas.width,
          drawHeight: this.cameraBlinkCanvas.height
        }
      );

      this.cameraBlinkSprite.clear();
    }

    if (this.cameraStaticCanvas && !this.cameraStaticSprite) {
      this.cameraStaticSprite = new AnimatedSprite(
        this.cameraStaticCanvas,
        Images.get(TransitionAssetIds.TV_NOISE),
        30,
        {
          frameWidth: 1280,
          frameHeight: 720,
          direction: 'vertical',
          drawX: 0,
          drawY: 0,
          drawWidth: this.cameraStaticCanvas.width,
          drawHeight: this.cameraStaticCanvas.height
        }
      );

      this.cameraStaticSprite.clear();
    }
  }

  async playBlinkEffect() {
    if (!this.cameraBlinkSprite) return;
    if (typeof this.onBlinkSound === 'function') {
      this.onBlinkSound();
    }

    await this.cameraBlinkSprite.playOnce({
      fromFrame: 0,
      toFrame: this.cameraBlinkSprite.totalFrames - 1,
      holdLastFrame: false,
      clearOnFinish: true
    });
  }

  async startStatic() {
    if (!this.cameraStaticSprite) return;
    await this.cameraStaticSprite.play();
  }

  stopStatic() {
    if (!this.cameraStaticSprite) return;
    this.cameraStaticSprite.stop({ clear: true });
  }

  getCurrentConfig() {
    return this.CameraConfigs[this.currentCameraId] ?? null;
  }

  getDefaultStateKey(config) {
    if (!config?.states) return null;

    if ('default' in config.states) return 'default';

    const keys = Object.keys(config.states);
    return keys[0] ?? null;
  }

  getStateFrameIndex(config, stateKey = null) {
    if (!config?.states) return 0;

    const finalStateKey = stateKey ?? this.currentCameraState ?? this.getDefaultStateKey(config);
    return config.states[finalStateKey] ?? 0;
  }

  updateCameraTitle() {
    if (!this.cameraNameText) return;

    const config = this.getCurrentConfig();
    this.cameraNameText.textContent = config?.name ?? '';
  }

  applyViewportMode() {
    const config = this.getCurrentConfig();
    if (!config || !this.cameraWorld) return;

    const viewportMode = config.viewportMode ?? 'world';

    if (viewportMode === 'screen') {
      this.cameraWorld.style.width = '100%';
      this.cameraWorld.style.left = '0';
      this.cameraWorld.style.transform = 'translateX(0)';
      return;
    }

    this.cameraWorld.style.width = '130%';
    this.cameraWorld.style.left = '50%';
    this.cameraWorld.style.transform = `translateX(calc(-50% + ${this.getAppliedOffset()}px))`;
  }

  getAppliedOffset() {
    const config = this.getCurrentConfig();
    if (!config) return 0;

    return config.useCameraOffset === false ? 0 : this.cameraOffsetX;
  }

  applyOffset() {
    const config = this.getCurrentConfig();
    if (!config || !this.cameraWorld) return;

    const viewportMode = config.viewportMode ?? 'world';

    if (viewportMode === 'screen') {
      this.cameraWorld.style.transform = 'translateX(0)';
      return;
    }

    this.cameraWorld.style.transform = `translateX(calc(-50% + ${this.getAppliedOffset()}px))`;
  }

  getMaxOffset() {
    const viewport = this.cameraWorld?.parentElement;
    const world = this.cameraWorld;

    if (!viewport || !world) return 0;

    return Math.max(0, (world.offsetWidth - viewport.offsetWidth) / 2);
  }

  setOffset(offsetX) {
    const maxOffset = this.getMaxOffset();
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, offsetX));

    this.cameraOffsetX = clampedOffset;
    this.applyOffset();
  }

 startAutoOffset() {
    if (this.autoOffsetRafId) return;

    const step = (time) => {
      const maxOffset = this.getMaxOffset();

      if (time < this.autoOffsetPauseUntil) {
        this.autoOffsetRafId = requestAnimationFrame(step);
        return;
      }

      if (maxOffset > 0) {
        const next = this.cameraOffsetX + this.autoOffsetSpeed * this.autoOffsetDirection;

        const pauseMs =
          this.autoOffsetPauseMinMs +
          Math.random() * (this.autoOffsetPauseMaxMs - this.autoOffsetPauseMinMs);

        if (next >= maxOffset) {
          this.cameraOffsetX = maxOffset;
          this.autoOffsetDirection = -1;
          this.autoOffsetPauseUntil = time + pauseMs;
        } else if (next <= -maxOffset) {
          this.cameraOffsetX = -maxOffset;
          this.autoOffsetDirection = 1;
          this.autoOffsetPauseUntil = time + pauseMs;
        } else {
          this.cameraOffsetX = next;
        }

        this.applyOffset();
      }

      this.autoOffsetRafId = requestAnimationFrame(step);
    };

    this.autoOffsetRafId = requestAnimationFrame(step);
  }

  stopAutoOffset() {
    if (this.autoOffsetRafId) {
      cancelAnimationFrame(this.autoOffsetRafId);
      this.autoOffsetRafId = null;
    }

    this.autoOffsetPauseUntil = 0;
  }

  async destroySprites() {
    if (this.cameraSprite) {
      this.cameraSprite.stop({ clear: true });
      this.cameraSprite = null;
    }

    if (this.specialAnimationSprite) {
      this.specialAnimationSprite.stop({ clear: true });
      this.specialAnimationSprite = null;
    }
  }

  async createCameraSprite() {
    const config = this.getCurrentConfig();
    if (!config || !this.cameraWorldCanvas) return;

    await this.destroySprites();

    if (!config.image) {
      this.fillBlack();
      return;
    }

    this.cameraSprite = new AnimatedSprite(
      this.cameraWorldCanvas,
      config.image,
      1,
      {
        frameWidth: config.frameWidth ?? 1600,
        frameHeight: config.frameHeight ?? 720,
        direction: config.direction ?? 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: this.cameraWorldCanvas.width,
        drawHeight: this.cameraWorldCanvas.height
      }
    );

    if (this.currentCameraState == null) {
      this.fillBlack();
      return;
    }

    const frameIndex = this.getStateFrameIndex(config, this.currentCameraState);
    await this.cameraSprite.showFrame(frameIndex);
  }

  async setCurrentCamera(cameraId, stateKey = null) {
    if (!this.CameraConfigs[cameraId] || this.currentCameraId === cameraId) return;

    this.stopCurrentBehavior({ resetToFirstFrame: false });

    this.currentCameraId = cameraId;

    const config = this.getCurrentConfig();
    this.currentCameraState = stateKey;

    this.applyViewportMode();
    this.updateCameraTitle();
    this.updateActiveCameraButton();

    this.updateAudioOnlyNotice();

    await Promise.all([
      this.playBlinkEffect(),
      this.createCameraSprite(),
    ]);
  
    this.startBehaviorForCurrentCamera();
  }

  updateActiveCameraButton() {
    for (const id of this.cameraButtonIds) {
      const btn = document.getElementById(id);
      if (!btn) continue;

      const buttonCameraId = id.replace('cam-btn-', '').toUpperCase();
      btn.classList.toggle('is-active', buttonCameraId === this.currentCameraId);
    }
  }

  async setCurrentState(stateKey) {
    const config = this.getCurrentConfig();
    if (!config) return;

    this.currentCameraState = stateKey;

    if (stateKey == null) {
      this.stopCurrentBehavior({ resetToFirstFrame: false });
      this.fillBlack();
      return;
    }

    if (!this.cameraSprite) {
      await this.createCameraSprite();
      return;
    }

    const frameIndex = this.getStateFrameIndex(config, stateKey);
    await this.cameraSprite.showFrame(frameIndex);
  }

  async playSpecialAnimation() {
    const config = this.getCurrentConfig();
    if (!config?.specialAnimation || !this.cameraWorldCanvas) return;

    const anim = config.specialAnimation;

    this.specialAnimationSprite = new AnimatedSprite(
      this.cameraWorldCanvas,
      anim.asset,
      anim.fps ?? 12,
      {
        frameWidth: anim.frameWidth ?? 1600,
        frameHeight: anim.frameHeight ?? 720,
        direction: anim.direction ?? 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: this.cameraWorldCanvas.width,
        drawHeight: this.cameraWorldCanvas.height
      }
    );

    await this.specialAnimationSprite.playOnce({
      fromFrame: 0,
      toFrame: this.specialAnimationSprite.totalFrames - 1,
      holdLastFrame: true
    });
  }

  fillBlack() {
    const ctx = this.cameraWorldCanvas?.getContext('2d');
    if (!ctx || !this.cameraWorldCanvas) return;

    ctx.clearRect(0, 0, this.cameraWorldCanvas.width, this.cameraWorldCanvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.cameraWorldCanvas.width, this.cameraWorldCanvas.height);
  }

  async restartBehaviorForCurrentCamera(variantKey = null) {
    const config = this.cameraBehaviorConfigs?.[this.currentCameraId];
    if (!config?.autoStart) return;

    this.stopCurrentBehavior({ resetToFirstFrame: false });

    const finalVariantKey = variantKey ?? config.defaultVariant ?? 'default';
    await this.cameraBehaviorManager.start(this.currentCameraId, finalVariantKey);
  }

  async init() {
    this.applyViewportMode();
    this.updateCameraTitle();
    await this.setupEffectSprites();
    await this.createCameraSprite();
    this.applyOffset();
    this.startAutoOffset();
    this.updateActiveCameraButton();
    this.updateAudioOnlyNotice();
    this.startBehaviorForCurrentCamera();
  }
}

export default CameraSystem;