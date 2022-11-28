import {
  Mesh,
  MeshStandardMaterial,
} from 'three';
import {TileInterface} from './Tile';
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
    // @ts-ignore TODO DELETE
    model: SourceInterface['name'],
    position: {
      x: number,
      y: number
    }
  }[];
  voxelMatrix?: any;
  boxSize?: number;
  tiles?: Record<number, TileInterface>;
}
