import {SourceInterface, SourceKey} from '../../@types/Source';
import {woodTextureRepeat} from './FirstMap';

const mapsPath = 'static/map';
const mapFolder = '/first_map';
const mapPath = `${mapsPath}${mapFolder}`;

const Sources: Record<SourceKey, SourceInterface> = {
  // EnvMap
  environmentMapTexture: {
    type: 'envMapTexture',
    path: `${mapsPath}/common/envmap.hdr`
  },

  // Textures
  // flameBaseColorTexture: {
  //   type: 'texture',
  //   path: `${mapsPath}/common/flame.png`
  // },
  woodBaseColorTexture: {
    type: 'texture',
    path: `${mapPath}/wood/compressed/wood.jpg`,
    repeat: woodTextureRepeat,
  },
  // {
  //   name: 'testTexture',
  //   type: 'texture',
  //   path: `static/debug/test.jpg`
  // },
  woodNormalTexture: {
    type: 'texture',
    path: `${mapPath}/wood/compressed/wood_normal.png`,
    repeat: woodTextureRepeat,
  },
  woodRougMapTexture: {
    type: 'texture',
    path: `${mapPath}/wood/compressed/wood_roughness.jpg`,
    repeat: woodTextureRepeat,
  },
  woodHightMapTexture: {
    type: 'texture',
    path: `${mapPath}/wood/compressed/wood_hight.jpg`,
    repeat: woodTextureRepeat,
  },

  // Models
  treeGlb: {
    type: 'glb',
    path: `${mapPath}/tree_default.glb`
  },
  mountainGlb: {
    type: 'glb',
    path: `${mapPath}/compressed/mountain_default.glb`
  },
  // Army
  armyBattle: {
    type: 'glb',
    path: `${mapPath}/army/battle.glb`
  },
  armyTent: {
    type: 'glb',
    path: `${mapPath}/army/tent.glb`
  },
  // Goddesses
  goddess1: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_1.glb`
  },
  goddess2: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_2.glb`
  },
  goddess3: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_3.glb`
  },
  goddess4: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_4.glb`
  },
  goddess5: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_5.glb`
  },
  goddess6: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_6.glb`
  },
  goddess7: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_7.glb`
  },
  goddess8: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_8.glb`
  },
  goddess9: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_9.glb`
  },
  goddess10: {
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_10.glb`
  },
  // {
  //   name: 'settlementDefault',
  //   type: 'glb',
  //   path: `${mapPath}/settlements/settlement_default.glb`
  // },
  // {
  //   name: 'settlementDestroyed',
  //   type: 'glb',
  //   path: `${mapPath}/settlements/settlement_destroyed.glb`
  // },
  // {
  //   name: 'settlement_repaire',
  //   type: 'glb',
  //   path: `${mapPath}/settlements/settlement_repaire.glb`
  // },
  // {
  //   name: 'settlementSieged',
  //   type: 'glb',
  //   path: `${mapPath}/settlements/settlement_sieged.glb`
  // },
};

export default Sources;
