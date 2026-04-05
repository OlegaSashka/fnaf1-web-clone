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
  { type: 'image', id: 'office-base', src: NightAssetPaths.OFFICE_BASE },
  { type: 'image', id: 'office-animatronic', src: NightAssetPaths.OFFICE_ANIMATRONIC },
  { type: 'image', id: 'office-freddy', src: NightAssetPaths.OFFICE_FREDDY },
  { type: 'image', id: 'office-light', src: NightAssetPaths.OFFICE_LIGHT },

  { type: 'image', id: 'usage-meter', src: NightAssetPaths.USAGE_METER },
  { type: 'image', id: 'monitor-toggle', src: NightAssetPaths.MONITOR_TOGGLE },
  { type: 'image', id: 'monitor-transition', src: NightAssetPaths.MONITOR_TRANSITION },

  { type: 'image', id: 'fan', src: NightAssetPaths.FAN },
  { type: 'image', id: 'door-sheet', src: NightAssetPaths.DOOR_SHEET },
  { type: 'image', id: 'left-door-button', src: NightAssetPaths.LEFT_DOOR_BUTTON },
  { type: 'image', id: 'right-door-button', src: NightAssetPaths.RIGHT_DOOR_BUTTON },

  { type: 'audio', id: 'door-toggle', src: NightAssetPaths.DOOR_TOGGLE_SOUND, options: { volume: 0.4 } },
  { type: 'audio', id: 'light-on', src: NightAssetPaths.LIGHT_ON_SOUND, options: { volume: 0.35 } },
  { type: 'audio', id: 'freddy-nose', src: NightAssetPaths.FREDDY_NOSE_SOUND, options: { volume: 0.5 } },
  { type: 'audio', id: 'monitor-toggle-sound', src: NightAssetPaths.MONITOR_TOGGLE_SOUND, options: { volume: 0.45 } },

  { type: 'image', id: 'cam-1a', src: NightAssetPaths.CAM_1A },
  { type: 'image', id: 'cam-1b', src: NightAssetPaths.CAM_1B },
  { type: 'image', id: 'cam-1c', src: NightAssetPaths.CAM_1C },
  { type: 'image', id: 'cam-2a', src: NightAssetPaths.CAM_2A },
  { type: 'image', id: 'cam-2a-foxy-run-anim', src: NightAssetPaths.CAM_2A_FOXY_RUN_ANIM },
  { type: 'image', id: 'cam-2b', src: NightAssetPaths.CAM_2B },
  { type: 'image', id: 'cam-3', src: NightAssetPaths.CAM_3 },
  { type: 'image', id: 'cam-4a', src: NightAssetPaths.CAM_4A },
  { type: 'image', id: 'cam-4b', src: NightAssetPaths.CAM_4B },
  { type: 'image', id: 'cam-5', src: NightAssetPaths.CAM_5 },
  { type: 'image', id: 'cam-7', src: NightAssetPaths.CAM_7 },
];