import {
  Material,
  Mesh,
  Raycaster as ThreeRaycaster,
  Vector2,
} from 'three'

import Main from "../Main"

import SelectionVoxel from "../Controls/SelectionVoxel"
import States from "../World/States"


export default class Raycaster {
  instance: ThreeRaycaster
  main: Main
  camera: Main['camera']
  sizes: Main['sizes']
  states: States
  controls: Main['controls']
  selectionVoxel: SelectionVoxel
  pointer: Vector2
  intersectObjects!: Mesh[]
  intersectedLand?: Mesh['id']
  intersectedCell?: Mesh['id']
  selectedCell: any

  constructor() {
    this.main = new Main()
    this.camera = this.main.camera
    this.sizes = this.main.sizes
    this.controls = this.main.controls
    this.selectionVoxel = this.controls!.selectionVoxel
    this.instance = new ThreeRaycaster()
    this.pointer = new Vector2()
    this.intersectedLand = undefined
    this.intersectedCell = undefined
    this.states = this.main.world!.states

    this.instance.layers.set(1)
    this.setIntersectObjects()

    window.addEventListener('pointermove', (e) => {
      this.onPointerMove(e)
    })

    window.addEventListener('dblclick', () => {
      this.onDblclick()
    })
  }


  setIntersectObjects() {
    this.intersectObjects = []
    for (const state of Object.values(this.states.states)) {
      if (state.status === 'disabled') {continue}
      this.intersectObjects.push(state.landscape.mesh!)
    }
  }


  update() {
    if (!this.intersectObjects.length) {return}

    this.instance.setFromCamera(this.pointer, this.camera.instance)
    const intersects = this.instance.intersectObjects(this.intersectObjects)

    if (!intersects.length) {
      if (this.intersectedLand) {
        this.states.unsetIntersected(this.intersectedLand)
        this.intersectedLand = undefined
      }
      if (this.intersectedCell) {
        this.intersectedCell = undefined
        if (!this.selectionVoxel.selected) {
          this.selectionVoxel.setHidden()
        }
      }
      return
    }

    let intersectLand =
      intersects[0].object.name === 'land'
        ? intersects[0].object.id
        : intersects[0].object.parent!.id

    let intersectCell =
      intersects[0].object.name === 'landCell'
        ? intersects[0].object.id
        : undefined

    if (this.intersectedLand !== intersectLand) {
      if (this.intersectedLand) {
        this.states.unsetIntersected(this.intersectedLand)
      }
      this.intersectedLand = intersectLand
      this.states.setIntersected(this.intersectedLand)
    }

    if (intersectCell) {
      this.intersectedCell = intersectCell
      if (!this.selectionVoxel.selected) {
        this.setSelectionVoxelPosition()
        this.selectionVoxel.setVisible()
      }
    } else {
      this.intersectedCell = undefined
      if (!this.selectionVoxel.selected) {
        this.selectionVoxel.setHidden()
      }
    }
  }


  onPointerMove(e: PointerEvent) {
    this.pointer.x = (e.clientX / this.sizes.width) * 2 - 1
    this.pointer.y = -(e.clientY / this.sizes.height) * 2 + 1
  }


  onDblclick() {
    if (this.intersectedCell) {
      if (this.selectedCell !== this.intersectedCell) {
        this.selectedCell = this.intersectedCell
        this.setSelectionVoxelPosition()
        this.selectionVoxel.selected = true
      }
    } else {
        if (this.selectedCell) {
          this.selectedCell = undefined
          this.selectionVoxel.selected = false
          this.selectionVoxel.setHidden()
        }
    }
  }


  setSelectionVoxelPosition() {
    let {x, y, z} = this.states.stateByMeshId[this.intersectedLand!].cells![this.intersectedCell!].position
    this.selectionVoxel.setPosition(x, y, z)
  }
}