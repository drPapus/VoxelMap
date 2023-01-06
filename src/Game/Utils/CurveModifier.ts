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


const CHANNELS = 4;
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 4;


const computeFrames = (curve: Curve<Vector3>, segments: number) => {
  const normal = new Vector3();
  const binormal = new Vector3(0, 1, 0);
  const tangents = [];
  const normals = [];
  const binormals = [];

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;

    tangents[i] = curve.getTangentAt(u);

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


function setTextureValue(
  texture: DataTexture,
  index: number,
  x: number,
  y: number,
  z: number,
  o: number
) {
  const image = texture.image;
  const {data} = image;
  const i = CHANNELS * TEXTURE_WIDTH * o; // Row Offset
  data[index * CHANNELS + i + 0] = x;
  data[index * CHANNELS + i + 1] = y;
  data[index * CHANNELS + i + 2] = z;
  data[index * CHANNELS + i + 3] = 1;
}


function updateSplineTexture(texture: DataTexture, splineCurve: Curve<Vector3>, offset = 0) {
  const numberOfPoints = Math.floor(TEXTURE_WIDTH * (TEXTURE_HEIGHT / 4));
  splineCurve.arcLengthDivisions = numberOfPoints / 2;
  splineCurve.updateArcLengths();
  const points = splineCurve.getSpacedPoints(numberOfPoints);
  const frames = computeFrames(splineCurve, numberOfPoints);

  for (let i = 0; i < numberOfPoints; i++) {
    const rowOffset = Math.floor(i / TEXTURE_WIDTH);
    const rowIndex = i % TEXTURE_WIDTH;

    let pt = points[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 0 + rowOffset + (TEXTURE_HEIGHT * offset));
    pt = frames.tangents[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 1 + rowOffset + (TEXTURE_HEIGHT * offset));
    pt = frames.normals[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 2 + rowOffset + (TEXTURE_HEIGHT * offset));
    pt = frames.binormals[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 3 + rowOffset + (TEXTURE_HEIGHT * offset));
  }
  texture.needsUpdate = true;
}


Flow.prototype.updateCurve = function(index: number, curve: Curve<Vector3>) {
  if (index >= this.curveArray.length) {
    throw Error('Index out of range for Flow');
  }
  const curveLength = curve.getLength();
  (this.uniforms as SplineUniformInterface).spineLength.value = curveLength;
  this.curveLengthArray[index] = curveLength;
  (this.curveArray as unknown as Curve<Vector3>[])[index] = curve;
  updateSplineTexture(this.splineTexure, curve, index);
};


export {Flow};
