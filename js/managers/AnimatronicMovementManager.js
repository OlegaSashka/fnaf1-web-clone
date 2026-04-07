import Sound from './SoundManager.js';
import Sounds from './SoundLibrary.js';
import { NightAssetIds, NightAssetPaths } from '../config/NightAssets.js';

class AnimatronicMovementManager {
  constructor({
    animatronicConfigs = {},
    stateManager,
    cameraSystem = null,
    onAnimatronicMoved = null,
    hooks = {}
  } = {}) {
    this.animatronicConfigs = animatronicConfigs;
    this.stateManager = stateManager;
    this.cameraSystem = cameraSystem;
    this.onAnimatronicMoved = onAnimatronicMoved ?? null;
    this.sharedMoveSoundAnimatronics = new Set(['bonnie', 'chica']);
    this.activeMoveSoundMeta = null;

    this.hooks = {
        isLeftDoorClosed: () => false,
        isLeftLightOn: () => false,
        isMonitorOpen: () => false,
        onBonnieEnteredOfficeAttack: null,
        onBonnieAttackFailed: null,
        onBonnieAttackSucceeded: null,
        ...hooks
    };

    this.timers = new Map();
    this.hourRulesApplied = new Map();
    this.debugForcedRolls = new Map();
  }

  async resolveBonnieOfficeAttack() {
    const state = this.stateManager.get('bonnie');
    if (!state || state.currentNode !== 'office-attack') return;

    const doorClosed = this.hooks.isLeftDoorClosed?.() ?? false;

    console.log(`[bonnie] office attack check | leftDoorClosed=${doorClosed}`);

    if (doorClosed) {
        this.stateManager.setNode('bonnie', '1B');
        this.stateManager.set('bonnie', { isMoving: false });

        if (typeof this.hooks.onBonnieAttackFailed === 'function') {
          await this.hooks.onBonnieAttackFailed();
        }

        if (typeof this.onAnimatronicMoved === 'function') {
            await this.onAnimatronicMoved({
                animatronicId: 'bonnie',
                fromNode: 'office-attack',
                toNode: '1B',
                state: this.stateManager.get('bonnie')
            });
        }
        return;
    }

    this.stateManager.set('bonnie', {
        attackPhase: 'in-office',
        hasBrokenLeftControls: true,
        isMoving: false
    });

    if (typeof this.hooks.onBonnieAttackSucceeded === 'function') {
        await this.hooks.onBonnieAttackSucceeded();
    }

    this.stopAnimatronic('bonnie');

    console.log('[bonnie] attack succeeded -> entered office');
  }

  setForcedRoll(animatronicId, rollValue) {
        if (rollValue == null) {
            this.debugForcedRolls.delete(animatronicId);
            return;
        }

        const safeRoll = Math.max(1, Math.min(20, Number(rollValue)));
        this.debugForcedRolls.set(animatronicId, safeRoll);
    }

    clearForcedRoll(animatronicId) {
        this.debugForcedRolls.delete(animatronicId);
    }

  initAnimatronic(animatronicId) {
    const config = this.animatronicConfigs[animatronicId];
    if (!config) return;

    this.stateManager.initAnimatronic(animatronicId, {
      activity: 0,
      currentNode: config.startNode,
      previousNode: null,
      moveIntervalMs: config.baseMoveIntervalMs ?? 4970,
      isMoving: false,
      lastMoveAt: 0,
      attackPhase: 'idle',
      hasBrokenLeftControls: false
    });

    this.hourRulesApplied.set(animatronicId, new Set());
  }

  startAnimatronic(animatronicId) {
    const state = this.stateManager.get(animatronicId);
    if (!state) return;
    if (this.timers.has(animatronicId)) return;

    const tick = async () => {
      await this.tryMove(animatronicId);
    };

    const timerId = setInterval(tick, state.moveIntervalMs);
    this.timers.set(animatronicId, timerId);
  }

  stopAnimatronic(animatronicId) {
    const timerId = this.timers.get(animatronicId);
    if (!timerId) return;

    clearInterval(timerId);
    this.timers.delete(animatronicId);
  }

