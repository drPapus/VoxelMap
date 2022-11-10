import {
  EventDispatcher,
  Clock
} from 'three';

export default class Time extends EventDispatcher {
  clock: Clock;
  elapsed: number;

  constructor() {
    super();

    // Setup
    this.clock = new Clock();
    this.elapsed = 0;

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    this.elapsed = this.clock.getElapsedTime();

    this.dispatchEvent({type: 'tick'});

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
