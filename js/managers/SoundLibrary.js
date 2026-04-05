class SoundLibrary {
  constructor() {
    this.sounds = {};
  }

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

    return this.sounds[id];
  }

  get(id) {
    return this.sounds[id] ?? null;
  }

  has(id) {
    return !!this.sounds[id];
  }

  remove(id) {
    delete this.sounds[id];
  }

  clear() {
    this.sounds = {};
  }
}

const Sounds = new SoundLibrary();

export default Sounds;