import {ColorRepresentation} from 'three';
import {FaceInterface} from './Face';
import {SourceKey} from './Source';

export interface ConfigInterface {
  camera: {
    position: {
      x: number,
      y: number,
      z: number,
    }
  };
  environment: {
    light: {
      intensity: number,
      distance: number,
      color: ColorRepresentation,
      position: {
        x: number,
        y: number,
        z: number,
      },
      shadowMapSize: [number, number],
      shadowCameraNear: number,
      shadowCameraFar: number,
    }
    map: {
      texture: SourceKey,
      intensity: number,
    }
  };
  world: {
    trees: {
      model: SourceKey,
      color: ColorRepresentation,
    }
    hoverEmisseve: ColorRepresentation,
    hoverEmisseveIntensity: number,
    disabledLandColor: ColorRepresentation,
    exploredLandColor: ColorRepresentation,
    exploredLandEmissive: ColorRepresentation,
    exploredLandEmissiveIntensity: number,
    mountainColor: ColorRepresentation,
    selectionVoxelHeight: number,
    peakLevelColors: ColorRepresentation[],
    voxel: {
      size: number,
      width: number,
      height: number,
      depth: number,
      sideColor: ColorRepresentation,
      faces?: FaceInterface[],
    }
  };
}
