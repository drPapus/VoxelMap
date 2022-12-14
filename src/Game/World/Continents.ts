import {
  Mesh,
  MeshStandardMaterial,
} from 'three';
import {GUI} from 'dat.gui';

import Main from '../Main';
import Tiles from './Continent/Tiles';
import {
  Peaks,
  peaksSetCondition
} from './Continent/Peaks';
import {
  voxelLandSetCondition,
  VoxelLandscape,
} from './Continent/VoxelLandscape';
import {ContinentConditionType, ContinentInterface} from '../@types/Continent';
import {Trees, treesSetCondition} from './Continent/Trees';
// import Villages from './Continent/Villages';
// import Goddess from './Continent/Goddess';
import {Mountains, mountainsSetCondition} from './Continent/Mountains';


export default class Continents {
  #main: Main;
  #map: Main['map'];
  #debug: Main['debug'];
  #debugFolder?: GUI;
  #config: Main['config'];
  continents: Record<ContinentInterface['id'], ContinentInterface> = {};
  continentByMeshId: Record<Mesh['id'], ContinentInterface> = {};


  constructor() {
    this.#main = new Main();
    this.#map = this.#main.map;
    this.#debug = this.#main.debug;
    this.#config = this.#main.config;

    this.setContinents();

    if (this.#debug.active) {this.setDebug();}
  }


  setContinents() {
    for (const continent of this.#map.continents) {
      const voxelLandscape = new VoxelLandscape(continent);
      const peaks = new Peaks(continent, voxelLandscape.mesh);
      let tiles;
      let trees;
      let mountains;

      if (continent.status !== 'disabled') {
        tiles = new Tiles(continent, voxelLandscape.mesh);
        trees = new Trees(peaks, continent.status, voxelLandscape.mesh);
        mountains = new Mountains(peaks, continent.status, voxelLandscape.mesh);
        // villages = continent.village ? new Villages(continent, Object.values(cells.cells)) : villages
        // goddesses = continent.goddess ? new Goddess(continent, Object.values(cells.cells)) : goddesses
      }

      this.continents[continent.id] = continent;
      this.continents[continent.id].landscape.mesh = voxelLandscape.mesh;
      this.continents[continent.id].landscape.peakMeshes = peaks.meshes;
      this.continents[continent.id].tiles = tiles?.tiles;
      this.continents[continent.id].trees = trees;
      this.continents[continent.id].mountains = mountains;
      this.continentByMeshId[voxelLandscape.mesh.id] = this.continents[continent.id];
    }
  }


  setCondition(continentId: Mesh['id'], condition: ContinentConditionType) {
    const continent = this.continentByMeshId[continentId];

    voxelLandSetCondition(continent.landscape.mesh as Mesh, continent.status, condition);
    peaksSetCondition(continent.landscape.peakMeshes as Mesh[], continent.status, condition);
    treesSetCondition((continent.trees as Trees).mesh, continent.status, condition);
    mountainsSetCondition((continent.mountains as Mountains).mesh, continent.status, condition);
  }


  setDebug() { // TODO fix debug
    this.#debugFolder = (this.#debug.ui as GUI).addFolder('continents');
    const colors = {
      peaks: this.#config.world.peakLevelColors,
      trees: this.#config.world.trees.color,
      mountains: this.#config.world.mountains.color
    };
    const emissive = {
      color: this.#config.world.exploredLandEmissive,
      intensity: this.#config.world.exploredLandEmissiveIntensity,
      hover: this.#config.world.hoverEmisseve,
      hoverIntensity: this.#config.world.hoverEmisseveIntensity
    };

    // Hovered
    // const hovered = this.#debugFolder.addFolder('Hovered');
    // hovered.addColor(emissive, 'hover')
    //   .name('Color')
    //   .onChange(() => {
    //     this.hoveredEmissive = emissive.hover;
    //   });
    // hovered.add(emissive, 'hoverIntensity')
    //   .name('Intensity')
    //   .min(0)
    //   .max(1)
    //   .step(.01)
    //   .onChange(() => {
    //     this.hoveredEmissiveIntensity = emissive.hoverIntensity;
    //   });

    // Explored Land
    const explored = this.#debugFolder.addFolder('Explored Land');
    // explored.addColor(emissive, 'color')
    //   .name('Emissive color')
    //   .onChange(() => {
    //     for (const continent of Object.values(this.continents)) {
    //       if (continent.status !== 'explored') {continue;}
    //       // tslint:disable-next-line:no-non-null-assertion
    //       const _mat = continent.landscape.mesh!.material as MeshStandardMaterial;
    //       _mat.emissive?.set(emissive.color);
    //       // tslint:disable-next-line:no-non-null-assertion
    //       for (const obj of continent.landscape.peakMeshes!) {
    //         const _obj = obj as Mesh;
    //         const _childs = _obj.children;
    //         const _mat = _obj.material as MeshStandardMaterial;
    //         _mat.emissive?.set(emissive.color);
    //         for (const child of _childs) {
    //           const _child = child as Mesh;
    //           const _mat = _child.material as MeshStandardMaterial;
    //           _mat.emissive.set(emissive.color);
    //         }
    //       }
    //     }
    //   });
    explored.add(emissive, 'intensity')
      .name('Emissive intensity')
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        for (const continent of Object.values(this.continents)) {
          if (continent.status !== 'explored') {continue;}
          // tslint:disable-next-line:no-non-null-assertion
          const _mat = continent.landscape.mesh!.material as MeshStandardMaterial;
          _mat.emissiveIntensity = emissive.intensity;
          // tslint:disable-next-line:no-non-null-assertion
          for (const obj of continent.landscape.mesh!.children) {
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
    // const peaks = this.#debugFolder.addFolder('Peaks');
    // for (let i = 0; i < colors.peaks.length; i++) {
    //   peaks.addColor(colors.peaks, i.toString())
    //     .name(`Color LVL ${i + 1}`)
    //     .onChange(() => {
    //       for (const continent of Object.values(this.continents)) {
    //         // tslint:disable-next-line:no-non-null-assertion
    //         if (['explored', 'disabled'].includes(continent.status) || !continent.landscape.peakMeshes || !continent.landscape.peakMeshes![i]) {continue;}
    //         const _mat = continent.landscape.peakMeshes[i].material as MeshStandardMaterial;
    //         _mat.color.set(colors.peaks[i]);
    //       }
    //     });
    // }

    // Trees
    // const trees = this.#debugFolder.addFolder('Trees');
    // trees.addColor(colors, 'trees')
    //   .name('Color')
    //   .onChange(() => {
    //     for (const continent of Object.values(this.continents)) {
    //       if (['explored', 'disabled'].includes(continent.status) || !continent.trees) {continue;}
    //       const _mat = continent.trees.material as MeshStandardMaterial;
    //       _mat.color.set(colors.trees);
    //     }
    //   });

    // Mountains
    // const mountains = this.#debugFolder.addFolder('Mountains');
    // mountains.addColor(colors, 'mountains')
    //   .name('Color')
    //   .onChange(() => {
    //     for (const continent of Object.values(this.continents)) {
    //       if (['explored', 'disabled'].includes(continent.status) || !continent.mountains) {continue;}
    //       const _mat = continent.mountains.material as MeshStandardMaterial;
    //       _mat.color.set(colors.mountains);
    //     }
    //   });
  }
}
