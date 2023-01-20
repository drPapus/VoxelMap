import Environment from './Environment';
import Sea from './Sea';
import Continents from './Continents';
import {SettlementMovements} from './Continent/SettlementMovements';


export default class World {
  continents: Continents;
  environment: Environment;
  movements!: SettlementMovements;
  movements2!: SettlementMovements;
  movements3!: SettlementMovements;
  movements4!: SettlementMovements;
  // sea: Sea;

  constructor() {
    // this.sea = new Sea();
    this.continents = new Continents();
    this.environment = new Environment();

    setTimeout(() => {
      this.movements = new SettlementMovements({
        from: {
          continent: this.continents.continents[1],
          position: Number('2147123174')
        },
        to: {
          continent: this.continents.continents[1],
          position: this.continents.continents[1].landscape.tiles[83]
        }
      });
    }, 2000);
    // setTimeout(() => {
    //   this.movements2 = new SettlementMovements({
    //     from: {
    //       continent: this.continents.continents[1],
    //       position: Number('2146992102')
    //     },
    //     to: {
    //       continent: this.continents.continents[1],
    //       position: Number('2146533378')
    //     }
    //   });
    // }, 4000);
    // setTimeout(() => {
    //   this.movements3 = new SettlementMovements({
    //     from: {
    //       continent: this.continents.continents[1],
    //       position: Number('2147254256')
    //     },
    //     to: {
    //       continent: this.continents.continents[1],
    //       position: Number('2147123184')
    //     }
    //   });
    // }, 6000);
    // setTimeout(() => {
    //   this.movements = new SettlementMovements({
    //     from: {
    //       continent: this.continents.continents[1],
    //       position: this.continents.continents[1].landscape.tiles[80]
    //     },
    //     to: {
    //       continent: this.continents.continents[1],
    //       position: this.continents.continents[1].landscape.tiles[82]
    //     }
    //   });
    // }, 8000);
  }


  update() {}
}
