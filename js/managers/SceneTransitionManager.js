class SceneTransitionManager {
  
/**
 * Выполняет переход между сценами через LoadingScreen.
 *
 * @param {Object} params
 * @param {Object} params.game Объект игры с StateManager.
 * @param {string} params.sceneName Имя новой сцены.
 * @param {Object} params.nextScene Экземпляр новой сцены.
 * @param {(onProgress: (progress: number) => void) => Promise<void>} [params.preload]
 * Функция предзагрузки ассетов новой сцены.
 *
 * @param {Object} [params.loading]
 * @param {string|null} [params.loading.image=null] Картинка фона LoadingScreen.
 * @param {string} [params.loading.background='#000'] Цвет фона LoadingScreen.
 * @param {string} [params.loading.title='LOADING'] Заголовок LoadingScreen.
 * @param {string} [params.loading.text=''] Текст LoadingScreen.
 *
 * @param {Object} [params.confirm]
 * @param {'auto'|'button'|'screen'} [params.confirm.mode='auto']
 * Режим подтверждения после загрузки.
 * @param {string} [params.confirm.buttonText='Continue']
 * Текст кнопки для режима button.
 * @param {string} [params.confirm.continueText='Click anywhere to continue']
 * Текст подсказки для режима screen.
 *
 * @param {boolean} [params.disposeOnStart=false]
 * Если true, текущая сцена удаляется сразу после показа LoadingScreen.
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

    disposeCurrentSceneOnStart = false
  }) {
    const {
      image = null,
      background = '#000',
      title = 'LOADING',
      text = ''
    } = loading;

    const {
      mode = 'auto', // 'auto' | 'button' | 'screen'
      buttonText = 'Continue',
      continueText = 'Click anywhere to continue'
    } = confirm;

    try {
      // 1. Показываем экран загрузки
      LoadingScreen.show({
        image,
        background,
        title,
        text
      });

      // 2. Сразу убираем текущую сцену, если надо
      if (disposeCurrentSceneOnStart) {
        await game.state.disposeCurrentScene();
      }

      // 3. Грузим ассеты следующей сцены
      if (typeof preload === 'function') {
        await preload((progress) => {
          LoadingScreen.setProgress(progress);
        });
      }

      // 4. Автопереход
      if (mode === 'auto') {
        await game.state.change(sceneName, nextScene);
        LoadingScreen.hide();
        return;
      }

      // 5. Переход по кнопке
      if (mode === 'button') {
        await new Promise((resolve) => {
          LoadingScreen.show({
            image,
            background,
            title,
            text,
            showButton: true,
            buttonText,
            onContinue: resolve
          });
        });

        await game.state.change(sceneName, nextScene);
        LoadingScreen.hide();
        return;
      }

      // 6. Переход по клику по экрану
      if (mode === 'screen') {
        await new Promise((resolve) => {
          LoadingScreen.show({
            image,
            background,
            title,
            text,
            waitForScreenClick: true,
            continueText,
            onContinue: resolve
          });
        });

        await game.state.change(sceneName, nextScene);
        LoadingScreen.hide();
        return;
      }

      throw new Error(`Неизвестный confirm.mode: ${mode}`);
    } catch (error) {
      console.error('[SceneTransitionManager.go] Ошибка перехода:', error);
      LoadingScreen.setError('Ошибка перехода. Проверь консоль и пути к файлам.');
    }
  }
}