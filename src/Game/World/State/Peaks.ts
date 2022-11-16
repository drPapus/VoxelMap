import {
  BufferAttribute,
  BufferGeometry,
  Line3,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';

import Main from '../../Main';
import VoxelFaces from './VoxelFaces';

import {StateInterface} from '../../@types/State';
import {FaceInterface} from '../../@types/FaceInterface';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';

type level = string;

export default class Peaks {
  main: Main;
  config: Main['config'];
  map: Main['map'];
  resources: Main['resources'];
  state: StateInterface;
  textures!: Record<string, any>;
  voxel: {
    size: number,
    width: number,
    height: number,
    depth: number,
    topFaces: FaceInterface[]
  };
  attributes!: Record<level, {
    positions: number[],
    normals: number[],
    indices: number[]
  }>;
  geometries!: Record<level, BufferGeometry>;
  materials!: Record<level, MeshStandardMaterial>;
  meshes!: Mesh[];


  constructor(state: StateInterface) {
    this.main = new Main();
    this.config = this.main.config;
    this.map = this.main.map;
    this.resources = this.main.resources;
    this.state = state;
    this.voxel = {
      size: this.config.world.voxel.size,
      width: this.config.world.voxel.size * Math.sqrt(3),
      height: this.config.world.voxel.size * 2,
      depth: this.config.world.voxel.depth,
      topFaces: VoxelFaces(this.config.world.voxel.size, this.config.world.voxel.depth, 'top')
    };

    this.generateGeometryDataForCell();
    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }


  generateGeometryDataForCell() {
    this.attributes = {};
    this.attributes[1] = {
      positions: [],
      normals: [],
      indices: []
    };
    for (const position of this.state.landscape.tiles) {
      const {x, z} = getCoordinates(position);
      for (const {side, dir, corners} of this.voxel.topFaces) {
        const ndx = this.attributes[1].positions.length / 3;

        for (const pos of corners) {
          this.attributes[1].positions.push(
            ...getVertexPositionForBufferAttributes(
              {width: this.voxel.width, height: this.voxel.height, size: this.voxel.size},
              {x: pos[0], y: pos[1], z: pos[2]},
              {x: x, y: 0, z: z})
          );
          this.attributes[1].normals.push(...dir);
        }

        this.attributes[1].indices.push(
          ndx, ndx + 1, ndx + 2,
          ndx + 2, ndx + 1, ndx + 3,
        );
      }
    }
  }


  getPeakUVs(position: BufferAttribute) {
    /*
           0.1      1.1
              ######
              ######    <- texture
              ######
           0.0      1.0
     */
    const uv = [];
    const leftSideLine = new Line3(
      new Vector3(this.map.sea.size.width / -2, 0, this.map.sea.size.height / 2),
      new Vector3(this.map.sea.size.width / -2, 0, this.map.sea.size.height / -2)
    );
    const bottomSideLine = new Line3(
      new Vector3(this.map.sea.size.width / -2, 0, this.map.sea.size.height / 2),
      new Vector3(this.map.sea.size.width / 2, 0, this.map.sea.size.height / 2)
    );
    const vertex = new Vector3();
    const targetPoint = new Vector3();

    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex++) {
      const peakVertex = vertex.fromBufferAttribute(position, vertexIndex);
      peakVertex.y = 0; // может и лишнее, но для чистоты расчета
      const offsetLeft = leftSideLine.closestPointToPoint(peakVertex, false, targetPoint).distanceTo(peakVertex);
      const offsetBottom = bottomSideLine.closestPointToPoint(peakVertex, false, targetPoint).distanceTo(peakVertex);
      uv.push(
        offsetLeft / this.map.sea.size.width,
        offsetBottom / this.map.sea.size.height
      );
    }

    return uv;
  }


  setGeometry() {
    this.geometries = {};
    for (const [key, attributes] of Object.entries(this.attributes)) {
      const geometry = new BufferGeometry();
      const position = new BufferAttribute(new Float32Array(attributes.positions), 3);
      geometry.setAttribute('position', position);
      geometry.setAttribute(
        'normal',
        new BufferAttribute(new Float32Array(attributes.normals), 3)
      );
      geometry.setIndex(attributes.indices);
      geometry.setAttribute(
        'uv',
        new BufferAttribute(new Float32Array(this.getPeakUVs(position)), 2)
      );

      this.geometries[key] = geometry;
    }
  }


  setTextures() {
    this.textures = {};
    this.textures.map = this.resources.items.woodBaseColorTexture;
    this.textures.woodHightMapTexture = this.resources.items.woodHightMapTexture;
    // this.textures.test = this.resources.items.testTexture
  }


  setMaterial() {
    this.materials = {};
    for (const key of Object.keys(this.geometries)) {
      const material = new MeshStandardMaterial();
      material.map = this.textures.map;
      // material.displacementMap = this.textures.woodHightMapTexture
      switch (this.state.status) {
        case 'active':
          material.color.set(this.config.world.voxel.peakLevelColors[+key - 1]);
          break;
        case 'explored':
          material.color.set(this.config.world.voxel.peakLevelColors[+key - 1]);
          material.emissive.set(this.config.world.exploredLandEmissive);
          material.emissiveIntensity = this.config.world.exploredLandEmissiveIntensity;
          break;
        case 'disabled':
          material.color.set(this.config.world.disabledLandColor);
          material.transparent = true;
          material.opacity = .3;
          break;
      }
      this.materials[key] = material;
    }
  }


  setMesh() {
    this.meshes = [];
    for (const key of Object.keys(this.geometries)) {
      const mesh = new Mesh(this.geometries[key], this.materials[key]);
      mesh.name = 'peak';
      mesh.receiveShadow = true;
      this.meshes.push(mesh);
    }
  }
}
