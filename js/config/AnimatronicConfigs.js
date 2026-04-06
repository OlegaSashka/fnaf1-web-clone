export const AnimatronicConfigs = {
  bonnie: {
            id: 'bonnie',
            startNode: '1A',
            baseMoveIntervalMs: 4970,
            moveGraph: {
              '1A': ['5', '1B'],
              '5': ['1B', '2A'],
              '1B': ['5', '2A'],
              '2A': ['3', '2B', 'office-attack'],
              '3': ['2A', '2B', 'office-attack'],
              '2B': ['3', 'office-attack'],
              'office-attack': ['1B']
            },
            activitySchedule: [
              { hour: 2, delta: 1 },
              { hour: 3, delta: 1 },
              { hour: 4, delta: 1 },
              { hour: 5, delta: 1 }
            ]
          },
  chica: {
            id: 'chica',
            label: 'Chica',
            startNode: '1A',
            moveGraph: {
              '1A': ['1B'],
              '1B': ['7', '4A'],
              '7': ['4A'],
              '4A': ['4B'],
              '4B': ['office-right']
            }
          },
  freddy: {
    id: 'freddy',
    label: 'Freddy',
    startNode: '1A',
    moveGraph: {
      '1A': ['1B'],
      '1B': ['7'],
      '7': ['6'],
      '6': ['4A'],
      '4A': ['4B'],
      '4B': ['office-right']
    }
  },

  foxy: {
    id: 'foxy',
    label: 'Foxy',
    startNode: '1C',
    moveGraph: {
      '1C': ['1C-ready-1', '1C-ready-2', '1C-run'],
      '1C-run': ['2A', 'office-left']
    }
  }
};