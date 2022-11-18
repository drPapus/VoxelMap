import {Line3, Vector2, Vector3} from 'three';
import {ContinentInterface} from '../../@types/Continent';
import geography from '../../../mocks/zones.json';
import {TilesType, TilePositionType, PeakLevelsType} from '../../@types/Map';
import {ConfigInterface} from '../../@types/ConfigInterface';
import {lerp, randInt, clamp} from 'three/src/math/MathUtils';
import {Line2} from "three/examples/jsm/lines/Line2";


type ContinentBoxType = {
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
};


export const DEFAULT_START_POSITION = 32760;


export function getGeography(): ContinentInterface[] {
  return geography.map(({id, name, positions}) => {
    const tiles: Uint32Array = new Uint32Array(positions.length);
    const continentBox: ContinentBoxType = {
      minX: 0,
      maxX: 0,
      minZ: 0,
      maxZ: 0,
    };

    for (let i = 0; i < positions.length; i++) {
      const position = Number(positions[i]);
      const coordinates = getCoordinates(position);
      if (coordinates.x < continentBox.minX) {continentBox.minX = coordinates.x;}
      if (coordinates.x > continentBox.maxX) {continentBox.maxX = coordinates.x;}
      if (coordinates.z < continentBox.minZ) {continentBox.minZ = coordinates.z;}
      if (coordinates.z > continentBox.maxZ) {continentBox.maxZ = coordinates.z;}
      tiles[i] = position;
    }

    return {
      id: String(id),
      name,
      status: 'active' as ContinentInterface['status'],
      landscape: {
        tiles,
        peakLevels: getTilesLevel(continentBox, tiles)
      }
    };
  });
}


export function getCoordinates(position: number): TilePositionType {
  return {
    // tslint:disable-next-line:no-bitwise
    x: (position & 0xffff) - DEFAULT_START_POSITION,
    // tslint:disable-next-line:no-bitwise
    z: (position >>> 16) - DEFAULT_START_POSITION
  };
}


export function get32BitPosition(position: TilePositionType): number {
  return (position.z + DEFAULT_START_POSITION)
    * Math.pow(2, 16)
    + (position.x + DEFAULT_START_POSITION);
}


export function isNeighborTile(
  tiles: TilesType,
  peakLevels: PeakLevelsType,
  position: TilePositionType
): boolean {
  if (typeof position.y !== 'number') {throw new Error('Y doesn\'t exists');}
  const position32Bit = get32BitPosition(position);
  return tiles.includes(position32Bit)
    && (
      position.y > 0
      && position.y <= peakLevels[tiles.indexOf(position32Bit)]
    );
}


export function getVertexPositionForBufferAttributes(
  voxel: ConfigInterface['world']['voxel'],
  vertexStartPosition: {x: number, y: number, z: number},
  tilePosition: {x: number, y: number, z: number}
): [number, number, number] {
  return [
    vertexStartPosition.x + tilePosition.x * voxel.height - (tilePosition.x * voxel.size / 2),
    vertexStartPosition.y + tilePosition.y * voxel.depth,
    vertexStartPosition.z - tilePosition.z * voxel.width
      + (tilePosition.x % 2 * (voxel.width / 2))
      * (tilePosition.x > 0 ? -1 : 1), // fix voxel displacement when positive X
  ];
}


export function getTilesLevel(
  continentBox: ContinentBoxType,
  tiles: TilesType
): PeakLevelsType {
  const levels: PeakLevelsType = new Uint8Array(tiles.length);
  const width = new Vector2(continentBox.minX, 0).distanceTo(new Vector2(continentBox.maxX, 0));
  const height = new Vector2(continentBox.minZ, 0).distanceTo(new Vector2(continentBox.maxZ, 0));

  for (const [index, position] of tiles.entries()) {
    const {x, z} = getCoordinates(position);

   // const tmp = 4
    const tmp = Math.abs(Math.ceil(
      Math.sin(
      Math.sin(clamp(x, continentBox.minX, continentBox.maxX) / width) *
        Math.sin(clamp(z, continentBox.minZ, continentBox.maxZ) / height)
      ) * 4
    ));
    // const tmp = Math.ceil(Math.abs(Math.sin(
    //   (clamp(x, continentBox.minX, continentBox.maxX))
    //   * (clamp(z, continentBox.minZ, continentBox.maxZ))
    // ) * 4));
    // const tmp = Math.ceil(
    //   Math.abs(Math.sin(clamp(x, continentBox.minX, continentBox.maxX) / width) * 4) *
    //   Math.abs(Math.sin(clamp(z, continentBox.minZ, continentBox.maxZ) / height) * 4)
    // );
      // (Math.abs(Math.sin(clamp(x, continentBox.minX, continentBox.maxX))) * 4
      //   + Math.abs(Math.sin(clamp(z, continentBox.minZ, continentBox.maxZ))) * 4
      // ) / 2);
    console.log({x, z},clamp(x, continentBox.minX, continentBox.maxX), continentBox, {width, height}, tmp);
    levels[index] = tmp;
  }

  return levels;
}
