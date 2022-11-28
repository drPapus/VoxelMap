// @ts-nocheck
import {
  Mesh,
  InstancedMesh,
  Vector3,
  Matrix4,
  Object3D,
  MeshStandardMaterial,
  BufferGeometry,
} from 'three';
import {
  randInt,
  randFloat
} from 'three/src/math/MathUtils';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler.js';

import Main from '../../Main';
import {ContinentInterface} from '../../@types/Continent';
import Peaks from './Peaks';


export function getCacheKeyForMountainMaterial(continentStatus: ContinentInterface['status']) {
  return `mountain_material_${continentStatus}`;
}


export default class Mountains {
  #main: Main;
  #scene: Main['scene'];
  #resources: Main['resources'];
  #renderer!: Main['renderer'];
  #config: Main['config'];
  #cache: Main['cache'];
  mountainModel!: GLTF;
  #continentStatus: ContinentInterface['status'];
  #peaks: Peaks;
  mountainObj!: Mesh;
  mesh!: Mesh;
  material!: MeshStandardMaterial;
  geometry!: BufferGeometry;
  #landscape: Mesh;


  constructor(peaks: Peaks, continentStatus: ContinentInterface['status'], landscape: Mesh) {
    this.#main = new Main();
    this.#scene = this.#main.scene;
    this.#renderer = this.#main.renderer;
    this.#config = this.#main.config;
    this.#cache = this.#main.cache;
    this.#resources = this.#main.resources;
    this.#landscape = landscape;
    this.#peaks = peaks;
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
    this.mountainModel = await this.#resources.getSource(this.#config.world.mountains.model) as GLTF;
    this.mountainObj = this.mountainModel.scene.getObjectByName('mountain_default') as Mesh;
  }


  setGeometry() {
    const defaultTransform = new Matrix4()
      .makeRotationX(Math.PI * .5);
    this.geometry = this.mountainObj.geometry.clone();
    this.geometry.applyMatrix4(defaultTransform);
  }


  setMaterial() {
    const key = getCacheKeyForMountainMaterial(this.#continentStatus);
    if (this.#cache.hasOwnProperty(key)) {
      this.material = this.#cache[key] as MeshStandardMaterial;
      return;
    }
    this.material = this.#cache[key] = (this.mountainObj.material as MeshStandardMaterial).clone();
    this.material.color.set(this.#config.world.mountains.color).convertSRGBToLinear();
    if (this.#continentStatus === 'explored') {
      this.material.emissive.set(this.#config.world.exploredLandEmissive);
      this.material.emissiveIntensity = this.#config.world.exploredLandEmissiveIntensity;
    }
  }


  setMesh() {
    const peak = this.#peaks.meshes[this.#peaks.meshes.length - 1];
    const countMountains = randInt(4, 10);
    const sampler = new MeshSurfaceSampler(peak).build();
    const sampleMesh = new InstancedMesh(this.geometry, this.material, countMountains);
    sampleMesh.castShadow = true;
    sampleMesh.receiveShadow = true;
    const _position = new Vector3();
    const _dummy = new Object3D();
    const _normal = new Vector3();
    for (let i = 0; i < countMountains; i++) {
      sampler.sample(_position, _normal);
      _normal.add(_position);
      const scale = randFloat(0.7, 1.5);
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
