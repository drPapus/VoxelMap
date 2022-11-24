import {ContinentInterface} from './Continent';
import {SourceKey} from "./Source";


export type TilesType = Uint32Array;


export type PeakLevelsType = Uint8Array;


export type TilePositionType = {
  x: number,
  y?: number,
  z: number,
};


export interface MapInterface {
  name: string;
  sea: {
    color: string | number,
    material: {
      texture: SourceKey,
      textureNormal: SourceKey,
      rougMapTexture: SourceKey,
      hightMapTexture: SourceKey
      displacementScale: number,
      roughness: number,
    },
    woodTextureRepeat: {
      x: number,
      y: number,
    }
    size: {
      width: number,
      height: number,
    },
    segmentsQty: {
      width: number,
      height: number,
    },
    position: {
      x: number,
      y: number,
      z: number,
    }
  };
  continents: ContinentInterface[];
}
