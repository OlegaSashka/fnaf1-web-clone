import { NightAssetIds } from '../config/NightAssets.js';

class TimePowerManager {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;

    this.currentPower = config?.power?.start ?? 1000;
    this.maxPower = config?.power?.max ?? this.currentPower;

    this.currentHour = config?.time?.startHour ?? 12;
    this.endHour = config?.time?.endHour ?? 6;
    this.hourDurationMs = config?.time?.hourDurationMs ?? 90000;

    this.nightTimeInterval = null;
    this.powerDrainInterval = null;
    this.currentUsageLevel = 1;
  }

  start() {
    this.startNightClock();
    this.startPowerDrain();
  }

  stop() {
    this.stopNightClock();
    this.stopPowerDrain();
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
        await this.scene.triggerPowerOut();
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
    this.scene.animatronicMovementManager?.onHourChanged(this.currentHour);

    this.nightTimeInterval = setInterval(async () => {
      this.currentHour = this.getNextNightHour(this.currentHour);
      this.scene.animatronicMovementManager?.onHourChanged(this.currentHour);
      await this.updateNightHud();

      if (this.currentHour === this.endHour) {
        await this.scene.completeNight();
      }
    }, this.hourDurationMs);
  }

  stopNightClock() {
    if (this.nightTimeInterval) {
      clearInterval(this.nightTimeInterval);
      this.nightTimeInterval = null;
    }
  }

  getNextNightHour(hour) {
    if (hour === 12) return 1;
    if (hour >= 1 && hour < 6) return hour + 1;
    return this.endHour;
  }

  calculateUsageLevel() {
    let usage = 1;
    if (this.scene.leftDoorClosed) usage += 1;
    if (this.scene.rightDoorClosed) usage += 1;
    if (this.scene.leftLightOn) usage += 1;
    if (this.scene.rightLightOn) usage += 1;
    if (this.scene.isMonitorOpen) usage += 1;
    return Math.min(usage, 5);
  }

  async updateNightHud() {
    this.currentUsageLevel = this.calculateUsageLevel();
    const frameIndex = Math.max(0, this.currentUsageLevel - 1);

    if (this.scene.usageSprite) await this.scene.usageSprite.showFrame(frameIndex);
    if (this.scene.monitorUsageSprite) await this.scene.monitorUsageSprite.showFrame(frameIndex);

    const nightNumber = this.config?.nightNumber ?? 1;
    const displayHour = this.currentHour === 0 ? 12 : this.currentHour;
    const percent = Math.max(0, Math.ceil((this.currentPower / this.maxPower) * 100));

    this.setTextIfExists('night-label-text', `Night ${nightNumber}`);
    this.setTextIfExists('monitor-night-text', `Night ${nightNumber}`);
    this.setTextIfExists('night-time-text', `${displayHour} AM`);
    this.setTextIfExists('monitor-time-text', `${displayHour} AM`);
    this.setTextIfExists('night-power-value-text', `${percent}%`);
    this.setTextIfExists('monitor-power-value-text', `${percent}%`);
  }

  setTextIfExists(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
}

export default TimePowerManager;