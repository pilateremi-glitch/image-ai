/**
 * Hero type definitions for placed heroes
 * Imported by: hero placement, rendering, combat
 */

export const HERO_TYPES = {
  SOLDIER: {
    id: 'SOLDIER',
    name: 'Soldat',
    emoji: '💂',
    cost: { gold: 500 },
    dmg: 30,
    range: 2,
    rate: 1,
    desc: 'Attaques régulières'
  },
  SNIPER: {
    id: 'SNIPER',
    name: 'Sniper',
    emoji: '🎯',
    cost: { gold: 900 },
    dmg: 100,
    range: 7,
    rate: 0.4,
    desc: 'Longue portée précise'
  },
  ENGINEER: {
    id: 'ENGINEER',
    name: 'Ingénieur',
    emoji: '🔧',
    cost: { gold: 700 },
    repair: 20,
    costBonus: -0.2,
    desc: 'Répare défenses, -20% coûts'
  },
  MEDIC: {
    id: 'MEDIC',
    name: 'Médecin',
    emoji: '💉',
    cost: { gold: 700 },
    healBase: 40,
    desc: 'Soigne la base chaque tour'
  },
  PYROMANIAC: {
    id: 'PYROMANIAC',
    name: 'Pyromane',
    emoji: '🔥',
    cost: { gold: 800 },
    dmg: 45,
    range: 2.5,
    rate: 1.5,
    aoe: true,
    desc: 'Attaques de zone'
  },
  GUARD: {
    id: 'GUARD',
    name: 'Garde',
    emoji: '🛡',
    cost: { gold: 900 },
    dmg: 20,
    range: 1.5,
    rate: 1,
    shield: 300,
    desc: 'Bouclier qui absorbe les dégâts'
  },
  CHEMIST: {
    id: 'CHEMIST',
    name: 'Chimiste',
    emoji: '🧪',
    cost: { gold: 850 },
    dmg: 15,
    range: 2.5,
    rate: 1,
    aoe: true,
    poison: true,
    desc: 'Nuage toxique empoisonne zombies'
  },
  COMMANDER: {
    id: 'COMMANDER',
    name: 'Commandant',
    emoji: '🎖',
    cost: { gold: 1200 },
    dmg: 0,
    range: 3.5,
    rate: 0,
    aura: true,
    desc: 'Aura +30% cadence tours alliés'
  }
};
