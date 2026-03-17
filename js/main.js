// main.js

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

let freddySprite = null;
let noiseStatic = null;

async function init() {
  console.log('Игра инициализируется...');

  const freddyCanvas = document.getElementById('freddy-canvas');
  const staticCanvas = document.getElementById('static-canvas');


  Sound.add('music-menu', 'assets/sounds/music/main-darkness-music.wav', {loop: true, volume: 0.6 });
  Sound.add('music-tv', 'assets/sounds/music/static2-menu.wav', { loop: true, volume: 0.3 });
  Sound.add('menu-hover', 'assets/sounds/ui/blip3.wav', { volume: 0.3 });

  if (!freddyCanvas || !staticCanvas ) { 
    console.error('Canvas не найден!');
    return;
  }

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => Sound.play('menu-hover') );
  });

  Sound.play('music-menu');

  Sound.play('music-tv');

  freddyCanvas.width = GAME_WIDTH;
  freddyCanvas.height = GAME_HEIGHT;
  staticCanvas.width = GAME_WIDTH;
  staticCanvas.height = GAME_HEIGHT;
  
  console.log('Canvas установлен:', GAME_WIDTH, '×', GAME_HEIGHT);

  freddySprite = new AnimatedSprite(
    freddyCanvas,
    'assets/images/ui/Background/Menu-freddy.png',
    2
  );

noiseStatic = new AnimatedSprite(
    staticCanvas,
    'assets/images/ui/NoiseTV/Noise.png',
    40
  );

  await freddySprite.showFrame(0);
  await freddySprite.randomMenuBehavior(); // теперь асинхронно

  await noiseStatic.showFrame(0); 
  await noiseStatic.play();
}

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', init);