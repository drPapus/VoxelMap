// @ts-nocheck
import {
  AnimationClip, AnimationMixer,
  Bone, BoxBufferGeometry,
  ExtrudeGeometry, Float32BufferAttribute, Mesh,
  MeshStandardMaterial, NumberKeyframeTrack,
  Shape,
  Skeleton, SkeletonHelper,
  SkinnedMesh, Uint16BufferAttribute, Vector3, VectorKeyframeTrack
} from 'three';
import Main from '../../Main';
import {AnimationClipCreator} from 'three/examples/jsm/animation/AnimationClipCreator';

export class SettlementMovementsExperiment3 {
  #main: Main;
  #scene: Main['scene'];
  #shape!: Shape;
  #material!: MeshStandardMaterial;
  #animation: Main['animation'];
  #mesh!: SkinnedMesh;
  #skeleton!: Skeleton;
  #bones: Bone[] = [];
  #geometry!: BoxBufferGeometry;
  #movementConfig = {
    /*
          >>>--------|>
          |     \      \
  fletching    shaft   point
     */
    shaftWidth: 1,
    shaftHeight: 10,

    pointWidth: 2,
    pointHeight: 1.6,

    fletchingWidth: 3,
    fletchingHeight: 1.2,
    fletchingInside: 1,

    depthSize: .2,
    depthSegments: 1,

    bonesQty: 30,
  };

  constructor() {
    this.#main = new Main();
    this.#animation = this.#main.animation;
    this.#scene = this.#main.scene;

    this.setMaterial();
    this.setGeometry();
    this.setBones();
    this.setMesh();
  }


  setMaterial() {
    this.#material = new MeshStandardMaterial({color: '#b43020'});
    this.#material.wireframe = true;
  }


  setGeometry() {
    this.#geometry = new BoxBufferGeometry(
      this.#movementConfig.shaftWidth,
      this.#movementConfig.shaftHeight,
      this.#movementConfig.depthSize,
      2,
      this.#movementConfig.shaftHeight * 10,
      1
    );

    const segmentHeight = this.#movementConfig.shaftHeight / this.#movementConfig.bonesQty;
    const vertex = new Vector3();
    const skinIndices = [];
    const skinWeights = [];

    for (let i = 0; i < this.#geometry.attributes.position.count; i++) {
      vertex.fromBufferAttribute(this.#geometry.attributes.position, i);
      const y = vertex.y + this.#movementConfig.shaftHeight * .5;

      const skinIndex = Math.floor(y / segmentHeight);
      const skinWeight = (y % segmentHeight) / segmentHeight;

      skinIndices.push(skinIndex, skinIndex + 1, 0, 0 );
      skinWeights.push(1 - skinWeight, skinWeight, 0, 0 );
    }

    this.#geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
    this.#geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
  }


  setBones() {
    let prevBone = new Bone();
    this.#bones.push(prevBone);
    prevBone.position.y = -this.#movementConfig.shaftHeight * .5;

    for (let i = 0; i < this.#movementConfig.bonesQty; i++) {
      const bone = new Bone();
      bone.position.y = this.#movementConfig.shaftHeight / this.#movementConfig.bonesQty;
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
    // this.#mesh.skeleton.bones[0].rotation.x = -Math.PI * .05;
    // this.#mesh.skeleton.bones[1].rotation.x = -Math.PI * .25;
    // this.#mesh.skeleton.bones[1].rotation.z = 10;
    // this.#mesh.skeleton.bones[4].position.set(2, 6, 2);
    // this.#mesh.skeleton.bones[4].rotation.z = -Math.PI * .07;
    // this.#mesh.skeleton.bones[2].position.y = -Math.PI * .01;
    // this.#mesh.skeleton.bones[2].rotation.z = Math.PI * .1;

    this.#mesh.skeleton.bones[0].rotation.x = Math.PI * .02;
    this.#mesh.skeleton.bones[1].rotation.x = Math.PI * .02;
    this.#mesh.skeleton.bones[2].rotation.x = Math.PI * .02;
    this.#mesh.skeleton.bones[3].rotation.x = Math.PI * .02;
    this.#mesh.skeleton.bones[4].rotation.x = Math.PI * .02;
    this.#mesh.skeleton.bones[5].rotation.x = Math.PI * .2;
    this.#mesh.skeleton.bones[10].rotation.x = Math.PI * .2;
    this.#mesh.skeleton.bones[15].position.x = 1;



    const clip = animation(1, 'x');
    // const clip2 = AnimationClipCreator.CreateRotationAnimation(3, 'y');
    console.log(clip);

    const mixer = new AnimationMixer(this.#mesh);
    const clipAction = mixer.clipAction(clip);
    // clipAction.play();
    this.#animation.setAnimation(mixer);

    this.#scene.add(this.#mesh, skeletonHelper);
  }
}

const animation = ( period: number, axis = 'x' ) => {
  const times = [ 0, period];
  const values = [ 0, Math.PI];

  const track = new NumberKeyframeTrack( `.skeleton.bones[2].rotation[x]`, times, values );
  const track2 = new NumberKeyframeTrack( `.skeleton.bones[3].rotation[y]`, times, values );
  const track3 = new NumberKeyframeTrack( `.skeleton.bones[4].position[y]`, times, [0, 100] );

  const scaleKF = new VectorKeyframeTrack( '.skeleton.bones[2].scale', [ 0, 1, 2 ], [ 1, 1, 1, 2, 2, 2, 1, 1, 1 ] );

  return new AnimationClip(undefined, period, [track, track2, track3]);
};
