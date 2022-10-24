import {ConfigInterface} from "../Interfaces/ConfigInterface"

export default <ConfigInterface> {
  camera: {
    position: {
      x: -20,
      y: 30,
      z: 0,
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
    voxel: {
      size: 1,
      depth: .5,
      sideColor: '#424d1c',
      peakLevelColors: [
        // индекс = этаж высоты
        '#51936f', // 1
        '#398427', // 2
        '#779645', // 3
        '#ded6bc', // 6
        '#695843', // 4
        '#937b5c', // 5
      ],
    },
  },
}