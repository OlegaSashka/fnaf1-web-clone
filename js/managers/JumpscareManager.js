import AnimatedSprite from '../AnimatedSprite.js';
import Images from './ImageLibrary.js';
import Sound from './SoundManager.js';
import { NightAssetIds } from '../config/NightAssets.js';

class JumpscareManager {
  constructor({ canvas } = {}) {
    this.canvas = canvas ?? null;
    this.sprite = null;
    this.isPlaying = false;
  }

  async init() {
    if (!this.canvas || this.sprite) return;

    this.sprite = new AnimatedSprite(
      this.canvas,
      Images.get(NightAssetIds.BONNIE_JUMPSCARE),
      20,
      {
        frameWidth: 1600,
        frameHeight: 720,
        direction: 'vertical',
        drawX: 0,
        drawY: 0,
        drawWidth: this.canvas.width,
        drawHeight: this.canvas.height
      }
    );

    this.sprite.clear();
  }

  async play({
    imageId,
    soundId = null,
    soundDelayMs = 0,
    frameWidth = 1600,
    frameHeight = 720,
    direction = 'vertical',
    fps = 25,
    hideOnStop = false
  } = {}) {
    if (!this.sprite || this.isPlaying) return;

    this.isPlaying = true;

    let soundTimeout = null;

    try {
      if (soundId) {
        Sound.stop(soundId);

        if (soundDelayMs > 0) {
          soundTimeout = setTimeout(() => {
            Sound.play(soundId);
          }, soundDelayMs);
        } else {
          Sound.play(soundId);
        }
      }

      await this.sprite.setSourceById(imageId, {
        frameWidth,
        frameHeight,
        direction,
        drawWidth: this.canvas.width,
        drawHeight: this.canvas.height,
        fps,
        showFrame: 0
      });

      await this.sprite.playOnce({
        fromFrame: 0,
        toFrame: this.sprite.totalFrames - 1,
        holdLastFrame: !hideOnStop,
        clearOnFinish: hideOnStop
      });
    } finally {
      this.isPlaying = false;
    }
  }

  async playBonnie({ soundDelayMs = 40 } = {}) {
    return this.play({
      imageId: NightAssetIds.BONNIE_JUMPSCARE,
      soundId: NightAssetIds.JUMPSCARE_SOUND,
      soundDelayMs,
      frameWidth: 1600,
      frameHeight: 720,
      direction: 'vertical',
      fps: 25,
      hideOnStop: false
    });
  }

  stop({ clear = true } = {}) {
    if (!this.sprite) return;
    this.sprite.stop({ clear });
    this.isPlaying = false;
  }

  destroy() {
    this.stop({ clear: true });
    this.sprite = null;
    this.canvas = null;
  }
}

export default JumpscareManager;