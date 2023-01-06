import {
  AnimationClip,
  AnimationMixer,
  Bone,
  BoxBufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Mesh,
  MeshStandardMaterial, NumberKeyframeTrack,
  Shape,
  Skeleton, SkeletonHelper,
  SkinnedMesh,
  Uint16BufferAttribute,
  CatmullRomCurve3,
  Vector3, VectorKeyframeTrack, LineLoop, BufferGeometry, LineBasicMaterial
} from 'three';

import Main from '../../Main';
import {Flow} from 'three/examples/jsm/modifiers/CurveModifier';

export class SettlementMovementsExperiment4 {
  #main: Main;
  #scene: Main['scene'];
  #shape!: Shape;
  #material!: MeshStandardMaterial;
  #animation: Main['animation'];
  #mesh!: Mesh;
  #skeleton!: Skeleton;
  #bones: Bone[] = [];
  #geometry!: ExtrudeGeometry;
  flow!: Flow;
  #movementConfig = {
    /*
          >>>--------|>
          |     \      \
  fletching    shaft   point
     */
    shaftWidth: 6,
    shaftHeight: 1,
    shaftSegments: 1,

    pointWidth: 2,
    pointHeight: 1.6,

    fletchingWidth: 3,
    fletchingHeight: 1.2,
    fletchingInside: 1,

    depthSize: .2,
    depthSegments: 10,

    bonesQty: 10,
  };

  constructor() {
    this.#main = new Main();
    this.#animation = this.#main.animation;
    this.#scene = this.#main.scene;

    this.setMaterial();
    this.setShape();
    this.setGeometry();
    this.setMesh();
  }


  setMaterial() {
    this.#material = new MeshStandardMaterial({color: '#b43020'});
    this.#material.wireframe = true;
  }


  setShape() {
    this.#shape = new Shape();
    const _count = 10;

    // .
    this.#shape.moveTo(0, 0);
    // __
    for (let i = 1; i < _count; i++) {
      this.#shape.lineTo(0, this.#movementConfig.shaftWidth / _count * i);
    }
    this.#shape.lineTo(0, this.#movementConfig.shaftWidth);
    // __|
    this.#shape.lineTo(
      -(this.#movementConfig.pointHeight - this.#movementConfig.shaftHeight) * .5,
      this.#movementConfig.shaftWidth
    );
    // __|\
    this.#shape.lineTo(
      this.#movementConfig.shaftHeight * .5,
      this.#movementConfig.shaftWidth + this.#movementConfig.pointWidth
    );
    // __|\
    //    /
    this.#shape.lineTo(
      this.#movementConfig.shaftHeight
      + ((this.#movementConfig.pointHeight - this.#movementConfig.shaftHeight) * .5),
      this.#movementConfig.shaftWidth
    );
    // __|\
    //   |/
    this.#shape.lineTo(this.#movementConfig.shaftHeight, this.#movementConfig.shaftWidth);
    // __|\
    // --|/
    for (let i = 1; i < _count; i++) {
      this.#shape.lineTo(this.#movementConfig.shaftHeight, this.#movementConfig.shaftWidth - this.#movementConfig.shaftWidth / _count * i);
    }
    this.#shape.lineTo(this.#movementConfig.shaftHeight, 0);
    //  __|\
    // /--|/
    this.#shape.lineTo(
      this.#movementConfig.shaftHeight
      + ((this.#movementConfig.fletchingHeight - this.#movementConfig.shaftHeight) * .5),
      -this.#movementConfig.fletchingWidth,
    );
    //  __|\
    // //--|/
    this.#shape.lineTo(
      this.#movementConfig.shaftHeight * .5,
      -this.#movementConfig.fletchingWidth + this.#movementConfig.fletchingInside,
    );
    // \ __|\
    // //--|/
    this.#shape.lineTo(
      -((this.#movementConfig.fletchingHeight - this.#movementConfig.shaftHeight) * .5),
      -this.#movementConfig.fletchingWidth,
    );
    // .
    this.#shape.lineTo(0, 0);
  }


  setGeometry() {
    this.#geometry = new ExtrudeGeometry(this.#shape, {
      steps: this.#movementConfig.depthSegments,
      depth: this.#movementConfig.depthSize,
      bevelEnabled: false,
    });
    this.#geometry.rotateX(Math.PI * .5);
    this.#geometry.rotateY(Math.PI * .5);
  }


  setMesh() {
    // const geom = new BoxBufferGeometry(20, 1, 0.5, 100, 1, 1);
    this.#mesh = new Mesh(this.#geometry, this.#material);
    // this.#mesh.rotation.x = Math.PI *.25;

    const initialPoints = [
      { x: 10, y: 0, z: - 10 },
      { x: 10, y: 0, z: 10 },
      { x: - 10, y: 5, z: 10 },
      { x: - 10, y: 0, z: - 10 },
    ];

    const curve = new CatmullRomCurve3(
      initialPoints.map( ( handle ) => new Vector3(handle.x, handle.y, handle.z) ),
      true,
      'centripetal'
    );

    const points = curve.getPoints( 50 );
    const line = new LineLoop(
      new BufferGeometry().setFromPoints( points ),
      new LineBasicMaterial( { color: 0x00ff00 } )
    );

    const expShape = new Shape();
    expShape.moveTo(-1, 0);
    expShape.lineTo(0, 2);
    expShape.lineTo(1, 0);
    expShape.lineTo(-1, 0);
    const expGeom = new ExtrudeGeometry(expShape, {
      steps: 10, depth: 3, bevelEnabled: false
    });
    expGeom.lookAt(new Vector3(0, 1, 0));
    const expMesh = new Mesh(expGeom, new MeshStandardMaterial({color: '#005aff', wireframe: true}));
    this.#mesh.add(expMesh);

    this.flow = new Flow(this.#mesh);
    this.flow.updateCurve( 0, curve );

    this.#scene.add(this.flow.object3D, line);
  }
}
