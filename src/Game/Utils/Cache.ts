import {MeshStandardMaterial} from 'three';

export default class Cache {
  materials: {
    peaks: Record<string, MeshStandardMaterial>
  } = {
    peaks: {}
  };
}
