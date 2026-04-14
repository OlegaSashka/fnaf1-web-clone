export const NightAssetIds = Object.freeze({
  OFFICE_BASE: 'office-base',
  OFFICE_FREDDY: 'office-freddy',
  OFFICE_LIGHT: 'office-light',

  FAN: 'fan',
  DOOR_SHEET: 'door-sheet',
  LEFT_DOOR_BUTTON: 'left-door-button',
  RIGHT_DOOR_BUTTON: 'right-door-button',

  USAGE_METER: 'usage-meter',
  MONITOR_TOGGLE: 'monitor-toggle',
  MONITOR_TRANSITION: 'monitor-transition',

  BONNIE_JUMPSCARE: 'bonnie-jumpscare',
  CHICA_JUMPSCARE: 'chica-jumpscare',
  ERROR_BUTTON_SOUND: 'error-button-sound',

  JUMPSCARE_SOUND: 'bonnie-jumpscare-sound',
  DOOR_TOGGLE_SOUND: 'door-toggle',
  LIGHT_ON_SOUND: 'light-on',
  FREDDY_NOSE_SOUND: 'freddy-nose',
  MONITOR_TOGGLE_SOUND: 'monitor-toggle-sound',
  FAN_HUM_SOUND: 'fan-hum-sound',
  BACKGROUND_AMBIENCE_SOUND: 'background-ambience-sound',

  POWER_DOWN_SOUND: 'power-down-sound',

  FREDDY_POWEROUT_MUSIC_SOUND: 'freddy-powerout-music-sound',
  FREDDY_JUMPSCARE_ALT: 'freddy-jumpscare-alt',

  KITCHEN_SOUND_1: 'kitchen-sound-1',
  KITCHEN_SOUND_2: 'kitchen-sound-2',
  KITCHEN_SOUND_3: 'kitchen-sound-3',
  KITCHEN_SOUND_4: 'kitchen-sound-4',

  ANIMATRONIC_MOVE_SOUND: 'bonnie-move-sound',
  DOOR_SCARE_SOUND: 'door-scare-sound',

  VICTORY_BELLS_SOUND: 'victory-bells-sound',
  VICTORY_KIDS_CHEER_SOUND: 'victory-kids-cheer-sound',

  MONITOR_BLINK: 'menu-blink-camera',

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

const asset = (relativePath) => new URL('../../assets/${relativePath}', import.meta.url).href;

export const NightAssetPaths = Object.freeze({
  OFFICE_BASE: asset('images/office/Office_Base.png'),
  OFFICE_FREDDY: asset('images/office/Office_Freddy.png'),
  OFFICE_LIGHT: asset('images/office/Office_Light.png'),

  FAN: asset('images/Fan/Fan.png'),

  DOOR_SHEET: asset('images/OpenCloseDoor/OpenCloseDoor_229x720.png'),
  LEFT_DOOR_BUTTON: asset('images/BtnDoorOpenCLose/DoorOpenCLoseBtn_left_92x247.png'),
  RIGHT_DOOR_BUTTON: asset('images/BtnDoorOpenCLose/DoorOpenCLoseBtn_right_92x247.png'),

  DOOR_CLOSE_SOUND: asset('sounds/game/door-close.wav'),
  DOOR_OPEN_SOUND: asset('sounds/game/door-open.wav'),

  BONNIE_JUMPSCARE: asset('images/jumpscares/Bonnie_Jumpscare.png'),
  CHICA_JUMPSCARE: asset('images/jumpscares/Chica_Jumpscare.png'),
  JUMPSCARE_SOUND: asset('sounds/jumpscares/jumpscare.wav'),

  ERROR_BUTTON_SOUND: asset('sounds/doors/error.wav'),
  DOOR_TOGGLE_SOUND: asset('sounds/doors/door-toggle.wav'),
  LIGHT_ON_SOUND: asset('sounds/light/light-on.wav'),
  FREDDY_NOSE_SOUND: asset('sounds/FreddyNose/freddy-nose-honk.wav'),
  FAN_HUM: asset('sounds/fan/FanHum.wav'),
  MONITOR_TOGGLE_SOUND: asset('sounds/camera/monitor-toggle.wav'),
  BACKGROUND_AMBIENCE_SOUND: asset('sounds/ambience/background-ambience.wav'),

  POWER_DOWN_SOUND: asset('sounds/office/power-down.wav'),

  FREDDY_POWEROUT_MUSIC_SOUND: asset('sounds/office/music-box.wav'),
  FREDDY_JUMPSCARE_ALT: asset('images/jumpscares/Freddy_Jumpscare_ALT.png'),

  KITCHEN_SOUND_1: asset('sounds/kitchen/kitchen-1.wav'),
  KITCHEN_SOUND_2: asset('sounds/kitchen/kitchen-2.wav'),
  KITCHEN_SOUND_3: asset('sounds/kitchen/kitchen-3.wav'),
  KITCHEN_SOUND_4: asset('sounds/kitchen/kitchen-4.wav'),

  ANIMATRONIC_MOVE_SOUND: asset('sounds/animatronics/deep_steps.wav'),
  DOOR_SCARE_SOUND: asset('sounds/doors/door-scare.wav'),

  VICTORY_BELLS_SOUND: asset('sounds/win/victory-bells.wav'),
  VICTORY_KIDS_CHEER_SOUND: asset('sounds/win/victory-kids-cheer.wav'),

  USAGE_METER: asset('images/camera/PowerUsege_103x32.png'),

  MONITOR_TOGGLE: asset('images/camera/monitor-toggle_598x45.png'),

  MONITOR_TRANSITION: asset('images/camera/cameraOpenClose.png'),

  MONITOR_BLINK: asset('images/ui/Blink/Menu-blink-camera.png'),
  
  CAM_1A: asset('images/camera/cam-1a.png'),
  CAM_1B: asset('images/camera/cam-1b.png'),
  CAM_1C: asset('images/camera/cam-1c.png'),
  CAM_2A: asset('images/camera/cam-2a.png'),
  CAM_2A_FOXY_RUN_ANIM: asset('images/camera/cam-2A-foxy.png'),
  CAM_2B: asset('images/camera/cam-2b.png'),
  CAM_3: asset('images/camera/cam-3.png'),
  CAM_4A: asset('images/camera/cam-4a.png'),
  CAM_4B: asset('images/camera/cam-4b.png'),
  CAM_5: asset('images/camera/cam-5.png'),
  CAM_7: asset('images/camera/cam-7.png'),
});

export const COMMON_NIGHT_ASSETS = [
  { type: 'image', id: NightAssetIds.OFFICE_BASE, src: NightAssetPaths.OFFICE_BASE },
  { type: 'image', id: NightAssetIds.OFFICE_FREDDY, src: NightAssetPaths.OFFICE_FREDDY },
  { type: 'image', id: NightAssetIds.OFFICE_LIGHT, src: NightAssetPaths.OFFICE_LIGHT },

  { type: 'image', id: NightAssetIds.USAGE_METER, src: NightAssetPaths.USAGE_METER },
  { type: 'image', id: NightAssetIds.MONITOR_TOGGLE, src: NightAssetPaths.MONITOR_TOGGLE },
  { type: 'image', id: NightAssetIds.MONITOR_TRANSITION, src: NightAssetPaths.MONITOR_TRANSITION },

  { type: 'image', id: NightAssetIds.FAN, src: NightAssetPaths.FAN },
  { type: 'image', id: NightAssetIds.DOOR_SHEET, src: NightAssetPaths.DOOR_SHEET },
  { type: 'image', id: NightAssetIds.LEFT_DOOR_BUTTON, src: NightAssetPaths.LEFT_DOOR_BUTTON },
  { type: 'image', id: NightAssetIds.RIGHT_DOOR_BUTTON, src: NightAssetPaths.RIGHT_DOOR_BUTTON },

  { type: 'image', id: NightAssetIds.MONITOR_BLINK, src: NightAssetPaths.MONITOR_BLINK},

  { type: 'image', id: NightAssetIds.BONNIE_JUMPSCARE, src: NightAssetPaths.BONNIE_JUMPSCARE },
  { type: 'image', id: NightAssetIds.CHICA_JUMPSCARE, src: NightAssetPaths.CHICA_JUMPSCARE },

  { type: 'audio', id: NightAssetIds.JUMPSCARE_SOUND, src: NightAssetPaths.JUMPSCARE_SOUND, options: { volume: 0.5 } },
  { type: 'audio', id: NightAssetIds.DOOR_TOGGLE_SOUND, src: NightAssetPaths.DOOR_TOGGLE_SOUND, options: { volume: 0.4 } },
  { type: 'audio', id: NightAssetIds.LIGHT_ON_SOUND, src: NightAssetPaths.LIGHT_ON_SOUND, options: { volume: 0.35 } },
  { type: 'audio', id: NightAssetIds.FREDDY_NOSE_SOUND, src: NightAssetPaths.FREDDY_NOSE_SOUND, options: { volume: 0.5 } },
  { type: 'audio', id: NightAssetIds.MONITOR_TOGGLE_SOUND, src: NightAssetPaths.MONITOR_TOGGLE_SOUND, options: { volume: 0.45 } },
  { type: 'audio', id: NightAssetIds.FAN_HUM_SOUND, src: NightAssetPaths.FAN_HUM, options: {loop:true, volume: 0.2 } },
  { type: 'audio', id: NightAssetIds.BACKGROUND_AMBIENCE_SOUND, src: NightAssetPaths.BACKGROUND_AMBIENCE_SOUND, options: {loop:true, volume: 0.5 } },
  { type: 'audio', id: NightAssetIds.ERROR_BUTTON_SOUND, src: NightAssetPaths.ERROR_BUTTON_SOUND, options: { volume: 0.5 } },

  { type: 'audio', id: NightAssetIds.POWER_DOWN_SOUND, src: NightAssetPaths.POWER_DOWN_SOUND, options: { volume: 0.7 } },

  { type: 'audio', id: NightAssetIds.KITCHEN_SOUND_1, src: NightAssetPaths.KITCHEN_SOUND_1, options: { volume: 0.35 } },
  { type: 'audio', id: NightAssetIds.KITCHEN_SOUND_2, src: NightAssetPaths.KITCHEN_SOUND_2, options: { volume: 0.35 } },
  { type: 'audio', id: NightAssetIds.KITCHEN_SOUND_3, src: NightAssetPaths.KITCHEN_SOUND_3, options: { volume: 0.35 } },
  { type: 'audio', id: NightAssetIds.KITCHEN_SOUND_4, src: NightAssetPaths.KITCHEN_SOUND_4, options: { volume: 0.35 } },

  { type: 'audio', id: NightAssetIds.FREDDY_POWEROUT_MUSIC_SOUND, src: NightAssetPaths.FREDDY_POWEROUT_MUSIC_SOUND, options: { volume: 0.8 } },
  { type: 'image', id: NightAssetIds.FREDDY_JUMPSCARE_ALT, src: NightAssetPaths.FREDDY_JUMPSCARE_ALT },

  { type: 'audio', id: NightAssetIds.VICTORY_BELLS_SOUND, src: NightAssetPaths.VICTORY_BELLS_SOUND, options: { volume: 0.6 } },
  { type: 'audio', id: NightAssetIds.VICTORY_KIDS_CHEER_SOUND, src: NightAssetPaths.VICTORY_KIDS_CHEER_SOUND, options: { volume: 0.6 } },

  { type: 'audio', id: NightAssetIds.ANIMATRONIC_MOVE_SOUND, src: NightAssetPaths.ANIMATRONIC_MOVE_SOUND, options: { volume: 0.35 } },
  { type: 'audio', id: NightAssetIds.DOOR_SCARE_SOUND, src: NightAssetPaths.DOOR_SCARE_SOUND, options: { volume: 0.7 } },
  
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
