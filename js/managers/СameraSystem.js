import AnimatedSprite from '../AnimatedSprite.js';
import { cameraConfigs } from '../config/CameraConfig.js';

class CameraSystem {
  constructor(options = {}) {
    this.cameraWorld = options.cameraWorld ?? null;
    this.cameraWorldCanvas = options.cameraWorldCanvas ?? null;
    this.cameraNameText = options.cameraNameText ?? null;

    this.currentCameraId = options.initialCameraId ?? '1A';
    this.currentCameraState = options.initialCameraState ?? null;

    this.cameraOffsetX = 0;

    this.cameraSprite = null;
    this.specialAnimationSprite = null;

    this.cameraConfigs = cameraConfigs;
  }

  getCurrentConfig() {
    return this.cameraConfigs[this.currentCameraId] ?? null;
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

  setOffset(offsetX) {
    this.cameraOffsetX = offsetX;
    this.applyOffset();
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

    const frameIndex = this.getStateFrameIndex(config);
    await this.cameraSprite.showFrame(frameIndex);
  }

  async setCurrentCamera(cameraId, stateKey = null) {
    if (!this.cameraConfigs[cameraId]) return;

    this.currentCameraId = cameraId;

    const config = this.getCurrentConfig();
    this.currentCameraState = stateKey ?? this.getDefaultStateKey(config);

    this.applyViewportMode();
    this.updateCameraTitle();
    await this.createCameraSprite();
  }

  async setCurrentState(stateKey) {
    const config = this.getCurrentConfig();
    if (!config) return;

    this.currentCameraState = stateKey;

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

  async init() {
    this.applyViewportMode();
    this.updateCameraTitle();
    await this.createCameraSprite();
  }
}

export default CameraSystem;