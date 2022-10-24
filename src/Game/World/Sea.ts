import {
  Color,
  MeshStandardMaterial,
  Mesh,
  PlaneBufferGeometry,
} from "three"
import {GUI} from "dat.gui"

import Main from "../Main"


export default class Sea {
  main: Main
  scene: Main['scene']
  resources: Main['resources']
  map: Main['map']
  debug: Main['debug']
  debugFolder?: GUI
  geometry!: PlaneBufferGeometry
  textures!: Record<string, any>
  material!: MeshStandardMaterial
  mesh!: Mesh


  constructor() {
    this.main = new Main()
    this.scene = this.main.scene
    this.resources = this.main.resources
    this.debug = this.main.debug
    this.map = this.main.map

    this.setGeometry()
    this.setTextures()
    this.setMaterial()
    this.setMesh()
    if (this.debug.active) {this.setDebug()}
  }


  setGeometry() {
    this.geometry = new PlaneBufferGeometry(
      this.map.sea.size.width,
      this.map.sea.size.height,
      this.map.sea.segmentsQty.width,
      this.map.sea.segmentsQty.height,
    )
  }


  setTextures() {
    this.textures = {}
    // this.textures.test = this.resources.items.testTexture
    this.textures.map = this.resources.items.woodBaseColorTexture
    this.textures.normalMap = this.resources.items.woodNormalTexture
    this.textures.roughnessMap = this.resources.items.woodRougMapTexture
    this.textures.displacementMap = this.resources.items.woodHightMapTexture
  }


  setMaterial() {
    this.material = new MeshStandardMaterial()
    this.material.map = this.textures.map
    this.material.normalMap = this.textures.normalMap
    this.material.roughnessMap = this.textures.roughnessMap
    this.material.displacementMap = this.textures.displacementMap
    this.material.displacementScale = this.map.sea.material.displacementScale
    this.material.roughness = this.map.sea.material.roughness
    this.material.color = new Color(this.map.sea.color).convertSRGBToLinear().multiplyScalar(3)
  }


  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material)
    this.mesh.rotation.x = -Math.PI * .5
    this.mesh.receiveShadow = true
    this.mesh.position.x = this.map.sea.position.x
    this.mesh.position.y = this.map.sea.position.y
    this.mesh.position.z = this.map.sea.position.z
    this.scene.add(this.mesh)
  }


  setDebug() {
    this.debugFolder = this.debug.ui!.addFolder('Sea')

    let params = {
      color: this.map.sea.color
    }

    this.debugFolder!
      .addColor(params, 'color')
      .name('Material Color')
      .onChange(() => {
        this.material.color = new Color(params.color).convertSRGBToLinear().multiplyScalar(3)
      })

    this.debugFolder!
      .add(this.material, 'displacementScale')
      .name('Material Displacement Scale')
      .min(-2)
      .max(2)
      .step(.001)

    this.debugFolder!
      .add(this.material, 'roughness')
      .name('Material Roughness')
      .min(0)
      .max(1)
      .step(.001)

    this.debugFolder!
      .add(this.material, 'wireframe')

    this.debugFolder!
      .add(this.mesh.position, 'x')
      .name('Sea X')
      .min(-200)
      .max(200)
      .step(1)

    this.debugFolder!
      .add(this.mesh.position, 'y')
      .name('Sea Y')
      .min(-200)
      .max(200)
      .step(1)

    this.debugFolder!
      .add(this.mesh.position, 'z')
      .name('Sea Z')
      .min(-200)
      .max(200)
      .step(1)
  }
}