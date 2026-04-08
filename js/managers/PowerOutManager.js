import Sounds from './SoundLibrary.js';
import Sound from './SoundManager.js';
import { NightAssetIds } from '../config/NightAssets.js';

export default class PowerOutManager {
  constructor({
    scene,
    powerDownSoundId = null,
    powerDownSoundPath = null
  } = {}) {
    this.scene = scene ?? null;
    this.powerDownSoundId = powerDownSoundId;
    this.powerDownSoundPath = powerDownSoundPath;

    this.isActive = false;
    this.timeoutIds = [];
  }

  async start() {
    if (this.isActive || !this.scene) return;
    this.isActive = true;

    await this.enterPowerOutState();
    await this.runFreddySequence();
  }

  async enterPowerOutState() {
    const scene = this.scene;
    if (!scene) return;

    scene.isPowerOut = true;

    scene.clearAllThreatTimers();
    scene.stopNightClock();
    scene.stopPowerDrain();
    scene.clearLightFlicker();

    scene.animatronicMovementManager?.stopAll();
    scene.cameraSystem?.stopStatic();

    scene.leftLightOn = false;
    scene.rightLightOn = false;
    scene.activeLightSide = null;

    scene.leftControlsBroken = true;
    scene.rightControlsBroken = true;
    scene.lastOfficeIntruderId = null;

    scene.hideOfficeLight();
    scene.setHudVisible(false);
    scene.setMonitorToggleVisible(false);

    if (scene.fanSprite) {
      scene.fanSprite.stop({ clear: true });
    }

    this.ensurePowerDownSound();

    scene.stopPhoneGuy();
    scene.stopAllNightSfx();

    Sound.stopAll({
      exceptIds: [
        this.powerDownSoundId,
        NightAssetIds.DOOR_TOGGLE_SOUND
      ]
    });

    if (scene.isMonitorOpen && !scene.isMonitorAnimating) {
      await scene.closeMonitorForPowerOut();
    } else {
      scene.isMonitorOpen = false;
      scene.isMonitorAnimating = false;
    }

    await scene.forceOpenDoorsForPowerOut();

    await scene.setOfficeVisualState('power-out');
    scene.hideOfficeSidePanels();

    await scene.updateControlPanels();
    await scene.updateNightHud();

    this.playPowerDownSound();
  }

  async runFreddySequence() {
    const started = await this.runFreddyMusicStartPhase();
    if (!started || !this.isActive) return;

    await this.runFreddyMusicLoopPhase();
    if (!this.isActive) return;

    await this.runFreddyDarkPhase();
  }

  async runFreddyMusicStartPhase() {
    const maxMs = 20000;
    const stepMs = 5000;
    const tries = Math.floor(maxMs / stepMs);

    for (let i = 0; i < tries; i++) {
      await this.wait(stepMs);
      if (!this.isActive) return false;

      if (this.rollChance(20)) {
        await this.startFreddyMusic();
        return true;
      }

      this.scene?.playFreddyPowerOutStepSound?.();
    }

    if (!this.isActive) return false;

    await this.startFreddyMusic();
    return true;
  }

  async startFreddyMusic() {
    const scene = this.scene;
    if (!scene) return;

    scene.setPowerOutOverlayVisible(false);
    await scene.setOfficeVisualState('power-out');
    await scene.setPowerOutFreddyFrame(0);
    scene.startPowerOutFreddyBlink();

    Sound.stop(NightAssetIds.ANIMATRONIC_MOVE_SOUND);
    scene.playFreddyPowerOutMusic();
  }
  
  
  async runFreddyMusicLoopPhase() {
    const maxMs = 20000;
    const stepMs = 5000;
    const tries = Math.floor(maxMs / stepMs);

    for (let i = 0; i < tries; i++) {
      await this.wait(stepMs);
      if (!this.isActive) return;

      if (this.rollChance(20)) {
        await this.stopFreddyMusic();
        return;
      }
    }

    if (!this.isActive) return;
    await this.stopFreddyMusic();
  }

  async stopFreddyMusic() {
    const scene = this.scene;
    if (!scene) return;

    scene.stopFreddyPowerOutMusic();
    scene.stopPowerOutFreddyBlink();
    await scene.setPowerOutFreddyFrame(0);

    scene.setPowerOutOverlayVisible(true, 0.80);
  }

  async runFreddyDarkPhase() {
    const maxMs = 20000;
    const stepMs = 3000;
    const tries = Math.floor(maxMs / stepMs);

    for (let i = 0; i < tries; i++) {
      await this.wait(stepMs);
      if (!this.isActive) return;

      if (this.rollChance(20)) {
        await this.triggerFreddyJumpscare();
        return;
      }
    }

    if (!this.isActive) return;
    await this.triggerFreddyJumpscare();
  }

  async triggerFreddyJumpscare() {
    if (!this.scene) return;

    // this.scene.setPowerOutOverlayVisible(true, 0.4);
    await this.scene.triggerFreddyPowerOutJumpscare?.();
  }

   wait(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        this.timeoutIds = this.timeoutIds.filter((x) => x !== id);
        resolve();
      }, ms);

      this.timeoutIds.push(id);
    });
  }
  
  clearTimers() {
    for (const id of this.timeoutIds) {
      clearTimeout(id);
    }
    this.timeoutIds = [];
  }

  rollChance(percent = 20) {
    return Math.random() * 100 < percent;
  }

  ensurePowerDownSound() {
    if (!this.powerDownSoundId || !this.powerDownSoundPath) return false;

    if (!Sounds.has(this.powerDownSoundId)) {
      Sounds.add(this.powerDownSoundId, this.powerDownSoundPath, {
        loop: false,
        volume: 0.7
      });
    }

    return true;
  }

  playPowerDownSound() {
    if (!this.ensurePowerDownSound()) return;

    Sound.stop(this.powerDownSoundId);
    Sound.play(this.powerDownSoundId);
  }

  stop() {
    this.isActive = false;
  }
}