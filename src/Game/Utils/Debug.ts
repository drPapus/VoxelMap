import Stats from 'stats.js';
import { GUI } from 'dat.gui';

import Helpers from './Helpers';
import Main from '../Main';

export default class Debug {
  active: boolean;
  ui?: GUI;
  stats?: Stats;
  helpers?: Helpers;
  main?: Main;
  time?: Main['time'];
  resources?: Main['resources'];

  constructor() {
    // this.active = window.location.hash === '#debug'
    this.active = true;
    if (!this.active) {return;}

    this.main = new Main();
    this.helpers = new Helpers();
    this.ui = new GUI();
    this.ui.closed = true;
    this.ui.width = 500;

    this.initStats();
  }


  run() {
    // tslint:disable-next-line:no-non-null-assertion
    this.time = this.main!.time;
    // tslint:disable-next-line:no-non-null-assertion
    this.resources = this.main!.resources;
    // tslint:disable-next-line:no-non-null-assertion
    this.helpers!.setHelpers();
    this.time.addEventListener('tick', () =>{
      // tslint:disable-next-line:no-non-null-assertion
      this.stats!.end();
      // tslint:disable-next-line:no-non-null-assertion
      this.stats!.begin();
    });
  }


  initStats() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    // this.stats.showPanel(1)
    // this.stats.showPanel(2)
    document.body.appendChild(this.stats.dom);
  }
}
