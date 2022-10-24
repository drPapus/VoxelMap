import {
  BufferAttribute,
  BufferGeometry,
  Line3,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three"

import Main from "../../Main"
import VoxelFaces from "./VoxelFaces"

import {StateInterface} from "../../Interfaces/StateInterface"
import {FaceInterface} from "../../Interfaces/FaceInterface"

type level = string

export default class Peaks {
  main: Main
  config: Main['config']
  map: Main['map']
  resources: Main['resources']
  state: StateInterface
  textures!: Record<string, any>
  voxel: {
    size: number,
    width: number,
    height: number,
    depth: number,
    topFaces: FaceInterface[]
  }
  attributes!: Record<level, {
    positions: number[],
    normals: number[],
    indices: number[]
  }>
  geometries!: Record<level, BufferGeometry>
  materials!: Record<level, MeshStandardMaterial>
  meshes!: Mesh[]


  constructor(state: StateInterface) {
    this.main = new Main()
    this.config = this.main.config
    this.map = this.main.map
    this.resources = this.main.resources
    this.state = state
    this.voxel = {
      size: this.config.world.voxel.size,
      width: this.config.world.voxel.size * Math.sqrt(3),
      height: this.config.world.voxel.size * 2,
      depth: this.config.world.voxel.depth,
      topFaces: VoxelFaces(this.config.world.voxel.size, this.config.world.voxel.depth, 'top')
    }

    this.generateGeometryDataForCell()
    this.setGeometry()
    this.setTextures()
    this.setMaterial()
    this.setMesh()
  }


  generateGeometryDataForCell() {
    this.attributes = {}
    let idx = 0
    for (let z = 0; z < this.state.height; ++z) {
      for (let x = 0; x < this.state.width; ++x) {
        const y = this.state.landscape.setup[idx]
        if (!y) {
          idx++
          continue
        }

        if (!this.attributes[y]) {
          this.attributes[y] = {
            positions: [],
            normals: [],
            indices: []
          }
        }

        for (const {dir, corners} of this.voxel.topFaces) {
          const ndx = this.attributes[y].positions.length / 3

          for (const pos of corners) {
            this.attributes[y].positions.push(
              pos[0] + x * this.voxel.width - (z % 2 * (this.voxel.width / 2)),
              pos[1] * y,
              pos[2] + z * this.voxel.height - (z * this.voxel.size / 2)
            )
            this.attributes[y].normals.push(...dir)
          }

          this.attributes[y].indices.push(
            ndx, ndx + 1, ndx + 2,
            ndx + 2, ndx + 1, ndx + 3,
          )
        }

        idx++
      }
    }
  }


  getPeakUVs(position: BufferAttribute, displacement: {x: number, z: number}) {
    /*
           0.1      1.1
              ######
              ######    <- texture
              ######
           0.0      1.0
     */
    let uv = []
    let leftSideLine = new Line3(
      new Vector3(this.map.sea.size.width / -2, 0, this.map.sea.size.height / 2),
      new Vector3(this.map.sea.size.width / -2, 0, this.map.sea.size.height / -2)
    )
    let bottomSideLine = new Line3(
      new Vector3(this.map.sea.size.width / -2, 0, this.map.sea.size.height / 2),
      new Vector3(this.map.sea.size.width / 2, 0, this.map.sea.size.height / 2)
    );
    let vertex = new Vector3()
    let targetPoint = new Vector3()

    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex++) {
      let peakVertex = vertex.fromBufferAttribute(position, vertexIndex)
      if (displacement.x !== 0 || displacement.z !== 0) {
        peakVertex.x += displacement.x * this.voxel.width
        peakVertex.z += displacement.z * (this.voxel.height + this.voxel.size)
      }
      peakVertex.y = 0; // может и лишнее, но для чистоты расчета
      let offsetLeft = leftSideLine.closestPointToPoint(peakVertex, false, targetPoint).distanceTo(peakVertex);
      let offsetBottom = bottomSideLine.closestPointToPoint(peakVertex, false, targetPoint).distanceTo(peakVertex);
      uv.push(
        offsetLeft / this.map.sea.size.width,
        offsetBottom / this.map.sea.size.height
      )
    }

    return uv
  }


  setGeometry() {
    this.geometries = {}
    for (const [key, attributes] of Object.entries(this.attributes)) {
      let geometry = new BufferGeometry()
      let position = new BufferAttribute(new Float32Array(attributes.positions), 3)
      geometry.setAttribute('position', position)
      geometry.setAttribute(
        'normal',
        new BufferAttribute(new Float32Array(attributes.normals), 3)
      )
      geometry.setIndex(attributes.indices)
      geometry.setAttribute(
        'uv',
        new BufferAttribute(
          new Float32Array(
            this.getPeakUVs(position, {x: this.state.position.x, z: this.state.position.z})
          ),
          2
        )
      )

      this.geometries[key] = geometry
    }
  }


  setTextures() {
    this.textures = {}
    this.textures.map = this.resources.items.woodBaseColorTexture
    this.textures.woodHightMapTexture = this.resources.items.woodHightMapTexture
    // this.textures.test = this.resources.items.testTexture
  }


  setMaterial() {
    this.materials = {}
    for (const key of Object.keys(this.geometries)) {
      let material = new MeshStandardMaterial()
      material.map = this.textures.map
      // material.displacementMap = this.textures.woodHightMapTexture
      switch (this.state.status) {
        case 'active':
          material.color.set(this.config.world.voxel.peakLevelColors[+key - 1])
          break
        case 'explored':
          material.color.set(this.config.world.voxel.peakLevelColors[+key - 1])
          material.emissive.set(this.config.world.exploredLandEmissive)
          material.emissiveIntensity = this.config.world.exploredLandEmissiveIntensity
          break
        case 'disabled':
          material.color.set(this.config.world.disabledLandColor)
          material.transparent = true
          material.opacity = .3
          break
      }
      this.materials[key] = material
    }
  }


  setMesh() {
    this.meshes = []
    for (const key of Object.keys(this.geometries)) {
      let mesh = new Mesh(this.geometries[key], this.materials[key])
      mesh.name = 'peak'
      mesh.receiveShadow = true
      this.meshes.push(mesh)
    }
  }
}