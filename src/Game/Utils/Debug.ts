import Stats from "stats.js"
import { GUI } from 'dat.gui'

import Helpers from "./Helpers"
import Main from "../Main"

export default class Debug {
  active: boolean
  ui?: GUI
  stats?: Stats
  helpers?: Helpers
  main?: Main
  time?: Main['time']
  resources?: Main['resources']

  constructor() {
    // this.active = window.location.hash === '#debug'
    this.active = true
    if (!this.active) {return}

    this.main = new Main()
    this.helpers = new Helpers()
    this.ui = new GUI()
    this.ui.closed = true
    this.ui.width = 500

    this.initStats()
  }


  run() {
    this.time = this.main!.time
    this.resources = this.main!.resources
    this.helpers!.setHelpers()
    this.time.addEventListener('tick', () =>{
      this.stats!.end()
      this.stats!.begin()
    })
  }


  initStats() {
    this.stats = new Stats()
    this.stats.showPanel(0)
    // this.stats.showPanel(1)
    // this.stats.showPanel(2)
    document.body.appendChild(this.stats.dom)
  }
}