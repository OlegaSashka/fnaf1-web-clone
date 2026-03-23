class LoadingScreen {
  static screenClickHandler = null;

  static show({
    image = null,
    background = '#000',
    title = 'LOADING',
    text = '',
    showButton = false,
    buttonText = 'Continue',
    waitForScreenClick = false,
    continueText = 'Click anywhere to continue',
    onContinue = null,
  } = {}) {
    const screen = document.getElementById('loading-screen');
    const imageNode = document.getElementById('loading-image');
    const titleNode = document.getElementById('loading-title');
    const textNode = document.getElementById('loading-text');
    const progressNode = document.getElementById('loading-progress');
    const button = document.getElementById('loading-continue-btn');
    const hint = document.getElementById('loading-continue-hint');

    screen.classList.remove('hidden');
    screen.style.background = background;

    if (image) {
      imageNode.src = image;
      imageNode.style.display = 'block';
    } else {
      imageNode.removeAttribute('src');
      imageNode.style.display = 'none';
    }

    titleNode.textContent = title;
    textNode.textContent = text;

    progressNode.hidden = showButton || waitForScreenClick;
    button.hidden = !showButton;
    button.textContent = buttonText;

    if (hint) {
      hint.hidden = !waitForScreenClick;
      hint.textContent = continueText;
    }

    button.onclick = null;

    if (this.screenClickHandler) {
      screen.removeEventListener('click', this.screenClickHandler);
      this.screenClickHandler = null;
    }

    if (showButton && onContinue) {
      button.onclick = onContinue;
    }

    if (waitForScreenClick && onContinue) {
      this.screenClickHandler = async (event) => {
        if (event.target === button) return;

        screen.removeEventListener('click', this.screenClickHandler);
        this.screenClickHandler = null;

        await onContinue();
      };

      screen.addEventListener('click', this.screenClickHandler);
    }
  }

  static setProgress(progress) {
    const progressNode = document.getElementById('loading-progress');
    if (progressNode) {
      progressNode.textContent = `Loading... ${progress}%`;
    }
  }

  static hide() {
    const screen = document.getElementById('loading-screen');
    const button = document.getElementById('loading-continue-btn');
    const hint = document.getElementById('loading-continue-hint');

    button.onclick = null;
    button.hidden = true;

    if (this.screenClickHandler) {
      screen.removeEventListener('click', this.screenClickHandler);
      this.screenClickHandler = null;
    }

    if (hint) {
      hint.hidden = true;
    }

    screen.classList.add('hidden');
  }

  static setError(text = 'Ошибка загрузки. Проверь консоль.') {
    const progressNode = document.getElementById('loading-progress');
    if (progressNode) {
      progressNode.hidden = false;
      progressNode.textContent = text;
    }
  }
}