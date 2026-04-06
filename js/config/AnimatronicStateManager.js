class AnimatronicStateManager {
  constructor() {
    this.states = new Map();
  }

  initAnimatronic(id, initialState = {}) {
    this.states.set(id, {
      activity: 0,
      currentNode: null,
      previousNode: null,
      moveIntervalMs: 4970,
      isMoving: false,
      lastMoveAt: 0,
      ...initialState
    });
  }

  has(id) {
    return this.states.has(id);
  }

  get(id) {
    return this.states.get(id) ?? null;
  }

  set(id, patch = {}) {
    const current = this.get(id);
    if (!current) return null;

    const next = {
      ...current,
      ...patch
    };

    this.states.set(id, next);
    return next;
  }

  setNode(id, node) {
    const current = this.get(id);
    if (!current) return null;

    return this.set(id, {
      previousNode: current.currentNode,
      currentNode: node,
      lastMoveAt: Date.now()
    });
  }

  incrementActivity(id, delta = 1) {
    const current = this.get(id);
    if (!current) return null;

    return this.set(id, {
      activity: Math.max(0, current.activity + delta)
    });
  }

  reset() {
    this.states.clear();
  }
}

export default AnimatronicStateManager;