import {DataTexture, Texture} from 'three';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';

export type SourceType = Texture | DataTexture | GLTF;

export type SourceKey = string;

export type SourcesType = Record<SourceKey, SourceInterface>;

export interface SourceInterface {
  type: 'envMapTexture' | 'texture' | 'glb';
  path: string;
  repeat?: {
    x?: number,
    y?: number
  };
}
