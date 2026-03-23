class TestScene extends BaseScene {
  constructor(game) {
    super(game);
    this.root = null;
    this.onBackClick = this.onBackClick.bind(this);
  }

  async preload(onProgress) {
    const assets = [
      { type: 'image', src: 'assets/images/test/test-bg.png' }
    ];

    await Preloader.loadAssets(assets, onProgress);
  }

  async enter() {
    this.root = document.createElement('div');
    this.root.id = 'test-scene';
    this.root.innerHTML = `
      <img class="test-scene__image" src="assets/images/test/test-bg.png" alt="Test Scene">
      <button class="test-scene__back">Back to Menu</button>
    `;

    document.getElementById('game-wrapper').appendChild(this.root);

    const backBtn = this.root.querySelector('.test-scene__back');
    backBtn.addEventListener('click', this.onBackClick);
  }

  async exit() {
    if (!this.root) return;

    const backBtn = this.root.querySelector('.test-scene__back');
    backBtn.removeEventListener('click', this.onBackClick);

    this.root.remove();
    this.root = null;
  }

  async onBackClick() {
    const menuScene = new MenuScene(this.game);
    
    await SceneTransitionManager.go({
        game: this.game,
        sceneName: SceneNames.MENU,
        nextScene: menuScene,

        preload: (onProgress) => menuScene.preload(onProgress),

        loading: {
            background: '#000',
            title: '',
            text: ''
        },

        confirm: {
            mode: 'auto',
            continueText: 'Click anywhere to continue'
        },

        disposeCurrentSceneOnStart: false
    });
  }
}