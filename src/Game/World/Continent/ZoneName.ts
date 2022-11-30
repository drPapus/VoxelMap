import { ConeGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import Main from '../../Main';
import gentilistFont from 'three/examples/fonts/gentilis_bold.typeface.json'
import { ContinentInterface } from '../../@types/Continent';
import {getCoordinates, getVertexPositionForBufferAttributes} from './MapHelpers';
import getVoxelFaces from './VoxelFaces';


export default class ZoneName {
  #main: Main;
  scene: Main['scene'];
  zoneName: Text;
  mesh!: Mesh;
  geometry!: TextGeometry;
  material!: MeshStandardMaterial;
  font!: Font;
  continent: ContinentInterface;
  #voxel!: Main['config']['world']['voxel'];
  #config: Main['config'];
  coneGeometry!: ConeGeometry;
  coneMaterial!: MeshBasicMaterial;
  
  
  //continentStatus: ContinentInterface['status']
  constructor(continent: ContinentInterface){
    this.#main = new Main();
    this.scene = this.#main.scene;
    this.zoneName = new Text;
    this.continent = continent;


    this.#config = this.#main.config;
    this.#voxel = this.#config.world.voxel;
    this.#voxel.faces = getVoxelFaces(this.#voxel.size, this.#voxel.depth);
    
    this.setCone();
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setCone(){
   // this.coneGeometry = new ConeGeometry( 1, 10, 32 );
    
  }
  
  setGeometry() {
    const nameLand = this.continent.name
    this.font = new Font(gentilistFont) 
    this.geometry = new TextGeometry(nameLand, {
      font:this.font,
      size: 3,
      height: 1,
    })

  }

  setMaterial() {  
    this.material = new MeshStandardMaterial()
    //this.coneMaterial = new MeshBasicMaterial( {color: 0xffff00} );
   
  }

  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    
    for (const occulPos of this.continent.landscape.tiles) {
      const {x, z} =  getCoordinates(Number(occulPos))

      const position = getVertexPositionForBufferAttributes(
                this.#voxel,
                {x: 0, y: 0, z: 0},
                {x: x, y: 0, z: z}
            )
          //  console.log(position)
        this.mesh.castShadow = true
        this.mesh.rotation.x = Math.PI * -.5
        this.mesh.position.y = 5
        this.mesh.position.z = position[0]
        this.mesh.position.x = position[2]
        
        this.scene.add(this.mesh);
      
    }
  }
}


