import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  Texture,
} from 'three';

import Main from '../../Main';
import Cache from '../../Utils/Cache';
import getVoxelFaces from './VoxelFaces';
import {
  getCoordinates,
  isNeighborTile,
  getVertexPositionForBufferAttributes
} from './MapHelpers';

import {ContinentConditionType, ContinentInterface} from '../../@types/Continent';


export function getCacheKeyForLandscapeMaterial(
  continentStatus: ContinentInterface['status'],
  modifier?: ContinentConditionType
) {
  return `landscape_material_${continentStatus}`
    + (modifier && modifier !== 'default' ? `_${modifier}` : '');
}


export const voxelLandscapeMeshName = 'land';

export const voxelLandSetCondition = (
  land: Mesh,
  continentStatus: ContinentInterface['status'],
  condition: ContinentConditionType
) => {
  const key = getCacheKeyForLandscapeMaterial(continentStatus, condition);
  if (!Cache.isExist(key)) {
    console.warn('Land cache doesn\'t exist now');
    return;
  }
  land.material = Cache.get(key) as MeshStandardMaterial;
};

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
  #material!: MeshStandardMaterial;
  mesh!: Mesh;
  resourcesLoaded = false;


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
      for (let y = 0; y <= this.#continent.landscape.peakLevels[index]; y++) {
        // tslint:disable-next-line:no-non-null-assertion
        for (const {side, dir, corners} of this.#voxel.faces!) {
          if (
            // Skip top faces
            ['tt', 'tb'].includes(side)
            // Skip bottom faces if continent not disabled
            || (this.#continent.status !== 'disabled' && ['bb', 'bt'].includes(side))
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
    this.resourcesLoaded = true;
  }


  setMaterial() {
    const key = getCacheKeyForLandscapeMaterial(this.#continent.status);
    if (Cache.isExist(key)) {
      this.#material = Cache.get(key) as MeshStandardMaterial;
      return;
    }

    this.#material = new MeshStandardMaterial();
    this.#material.visible = false;
    Cache.add(key, this.#material);
    this.#material.roughness = 1;

    switch (this.#continent.status) {
      case 'active':
        this.#material.color.set(this.#config.world.voxel.sideColor);
        break;
      case 'explored':
        this.#material
          .color
          .set(this.#config.world.voxel.sideColor)
          .lerp(new Color('#ffffff'), .75);
        break;
      case 'disabled':
        this.#material.color.set(this.#config.world.disabledLandColor);
        this.#material.transparent = true;
        this.#material.opacity = .3;
        break;
    }
    this.#material.color.convertSRGBToLinear();

    (async () => {
      await this.loadResources();
      this.#material.normalMap = this.textures.normalMap;
      this.#material.needsUpdate = true;

      // Set Intersected Material
      if (this.#continent.status !== 'disabled') {
        const selectedMaterial = this.#material.clone();
        selectedMaterial.emissive.set(this.#config.world.hoverEmisseve);
        selectedMaterial.emissiveIntensity = this.#config.world.hoverEmisseveIntensity;
        Cache.add(
          getCacheKeyForLandscapeMaterial(this.#continent.status, 'intersected'),
          selectedMaterial
        );
      }
    })();
  }


  setMesh() {
    this.mesh = new Mesh(this.geometry, this.#material);
    this.mesh.name = voxelLandscapeMeshName;
    this.mesh.layers.enable(1);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    // this.#scene.add(this.mesh);
  }
}
