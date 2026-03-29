import LoadingScreen from './LoadingScreen.js';

class SceneTransitionManager {
  static wait(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Выполняет переход между сценами через LoadingScreen.
   *
   * @param {Object} params
   * @param {Object} params.game
   * @param {string} params.sceneName
   * @param {Object} params.nextScene
   * @param {(onProgress: (progress: number) => void) => Promise<void>} [params.preload]
   *
   * @param {Object} [params.loading]
   * @param {string|null} [params.loading.image=null]
   * @param {string} [params.loading.background='#000']
   * @param {string} [params.loading.title='LOADING']
   * @param {string} [params.loading.text='']
   * @param {number} [params.loading.beforePreloadDelay=0]
   * @param {string} [params.loading.uiMode='center']
   * @param {boolean} [params.loading.showProgress=true]
   * @param {Object} [params.loading.fadeIn]
   * @param {Object} [params.loading.fadeOut]
   *
   * @param {Object} [params.confirm]
   * @param {'auto'|'button'|'screen'} [params.confirm.mode='auto']
   * @param {number} [params.confirm.minDuration=0]
   * @param {string} [params.confirm.buttonText='Continue']
   * @param {string} [params.confirm.continueText='Click anywhere to continue']
   *
   * @param {Function|null} [params.afterShow=null]
   * @param {Function|null} [params.beforeHide=null]
   * @param {Function|null} [params.beforeSceneChange=null]
   * @param {Function|null} [params.afterSceneChange=null]
   *
   * @param {boolean} [params.disposeCurrentSceneOnStart=false]
   *
   * @returns {Promise<void>}
   */
  static async go({
    game,
    sceneName,
    nextScene,

    preload = null,
    loading = {},
    confirm = {},

    afterShow = null,
    beforeHide = null,
    beforeSceneChange = null,
    afterSceneChange = null,

    disposeCurrentSceneOnStart = false
  }) {
    const {
      image = null,
      background = '#000',
      title = 'LOADING',
      text = '',
      beforePreloadDelay = 0,
      uiMode = 'center',
      showProgress = true,
      fadeIn = {
        enabled: false,
        from: 0,
        to: 1,
        duration: 0
      },
      fadeOut = {
        enabled: false,
        from: 1,
        to: 0,
        duration: 0
      }
    } = loading;

    const {
      mode = 'auto',
      minDuration = 0,
      buttonText = 'Continue',
      continueText = 'Click anywhere to continue'
    } = confirm;

    const startedAt = performance.now();

    try {
      // 1. Показываем экран загрузки
      await LoadingScreen.show({
        image,
        background,
        title,
        text,
        uiMode,
        showProgress,
        fadeIn
      });

      // 2. Хук после полного показа overlay
      if (typeof afterShow === 'function') {
        await afterShow();
      }

      // 3. При необходимости удаляем текущую сцену сразу
      if (disposeCurrentSceneOnStart) {
        await game.state.disposeCurrentScene();
      }

      // 4. Доп. пауза до preload
      if (beforePreloadDelay > 0) {
        await this.wait(beforePreloadDelay);
      }

      // 5. Грузим ассеты следующей сцены
      if (typeof preload === 'function') {
        await preload((progress) => {
          LoadingScreen.setProgress(progress);
        });
      }

      // 6. Автопереход
      if (mode === 'auto') {
        const elapsed = performance.now() - startedAt;
        const remaining = Math.max(0, minDuration - elapsed);

        if (remaining > 0) {
          await this.wait(remaining);
        }

        if (typeof beforeHide === 'function') {
          await beforeHide();
        }

        await LoadingScreen.hide({ fadeOut });

        if (typeof beforeSceneChange === 'function') {
          await beforeSceneChange();
        }

        await game.state.change(sceneName, nextScene);

        if (typeof afterSceneChange === 'function') {
          await afterSceneChange();
        }

        return;
      }

      // 7. Переход по кнопке
      if (mode === 'button') {
        await new Promise(async (resolve) => {
          await LoadingScreen.show({
            image,
            background,
            title,
            text,
            showButton: true,
            showProgress: false,
            uiMode,
            buttonText,
            onContinue: resolve,
            fadeIn: { enabled: false, from: 1, to: 1, duration: 0 }
          });
        });

        if (typeof beforeHide === 'function') {
          await beforeHide();
        }

        await LoadingScreen.hide({ fadeOut });

        if (typeof beforeSceneChange === 'function') {
          await beforeSceneChange();
        }

        await game.state.change(sceneName, nextScene);

        if (typeof afterSceneChange === 'function') {
          await afterSceneChange();
        }

        return;
      }

      // 8. Переход по клику по экрану
      if (mode === 'screen') {
        await new Promise(async (resolve) => {
          await LoadingScreen.show({
            image,
            background,
            title,
            text,
            waitForScreenClick: true,
            showProgress: false,
            uiMode,
            continueText,
            onContinue: resolve,
            fadeIn: { enabled: false, from: 1, to: 1, duration: 0 }
          });
        });

        if (typeof beforeHide === 'function') {
          await beforeHide();
        }

        await LoadingScreen.hide({ fadeOut });

        if (typeof beforeSceneChange === 'function') {
          await beforeSceneChange();
        }

        await game.state.change(sceneName, nextScene);

        if (typeof afterSceneChange === 'function') {
          await afterSceneChange();
        }

        return;
      }

      throw new Error(`Неизвестный confirm.mode: ${mode}`);
    } catch (error) {
      console.error('[SceneTransitionManager.go] Ошибка перехода:', error);
      LoadingScreen.setError('Ошибка перехода. Проверь консоль и пути к файлам.');
    }
  }
}

export default SceneTransitionManager;