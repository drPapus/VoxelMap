import {
  BufferAttribute,
  BufferGeometry, InstancedMesh,
  Mesh,
  MeshBasicMaterial, Object3D, Vector3,
} from 'three';

import Main from '../../Main';
import Cache from '../../Utils/Cache';
import VoxelFaces from './VoxelFaces';
import {ContinentInterface} from '../../@types/Continent';
import {TileInterface} from '../../@types/Tile';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';
import {FaceInterface} from '../../@types/Face';


export function getCacheKeyForTileMaterial() {
  return `tile_material`;
}


export function getCacheKeyForTileGeometry() {
  return `tile_geometry`;
}


export const tilesMeshName = 'tiles';
const fixYFighting = 0.001;


export default class Tiles {
  #main: Main;
  #config: Main['config'];
  #map: Main['map'];
  #continent: ContinentInterface;
  #landscape: Mesh;
  #voxel: Main['config']['world']['voxel'];
  #attributes!: {
    positions: number[],
    normals: number[],
    indices: number[]
  };
  #geometry!: BufferGeometry;
  mesh!: InstancedMesh;
  #material!: MeshBasicMaterial;
  tiles: TileInterface[] = [];


  constructor(continent: ContinentInterface, landscape: Mesh) {
    this.#main = new Main();
    this.#config = this.#main.config;
    this.#map = this.#main.map;
    this.#landscape = landscape;
    this.#continent = continent;
    this.#voxel = this.#config.world.voxel;
    this.#voxel.faces = VoxelFaces(this.#config.world.voxel.size, this.#config.world.voxel.depth, 'top');

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setTiles();
  }


  generateGeometryDataForCell() {
    this.#attributes = {
      positions: [],
      normals: [],
      indices: [],
    };
    for (const {dir, corners} of (this.#voxel.faces as FaceInterface[])) {
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


  setGeometry() {
    const key = getCacheKeyForTileGeometry();
    if (Cache.isExist(key)) {
      this.#geometry = Cache.get(key) as BufferGeometry;
      return;
    }
    this.generateGeometryDataForCell();
    this.#geometry = new BufferGeometry();
    Cache.add(key, this.#geometry);
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
    const key = getCacheKeyForTileMaterial();
    if (Cache.isExist(key)) {
      this.#material = Cache.get(key) as MeshBasicMaterial;
      return;
    }

    this.#material = new MeshBasicMaterial();
    this.#material.visible = false;
    Cache.add(key, this.#material);
  }


  setMesh() {
    this.mesh = new InstancedMesh(this.#geometry, this.#material, this.#continent.landscape.tiles.length);
    this.mesh.name = tilesMeshName;
    this.mesh.layers.enable(1);

    const _position = new Vector3();
    const _dummy = new Object3D();

    for (const [index, tile] of this.#continent.landscape.tiles.entries()) {
      const {x, z} = getCoordinates(tile);
      const y = this.#continent.landscape.peakLevels[index];
      _position.set(...getVertexPositionForBufferAttributes(
        this.#voxel,
        {x: 0, y: 0, z: 0},
        {x, y, z}
      ));
      _dummy.position.copy(_position);
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(index, _dummy.matrix);
    }

    this.mesh.position.y += fixYFighting;
    this.#landscape.add(this.mesh);
  }


  setTiles() {
    for (const [index, tile] of this.#continent.landscape.tiles.entries()) {
      const {x, z} = getCoordinates(tile);
      const y = this.#continent.landscape.peakLevels[index];
      this.tiles.push({
        position: tile,
        center: getVertexPositionForBufferAttributes(
          this.#voxel,
          {x: 0, y: this.#voxel.depth, z: 0},
          {x, y, z}
        )
      });
    }
  }
}
