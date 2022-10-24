import {
  BufferAttribute,
  BufferGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial
} from "three"

import Main from "../../Main"
import VoxelFaces from "./VoxelFaces"
import {StateInterface} from "../../Interfaces/StateInterface"
import {FaceInterface} from "../../Interfaces/FaceInterface"


export class VoxelLandscape {
  main: Main
  config: Main['config']
  resources: Main['resources']
  scene: Main['scene']
  state: StateInterface
  textures?: Record<string, any>
  voxel: {
    size: number,
    width: number,
    height: number,
    depth: number,
    faces: FaceInterface[]
  }
  maxLevel: number
  boxSize: number
  cell: Uint8Array
  attributes: {
    positions: number[],
    normals: number[],
    indices: number[]
  }
  geometry?: BufferGeometry
  material?: MeshStandardMaterial
  mesh?: Mesh


  constructor(state: StateInterface) {
    this.main = new Main()
    this.config = this.main.config
    this.resources = this.main.resources
    this.scene = this.main.scene
    this.state = state
    this.maxLevel = Math.max(...this.state.landscape.setup)
    this.boxSize = Math.max(this.state.width, this.state.height, this.maxLevel)
    this.voxel = {
      size: this.config.world.voxel.size,
      width: this.config.world.voxel.size * Math.sqrt(3),
      height: this.config.world.voxel.size * 2,
      depth: this.config.world.voxel.depth,
      faces: VoxelFaces(this.config.world.voxel.size, this.config.world.voxel.depth)
    }
    this.cell = new Uint8Array(this.boxSize * this.boxSize * this.boxSize)
    this.attributes = {
      positions: [],
      normals: [],
      indices: []
    }

    this.generateVoxelMatrix()
    this.generateGeometryDataForCell()
    this.setGeometry()
    this.setTextures()
    this.setMaterial()
    this.setMesh()
  }


  setVoxel(x: number, y: number, z: number, v: number) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return;  // TODO: add a new cell?
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }


  generateVoxelMatrix() {
    let idx = 0
    for (let z = 0; z < this.state.height; ++z) {
      for (let x = 0; x < this.state.width; ++x) {
        for (let y = 0; y < this.state.landscape.setup[idx]; ++y) {
          this.setVoxel(x, y, z, 1)
        }
        idx++
      }
    }
  }


  getVoxel(x:number, y:number, z:number) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return 0;
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    return cell[voxelOffset];
  }


  getCellForVoxel(x:number, y:number, z:number) {
    const cellX = Math.floor(x / this.state.width);
    const cellY = Math.floor(y / this.maxLevel);
    const cellZ = Math.floor(z / this.state.height);
    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
      return null;
    }
    return this.cell;
  }


  computeVoxelOffset(x:number, y:number, z:number) {
    const voxelX = MathUtils.euclideanModulo(x, this.boxSize) | 0
    const voxelY = MathUtils.euclideanModulo(y, this.boxSize) | 0
    const voxelZ = MathUtils.euclideanModulo(z, this.boxSize) | 0
    return voxelY * this.boxSize * this.boxSize
      + voxelZ * this.boxSize
      + voxelX;
  }


  generateGeometryDataForCell() {
    let idx = 0

    for (let z = 0; z < this.state.height; ++z) {
      for (let x = 0; x < this.state.width; ++x) {
        for (let y = 0; y < this.state.landscape.setup[idx]; ++y) {
          // Тут вокселю нужно знать где стороны/фэйсы
          for (const {side, dir, corners} of this.voxel.faces) {
            // Пропускаем верхние фэйсы
            if (['tl', 'tr'].includes(side)) {continue}

            let dirX = dir[0]
            let dirY = dir[1]
            let dirZ = dir[2]

            if ('bcfe'.includes(side)) {dirX -= z % 2}

            // Есть сосед - не рисуем грань
            if (this.getVoxel(x + dirX, y + dirY, z + dirZ)) {continue}

            // у этого вокселя нет соседей в этом направлении, поэтому рисуем грань.
            const ndx = this.attributes.positions.length / 3

            for (const pos of corners) {
              this.attributes.positions.push(
                pos[0] + x * this.voxel.width - (z % 2 * (this.voxel.width / 2)),
                pos[1] + y * this.voxel.depth,
                pos[2] + z * this.voxel.height - (z * this.voxel.size / 2)
              );
              this.attributes.normals.push(...dir)
            }

            this.attributes.indices.push(
              ndx, ndx + 1, ndx + 2,
              ndx + 2, ndx + 1, ndx + 3,
            )
          }
        }
        idx++
      }
    }
  }


  setGeometry() {
    this.geometry = new BufferGeometry()
    this.geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(this.attributes.positions), 3)
    )
    this.geometry.setAttribute(
      'normal',
      new BufferAttribute(new Float32Array(this.attributes.normals), 3)
    )
    this.geometry.setIndex(this.attributes.indices)
  }


  setTextures() {
    this.textures = {}
    this.textures.normalMap = this.resources.items.woodNormalTexture
  }


  setMaterial() {
    this.material = new MeshStandardMaterial()
    this.material.normalMap = this.textures!.normalMap
    this.material.roughness = 1

    switch (this.state.status) {
      case 'active':
        this.material.color.set(this.config.world.voxel.sideColor)
        break
      case 'disabled':
        this.material.color.set(this.config.world.disabledLandColor)
        this.material.transparent = true
        this.material.opacity = .3
        break
      case 'explored':
        this.material.color.set(this.config.world.voxel.sideColor)
        this.material.emissive.set(this.config.world.exploredLandEmissive)
        this.material.emissiveIntensity = this.config.world.exploredLandEmissiveIntensity
        break
    }
  }


  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material)
    this.mesh.name = 'land'
    this.mesh.layers.enable(1)
    this.mesh.receiveShadow = true
    // Позиционируем по воксельной сетке, а не фактически по координатам
    this.mesh.position.x = this.state.position.x * this.voxel.width
    this.mesh.position.y = this.state.position.y
    this.mesh.position.z = this.state.position.z * (this.voxel.height + this.voxel.size)
    this.mesh.castShadow = true // Default is false
    this.mesh.receiveShadow = true // default

    this.scene.add(this.mesh)
  }
}