import {
  AnimationClip,
  AnimationMixer,
  BoxBufferGeometry,
  Mesh,
  MeshStandardMaterial,
  NumberKeyframeTrack,
  Shape,
  CatmullRomCurve3,
  Vector3,
  LineLoop,
  BufferGeometry,
  LineBasicMaterial,
  ColorRepresentation,
  ExtrudeBufferGeometry,
  MeshPhysicalMaterial,
  MeshLambertMaterial,
  LoopOnce,
} from 'three';
import {mergeBufferGeometries, mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils';

import Main from '../../Main';
import {TilePositionType} from '../../@types/Map';
import {Flow, SplineUniformInterface} from '../../Utils/CurveModifier';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';
import {ContinentInterface} from '../../@types/Continent';

type movementSizesType = {
  shaftWidth: number,
  shaftHeight: number,
  shaftSegments: number,

  pointWidth: number,
  pointHeight: number,

  fletchingWidth: number,
  fletchingHeight: number,
  fletchingInside: number,

  depth: number,
  depthSegments: number,
  curveLength: number,
  offsetFromTile: number
};


type movementConfigType = {
  from: {
    continent: ContinentInterface,
    position: TilePositionType,
  },
  to: {
    continent: ContinentInterface,
    position: TilePositionType,
  }
  color?: ColorRepresentation
};

const movementClipName = `movement`;
const getMovementAnimationName = (
  from: movementConfigType['from']['position'],
  to: movementConfigType['to']['position']
) => {
  return `movement_${from}_${to}`;
};


export class SettlementMovements {
  #main: Main;
  #scene: Main['scene'];
  #debug: Main['debug'];
  #movementConfig: movementConfigType;
  #material!: MeshStandardMaterial | MeshPhysicalMaterial | MeshLambertMaterial;
  #animation: Main['animation'];
  #animationName: string;
  #voxel: Main['config']['world']['voxel'];
  #curve!: CatmullRomCurve3 | any;
  #mesh!: Mesh;
  #geometry!: BufferGeometry;
  #flow!: Flow;
  hlp!: any;
  #sizes: movementSizesType = {
    /*
        >>>--------|>
        |     \      \
fletching    shaft   point
   */
    shaftWidth: 0,
    shaftHeight: .7,
    shaftSegments: 0,

    pointWidth: 1,
    pointHeight: 1,

    fletchingWidth: 1,
    fletchingHeight: 1,
    fletchingInside: .4,

    depth: .2,
    depthSegments: 10,
    curveLength: 0,
    offsetFromTile: 2,
  };

  constructor(config: movementConfigType) {
    this.#main = new Main();
    this.#voxel = this.#main.config.world.voxel;
    this.#animation = this.#main.animation;
    this.#debug = this.#main.debug;
    this.#scene = this.#main.scene;
    this.#movementConfig = config;
    this.#animationName = `${config.from.position}${config.to.position}`;

    this.setMaterial();
    this.setCurve();
    this.setSizes();
    this.setGeometry();
    this.setMesh();
    this.setAnimation();
    this.setDebug();
  }


  private setMaterial() {
    this.#material = new MeshStandardMaterial({color: '#b43020'});
    // this.#material.side = DoubleSide;
    // this.#material = new MeshLambertMaterial({color: '#b43020'});
    // this.#material.opacity = .5;
    // this.#material.transparent = true;
    // this.#material.wireframe = true;
    // this.#material = new MeshPhysicalMaterial({
    //   opacity: .7,
    //   transparent: true,
    //   roughness: 0.7,
    //   transmission: 1,
      // thickness: 1,
    // });
  }


  private setCurve() {
    // From
    const fromXZ = getCoordinates(this.#movementConfig.from.position);
    const fromY = this.#movementConfig.from.continent.landscape.peakLevels[
      this.#movementConfig.from.continent.landscape.tiles.indexOf(this.#movementConfig.from.position)
    ];
    const fromXYZ = new Vector3(...getVertexPositionForBufferAttributes(
      this.#voxel,
      {x: 0, y: this.#voxel.depth, z: 0},
      {x: fromXZ.x, y: fromY, z: fromXZ.z}
    ));

    // To
    const toXZ = getCoordinates(this.#movementConfig.to.position);
    const toY = this.#movementConfig.to.continent.landscape.peakLevels[
      this.#movementConfig.to.continent.landscape.tiles.indexOf(this.#movementConfig.to.position)
    ];
    const toXYZ = new Vector3(...getVertexPositionForBufferAttributes(
      this.#voxel,
      {x: 0, y: this.#voxel.depth, z: 0},
      {x: toXZ.x, y: toY, z: toXZ.z}
    ));

    // Before From
    const distance = fromXYZ.distanceTo(toXYZ);
    const beforeFromXYZ = new Vector3().copy(fromXYZ);
    beforeFromXYZ.y = - distance;

    // After To
    /*
                48%         48%    4%
          |-----------|-----------|--|
       before       from         to  after
     */
    const afterToXYZ = toXYZ.clone();
    afterToXYZ.y -= ((distance * 2 / 96) * 100) - (distance * 2);
    // console.log(((distance * 2 / 96) * 100) - (distance * 2));

    this.#curve = new CatmullRomCurve3(
      [beforeFromXYZ, fromXYZ, toXYZ, afterToXYZ],
      false,
    );
  }


  private setSizes() {
    this.#sizes.curveLength = this.#curve.getLength();
    const lengthBetweenFromAndTo = this.#sizes.curveLength * .48;
    this.#sizes.shaftWidth = lengthBetweenFromAndTo - this.#sizes.fletchingWidth - this.#sizes.pointWidth;
    this.#sizes.shaftSegments = Math.ceil(lengthBetweenFromAndTo / 4) * 4;
    console.log('curv size', this.#sizes);
  }


  // TODO DELETE
  private setDebug() {
    // ========================
    const points = this.#curve.getPoints( 50 );
    const line = new LineLoop(
      new BufferGeometry().setFromPoints( points ),
      new LineBasicMaterial( { color: '#8c00ff' } )
    );
    // line.geometry.computeTangents();
    // const helper = new VertexTangentsHelper(line);
    this.#scene.add(line);
    // ========================
    this.hlp = new Mesh(new BoxBufferGeometry(.4, .4, .4), new MeshStandardMaterial({
      color: '#00ff00'
    }));
    this.#scene.add(this.hlp);
    // ========================

    const pos1 = getCoordinates(this.#movementConfig.from.position);
    const pos1y = this.#movementConfig.from.continent.landscape.peakLevels[
      this.#movementConfig.from.continent.landscape.tiles.indexOf(this.#movementConfig.from.position)
    ];
    const pos2 = getCoordinates(this.#movementConfig.to.position);
    const pos2y = this.#movementConfig.to.continent.landscape.peakLevels[
      this.#movementConfig.to.continent.landscape.tiles.indexOf(this.#movementConfig.to.position)
      ];

    const mesh1 = new Mesh(
      new BoxBufferGeometry(.3, .3, .3),
      new MeshStandardMaterial({color: '#ffff00'})
    );
    mesh1.position.set(...getVertexPositionForBufferAttributes(
        this.#voxel,
        {x: 0, y: this.#voxel.depth, z: 0},
        {x: pos1.x, y: pos1y, z: pos1.z}
    ));
    const mesh2 = new Mesh(
      new BoxBufferGeometry(.3, .3, .3),
      new MeshStandardMaterial({color: '#ffff00'})
    );
    mesh2.position.set(...getVertexPositionForBufferAttributes(
        this.#voxel,
        {x: 0, y: this.#voxel.depth, z: 0},
        {x: pos2.x, y: pos2y, z: pos2.z}
    ));

    // ================
    const start = new Mesh(new BoxBufferGeometry(.5, .5, .5), new MeshStandardMaterial({
      color: '#000000',
      transparent: true,
      opacity: .4
    }));
    const end = new Mesh(new BoxBufferGeometry(.5, .5, .5), new MeshStandardMaterial({
      color: '#000000',
      transparent: true,
      opacity: .4
    }));
    start.position.set(-20, 0, 0);
    end.position.set(20, 0, 0);

    this.#scene.add(
      start,
      end,
      mesh2,
      mesh1
    );
  }


  private setGeometry() {
    const fletching = getFletchingGeometry(this.#sizes);
    const shaft = getShaftGeometry(this.#sizes);
    const point = getPointGeometry(this.#sizes);
    this.#geometry = mergeBufferGeometries([fletching, shaft, point]);
  }


  private setMesh() {
    const movementSize = this.#sizes.fletchingWidth + this.#sizes.shaftWidth + this.#sizes.pointWidth;

    this.#mesh = new Mesh(this.#geometry, this.#material);
    this.#flow = new Flow(this.#mesh);
    this.#flow.object3D.matrixAutoUpdate = false;
    this.#flow.updateCurve(0, this.#curve);
    this.#flow.uniforms.spineTexture.value.matrixAutoUpdate = false;
    this.#flow.uniforms.spineOffset.value = movementSize * .5;
    (this.#flow.uniforms as SplineUniformInterface).spineLength.value = this.#sizes.curveLength;
    this.#flow.uniforms.pathOffset.value = .48;
    this.#scene.add(this.#flow.object3D);
    console.log(this.#flow); // TODO DELETE=====================================
  }


  private setAnimation() {
    let clip = this.#animation.getClip(movementClipName);
    if (!clip) {
      clip = getMovementAnimationClip(this.#animationName, 2);
      this.#animation.setClip(movementClipName, clip);
    }
    // @ts-ignore
    const mixer = new AnimationMixer(this.#flow.uniforms.pathOffset);
    const clipAction = mixer.clipAction(clip);
    // clipAction.clampWhenFinished = true;
    clipAction.loop = LoopOnce;
    clipAction.play();
    this.#animation.setAnimation(
      getMovementAnimationName(this.#movementConfig.from.position, this.#movementConfig.to.position),
      mixer
    );
  }
}


const getMovementAnimationClip = (name: string, duration: number) => {
  const times = [0, duration];
  const values = [ 0, .48];
  const track = new NumberKeyframeTrack( '.value', times, values);
  return new AnimationClip(undefined, duration, [track]);
};


const getShaftGeometry = (sizes: movementSizesType) => {
  const {shaftWidth, shaftHeight, depth, shaftSegments} = sizes;
  const geometry = new BoxBufferGeometry(shaftWidth, shaftHeight, depth, shaftSegments);
  return geometry;
};


const getFletchingGeometry = (sizes: movementSizesType) => {
  const {shaftHeight, shaftWidth, depth, fletchingHeight, fletchingWidth, fletchingInside} = sizes;
  const shape = new Shape();
  //  .
  shape.moveTo(0, shaftHeight * .5);

  //   \
  shape.lineTo(-fletchingWidth, fletchingHeight * .5);

  //  \\
  shape.lineTo(-fletchingWidth + fletchingInside, 0);

  //  \\
  //  /
  shape.lineTo(-fletchingWidth, -fletchingHeight * .5);

  //  \\
  //  //
  shape.lineTo(0, -shaftHeight * .5);

  // .
  shape.lineTo(0, shaftHeight * .5);

  const geometry = new ExtrudeBufferGeometry(shape, {
    bevelEnabled: false,
    depth: depth
  });
  geometry.translate(-shaftWidth * .5, 0, -depth * .5);
  geometry.computeVertexNormals();

  return mergeVertices(geometry);
};


const getPointGeometry = (sizes: movementSizesType) => {
  const {shaftHeight, shaftWidth, depth, pointWidth, pointHeight} = sizes;
  const shape = new Shape();

  //  .
  shape.moveTo(0, shaftHeight * .5);

  // |
  shape.lineTo(0, pointHeight * .5);

  // |\
  shape.lineTo(pointWidth, 0);

  // |\
  //  /
  shape.lineTo(0, -pointHeight * .5);

  //  .
  shape.moveTo(0, shaftHeight * .5);

  const geometry = new ExtrudeBufferGeometry(shape, {
    bevelEnabled: false,
    depth: depth
  });
  geometry.translate(shaftWidth * .5, 0, -depth * .5);

  return mergeVertices(geometry);
};
