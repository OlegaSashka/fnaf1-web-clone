export const NightAssetPaths = Object.freeze({
  OFFICE_BASE: 'assets/images/office/Office_Base.png',
  OFFICE_ANIMATRONIC: 'assets/images/office/Office_Animatronic.png',
  OFFICE_FREDDY: 'assets/images/office/Office_Freddy.png',
  OFFICE_LIGHT: 'assets/images/office/Office_Light.png',

  FAN: 'assets/images/Fan/Fan.png',

  DOOR_SHEET: 'assets/images/OpenCloseDoor/OpenCloseDoor_229x720.png',
  LEFT_DOOR_BUTTON: 'assets/images/BtnDoorOpenCLose/DoorOpenCLoseBtn_left_92x247.png',
  RIGHT_DOOR_BUTTON: 'assets/images/BtnDoorOpenCLose/DoorOpenCLoseBtn_right_92x247.png',

  DOOR_CLOSE_SOUND: 'assets/sounds/game/door-close.wav',
  DOOR_OPEN_SOUND: 'assets/sounds/game/door-open.wav',

  DOOR_TOGGLE_SOUND: 'assets/sounds/doors/door-toggle.wav',
  LIGHT_ON_SOUND: 'assets/sounds/light/light-on.wav',
  FREDDY_NOSE_SOUND: 'assets/sounds/FreddyNose/freddy-nose-honk.wav',
  FAN_HUM: 'assets/sounds/fan/FanHum.wav',
  BACKGROUND_AMBIENCE: 'assets/sounds/ambience/background-ambience.wav',
});

export const COMMON_NIGHT_ASSETS = [
  { type: 'image', src: NightAssetPaths.OFFICE_BASE },
  { type: 'image', src: NightAssetPaths.OFFICE_ANIMATRONIC },
  { type: 'image', src: NightAssetPaths.OFFICE_FREDDY },
  { type: 'image', src: NightAssetPaths.OFFICE_LIGHT },

  { type: 'image', src: NightAssetPaths.FAN },
  { type: 'image', src: NightAssetPaths.DOOR_SHEET },
  { type: 'image', src: NightAssetPaths.LEFT_DOOR_BUTTON },
  { type: 'image', src: NightAssetPaths.RIGHT_DOOR_BUTTON },

  { type: 'audio', src: NightAssetPaths.DOOR_TOGGLE_SOUND },
  { type: 'audio', src: NightAssetPaths.LIGHT_ON_SOUND },
  { type: 'audio', src: NightAssetPaths.FREDDY_NOSE_SOUND },

  // когда добавишь звуки, просто раскомментируешь
  // { type: 'audio', src: NightAssetPaths.DOOR_CLOSE_SOUND },
  // { type: 'audio', src: NightAssetPaths.DOOR_OPEN_SOUND },
];