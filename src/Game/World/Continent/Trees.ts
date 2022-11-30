import {
  Mesh,
  InstancedMesh,
  Vector3,
  Matrix4,
  MeshStandardMaterial,
  BufferGeometry,
  Object3D,
  Color,
} from 'three';
import {
  randFloat
} from 'three/src/math/MathUtils';
import {mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

import Main from '../../Main';
import Cache from '../../Utils/Cache';
import {ContinentConditionType, ContinentInterface} from '../../@types/Continent';
import {Peaks} from './Peaks';


export function getCacheKeyForTreeMaterial(
  continentStatus: ContinentInterface['status'],
  modifier?: ContinentConditionType
) {
  return `tree_material_${continentStatus}`
    + (modifier && modifier !== 'default' ? `_${modifier}` : '');
}

export const treesSetCondition = (
  trees: InstancedMesh,
  continentStatus: ContinentInterface['status'],
  condition: ContinentConditionType
) => {
  const key = getCacheKeyForTreeMaterial(continentStatus, condition);
  if (!Cache.isExist(key)) {
      console.warn('Trees cache doesn\'t exist now');
      return;
  }
  trees.material = Cache.get(key) as MeshStandardMaterial;
};


export class Trees {
  #main: Main;
  #scene: Main['scene'];
  #resources: Main['resources'];
  #config: Main['config'];
  #renderer!: Main['renderer'];
  // textures!: Record<string, any>
  treeModel!: GLTF;
  #continentStatus: ContinentInterface['status'];
  #peaks: Peaks;
  treeObj!: Mesh;
  mesh!: InstancedMesh;
  #material!: MeshStandardMaterial;
  geometry!: BufferGeometry;
  #landscape: Mesh;
  #surfaceMesh?: MeshSurfaceSampler;
  resourcesLoaded = false;


  constructor(peaks: Peaks, continentStatus: ContinentInterface['status'], landscape: Mesh) {
    this.#main = new Main();
    this.#scene = this.#main.scene;
    this.#config = this.#main.config;
    this.#resources = this.#main.resources;
    this.#renderer = this.#main.renderer;
    this.#peaks = peaks;
    this.#landscape = landscape;
    this.#continentStatus = continentStatus;

    (async () => {
      await this.loadResources();
      this.setGeometry();
      this.setMaterial();
      this.setMesh();
      this.#renderer.updateShadow();
    })();
  }


  async loadResources() {
    this.treeModel = await this.#resources.getSource(this.#config.world.trees.model) as GLTF;
    this.treeObj = this.treeModel.scene.getObjectByName('tree_default') as Mesh;
    this.resourcesLoaded = true;
  }


  setGeometry() {
    const defaultTransform = new Matrix4()
      .makeRotationX(Math.PI * .5);
    this.geometry = this.treeObj.geometry.clone();
    this.geometry.applyMatrix4(defaultTransform);
  }


  setMaterial() {
    const key = getCacheKeyForTreeMaterial(this.#continentStatus);
    if (Cache.isExist(key)) {
      this.#material = Cache.get(key) as MeshStandardMaterial;
      return;
    }

    // Set default material
    this.#material = (this.treeObj.material as MeshStandardMaterial).clone();
    this.#material.color.set(this.#config.world.trees.color).convertSRGBToLinear();
    if (this.#continentStatus === 'explored') {
      this.#material.color.lerp(new Color('#ffffff'), 1);
    }

    // Set Intersected Material
    const intersectedMaterial = this.#material.clone();
    intersectedMaterial.emissive.set(this.#config.world.hoverEmisseve);
    intersectedMaterial.emissiveIntensity = this.#config.world.hoverEmisseveIntensity;

    // Add materials to cache
    Cache.add(key, this.#material);
    Cache.add(
      getCacheKeyForTreeMaterial(this.#continentStatus, 'intersected'),
      intersectedMaterial
    );
  }


  setMeshSurfaceSampler() {
    const mergedPeaks = mergeBufferGeometries(Object.values(this.#peaks.geometries).slice(0, -1));
    this.#surfaceMesh = new MeshSurfaceSampler(new Mesh(mergedPeaks)).build();
  }


  setMesh() {
    this.setMeshSurfaceSampler();
    const sampler = this.#surfaceMesh as MeshSurfaceSampler;
    // const countTrees = randInt(30, 50);
    const countTrees = 40;
    const sampleMesh = new InstancedMesh(this.geometry, this.#material, countTrees);
    sampleMesh.castShadow = true;
    sampleMesh.receiveShadow = true;
    const _position = new Vector3();
    const _dummy = new Object3D();
    const _normal = new Vector3();
    for (let i = 0; i < countTrees; i++) {
      const scale = randFloat(2.5, 5);
      sampler.sample(_position, _normal);
      _normal.add(_position);
      _dummy.scale.set(scale, scale, scale);
      _dummy.position.copy(_position);
      _dummy.lookAt(_normal);
      _dummy.updateMatrix();
      sampleMesh.setMatrixAt(i, _dummy.matrix);
    }
    sampler.geometry.dispose();
    this.mesh = sampleMesh;
    this.#landscape.add(this.mesh);
  }
}
