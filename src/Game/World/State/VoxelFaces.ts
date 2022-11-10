import {FaceInterface} from '../../@types/FaceInterface';

/*

https://www.redblobgames.com/grids/hexagons/

      3 -- 4
     /      \                 x - red, y - green, z - blue
    2        5                 +x
     \      /                   |
      1 -- 0               -z ---- +z
                                |
         B                     -x
       3 -- 4
    A /      \ C
     2        5
    F \      / D
       1 -- 0
         E

           ______
          /      \
         /  1.0   \______
         \        /      \
          \______/  1.1   \
          /      \        /
         /  0.0   \______/
         \        /      \
          \______/  0.1   \
          ^      \        /
         0.0.0    \______/

*/

export default (size: number, depth: number = 1, face?: 'top'): FaceInterface[] => {
  // Size
  const s = size;
  // 1/2 size
  const s12 = size / 2;
  // Width
  const w = s * Math.sqrt(3);
  // 1/2 width
  const w12 = w / 2;
  // Depth
  const d = depth;

  const faces: FaceInterface[] = [
    // BOTTOM =================================================================
    { // top
      side: 'bt',
      dir: [0, -1, 0],
      corners: [
        [-s12, 0, -w12],
        [s12, 0, -w12],
        [-s, 0, 0],
        [s, 0, 0],
      ]
    },
    { // bottom
      side: 'bb',
      dir: [0, -1,  0],
      corners: [
        [-s12, 0, w12],
        [-s, 0, 0],
        [s12, 0, w12],
        [s, 0, 0],
      ],
    },

    // TOP ========================================================
    { // top
      side: 'tt',
      dir:[0, 1, 0],
      corners: [
        [-s12, d, -w12],
        [-s, d, 0],
        [s12, d, -w12],
        [s, d, 0],
      ]
    },
    { // bottom
      side: 'tb',
      dir: [0, 1,  0],
      corners: [
        [-s12, d, w12],
        [s12, d, w12],
        [-s, d, 0],
        [s, d, 0],
      ],
    },

    // LATERAL SIDES ===============================================
    { // A
      side: 'a',
      dir: [-1, 0, 0],
      corners: [
        [-s12, 0, -w12],
        [-s, 0, 0],
        [-s12, d, -w12],
        [-s, d, 0],
      ],
    },
    { // B
      side: 'b',
      dir: [0, 0, 1],
      corners: [
        [-s12, 0, -w12],
        [-s12, d, -w12],
        [s12, 0, -w12],
        [s12, d, -w12],
      ],
    },
    { // C
      side: 'c',
      dir: [1, 0, 0],
      corners: [
        [s12, 0, -w12],
        [s12, d, -w12],
        [s, 0, 0],
        [s, d, 0],
      ],
    },
    { // D
      side: 'd',
      dir: [1, 0, -1],
      corners: [
        [s, 0, 0],
        [s, d, 0],
        [s12, 0, w12],
        [s12, d, w12],
      ],
    },
    { // E
      side: 'e',
      dir: [ 0, 0, -1],
      corners: [
        [-s12, 0, w12],
        [s12, 0, w12],
        [-s12, d, w12],
        [s12, d, w12],
      ],
    },
    { // F
      side: 'f',
      dir: [-1, 0, -1],
      corners: [
        [-s, 0, 0],
        [-s12, 0, w12],
        [-s, d, 0],
        [-s12, d, w12],
      ],
    },
  ];

  switch (face) {
    case 'top':
      return faces.filter(face => {
        return ['tt', 'tb'].includes(face.side);
      });
    default:
      return faces;
  }
};
