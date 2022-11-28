import {
  BufferAttribute,
  BufferGeometry,
  Line3,
  Mesh,
  MeshStandardMaterial, Texture,
  Vector3,
} from 'three';

import Main from '../../Main';
import VoxelFaces from './VoxelFaces';

import {ContinentInterface} from '../../@types/Continent';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';
import {FaceInterface} from '../../@types/Face';

type level = string;


export function getCacheKeyForPeakMaterial(level: level, continentStatus: ContinentInterface['status']) {
  return `peak_material_${continentStatus}_${level}`;
}


export default class Peaks {
  #main: Main;
  #config: Main['config'];
  #map: Main['map'];
  #resources: Main['resources'];
  #continent: ContinentInterface;
  #voxel: Main['config']['world']['voxel'];
  #cache: Main['cache'];
  #textures: Record<string, Texture> = {};
  #landscape: Mesh;
  #material: Record<level, MeshStandardMaterial> = {};
  attributes: Record<level, {
    positions: number[],
    normals: number[],
    indices: number[]
  }> = {};
  geometries: Record<level, BufferGeometry> = {};
  meshes!: Mesh[];


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

    this.generateGeometryDataForCell();
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }


  async loadResources() {
    this.#textures.map =
      await this.#resources.getSource(this.#map.sea.material.texture) as Texture;
    // this.#textures.woodHightMapTexture =
    //   await this.#resources.getSource(this.#map.sea.material.texture) as Texture;
  }


  generateGeometryDataForCell() {
    for (const [index, position] of this.#continent.landscape.tiles.entries()) {
      const {x, z} = getCoordinates(position);
      const y = this.#continent.landscape.peakLevels[index];
      if (!this.attributes[y]) {
        this.attributes[y] = {
          positions: [],
          normals: [],
          indices: []
        };
      }
      for (const {side, dir, corners} of (this.#voxel.faces as FaceInterface[])) {
        const ndx = this.attributes[y].positions.length / 3;

        for (const pos of corners) {
          this.attributes[y].positions.push(
            ...getVertexPositionForBufferAttributes(
              this.#voxel,
              {x: pos[0], y: pos[1], z: pos[2]},
              {x, y, z})
          );
          this.attributes[y].normals.push(...dir);
        }

        this.attributes[y].indices.push(
          ndx, ndx + 1, ndx + 2,
          ndx + 2, ndx + 1, ndx + 3,
        );
      }
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
    for (const [key, attributes] of Object.entries(this.attributes)) {
      const geometry = new BufferGeometry();
      const position = new BufferAttribute(new Float32Array(attributes.positions), 3);
      geometry.setAttribute('position', position);
      geometry.setAttribute(
        'normal',
        new BufferAttribute(new Float32Array(attributes.normals), 3)
      );
      geometry.setIndex(attributes.indices);
      geometry.setAttribute(
        'uv',
        new BufferAttribute(new Float32Array(this.getPeakUVs(position)), 2)
      );

      this.geometries[key] = geometry;
    }
  }


  setMaterial() {
    for (const level of Object.keys(this.geometries)) {
      const key = getCacheKeyForPeakMaterial(level, this.#continent.status);

      if (this.#cache.hasOwnProperty(key)) {
        this.#material[level] = this.#cache[key] as MeshStandardMaterial;
        continue;
      }

      const material = new MeshStandardMaterial();
      switch (this.#continent.status) {
        case 'active':
          material.color.set(this.#config.world.peakLevelColors[+level]);
          break;
        case 'explored':
          material.color.set(this.#config.world.peakLevelColors[+level]);
          material.emissive.set(this.#config.world.exploredLandEmissive);
          material.emissiveIntensity = this.#config.world.exploredLandEmissiveIntensity;
          break;
        case 'disabled':
          material.color.set(this.#config.world.disabledLandColor);
          material.transparent = true;
          material.opacity = .3;
          break;
      }
      material.color.convertSRGBToLinear();

      (async () => {
        await this.loadResources();
        material.map = this.#textures.map;
        material.needsUpdate = true;
        // material.displacementMap = this.#textures.woodHightMapTexture;
      })();

      this.#material[level] = this.#cache[key] = material;
    }
  }


  setMesh() {
    this.meshes = [];
    for (const level of Object.keys(this.geometries)) {
      const mesh = new Mesh(this.geometries[level], this.#material[level]);
      mesh.name = 'peak';
      mesh.receiveShadow = true;
      this.meshes.push(mesh);
      this.#landscape.add(mesh);
    }
  }
}
