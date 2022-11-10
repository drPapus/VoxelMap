import {
  PerspectiveCamera,
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'dat.gui';

import Main from './Main';

import {ConfigInterface} from './@types/ConfigInterface';

export default class Camera {
  main: Main;
  sizes: Main['sizes'];
  scene: Main['scene'];
  canvas: Main['canvas'];
  instance!: PerspectiveCamera;
  controls!: OrbitControls;
  debug: Main['debug'];
  config: ConfigInterface['camera'];
  debugFolder?: GUI;

  constructor() {
    this.main = new Main();
    this.sizes = this.main.sizes;
    this.scene = this.main.scene;
    this.canvas = this.main.canvas;
    this.config = this.main.config.camera;
    this.debug = this.main.debug;

    this.setInstance();
    this.setControls();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  setInstance() {
    this.instance = new PerspectiveCamera(
      60,
      this.sizes.width / this.sizes.height,
      1,
      200
    );
    this.instance.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.scene.add(this.instance);
  }


  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas as HTMLElement);
    this.controls.enableDamping = true;
  }


  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }


  update() {
    this.controls.update();
  }


  setDebug() {
    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder = this.debug.ui!.addFolder('Camera');
    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder!
      .add(this.instance.position, 'x')
      .name('Position X')
      .min(-200)
      .max(200)
      .step(.1);

    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder!
      .add(this.instance.position, 'y')
      .name('Position Y')
      .min(-200)
      .max(200)
      .step(.1);

    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder!
      .add(this.instance.position, 'z')
      .name('Position Z')
      .min(-200)
      .max(200)
      .step(.1);
  }
}
