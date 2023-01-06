import {BoxBufferGeometry, MeshStandardMaterial} from 'three';
import Main from '../../Main';

export class MovementExperiment5 {
  main: Main;
  scene: Main['scene'];
  material!: MeshStandardMaterial;
  geometry!: BoxBufferGeometry;

  constructor() {
    this.main = new Main();
    this.scene = this.main.scene;

    this.setMaterial();
    this.setGeometry();
  }

  setMaterial() {
    this.material = new MeshStandardMaterial({color: '#ffffff'});
  }

  setGeometry() {

  }
}
