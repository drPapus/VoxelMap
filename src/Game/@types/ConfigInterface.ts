import {ColorRepresentation} from 'three';

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
  };
  world: {
    hoverEmisseve: ColorRepresentation,
    hoverEmisseveIntensity: number,
    disabledLandColor: ColorRepresentation,
    exploredLandColor: ColorRepresentation,
    exploredLandEmissive: ColorRepresentation,
    exploredLandEmissiveIntensity: number,
    treesColor: ColorRepresentation,
    mountainColor: ColorRepresentation,
    selectionVoxelHeight: number
    voxel: {
      size: number,
      depth: number,
      sideColor: ColorRepresentation
      peakLevelColors: ColorRepresentation[]
    }
  };
}
