import {
  Vector3,
  Uniform,
  Curve,
  DataTexture,
} from 'three';
import {
  Flow,
  SplineUniform,
} from 'three/examples/jsm/modifiers/CurveModifier';


export interface SplineUniformInterface extends SplineUniform {
  spineLength: Uniform;
}


export const CHANNELS = 4;
export const TEXTURE_WIDTH = 1024;
export const TEXTURE_HEIGHT = 4;


export const getTextureValue = (texture: DataTexture, index: number, offset: number): Vector3 => {
  const {data} = texture.image;
  const i = CHANNELS * TEXTURE_WIDTH * offset;
  // console.log(i, index * CHANNELS + i, index, offset);
  return new Vector3(
      data[index * CHANNELS + i],
      data[index * CHANNELS + i + 1],
      data[index * CHANNELS + i + 2],
  );
};


export const computeFrames = function(this: Curve<Vector3>, segments: number) {
  const normal = new Vector3();
  const binormal = new Vector3(0, 1, 0);
  const tangents = [];
  const normals = [];
  const binormals = [];

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;

    tangents[i] = this.getTangentAt(u);

    normal.crossVectors(binormal, tangents[i]);
    normal.y = 0; // to prevent lateral slope of the road
    normal.normalize();
    normals.push(normal.clone());

    binormal.crossVectors(tangents[i], normal);
    binormals.push(binormal.clone());
  }

  return {
    tangents: tangents,
    normals: normals,
    binormals: binormals
  };
};
