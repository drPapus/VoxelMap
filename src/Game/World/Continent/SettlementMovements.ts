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
  LoopOnce, ShaderMaterial, Texture, DoubleSide, Color, Vector2, DataTexture, Vector4, Matrix3, Matrix4
} from 'three';
import {mergeBufferGeometries, mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils';
import Main from '../../Main';
import {CHANNELS, Flow, SplineUniformInterface, TEXTURE_HEIGHT, TEXTURE_WIDTH} from '../../Utils/CurveModifier';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';
import FragmentShader from '../../Shaders/SettlementMovements/Fragment.glsl';
import VertexShader from '../../Shaders/SettlementMovements/Vertex.glsl';

import {TilePositionType} from '../../@types/Map';
import {ContinentInterface} from '../../@types/Continent';
import {randFloat, randInt} from "three/src/math/MathUtils";
import {TubePainter} from "three/examples/jsm/misc/TubePainter";
// import VertexShader from "../../Shaders/SelectionVoxel/Vertex.glsl";
// import FragmentShader from "../../Shaders/SelectionVoxel/Fragment.glsl";

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
  gradientWidth: number,
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
  #raycaster: Main['raycaster'];
  #movementConfig: movementConfigType;
  #material!: MeshStandardMaterial | MeshPhysicalMaterial | MeshLambertMaterial | ShaderMaterial;
  #animation: Main['animation'];
  #animationName: string;
  #voxel: Main['config']['world']['voxel'];
  #curve!: CatmullRomCurve3 | any;
  #mesh!: Mesh;
  #geometry!: BufferGeometry;
  #flow!: Flow;
  #sizes: movementSizesType = {
    /*
        >>>--------|>
        |     \      \
fletching    shaft   point
   */
    shaftWidth: 0,
    shaftHeight: .5,
    shaftSegments: 0,

    pointWidth: 1,
    pointHeight: 1,

    fletchingWidth: 1,
    fletchingHeight: 1,
    fletchingInside: .4,

    depth: .1,
    gradientWidth: 1,
    depthSegments: 10,
    curveLength: 0,
    offsetFromTile: 2,
  };

  constructor(config: movementConfigType) {
    this.#main = new Main();
    this.#voxel = this.#main.config.world.voxel;
    this.#raycaster = this.#main.raycaster;
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
    this.addToRaycaster();

    if (this.#debug.active) {
      setDebugMovementsFolder();
      this.setDebug();
    }
  }


  private setMaterial() {
    // this.#material = new ShaderMaterial();
    // this.#material.vertexShader = VertexShader;
    // this.#material.fragmentShader = FragmentShader;
    // this.#material.uniforms = {};
    // this.#material.uniforms.colorOne = {value: new Color('#58ab27')};
    // this.#material.uniforms.colorTwo = {value: new Color('#ff0000')};
    // this.#material.transparent = true;
    // this.#material.needsUpdate = true;

    // const canvasGradient = document.createElement('canvas');
    // const canvasGradientCtx = canvasGradient.getContext('2d') as CanvasRenderingContext2D;
    // const grd = canvasGradientCtx.createLinearGradient(0, 0, 200, 0);
    // grd.addColorStop(0, '#000000');
    // grd.addColorStop(1, '#000000');
    // canvasGradientCtx.fillStyle = grd;
    // canvasGradientCtx.fillRect(10, 10, 150, 80);

    this.#material = new MeshStandardMaterial();
    this.#material.color.set('#b43020');
    // this.#material.wireframe = true;
    // this.#material.alphaMap = new Texture(canvasGradient);
    // this.#material.alphaTest = .5;
    // this.#material.transparent = true;
    // this.#material.onBeforeCompile = (shader) => {
    //   shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4(1)', 'gl_FragColor = vec4(0)')
    //   console.log('before compile', shader);
    // };
    // (async () => {
    //   (this.#material as MeshStandardMaterial).map =
    //       await this.#main.resources.getSource(this.#main.map.sea.material.texture) as Texture;
    //   this.#material.needsUpdate = true;
    //   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    // })();

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
      {x: 0, y: this.#voxel.depth * 1.5, z: 0},
      {x: fromXZ.x, y: fromY, z: fromXZ.z}
    ));

    // To
    const toXZ = getCoordinates(this.#movementConfig.to.position);
    const toY = this.#movementConfig.to.continent.landscape.peakLevels[
      this.#movementConfig.to.continent.landscape.tiles.indexOf(this.#movementConfig.to.position)
    ];
    const toXYZ = new Vector3(...getVertexPositionForBufferAttributes(
      this.#voxel,
      {x: 0, y: this.#voxel.depth * 1.5, z: 0},
      {x: toXZ.x, y: toY, z: toXZ.z}
    ));

    // Before From
    const distance = fromXYZ.distanceTo(toXYZ);
    const beforeFromXYZ = new Vector3().copy(fromXYZ);
    beforeFromXYZ.y -= distance;

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
    this.#sizes.shaftWidth =
        lengthBetweenFromAndTo
        - this.#sizes.fletchingWidth
        - this.#sizes.pointWidth
        - this.#sizes.gradientWidth;
    this.#sizes.shaftSegments = Math.ceil(lengthBetweenFromAndTo / 4) * 4;
    // console.log('curv size', this.#sizes);
  }


  private setGeometry() {
    const fletching = getFletchingGeometry(this.#sizes);
    const shaft = getShaftGeometry(this.#sizes);
    const point = getPointGeometry(this.#sizes);
    this.#geometry = mergeBufferGeometries([
      fletching,
      // shaft,
      point
    ]);
    // this.#geometry = point;
  }


  private setMesh() {
    const movementSize = this.#sizes.fletchingWidth + this.#sizes.shaftWidth + this.#sizes.pointWidth;

    this.#mesh = new Mesh(this.#geometry, this.#material);
    this.#mesh.name = 'movement';
    this.#flow = new Flow(this.#mesh);
    this.#flow.object3D.layers.enable(1);
    this.updateMesh();
    // console.log((this.#flow.object3D.material as MeshStandardMaterial).onBeforeCompile);
    // (this.#flow.object3D.material as MeshStandardMaterial).onBeforeCompile = (shader) => {
    //   shader.fragmentShader = shader + 'dfsfds';
    //   console.log(shader.fragmentShader);
    // };
    this.#flow.object3D.matrixAutoUpdate = false;
    this.#flow.updateCurve(0, this.#curve);
    this.#flow.uniforms.spineTexture.value.matrixAutoUpdate = false;
    this.#flow.uniforms.spineOffset.value = movementSize * .5;
    (this.#flow.uniforms as SplineUniformInterface).spineLength.value = this.#sizes.curveLength;
    this.#flow.uniforms.pathOffset.value = .48;
    this.#scene.add(this.#flow.object3D, this.#mesh);
    // this.#scene.add(this.#mesh);
    console.log(this.#flow); // TODO DELETE=====================================
  }


  private setAnimation() {
    let clip = this.#animation.getClip(movementClipName);
    if (!clip) {
      clip = getMovementAnimationClip(this.#animationName, 20);
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


  private addToRaycaster() {
    this.#raycaster.setIntersectObjects(this.#flow.object3D);
  }


  private updateMesh1() {
    return;
    console.log('mesh', this.#mesh);
    const positions = this.#mesh.geometry.getAttribute('position');
    const uniforms = this.#flow.uniforms as SplineUniformInterface;
    const spineTexture = uniforms.spineTexture.value as DataTexture;
    const pathOffset = uniforms.pathOffset.value;
    const pathSegment = uniforms.pathSegment.value;
    const spineOffset = uniforms.pathOffset.value;
    const spineLength = uniforms.spineLength.value;
    const flow = uniforms.flow.value;
    const modelViewMatrix = this.#mesh.modelViewMatrix.elements;
    const normalMatrix = this.#mesh.normalMatrix;
    const modelMatrix = this.#mesh.matrixWorld.elements;
    const projectionMatrix = this.#main.camera.instance.projectionMatrix.elements;

    const textureLayers = TEXTURE_HEIGHT * this.#flow.curveArray.length;
    const textureStacks = TEXTURE_HEIGHT / 4;

    for (let i = 0; i < positions.count; i++) {
      // TODO Implement instancing when/if needed
      const x = positions.array[i];
      const y = positions.array[i + 1];
      const z = positions.array[i + 2];

      // vec4 worldPos = modelMatrix * vec4(position, 1.);
      const worldPos = new Vector4(0, 0, 0, 1);
      worldPos.x =
          modelMatrix[0] * x + modelMatrix[1] * y + modelMatrix[2] * z + modelMatrix[3];
      worldPos.y =
          modelMatrix[4] * x + modelMatrix[5] * y + modelMatrix[6] * z + modelMatrix[7];
      worldPos.z =
          modelMatrix[8] * x + modelMatrix[9] * y + modelMatrix[10] * z + modelMatrix[11];

      const bend = flow > 0;
      const xWeight = bend ? 0 : 1;
      const spinePortion = bend ? (worldPos.x + spineOffset) / spineLength : 0;
      let mt = (spinePortion * pathSegment + pathOffset) * textureStacks;

      mt = mt % textureStacks;
      const rowOffset = Math.round(mt);
      console.log('mt', mt, rowOffset);

      const img = spineTexture.image;
      // console.log(
      //     'img', // img, this.#flow.splineTexure
      //     img.data[(0 + rowOffset + .5) / textureLayers], (0 + rowOffset + .5) / textureLayers,
      //     img.data[(1 + rowOffset + .5) / textureLayers], (1 + rowOffset + .5) / textureLayers
      // );
      // experiment ==============================
      // const ii = CHANNELS + TEXTURE_WIDTH * o;
      // experiment ==============================
      const spinePos = new Vector3(
          img.data[0],
          img.data[0],
          img.data[0]
      );
      const a = new Vector3();
      const b = new Vector3();
      const c = new Vector3();

      const basis = new Matrix3().set(
        a.x, a.y, a.z,
        b.x, b.y, b.z,
        c.x, c.y, c.z
      );

      const transformed = new Vector3(
          basis.elements[0] * worldPos.x * xWeight
          + basis.elements[1] * worldPos.y * xWeight
          + basis.elements[2] * worldPos.z * xWeight,

          basis.elements[3] * worldPos.x
          + basis.elements[4] * worldPos.y
          + basis.elements[5] * worldPos.z,

          basis.elements[6] * worldPos.x
          + basis.elements[7] * worldPos.y
          + basis.elements[8] * worldPos.z,
      ).add(spinePos);

      // vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 )
      const mvPosition = new Vector4(0, 0, 0, 1);
      mvPosition.x =
          modelViewMatrix[0] * transformed.x
          + modelViewMatrix[1] * transformed.y
          + modelViewMatrix[2] * transformed.z
          + modelViewMatrix[3];
      mvPosition.y =
          modelViewMatrix[4] * transformed.x
          + modelViewMatrix[5] * transformed.y
          + modelViewMatrix[6] * transformed.z
          + modelViewMatrix[7];
      mvPosition.z =
          modelViewMatrix[8] * transformed.x
          + modelViewMatrix[9] * transformed.y
          + modelViewMatrix[10] * transformed.z
          + modelViewMatrix[11];

      // gl_Position = projectionMatrix * mvPosition;
      // @ts-ignore
      positions.array[i * 3] =
        projectionMatrix[0] * mvPosition.x
        + projectionMatrix[1] * mvPosition.y
        + projectionMatrix[2] * mvPosition.z
        + projectionMatrix[3];
      // @ts-ignore
      positions.array[i * 3 + 1] =
          projectionMatrix[4] * mvPosition.x
        + projectionMatrix[5] * mvPosition.y
        + projectionMatrix[6] * mvPosition.z
        + projectionMatrix[7];
      // @ts-ignore
      positions.array[i * 3 + 2] =
        projectionMatrix[8] * mvPosition.x
        + projectionMatrix[9] * mvPosition.y
        + projectionMatrix[10] * mvPosition.z
        + projectionMatrix[11];
    }
    this.#mesh.geometry.setAttribute('position', positions);
    console.log('positions', positions);
  }


  private updateMesh() {
      getCurvedPointGeometry(this.#sizes, this.#flow.splineTexure);
  }


  private setDebug() {
    const points = this.#curve.getPoints(50);
    const line = new LineLoop(
      new BufferGeometry().setFromPoints( points ),
      new LineBasicMaterial( { color: '#8c00ff' } )
    );
    this.#scene.add(line);

    // GUI
    const list = document.querySelector('.movements-debug__list') as Element;
    const info = document.createElement('div');
    info.innerHTML = `
      ${this.#movementConfig.from.position} -> ${this.#movementConfig.to.position}
      <button type="button" class="movements-debug__delete">del</button>
    `;
    (info.querySelector('.movements-debug__delete') as Element).addEventListener('click', () => {
      this.#scene.remove(
          // tslint:disable-next-line:no-non-null-assertion
        this.#scene.getObjectById(this.#flow.object3D.id)!,
          // tslint:disable-next-line:no-non-null-assertion
        this.#scene.getObjectById(line.id)!
      );
      info.remove();
    });
    list.append(info);
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
  const {shaftHeight, shaftWidth, depth, pointWidth, pointHeight, gradientWidth} = sizes;
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

  // |\
  // |/
  // shape.lineTo(0, -shaftHeight * .5);
  const point = mergeVertices(new ExtrudeBufferGeometry(shape, {bevelEnabled: false, depth: depth}));
  const gradient = new BoxBufferGeometry(gradientWidth, shaftHeight, depth, 4);
  gradient.translate(-gradientWidth * .5, 0, depth * .5);

  const geometry = mergeBufferGeometries([point, gradient]);
  geometry.translate((shaftWidth * .5) + gradientWidth, 0, -depth * .5);

  return geometry;
};


const getCurvedPointGeometry = (sizes: movementSizesType, texture: DataTexture) => {
  const {gradientWidth, pointWidth, shaftWidth, fletchingWidth} = sizes;
  const pointGradientSize = pointWidth + gradientWidth;
  const movementWidth = fletchingWidth + shaftWidth + pointGradientSize;
  const pointPercent = pointGradientSize / movementWidth;
  const img = texture.image.data;

  console.log('percent', pointPercent, texture.image.data);
};


// tslint:disable:no-non-null-assertion
const setDebugMovementsFolder = () => {
  const className = 'movements-debug';
  if (document.querySelector(`.${className}`)) {return;}

  const ui = document.querySelector('.dg.main > ul') as HTMLElement;
  const listEl = document.createElement('li');
  listEl.classList.add(className, 'folder');

  listEl.innerHTML = `
    <div class="dg">
      <ul class="closed">
        <li class="title">Movements</li>
        <li class="cr">
          <div class="movements-debug__list" style="margin-bottom: .25rem; padding-bottom: .25rem; border-bottom: 1px dotted #ddd"></div>
          <strong>Add new movement</strong>
          <form class="movements-debug__form" style="display: flex">
            <div style="margin-right: .5rem">
              <strong style="display: block">From</strong>
              <label for="movements-from-position">Position</label>
              <input type="number" id="movements-from-position">
              <hr>
              <label for="movements-from-continent-id">Continent ID</label>
              <input type="number" id="movements-from-continent-id">
            </div>
            <div style="margin-right: .5rem">
              <strong style="display: block">To</strong>
              <label for="movements-to-position">Position</label>
              <input type="number" id="movements-to-position">
              <hr>
              <label for="movements-to-continent-id">Continent ID</label>
              <input type="number" id="movements-to-continent-id">
            </div>
            <div style="width: 100%">
              <button type="button" style="height: 100%; width: 100%" class="movements-debug__add">Add</button>
            </div>
          </form>
        </li>
      </ul>
    </div>
  `;
  ui.append(listEl);

  // Open/Close folder
  (listEl.querySelector('.title') as HTMLElement).addEventListener('click', (e) => {
    const parent = (e.target as Element).parentElement as Element;
    if (parent.classList.contains('closed')) {
      parent.classList.remove('closed');
      // @ts-ignore
      parent.querySelector('.cr').style.height = 'auto';
    } else {
      parent.classList.add('closed');
      // @ts-ignore
      parent.querySelector('.cr').style.height = 0;
    }
  });

  // Add new Movement
  (listEl.querySelector('.movements-debug__add') as HTMLElement).addEventListener('click', () => {
    const from = {
      // @ts-ignore
      position: listEl.querySelector('#movements-from-position').value,
      // @ts-ignore
      continentId: listEl.querySelector('#movements-from-continent-id').value
    };
    const to = {
      // @ts-ignore
      position: listEl.querySelector('#movements-to-position').value,
      // @ts-ignore
      continentId: listEl.querySelector('#movements-to-continent-id').value
    };

    const main = new Main();
    const movement = new SettlementMovements({
      from: {
          continent: main.world!.continents.continentByMeshId[from.continentId],
          position: Number(from.position)
        },
        to: {
          continent: main.world!.continents.continentByMeshId[to.continentId],
          position: Number(to.position)
        }
    });
  });
};
