import {
  GridHelper,
  AxesHelper,
  CameraHelper
} from 'three';

import Main from '../Main';
import Environment from '../World/Environment';


export default class Helpers {
  main: Main;
  debug: Main['debug'];
  scene: Main['scene'];
  environment?: Environment;
  helpers: {
    grid?: GridHelper
    axes?: AxesHelper
    camera?: CameraHelper
  };


  constructor() {
    this.main = new Main();
    this.debug = this.main.debug;
    this.scene = this.main.scene;
    this.helpers = {};
  }


  setHelpers() {
    // tslint:disable-next-line:no-non-null-assertion
    this.environment = this.main.world!.environment;

    // Grid Helper
    this.helpers.grid = new GridHelper(400, 40, 0x0000ff, 0x808080);
    this.helpers.grid.position.x = 0;
    this.helpers.grid.position.y = 0;

    // Axes Helper
    this.helpers.axes = new AxesHelper(35);
    this.helpers.axes.position.y = .6;

    // Camera Helper
    // setTimeout(() => {
    //   this.helpers.camera = new CameraHelper(this.environment!.light.shadow.camera)
    // }, 5000)

    // Add to scene
    this.scene.add(...Object.values(this.helpers));
  }
}
