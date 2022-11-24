import {
  Mesh,
  InstancedMesh,
  Vector3,
  Matrix4,
  Object3D,
  MeshStandardMaterial,
  BufferGeometry, Texture,
} from 'three';
import {
  randInt,
  randFloat
} from 'three/src/math/MathUtils';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

import Main from '../../Main';
import {ContinentInterface} from '../../@types/Continent';
import Peaks from './Peaks';


export function getCacheKeyForTreeMaterial(continentStatus: ContinentInterface['status']) {
  return `tree_material_${continentStatus}`;
}


export default class Trees {
  #main: Main;
  #scene: Main['scene'];
  #resources: Main['resources'];
  #config: Main['config'];
  #cache: Main['cache'];
  // textures!: Record<string, any>
  treeModel!: GLTF;
  continentStatus: ContinentInterface['status'];
  #peaks: Peaks;
  treeObj!: Mesh;
  mesh!: Mesh;
  material!: MeshStandardMaterial;
  geometry!: BufferGeometry;


  constructor(peaks: Peaks, continentStatus: ContinentInterface['status']) {
    this.#main = new Main();
    this.#scene = this.#main.scene;
    this.#config = this.#main.config;
    this.#cache = this.#main.cache;
    this.#resources = this.#main.resources;
    this.#peaks = peaks;
    this.continentStatus = continentStatus;

    (async () => {
      await this.loadResources();
      this.setGeometry();
      this.setMaterial();
      this.setMesh();
    })();
  }


  async loadResources() {
    this.treeModel = await this.#resources.getSource(this.#config.world.trees.model) as GLTF;
    this.treeObj = this.treeModel.scene.getObjectByName('tree_default') as Mesh;
  }


  setGeometry() {
    const defaultTransform = new Matrix4()
      .makeRotationX(Math.PI * .5);
    this.geometry = this.treeObj.geometry.clone();
    this.geometry.applyMatrix4(defaultTransform);
  }


  setMaterial() {
    const key = getCacheKeyForTreeMaterial(this.continentStatus);
    if (this.#cache[key]) {
      this.material = this.#cache[key] as MeshStandardMaterial;
      return;
    }
    this.material = this.treeObj.material as MeshStandardMaterial;
    this.material = this.material.clone();
    this.material.color.set(this.#config.world.trees.color);
    if (this.continentStatus === 'explored') {
      this.material.emissive.set(this.#config.world.exploredLandEmissive);
      this.material.emissiveIntensity = this.#config.world.exploredLandEmissiveIntensity;
    }
    this.material.emissiveIntensity = 0.2;

    this.#cache[key] = this.material;
  }


  setMesh() {
    const huy = new Mesh(this.geometry, undefined);
    const _count = randInt(20, 40);
    const sampleMesh = new InstancedMesh(this.geometry, this.material, _count);
    sampleMesh.castShadow = true;
    sampleMesh.receiveShadow = true;
    const _position = new Vector3();
    const _dummy = new Object3D();
    const _normal = new Vector3();
    for (let i = 0; i < this.#peaks.meshes.length - 1; i++) {
      const sampler = new MeshSurfaceSampler(this.#peaks.meshes[i]).build();
      for (let i = 0; i < _count / Math.floor(this.#peaks.meshes.length); i++) {
        const scale = randFloat(2.5, 5);
        sampler.sample(_position, _normal);
        _normal.add(_position);
        _dummy.scale.set(scale, scale, scale);
        _dummy.position.copy(_position);
        _dummy.lookAt(_normal);
        _dummy.updateMatrix();
        sampleMesh.setMatrixAt(i, _dummy.matrix);
      }
      this.mesh = sampleMesh;
    }
  }
}
