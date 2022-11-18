import {MapInterface} from '../../@types/Map';
import {getGeography} from '../../World/Continent/MapHelpers';

export default {
  name: 'Map 1',
  sea: {
    color: '#424d7c',
    material: {
      displacementScale: .4,
      roughness: .5,
    },
    woodTextureRepeat: {
      x: 48,
      y: 48,
    },
    size: {
      width: 800,
      height: 800,
    },
    segmentsQty: {
      width: 100,
      height: 100,
    },
  },
  continents: [...getGeography()],
} as MapInterface;
