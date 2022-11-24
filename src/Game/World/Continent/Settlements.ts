// @ts-nocheck
import {HexMapSettlementsOptionsType} from '../../@types/Settlements';
import CultistsSettlement from './CultistsSettlement';

export default class Settlements {
  _cultistsSettlement: CultistsSettlement;


  constructor(options: HexMapSettlementsOptionsType) {
    this._cultistsSettlement = new CultistsSettlement();
  }


  static async init() {
    return new Settlements({
      // await this.getFlagGeometry()
    });
  }


  static async getFlagGeometry() {
    const GLTFFlagModel = await GLTFLoader.loadAsync(flagModel);
    const banner = GLTFFlagModel.scene.children[0].clone() as Group;
    const flagGeometry = (banner.children[2] as Mesh).geometry.clone();
    const scaleGeometry = 1.01;
    flagGeometry.scale(scaleGeometry, scaleGeometry, scaleGeometry);
    flagGeometry.rotateX(Math.PI / 2);
    flagGeometry.rotateZ(Math.PI / 2);
    flagGeometry.translate(-0.04, 0.015, 0.0025);
    return flagGeometry;
  }
}
