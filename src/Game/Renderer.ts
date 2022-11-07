import {
  Scene,
  WebGLRenderer,
  ACESFilmicToneMapping,
  sRGBEncoding,
  PCFSoftShadowMap,
} from 'three'

import Main from './Main'
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";

export default class Renderer {
  main: Main
  canvas: Main['canvas']
  sizes: Main['sizes']
  scene: Main['scene']
  camera: Main['camera']
  instance!: WebGLRenderer

  constructor() {
    this.main = new Main()
    this.canvas = this.main.canvas
    this.sizes = this.main.sizes
    this.scene = this.main.scene
    this.camera = this.main.camera

    this.setInstance()
  }

  setInstance() {
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      precision: 'lowp',
      powerPreference: 'high-performance',
    })
    this.instance.toneMapping = ACESFilmicToneMapping
    this.instance.outputEncoding = sRGBEncoding
    this.instance.physicallyCorrectLights = true
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = PCFSoftShadowMap
    this.instance.setSize(this.sizes.width, this.sizes.height)

    // this.instance.toneMappingExposure = 1.75
    // this.instance.setClearColor('#211d20')
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
  }
}