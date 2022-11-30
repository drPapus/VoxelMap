import {
  Mesh,
  InstancedMesh,
  Vector3,
  Matrix4,
  Object3D,
  MeshStandardMaterial,
  BufferGeometry, Color,
} from 'three';
import {
  randInt,
  randFloat
} from 'three/src/math/MathUtils';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler.js';

import Main from '../../Main';
import Cache from '../../Utils/Cache';
import {ContinentConditionType, ContinentInterface} from '../../@types/Continent';
import {Peaks} from './Peaks';


export function getCacheKeyForMountainMaterial(
  continentStatus: ContinentInterface['status'],
  modifier?: ContinentConditionType
) {
  return `mountain_material_${continentStatus}`
    + (modifier && modifier !== 'default' ? `_${modifier}` : '');
}

export const mountainsSetCondition = (
  mountains: InstancedMesh,
  continentStatus: ContinentInterface['status'],
  condition: ContinentConditionType
) => {
  const key = getCacheKeyForMountainMaterial(continentStatus, condition);
  if (!Cache.isExist(key)) {
    console.warn('Mountain cache doesn\'t exist now');
    return;
  }
  mountains.material = Cache.get(key) as MeshStandardMaterial;
};


export class Mountains {
  #main: Main;
  #scene: Main['scene'];
  #resources: Main['resources'];
  #renderer!: Main['renderer'];
  #config: Main['config'];
  mountainModel!: GLTF;
  #continentStatus: ContinentInterface['status'];
  #peaks: Peaks;
  mountainObj!: Mesh;
  mesh!: InstancedMesh;
  #material!: MeshStandardMaterial;
  #geometry!: BufferGeometry;
  #landscape: Mesh;


  constructor(peaks: Peaks, continentStatus: ContinentInterface['status'], landscape: Mesh) {
    this.#main = new Main();
    this.#scene = this.#main.scene;
    this.#renderer = this.#main.renderer;
    this.#config = this.#main.config;
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
    this.#geometry = this.mountainObj.geometry.clone();
    this.#geometry.applyMatrix4(defaultTransform);
  }


  setMaterial() {
    const key = getCacheKeyForMountainMaterial(this.#continentStatus);
    if (Cache.isExist(key)) {
      this.#material = Cache.get(key) as MeshStandardMaterial;
      return;
    }

    // Set default material
    this.#material = (this.mountainObj.material as MeshStandardMaterial).clone();
    this.#material.color.set(this.#config.world.mountains.color).convertSRGBToLinear();
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
      getCacheKeyForMountainMaterial(this.#continentStatus, 'intersected'),
      intersectedMaterial
    );
  }


  setMesh() {
    const peak = this.#peaks.meshes[this.#peaks.meshes.length - 1];
    const countMountains = randInt(4, 10);
    const sampler = new MeshSurfaceSampler(peak).build();
    const sampleMesh = new InstancedMesh(this.#geometry, this.#material, countMountains);
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
