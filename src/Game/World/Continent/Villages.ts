// @ts-nocheck
import Main from '../../Main';
import {Tile} from '../../@types/Tile';
import {GUI} from 'dat.gui';
import {ContinentInterface} from '../../@types/Continent';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {Box3, BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3} from 'three';


export default class Villages {
  main: Main;
  map: Main['map'];
  resources: Main['resources'];
  scene: Main['scene'];
  config: Main['config'];
  debug: Main['debug'];
  voxel: {
    size: number,
    width: number,
    height: number,
  };
  debugFolder?: GUI;
  continent: ContinentInterface;
  cells: Tile[];


  constructor(continent: ContinentInterface, cells: Tile[]) {
    this.main = new Main();
    this.map = this.main.map;
    this.scene = this.main.scene;
    this.config = this.main.config;
    this.debug = this.main.debug;
    this.resources = this.main.resources;
    this.voxel = {
      size: this.config.world.voxel.size,
      width: this.config.world.voxel.size * Math.sqrt(3),
      height: this.config.world.voxel.size * 2,
    };
    this.continent = continent;
    this.cells = cells;

    this.setModels();

    if (this.debug.active) {
      this.setDebug();
    }
  }


  setModels() {
    const voxelSize = this.config.world.voxel.size;
    // let scale = voxelSize * 1.6
    // tslint:disable-next-line:no-non-null-assertion
    for(const village of this.continent.village!) {
      const cell = this.cells.find((landCell) => {
        return landCell.index.cell === village.position.x
          && landCell.index.row === village.position.y;
      });
      if (!cell) {throw new Error('Village: No cell!');}
      //
      // let model = this.resources.items[village.model] as GLTF
      // let modelObj = model.scene.children[0] as Mesh
      // modelObj.position.set(cell.position.x, cell.position.y, cell.position.z)
      // modelObj.scale.set(scale, scale, scale)
      // for (const child of modelObj.children) {
      //   child.castShadow = true
      //   child.receiveShadow = true
      // }
      // this.fixModelPosition(modelObj)

      // this.scene.add(modelObj)
      const mesh = new Mesh(new BoxGeometry(2, 2, 2), new MeshStandardMaterial({
        color: 'red'
      }));
      mesh.position.set(cell.position.x, cell.position.y, cell.position.z);
      this.scene.add(mesh);
    }
  }


  fixModelPosition(obj: Object3D) {
    obj.rotation.y = -Math.PI;
    const box = new Box3();
    box.setFromObject(obj);
    const size = box.getSize(new Vector3());
    obj.translateX(size.x * -.5 - this.voxel.width * .45);
    obj.translateZ(size.z * -.5 + this.voxel.size * .38);
  }


  setDebug() {

  }
}
