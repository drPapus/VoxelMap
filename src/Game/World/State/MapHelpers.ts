import {StateInterface} from '../../@types/State';
import {geography} from '../../../mocks/geography';
import {Tiles} from '../../@types/Map';


export const DEFAULT_START_POSITION = 32760;


export function getGeography(): StateInterface[] {
  return geography.map(({id, name, positions, status}) => {
    const tiles: Uint32Array = new Uint32Array(positions.length);

    for (let i = 0; i < positions.length; i++) {
      tiles[i] = Number(positions[i]);
    }

    return {
      id: String(id),
      name,
      status: status as StateInterface['status'],
      landscape: {
        tiles: tiles
      }
    };
  });
}


export function getCoordinates(position: number): {x: number; z: number } {
  return {
    // tslint:disable-next-line:no-bitwise
    x: (position & 0xffff) - DEFAULT_START_POSITION,
    // tslint:disable-next-line:no-bitwise
    z: (position >>> 16) - DEFAULT_START_POSITION
  };
}


export function getPosition(x: number, z: number): number {
  return (z + DEFAULT_START_POSITION)
    * Math.pow(2, 16)
    + (x + DEFAULT_START_POSITION);
}


export function isNeighborTile(tiles: Tiles, position: {x: number, z: number}): boolean {
  return tiles.includes(getPosition(position.x, position.z));
}


export function getVertexPositionForBufferAttributes(
  voxel: {width: number, height: number, size: number},
  vertexStartPosition: {x: number, y: number, z: number},
  tilePosition: {x: number, y: number, z: number}
): [number, number, number] {
  return [
    vertexStartPosition.x + tilePosition.x * voxel.height - (tilePosition.x * voxel.size / 2),
    vertexStartPosition.y,
    vertexStartPosition.z - tilePosition.z * voxel.width
      + (tilePosition.x % 2 * (voxel.width / 2))
      * (tilePosition.x > 0 ? -1 : 1), // fix voxel displacement when positive X
  ];
}
