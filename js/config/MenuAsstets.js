const asset = (relativePath) => new URL(`../assets/${relativePath}`, import.meta.url).href;

export const MenuAssets = {
  MENU_FREDDY: asset('images/ui/Background/Menu-freddy.png'),
  MENU_BLINK: asset('images/ui/Blink/Menu-blink.png'),

  MAIN_DARKNESS_SOUND: asset('sounds/music/main-darkness-music.wav'),
};

export const MenuAssetIds = Object.freeze({
  MENU_FREDDY: 'menu-freddy',
  MENU_BLINK: 'menu-blink',

  MUSIC_MENU: 'music-menu',
  MENU_HOVER: 'menu-hover',
});

export const MENU_ASSETS = [
  { type: 'image', id: MenuAssetIds.MENU_FREDDY, src: MenuAssets.MENU_FREDDY },

  { type: 'image', id: MenuAssetIds.MENU_BLINK, src: MenuAssets.MENU_BLINK },

  { type: 'audio', id: MenuAssetIds.MUSIC_MENU, src: MenuAssets.MAIN_DARKNESS_SOUND, options: { loop: true, volume: 0.6 } },
];
