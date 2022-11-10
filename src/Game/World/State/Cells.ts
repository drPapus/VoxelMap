import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Color
} from 'three';

import Main from '../../Main';
import VoxelFaces from './VoxelFaces';
import {StateInterface} from '../../@types/State';
import {FaceInterface} from '../../@types/FaceInterface';
import {LandCellInterface} from '../../@types/LandCellInterface';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';


export default class Cells {
  main: Main;
  config: Main['config'];
  map: Main['map'];
  state: StateInterface;
  textures!: Record<string, any>;
  voxel: {
    size: number,
    width: number,
    height: number,
    depth: number,
    topFaces: FaceInterface[]
  };
  attributes!: {
    positions: number[],
    normals: number[],
    indices: number[]
  }[];
  geometries!: BufferGeometry[];
  meshes!: Mesh[];
  material!: MeshBasicMaterial;
  tmpIndices!: {
    cell: number,
    row: number
  }[];
  tmpCellStartPositions!: {
    x: number,
    y: number,
    z: number
  }[];
  cells!: Record<Mesh['id'], LandCellInterface>;


  constructor(state: StateInterface) {
    this.main = new Main();
    this.config = this.main.config;
    this.map = this.main.map;
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
    this.setMaterial();
    this.setMesh();
    this.setCells();
  }


  generateGeometryDataForCell() {
    this.attributes = [];
    this.tmpIndices = [];
    this.tmpCellStartPositions = [];
    for (const position of this.state.landscape.tiles) {
      const {x, z} = getCoordinates(position);
      const positions = [];
      const normals = [];
      const indices = [];
      for (const {side, dir, corners} of this.voxel.topFaces) {
        const ndx = positions.length / 3;
        for (const pos of corners) {
          positions.push(
            ...getVertexPositionForBufferAttributes(
              {width: this.voxel.width, height: this.voxel.height, size: this.voxel.size},
              {x: pos[0], y: pos[1], z: pos[2]},
              {x: x, y: 0, z: z})
          );
          normals.push(...dir);
        }

        indices.push(
          ndx, ndx + 1, ndx + 2,
          ndx + 2, ndx + 1, ndx + 3,
        );
      }

      this.tmpIndices.push({cell: x, row: z});
      // this.cacheCellStartPositions(x, this.voxel.depth, z);
      this.tmpCellStartPositions.push({
        x: positions[0],
        y: this.voxel.depth,
        z: positions[2]
      });
      this.attributes.push({
        positions: positions,
        normals: normals,
        indices: indices
      });
    }
  }


  setGeometry() {
    this.geometries = [];
    for (const attributes of this.attributes) {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(attributes.positions), 3));
      geometry.setAttribute('normal', new BufferAttribute(new Float32Array(attributes.normals), 3));
      geometry.setIndex(attributes.indices);
      this.geometries.push(geometry);
    }
  }


  setMaterial() {
    this.material = new MeshBasicMaterial();
    this.material.transparent = true;
    this.material.opacity = 0;
  }


  setMesh() {
    this.meshes = [];
    for (const geometry of this.geometries) {
      const mesh = new Mesh(geometry, this.material);
      mesh.name = 'landCell';
      mesh.layers.enable(1);
      this.meshes.push(mesh);
    }
  }


  setCells() {
    this.cells = {};
    for (let i = 0; i < this.meshes.length; i++) {
      this.cells[this.meshes[i].id] = {
        index: {
          cell: this.tmpIndices[i].cell + 1,
          row: this.tmpIndices[i].row + 1,
        },
        mesh: this.meshes[i],
        position: this.tmpCellStartPositions[i]
      };
    }
  }
}
