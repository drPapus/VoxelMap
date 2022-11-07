import {
  ColorRepresentation,
  Mesh,
  MeshStandardMaterial,
} from "three"
import {GUI} from "dat.gui"

import Main from "../Main"
import Peaks from "./State/Peaks"
import Cells from "./State/Cells"
import {VoxelLandscape} from "./State/VoxelLandscape"
import {StateInterface} from "../@types/StateInterface"
import Trees from "./State/Trees"
import Villages from "./State/Villages"
import Goddess from "./State/Goddess"
import Mountains from "./State/Mountains"


export default class States {
  main: Main
  map: Main['map']
  debug: Main['debug']
  debugFolder?: GUI
  config: Main['config']
  states!: Record<StateInterface['id'], StateInterface>
  stateByMeshId!: Record<Mesh['id'], StateInterface>
  defaultEmissive?: ColorRepresentation
  defaultEmissiveIntensity?: number
  hoveredEmissive: ColorRepresentation
  hoveredEmissiveIntensity: number


  constructor() {
    this.main = new Main()
    this.map = this.main.map
    this.debug = this.main.debug
    this.config = this.main.config
    this.defaultEmissive = undefined
    this.defaultEmissiveIntensity = undefined
    this.hoveredEmissive = this.config.world.hoverEmisseve
    this.hoveredEmissiveIntensity = this.config.world.hoverEmisseveIntensity

    this.setStates()

    if (this.debug.active) {
      this.setDebug()
    }
  }


  setStates() {
    this.states = {}
    this.stateByMeshId = {}
    for (const state of this.map.states) {
      let voxelLandscape = new VoxelLandscape(state)
      // let peaks = new Peaks(state)
      let cells, trees, villages, mountains, goddesses = undefined

      if (state.status !== 'disabled') {
        // cells = new Cells(state)
        // trees = new Trees(peaks, state.status)
        // mountains = new Mountains(peaks, state.status)
        // villages = state.village ? new Villages(state, Object.values(cells.cells)) : villages
        // goddesses = state.goddess ? new Goddess(state, Object.values(cells.cells)) : goddesses
        // voxelLandscape.mesh!.add(...cells.meshes)
      }

      // voxelLandscape.mesh!.add(
      //   ...Object.values(peaks.meshes),
      // )

      this.states[state.id] = state
      this.states[state.id].landscape.mesh = voxelLandscape.mesh
      // this.states[state.id].landscape.peakMeshes = peaks.meshes
      // this.states[state.id].cells = cells?.cells
      // this.states[state.id].trees = trees?.mesh
      // this.states[state.id].mountains = mountains?.mesh
      this.stateByMeshId[voxelLandscape.mesh!.id] = this.states[state.id]
    }
  }


  setIntersected(stateId: Mesh['id']) {
    let state = this.stateByMeshId[stateId]
    let material = state.landscape.mesh!.material as MeshStandardMaterial
    this.defaultEmissive = material.emissive.getHex()
    this.defaultEmissiveIntensity = material.emissiveIntensity
    material.emissive.set(this.hoveredEmissive)
    for (const peak of state.landscape.peakMeshes!) {
      let material = peak.material as MeshStandardMaterial
      for (const child of peak.children) {
        let _child = child as Mesh
        let _mat = _child.material as MeshStandardMaterial
        _mat.emissive.set(this.hoveredEmissive)
        _mat.emissiveIntensity = this.hoveredEmissiveIntensity
      }
      material.emissive.set(this.hoveredEmissive)
      material.emissiveIntensity = this.hoveredEmissiveIntensity
    }
  }


  unsetIntersected(stateId: Mesh['id']) {
    let state = this.stateByMeshId[stateId]
    let material = state.landscape.mesh!.material as MeshStandardMaterial
    material.emissive.set(this.defaultEmissive!)
    for (const peak of state.landscape.peakMeshes!) {
      let material = peak.material as MeshStandardMaterial
      for (const child of peak.children) {
        let _child = child as Mesh
        let _mat = _child.material as MeshStandardMaterial
        _mat.emissive.set(this.defaultEmissive!)
        _mat.emissiveIntensity = this.defaultEmissiveIntensity!
      }
      material.emissive.set(this.defaultEmissive!)
      material.emissiveIntensity = this.defaultEmissiveIntensity!
    }
  }


