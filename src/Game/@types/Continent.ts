import {
  Mesh
} from 'three';
import {LandCellInterface} from './LandCellInterface';
import {SourceInterface} from './Source';
import {TilesType, PeakLevelsType} from './Map';


export interface ContinentInterface {
  id: string;
  name: string;
  status: 'active' | 'explored' | 'disabled';
  maxLevel?: number;
  landscape: {
    tiles: TilesType,
    peakLevels: PeakLevelsType,
    mesh?: Mesh,
    peakMeshes?: Mesh[],
  };
  trees?: Mesh;
  mountains?: Mesh;
  village?: {
    name: string,
    position: {
      x: number,
      y: number
    }
  }[];
  goddess?: {
    name: string,
    model: SourceInterface['name'],
    position: {
      x: number,
      y: number
    }
  }[];
  voxelMatrix?: any;
  boxSize?: number;
  cells?: Record<LandCellInterface['mesh']['id'], LandCellInterface>;
}
