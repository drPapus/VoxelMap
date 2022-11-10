import {MapInterface} from '../../@types/Map';
import {getGeography} from '../../World/State/MapHelpers';

export default {
  name: 'Map 1',
  sea: {
    color: '#424d7c',
    material: {
      displacementScale: .4,
      roughness: .5,
    },
    size: {
      width: 80,
      height: 100
    },
    segmentsQty: {
      width: 100,
      height: 100,
    },
  },
  states: [...getGeography()],
} as MapInterface;