  setDebug() {
    this.debugFolder = this.debug.ui!.addFolder('States')
    let colors = {
      peaks: this.config.world.voxel.peakLevelColors,
      trees: this.config.world.treesColor,
      mountains: this.config.world.mountainColor
    }
    let emissive = {
      color: this.config.world.exploredLandEmissive,
      intensity: this.config.world.exploredLandEmissiveIntensity,
      hover: this.config.world.hoverEmisseve,
      hoverIntensity: this.config.world.hoverEmisseveIntensity
    }

    // Hovered
    let hovered = this.debugFolder.addFolder('Hovered')
    hovered.addColor(emissive, 'hover')
      .name('Color')
      .onChange(() => {
        this.hoveredEmissive = emissive.hover
      })
    hovered.add(emissive, 'hoverIntensity')
      .name('Intensity')
      .min(0)
      .max(1)
      .step(.01)
      .onChange(() => {
        this.hoveredEmissiveIntensity = emissive.hoverIntensity
      })

    // Explored Land
    let explored = this.debugFolder.addFolder('Explored Land')
    explored.addColor(emissive, 'color')
      .name('Emissive color')
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (state.status !== 'explored') {continue}
          let _mat = state.landscape.mesh!.material as MeshStandardMaterial
          _mat.emissive?.set(emissive.color)
          for (const obj of state.landscape.peakMeshes!) {
            let _obj = obj as Mesh
            let _childs = _obj.children
            let _mat = _obj.material as MeshStandardMaterial
            _mat.emissive?.set(emissive.color)
            for (const child of _childs) {
              let _child = child as Mesh
              let _mat = _child.material as MeshStandardMaterial
              _mat.emissive.set(emissive.color)
            }
          }
        }
      })
    explored.add(emissive, 'intensity')
      .name('Emissive intensity')
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (state.status !== 'explored') {continue}
          let _mat = state.landscape.mesh!.material as MeshStandardMaterial
          _mat.emissiveIntensity = emissive.intensity
          for (const obj of state.landscape.mesh!.children) {
            let _obj = obj as Mesh
            let _childs = _obj.children
            let _mat = _obj.material as MeshStandardMaterial
            _mat.emissiveIntensity = emissive.intensity
            for (const child of _childs) {
              let _child = child as Mesh
              let _mat = _child.material as MeshStandardMaterial
              _mat.emissiveIntensity = emissive.intensity
            }
          }
        }
      })

    // Peaks
    let peaks = this.debugFolder.addFolder('Peaks')
    for (let i = 0; i < colors.peaks.length; i++) {
      peaks.addColor(colors.peaks, i.toString())
        .name(`Color LVL ${i + 1}`)
        .onChange(() => {
          for (const state of Object.values(this.states)) {
            if (['explored', 'disabled'].includes(state.status) || !state.landscape.peakMeshes || !state.landscape.peakMeshes![i]) {continue}
            let _mat = state.landscape.peakMeshes[i].material as MeshStandardMaterial
            _mat.color.set(colors.peaks[i])
          }
        })
    }

    // Trees
    let trees = this.debugFolder.addFolder('Trees')
    trees.addColor(colors, 'trees')
      .name('Color')
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (['explored', 'disabled'].includes(state.status) || !state.trees) {continue}
          let _mat = state.trees.material as MeshStandardMaterial
          _mat.color.set(colors.trees)
        }
      })

    // Mountains
    let mountains = this.debugFolder.addFolder('Mountains')
    mountains.addColor(colors, 'mountains')
      .name('Color')
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (['explored', 'disabled'].includes(state.status) || !state.mountains) {continue}
          let _mat = state.mountains.material as MeshStandardMaterial
          _mat.color.set(colors.mountains)
        }
      })
  }
}
