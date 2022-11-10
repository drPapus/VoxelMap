import {
  Color,
  MeshStandardMaterial,
  Mesh,
  PlaneBufferGeometry,
} from 'three';
import {GUI} from 'dat.gui';

import Main from '../Main';


export default class Sea {
  main: Main;
  scene: Main['scene'];
  resources: Main['resources'];
  map: Main['map'];
  debug: Main['debug'];
  debugFolder?: GUI;
  geometry!: PlaneBufferGeometry;
  textures!: Record<string, any>;
  material!: MeshStandardMaterial;
  mesh!: Mesh;


  constructor() {
    this.main = new Main();
    this.scene = this.main.scene;
    this.resources = this.main.resources;
    this.debug = this.main.debug;
    this.map = this.main.map;

    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
    if (this.debug.active) {this.setDebug();}
  }


  setGeometry() {
    this.geometry = new PlaneBufferGeometry(
      this.map.sea.size.width,
      this.map.sea.size.height,
      this.map.sea.segmentsQty.width,
      this.map.sea.segmentsQty.height,
    );
  }


  setTextures() {
    this.textures = {};
    // this.textures.test = this.resources.items.testTexture
    this.textures.map = this.resources.items.woodBaseColorTexture;
    this.textures.normalMap = this.resources.items.woodNormalTexture;
    this.textures.roughnessMap = this.resources.items.woodRougMapTexture;
    this.textures.displacementMap = this.resources.items.woodHightMapTexture;
  }


  setMaterial() {
    this.material = new MeshStandardMaterial();
    this.material.map = this.textures.map;
    this.material.normalMap = this.textures.normalMap;
    this.material.roughnessMap = this.textures.roughnessMap;
    this.material.displacementMap = this.textures.displacementMap;
    this.material.displacementScale = this.map.sea.material.displacementScale;
    this.material.roughness = this.map.sea.material.roughness;
    this.material.color = new Color(this.map.sea.color);
  }


  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * .5;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }


  setDebug() {
    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder = this.debug.ui!.addFolder('Sea');

    const params = {
      color: this.map.sea.color
    };

    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder!
      .addColor(params, 'color')
      .name('Material Color')
      .onChange(() => {
        this.material.color = new Color(params.color);
      });

    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder!
      .add(this.material, 'displacementScale')
      .name('Material Displacement Scale')
      .min(-2)
      .max(2)
      .step(.001);

    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder!
      .add(this.material, 'roughness')
      .name('Material Roughness')
      .min(0)
      .max(1)
      .step(.001);

    // tslint:disable-next-line:no-non-null-assertion
    this.debugFolder!
      .add(this.material, 'wireframe');
  }
}
