import {DataTexture, Texture} from 'three';


export type TextureType = Texture | DataTexture;


export interface SourceInterface {
  name: string;
  type: string;
  path: string;
  repeat?: {
    x?: number,
    y?: number
  };
}
