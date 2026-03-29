import { SceneNames } from './config/SceneNames.js';
import { TRANSITION_ASSETS } from './config/TransitionAssets.js';

import Preloader from './Preloader.js';
import StateManager from './managers/StateManager.js';
import SceneTransitionManager from './managers/SceneTransitionManager.js';
import MenuScene from './scenes/MenuScene.js';

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const BOOT_ASSETS = [
  //для меню
  { type: 'image', src: 'assets/images/ui/Background/Menu-freddy.png' },
  { type: 'image', src: 'assets/images/ui/NoiseTV/Noise.png' },
  //музыка
  { type: 'audio', src: 'assets/sounds/music/main-darkness-music.wav' },
  { type: 'audio', src: 'assets/sounds/music/static2-menu.wav' },
  { type: 'audio', src: 'assets/sounds/ui/blip3.wav' },

  //для экрана шагрузки
  ...TRANSITION_ASSETS,
];

const game = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  state: new StateManager()
};

async function bootGame() {
  const menuScene = new MenuScene(game);

  await SceneTransitionManager.go({
    game,
    sceneName: SceneNames.MENU,
    nextScene: menuScene,

    preload: (onProgress) => Preloader.loadAssets(BOOT_ASSETS, onProgress),

    loading: {
      background: '#000',
      title: 'WARNING',
      text: 'This game contains loud sounds, flashing lights and jump scares.'
    },

    confirm: {
      mode: 'button',
      buttonText: 'Start'
    }
  });
}

document.addEventListener('DOMContentLoaded', bootGame);