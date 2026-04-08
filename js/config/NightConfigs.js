export const NightConfigs = Object.freeze({
  1: {
    nightNumber: 1,

    intro: {
      title: '12:00 AM',
      subtitle: 'Ночь 1',
      duration: 4000
    },

    phoneGuy: {
      id: 'phone-guy-night-1',
      src: 'assets/sounds/PhoneGuy/night1.wav'
    },

    phoneGuyUi: {
      muteShowDelay: 19000
    },

    extraAssets: [],

    ai: {
      freddy: 0,
      bonnie: 0,
      chica: 0,
      foxy: 0
    },
    

    power: {
      start: 1000
    },

    time: {
      startHour: 12,
      endHour: 6,
      hourDurationMs: 90000
    }
  },

  2: {
    nightNumber: 2,

    intro: {
      title: '12:00 AM',
      subtitle: 'Ночь 2',
      duration: 4000
    },

    phoneGuy: {
      id: 'phone-guy-night-2',
      src: 'assets/sounds/PhoneGuy/night2.wav'
    },

    phoneGuyUi: {
      muteShowDelay: 19000
    },

    extraAssets: [],

    ai: {
      freddy: 0,
      bonnie: 3,
      chica: 1,
      foxy: 1
    },

    power: {
      start: 1000
    },

    time: {
      startHour: 12,
      endHour: 6,
      hourDurationMs: 90000
    }
  },

  3: {
    nightNumber: 3,

    intro: {
      title: '12:00 AM',
      subtitle: 'Ночь 3',
      duration: 4000
    },

    phoneGuy: {
      id: 'phone-guy-night-3',
      src: 'assets/sounds/PhoneGuy/night3.wav'
    },

    phoneGuyUi: {
      muteShowDelay: 20000
    },

    extraAssets: [],

    ai: {
      freddy: 1,
      bonnie: 0,
      chica: 5,
      foxy: 2
    },

    power: {
      start: 1000
    },

    time: {
      startHour: 12,
      endHour: 6,
      hourDurationMs: 90000
    }
  },

  4: {
    nightNumber: 4,

    intro: {
      title: '12:00 AM',
      subtitle: 'Ночь 4',
      duration: 4000
    },

    phoneGuy: {
      id: 'phone-guy-night-4',
      src: 'assets/sounds/PhoneGuy/night4.wav'
    },

    phoneGuyUi: {
      muteShowDelay: 17000
    },

    extraAssets: [
      { type: 'audio', src: 'assets/sounds/animatronics/freddy/laugh-1.wav' },
      { type: 'audio', src: 'assets/sounds/animatronics/freddy/laugh-2.wav' }
    ],

    ai: {
      freddy: 2,
      bonnie: 2,
      chica: 4,
      foxy: 6
    },

    power: {
      start: 1000
    },

    time: {
      startHour: 12,
      endHour: 6,
      hourDurationMs: 90000
    }
  },

  5: {
    nightNumber: 5,

    intro: {
      title: '12:00 AM',
      subtitle: 'Ночь 5',
      duration: 4000
    },

    phoneGuy: {
      id: 'phone-guy-night-5',
      src: 'assets/sounds/PhoneGuy/night5.wav'
    },

    phoneGuyUi: {
      muteShowDelay: 17000
    },

    extraAssets: [],

    ai: {
      freddy: 3,
      bonnie: 5,
      chica: 7,
      foxy: 5
    },

    power: {
      start: 1000
    },

    time: {
      startHour: 12,
      endHour: 6,
      hourDurationMs: 90000
    }
  }
});

export function getNightConfig(nightNumber) {
  return NightConfigs[nightNumber] ?? NightConfigs[1];
}