import {
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Mesh,
  ShaderMaterial,
  BackSide,
  Color,
  Vector2,
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
  main: Main;
  resources: Main['resources'];
  config: Main['config'];
  scene: Main['scene'];
  time: Main['time'];
  debug: Main['debug'];
  debugFolder?: GUI;
  mesh!: Mesh;
  selected: boolean;
  textures!: Record<string, any>;
  geometry!: BufferGeometry;
  materials!: {
    side?: ShaderMaterial,
    bottom?: ShaderMaterial
  };
  voxel: {
    size: number,
    width: number,
    height: number,
  };


  constructor() {
    this.main = new Main();
    this.resources = this.main.resources;
    this.config = this.main.config;
    this.time = this.main.time;
    this.scene = this.main.scene;
    this.debug = this.main.debug;
    this.selected = false;
    this.voxel = {
      size: this.config.world.voxel.size,
      width: this.config.world.voxel.size * Math.sqrt(3),
      height: this.config.world.selectionVoxelHeight,
    };

    this.setTextures();
    this.setMaterial();
    this.setGeometry();
    this.setMesh();

    if (this.debug.active) {
      this.setDebug();
    }
  }


  setTextures() {
    this.textures = {};
    this.textures.map = this.resources.items.woodBaseColorTexture;
  }


  setMaterial() {
    this.materials = {};
    // Side
    this.materials.side = new ShaderMaterial();
    this.materials.side.vertexShader = SideVertexShader;
    this.materials.side.fragmentShader = SideFragmentShader;
    this.materials.side.uniforms = {};
    this.materials.side.uniforms.uTime = {value: 0};
    this.materials.side.uniforms.uColor = {value: new Color('#ffee9c')};
    this.materials.side.uniforms.uSpeed = {value: 2.0};
    this.materials.side.uniforms.uTransparency = {value: .15};
    this.materials.side.uniforms.uWeight = {value: 0.4};
    this.materials.side.uniforms.uPointSize = {value: 1.0};
    this.materials.side.uniforms.uResolution = {value: new Vector2(0.24, 1.0)};
    this.materials.side.side = DoubleSide;
    this.materials.side.depthWrite = false;
    this.materials.side.transparent = true;

    //  Bottom
    this.materials.bottom = new ShaderMaterial();
    this.materials.bottom.uniforms = {};
    this.materials.bottom.uniforms.uColor = {value: new Color('#ffee9c')};
    this.materials.bottom.uniforms.uOpacity = {value: 1.0};
    this.materials.bottom.uniforms.uSize = {value: 0.415};
    this.materials.bottom.vertexShader = BottomVertexShader;
    this.materials.bottom.fragmentShader = BottomFragmentShader;
    this.materials.bottom.transparent = true;
    this.materials.bottom.side = BackSide;
  }


  setGeometry() {
    this.geometry = new CylinderGeometry(
      this.voxel.size,
      this.voxel.size,
      this.voxel.height,
      6,
      6,
      false
    );
  }


  setMesh() {
    this.mesh = new Mesh(this.geometry, Object.values(this.materials));
    this.mesh.rotation.set(Math.PI, Math.PI * .5, 0);
    this.mesh.visible = false;
    this.scene.add(this.mesh);
  }


  setVisible() {
    this.mesh.visible = true;
  }


  setHidden() {
    this.mesh.visible = false;
  }


  setPosition(x: number, y: number, z: number) {
    this.mesh.position.x = x + this.voxel.size / 2;
    this.mesh.position.y = y + (this.voxel.height / 2);
    this.mesh.position.z = z + (this.voxel.width / 2);
  }


  update() {
    if (!this.mesh.visible) {return;}
    // tslint:disable-next-line:no-non-null-assertion
    this.materials.side!.uniforms.uTime.value = this.time.elapsed;
  }


  setDebug() {
    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder = this.debug.ui!.addFolder('SelectionVoxel');
    const side = this.debugFolder.addFolder('Sides');
    const bottom = this.debugFolder.addFolder('Bottom');
    const tmp = {
      sideColor: '#ffee9c',
      bottomColor: '#ffee9c'
    };

    // Side
    side
      .addColor(tmp, 'sideColor')
      .name('Color')
      .onChange(() => {
        // tslint:disable-next-line:no-non-null-assertion
        this.materials.side!.uniforms.uColor.value.set(tmp.sideColor);
      });

    side
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.side!.uniforms.uPointSize, 'value')
      .name('Point Size')
      .min(0)
      .max(10)
      .step(.001);

    side
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.side!.uniforms.uResolution.value, 'x')
      .name('Res x')
      .min(0)
      .max(3)
      .step(.001);

    side
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.side!.uniforms.uResolution.value, 'y')
      .name('Res Y')
      .min(0)
      .max(3)
      .step(.001);

    side
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.side!.uniforms.uTransparency, 'value')
      .name('Transparency')
      .min(0)
      .max(1)
      .step(.001);

    side
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.side!.uniforms.uSpeed, 'value')
      .name('Speed')
      .min(0)
      .max(5)
      .step(.001);

    side
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.side!.uniforms.uWeight, 'value')
      .name('Weight')
      .min(0)
      .max(30)
      .step(.1);

    // Bottom
    bottom
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.bottom!.uniforms.uSize, 'value')
      .name('Size')
      .min(0)
      .max(.5)
      .step(.001);

    bottom
      // tslint:disable-next-line:no-non-null-assertion
      .add(this.materials.bottom!.uniforms.uOpacity, 'value')
      .name('Opacity')
      .min(0)
      .max(1)
      .step(.001);

    bottom
      .addColor(tmp, 'bottomColor')
      .name('Color')
      .onChange(() => {
        // tslint:disable-next-line:no-non-null-assertion
        this.materials.bottom!.uniforms.uColor.value.set(tmp.bottomColor);
      });
  }
}
