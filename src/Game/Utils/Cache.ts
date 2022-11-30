
import {
  BufferGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial
} from 'three';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';


type cacheFileType = MeshStandardMaterial | GLTF | BufferGeometry | MeshBasicMaterial;
type cacheKey = string;

const cachedFiles: Record<cacheKey, cacheFileType> = {};

console.log('Cache', cachedFiles);

export default class Cache {

  static add(key: cacheKey, file: cacheFileType) {
      cachedFiles[key] = file;
  }

  static get(key: cacheKey) {
    return cachedFiles[key];
  }

  static isExist(key: cacheKey) {
    return cachedFiles.hasOwnProperty(key);
  }

  static remove(key: cacheKey) {
    delete cachedFiles[key];
  }
}
