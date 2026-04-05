class SoundLibrary {
  constructor() {
    this.sounds = {};
    this.meta = {};
  }

  add(id, src, options = {}) {
    if (this.sounds[id]) {
      console.warn(`Звук с id "${id}" уже существует, перезаписываем`);
    }

    const baseVolume = options.volume ?? 0.5;
    const baseLoop = options.loop ?? false;

    const sound = new Howl({
      src: Array.isArray(src) ? src : [src],
      volume: baseVolume,
      loop: baseLoop,
      preload: options.preload ?? true,
      ...options
    });

    this.sounds[id] = sound;
    this.meta[id] = {
      baseVolume,
      baseLoop
    };

    return sound;
  }

  get(id) {
    return this.sounds[id] ?? null;
  }

  getMeta(id) {
    return this.meta[id] ?? null;
  }

  has(id) {
    return !!this.sounds[id];
  }

  remove(id) {
    delete this.sounds[id];
    delete this.meta[id];
  }

  clear() {
    this.sounds = {};
    this.meta = {};
  }

  setBaseVolume(id, volume) {
    const meta = this.meta[id];
    const sound = this.sounds[id];
    if (!meta || !sound) return;

    const safeVolume = Math.max(0, Math.min(1, volume));
    meta.baseVolume = safeVolume;
    sound.volume(safeVolume);
  }

  setBaseLoop(id, loop) {
    const meta = this.meta[id];
    const sound = this.sounds[id];
    if (!meta || !sound) return;

    const safeLoop = !!loop;
    meta.baseLoop = safeLoop;
    sound.loop(safeLoop);
  }

  resetToBase(id) {
    const meta = this.meta[id];
    const sound = this.sounds[id];
    if (!meta || !sound) return;

    sound.volume(meta.baseVolume);
    sound.loop(meta.baseLoop);
  }
}

const Sounds = new SoundLibrary();

export default Sounds;