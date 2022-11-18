import {
  FloatType,
  Texture,
  TextureLoader,
  DataTexture,
  EventDispatcher,
  RepeatWrapping
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import {SourceInterface, TextureType} from '../@types/Source';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {setTextureRepeating} from './ResourcesHelpers';


export default class Resources extends EventDispatcher {
  loaders!: {
    textureLoader: TextureLoader,
    RGBELoader: RGBELoader,
    gltfLoader: GLTFLoader
  };
  sources: SourceInterface[];
  items: Record<string, Texture | GLTF>;
  toLoad: number;
  loaded: number;


  constructor(sources: SourceInterface[]) {
    super();

    this.sources = sources;

    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }


  setLoaders() {
    this.loaders = {
      textureLoader: new TextureLoader(),
      RGBELoader: new RGBELoader(),
      gltfLoader: new GLTFLoader()
    };
    this.loaders.RGBELoader.setDataType(FloatType);
    // this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
  }


  startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case 'texture':
          this.loaders.textureLoader.load(
            source.path,
            (file: Texture) => {
              this.sourceLoaded(source, file);
            }
          );
          break;
        case 'envMapTexture':
          this.loaders.RGBELoader.load(
            source.path,
            (file: DataTexture) => {
              this.sourceLoaded(source, file);
            }
          );
          break;
        case 'glb':
          this.loaders.gltfLoader.load(
            source.path,
            (file: any) => {
              this.sourceLoaded(source, file);
            }
          );
          break;
      }
    }
  }


  sourceLoaded(source: SourceInterface, file: TextureType) {
    if (source.repeat) {setTextureRepeating(source, file);}

    this.items[source.name] = file;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.dispatchEvent({type: 'ready'});
    }
  }



}
