// @ts-nocheck
import {Vector3, Matrix4, MathUtils} from 'three';
import {Flow} from 'three/examples/jsm/modifiers/CurveModifier';

// Original src: https://github.com/zz85/threejs-path-flow
const CHANNELS = 4;
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 4;


const computeFrames = (curve, segments) => {
  const normal = new Vector3();
  const binormal = new Vector3(0, 1, 0);

  const tangents = [];
  const normals = [];
  const binormals = [];

  const vec = new Vector3();
  const mat = new Matrix4();

  for (let i = 0; i <= segments; i++) {

    const u = i / segments;

    tangents[i] = curve.getTangentAt(u);

    normal.crossVectors( tangents[i], binormal );

    normal.y = 0; // to prevent lateral slope of the road

    normal.normalize( );
    normals.push( normal.clone( ) );

    binormal.crossVectors( normal, tangents[i] ); // new binormal
    binormals.push( binormal.clone( ) );

  }

  return {
    tangents: tangents,
    normals: normals,
    binormals: binormals
  };
};

function setTextureValue(texture, index, x, y, z, o) {
  const image = texture.image;
  const {data} = image;
  const i = CHANNELS * TEXTURE_WIDTH * o; // Row Offset
  data[index * CHANNELS + i + 0] = x;
  data[index * CHANNELS + i + 1] = y;
  data[index * CHANNELS + i + 2] = z;
  data[index * CHANNELS + i + 3] = 1;

}

function updateSplineTexture(texture, splineCurve, offset = 0) {

  const numberOfPoints = Math.floor(TEXTURE_WIDTH * (TEXTURE_HEIGHT / 4));
  splineCurve.arcLengthDivisions = numberOfPoints / 2;
  splineCurve.updateArcLengths();
  const points = splineCurve.getSpacedPoints(numberOfPoints);
  // const frenetFrames = computeFrenetFrames(splineCurve, numberOfPoints, true); // def closed: true
  const frenetFrames = computeFrames(splineCurve, numberOfPoints);

  for (let i = 0; i < numberOfPoints; i++) {

    const rowOffset = Math.floor(i / TEXTURE_WIDTH);
    const rowIndex = i % TEXTURE_WIDTH;

    let pt = points[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 0 + rowOffset + (TEXTURE_HEIGHT * offset));
    pt = frenetFrames.tangents[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 1 + rowOffset + (TEXTURE_HEIGHT * offset));
    pt = frenetFrames.normals[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 2 + rowOffset + (TEXTURE_HEIGHT * offset));
    pt = frenetFrames.binormals[i];
    setTextureValue(texture, rowIndex, pt.x, pt.y, pt.z, 3 + rowOffset + (TEXTURE_HEIGHT * offset));
  }

  texture.needsUpdate = true;

}


Flow.prototype.updateCurve = function(index, curve) {
  if (index >= this.curveArray.length) {
    throw Error('Index out of range for Flow');
  }
  const curveLength = curve.getLength();
  this.uniforms.spineLength.value = curveLength;
  this.curveLengthArray[index] = curveLength;
  this.curveArray[index] = curve;
  updateSplineTexture(this.splineTexure, curve, index);
};

export {Flow};
