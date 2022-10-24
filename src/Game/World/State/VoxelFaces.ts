import {FaceInterface} from "../../Interfaces/FaceInterface"

/*
      3 -- 4
     /      \                 x - red, y - green, z - blue
    2        5                 +x
     \      /                   |
      1 -- 0               -z ---- +z
                                |
         D                     -x
       3 -- 4
    C /      \ E
     2        5
    B \      / F
       1 -- 0
         A

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
  const s = size
  // 1/2 size
  const s12 = size / 2
  // Width
  const w = s * Math.sqrt(3)
  // 1/2 width
  const w12 = w / 2
  // Height
  const h = s * 2
  // Depth
  const d = depth

  const faces: FaceInterface[] = [
    // BOTTOM =================================================================
    { // left
      side: 'bl',
      dir: [0, -1, 0],
      corners: [
        [w12, 0, -s12],
        [w12, 0, s + s12],
        [0, 0, 0],
        [0, 0, s],
      ]
    },
    { // right
      side: 'br',
      dir: [0, -1,  0],
      corners: [
        [w12, 0, s + s12],
        [w12, 0, -s12],
        [w, 0, s],
        [w, 0, 0],
      ],
    },

    // TOP ========================================================
    { // left
      side: 'tl',
      dir:[0, 1, 0],
      corners: [
        [0, d, 0],
        [0, d, s],
        [w12, d, -s12],
        [w12, d, s + s12],
      ]
    },
    { // right
      side: 'tr',
      dir: [0, 1,  0],
      corners: [
        [w12, d, s + s12],
        [w, d, s],
        [w12, d, -s12],
        [w, d, 0],
      ],
    },

    // LATERAL SIDES ===============================================
    { // A
      side: 'a',
      dir: [-1, 0, 0],
      corners: [
        [0, 0, 0],
        [0, 0, s],
        [0, d, 0],
        [0, d, s],
      ],
    },
    { // B
      side: 'b',
      dir: [0, 0, -1],
      corners: [
        [w12, 0, -s12],
        [0, 0, 0],
        [w12, d, -s12],
        [0, d, 0],
      ],
    },
    { // C
      side: 'c',
      dir: [1, 0, -1],
      corners: [
        [w, 0, 0],
        [w12, 0, -s12],
        [w, d, 0],
        [w12, d, -s12],
      ],
    },
    { // D
      side: 'd',
      dir: [ 1, 0, 0],
      corners: [
        [w, 0, s],
        [w, 0, 0],
        [w, d, s],
        [w, d, 0],
      ],
    },
    { // E
      side: 'e',
      dir: [ 1, 0, 1],
      corners: [
        [w12, 0, s + s12],
        [w, 0, s],
        [w12, d, s + s12],
        [w, d, s],
      ],
    },
    { // F
      side: 'f',
      dir: [0, 0, 1],
      corners: [
        [0, 0, s],
        [w12, 0, s + s12],
        [0, d, s],
        [w12, d, s + s12],
      ],
    },
  ]

  if (face === 'top') {
    let topFaces: FaceInterface[] = []
    for (const face of faces) {
      if (topFaces.length === 2) {break}
      if (['tl', 'tr'].includes(face.side)) {
        topFaces.push(face)
      }
    }
    return topFaces
  }

  return faces
}