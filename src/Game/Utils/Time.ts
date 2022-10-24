import {
  EventDispatcher,
  Clock
} from "three"

export default class Time extends EventDispatcher {
  clock: Clock
  // start: number
  // current: number
  elapsed: number
  // delta: number

  constructor() {
    super()

    // Setup
    this.clock = new Clock()
    // this.start = Date.now()
    // this.current = this.start
    this.elapsed = 0
    // this.delta = 16

    window.requestAnimationFrame(() => {
      this.tick()
    })
  }

  tick() {
    // const currentTime = Date.now()
    // this.delta = currentTime - this.current
    // this.current = currentTime
    // this.elapsed = this.current - this.start
    this.elapsed = this.clock.getElapsedTime()

    this.dispatchEvent({type: 'tick'})

    window.requestAnimationFrame(() => {
      this.tick()
    })
  }
}