import Environment from './Environment';
import Sea from './Sea';
import Continents from './Continents';


export default class World {
  continents: Continents;
  environment: Environment;
  sea: Sea;

  constructor() {
    this.sea = new Sea();
    this.continents = new Continents();
    this.environment = new Environment();
  }


  update() {

  }
}
