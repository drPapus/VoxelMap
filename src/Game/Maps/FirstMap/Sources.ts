import {SourceInterface} from '../../@types/SourceInterface';

const mapsPath = 'static/map';
const mapFolder = '/first_map';
const mapPath = `${mapsPath}${mapFolder}`;

const Sources: SourceInterface[] = [
  // EnvMap
  {
    name: 'environmentMapTexture',
    type: 'envMapTexture',
    path: `${mapsPath}/common/envmap.hdr`
  },

  // Textures
  {
    name: 'flameBaseColorTexture',
    type: 'texture',
    path: `${mapsPath}/common/flame.png`
  },
  {
    name: 'woodBaseColorTexture',
    type: 'texture',
    path: `${mapPath}/wood_basecolor.jpg`
  },
  // {
  //   name: 'testTexture',
  //   type: 'texture',
  //   path: `static/debug/test.jpg`
  // },
  {
    name: 'woodNormalTexture',
    type: 'texture',
    path: `${mapPath}/wood_normal.png`
  },
  {
    name: 'woodRougMapTexture',
    type: 'texture',
    path: `${mapPath}/wood_roughness.jpg`
  },
  {
    name: 'woodHightMapTexture',
    type: 'texture',
    path: `${mapPath}/wood_hight.jpg`
  },

  // Models
  {
    name: 'treeGlb',
    type: 'glb',
    path: `${mapPath}/tree_default.glb`
  },
  {
    name: 'mountainGlb',
    type: 'glb',
    path: `${mapPath}/mountain_default.glb`
  },
  // {
  //   name: 'armyBattle',
  //   type: 'glb',
  //   path: `${mapPath}/army/battle.glb`
  // },
  // {
  //   name: 'armyTent',
  //   type: 'glb',
  //   path: `${mapPath}/army/tent.glb`
  // },
  {
    name: 'goddess1',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_1.glb`
  },
  {
    name: 'goddess2',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_2.glb`
  },
  {
    name: 'goddess3',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_3.glb`
  },
  {
    name: 'goddess4',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_4.glb`
  },
  {
    name: 'goddess5',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_5.glb`
  },
  {
    name: 'goddess6',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_6.glb`
  },
  {
    name: 'goddess7',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_7.glb`
  },
  {
    name: 'goddess8',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_8.glb`
  },
  {
    name: 'goddess9',
    type: 'glb',
    path: `${mapPath}/goddess/goddess_stage_9.glb`
  },
  {
    name: 'goddess10',
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
];

export default Sources;
