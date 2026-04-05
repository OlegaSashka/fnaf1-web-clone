export const TransitionAssets = {
  NEW_GAME: 'assets/images/ui/Loading/StartFirstNight.png',
  NIGHT_COMPLETE: 'assets/images/ui/Loading/Win.png',
  GAME_OVER: 'assets/images/ui/Loading/Lose.png',

  BLIP: 'assets/sounds/ui/blip3.wav',
};

export const TransitionAssetIds = Object.freeze({
  NEW_GAME: 'transition-new-game',
  NIGHT_COMPLETE: 'transition-night-complete',
  GAME_OVER: 'transition-game-over',

  BLIP: 'blip',
});

export const TRANSITION_ASSETS = [
  { type: 'image', id: TransitionAssetIds.NEW_GAME, src: TransitionAssets.NEW_GAME },
  { type: 'image', id: TransitionAssetIds.NIGHT_COMPLETE, src: TransitionAssets.NIGHT_COMPLETE },
  { type: 'image', id: TransitionAssetIds.GAME_OVER, src: TransitionAssets.GAME_OVER },

  { type: 'audio', id: TransitionAssetIds.BLIP, src: TransitionAssets.BLIP, options: { volume: 0.3 } },
];