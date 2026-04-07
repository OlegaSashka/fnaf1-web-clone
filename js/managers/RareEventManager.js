import { RareEvents } from '../config/RareEvents.js';

class RareEventManager {
  constructor(events = RareEvents) {
    this.events = Array.isArray(events) ? events : [];
    this.lastRoll = null;
    this.lastCameraId = null;
  }

  rollForCamera(cameraId) {
    this.lastCameraId = cameraId ?? null;
    this.lastRoll = Math.floor(Math.random() * 101);
    return this.lastRoll;
  }

  clear() {
    this.lastRoll = null;
    this.lastCameraId = null;
  }

  resolveRareState({ cameraId, baseState }) {
    if (!cameraId || !baseState) return null;
    if (this.lastCameraId !== cameraId) return null;
    if (this.lastRoll == null) return null;

    const matchedEvent = this.events.find((event) => {
      return (
        event.cameraId === cameraId &&
        event.baseState === baseState &&
        event.roll === this.lastRoll
      );
    });

    return matchedEvent?.rareState ?? null;
  }
}

export default RareEventManager;