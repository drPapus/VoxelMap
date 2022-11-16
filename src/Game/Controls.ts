import SelectionVoxel from './Controls/SelectionVoxel';


export default class Controls {
  selectionVoxel: SelectionVoxel;

  constructor() {
    this.selectionVoxel = new SelectionVoxel();
  }

  update() {
    this.selectionVoxel.update();
  }
}