  stopAll() {
    for (const animatronicId of this.timers.keys()) {
      this.stopAnimatronic(animatronicId);
    }
  }

    onHourChanged(hour) {
        const normalizedHour = hour === 12 ? 0 : hour;

        console.log(`[Hour] raw=${hour} | normalized=${normalizedHour}`);

        for (const animatronicId of Object.keys(this.animatronicConfigs)) {
            const config = this.animatronicConfigs[animatronicId];
            const applied = this.hourRulesApplied.get(animatronicId);

            if (!config?.activitySchedule || !applied) continue;

            for (const rule of config.activitySchedule) {
            const ruleKey = `${rule.hour}:${rule.delta}`;

                if (normalizedHour >= rule.hour && !applied.has(ruleKey)) {
                    this.stateManager.incrementActivity(animatronicId, rule.delta);
                    applied.add(ruleKey);

                    console.log(
                    `[${animatronicId}] activity increased to ${this.stateManager.get(animatronicId)?.activity} at ${hour} AM`
                    );
                }
            }
        }
    }

  rollMoveChance(activity, animatronicId) {
    const forcedRoll = this.debugForcedRolls.get(animatronicId);
    const roll = forcedRoll ?? (Math.floor(Math.random() * 20) + 1);
    
    return {
        roll,
        success: roll <= activity,
        forced: forcedRoll != null
    };
  }

  pickNextNode(animatronicId) {
    const config = this.animatronicConfigs[animatronicId];
    const state = this.stateManager.get(animatronicId);

    if (!config || !state) return null;

    const currentNode = state.currentNode;
    const nextNodes = config.moveGraph?.[currentNode] ?? [];

    if (!nextNodes.length) return null;

    const randomIndex = Math.floor(Math.random() * nextNodes.length);
    return nextNodes[randomIndex];
  }

  async tryMove(animatronicId) {
    const state = this.stateManager.get(animatronicId);
    const config = this.animatronicConfigs[animatronicId];

    if (!state || !config) return;
    if (state.isMoving) return;

    if (animatronicId === 'bonnie' && state.currentNode === 'office-attack') {
      await this.resolveBonnieOfficeAttack();
      return;
    }

    console.log(
      `[${animatronicId}] attempt move | node=${state.currentNode} | activity=${state.activity}`
    );

    const { roll, success, forced } = this.rollMoveChance(state.activity, animatronicId);

    console.log(
      `[${animatronicId}] roll=${roll} | activity=${state.activity} | success=${success} | forced=${forced}`
    );

    if (!success) return;

    const nextNode = this.pickNextNode(animatronicId);

    console.log(
      `[${animatronicId}] next candidates=${JSON.stringify(config.moveGraph?.[state.currentNode] ?? [])}`
    );

    if (!nextNode) {
      console.log(`[${animatronicId}] no next node from ${state.currentNode}`);
      return;
    }

    this.stateManager.set(animatronicId, { isMoving: true });

    const fromNode = state.currentNode;
    const toNode = nextNode;

    console.log(`[${animatronicId}] move ${fromNode} -> ${toNode}`);

    this.stateManager.setNode(animatronicId, toNode);

    if (animatronicId === 'bonnie' && toNode === 'office-attack') {
      this.stateManager.set(animatronicId, {
        attackPhase: 'at-door'
      });

      if (typeof this.hooks.onBonnieEnteredOfficeAttack === 'function') {
        await this.hooks.onBonnieEnteredOfficeAttack();
      }
    }

    this.stateManager.set(animatronicId, { isMoving: false });

    if (typeof this.onAnimatronicMoved === 'function') {
      await this.onAnimatronicMoved({
        animatronicId,
        fromNode,
        toNode,
        state: this.stateManager.get(animatronicId)
      });
    }
  }

  syncCameraBehavior(animatronicId) {
    if (!this.cameraSystem) return;
    if (animatronicId !== 'bonnie') return;

    const state = this.stateManager.get('bonnie');
    if (!state) return;

    if (state.currentNode === '2A') {
      this.cameraSystem.setBehaviorVariant('2A', 'bonnie');
    } else {
      this.cameraSystem.resetBehaviorVariant('2A');
    }
  }

