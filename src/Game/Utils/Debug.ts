import Stats from "stats.js"
import { GUI } from 'dat.gui'

export default class Debug {
  active: boolean
  ui?: GUI
  stats?: Stats

  constructor() {
    // this.active = window.location.hash === '#debug'
    this.active = true

    if (!this.active) {
      return
    }

    this.ui = new GUI()
    this.ui.closed = true
    this.ui.width = 500

    this.initStats()
  }

  initStats() {
    this.stats = new Stats()
    this.stats.showPanel(0)
    // this.stats.showPanel(1)
    // this.stats.showPanel(2)
    document.body.appendChild(this.stats.dom)

  }
}