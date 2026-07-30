/**
 * Mobile unit (troops) type definitions
 * Imported by: troop placement, rendering, combat
 */

export const MOBILE_UNITS = {
  INFANTRY: {
    id: 'INFANTRY',
    name: 'Fantassin',
    emoji: '💂',
    cost: { gold: 80 },
    hp: 150,
    speed: 38,
    dmg: 28,
    range: 1.3,
    rate: 1.5,
    color: '#2a5a2a',
    desc: 'Soldat de mêlée rapide'
  },
  RANGER: {
    id: 'RANGER',
    name: 'Ranger',
    emoji: '🏹',
    cost: { gold: 130 },
    hp: 90,
    speed: 32,
    dmg: 45,
    range: 3.5,
    rate: 0.9,
    color: '#5a3a1a',
    desc: 'Attaquant à distance',
    ranged: true
  },
  MEDIC_U: {
    id: 'MEDIC_U',
    name: 'Médecin',
    emoji: '💉',
    cost: { gold: 110 },
    hp: 80,
    speed: 30,
    dmg: 0,
    range: 0,
    rate: 0,
    color: '#cccccc',
    desc: 'Soigne troupes alliées',
    healer: true,
    healRange: 2.8,
    healAmt: 25
  },
  TANK_U: {
    id: 'TANK_U',
    name: 'Blindé',
    emoji: '🚗',
    cost: { gold: 280, scrap: 80 },
    hp: 600,
    speed: 20,
    dmg: 70,
    range: 1.6,
    rate: 0.7,
    color: '#5a5a5a',
    desc: 'Unité lourde résistante'
  },
  COMMANDO: {
    id: 'COMMANDO',
    name: 'Commando',
    emoji: '🗡',
    cost: { gold: 210 },
    hp: 100,
    speed: 70,
    dmg: 55,
    range: 1.6,
    rate: 1.2,
    color: '#3a1a4a',
    desc: 'Rapide et mortel'
  },
  ROCKET: {
    id: 'ROCKET',
    name: 'Rocketier',
    emoji: '🚀',
    cost: { gold: 350, scrap: 100 },
    hp: 80,
    speed: 25,
    dmg: 180,
    range: 4,
    rate: 0.4,
    color: '#8a2a00',
    desc: 'Lance-roquettes AoE',
    ranged: true,
    aoe: true
  },
  ENGINEER_AUTO: {
    id: 'ENGINEER_AUTO',
    name: 'Ingénieur',
    emoji: '🔧',
    cost: { gold: 60, scrap: 30 },
    hp: 60,
    speed: 40,
    dmg: 0,
    range: 0,
    rate: 0,
    color: '#cc8800',
    desc: 'Répare murs & tours proches. Peu coûteux!',
    repairer: true,
    repairAmt: 35,
    repairRange: 1.8
  }
};
