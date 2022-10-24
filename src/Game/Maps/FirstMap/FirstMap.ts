import {MapInterface} from "../../Interfaces/MapInterface"
import {getGeography} from "../../../mocks/geography";

export default <MapInterface> {
  name: 'Map 1',
  sea: {
    color: '#424d7c',
    material: {
      displacementScale: .4,
      roughness: .5,
    },
    size: {
      width: 80,
      height: 100
    },
    segmentsQty: {
      width: 100,
      height: 100,
    },
    position: { // Скорее всего это не нужно, если изменить то текстуры некорректно будут отображаться
      x: 0, //-30,
      y: 0, //1,
      z: 0, //5,
    }
  },
  states: getGeography()
  //     [
  //   {
  //     id: 'firstState',
  //     name: 'Land 1',
  //     status: 'active',
  //     width: 12,
  //     height: 10,
  //     position: {
  //       x: -6,
  //       y: 0,
  //       z: -5
  //     },
  //     landscape: {
  //       setup: [
  //           0, 4, 3, 3, 2, 2, 4, 4, 4, 4, 4, 4,
  //         3, 4, 3, 2, 1, 1, 3, 3, 4, 1, 4, 3,
  //           0, 3, 2, 1, 0, 1, 3, 3, 2, 2, 3, 1,
  //         0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 2, 1,
  //           0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1,
  //         0, 0, 0, 0, 2, 2, 2, 1, 1, 1, 1, 1,
  //           0, 0, 0, 0, 2, 3, 1, 1, 1, 0, 0, 1,
  //         0, 0, 0, 0, 3, 3, 1, 1, 0, 0, 0, 0,
  //           0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0,
  //         0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0,
  //       ]
  //     },
  //     village: [
  //       {
  //         name: 'Dead Land',
  //         stage: '',
  //         position: {
  //           x: 10,
  //           y: 4
  //         }
  //       },
  //       {
  //         name: 'Adrothra',
  //         position: {
  //           x: 12,
  //           y: 5
  //         }
  //       },
  //       {
  //         name: 'Fate Moon',
  //         position: {
  //           x: 11,
  //           y: 6
  //         }
  //       },
  //       {
  //         name: 'Fate Land',
  //         position: {
  //           x: 12,
  //           y: 7
  //         }
  //       }
  //     ],
  //     goddess: [
  //       {
  //         name: 'Goddess 1',
  //         model: 'goddess5',
  //         position: {
  //           x: 5,
  //           y: 6
  //         }
  //       },
  //       {
  //         name: 'Goddess 2',
  //         model: 'goddess2',
  //         position: {
  //           x: 6,
  //           y: 7
  //         }
  //       },
  //       {
  //         name: 'Goddess 3',
  //         model: 'goddess9',
  //         position: {
  //           x: 5,
  //           y: 8
  //         }
  //       },
  //       {
  //         name: 'Goddess 4',
  //         model: 'goddess8',
  //         position: {
  //           x: 5,
  //           y: 10
  //         }
  //       },
  //       {
  //         name: 'Goddess 5',
  //         model: 'goddess10',
  //         position: {
  //           x: 7,
  //           y: 10
  //         }
  //       },
  //     ]
  //   },
  //   {
  //     id: 'secondState',
  //     name: 'Land 2',
  //     status: 'explored',
  //     width: 4,
  //     height: 8,
  //     position: {
  //       x: 2,
  //       y: 0,
  //       z: -1
  //     },
  //     landscape: {
  //       setup: [
  //           2, 2, 1, 0,
  //         2, 3, 3, 0,
  //           3, 4, 3, 3,
  //         0, 3, 4, 4,
  //           1, 3, 4, 4,
  //         0, 3, 4, 4,
  //           0, 3, 4, 4,
  //         0, 0, 3, 3
  //       ]
  //     }
  //   },
  //   {
  //     id: 'thirdState',
  //     name: 'Land 3',
  //     status: 'disabled',
  //     width: 4,
  //     height: 11,
  //     position: {
  //       x: -6,
  //       y: 0,
  //       z: -4
  //     },
  //     landscape: {
  //       setup:
  //         [
  //             1, 0, 0, 0,
  //           1, 1, 0, 0,
  //             1, 1, 1, 0,
  //           1, 1, 1, 1,
  //             1, 1, 1, 1,
  //           1, 1, 0, 1,
  //             1, 1, 0, 1,
  //           1, 1, 0, 0,
  //             1, 0, 0, 0,
  //           1, 1, 0, 0,
  //             1, 0, 0, 0
  //         ]
  //     }
  //   },
  //   {
  //     id: 'fourthState',
  //     name: 'Land 4',
  //     status: 'active',
  //     width: 12,
  //     height: 12,
  //     position: {
  //       x: -6,
  //       y: 0,
  //       z: 0
  //     },
  //     landscape: {
  //       setup: [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //         0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0,
  //           0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0,
  //         0, 0, 0, 2, 3, 3, 2, 0, 0, 0, 0, 0,
  //           0, 0, 1, 3, 2, 1, 3, 1, 1, 0, 0, 0,
  //         0, 2, 2, 4, 4, 1, 2, 2, 1, 2, 0, 0,
  //           2, 2, 4, 4, 0, 1, 2, 2, 2, 2, 2, 3,
  //         0, 0, 2, 4, 1, 3, 2, 2, 2, 3, 3, 2,
  //           0, 0, 2, 0, 1, 3, 2, 2, 3, 4, 3, 3,
  //         0, 0, 2, 1, 0, 1, 3, 3, 3, 4, 4, 4,
  //           0, 2, 2, 0, 0, 4, 4, 4, 4, 4, 4, 4,
  //         0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0,
  //       ]
  //     }
  //   },
  // ]
}
