import {
  Mesh,
} from 'three';
import {TileInterface} from './Tile';
import {SourceInterface} from './Source';
import {TilesType, PeakLevelsType} from './Map';
import {Trees} from '../World/Continent/Trees';
import {Mountains} from '../World/Continent/Mountains';

export type ContinentConditionType = 'default' | 'intersected';

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
  trees?: Trees;
  mountains?: Mountains;
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
