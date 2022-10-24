import {
  Box3,
  BoxGeometry, BoxHelper,
  Mesh, MeshBasicMaterial,
  Object3D,
  Vector3
} from "three"
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader"
import {GUI} from "dat.gui"

import Main from "../../Main"
import {LandCellInterface} from "../../Interfaces/LandCellInterface"
import {StateInterface} from "../../Interfaces/StateInterface"


export default class Goddess {
  main: Main
  map: Main['map']
  resources: Main['resources']
  scene: Main['scene']
  config: Main['config']
  debug: Main['debug']
  voxel: {
    size: number,
    width: number,
    height: number,
  }
  debugFolder?: GUI
  state: StateInterface
  cells: LandCellInterface[]

  constructor(state: StateInterface, cells: LandCellInterface[]) {
    this.main = new Main()
    this.map = this.main.map
    this.scene = this.main.scene
    this.config = this.main.config
    this.debug = this.main.debug
    this.resources = this.main.resources
    this.voxel = {
      size: this.config.world.voxel.size,
      width: this.config.world.voxel.size * Math.sqrt(3),
      height: this.config.world.voxel.size * 2,
    }
    this.state = state
    this.cells = cells

    this.setModels()

    if (this.debug.active) {
      this.setDebug()
    }
  }


  setModels() {
    let voxelSize = this.config.world.voxel.size
    let scale = voxelSize * 1.6
    for(const goddess of this.state.goddess!) {
      let cell = this.cells.find((landCell) => {
        return landCell.index.cell === goddess.position.x
          && landCell.index.row === goddess.position.y
      })
      if (!cell) {throw new Error('Goddess: No cell!')}

      let model = this.resources.items[goddess.model] as GLTF
      let modelObj = model.scene.children[0] as Mesh
      modelObj.position.set(cell.position.x, cell.position.y, cell.position.z)
      modelObj.scale.set(scale, scale, scale)
      for (const child of modelObj.children) {
        child.castShadow = true
        child.receiveShadow = true
      }
      this.fixModelPosition(modelObj)

      this.scene.add(modelObj)
    }
  }


  fixModelPosition(obj: Object3D) {
    obj.rotation.y = -Math.PI
    let box = new Box3()
    box.setFromObject(obj)
    let size = box.getSize(new Vector3())
    obj.translateX(size.x * -.5 - this.voxel.width * .45)
    obj.translateZ(size.z * -.5 + this.voxel.size * .38)
  }


  setDebug() {
    // this.debugFolder = this.debug.ui!.addFolder('SelectionVoxel')
  }
}