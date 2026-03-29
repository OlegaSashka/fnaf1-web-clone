const STORAGE_KEY = 'fnaf-clone-progress';

class GameProgress {
  static getDefaultData() {
    return {
      currentNight: 0
    };
  }

  static load() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return this.getDefaultData();
    }

    try {
      const data = {
        ...this.getDefaultData(),
        ...JSON.parse(raw)
      };

      if (typeof data.currentNight !== 'number' || Number.isNaN(data.currentNight)) {
        data.currentNight = 0;
      }

      if (data.currentNight < 0) {
        data.currentNight = 0;
      }

      return data;
    } catch (error) {
      console.warn('[GameProgress] Не удалось прочитать сохранение, сбрасываем.', error);
      return this.getDefaultData();
    }
  }

  static save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static getCurrentNight() {
    return this.load().currentNight ?? 0;
  }

  static hasProgress() {
    return this.getCurrentNight() > 0;
  }

  static setCurrentNight(nightNumber) {
    const data = this.load();
    data.currentNight = Math.max(0, Number(nightNumber) || 0);
    this.save(data);
  }

  static startNewGame() {
    this.setCurrentNight(1);
    return 1;
  }

  static getContinueNight() {
    const currentNight = this.getCurrentNight();
    return currentNight > 0 ? currentNight : null;
  }

  static reset() {
    this.save(this.getDefaultData());
  }
}

export default GameProgress;