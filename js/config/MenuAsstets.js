export const MenuImages = {
  MENU_FREDDY: 'assets/images/ui/Background/Menu-freddy.png',
  MENU_NOISE: 'assets/images/ui/NoiseTV/Noise.png',
  MENU_BLINK: 'assets/images/ui/Blink/Menu-blink.png',
};

export const MenuAssetIds = Object.freeze({
  MENU_FREDDY: 'menu-freddy',
  MENU_NOISE: 'menu-noise',
  MENU_BLINK: 'menu-blink',

  MUSIC_MENU: 'music-menu',
  MUSIC_TV: 'music-tv',
  MENU_HOVER: 'menu-hover',
});

export const MENU_ASSETS = [
  { type: 'image', id: MenuAssetIds.MENU_FREDDY, src: MenuImages.MENU_FREDDY },
  { type: 'image', id: MenuAssetIds.MENU_NOISE, src: MenuImages.MENU_NOISE },
  { type: 'image', id: MenuAssetIds.MENU_BLINK, src: MenuImages.MENU_BLINK },

  { type: 'audio', id: MenuAssetIds.MUSIC_MENU, src: 'assets/sounds/music/main-darkness-music.wav', options: { loop: true, volume: 0.6 } },
  { type: 'audio', id: MenuAssetIds.MUSIC_TV, src: 'assets/sounds/music/static2-menu.wav', options: { loop: true, volume: 0.3 } },
  { type: 'audio', id: MenuAssetIds.MENU_HOVER, src: 'assets/sounds/ui/blip3.wav', options: { volume: 0.3 } },
];