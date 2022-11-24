import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial, Texture,
} from 'three';

import Main from '../../Main';
import getVoxelFaces from './VoxelFaces';
import {
  getCoordinates,
  isNeighborTile,
  getVertexPositionForBufferAttributes
} from './MapHelpers';

import {ContinentInterface} from '../../@types/Continent';


export class VoxelLandscape {
  #main: Main;
  #config: Main['config'];
  #resources: Main['resources'];
  #map: Main['map'];
  #scene: Main['scene'];
  #continent: ContinentInterface;
  textures: Record<string, Texture> = {};
  #voxel: Main['config']['world']['voxel'];
  attributes!: {
    positions: number[],
    normals: number[],
    indices: number[]
  };
  geometry!: BufferGeometry;
  material!: MeshStandardMaterial;
  mesh!: Mesh;


  constructor(continent: ContinentInterface) {
    this.#main = new Main();
    this.#config = this.#main.config;
    this.#resources = this.#main.resources;
    this.#scene = this.#main.scene;
    this.#map = this.#main.map;
    this.#continent = continent;
    this.#voxel = this.#config.world.voxel;
    this.#voxel.faces = getVoxelFaces(this.#voxel.size, this.#voxel.depth);
    this.generateGeometryDataForCell();
    this.setMaterial();
    this.setGeometry();
    this.setMesh();
  }


  generateGeometryDataForCell() {
    this.attributes = {
      positions: [],
      normals: [],
      indices: []
    };
    for (const [index, position] of this.#continent.landscape.tiles.entries()) {
      const {x, z} = getCoordinates(position);
      for (let y = 1; y <= this.#continent.landscape.peakLevels[index]; y++) {
        // tslint:disable-next-line:no-non-null-assertion
        for (const {side, dir, corners} of this.#voxel.faces!) {
          if (
            // Пропускаем верхние фейсы
            ['tt', 'tb'].includes(side)
            // Есть сосед - не рисуем грань
            || isNeighborTile(
                this.#continent.landscape.tiles,
                this.#continent.landscape.peakLevels,
                {
                  x: x + dir[0],
                  y: y + dir[1],
                  z: z + dir[2] + ('acfd'.includes(side) ? Math.abs(x) % 2 : 0)
                }
              )
          ) {
            continue;
          }

          const ndx = this.attributes.positions.length / 3;

          for (const pos of corners) {
            this.attributes.positions.push(
              ...getVertexPositionForBufferAttributes(
                this.#voxel,
                {x: pos[0], y: pos[1], z: pos[2]},
                {x: x, y: y, z: z}
              )
            );
            this.attributes.normals.push(...dir);
          }

          this.attributes.indices.push(
            ndx, ndx + 1, ndx + 2,
            ndx + 2, ndx + 1, ndx + 3
          );
        }
      }
    }
  }


  setGeometry() {
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(this.attributes.positions), 3)
    );
    this.geometry.setAttribute(
      'normal',
      new BufferAttribute(new Float32Array(this.attributes.normals), 3)
    );
    this.geometry.setIndex(this.attributes.indices);
  }


  private async loadResources() {
    this.textures.normalMap =
      await this.#resources.getSource(this.#map.sea.material.textureNormal) as Texture;
  }

  // TODO implement material cache
  setMaterial() {
    this.material = new MeshStandardMaterial();
    this.material.roughness = 1;

    switch (this.#continent.status) {
      case 'active':
        this.material.color.set(this.#config.world.voxel.sideColor);
        break;
      case 'disabled':
        this.material.color.set(this.#config.world.disabledLandColor);
        this.material.transparent = true;
        this.material.opacity = .3;
        break;
      case 'explored':
        this.material.color.set(this.#config.world.voxel.sideColor);
        this.material.emissive.set(this.#config.world.exploredLandEmissive);
        this.material.emissiveIntensity = this.#config.world.exploredLandEmissiveIntensity;
        break;
    }

    (async () => {
      await this.loadResources();
      this.material.normalMap = this.textures.normalMap;
    })();
  }


  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.name = 'land';
    this.mesh.layers.enable(1);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.#scene.add(this.mesh);
  }
}
