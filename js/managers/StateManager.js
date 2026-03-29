class StateManager {
  constructor() {
    this.currentScene = null;
    this.currentSceneName = null;
    this.isChanging = false;
  }

  async disposeCurrentScene() {
    if (this.isChanging) return;
    if (!this.currentScene) return;

    try {
      if (typeof this.currentScene.exit === 'function') {
        await this.currentScene.exit();
      }
    } catch (error) {
      console.error('[StateManager] Ошибка удаления текущей сцены:', error);
    } finally {
      this.currentScene = null;
      this.currentSceneName = null;
    }
  }

  async change(sceneName, sceneInstance, options = {}) {
    const { skipExit = false } = options;

    if (this.isChanging) return;
    this.isChanging = true;

    try {
      if (!skipExit && this.currentScene && typeof this.currentScene.exit === 'function') {
        await this.currentScene.exit();
      }

      this.currentScene = sceneInstance;
      this.currentSceneName = sceneName;

      if (this.currentScene && typeof this.currentScene.enter === 'function') {
        await this.currentScene.enter();
      }
    } catch (error) {
      console.error(`[StateManager] Ошибка смены сцены "${sceneName}":`, error);
    } finally {
      this.isChanging = false;
    }
  }

  async reload() {
    if (!this.currentScene) return;

    const SceneClass = this.currentScene.constructor;
    const nextScene = new SceneClass(this.currentScene.game);

    await this.change(this.currentSceneName, nextScene);
  }
}

export default StateManager;