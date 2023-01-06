import Main from '../../Main';
import {
  Bone,
  ExtrudeGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Shape,
  Skeleton,
  SkeletonHelper,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3
} from 'three';

export class SettlementMovementsExperiment2 {
  #main: Main;
  #scene: Main['scene'];
  #shape!: Shape;
  #material!: MeshStandardMaterial;
  #mesh!: SkinnedMesh;
  #skeleton!: Skeleton;
  #bones: Bone[] = [];
  #geometry!: ExtrudeGeometry;
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

    depthSize: .5,
    depthSegments: 10,

    bonesQty: 10,
  };

  constructor() {
    this.#main = new Main();
    this.#scene = this.#main.scene;

    this.setMaterial();
    this.setShape();
    this.setGeometry();
    this.setBones();
    this.setMesh();
  }


  setMaterial() {
    this.#material = new MeshStandardMaterial({color: '#b43020'});
    this.#material.wireframe = true;
  }


  setShape() {
    this.#shape = new Shape();

    // .
    this.#shape.moveTo(0, 0);
    // __
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

    const segmentSize =
      (
        this.#movementConfig.shaftWidth
        + this.#movementConfig.pointWidth
        + this.#movementConfig.fletchingWidth
      )
      / this.#movementConfig.bonesQty;
    const y = this.#movementConfig.shaftHeight * .5;
    const startX = -this.#movementConfig.fletchingWidth;
    const vertex = new Vector3();
    const skinIndices = [];
    const skinWeights = [];

    // console.log('geometry pos', this.#geometry.attributes.position);

    for (let i = 0; i < this.#geometry.attributes.position.count; i++) {
      vertex.fromBufferAttribute(this.#geometry.attributes.position, i);
      // console.log('vert', vertex);
      const y = vertex.y + segmentSize * .5;

      const skinIndex = Math.abs(Math.floor(y / segmentSize));
      const skinWeight = Math.abs((y % segmentSize) / segmentSize);

      console.log(skinIndex, skinWeight);

      skinIndices.push(skinIndex, skinIndex + 1, 0, 0 );
      skinWeights.push(1 - skinWeight, skinWeight, 0, 0 );

    }

    this.#geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
    this.#geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
  }


  setBones() {
    const y = this.#movementConfig.shaftHeight * .5;
    const startX = 0;
    // const startX = 0;
    const segmentSize =
      (
        this.#movementConfig.shaftWidth
        + this.#movementConfig.pointWidth
        + this.#movementConfig.fletchingWidth
      )
      / this.#movementConfig.bonesQty;
    const halfSegmentSize = segmentSize * .5;
    let prevBone = new Bone();
    this.#bones.push(prevBone);
    prevBone.position.y = -halfSegmentSize;

    for (let i = 0; i < this.#movementConfig.bonesQty; i++) {
      const bone = prevBone.clone();
      bone.position.y = segmentSize;
      // console.log(bone.position);
      this.#bones.push(bone);
      prevBone.add(bone);
      prevBone = bone;
    }
  }


  setMesh() {
    this.#mesh = new SkinnedMesh(this.#geometry, this.#material);
    this.#skeleton = new Skeleton(this.#bones);
    this.#mesh.add(this.#bones[0]);
    this.#mesh.bind(this.#skeleton);
    this.#mesh.scale.multiplyScalar(1);

    const skeletonHelper = new SkeletonHelper(this.#mesh);
    // @ts-ignore
    skeletonHelper.material.lineWidth = 4;

    // this.#mesh = new Mesh(this.#geometry, this.#material);
    // this.#mesh.rotation.x = Math.PI * .5;
    this.#mesh.position.set(5, 0, 0);
    this.#mesh.skeleton.bones[0].rotation.x = -Math.PI * .05;
    this.#mesh.skeleton.bones[1].rotation.x = -Math.PI * .25;
    // this.#mesh.skeleton.bones[1].rotation.z = Math.PI * .05;
    // this.#mesh.skeleton.bones[2].position.y = 8;
    // this.#mesh.skeleton.bones[2].rotation.z = Math.PI * .1;
    this.#scene.add(this.#mesh, skeletonHelper);
  }
}
