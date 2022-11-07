import {
  PointLight,
  Color,
  PMREMGenerator,
  Texture,
  Mesh,
  MeshStandardMaterial
} from 'three'
import {GUI} from "dat.gui"

import Main from '../Main'

import {ConfigInterface} from "../@types/ConfigInterface"


export default class Environment {
  main: Main
  scene: Main['scene']
  resources: Main['resources']
  renderer: Main['renderer']
  config: ConfigInterface['environment']
  debug: Main['debug']
  debugFolder?: GUI
  light!: PointLight
  PMREMGenerator: PMREMGenerator
  envMap!: {
    intensity?: number,
    texture?: Texture,
    updateMaterials?: () => void
  }


  constructor() {
    this.main = new Main()
    this.scene = this.main.scene
    this.renderer = this.main.renderer
    this.resources = this.main.resources
    this.debug = this.main.debug
    this.config = this.main.config.environment
    this.PMREMGenerator = new PMREMGenerator(this.renderer.instance)

    this.setLight()
    this.setEnvironmentMap()
    if (this.debug.active) {this.setDebug()}
  }


  setLight() {
    this.light = new PointLight(
      new Color(this.config.light.color).convertSRGBToLinear(),
      this.config.light.intensity,
      this.config.light.distance,
    )
    this.light.position.set(
      this.config.light.position.x,
      this.config.light.position.y,
      this.config.light.position.z,
    )
    this.light.castShadow = true
    this.light.shadow.mapSize.set(...this.config.light.shadowMapSize)
    this.light.shadow.camera.near = this.config.light.shadowCameraNear
    this.light.shadow.camera.far = this.config.light.shadowCameraFar
    this.scene.add(this.light)
  }


  setEnvironmentMap() {
    let pmrem = new PMREMGenerator(this.renderer.instance)
    this.envMap = {}
    this.envMap.intensity = 0.4
    this.envMap.texture = pmrem.fromEquirectangular(this.resources.items.environmentMapTexture as Texture).texture

    this.scene.environment = this.envMap.texture

    this.envMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
          child.material.envMap = this.envMap.texture!
          child.material.envMapIntensity = this.envMap.intensity!
          child.material.needsUpdate = true
        }
      })
    }
    this.envMap.updateMaterials()
  }


  setDebug() {
    this.debugFolder = this.debug.ui!.addFolder('Environment')
    this.debugFolder!
      .add(this.envMap, 'intensity')
      .name('Env Map Intensity')
      .min(0)
      .max(4)
      .step(0.001)
      .onChange(this.envMap.updateMaterials!)

    this.debugFolder!
      .add(this.light, 'intensity')
      .name('Light Intensity')
      .min(0)
      .max(100)
      .step(0.5)

    this.debugFolder!
      .add(this.light.position, 'x')
      .name('Light X')
      .min(0)
      .max(100)
      .step(0.05)

    this.debugFolder!
      .add(this.light.position, 'y')
      .name('Light Y')
      .min(0)
      .max(100)
      .step(0.05)

    this.debugFolder!
      .add(this.light.position, 'z')
      .name('sunLightZ')
      .min(0)
      .max(5)
      .step(0.001)
  }
}
