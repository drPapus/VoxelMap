import {
  EventDispatcher
} from "three"

export default class Sizes extends EventDispatcher {
  width: number
  height: number
  pixelRatio: number

  constructor() {
    super()
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    window.addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = window.devicePixelRatio

      this.dispatchEvent({type: 'resize'})
    })
  }
}