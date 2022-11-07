import {
  Scene,
  Color
} from "three"

import Debug from './Utils/Debug'
import Sizes from './Utils/Sizes'
import Time from './Utils/Time'
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World/World'
import Resources from './Utils/Resources'
import Raycaster from "./Utils/Raycaster"
import Controls from "./Controls"
import DefaultConfig from "./Configs/DefaultConfig"
import FirstMapSources from './Maps/FirstMap/Sources'
import FirstMap from "./Maps/FirstMap/FirstMap"
import {getGeography} from "../mocks/geography"

import {SourceInterface} from "./@types/SourceInterface"
import {ConfigInterface} from "./@types/ConfigInterface"
import {MapInterface} from "./@types/MapInterface"


let Config: ConfigInterface = DefaultConfig
let Map: MapInterface = FirstMap
let Sources: SourceInterface[] = FirstMapSources
let GameInstance: Main | null = null


export default class Main {
  canvas!: Element
  debug!: Debug
  sizes!: Sizes
  time!: Time
  scene!: Scene
  resources!: Resources
  camera!: Camera
  renderer!: Renderer
  world?: World
  config!: ConfigInterface
  map!: MapInterface
  raycaster?: Raycaster
  controls?: Controls


  constructor(_canvas?: Element) {
    if (GameInstance) return GameInstance

    console.log(this)

    GameInstance = this
    this.canvas = _canvas!
    this.config = Config
    this.map = Map

    this.setScene()

    this.debug = new Debug()
    this.sizes = new Sizes()
    this.time = new Time()
    this.resources = new Resources(Sources)
    this.camera = new Camera()
    this.renderer = new Renderer()

    this.setEvents()
  }


  setScene() {
    this.scene = new Scene()
    this.scene.background = new Color('#FFEECC')
  }


  setEvents() {
    this.resources.addEventListener('ready', () => {
      this.onResourcesLoaded()
    })
    this.sizes.addEventListener('resize', () => {
      this.onResize()
    })
    this.time.addEventListener('tick', () => {
      this.onTick()
    })
  }


  onResourcesLoaded() {
    this.world = new World()
    this.controls = new Controls()
    // this.raycaster = new Raycaster()
    if (this.debug.active) {this.debug.run()}
    getGeography()
  }


  onResize() {
    this.camera.resize()
    this.renderer.resize()
  }


  onTick() {
    this.world?.update()
    this.raycaster?.update()
    this.controls?.update()
    this.camera.update()
    this.renderer.update()
  }


  destroy() {
  }
}
