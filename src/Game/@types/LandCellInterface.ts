import {BufferGeometry, Mesh} from "three";

export interface LandCellInterface {
  /*

      0------------------------> x
  row | cell | cell |      |
      |--------------------------
  row | cell |      |      |
      |--------------------------
   y \/

   */
  index: {
    cell?: number, // x
    row?: number, // y
  }
  position: {
    x: number,
    y: number,
    z: number
  }
  mesh: Mesh
}