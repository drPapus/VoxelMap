import {
  BufferAttribute,
  BufferGeometry,
  Mesh
} from 'three'
import {LandCellInterface} from "./LandCellInterface"
import {SourceInterface} from "./SourceInterface"


export interface StateInterface {
  id: string,
  name: string,
  status: 'active' | 'explored' | 'disabled',
  width: number,
  height: number,
  position: {
    x: number,
    y: number,
    z: number,
  }
  maxLevel?: number,
  landscape: {
    setup: number[]
    mesh?: Mesh,
    peakMeshes?: Mesh[],
  },
  trees?: Mesh,
  mountains?: Mesh,
  village?: {
    name: string,
    position: {
      x: number,
      y: number
    }
  },
  goddess?: {
    name: string,
    model: SourceInterface['name'],
    position: {
      x: number,
      y: number
    }
  }[]
  voxelMatrix?: any,
  boxSize?: number,
  cells?: Record<LandCellInterface['mesh']['id'], LandCellInterface>,
}