import {
  Bone,
  BoxBufferGeometry, CylinderBufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Mesh,
  MeshStandardMaterial, PlaneBufferGeometry, Shape, Skeleton, SkeletonHelper,
  SkinnedMesh, Uint16BufferAttribute, Vector3
} from 'three';
import Main from '../../Main';

export class SettlementMovementsExsperiment {
  #main: Main;
  #scene: Main['scene'];
  #material!: MeshStandardMaterial;
  geometry!: any;
  mesh!: SkinnedMesh;
  #skin: {
    indices: number[],
    weights: number[],
  } = {
    indices: [],
    weights: [],
  };
  bones: Bone[] = [];
  #sizing = {
    width: 8,
    height: 20,
    depth: 3,
    heightSegments: 200,
    bonesQty: 5,
    widthSegments: 1,
    depthSegments: 1,
  };
  #skeleton!: Skeleton;

  constructor() {
    this.#main = new Main();
    this.#scene = this.#main.scene;

    this.setMaterial();
    this.setGeometry();
    this.setBones();
    this.setMesh();
  }

  setMaterial() {
    this.#material = new MeshStandardMaterial();
    this.#material.color.set('#ffff00').convertSRGBToLinear();
    this.#material.wireframe = true;
  }

  setGeometry() {
    this.geometry = new BoxBufferGeometry(
      this.#sizing.width,
      this.#sizing.height,
      this.#sizing.depth,
      this.#sizing.widthSegments,
      this.#sizing.heightSegments,
      this.#sizing.depthSegments
    );

    const vertex = new Vector3();
    const segmentHeight = (this.#sizing.height / this.#sizing.bonesQty);
    const halfHeight = segmentHeight * .5;

    for (let i = 0; i < this.geometry.attributes.position.count; i++) {
      vertex.fromBufferAttribute(this.geometry.attributes.position, i);
      const y = vertex.y + halfHeight;

      const skinIndex = Math.floor(y / segmentHeight);
      const skinWeight = ( y % segmentHeight ) / segmentHeight;
      console.log(skinIndex, skinWeight);

      this.#skin.indices.push( skinIndex, skinIndex + 1, 0, 0 );
      this.#skin.weights.push( 1 - skinWeight, skinWeight, 0, 0 );
    }

    this.geometry.setAttribute('skinIndex', new Uint16BufferAttribute(this.#skin.indices, 4));
    this.geometry.setAttribute('skinWeight', new Float32BufferAttribute(this.#skin.weights, 4));
  }

  setBones() {
    const segmentHeight = (this.#sizing.height / this.#sizing.bonesQty);
    const halfHeight = segmentHeight * .5;
    let prevBone = new Bone();
    this.bones.push(prevBone);
    prevBone.position.y =  - halfHeight;

    for ( let i = 0; i < segmentHeight; i ++ ) {
      const bone = new Bone();
      bone.position.y = segmentHeight;
      this.bones.push(bone);
      prevBone.add(bone);
      prevBone = bone;
    }
  }

  setMesh() {
    this.mesh = new SkinnedMesh(this.geometry, this.#material);
    this.#skeleton = new Skeleton(this.bones);
    this.mesh.add(this.bones[0]);
    this.mesh.bind(this.#skeleton);
    this.mesh.scale.multiplyScalar(1);

    const skeletonHelper = new SkeletonHelper(this.mesh);
    // @ts-ignore
    skeletonHelper.material.lineWidth = 4;

    this.#scene.add(
      this.mesh,
      skeletonHelper
    );

    this.mesh.position.set(5, 4, 3);

    this.mesh.skeleton.bones[1].rotation.z = Math.PI * .05;
    this.mesh.skeleton.bones[2].rotation.z = Math.PI * .05;
    this.mesh.skeleton.bones[3].rotation.x = Math.PI * .05;


    // Experiment
    const eShape = new Shape();
    eShape.moveTo(0, 0);
    eShape.lineTo(3, 0);
    eShape.lineTo(6, 0);
    eShape.lineTo(6, -1);
    eShape.lineTo(8, 0.5);
    eShape.lineTo(6, 2);
    eShape.lineTo(6, 1);
    eShape.lineTo(3, 1);
    eShape.lineTo(0, 1);
    eShape.lineTo(0, 0);
    const eGeom = new ExtrudeGeometry(eShape, {
      steps: 2,
      depth: 1,
      bevelEnabled: false,
    });

    const eMat = new MeshStandardMaterial({color: '#ff0000'});
    eMat.wireframe = true;
    const eMesh = new Mesh(eGeom, eMat);
    eMesh.position.set(5, 5, 5);

    this.#scene.add(eMesh);
  }
}
