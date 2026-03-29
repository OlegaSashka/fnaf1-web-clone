// js/SoundManager.js

class SoundManager {
  constructor() {
    this.sounds = {};      // хранилище всех звуков
    this.muted = false;    // глобальный mute
    this.masterVolume = 1; // глобальная громкость (0–1)
  }

  /**
   * Добавляет звук в менеджер
   * @param {string} id — короткое имя для вызова (например 'door-close')
   * @param {string|string[]} src — путь к файлу или массив путей (для fallback)
   * @param {object} [options] — настройки Howl (volume, loop, etc.)
   */
  add(id, src, options = {}) {
    if (this.sounds[id]) {
      console.warn(`Звук с id "${id}" уже существует, перезаписываем`);
    }

    this.sounds[id] = new Howl({
      src: Array.isArray(src) ? src : [src],
      volume: options.volume ?? 1,
      loop: options.loop ?? false,
      preload: options.preload ?? true,
      ...options
    });

    console.log(`Добавлен звук: ${id} (${src})`);
  }

  /**
   * Воспроизводит звук
   * @param {string} id
   * @returns {Howl|null} экземпляр или null, если звука нет
   */
  play(id) {
    if (this.muted) return null;
    const sound = this.sounds[id];
    if (!sound) {
      console.warn(`Звук "${id}" не найден`);
      return null;
    }
    sound.volume(this.masterVolume * (sound._volume || 1));
    sound.play();
    return sound;
  }

    /**
     * Запускает звук ровно один раз:
     * - если уже играет — ничего не делает
     * - если закончился — запускает заново
     * - если loop: true — всё равно играет один цикл (или до stop)
     * @param {string} id
     * @returns {Howl|null}
     */
    playOnce(id) {
    if (this.muted) return null;

    const sound = this.sounds[id];
    if (!sound) {
        console.warn(`Звук "${id}" не найден`);
        return null;
    }

    // Ключ: проверяем playing() — если уже звучит, не трогаем
    if (sound.playing()) {
        console.log(`Звук "${id}" уже играет — пропускаем`);
        return sound;
    }

    // Устанавливаем громкость и запускаем
    sound.volume(this.masterVolume * (sound._volume || 1));
    sound.play();

    console.log(`Запущен звук "${id}" (один раз)`);
    return sound;
    }

  /**
   * Останавливает конкретный звук
   */
  stop(id) {
    const sound = this.sounds[id];
    if (sound) sound.stop();
  }

  /**
   * Ставит на паузу
   */
  pause(id) {
    const sound = this.sounds[id];
    if (sound) sound.pause();
  }

  /**
   * Глобальный mute / unmute
   */
  toggleMute() {
    this.muted = !this.muted;
    Object.values(this.sounds).forEach(s => s.mute(this.muted));
    console.log(`Звуки ${this.muted ? 'выключены' : 'включены'}`);
  }

  /**
   * Устанавливает глобальную громкость (0–1)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(s => {
      s.volume(this.masterVolume * (s._volume || 1));
    });
  }

  /**
   * Плавное затухание звука (fade out)
   * @param {string} id
   * @param {number} duration — в миллисекундах
   */
  fadeOut(id, duration = 1000) {
    const sound = this.sounds[id];
    if (!sound) return;
    sound.fade(sound.volume(), 0, duration);
    setTimeout(() => sound.stop(), duration);
  }

  /**
   * Плавное нарастание (fade in)
   */
  fadeIn(id, duration = 1000, targetVolume = 1) {
    const sound = this.sounds[id];
    if (!sound) return;
    sound.volume(0);
    sound.play();
    sound.fade(0, targetVolume * this.masterVolume, duration);
  }
}

// Создаём глобальный менеджер (или экспортируем, если используешь modules)
const Sound = new SoundManager();

export default Sound;