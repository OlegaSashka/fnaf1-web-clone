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
  MONITOR_TOGGLE_SOUND: 'assets/sounds/camera/monitor-toggle.wav',

  USAGE_METER: 'assets/images/camera/PowerUsege_103x32.png',

  MONITOR_TOGGLE: 'assets/images/camera/monitor-toggle_598x45.png',

  MONITOR_TRANSITION: 'assets/images/camera/cameraOpenClose.png',

  CAM_1A: 'assets/images/camera/cam-1a.png',
  CAM_1B: 'assets/images/camera/cam-1b.png',
  CAM_1C: 'assets/images/camera/cam-1c.png',
  CAM_2A: 'assets/images/camera/cam-2a.png',
  CAM_2A_FOXY_RUN_ANIM: 'assets/images/camera/cam-2A-foxy.png',
  CAM_2B: 'assets/images/camera/cam-2b.png',
  CAM_3: 'assets/images/camera/cam-3.png',
  CAM_4A: 'assets/images/camera/cam-4a.png',
  CAM_4B: 'assets/images/camera/cam-4b.png',
  CAM_5: 'assets/images/camera/cam-5.png',
  CAM_7: 'assets/images/camera/cam-7.png',
});

export const COMMON_NIGHT_ASSETS = [
  { type: 'image', src: NightAssetPaths.OFFICE_BASE },
  { type: 'image', src: NightAssetPaths.OFFICE_ANIMATRONIC },
  { type: 'image', src: NightAssetPaths.OFFICE_FREDDY },
  { type: 'image', src: NightAssetPaths.OFFICE_LIGHT },
  { type: 'image', src: NightAssetPaths.USAGE_METER },
  { type: 'image', src: NightAssetPaths.MONITOR_TOGGLE },
  { type: 'image', src: NightAssetPaths.MONITOR_TRANSITION },

  { type: 'image', src: NightAssetPaths.FAN },
  { type: 'image', src: NightAssetPaths.DOOR_SHEET },
  { type: 'image', src: NightAssetPaths.LEFT_DOOR_BUTTON },
  { type: 'image', src: NightAssetPaths.RIGHT_DOOR_BUTTON },

  { type: 'audio', src: NightAssetPaths.DOOR_TOGGLE_SOUND },
  { type: 'audio', src: NightAssetPaths.LIGHT_ON_SOUND },
  { type: 'audio', src: NightAssetPaths.FREDDY_NOSE_SOUND },
  { type: 'audio', src: NightAssetPaths.MONITOR_TOGGLE_SOUND },

  { type: 'image', src: NightAssetPaths.CAM_1A },
  { type: 'image', src: NightAssetPaths.CAM_1B },
  { type: 'image', src: NightAssetPaths.CAM_1C },
  { type: 'image', src: NightAssetPaths.CAM_2A },
  { type: 'image', src: NightAssetPaths.CAM_2A_FOXY_RUN_ANIM},
  { type: 'image', src: NightAssetPaths.CAM_2B },
  { type: 'image', src: NightAssetPaths.CAM_3 },
  { type: 'image', src: NightAssetPaths.CAM_4A },
  { type: 'image', src: NightAssetPaths.CAM_4B },
  { type: 'image', src: NightAssetPaths.CAM_5 },
  { type: 'image', src: NightAssetPaths.CAM_7 },
];