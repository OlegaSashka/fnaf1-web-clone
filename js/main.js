const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const BOOT_ASSETS = [
  { type: 'image', src: 'assets/images/ui/Background/Menu-freddy.png' },
  { type: 'image', src: 'assets/images/ui/NoiseTV/Noise.png' },

  { type: 'audio', src: 'assets/sounds/music/main-darkness-music.wav' },
  { type: 'audio', src: 'assets/sounds/music/static2-menu.wav' },
  { type: 'audio', src: 'assets/sounds/ui/blip3.wav' }
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