import {MapInterface} from "../../@types/MapInterface"
import {getGeography} from "../../../mocks/geography";

export default <MapInterface> {
  name: 'Map 1',
  sea: {
    color: '#424d7c',
    material: {
      displacementScale: .4,
      roughness: .5,
    },
    size: {
      width: 80,
      height: 100
    },
    segmentsQty: {
      width: 100,
      height: 100,
    },
  },
  states: [...getGeography()],
}
