class MenuScene extends BaseScene {
  constructor(game) {
    super(game);
    this.freddySprite = null;
    this.noiseStatic = null;

    this.onNewGameClick = this.onNewGameClick.bind(this);
    this.onContinueClick = this.onContinueClick.bind(this);
    this.onHover = this.onHover.bind(this);
  }

  async enter() {
    const freddyCanvas = document.getElementById('freddy-canvas');
    const staticCanvas = document.getElementById('static-canvas');
    const menuContent = document.getElementById('menu-content');
    const newGameBtn = document.querySelector('[data-action="new"]');
    const continueBtn = document.querySelector('[data-action="continue"]');

    menuContent.style.display = 'block';
    freddyCanvas.style.display = 'block';
    staticCanvas.style.display = 'block';

    freddyCanvas.width = this.game.width;
    freddyCanvas.height = this.game.height;
    staticCanvas.width = this.game.width;
    staticCanvas.height = this.game.height;

    if (!Sound.sounds['music-menu']) {
      Sound.add('music-menu', 'assets/sounds/music/main-darkness-music.wav', { loop: true, volume: 0.6 });
    }

    if (!Sound.sounds['music-tv']) {
      Sound.add('music-tv', 'assets/sounds/music/static2-menu.wav', { loop: true, volume: 0.3 });
    }

    if (!Sound.sounds['menu-hover']) {
      Sound.add('menu-hover', 'assets/sounds/ui/blip3.wav', { volume: 0.3 });
    }

    this.freddySprite = new AnimatedSprite(
      freddyCanvas,
      'assets/images/ui/Background/Menu-freddy.png',
      2
    );

    this.noiseStatic = new AnimatedSprite(
      staticCanvas,
      'assets/images/ui/NoiseTV/Noise.png',
      40
    );

    await this.freddySprite.showFrame(0);
    this.freddySprite.randomMenuBehavior();

    await this.noiseStatic.showFrame(0);
    this.noiseStatic.play();

    Sound.play('music-menu');
    Sound.play('music-tv');

    newGameBtn.addEventListener('click', this.onNewGameClick);
    continueBtn.addEventListener('click', this.onContinueClick);
    newGameBtn.addEventListener('mouseenter', this.onHover);
    continueBtn.addEventListener('mouseenter', this.onHover);
  }

  async exit() {
    const menuContent = document.getElementById('menu-content');
    const freddyCanvas = document.getElementById('freddy-canvas');
    const staticCanvas = document.getElementById('static-canvas');
    const newGameBtn = document.querySelector('[data-action="new"]');
    const continueBtn = document.querySelector('[data-action="continue"]');

    menuContent.style.display = 'none';
    freddyCanvas.style.display = 'none';
    staticCanvas.style.display = 'none';

    if (this.freddySprite) {
      this.freddySprite.stopMenuBehavior();
    }

    if (this.noiseStatic) {
      this.noiseStatic.stop();
    }

    Sound.stop('music-menu');
    Sound.stop('music-tv');

    newGameBtn.removeEventListener('click', this.onNewGameClick);
    continueBtn.removeEventListener('click', this.onContinueClick);
    newGameBtn.removeEventListener('mouseenter', this.onHover);
    continueBtn.removeEventListener('mouseenter', this.onHover);
  }

  onHover() {
    Sound.play('menu-hover');
  }

  async onNewGameClick() {
    const testScene = new TestScene(this.game);

    await SceneTransitionManager.go({
        game: this.game,
        sceneName: SceneNames.TEST,
        nextScene: testScene,

        preload: (onProgress) => testScene.preload(onProgress),

        loading: {
            background: '#000',
            title: '6:00 AM',
            text: 'Night Complete'
        },

        confirm: {
            mode: 'screen',
            continueText: 'Click anywhere to continue'
        },

        disposeCurrentSceneOnStart: true
    });
  }

  onContinueClick() {
    console.log('Continue пока не сделан');
  }
}