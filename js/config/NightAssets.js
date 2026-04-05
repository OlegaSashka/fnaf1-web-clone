export const NightAssetIds = Object.freeze({
  OFFICE_BASE: 'office-base',
  OFFICE_ANIMATRONIC: 'office-animatronic',
  OFFICE_FREDDY: 'office-freddy',
  OFFICE_LIGHT: 'office-light',

  FAN: 'fan',
  DOOR_SHEET: 'door-sheet',
  LEFT_DOOR_BUTTON: 'left-door-button',
  RIGHT_DOOR_BUTTON: 'right-door-button',

  USAGE_METER: 'usage-meter',
  MONITOR_TOGGLE: 'monitor-toggle',
  MONITOR_TRANSITION: 'monitor-transition',

  DOOR_TOGGLE_SOUND: 'door-toggle',
  LIGHT_ON_SOUND: 'light-on',
  FREDDY_NOSE_SOUND: 'freddy-nose',
  MONITOR_TOGGLE_SOUND: 'monitor-toggle-sound',
  FAN_HUM_SOUND: 'fan-hum-sound',
  BACKGROUND_AMBIENCE_SOUND: 'background-ambience-sound',

  CAM_1A: 'cam-1a',
  CAM_1B: 'cam-1b',
  CAM_1C: 'cam-1c',
  CAM_2A: 'cam-2a',
  CAM_2A_FOXY_RUN_ANIM: 'cam-2a-foxy-run-anim',
  CAM_2B: 'cam-2b',
  CAM_3: 'cam-3',
  CAM_4A: 'cam-4a',
  CAM_4B: 'cam-4b',
  CAM_5: 'cam-5',
  CAM_7: 'cam-7',
});

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
  MONITOR_TOGGLE_SOUND: 'assets/sounds/camera/monitor-toggle.wav',
  BACKGROUND_AMBIENCE_SOUND: 'assets/sounds/ambience/background-ambience.wav',

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
  { type: 'image', id: NightAssetIds.OFFICE_BASE, src: NightAssetPaths.OFFICE_BASE },
  { type: 'image', id: NightAssetIds.OFFICE_ANIMATRONIC, src: NightAssetPaths.OFFICE_ANIMATRONIC },
  { type: 'image', id: NightAssetIds.OFFICE_FREDDY, src: NightAssetPaths.OFFICE_FREDDY },
  { type: 'image', id: NightAssetIds.OFFICE_LIGHT, src: NightAssetPaths.OFFICE_LIGHT },

  { type: 'image', id: NightAssetIds.USAGE_METER, src: NightAssetPaths.USAGE_METER },
  { type: 'image', id: NightAssetIds.MONITOR_TOGGLE, src: NightAssetPaths.MONITOR_TOGGLE },
  { type: 'image', id: NightAssetIds.MONITOR_TRANSITION, src: NightAssetPaths.MONITOR_TRANSITION },

  { type: 'image', id: NightAssetIds.FAN, src: NightAssetPaths.FAN },
  { type: 'image', id: NightAssetIds.DOOR_SHEET, src: NightAssetPaths.DOOR_SHEET },
  { type: 'image', id: NightAssetIds.LEFT_DOOR_BUTTON, src: NightAssetPaths.LEFT_DOOR_BUTTON },
  { type: 'image', id: NightAssetIds.RIGHT_DOOR_BUTTON, src: NightAssetPaths.RIGHT_DOOR_BUTTON },

  { type: 'audio', id: NightAssetIds.DOOR_TOGGLE_SOUND, src: NightAssetPaths.DOOR_TOGGLE_SOUND, options: { volume: 0.4 } },
  { type: 'audio', id: NightAssetIds.LIGHT_ON_SOUND, src: NightAssetPaths.LIGHT_ON_SOUND, options: { volume: 0.35 } },
  { type: 'audio', id: NightAssetIds.FREDDY_NOSE_SOUND, src: NightAssetPaths.FREDDY_NOSE_SOUND, options: { volume: 0.5 } },
  { type: 'audio', id: NightAssetIds.MONITOR_TOGGLE_SOUND, src: NightAssetPaths.MONITOR_TOGGLE_SOUND, options: { volume: 0.45 } },
  { type: 'audio', id: NightAssetIds.FAN_HUM_SOUND, src: NightAssetPaths.FAN_HUM, options: {loop:true, volume: 0.2 } },
  { type: 'audio', id: NightAssetIds.BACKGROUND_AMBIENCE_SOUND, src: NightAssetPaths.BACKGROUND_AMBIENCE_SOUND, options: {loop:true, volume: 0.5 } },

  { type: 'image', id: NightAssetIds.CAM_1A, src: NightAssetPaths.CAM_1A },
  { type: 'image', id: NightAssetIds.CAM_1B, src: NightAssetPaths.CAM_1B },
  { type: 'image', id: NightAssetIds.CAM_1C, src: NightAssetPaths.CAM_1C },
  { type: 'image', id: NightAssetIds.CAM_2A, src: NightAssetPaths.CAM_2A },
  { type: 'image', id: NightAssetIds.CAM_2A_FOXY_RUN_ANIM, src: NightAssetPaths.CAM_2A_FOXY_RUN_ANIM },
  { type: 'image', id: NightAssetIds.CAM_2B, src: NightAssetPaths.CAM_2B },
  { type: 'image', id: NightAssetIds.CAM_3, src: NightAssetPaths.CAM_3 },
  { type: 'image', id: NightAssetIds.CAM_4A, src: NightAssetPaths.CAM_4A },
  { type: 'image', id: NightAssetIds.CAM_4B, src: NightAssetPaths.CAM_4B },
  { type: 'image', id: NightAssetIds.CAM_5, src: NightAssetPaths.CAM_5 },
  { type: 'image', id: NightAssetIds.CAM_7, src: NightAssetPaths.CAM_7 },
];