import {ContinentInterface} from './Continent';


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
    }
    position: {
      x: number,
      y: number,
      z: number,
    }
  };
  continents: ContinentInterface[];
}
