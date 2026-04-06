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
            isMoving: false
        });

        if (typeof this.hooks.onBonnieAttackSucceeded === 'function') {
            await this.hooks.onBonnieAttackSucceeded();
        }

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
      attackPhase: 'idle'
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

    this.syncCameraBehavior(animatronicId);
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
}

export default AnimatronicMovementManager;