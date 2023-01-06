import {
  EventDispatcher,
  Clock
} from 'three';

export default class Time extends EventDispatcher {
  clock: Clock;
  // elapsed: number;

  constructor() {
    super();

    // Setup
    this.clock = new Clock();
    // this.elapsed = this.clock.elapsedTime;

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    // this.elapsed = this.clock.elapsedTime;

    // console.log(this.elapsed);

    this.dispatchEvent({type: 'tick'});

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
