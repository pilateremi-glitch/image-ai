/**
 * Building type definitions (walls, towers, traps, support)
 * Imported by: building logic, rendering, UI
 */

export const BUILDING_TYPES = {
  // WALLS
  WALL_WOOD: {
    id: 'WALL_WOOD',
    name: 'Clôture bois',
    type: 'wall',
    hp: 60,
    cost: { gold: 20, wood: 30 },
    color: '#7a4a1a',
    emoji: '🌲',
    desc: 'Défense basique en bois'
  },
  WALL_STONE: {
    id: 'WALL_STONE',
    name: 'Mur pierre',
    type: 'wall',
    hp: 180,
    cost: { gold: 60, scrap: 30 },
    color: '#7a7a7a',
    emoji: '🪨',
    desc: 'Mur solide en pierre'
  },
  WALL_REINFORCED: {
    id: 'WALL_REINFORCED',
    name: 'Mur blindé',
    type: 'wall',
    hp: 450,
    cost: { gold: 180, scrap: 90 },
    color: '#4a6a4a',
    emoji: '🔩',
    desc: 'Mur blindé résistant',
    campRequired: 3
  },
  WALL_MILITARY: {
    id: 'WALL_MILITARY',
    name: 'Mur militaire',
    type: 'wall',
    hp: 900,
    cost: { gold: 350, scrap: 180, energy: 10 },
    color: '#2a4a4a',
    emoji: '🏗',
    desc: 'Mur militaire anti-boss',
    campRequired: 5
  },
  WALL_TITANIUM: {
    id: 'WALL_TITANIUM',
    name: 'Mur titanium',
    type: 'wall',
    hp: 2000,
    cost: { gold: 800, scrap: 400, crystals: 10 },
    color: '#4a4a6a',
    emoji: '🔷',
    desc: 'Résistance extrême',
    campRequired: 6
  },
  WALL_ENERGY: {
    id: 'WALL_ENERGY',
    name: 'Mur énergétique',
    type: 'wall',
    hp: 3500,
    cost: { gold: 2000, energy: 200, crystals: 30 },
    color: '#2a6aaa',
    emoji: '🌀',
    desc: "Mur d'énergie pur",
    campRequired: 7
  },

  // TOWERS
  TOWER_ARCHER: {
    id: 'TOWER_ARCHER',
    name: 'Tour Archers',
    type: 'tower',
    hp: 80,
    dmg: 28,
    range: 3.5,
    rate: 2,
    cost: { gold: 100, wood: 50 },
    color: '#7a6014',
    emoji: '🏹',
    desc: 'Tour basique, flèches rapides'
  },
  TOWER_MACHINE_GUN: {
    id: 'TOWER_MACHINE_GUN',
    name: 'Mitrailleuse',
    type: 'tower',
    hp: 120,
    dmg: 18,
    range: 4,
    rate: 5,
    cost: { gold: 200, scrap: 100 },
    color: '#4a4a7a',
    emoji: '🔫',
    desc: 'Cadence élevée',
    campRequired: 2
  },
  TOWER_SNIPER: {
    id: 'TOWER_SNIPER',
    name: 'Sniper',
    type: 'tower',
    hp: 80,
    dmg: 160,
    range: 8,
    rate: 0.7,
    cost: { gold: 320, scrap: 160 },
    color: '#2a4a2a',
    emoji: '🎯',
    desc: 'Longue portée, fort dégât',
    campRequired: 3
  },
  TOWER_FLAME: {
    id: 'TOWER_FLAME',
    name: 'Lance-flammes',
    type: 'tower',
    hp: 100,
    dmg: 45,
    range: 2.5,
    rate: 2.5,
    cost: { gold: 280, energy: 35 },
    aoe: true,
    color: '#8a2a00',
    emoji: '🔥',
    desc: 'Dégâts de zone',
    campRequired: 4
  },
  TOWER_TESLA: {
    id: 'TOWER_TESLA',
    name: 'Tour Tesla',
    type: 'tower',
    hp: 110,
    dmg: 80,
    range: 3.5,
    rate: 1.2,
    cost: { gold: 450, energy: 60, crystals: 5 },
    chain: 3,
    color: '#4a4aaa',
    emoji: '⚡',
    desc: 'Chaîne éclair ×3',
    campRequired: 4
  },
  TOWER_LASER: {
    id: 'TOWER_LASER',
    name: 'Tour Laser',
    type: 'tower',
    hp: 90,
    dmg: 280,
    range: 10,
    rate: 0.4,
    cost: { gold: 550, energy: 90, crystals: 12 },
    color: '#aa2222',
    emoji: '🔴',
    desc: 'Très longue portée',
    campRequired: 5
  },
  TOWER_PLASMA: {
    id: 'TOWER_PLASMA',
    name: 'Canon Plasma',
    type: 'tower',
    hp: 150,
    dmg: 600,
    range: 5,
    rate: 0.25,
    cost: { gold: 1200, energy: 180, crystals: 30 },
    aoe: true,
    color: '#aa44aa',
    emoji: '🌟',
    desc: 'Dégâts massifs zone',
    campRequired: 6
  },
  TOWER_CANNON: {
    id: 'TOWER_CANNON',
    name: 'Canon Boulet',
    type: 'tower',
    hp: 130,
    dmg: 320,
    range: 4.5,
    rate: 0.45,
    cost: { gold: 420, scrap: 160 },
    aoe: true,
    color: '#8a6a2a',
    emoji: '💥',
    desc: 'Boulet explosif, AoE puissant',
    campRequired: 3
  },
  TOWER_ICE: {
    id: 'TOWER_ICE',
    name: 'Tour de Glace',
    type: 'tower',
    hp: 90,
    dmg: 20,
    range: 3.5,
    rate: 1.8,
    cost: { gold: 380, energy: 50, crystals: 3 },
    slow: 1.5,
    color: '#4aaacc',
    emoji: '❄',
    desc: 'Gèle les zombies en zone',
    campRequired: 3
  },
  TOWER_MORTAR: {
    id: 'TOWER_MORTAR',
    name: 'Mortier',
    type: 'tower',
    hp: 110,
    dmg: 220,
    range: 8,
    rate: 0.3,
    cost: { gold: 650, scrap: 200, energy: 40 },
    aoe: true,
    color: '#6a5a2a',
    emoji: '💣',
    desc: 'Artillerie longue portée AoE',
    campRequired: 5
  },
  TOWER_RAILGUN: {
    id: 'TOWER_RAILGUN',
    name: 'Railgun',
    type: 'tower',
    hp: 100,
    dmg: 550,
    range: 14,
    rate: 0.25,
    cost: { gold: 900, energy: 140, crystals: 18 },
    pierce: true,
    color: '#2a8aaa',
    emoji: '⚡',
    desc: 'Perce tous les zombies en ligne',
    campRequired: 6
  },

  // TRAPS
  TRAP_BARBED: {
    id: 'TRAP_BARBED',
    name: 'Barbelés',
    type: 'trap',
    hp: 40,
    dmg: 4,
    cost: { gold: 35, scrap: 20 },
    slow: 0.5,
    color: '#5a3a1a',
    emoji: '🔗',
    desc: 'Ralentit +blesse zombies'
  },
  TRAP_MINE: {
    id: 'TRAP_MINE',
    name: 'Mine',
    type: 'trap',
    hp: 5,
    dmg: 180,
    cost: { gold: 60, scrap: 35 },
    aoe: true,
    oneShot: true,
    color: '#3a3a1a',
    emoji: '💣',
    desc: 'Explose au contact (usage unique)'
  },
  TRAP_ELECTRIC: {
    id: 'TRAP_ELECTRIC',
    name: 'Piège électr.',
    type: 'trap',
    hp: 50,
    dmg: 35,
    cost: { gold: 80, energy: 25 },
    stun: 2,
    color: '#2a3a9a',
    emoji: '⚡',
    desc: 'Choc + étourdissement 2s'
  },

  // SUPPORT
  SUPPORT_GENERATOR: {
    id: 'SUPPORT_GENERATOR',
    name: 'Générateur',
    type: 'support',
    hp: 70,
    cost: { gold: 250, scrap: 120 },
    energyPerWave: 35,
    color: '#4a6a2a',
    emoji: '⚙️',
    desc: '+35 énergie / vague'
  },
  SUPPORT_HOSPITAL: {
    id: 'SUPPORT_HOSPITAL',
    name: 'Hôpital',
    type: 'support',
    hp: 80,
    cost: { gold: 350, wood: 120 },
    healPerWave: 60,
    color: '#aa2a2a',
    emoji: '🏥',
    desc: 'Répare 60 HP base/vague'
  },
  SUPPORT_LAB: {
    id: 'SUPPORT_LAB',
    name: 'Laboratoire',
    type: 'support',
    hp: 60,
    cost: { gold: 450, scrap: 180, crystals: 5 },
    techPerWave: 6,
    color: '#2a6aaa',
    emoji: '🔬',
    desc: '+6 points tech / vague',
    campRequired: 2
  },

  // PROTECTION BLOCKS (cheap deployable shields)
  BLOCK_SANDBAG: {
    id: 'BLOCK_SANDBAG',
    name: 'Sac de sable',
    type: 'wall',
    hp: 120,
    cost: { gold: 15, wood: 20 },
    color: '#8a6a2a',
    emoji: '🪜',
    desc: 'Barricade rapide en sable. Très bon marché !'
  },
  BLOCK_CONCRETE: {
    id: 'BLOCK_CONCRETE',
    name: 'Blocs béton',
    type: 'wall',
    hp: 300,
    cost: { gold: 40, scrap: 25 },
    color: '#7a7a7a',
    emoji: '🧱',
    desc: 'Bloc béton résistant'
  },
  BLOCK_STEEL: {
    id: 'BLOCK_STEEL',
    name: 'Plaque acier',
    type: 'wall',
    hp: 700,
    cost: { gold: 90, scrap: 60 },
    color: '#5a7aaa',
    emoji: '🔩',
    desc: 'Plaque acier. Bon rapport qualité-prix',
    campRequired: 2
  },
  BLOCK_BUNKER: {
    id: 'BLOCK_BUNKER',
    name: 'Bunker blindé',
    type: 'wall',
    hp: 1600,
    cost: { gold: 200, scrap: 120, energy: 15 },
    color: '#2a4a2a',
    emoji: '🏛',
    desc: 'Bunker très résistant',
    campRequired: 4
  }
};
