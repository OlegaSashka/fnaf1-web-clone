import Sounds from './managers/SoundLibrary.js';
import Images from './managers/ImageLibrary.js';

class Preloader {
  static loadImage(asset) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        if (asset.id) {
          Images.add(asset.id, img);
        }

        resolve({
          id: asset.id ?? null,
          src: asset.src,
          img,
          type: 'image'
        });
      };

      img.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${asset.src}`));

      img.src = asset.src;
    });
  }

  static loadAudio(asset) {
    return new Promise((resolve, reject) => {
      try {
        if (!asset.id) {
          reject(new Error(`Для audio ассета нужен id: ${asset.src}`));
          return;
        }

        const sound = Sounds.add(asset.id, asset.src, asset.options ?? {});

        if (!sound) {
          reject(new Error(`Не удалось зарегистрировать звук: ${asset.src}`));
          return;
        }

        if (sound.state && sound.state() === 'loaded') {
          resolve({
            id: asset.id,
            src: asset.src,
            type: 'audio'
          });
          return;
        }

        sound.once('load', () => {
          resolve({
            id: asset.id,
            src: asset.src,
            type: 'audio'
          });
        });

        sound.once('loaderror', (_, err) => {
          reject(new Error(`Не удалось загрузить звук: ${asset.src} (${err})`));
        });
      } catch (error) {
        reject(error);
      }
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
          result = await Preloader.loadImage(asset);
        } else if (asset.type === 'audio') {
          result = await Preloader.loadAudio(asset);
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