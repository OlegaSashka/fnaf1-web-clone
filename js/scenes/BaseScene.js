class BaseScene {
  constructor(game) {
    this.game = game;
  }

  async preload() {}
  async enter() {}
  async exit() {}
}

export default BaseScene;