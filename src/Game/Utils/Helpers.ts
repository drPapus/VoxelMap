import {
  GridHelper,
  AxesHelper,
} from 'three'
import Main from "../Main"


export default class Helpers {
  main: Main
  debug: Main['debug']
  scene: Main['scene']
  helpers!: {
    gridHelper?: GridHelper
    axesHelper?: AxesHelper
  }

  constructor() {
    this.main = new Main()
    this.debug = this.main.debug
    this.scene = this.main.scene

    if (this.debug.active) {
      this.setHelpers()
    }
  }

  setHelpers() {
    this.helpers = {}
    this.helpers.gridHelper = new GridHelper(400, 40, 0x0000ff, 0x808080)
    this.helpers.gridHelper.position.x = 0
    this.helpers.gridHelper.position.y = 0

    this.helpers.axesHelper = new AxesHelper(35)

    this.scene.add(
      this.helpers.gridHelper,
      this.helpers.axesHelper
    )
  }
}