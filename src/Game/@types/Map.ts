import {StateInterface} from './State';


export type Tiles = Uint32Array;


export interface MapInterface {
  name: string;
  sea: {
    color: string | number,
    material: {
      displacementScale: number,
      roughness: number,
    },
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
  states: StateInterface[];
}
