import {StateInterface} from "./StateInterface"

export interface MapInterface {
  name: string,
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
  },
  states: StateInterface[]
}