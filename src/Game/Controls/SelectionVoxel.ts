import {
  BufferGeometry,
  DoubleSide,
  Mesh,
  ShaderMaterial,
  BackSide,
  Color,
  Vector2, CylinderBufferGeometry,
} from 'three';
import {GUI} from 'dat.gui';

import Main from '../Main';
import SideVertexShader from '../Shaders/SelectionVoxel/SideVertex.glsl';
// import SideVertexShader from '../Shaders/SelectionVoxel/Side_v2_Vertex.glsl'
import SideFragmentShader from '../Shaders/SelectionVoxel/SideFragment.glsl';
// import SideFragmentShader from '../Shaders/SelectionVoxel/Side_v2_Fragment.glsl'
import BottomVertexShader from '../Shaders/SelectionVoxel/BottomVertex.glsl';
import BottomFragmentShader from '../Shaders/SelectionVoxel/BottomFragment.glsl';


export default class SelectionVoxel {
  #main: Main;
  #resources: Main['resources'];
  #config: Main['config'];
  #scene: Main['scene'];
  #time: Main['time'];
  #debug: Main['debug'];
  #debugFolder?: GUI;
  mesh!: Mesh;
  selected: boolean;
  #geometry!: BufferGeometry;
  #materials: {
    side?: ShaderMaterial,
    bottom?: ShaderMaterial
  } = {};
  #voxel: Main['config']['world']['voxel'];


  constructor() {
    this.#main = new Main();
    this.#resources = this.#main.resources;
    this.#voxel = this.#main.config.world.voxel;
    this.#config = this.#main.config;
    this.#time = this.#main.time;
    this.#scene = this.#main.scene;
    this.#debug = this.#main.debug;
    this.selected = false;

    this.setMaterial();
    this.setGeometry();
    this.setMesh();

    if (this.#debug.active) {this.setDebug();}
  }


  setMaterial() {
    // Side
    this.#materials.side = new ShaderMaterial();
    this.#materials.side.vertexShader = SideVertexShader;
    this.#materials.side.fragmentShader = SideFragmentShader;
    this.#materials.side.uniforms = {};
    this.#materials.side.uniforms.uTime = {value: 0};
    this.#materials.side.uniforms.uColor = {value: new Color('#ffee9c')};
    this.#materials.side.uniforms.uSpeed = {value: 1.0};
    this.#materials.side.uniforms.uTransparency = {value: .15};
    this.#materials.side.uniforms.uWeight = {value: 6.0};
    this.#materials.side.uniforms.uPointSize = {value: 1.0};
    this.#materials.side.uniforms.uResolution = {value: new Vector2(1.0, 1.0)};
    this.#materials.side.side = DoubleSide;
    this.#materials.side.depthWrite = false;
    this.#materials.side.transparent = true;

    //  Bottom
    this.#materials.bottom = new ShaderMaterial();
    this.#materials.bottom.uniforms = {};
    this.#materials.bottom.uniforms.uColor = {value: new Color('#ffee9c')};
    this.#materials.bottom.uniforms.uOpacity = {value: 1.0};
    this.#materials.bottom.uniforms.uSize = {value: 0.415};
    this.#materials.bottom.vertexShader = BottomVertexShader;
    this.#materials.bottom.fragmentShader = BottomFragmentShader;
    this.#materials.bottom.transparent = true;
    this.#materials.bottom.side = BackSide;
  }


  setGeometry() {
    this.#geometry = new CylinderBufferGeometry(
      this.#voxel.size,
      this.#voxel.size,
      this.#config.world.selectionVoxelDepth,
      6,
      6,
      false
    );
  }


  setMesh() {
    this.mesh = new Mesh(this.#geometry, Object.values(this.#materials));
    this.mesh.rotation.set(Math.PI, Math.PI * .5, 0);
    this.setHidden();
    this.#scene.add(this.mesh);
  }


  setVisible() {
    if (this.mesh.visible) {return;}
    this.mesh.visible = true;
  }


  setHidden() {
    if (!this.mesh.visible) {return;}
    this.mesh.visible = false;
  }


  setPosition(x: number, y: number, z: number) {
    this.mesh.position.x = x;
    this.mesh.position.y = y + (this.#config.world.selectionVoxelDepth / 2);
    this.mesh.position.z = z;
  }


  update() {
    if (!this.mesh.visible) {return;}
    (this.#materials.side as ShaderMaterial).uniforms.uTime.value = this.#time.clock.elapsedTime;
  }


  setDebug() {
    // tslint:disable:no-non-null-assertion
    this.#debugFolder = (this.#debug.ui as GUI).addFolder('SelectionVoxel');
    const side = this.#debugFolder.addFolder('Sides');
    const bottom = this.#debugFolder.addFolder('Bottom');
    const tmp = {
      sideColor: '#ffee9c',
      bottomColor: '#ffee9c'
    };

    // Side
    side
      .addColor(tmp, 'sideColor')
      .name('Color')
      .onChange(() => {
        this.#materials.side!.uniforms.uColor.value.set(tmp.sideColor);
      });

    side
      .add(this.#materials.side!.uniforms.uPointSize, 'value')
      .name('Point Size')
      .min(0)
      .max(10)
      .step(.001);

    side
      .add(this.#materials.side!.uniforms.uResolution.value, 'x')
      .name('Res x')
      .min(0)
      .max(3)
      .step(.001);

    side
      .add(this.#materials.side!.uniforms.uResolution.value, 'y')
      .name('Res Y')
      .min(0)
      .max(3)
      .step(.001);

    side
      .add(this.#materials.side!.uniforms.uTransparency, 'value')
      .name('Transparency')
      .min(0)
      .max(1)
      .step(.001);

    side
      .add(this.#materials.side!.uniforms.uSpeed, 'value')
      .name('Speed')
      .min(0)
      .max(5)
      .step(.001);

    side
      .add(this.#materials.side!.uniforms.uWeight, 'value')
      .name('Weight')
      .min(0)
      .max(30)
      .step(.1);

    // Bottom
    bottom
      .add(this.#materials.bottom!.uniforms.uSize, 'value')
      .name('Size')
      .min(0)
      .max(.5)
      .step(.001);

    bottom
      .add(this.#materials.bottom!.uniforms.uOpacity, 'value')
      .name('Opacity')
      .min(0)
      .max(1)
      .step(.001);

    bottom
      .addColor(tmp, 'bottomColor')
      .name('Color')
      .onChange(() => {
        this.#materials.bottom!.uniforms.uColor.value.set(tmp.bottomColor);
      });
  }
}
