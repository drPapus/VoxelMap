import {RepeatWrapping} from 'three';
import {SourceInterface, TextureType} from '../@types/Source';


export function setTextureRepeating(source: SourceInterface, texture: TextureType) {
  if (!source.repeat || !Object.keys(source.repeat).length) {
    throw new Error('No texture "Repeat" property');
  }
  const x = source.repeat.x;
  const y = source.repeat.y;
  if (x) {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = x;
  }
  if (y) {
    texture.wrapT = RepeatWrapping;
    texture.repeat.y = y;
  }
}
