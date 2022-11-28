import { ConeGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, QuadraticBezierCurve3, TubeGeometry, Vector3 } from 'three';
import Main from '../../Main';
import { ContinentInterface } from '../../@types/Continent';
import { getCoordinates, getVertexPositionForBufferAttributes } from './MapHelpers';
//import getVoxelFaces from './VoxelFaces';


export default class Arrows {
  #main: Main;
  scene: Main['scene'];
  mesh!: Mesh;
  material!: MeshStandardMaterial;
  coneGeometry!: ConeGeometry;
  coneMaterial!: MeshBasicMaterial;
  continent: ContinentInterface;
  
    tube!: TubeGeometry;
    curveQuad!: QuadraticBezierCurve3;
    numPoints!: number;
    start!: Vector3;
    middle!: Vector3;
    end!: Vector3;

  constructor(continent: ContinentInterface){
    this.#main = new Main();
    this.scene = this.#main.scene;
    this.continent = continent;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setCurve(){
    this.numPoints = 100;
    this.start = new Vector3(0, 20, 0);
    this.middle = new Vector3(0, 35, 0);
    this.end = new Vector3(5, 0, -20);
    this.curveQuad = new QuadraticBezierCurve3(this.start, this.middle, this.end);
  }

  setGeometry() {
    //this.geometry = new ConeGeometry( 1, 10, 32 );
    this.tube = new TubeGeometry(this.curveQuad, this.numPoints, 0.05, 10, false);
  }

  setMaterial() {  
    this.material = new MeshStandardMaterial({color: 0xff0000})
   
  }

  setMesh() {
     this.mesh = new Mesh(this.tube, this.material)
     this.mesh.position.y = 5
     this.scene.add(this.mesh)
    }

}



//     this.attributes = {
//         positions: []
//       };

//     for (const points of this.continent.landscape.tiles) {
//         const {x, z} =  getCoordinates(Number(points))
//         this.mesh = new Mesh(this.geometry, this.material);
//         this.scene.add(this.mesh);  


        
//       }

//     // this.mesh = new Mesh(this.geometry, this.material);
//     // this.scene.add(this.mesh);   
//   }