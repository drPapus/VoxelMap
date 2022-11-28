import {
  Color,
  MeshStandardMaterial,
  Mesh,
  PlaneBufferGeometry, Texture,
} from 'three';
import {GUI} from 'dat.gui';

import Main from '../Main';


export default class Sea {
  #main: Main;
  #scene: Main['scene'];
  #resources: Main['resources'];
  #map: Main['map'];
  #debug: Main['debug'];
  #debugFolder?: GUI;
  geometry!: PlaneBufferGeometry;
  textures: Record<string, Texture>;
  material!: MeshStandardMaterial;
  mesh!: Mesh;


  constructor() {
    this.#main = new Main();
    this.#scene = this.#main.scene;
    this.#resources = this.#main.resources;
    this.#debug = this.#main.debug;
    this.#map = this.#main.map;
    this.textures = {};

    this.setMaterial();
    this.setGeometry();
    this.setMesh();
    if (this.#debug.active) {this.setDebug();}
  }


  setGeometry() {
    this.geometry = new PlaneBufferGeometry(
      this.#map.sea.size.width,
      this.#map.sea.size.height,
      this.#map.sea.segmentsQty.width,
      this.#map.sea.segmentsQty.height,
    );
  }


  private async setTextures() {
    this.textures.map =
      await this.#resources.getSource(this.#map.sea.material.texture) as Texture;
    this.textures.normalMap =
      await this.#resources.getSource(this.#map.sea.material.textureNormal) as Texture;
    this.textures.roughnessMap =
      await this.#resources.getSource(this.#map.sea.material.rougMapTexture) as Texture;
    this.textures.displacementMap =
      await this.#resources.getSource(this.#map.sea.material.hightMapTexture) as Texture;
  }

  setMaterial() {
    this.material = new MeshStandardMaterial();
    this.material.displacementScale = this.#map.sea.material.displacementScale;
    this.material.roughness = this.#map.sea.material.roughness;
    this.material.color = new Color(this.#map.sea.color).convertSRGBToLinear();

    (async () => {
      await this.setTextures();
      this.material.map = this.textures.map;
      this.material.normalMap = this.textures.normalMap;
      this.material.roughnessMap = this.textures.roughnessMap;
      this.material.displacementMap = this.textures.displacementMap;
    })();
  }


  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * .5;
    this.mesh.receiveShadow = true;
    this.#scene.add(this.mesh);
  }


  setDebug() {
    this.#debugFolder = (this.#debug.ui as GUI).addFolder('Sea');

    const params = {
      color: this.#map.sea.color
    };

    this.#debugFolder
      .addColor(params, 'color')
      .name('Material Color')
      .onChange(() => {
        this.material.color = new Color(params.color);
      });

    this.#debugFolder
      .add(this.material, 'displacementScale')
      .name('Material Displacement Scale')
      .min(-2)
      .max(2)
      .step(.001);

    this.#debugFolder
      .add(this.material, 'roughness')
      .name('Material Roughness')
      .min(0)
      .max(1)
      .step(.001);

    this.#debugFolder
      .add(this.material, 'wireframe');
  }
}
