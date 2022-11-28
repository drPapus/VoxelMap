import {MapInterface} from '../../@types/Map';
import {getGeography} from '../../World/Continent/MapHelpers';

export const woodTextureRepeat = {x: 48, y: 48};

export default {
  name: 'Map 1',
  sea: {
    color: '#424d7c',
    material: {
      texture: 'woodBaseColorTexture',
      textureNormal: 'woodNormalTexture',
      rougMapTexture: 'woodRougMapTexture',
      hightMapTexture: 'woodHightMapTexture',
      displacementScale: .4,
      roughness: .5,
    },
    woodTextureRepeat: woodTextureRepeat,
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
