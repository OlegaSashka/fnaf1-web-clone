class Preloader {
  static loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve({ src, img, type: 'image' });
      img.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`));

      img.src = src;
    });
  }

  static loadAudio(src) {
    return new Promise((resolve, reject) => {
      const audio = new Howl({
        src: [src],
        preload: true,
        onload: () => resolve({ src, type: 'audio' }),
        onloaderror: (_, err) => reject(new Error(`Не удалось загрузить звук: ${src} (${err})`))
      });
    });
  }

  static async loadAssets(assets, onProgress = null, options = {}) {
    const { continueOnError = false } = options;
    const total = assets.length;

    if (total === 0) {
      if (onProgress) onProgress(100, 0, 0);
      return [];
    }

    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      const progress = Math.round((loaded / total) * 100);
      if (onProgress) onProgress(progress, loaded, total);
    };

    const tasks = assets.map(async (asset) => {
      try {
        let result;

        if (asset.type === 'image') {
          result = await Preloader.loadImage(asset.src);
        } else if (asset.type === 'audio') {
          result = await Preloader.loadAudio(asset.src);
        } else {
          throw new Error(`Неизвестный тип ассета: ${asset.type}`);
        }

        updateProgress();
        return { ok: true, asset, result };
      } catch (error) {
        updateProgress();

        if (!continueOnError) {
          throw error;
        }

        console.warn('[Preloader] Не удалось загрузить ассет, пропускаем:', asset.src, error);
        return { ok: false, asset, error };
      }
    });

    return Promise.all(tasks);
  }
}

export default Preloader;