import {ConfigInterface} from '../@types/ConfigInterface';

const voxel = {
  size: 1,
  depth: .5,
};


export default {
  camera: {
    position: {
      x: 0,
      y: 30,
      z: 15,
    },
  },
  environment: {
    light: {
      intensity: 80,
      distance: 200,
      color: '#FFCB8E',
      position: {
        x: 30,
        y: 40,
        z: 10,
      },
      shadowMapSize: [512, 512],
      shadowCameraNear: .5,
      shadowCameraFar: .5,
    }
  },
  world: {
    hoverEmisseve: '#ff0000',
    hoverEmisseveIntensity: 1,
    disabledLandColor: '#021554',
    exploredLandEmissive: '#b5d3cd',
    exploredLandEmissiveIntensity: .3,
    treesColor: '#0a591b',
    mountainColor: '#f7efd3',
    selectionVoxelHeight: 2,
    peakLevelColors: [
      // индекс = этаж
      '#51936f', // 1
      '#398427', // 2
      '#779645', // 3
      '#ded6bc', // 6
      '#695843', // 4
      '#937b5c', // 5
    ],
    voxel: {
      size: voxel.size,
      width: voxel.size * Math.sqrt(3),
      height: voxel.size * 2,
      depth: voxel.depth,
      sideColor: '#424d1c',
    },
  },
} as ConfigInterface;
