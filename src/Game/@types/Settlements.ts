import {BufferGeometry} from 'three';

export type HexMapSettlementsOptionsType = {
  flagGeometry: BufferGeometry;
  showExtraLabels?: boolean;
};

export type HexMapSettlementType = {
  address: string;
  x: number;
  y: number;
  position: number;
  // flag: Flag;
  // state: SettlementState;
  // friendFoeStatus: SettlementFriendStatus;
  armyLabel?: string;
  hpLabel?: string;
  hasSiege?: boolean;
  hasBattle?: boolean;
  // armies?: SettlementArmiesData;
  cultistsSettlement: boolean;
  cultistsStage?: number;
};
