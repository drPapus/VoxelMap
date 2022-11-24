import {RepeatWrapping, Texture} from 'three';
import {SourceInterface, SourceType} from '../@types/Source';


export function setTextureRepeating(source: SourceInterface, texture: Texture) {
  if (!source.repeat || !Object.keys(source.repeat).length) {
    console.warn('No texture "Repeat" property');
    return;
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
