import { SceneNames } from './config/SceneNames.js';

import StateManager from './managers/StateManager.js';
import MenuScene from './scenes/MenuScene.js';

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const game = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  state: new StateManager()
};

async function bootGame() {
  const menuScene = new MenuScene(game);
  await game.state.change(SceneNames.MENU, menuScene);
}

document.addEventListener('DOMContentLoaded', bootGame);