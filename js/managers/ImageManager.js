class ImageManager {
  constructor() {
    this.images = {};
  }

  add(id, img) {
    if (!id || !img) {
      console.warn('[ImageManager] add: нужен id и img');
      return null;
    }

    this.images[id] = img;
    return img;
  }

  get(id) {
    return this.images[id] ?? null;
  }

  has(id) {
    return !!this.images[id];
  }

  remove(id) {
    delete this.images[id];
  }

  clear() {
    this.images = {};
  }
}

const Images = new ImageManager();

export default Images;