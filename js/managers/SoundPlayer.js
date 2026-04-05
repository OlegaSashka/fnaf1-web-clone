import Sounds from './SoundLibrary.js';

class SoundPlayer {
  constructor() {
    this.muted = false;
    this.masterVolume = 1;
  }

  play(id) {
    if (this.muted) return null;

    const sound = Sounds.get(id);
    if (!sound) {
      console.warn(`Звук "${id}" не найден`);
      return null;
    }

    sound.volume(this.masterVolume * (sound._volume || 1));
    sound.play();
    return sound;
  }

  playOnce(id) {
    if (this.muted) return null;

    const sound = Sounds.get(id);
    if (!sound) {
      console.warn(`Звук "${id}" не найден`);
      return null;
    }

    if (sound.playing()) {
      return sound;
    }

    sound.volume(this.masterVolume * (sound._volume || 1));
    sound.play();
    return sound;
  }

  stop(id) {
    const sound = Sounds.get(id);
    if (sound) sound.stop();
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
    Object.values(Sounds.sounds).forEach(sound => {
      sound.volume(this.masterVolume * (sound._volume || 1));
    });
  }

  fadeOut(id, duration = 1000) {
    const sound = Sounds.get(id);
    if (!sound) return;

    sound.fade(sound.volume(), 0, duration);
    setTimeout(() => sound.stop(), duration);
  }

  fadeIn(id, duration = 1000, targetVolume = 1) {
    const sound = Sounds.get(id);
    if (!sound) return;

    sound.volume(0);
    sound.play();
    sound.fade(0, targetVolume * this.masterVolume, duration);
  }
}

const Sound = new SoundPlayer();

export default Sound;