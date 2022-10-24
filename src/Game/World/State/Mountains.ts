import {
  Mesh,
  InstancedMesh,
  Vector3,
  Matrix4,
  Object3D,
  MeshStandardMaterial,
  BufferGeometry, Color,
} from 'three'
import {
  randInt,
  randFloat
} from "three/src/math/MathUtils"
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

import Main from "../../Main"
import {StateInterface} from "../../Interfaces/StateInterface"
import Peaks from "./Peaks"


export default class Mountains {
  main: Main
  scene: Main['scene']
  resources: Main['resources']
  config: Main['config']
  // textures!: Record<string, any>
  mountainModel!: GLTF
  stateStatus: StateInterface['status']
  peaks: Peaks
  mountainObj: Mesh
  mesh!: Mesh
  material!: MeshStandardMaterial
  geometry!: BufferGeometry


  constructor(peaks: Peaks, stateStatus: StateInterface['status']) {
    this.main = new Main()
    this.scene = this.main.scene
    this.config = this.main.config
    this.resources = this.main.resources
    this.mountainModel = this.resources.items.mountainGlb as GLTF
    this.peaks = peaks
    this.stateStatus = stateStatus
    this.mountainObj = this.mountainModel.scene.getObjectByName('mountain_default') as Mesh

    this.setGeometry()
    this.setMaterial()
    // this.setTextures()
    this.setMesh()
  }


  setGeometry() {
    const defaultTransform = new Matrix4()
      .makeRotationX(Math.PI * .5)
    this.geometry = this.mountainObj.geometry.clone()
    this.geometry.applyMatrix4(defaultTransform)
  }


  setMaterial() {
    this.material = this.mountainObj.material as MeshStandardMaterial
    this.material = this.material.clone()
    this.material.color.set(this.config.world.mountainColor)
    if (this.stateStatus === 'explored') {
      this.material.emissive.set(this.config.world.exploredLandEmissive)
      this.material.emissiveIntensity = this.config.world.exploredLandEmissiveIntensity
    }


  }


  setTextures() {
    // this.textures = {}
  }


  setMesh() {
    let peak = this.peaks.meshes[this.peaks.meshes.length - 1]
    let _count = randInt(4, 10)
    let sampler = new MeshSurfaceSampler(peak).build()
    let sampleMesh = new InstancedMesh(this.geometry, this.material, _count)
    sampleMesh.castShadow = true
    sampleMesh.receiveShadow = true
    // sampleMesh.material.color.set('#00ff00')
    let _position = new Vector3()
    let _dummy = new Object3D()
    let _normal = new Vector3()
    for (let i = 0; i < _count; i++) {
      sampler.sample(_position, _normal)
      _normal.add(_position)
      let scale = randFloat(0.7, 1.5)
      _dummy.scale.set(scale, scale, scale)
      _dummy.position.copy(_position)
      _dummy.lookAt(_normal)
      _dummy.updateMatrix()
      sampleMesh.setMatrixAt(i, _dummy.matrix)
    }
    this.mesh = sampleMesh
    peak.add(sampleMesh)
  }
}