export const CameraBehaviorConfigs = {
  '2A': {
    type: 'toggle_random',
    autoStart: true,
    defaultVariant: 'default',
    variants: {
      default: ['dark', 'light'],
      bonnie: ['dark', 'bonny']
    },
    intervalMinMs: 10,
    intervalMaxMs: 100,
    restartFromFirstFrame: true
  },

  '2B': {
    type: 'toggle_random',
    autoStart: false,
    defaultVariant: 'default',
    variants: {
      default: ['bonny'],
      night4: ['bonny_1', 'bonny_2']
    },
    intervalMinMs: 40,
    intervalMaxMs: 180,
    restartFromFirstFrame: true
  },

  '5': {
    type: 'rare_swap',
    autoStart: false,
    variants: {
      default: ['bonny'],
      rare_event: ['bonny_look_at_camera']
    },
    chance: 0.05
  }
};