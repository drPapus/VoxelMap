import {
  ColorRepresentation,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import {GUI} from 'dat.gui';

import Main from '../Main';
import Peaks from './State/Peaks';
import Cells from './State/Cells';
import {VoxelLandscape} from './State/VoxelLandscape';
import {StateInterface} from '../@types/State';
import Trees from './State/Trees';
import Villages from './State/Villages';
import Goddess from './State/Goddess';
import Mountains from './State/Mountains';


export default class States {
  main: Main;
  map: Main['map'];
  debug: Main['debug'];
  debugFolder?: GUI;
  config: Main['config'];
  states!: Record<StateInterface['id'], StateInterface>;
  stateByMeshId!: Record<Mesh['id'], StateInterface>;
  defaultEmissive?: ColorRepresentation;
  defaultEmissiveIntensity?: number;
  hoveredEmissive: ColorRepresentation;
  hoveredEmissiveIntensity: number;


  constructor() {
    this.main = new Main();
    this.map = this.main.map;
    this.debug = this.main.debug;
    this.config = this.main.config;
    this.defaultEmissive = undefined;
    this.defaultEmissiveIntensity = undefined;
    this.hoveredEmissive = this.config.world.hoverEmisseve;
    this.hoveredEmissiveIntensity = this.config.world.hoverEmisseveIntensity;

    this.setStates();

    if (this.debug.active) {
      this.setDebug();
    }
  }


  setStates() {
    this.states = {};
    this.stateByMeshId = {};
    for (const state of this.map.states) {
      const voxelLandscape = new VoxelLandscape(state);
      const peaks = new Peaks(state);
      let cells, trees, villages, mountains, goddesses;

      if (state.status !== 'disabled') {
        cells = new Cells(state);
        trees = new Trees(peaks, state.status);
        mountains = new Mountains(peaks, state.status);
        // villages = state.village ? new Villages(state, Object.values(cells.cells)) : villages
        // goddesses = state.goddess ? new Goddess(state, Object.values(cells.cells)) : goddesses
        // tslint:disable-next-line:no-non-null-assertion
        voxelLandscape.mesh!.add(...cells.meshes);
      }

      // tslint:disable-next-line:no-non-null-assertion
      voxelLandscape.mesh!.add(
        ...Object.values(peaks.meshes),
      );

      this.states[state.id] = state;
      this.states[state.id].landscape.mesh = voxelLandscape.mesh;
      this.states[state.id].landscape.peakMeshes = peaks.meshes;
      this.states[state.id].cells = cells?.cells;
      this.states[state.id].trees = trees?.mesh;
      this.states[state.id].mountains = mountains?.mesh;
      // tslint:disable-next-line:no-non-null-assertion
      this.stateByMeshId[voxelLandscape.mesh!.id] = this.states[state.id];
    }
  }


  setIntersected(stateId: Mesh['id']) {
    const state = this.stateByMeshId[stateId];
    // tslint:disable-next-line:no-non-null-assertion
    const material = state.landscape.mesh!.material as MeshStandardMaterial;
    this.defaultEmissive = material.emissive.getHex();
    this.defaultEmissiveIntensity = material.emissiveIntensity;
    material.emissive.set(this.hoveredEmissive);
    // tslint:disable-next-line:no-non-null-assertion
    for (const peak of state.landscape.peakMeshes!) {
      const material = peak.material as MeshStandardMaterial;
      for (const child of peak.children) {
        const _child = child as Mesh;
        const _mat = _child.material as MeshStandardMaterial;
        _mat.emissive.set(this.hoveredEmissive);
        _mat.emissiveIntensity = this.hoveredEmissiveIntensity;
      }
      material.emissive.set(this.hoveredEmissive);
      material.emissiveIntensity = this.hoveredEmissiveIntensity;
    }
  }


  unsetIntersected(stateId: Mesh['id']) {
    const state = this.stateByMeshId[stateId];
    // tslint:disable-next-line:no-non-null-assertion
    const material = state.landscape.mesh!.material as MeshStandardMaterial;
    // tslint:disable-next-line:no-non-null-assertion
    material.emissive.set(this.defaultEmissive!);
    // tslint:disable-next-line:no-non-null-assertion
    for (const peak of state.landscape.peakMeshes!) {
      const material = peak.material as MeshStandardMaterial;
      for (const child of peak.children) {
        const _child = child as Mesh;
        const _mat = _child.material as MeshStandardMaterial;
        // tslint:disable-next-line:no-non-null-assertion
        _mat.emissive.set(this.defaultEmissive!);
        // tslint:disable-next-line:no-non-null-assertion
        _mat.emissiveIntensity = this.defaultEmissiveIntensity!;
      }
      // tslint:disable-next-line:no-non-null-assertion
      material.emissive.set(this.defaultEmissive!);
      // tslint:disable-next-line:no-non-null-assertion
      material.emissiveIntensity = this.defaultEmissiveIntensity!;
    }
  }


  setDebug() {
    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder = this.debug.ui!.addFolder('States');
    const colors = {
      peaks: this.config.world.voxel.peakLevelColors,
      trees: this.config.world.treesColor,
      mountains: this.config.world.mountainColor
    };
    const emissive = {
      color: this.config.world.exploredLandEmissive,
      intensity: this.config.world.exploredLandEmissiveIntensity,
      hover: this.config.world.hoverEmisseve,
      hoverIntensity: this.config.world.hoverEmisseveIntensity
    };

    // Hovered
    const hovered = this.debugFolder.addFolder('Hovered');
    hovered.addColor(emissive, 'hover')
      .name('Color')
      .onChange(() => {
        this.hoveredEmissive = emissive.hover;
      });
    hovered.add(emissive, 'hoverIntensity')
      .name('Intensity')
      .min(0)
      .max(1)
      .step(.01)
      .onChange(() => {
        this.hoveredEmissiveIntensity = emissive.hoverIntensity;
      });

    // Explored Land
    const explored = this.debugFolder.addFolder('Explored Land');
    explored.addColor(emissive, 'color')
      .name('Emissive color')
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (state.status !== 'explored') {continue;}
          // tslint:disable-next-line:no-non-null-assertion
          const _mat = state.landscape.mesh!.material as MeshStandardMaterial;
          _mat.emissive?.set(emissive.color);
          // tslint:disable-next-line:no-non-null-assertion
          for (const obj of state.landscape.peakMeshes!) {
            const _obj = obj as Mesh;
            const _childs = _obj.children;
            const _mat = _obj.material as MeshStandardMaterial;
            _mat.emissive?.set(emissive.color);
            for (const child of _childs) {
              const _child = child as Mesh;
              const _mat = _child.material as MeshStandardMaterial;
              _mat.emissive.set(emissive.color);
            }
          }
        }
      });
    explored.add(emissive, 'intensity')
      .name('Emissive intensity')
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (state.status !== 'explored') {continue;}
          // tslint:disable-next-line:no-non-null-assertion
          const _mat = state.landscape.mesh!.material as MeshStandardMaterial;
          _mat.emissiveIntensity = emissive.intensity;
          // tslint:disable-next-line:no-non-null-assertion
          for (const obj of state.landscape.mesh!.children) {
            const _obj = obj as Mesh;
            const _childs = _obj.children;
            const _mat = _obj.material as MeshStandardMaterial;
            _mat.emissiveIntensity = emissive.intensity;
            for (const child of _childs) {
              const _child = child as Mesh;
              const _mat = _child.material as MeshStandardMaterial;
              _mat.emissiveIntensity = emissive.intensity;
            }
          }
        }
      });

    // Peaks
    const peaks = this.debugFolder.addFolder('Peaks');
    for (let i = 0; i < colors.peaks.length; i++) {
      peaks.addColor(colors.peaks, i.toString())
        .name(`Color LVL ${i + 1}`)
        .onChange(() => {
          for (const state of Object.values(this.states)) {
            // tslint:disable-next-line:no-non-null-assertion
            if (['explored', 'disabled'].includes(state.status) || !state.landscape.peakMeshes || !state.landscape.peakMeshes![i]) {continue;}
            const _mat = state.landscape.peakMeshes[i].material as MeshStandardMaterial;
            _mat.color.set(colors.peaks[i]);
          }
        });
    }

    // Trees
    const trees = this.debugFolder.addFolder('Trees');
    trees.addColor(colors, 'trees')
      .name('Color')
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (['explored', 'disabled'].includes(state.status) || !state.trees) {continue;}
          const _mat = state.trees.material as MeshStandardMaterial;
          _mat.color.set(colors.trees);
        }
      });

    // Mountains
    const mountains = this.debugFolder.addFolder('Mountains');
    mountains.addColor(colors, 'mountains')
      .name('Color')
      .onChange(() => {
        for (const state of Object.values(this.states)) {
          if (['explored', 'disabled'].includes(state.status) || !state.mountains) {continue;}
          const _mat = state.mountains.material as MeshStandardMaterial;
          _mat.color.set(colors.mountains);
        }
      });
  }
}
