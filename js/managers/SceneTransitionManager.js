import LoadingScreen from './LoadingScreen.js';

class SceneTransitionManager {
  static wait(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async go({
    game,
    sceneName = null,
    nextScene = null,

    preload = null,
    loading = {},
    confirm = {},

    beforeShow = null,
    afterShow = null,
    beforePreload = null,
    afterPreload = null,
    beforeHide = null,
    beforeSceneChange = null,
    afterSceneChange = null,

    onFadeOutStart = null,
    onFadeOutComplete = null,

    disposeCurrentSceneOnStart = false,
    skipSceneChange = false
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
      // 1. Первый показ overlay
      if (typeof beforeShow === 'function') {
        await beforeShow();
      }

      await LoadingScreen.show({
        image,
        background,
        title,
        text,
        uiMode,
        showProgress,
        fadeIn
      });

      // 2. После полного показа overlay
      if (typeof afterShow === 'function') {
        await afterShow();
      }

      // 3. Если нужно, сразу удалить текущую сцену
      if (disposeCurrentSceneOnStart) {
        await game.state.disposeCurrentScene();
      }

      // 4. Перед preload
      if (typeof beforePreload === 'function') {
        await beforePreload();
      }

      // 5. Доп. пауза
      if (beforePreloadDelay > 0) {
        await this.wait(beforePreloadDelay);
      }

      // 6. preload ассетов
      if (typeof preload === 'function') {
        await preload((progress) => {
          LoadingScreen.setProgress(progress);
        });
      }

      // 7. После preload
      if (typeof afterPreload === 'function') {
        await afterPreload();
      }

      const runSceneChangeIfNeeded = async () => {
        if (typeof beforeSceneChange === 'function') {
          await beforeSceneChange();
        }

        if (!skipSceneChange && sceneName && nextScene) {
          await game.state.change(sceneName, nextScene);
        }

        if (typeof afterSceneChange === 'function') {
          await afterSceneChange();
        }
      };

      const runHidePhase = async () => {
        if (typeof beforeHide === 'function') {
          await beforeHide();
        }

        const hidePromise = LoadingScreen.hide({ fadeOut });

        if (typeof onFadeOutStart === 'function') {
          await onFadeOutStart();
        }

        await hidePromise;

        if (typeof onFadeOutComplete === 'function') {
          await onFadeOutComplete();
        }
      };

      // 8. Автопереход
      if (mode === 'auto') {
        const elapsed = performance.now() - startedAt;
        const remaining = Math.max(0, minDuration - elapsed);

        if (remaining > 0) {
          await this.wait(remaining);
        }

        await runHidePhase();
        await runSceneChangeIfNeeded();
        return;
      }

      // 9. Переход по кнопке
      if (mode === 'button') {
        await new Promise(async (resolve) => {
          LoadingScreen.setContent({
            showProgress: false,
            showButton: true,
            buttonText,
            onContinue: resolve
          });
        });

        await runHidePhase();
        await runSceneChangeIfNeeded();
        return;
      }

      // 10. Переход по клику по экрану
      if (mode === 'screen') {
        await new Promise(async (resolve) => {
          LoadingScreen.setContent({
            showProgress: false,
            waitForScreenClick: true,
            continueText,
            onContinue: resolve
          });
        });

        await runHidePhase();
        await runSceneChangeIfNeeded();
        return;
      }

      throw new Error(`Неизвестный confirm.mode: ${mode}`);
    } catch (error) {
      console.error('[SceneTransitionManager.go] Ошибка перехода:', error);
      LoadingScreen.setError('Ошибка перехода. Проверь консоль и пути к файлам.');
      throw error;
    }
  }
}

export default SceneTransitionManager;