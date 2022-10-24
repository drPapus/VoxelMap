import Environment from './Environment'
import Sea from './Sea'
import States from "./States";


export default class World {
  states: States
  environment: Environment
  sea: Sea


  constructor() {
    this.sea = new Sea()
    this.states = new States()
    this.environment = new Environment()
  }


  update() {

  }
}