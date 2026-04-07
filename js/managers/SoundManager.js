import Sounds from './SoundLibrary.js';

class SoundManager {
  constructor() {
    this.muted = false;
    this.masterVolume = 1;
  }

  #applyPlaybackOptions(sound, meta, options = {}) {
    const volume = options.volume ?? meta?.baseVolume ?? 0.5;
    const loop = options.loop ?? meta?.baseLoop ?? false;

    const safeVolume = Math.max(0, Math.min(1, volume));

    sound.loop(loop);
    sound.volume(safeVolume * this.masterVolume);
  }

  play(id, options = {}) {
    if (this.muted) return null;

    const sound = Sounds.get(id);
    const meta = Sounds.getMeta(id);

    if (!sound) {
      console.warn(`Звук "${id}" не найден`);
      return null;
    }

    this.#applyPlaybackOptions(sound, meta, options);
    sound.play();
    return sound;
  }

  playOnce(id, options = {}) {
    if (this.muted) return null;

    const sound = Sounds.get(id);
    const meta = Sounds.getMeta(id);

    if (!sound) {
      console.warn(`Звук "${id}" не найден`);
      return null;
    }

    if (sound.playing()) {
      return sound;
    }

    this.#applyPlaybackOptions(sound, meta, {
      ...options,
      loop: false
    });

    sound.play();
    return sound;
  }

  stop(id) {
    const sound = Sounds.get(id);
    if (sound) sound.stop();
  }

  stopAll({ exceptIds = [] } = {}) {
    const except = new Set(exceptIds);

    for (const id of Object.keys(Sounds.sounds ?? {})) {
      if (except.has(id)) continue;
      this.stop(id);
    }
  }

  pause(id) {
    const sound = Sounds.get(id);
    if (sound) sound.pause();
  }

  toggleMute() {
    this.muted = !this.muted;
    Object.values(Sounds.sounds).forEach(sound => sound.mute(this.muted));
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setVolume(id, volume) {
    const sound = Sounds.get(id);
    if (!sound) return;

    const safeVolume = Math.max(0, Math.min(1, volume));
    sound.volume(safeVolume * this.masterVolume);
  }

  resetVolume(id) {
    const sound = Sounds.get(id);
    const meta = Sounds.getMeta(id);
    if (!sound || !meta) return;

    sound.volume(meta.baseVolume * this.masterVolume);
  }

  setLoop(id, loop) {
    const sound = Sounds.get(id);
    if (!sound) return;

    sound.loop(!!loop);
  }

  resetLoop(id) {
    const sound = Sounds.get(id);
    const meta = Sounds.getMeta(id);
    if (!sound || !meta) return;

    sound.loop(meta.baseLoop);
  }

  resetToBase(id) {
    const sound = Sounds.get(id);
    const meta = Sounds.getMeta(id);
    if (!sound || !meta) return;

    sound.loop(meta.baseLoop);
    sound.volume(meta.baseVolume * this.masterVolume);
  }

  fadeOut(id, duration = 1000) {
    const sound = Sounds.get(id);
    if (!sound) return;

    sound.fade(sound.volume(), 0, duration);
    setTimeout(() => sound.stop(), duration);
  }

  fadeIn(id, duration = 1000, targetVolume = null) {
    const sound = Sounds.get(id);
    const meta = Sounds.getMeta(id);
    if (!sound) return;

    const finalVolume = Math.max(
      0,
      Math.min(1, targetVolume ?? meta?.baseVolume ?? 0.5)
    );

    sound.volume(0);
    sound.play();
    sound.fade(0, finalVolume * this.masterVolume, duration);
  }
}

const Sound = new SoundManager();

export default Sound;