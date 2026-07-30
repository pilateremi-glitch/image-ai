/**
 * Game data: technologies, special abilities, and random events
 * Imported by: tech tree, game logic, event system
 */

export const CAMP_LEVELS = [
  {
    level: 1,
    name: 'Camp',
    maxHp: 500,
    cost: null,
    unlocks: []
  },
  {
    level: 2,
    name: 'Refuge',
    maxHp: 900,
    cost: { gold: 600, wood: 200 },
    unlocks: ['TOWER_MACHINE_GUN']
  },
  {
    level: 3,
    name: 'Fort',
    maxHp: 1400,
    cost: { gold: 1200, scrap: 500 },
    unlocks: ['TOWER_SNIPER', 'WALL_REINFORCED']
  },
  {
    level: 4,
    name: 'Base Militaire',
    maxHp: 2200,
    cost: { gold: 2800, scrap: 1000, energy: 100 },
    unlocks: ['TOWER_TESLA', 'TOWER_FLAME', 'SUPPORT_LAB']
  },
  {
    level: 5,
    name: 'Citadelle',
    maxHp: 3800,
    cost: { gold: 6000, scrap: 2500, crystals: 50 },
    unlocks: ['TOWER_LASER', 'WALL_MILITARY']
  },
  {
    level: 6,
    name: 'Méga-Forteresse',
    maxHp: 7000,
    cost: { gold: 12000, scrap: 6000, crystals: 120 },
    unlocks: ['TOWER_PLASMA', 'WALL_TITANIUM']
  },
  {
    level: 7,
    name: 'Bastion Ultime',
    maxHp: 12000,
    cost: { gold: 30000, scrap: 12000, crystals: 300 },
    unlocks: ['WALL_ENERGY']
  }
];

export const TECHNOLOGIES = [
  // Defense branch
  {
    id: 'DEF1',
    name: 'Renforts I',
    branch: 'defense',
    cost: 8,
    effect: 'wallHp',
    val: 0.2,
    desc: 'Murs +20% HP',
    requires: null
  },
  {
    id: 'DEF2',
    name: 'Renforts II',
    branch: 'defense',
    cost: 20,
    effect: 'wallHp',
    val: 0.2,
    desc: 'Murs +40% HP total',
    requires: 'DEF1'
  },
  {
    id: 'DEF3',
    name: 'Auto-Réparation',
    branch: 'defense',
    cost: 40,
    effect: 'autoRepair',
    val: 5,
    desc: 'Murs +5 HP/vague',
    requires: 'DEF2'
  },
  {
    id: 'DEF4',
    name: 'Bouclier Énergie',
    branch: 'defense',
    cost: 60,
    effect: 'shield',
    val: 150,
    desc: 'Bouclier base 150 HP',
    requires: 'DEF3'
  },
  // Weapon branch
  {
    id: 'WEP1',
    name: 'Armement I',
    branch: 'weapon',
    cost: 10,
    effect: 'towerDmg',
    val: 0.15,
    desc: 'Tours +15% dégâts',
    requires: null
  },
  {
    id: 'WEP2',
    name: 'Armement II',
    branch: 'weapon',
    cost: 25,
    effect: 'towerDmg',
    val: 0.15,
    desc: 'Tours +30% dégâts total',
    requires: 'WEP1'
  },
  {
    id: 'WEP3',
    name: 'Armement III',
    branch: 'weapon',
    cost: 50,
    effect: 'towerDmg',
    val: 0.2,
    desc: 'Tours +50% dégâts total',
    requires: 'WEP2'
  },
  {
    id: 'WEP4',
    name: 'Optique',
    branch: 'weapon',
    cost: 18,
    effect: 'towerRange',
    val: 0.25,
    desc: 'Portée +25%',
    requires: null
  },
  {
    id: 'WEP5',
    name: 'Cadence',
    branch: 'weapon',
    cost: 22,
    effect: 'towerRate',
    val: 0.2,
    desc: 'Cadence +20%',
    requires: 'WEP1'
  },
  // Economy branch
  {
    id: 'ECO1',
    name: 'Commerce I',
    branch: 'economy',
    cost: 8,
    effect: 'goldBonus',
    val: 0.15,
    desc: '+15% pièces or',
    requires: null
  },
  {
    id: 'ECO2',
    name: 'Commerce II',
    branch: 'economy',
    cost: 20,
    effect: 'goldBonus',
    val: 0.15,
    desc: '+30% pièces total',
    requires: 'ECO1'
  },
  {
    id: 'ECO3',
    name: 'Ressources',
    branch: 'economy',
    cost: 15,
    effect: 'resBonus',
    val: 0.2,
    desc: '+20% toutes ressources',
    requires: null
  },
  // Survivor branch
  {
    id: 'SUR1',
    name: 'Endurance I',
    branch: 'survivor',
    cost: 12,
    effect: 'baseHp',
    val: 0.2,
    desc: 'Base +20% HP max',
    requires: null
  },
  {
    id: 'SUR2',
    name: 'Endurance II',
    branch: 'survivor',
    cost: 30,
    effect: 'baseHp',
    val: 0.3,
    desc: 'Base +50% HP total',
    requires: 'SUR1'
  }
];

export const SPECIALS_DATA = {
  AIRSTRIKE: {
    name: 'Frappe Aérienne',
    emoji: '✈',
    desc: 'Bombarde 3 rangées',
    cd: 60,
    color: '#ff8800'
  },
  EMP: {
    name: 'Impulsion EMP',
    emoji: '⚡',
    desc: 'Étourdit tous 3 sec',
    cd: 45,
    color: '#00ccff'
  },
  REPAIR: {
    name: 'Réparation',
    emoji: '🔧',
    desc: 'Répare tous murs 80%',
    cd: 30,
    color: '#39ff14'
  },
  BERSERK: {
    name: 'Mode Berserk',
    emoji: '💢',
    desc: 'Tours ×2 vitesse 8 sec',
    cd: 90,
    color: '#ff1744'
  },
  NAPALM: {
    name: 'Napalm',
    emoji: '🔥',
    desc: 'Feu massif 5 sec',
    cd: 75,
    color: '#ff6600'
  }
};

export const RANDOM_EVENTS = [
  {
    id: 'STORM',
    name: 'Tempête',
    desc: 'Tours: -30% portée ce tour',
    effect: 'rangeDebuff',
    val: -0.3
  },
  {
    id: 'FOG',
    name: 'Brouillard',
    desc: 'Vision réduite: -20% portée',
    effect: 'rangeDebuff',
    val: -0.2
  },
  {
    id: 'ACID',
    name: 'Pluie acide',
    desc: 'Murs perdent 10% HP',
    effect: 'wallDamage',
    val: 0.1
  },
  {
    id: 'SUPPLY',
    name: 'Livraison!',
    desc: '+250 or, +80 ferraille',
    effect: 'resources',
    res: { gold: 250, scrap: 80 }
  },
  {
    id: 'MERCHANT',
    name: 'Marchand',
    desc: '-30% coût construction',
    effect: 'buildDiscount',
    val: 0.3
  },
  {
    id: 'HORDE',
    name: 'Super Horde',
    desc: '+50% zombies, ×2 récompenses',
    effect: 'superHorde'
  },
  {
    id: 'FORTUNE',
    name: 'Fortune!',
    desc: 'Double récompenses cette vague',
    effect: 'doubleGold'
  },
  {
    id: 'REPAIR',
    name: 'Réparations',
    desc: 'Tous les murs +30% HP réparés',
    effect: 'repairWalls',
    val: 0.3
  }
];
