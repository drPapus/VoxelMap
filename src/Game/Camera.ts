import {
  PerspectiveCamera,
} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GUI} from "dat.gui"

import Main from './Main'

import {ConfigInterface} from "./Interfaces/ConfigInterface"

export default class Camera {
  main: Main
  sizes: Main['sizes']
  scene: Main['scene']
  canvas: Main['canvas']
  instance!: PerspectiveCamera
  controls!: OrbitControls
  debug: Main['debug']
  config: ConfigInterface['camera']
  debugFolder?: GUI

  constructor() {
    this.main = new Main()
    this.sizes = this.main.sizes
    this.scene = this.main.scene
    this.canvas = this.main.canvas
    this.config = this.main.config.camera
    this.debug = this.main.debug

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui!.addFolder('Camera')
    }

    this.setInstance()
    this.setControls()
  }

  setInstance() {
    this.instance = new PerspectiveCamera(
      65,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    )
    this.instance.position.set(this.config.position.x, this.config.position.y, this.config.position.z)
    this.scene.add(this.instance)

    // Debug
    if (this.debug.active) {
      this.debugFolder!
        .add(this.instance.position, 'x')
        .name('Position X')
        .min(-200)
        .max(200)
        .step(.1)

      this.debugFolder!
        .add(this.instance.position, 'y')
        .name('Position Y')
        .min(-200)
        .max(200)
        .step(.1)

      this.debugFolder!
        .add(this.instance.position, 'z')
        .name('Position Z')
        .min(-200)
        .max(200)
        .step(.1)
    }
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas as HTMLElement)
    this.controls.enableDamping = true
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}