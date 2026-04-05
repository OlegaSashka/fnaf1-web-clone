import { NightAssetPaths } from './NightAssets.js';

export const cameraConfigs = {
  '1A': {
          name: 'Show Stage',
          image: NightAssetPaths.CAM_1A,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            all: 0,
            all_look_at_camera: 1,
            chica_freddy: 2,
            bonny_freddy: 3,
            freddy: 4,
            freddy_look: 5,
            empty: 6,
          }
        },
  '1B': { 
          name: 'Dining Area', 
          image: NightAssetPaths.CAM_1B,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            default: 0,
            bonny_far: 1,
            bonny_close: 2,
            bonny_freddy: 3,
            chica_far: 4,
            chica_close: 5,
            freddy: 6,
          }
        },
  '1C': { 
          name: 'Pirate Cove', 
          image: NightAssetPaths.CAM_1C, 
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            default: 0,
            foxy_1: 1,
            foxy_2: 2,
            foxy_3: 3,
            its_me: 4,
          }
        },
  '2A': { 
          name: 'West Hall', 
          image: NightAssetPaths.CAM_2A,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            dark: 0,
            light: 1,
            bonny: 2,
          },
          specialAnimation: {
            asset: NightAssetPaths.CAM_2A_FOXY_RUN_ANIM,
            fps: 30
          }
        },
  '2B': { 
          name: 'W. Hall Corner', 
          image: NightAssetPaths.CAM_2B,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            default: 0,
            default_broken_freddy: 1,
            default_golden_freddy: 2,
            bonny: 3,
            bonny_1: 4,
            bonny_2: 5,
          }
        },
  '3':  { 
          name: 'Supply Closet', 
          image: NightAssetPaths.CAM_3,
          viewportMode: 'screen', // 'world' | 'screen'
          useCameraOffset: false,
          states: {
            default: 0,
            bonny: 1,
          }
        },
  '4A': { 
          name: 'East Hall',
          image: NightAssetPaths.CAM_4A,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            default: 0,
            its_me: 1,
            cry_childs: 2,
            freddy: 3,
            chica_far: 4,
            chica_close: 5,
          }
        },
  '4B': { 
          name: 'E. Hall Corner', 
          image: NightAssetPaths.CAM_4B,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            default: 0,
            kids_vanish_paper: 1,
            five_children_paper: 2,
            sanitaria_paper: 3,
            close_paper: 4,
            chica: 5,
            chica_1: 6,
            chica_2: 7,
            freddy: 8,
          }
        },
  '5':  { 
          name: 'Backstage', 
          image: NightAssetPaths.CAM_5,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            default: 0,
            look_at_camera: 1,
            bonny: 2,
            bonny_look_at_camera: 3,
          }
        },
  '6': {
          name: 'Kitchen',
          image: null,
          viewportMode: 'screen',
          useCameraOffset: false,
          states: {
            default: 0,
          }
        },
  '7':  { 
          name: 'Restrooms', 
          image: NightAssetPaths.CAM_7,
          viewportMode: 'world', // 'world' | 'screen'
          useCameraOffset: true,
          states: {
            default: 0,
            chica_far: 1,
            chica_look_at_camera: 2,
            freddy: 3,
          }
        }
};