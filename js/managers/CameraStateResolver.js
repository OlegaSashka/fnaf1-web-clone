class CameraStateResolver {
  constructor({ cameraSystem, animatronicStateManager, blackoutDurationMs = 1000 } = {}) {
    this.cameraSystem = cameraSystem ?? null;
    this.animatronicStateManager = animatronicStateManager ?? null;

    this.cameraBlackouts = new Map();
    this.cameraBlackoutRefreshTimers = new Map();
    this.blackoutDurationMs = blackoutDurationMs;
  }

  getInitialStateForCamera(cameraId) {
    if (!cameraId) return null;

    if (this.isCameraBlackoutActive(cameraId)) {
      return null;
    }

    if (cameraId === '2A') {
      return 'dark';
    }

    return this.resolveCameraState(cameraId);
  }

  isCameraBlackoutActive(cameraId) {
    const until = this.cameraBlackouts.get(cameraId);
    if (!until) return false;

    if (Date.now() >= until) {
      this.cameraBlackouts.delete(cameraId);
      return false;
    }

    return true;
  }

  setCameraBlackout(cameraId, durationMs = this.blackoutDurationMs) {
    console.log('[BLACKOUT]', cameraId);
    if (!cameraId) return;

    const expiresAt = Date.now() + durationMs;
    this.cameraBlackouts.set(cameraId, expiresAt);

    const oldTimer = this.cameraBlackoutRefreshTimers.get(cameraId);
    if (oldTimer) {
      clearTimeout(oldTimer);
    }

    const timerId = setTimeout(async () => {
      this.cameraBlackoutRefreshTimers.delete(cameraId);

      const currentCameraId = this.cameraSystem?.currentCameraId;
      if (currentCameraId !== cameraId) return;

      await this.updateCurrentCameraView();
    }, durationMs);

    this.cameraBlackoutRefreshTimers.set(cameraId, timerId);
  }

  setTransitionBlackout(fromNode, toNode, durationMs = this.blackoutDurationMs) {
    const affectedNodes = [fromNode, toNode];

    for (const node of affectedNodes) {
      if (!node) continue;
      if (node === 'office-attack' || node === 'office-left' || node === 'office-right') continue;

      this.setCameraBlackout(node, durationMs);
    }
  }

  getAnimNode(animatronicId) {
    return this.animatronicStateManager?.get(animatronicId)?.currentNode ?? null;
  }

  getAnimPrevNode(animatronicId) {
    return this.animatronicStateManager?.get(animatronicId)?.previousNode ?? null;
  }

  getOccupancy() {
    const map = new Map();

    if (!this.animatronicStateManager?.states) return map;

    for (const [animId, state] of this.animatronicStateManager.states.entries()) {
      if (!state?.currentNode) continue;

      if (!map.has(state.currentNode)) {
        map.set(state.currentNode, []);
      }

      map.get(state.currentNode).push(animId);
    }

    return map;
  }

  has(stage, animId) {
    return stage.includes(animId);
  }

  resolve1AState(occupancy) {
    const stage = occupancy.get('1A') ?? [];

    const hasBonnie = this.has(stage, 'bonnie');
    const hasChica = this.has(stage, 'chica');
    const hasFreddy = this.has(stage, 'freddy');

    if (hasBonnie && hasChica && hasFreddy) return 'all';
    if (!hasBonnie && hasChica && hasFreddy) return 'chica_freddy';
    if (hasBonnie && !hasChica && hasFreddy) return 'bonny_freddy';
    if (!hasBonnie && !hasChica && hasFreddy) return 'freddy';

    return 'empty';
  }

    resolve1BState(occupancy) {
        const room = occupancy.get('1B') ?? [];

        const hasBonnie = this.has(room, 'bonnie');
        const hasChica = this.has(room, 'chica');
        const hasFreddy = this.has(room, 'freddy');

        const bonniePrevNode = this.getAnimPrevNode('bonnie');
        const chicaPrevNode = this.getAnimPrevNode('chica');

        if (hasBonnie && hasChica && hasFreddy) return 'bonny_chica_freddy';
        if (hasBonnie && !hasChica && hasFreddy) return 'bonny_freddy';
        if (!hasBonnie && hasChica && hasFreddy) return 'chica_freddy';

        if (hasBonnie && hasChica && !hasFreddy) {
            const bonnieJustCameFromStage = bonniePrevNode === '1A';
            const chicaJustCameFromStage = chicaPrevNode === '1A';

            if (bonnieJustCameFromStage && !chicaJustCameFromStage) {
                return 'bonny_close_chica_far';
            }

            if (chicaJustCameFromStage && !bonnieJustCameFromStage) {
                return 'chica_close_bonny_far';
            }

            return 'bonny_chica';
        }

        if (hasBonnie && !hasChica && !hasFreddy) {
            return bonniePrevNode === '1A' ? 'bonny_close' : 'bonny_far';
        }

        if (!hasBonnie && hasChica && !hasFreddy) {
            return chicaPrevNode === '1A' ? 'chica_close' : 'chica_far';
        }

        if (!hasBonnie && !hasChica && hasFreddy) return 'freddy';

        return 'default';
    }

  resolve5State() {
    return this.getAnimNode('bonnie') === '5' ? 'bonny' : 'default';
  }

  resolve3State() {
    return this.getAnimNode('bonnie') === '3' ? 'bonny' : 'default';
  }

  resolve2BState() {
    return this.getAnimNode('bonnie') === '2B' ? 'bonny' : 'default';
  }

  resolveCameraState(cameraId) {
    const occupancy = this.getOccupancy();

    switch (cameraId) {
      case '1A':
        return this.resolve1AState(occupancy);

      case '1B':
        return this.resolve1BState(occupancy);

      case '5':
        return this.resolve5State();

      case '3':
        return this.resolve3State();

      case '2B':
        return this.resolve2BState();

      case '2A':
        return 'dark';

      default:
        return null;
    }
  }

  syncSpecialBehaviors() {
    if (!this.cameraSystem) return;

    if (this.cameraSystem.currentCameraId !== '2A') return;

    const variantKey = this.get2ABehaviorVariant();
    this.cameraSystem.setBehaviorVariant('2A', variantKey);
  }

  get2ABehaviorVariant() {
    const bonnieNode = this.getAnimNode('bonnie');
    return bonnieNode === '2A' ? 'bonnie' : 'default';
  }

  async updateCurrentCameraView() {
    if (!this.cameraSystem) return;

    const currentCameraId = this.cameraSystem.currentCameraId;
    if (!currentCameraId) return;

    if (this.isCameraBlackoutActive(currentCameraId)) {
      this.cameraSystem.stopCurrentBehavior({ resetToFirstFrame: false });
      this.cameraSystem.fillBlack();
      return;
    }

    if (currentCameraId === '2A') {
      const variantKey = this.get2ABehaviorVariant();

      await this.cameraSystem.createCameraSprite();
      await this.cameraSystem.restartBehaviorForCurrentCamera(variantKey);
      return;
    }

    const stateKey = this.resolveCameraState(currentCameraId);
    if (!stateKey) return;

    await this.cameraSystem.setCurrentState(stateKey);
  }

  clearAllBlackouts() {
    for (const timerId of this.cameraBlackoutRefreshTimers.values()) {
      clearTimeout(timerId);
    }

    this.cameraBlackoutRefreshTimers.clear();
    this.cameraBlackouts.clear();
  }
}

export default CameraStateResolver;