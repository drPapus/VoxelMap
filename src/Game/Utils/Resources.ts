import {
  FloatType,
  Texture,
  TextureLoader,
  DataTexture,
  EventDispatcher
} from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import {SourceInterface} from "../Interfaces/SourceInterface"
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";


export default class Resources extends EventDispatcher {
  loaders!: {
    textureLoader: TextureLoader,
    RGBELoader: RGBELoader,
    gltfLoader: GLTFLoader
  }
  sources: SourceInterface[]
  items: Record<string, Texture | GLTF>
  toLoad: number
  loaded: number


  constructor(sources: SourceInterface[]) {
    super()

    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    this.setLoaders()
    this.startLoading()
  }


  setLoaders() {
    this.loaders = {
      textureLoader: new TextureLoader(),
      RGBELoader: new RGBELoader(),
      gltfLoader: new GLTFLoader()
    }
    this.loaders.RGBELoader.setDataType(FloatType)
    // this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
  }


  startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case 'texture':
          this.loaders.textureLoader.load(
            source.path,
            (file: Texture) => {
              this.sourceLoaded(source.name, file)
            }
          )
          break
        case 'envMapTexture':
          this.loaders.RGBELoader.load(
            source.path,
            (file: DataTexture) => {
              this.sourceLoaded(source.name, file)
            }
          )
          break
        case 'glb':
          this.loaders.gltfLoader.load(
            source.path,
            (file: any) => {
              this.sourceLoaded(source.name, file)
            }
          )
          break
      }
    }
  }


  sourceLoaded(sourceName: string, file: Texture | DataTexture) {
    this.items[sourceName] = file

    this.loaded++

    if (this.loaded === this.toLoad) {
      this.dispatchEvent({type: 'ready'})
    }
  }
}