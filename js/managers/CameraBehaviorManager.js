class CameraBehaviorManager {
  constructor({ cameraSystem, behaviorConfigs = {} } = {}) {
    this.cameraSystem = cameraSystem ?? null;
    this.behaviorConfigs = behaviorConfigs;
    this.activeCameraId = null;
    this.activeVariantKey = null;
    this.timeoutId = null;
    this.frameIndex = 0;
  }

  getConfig(cameraId) {
    return this.behaviorConfigs[cameraId] ?? null;
  }

  getVariantFrames(cameraId, variantKey) {
    const config = this.getConfig(cameraId);
    if (!config?.variants) return null;
    return config.variants[variantKey] ?? null;
  }

  getRandomInterval(min, max) {
    const safeMin = Math.max(0, Number(min) || 0);
    const safeMax = Math.max(safeMin, Number(max) || safeMin);
    return Math.floor(safeMin + Math.random() * (safeMax - safeMin + 1));
  }

  clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  async applyCurrentFrame() {
    if (!this.cameraSystem || !this.activeCameraId || !this.activeVariantKey) return;

    if (this.cameraSystem.currentCameraId !== this.activeCameraId) return;

    const frames = this.getVariantFrames(this.activeCameraId, this.activeVariantKey);
    if (!frames || frames.length < 2) return;

    const stateKey = frames[this.frameIndex];
    await this.cameraSystem.setCurrentState(stateKey);
  }

  scheduleNextTick() {
    const config = this.getConfig(this.activeCameraId);
    if (!config) return;

    const delay = this.getRandomInterval(config.intervalMinMs, config.intervalMaxMs);

    this.timeoutId = setTimeout(async () => {
      this.frameIndex = this.frameIndex === 0 ? 1 : 0;
      await this.applyCurrentFrame();
      this.scheduleNextTick();
    }, delay);
  }

  async start(cameraId, variantKey = null) {
    this.stop({ resetToFirstFrame: false });

    const config = this.getConfig(cameraId);
    if (!config) return;

    const finalVariantKey = variantKey ?? config.defaultVariant ?? 'default';
    const frames = this.getVariantFrames(cameraId, finalVariantKey);

    if (!frames || frames.length < 2) return;

    this.activeCameraId = cameraId;
    this.activeVariantKey = finalVariantKey;
    this.frameIndex = 0;

    if (config.restartFromFirstFrame !== false) {
      await this.applyCurrentFrame();
    }

    this.scheduleNextTick();
  }

  async setVariant(cameraId, variantKey) {
    const frames = this.getVariantFrames(cameraId, variantKey);
    if (!frames || frames.length < 2) return;

    await this.start(cameraId, variantKey);
  }

  async resetVariant(cameraId) {
    const config = this.getConfig(cameraId);
    if (!config) return;

    await this.start(cameraId, config.defaultVariant ?? 'default');
  }

  stop({ resetToFirstFrame = false } = {}) {
    const prevCameraId = this.activeCameraId;
    const prevVariantKey = this.activeVariantKey;

    this.clearTimer();

    this.activeCameraId = null;
    this.activeVariantKey = null;
    this.frameIndex = 0;

    if (!resetToFirstFrame || !this.cameraSystem || !prevCameraId || !prevVariantKey) return;

    if (this.cameraSystem.currentCameraId !== prevCameraId) return;

    const frames = this.getVariantFrames(prevCameraId, prevVariantKey);
    const firstFrame = frames?.[0];
    if (!firstFrame) return;

    this.cameraSystem.setCurrentState(firstFrame).catch((error) => {
      console.warn('[CameraBehaviorManager] resetToFirstFrame error:', error);
    });
  }
}

export default CameraBehaviorManager;