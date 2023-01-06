import {AnimationClip, AnimationMixer} from 'three';

import Main from '../Main';

export default class Animation {
  #main: Main;
  #time: Main['time'];
  #clips: Record<string, AnimationClip> = {};
  #animate: Record<string, AnimationMixer> = {};

  constructor() {
    this.#main = new Main();
    this.#time = this.#main.time;

    console.log('anim', this.#animate, this.#clips);
  }

  getClip(name: string): AnimationClip | undefined {
    return this.#clips[name];
  }

  setClip(name: string, clip: AnimationClip) {
    this.#clips[name] = clip;
  }

  setAnimation(name: string, mixer: AnimationMixer) {
    this.#animate[name] = mixer;
  }

  getAnimation() {
    return this.#animate;
  }

  update() {
    const delta = this.#time.clock.getDelta();
    for (const item of Object.values(this.#animate)) {
      item.update(delta);
    }
  }
}
