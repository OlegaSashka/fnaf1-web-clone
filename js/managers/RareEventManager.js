import { RareEvents } from '../config/RareEvents.js';

class RareEventManager {
  constructor(events = RareEvents) {
    this.events = Array.isArray(events) ? events : [];
    this.lastRoll = null;
    this.lastCameraId = null;

    this.debugForcedRoll = null;
    this.debugQueue = [];
    this.debugEnabled = true;
  }
  
  setForcedRoll(value) {
    const num = Number(value);

    if (!Number.isInteger(num) || num < 0 || num > 100) {
        console.warn('[RareEvent] forced roll должен быть целым числом 0..100');
        return;
    }

    this.debugForcedRoll = num;
    console.log('[RareEvent] forced roll set ->', num);
    }

    clearForcedRoll() {
    this.debugForcedRoll = null;
    console.log('[RareEvent] forced roll cleared');
    }

    setRollQueue(values = []) {
    const queue = values
        .map((v) => Number(v))
        .filter((v) => Number.isInteger(v) && v >= 0 && v <= 100);

    this.debugQueue = queue;
    console.log('[RareEvent] roll queue set ->', queue);
    }

    clearRollQueue() {
    this.debugQueue = [];
    console.log('[RareEvent] roll queue cleared');
    }

    rollForCamera(cameraId) {
    this.lastCameraId = cameraId ?? null;

    let rollSource = 'random';
    let rollValue = null;

    if (this.debugQueue.length > 0) {
        rollValue = this.debugQueue.shift();
        rollSource = 'queue';
    } else if (this.debugForcedRoll != null) {
        rollValue = this.debugForcedRoll;
        rollSource = 'forced';
    } else {
        rollValue = Math.floor(Math.random() * 101);
    }

    this.lastRoll = rollValue;

    console.log(
        `[RareEvent] roll=${rollValue} source=${rollSource} camera=${this.lastCameraId}`
    );

    return this.lastRoll;
    }

  clear() {
    this.lastRoll = null;
    this.lastCameraId = null;
  }

    resolveRareState({ cameraId, baseState }) {
    if (!cameraId || !baseState) {
        console.log('[RareEvent] skip: invalid camera/baseState', { cameraId, baseState });
        return null;
    }

    if (this.lastCameraId !== cameraId) {
        console.log('[RareEvent] skip: camera mismatch', {
        requestedCamera: cameraId,
        rolledCamera: this.lastCameraId
        });
        return null;
    }

    if (this.lastRoll == null) {
        console.log('[RareEvent] skip: no roll');
        return null;
    }

    const matchedEvent = this.events.find((event) => {
        return (
        event.cameraId === cameraId &&
        event.baseState === baseState &&
        event.roll === this.lastRoll
        );
    });

    if (matchedEvent) {
        console.log('[RareEvent] matched:', {
        id: matchedEvent.id,
        cameraId,
        baseState,
        roll: this.lastRoll,
        rareState: matchedEvent.rareState
        });

        return matchedEvent.rareState;
    }

    console.log('[RareEvent] no match:', {
        cameraId,
        baseState,
        roll: this.lastRoll
    });

    return null;
    }
}

export default RareEventManager;