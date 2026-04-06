export const TransitionAssets = {
  NEW_GAME: 'assets/images/ui/Loading/StartFirstNight.png',
  NIGHT_COMPLETE: 'assets/images/ui/Loading/Win.png',
  GAME_OVER: 'assets/images/ui/Loading/Lose.png',

  TV_NOISE: 'assets/images/ui/NoiseTV/Noise.png',

  MUSIC_TV_SOUND: 'assets/sounds/music/static2-menu.wav',
  BLIP: 'assets/sounds/ui/blip3.wav',
};

export const TransitionAssetIds = Object.freeze({
  NEW_GAME: 'transition-new-game',
  NIGHT_COMPLETE: 'transition-night-complete',
  GAME_OVER: 'transition-game-over',

  TV_NOISE: 'menu-noise',

  BLIP: 'blip',
  MUSIC_TV_SOUND: 'music-tv',
});

export const TRANSITION_ASSETS = [
  { type: 'image', id: TransitionAssetIds.NEW_GAME, src: TransitionAssets.NEW_GAME },
  { type: 'image', id: TransitionAssetIds.NIGHT_COMPLETE, src: TransitionAssets.NIGHT_COMPLETE },
  { type: 'image', id: TransitionAssetIds.GAME_OVER, src: TransitionAssets.GAME_OVER },
  { type: 'image', id: TransitionAssetIds.TV_NOISE, src: TransitionAssets.TV_NOISE },

  { type: 'audio', id: TransitionAssetIds.BLIP, src: TransitionAssets.BLIP, options: { volume: 0.3 } },
  { type: 'audio', id: TransitionAssetIds.MUSIC_TV_SOUND, src: TransitionAssets.MUSIC_TV_SOUND, options: { loop: true, volume: 0.3 } },
];