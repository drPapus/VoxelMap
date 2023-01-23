// @ts-nocheck
import {
  Mesh,
  Raycaster as ThreeRaycaster,
  Vector2,
} from 'three';

import Main from '../Main';

import {tilesMeshName} from '../World/Continent/Tiles';
import {voxelLandscapeMeshName} from '../World/Continent/VoxelLandscape';
import SelectionVoxel from '../Controls/SelectionVoxel';
import Continents from '../World/Continents';
import {getCoordinates} from '../World/Continent/MapHelpers';

const intrsct = document.createElement('span');
intrsct.innerText = 'INTERSECTED';
intrsct.style.cssText = `
  position: absolute;
  display: block;
  padding: .5rem 1rem;
  z-index: 99;
  top: 30%;
  left: 10%;
  background: #fff;
  font-weight: bold;
  box-shadow: 0 0 30px #000;
`;
document.body.appendChild(intrsct);


export default class Raycaster {
  instance: ThreeRaycaster;
  #main: Main;
  #camera: Main['camera'];
  #sizes: Main['sizes'];
  #continents: Continents;
  #controls: Main['controls'];
  #selectionVoxel: SelectionVoxel;
  #pointer: Vector2;
  #intersectObjects: Mesh[] = [];
  #intersectedLand?: Mesh['id'];
  #intersectedTile?: number;
  #selectedTile?: number;

  constructor() {
    this.#main = new Main();
    this.#camera = this.#main.camera;
    this.#sizes = this.#main.sizes;
    this.#controls = this.#main.controls;
    // tslint:disable-next-line:no-non-null-assertion
    this.#selectionVoxel = this.#controls!.selectionVoxel;
    this.instance = new ThreeRaycaster();
    this.#pointer = new Vector2();
    this.#intersectedLand = undefined;
    this.#intersectedTile = undefined;
    // tslint:disable-next-line:no-non-null-assertion
    this.#continents = this.#main.world!.continents;

    this.instance.layers.set(1);
    // this.setIntersectObjects();

    window.addEventListener('pointermove', (e) => {
      this.onPointerMove(e);
    });

    window.addEventListener('dblclick', () => {
      this.onDblclick();
    });
  }


  setIntersectObjects(obj: Mesh) {
    // for (const continent of Object.values(this.#continents.continents)) {
    //   if (continent.status === 'disabled') {continue;}
    //   this.#intersectObjects.push(continent.landscape.mesh as Mesh);
    // }

      this.#intersectObjects.push(obj);
  }


  update() {
    if (!this.#intersectObjects.length) {return;}

    this.instance.setFromCamera(this.#pointer, this.#camera.instance);
    const intersects = this.instance.intersectObjects(this.#intersectObjects);

    if (!intersects.length) {
      intrsct.style.background = '#fff';
      this.clear();
      return;
    }

    console.log('intersect name', intersects[0].object.name);
    if (intersects[0].object.name === 'movement') {
      intrsct.style.background = 'red';
    } else {
      intrsct.style.background = '#fff';
    }
    return;

    const intersectLand =
      intersects[0].object.name === voxelLandscapeMeshName
        ? intersects[0].object.id
        : (intersects[0].object.parent as Mesh).id;

    const intersectTile =
      intersects[0].object.name === tilesMeshName
        ? intersects[0].instanceId
        : undefined;

    if (this.#intersectedLand !== intersectLand) {
      if (this.#intersectedLand) {
        this.#continents.setCondition(this.#intersectedLand, 'default');
      }
      this.#intersectedLand = intersectLand;
      this.#continents.setCondition(this.#intersectedLand, 'intersected');
    }

    if (intersectTile !== undefined && intersectTile !== this.#intersectedTile) {
      this.#intersectedTile = intersectTile;

      if (!this.#selectionVoxel.selected) {
        this.setSelectionVoxelPosition();
        this.#selectionVoxel.setVisible();
      }
    } else if (intersectTile === undefined && this.#intersectedTile !== undefined) {
      this.#intersectedTile = undefined;

      if (!this.#selectionVoxel.selected) {
        this.#selectionVoxel.setHidden();
      }
    }
  }


  clear() {
    if (this.#intersectedLand) {
      this.#continents.setCondition(this.#intersectedLand, 'default');
      this.#intersectedLand = undefined;
    }

    if (this.#intersectedTile !== undefined) {
      this.#intersectedTile = undefined;

      if (!this.#selectionVoxel.selected) {
        this.#selectionVoxel.setHidden();
      }
    }
  }


  onPointerMove(e: PointerEvent) {
    this.#pointer.x = (e.clientX / this.#sizes.width) * 2 - 1;
    this.#pointer.y = -(e.clientY / this.#sizes.height) * 2 + 1;
  }


  onDblclick() {
    if (this.#intersectedTile) {
      if (this.#selectedTile !== this.#intersectedTile) {
        this.#selectedTile = this.#intersectedTile;
        this.setSelectionVoxelPosition();
        this.#selectionVoxel.selected = true;

        // TODO DELETE ===============================
        // Для наглядности
        console.log('selected', {
          position:
            // tslint:disable-next-line:no-non-null-assertion
            this.#continents.continentByMeshId[this.#intersectedLand!].tiles![this.#intersectedTile!].position
          ,
          coordinates: getCoordinates(
            // tslint:disable-next-line:no-non-null-assertion
            this.#continents.continentByMeshId[this.#intersectedLand!].tiles![this.#intersectedTile!].position
          ),
          // tslint:disable-next-line:no-non-null-assertion
          continentId: this.#intersectedLand!
        });
        // TODO END DELETE ==============================
      }
    } else {
        if (this.#selectedTile) {
          this.#selectedTile = undefined;
          this.#selectionVoxel.selected = false;
          this.#selectionVoxel.setHidden();
        }
    }
  }


  setSelectionVoxelPosition() {
    // tslint:disable:no-non-null-assertion
    const position =
      this.#continents
        .continentByMeshId[this.#intersectedLand!]
        .tiles![this.#intersectedTile!]
        .center;

    // TODO DELETE ===============================
    // Для наглядности
    console.log('hover', {
      position:
        this.#continents.continentByMeshId[this.#intersectedLand!].tiles![this.#intersectedTile!].position
      ,
      coordinates: getCoordinates(
        this.#continents.continentByMeshId[this.#intersectedLand!].tiles![this.#intersectedTile!].position
      ),
      continentId: this.#intersectedLand!
    });
    // TODO END DELETE ==============================

    this.#selectionVoxel.setPosition(...position);
  }
}
