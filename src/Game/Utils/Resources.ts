import {
  FloatType,
  Texture,
  TextureLoader,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';

import {SourceKey, SourcesType, SourceType} from '../@types/Source';
import {setTextureRepeating} from './ResourcesHelpers';


export default class Resources {
  loaders: {
    textureLoader: TextureLoader,
    RGBELoader: RGBELoader,
    gltfLoader: GLTFLoader
  };
  #queue: Record<SourceKey, Promise<void>> = {};
  sources: SourcesType;
  items: Record<SourceKey, SourceType> = {};


  constructor(sources: SourcesType) {
    this.sources = sources;
    this.loaders = {
      textureLoader: new TextureLoader(),
      RGBELoader: new RGBELoader(),
      gltfLoader: new GLTFLoader()
    };
    this.loaders.RGBELoader.setDataType(FloatType);
    // this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
  }


  async getSource(sourceKey: SourceKey) {
    // console.log(this.queue, this.items);
    if (this.items[sourceKey]) {return this.items[sourceKey];}
    if (!this.#queue.hasOwnProperty(sourceKey)) {
      this.#queue[sourceKey] = this.loadSource(sourceKey).finally(() => {
        delete this.#queue[sourceKey];
      });
    }
    await this.#queue[sourceKey];
    return this.items[sourceKey];
  }

  async loadSource(sourceKey: SourceKey) {
    const source = this.sources[sourceKey];
    if (!source) {throw new Error('Wrong source key!');}
    let file;

    switch (source.type) {
      case 'texture':
        file = await this.loaders.textureLoader.loadAsync(source.path);
        break;
      case 'envMapTexture':
        file = await this.loaders.RGBELoader.loadAsync(source.path);
        break;
      case 'glb':
        file = await this.loaders.gltfLoader.loadAsync(source.path);
        break;
    }

    if (!file) {throw new Error('No file Loaded');}
    if (source.type === 'texture' && source.repeat) {setTextureRepeating(source, file as Texture);}
    this.items[sourceKey] = file;
  }
}
