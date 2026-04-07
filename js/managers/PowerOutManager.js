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
  }

  async start() {
    if (this.isActive || !this.scene) return;
    this.isActive = true;

    await this.enterPowerOutState();
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

    await scene.setOfficeVisualState('power-out');
    scene.hideOfficeSidePanels();

    await scene.forceOpenDoorsForPowerOut();
    await scene.updateControlPanels();
    await scene.updateNightHud();

    if (scene.isMonitorOpen && !scene.isMonitorAnimating) {
        await scene.closeMonitorForPowerOut();
    } else {
        scene.isMonitorOpen = false;
        scene.isMonitorAnimating = false;
    }

    this.playPowerDownSound();
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