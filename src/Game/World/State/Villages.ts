import Main from "../../Main"
import {LandCellInterface} from "../../Interfaces/LandCellInterface"


export default class Villages {
  main: Main
  cells: LandCellInterface[]

  constructor(cells: LandCellInterface[]) {
    this.main = new Main()
    this.cells = cells

    this.setStage()
  }

  setStage() {

  }
}