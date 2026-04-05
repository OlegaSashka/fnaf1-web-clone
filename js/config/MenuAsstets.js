export const MenuAssets = {
  MENU_FREDDY: 'assets/images/ui/Background/Menu-freddy.png',
  MENU_NOISE: 'assets/images/ui/NoiseTV/Noise.png',
  MENU_BLINK: 'assets/images/ui/Blink/Menu-blink.png',

  MAIN_DARKNESS_SOUND: 'assets/sounds/music/main-darkness-music.wav',
};

export const MenuAssetIds = Object.freeze({
  MENU_FREDDY: 'menu-freddy',
  MENU_NOISE: 'menu-noise',
  MENU_BLINK: 'menu-blink',

  MUSIC_MENU: 'music-menu',
  MENU_HOVER: 'menu-hover',
});

export const MENU_ASSETS = [
  { type: 'image', id: MenuAssetIds.MENU_FREDDY, src: MenuAssets.MENU_FREDDY },
  { type: 'image', id: MenuAssetIds.MENU_NOISE, src: MenuAssets.MENU_NOISE },
  { type: 'image', id: MenuAssetIds.MENU_BLINK, src: MenuAssets.MENU_BLINK },

  { type: 'audio', id: MenuAssetIds.MUSIC_MENU, src: MenuAssets.MAIN_DARKNESS_SOUND, options: { loop: true, volume: 0.6 } },
];