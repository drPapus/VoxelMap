import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial
} from "three"

import Main from "../../Main"
import getVoxelFaces from "./VoxelFaces"
import {StateInterface} from "../../@types/StateInterface"
import {FaceInterface} from "../../@types/FaceInterface"
import {encodeCoordinates, getCoordinates} from "../../../mocks/geography";


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
    this.voxel = {
      size: this.config.world.voxel.size,
      width: this.config.world.voxel.size * Math.sqrt(3),
      height: this.config.world.voxel.size * 2,
      depth: this.config.world.voxel.depth,
      faces: getVoxelFaces(this.config.world.voxel.size, this.config.world.voxel.depth)
    }
    this.attributes = {
      positions: [],
      normals: [],
      indices: []
    }

    // this.generateVoxelMatrix()
    this.generateGeometryDataForCell()
    this.setGeometry()
    this.setTextures()
    this.setMaterial()
    this.setMesh()
  }


  generateGeometryDataForCell() {
    for (const position of this.state.landscape.setup) {
      const {x, z} = getCoordinates(position)
      for (const {side, dir, corners} of this.voxel.faces) {
        if (
          // Пропускаем верхние фейсы
          // ['tt', 'tb'].includes(side)
          // Есть сосед - не рисуем грань
          // || this.isNeighbor(
          this.isNeighbor(
            x + dir[0],
            z + dir[2] - ('acdf'.includes(side) ? x % 2 : 0)
          )
        ) {continue}

        const ndx = this.attributes.positions.length / 3

        for (const pos of corners) {
          this.attributes.positions.push(
            pos[0] + x * this.voxel.height - (x * this.voxel.size / 2),
            pos[1],
            pos[2] + z * this.voxel.width - (x % 2 * (this.voxel.width / 2)),
          );
          this.attributes.normals.push(...dir)
        }

        this.attributes.indices.push(
          ndx, ndx + 1, ndx + 2,
          ndx + 2, ndx + 1, ndx + 3
        )
      }
    }
  }


  isNeighbor(x: number, z:number) {
    return this.state.landscape.setup.includes(encodeCoordinates(x, z))
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
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    this.scene.add(this.mesh)
  }
}
