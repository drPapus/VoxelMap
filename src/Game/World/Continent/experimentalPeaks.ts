// @ts-nocheck
import Main from '../../Main';
import {ContinentInterface} from '../../@types/Continent';
import {
  BufferAttribute,
  BufferGeometry, Color,
  InstancedMesh, Line3,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Texture,
  Vector3
} from 'three';
import VoxelFaces from './VoxelFaces';
import {FaceInterface} from '../../@types/Face';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';
import {getCacheKeyForTileGeometry} from "./Tiles";
import {getCacheKeyForPeakMaterial} from "./Peaks";
import {randInt} from "three/src/math/MathUtils";

type level = string;

export class ExperimentalPeaks {
  #main: Main;
  #config: Main['config'];
  #map: Main['map'];
  #resources: Main['resources'];
  #continent: ContinentInterface;
  #voxel: Main['config']['world']['voxel'];
  #cache: Main['cache'];
  #textures: Record<string, Texture> = {};
  #landscape: Mesh;
  #material!: MeshStandardMaterial;
  #attributes!: {
    positions: number[],
    normals: number[],
    indices: number[]
  };
  #geometry!: BufferGeometry;
  mesh!: InstancedMesh;


  constructor(continent: ContinentInterface, landscape: Mesh) {
    this.#main = new Main();
    this.#config = this.#main.config;
    this.#map = this.#main.map;
    this.#landscape = landscape;
    this.#cache = this.#main.cache;
    this.#resources = this.#main.resources;
    this.#continent = continent;
    this.#voxel = this.#config.world.voxel;
    this.#voxel.faces = VoxelFaces(this.#config.world.voxel.size, this.#config.world.voxel.depth, 'top');

    this.setMaterial();
    this.setGeometry();
    this.setMesh();
  }

  async loadResources() {
    this.#textures.map =
      await this.#resources.getSource(this.#map.sea.material.texture) as Texture;
    // this.#textures.woodHightMapTexture =
    //   await this.#resources.getSource(this.#map.sea.material.texture) as Texture;
  }

  generateGeometryDataForCell() {
    this.#attributes = {
      positions: [],
      normals: [],
      indices: [],
    };
    for (const {side, dir, corners} of (this.#voxel.faces as FaceInterface[])) {
      const ndx = this.#attributes.positions.length / 3;
      for (const pos of corners) {
        this.#attributes.positions.push(
          ...getVertexPositionForBufferAttributes(
            this.#voxel,
            {x: pos[0], y: pos[1], z: pos[2]},
            {x: 0, y: 0, z: 0}
          )
        );
        this.#attributes.normals.push(...dir);
      }

      this.#attributes.indices.push(
        ndx, ndx + 1, ndx + 2,
        ndx + 2, ndx + 1, ndx + 3,
      );
    }
  }

  getPeakUVs(position: BufferAttribute) {
    /*
           0.1      1.1
              ######
              ######    <- texture
              ######
           0.0      1.0
     */
    const uv = [];
    const leftSideLine = new Line3(
      new Vector3(this.#map.sea.size.width / -2, 0, this.#map.sea.size.height / 2),
      new Vector3(this.#map.sea.size.width / -2, 0, this.#map.sea.size.height / -2)
    );
    const bottomSideLine = new Line3(
      new Vector3(this.#map.sea.size.width / -2, 0, this.#map.sea.size.height / 2),
      new Vector3(this.#map.sea.size.width / 2, 0, this.#map.sea.size.height / 2)
    );

    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex++) {
      const peakVertex = new Vector3().fromBufferAttribute(position, vertexIndex);
      peakVertex.y = 0; // может и лишнее, но для чистоты расчета
      const offsetLeft = leftSideLine
        .closestPointToPoint(peakVertex, false, new Vector3())
        .distanceTo(peakVertex);
      const offsetBottom = bottomSideLine
        .closestPointToPoint(peakVertex, false, new Vector3())
        .distanceTo(peakVertex);
      uv.push(
        offsetLeft / this.#map.sea.size.width,
        offsetBottom / this.#map.sea.size.height
      );
    }

    return uv;
  }

  setGeometry() {
    const key = 'experimentalPeak_geometry';
    if (this.#cache.hasOwnProperty(key)) {
      this.#geometry = this.#cache[key] as BufferGeometry;
      return;
    }
    this.generateGeometryDataForCell();
    this.#geometry = this.#cache[key] = new BufferGeometry();
    this.#geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(this.#attributes.positions), 3)
    );
    this.#geometry.setAttribute(
      'normal',
      new BufferAttribute(new Float32Array(this.#attributes.normals), 3)
    );
    this.#geometry.setIndex(this.#attributes.indices);
  }

  setMaterial() {
    const key = `experimentalPeak_material_${this.#continent.status}`;

    if (this.#cache.hasOwnProperty(key)) {
      this.#material = this.#cache[key] as MeshStandardMaterial;
      return;
    }

    this.#material = this.#cache[key] = new MeshStandardMaterial();

    (async () => {
      await this.loadResources();
      this.#material.map = this.#textures.map;
      this.#material.needsUpdate = true;
      // material.displacementMap = this.#textures.woodHightMapTexture;
    })();
  }

  setMesh() {
    this.mesh = new InstancedMesh(this.#geometry, this.#material, this.#continent.landscape.tiles.length);

    this.mesh.name = 'experimentalPeak';

    const _position = new Vector3();
    const _dummy = new Object3D();
    for (let i = 0; i < this.#continent.landscape.tiles.length; i++) {
      const {x, z} = getCoordinates(this.#continent.landscape.tiles[i]);
      const y = this.#continent.landscape.peakLevels[i];
      _position.set(...getVertexPositionForBufferAttributes(
        this.#voxel,
        {x: 0, y: 0, z: 0},
        {x, y, z}
      ));
      _dummy.position.copy(_position);
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);
      this.mesh.setColorAt(i, new Color(`rgb(${randInt(1, 255)}, ${randInt(1, 255)}, ${randInt(1, 255)})`));
    }

    const position = new BufferAttribute(this.mesh.geometry.getAttribute('position').array, 3);
    this.mesh.geometry.setAttribute(
      'uv',
      new BufferAttribute(new Float32Array(this.getPeakUVs(position)), 2)
    );

    this.#landscape.add(this.mesh);
  }
}