  getState(animatronicId) {
    return this.stateManager.get(animatronicId);
  }

  ensureSharedAnimatronicMoveSound() {
    if (!NightAssetPaths.ANIMATRONIC_MOVE_SOUND) return null;

    if (!Sounds.has(NightAssetIds.ANIMATRONIC_MOVE_SOUND)) {
      Sounds.add(
        NightAssetIds.ANIMATRONIC_MOVE_SOUND,
        NightAssetPaths.ANIMATRONIC_MOVE_SOUND,
        {
          loop: false,
          volume: 0.35
        }
      );
    }

    return NightAssetIds.ANIMATRONIC_MOVE_SOUND;
  }

  getMoveSoundId(animatronicId) {
    if (this.sharedMoveSoundAnimatronics.has(animatronicId)) {
      return this.ensureSharedAnimatronicMoveSound();
    }

    return null;
  }

  getNodeBaseMoveVolume(animatronicId, node) {
    if (animatronicId === 'bonnie') {
      const levels = {
        '1A': 0.18,
        '5': 0.28,
        '1B': 0.34,
        '2A': 0.48,
        '3': 0.58,
        '2B': 0.72,
        'office-attack': 0.9
      };

      return levels[node] ?? 0.35;
    }

    if (animatronicId === 'chica') {
      const levels = {
        '1A': 0.18,
        '1B': 0.28,
        '7': 0.42,
        '4A': 0.58,
        '4B': 0.78,
        'office-right': 0.9
      };

      return levels[node] ?? 0.35;
    }

    return 0.35;
  }

  isCameraNode(node) {
    return ['1A', '1B', '1C', '2A', '2B', '3', '4A', '4B', '5', '6', '7'].includes(node);
  }

  getMoveSoundVolume({
    animatronicId,
    fromNode,
    toNode,
    currentCameraId = null,
    isMonitorOpen = false
  }) {
    const fromVolume = this.getNodeBaseMoveVolume(animatronicId, fromNode);
    const toVolume = this.getNodeBaseMoveVolume(animatronicId, toNode);

    let volume = Math.max(fromVolume, toVolume);

    if (isMonitorOpen && currentCameraId) {
      const watchingFrom = this.isCameraNode(fromNode) && currentCameraId === fromNode;
      const watchingTo = this.isCameraNode(toNode) && currentCameraId === toNode;

      if (watchingFrom || watchingTo) {
        volume += 0.18;
      }
    }

    return Math.max(0, Math.min(1, volume));
  }

  playMoveSound({
    animatronicId,
    fromNode,
    toNode,
    currentCameraId = null,
    isMonitorOpen = false
  } = {}) {
    const soundId = this.getMoveSoundId(animatronicId);
    if (!soundId) return;

    const volume = this.getMoveSoundVolume({
      animatronicId,
      fromNode,
      toNode,
      currentCameraId,
      isMonitorOpen
    });

    Sound.stop(soundId);

    const sound = Sound.play(soundId, { volume });

    if (sound) {
      const durationMs =
        typeof sound.duration === 'function'
          ? sound.duration() * 1000
          : 0;

      this.activeMoveSoundMeta = {
        animatronicId,
        fromNode,
        toNode,
        soundId,
        expiresAt: performance.now() + durationMs
      };
    }

    console.log(
      `[move-sound] ${animatronicId} ${fromNode} -> ${toNode} | volume=${volume.toFixed(2)} | monitor=${isMonitorOpen} | cam=${currentCameraId ?? 'none'}`
    );
  }

  refreshMoveSoundMix({ currentCameraId = null, isMonitorOpen = false } = {}) {
    const meta = this.activeMoveSoundMeta;
    if (!meta) return;

    if (performance.now() >= meta.expiresAt) {
      this.activeMoveSoundMeta = null;
      return;
    }

    const volume = this.getMoveSoundVolume({
      animatronicId: meta.animatronicId,
      fromNode: meta.fromNode,
      toNode: meta.toNode,
      currentCameraId,
      isMonitorOpen
    });

    Sound.setVolume(meta.soundId, volume);
  }
}

export default AnimatronicMovementManager;