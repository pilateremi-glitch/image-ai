/**
 * Tower upgrade paths (A/B specializations)
 * Imported by: tower upgrades, UI display
 */

export const TOWER_PATHS = {
  TOWER_ARCHER: {
    A: {
      name: '🔥 Flèches de Feu',
      desc: 'Dégâts ×3, empoisonne',
      dmgM: 3,
      poison: true
    },
    B: {
      name: '🌧 Pluie de Flèches',
      desc: 'AoE, portée ×1.6, cadence ×2',
      rateM: 2,
      rangeM: 1.6,
      aoe: true
    }
  },
  TOWER_MACHINE_GUN: {
    A: {
      name: '⚙ Gatling Ultra',
      desc: 'Cadence ×4, dégâts ×0.8',
      rateM: 4,
      dmgM: 0.8
    },
    B: {
      name: '💣 Canon Lourd',
      desc: 'Dégâts ×4, AoE, cadence ×0.4',
      dmgM: 4,
      rateM: 0.4,
      aoe: true
    }
  },
  TOWER_SNIPER: {
    A: {
      name: '⚡ Tir Perçant',
      desc: 'Dégâts ×4, traverse zombies',
      dmgM: 4,
      pierce: true
    },
    B: {
      name: '💥 Obus Explosif',
      desc: 'Dégâts ×2, AoE massive',
      dmgM: 2,
      aoe: true
    }
  },
  TOWER_FLAME: {
    A: {
      name: '🌋 Inferno',
      desc: 'Zone ×2, dégâts ×3',
      dmgM: 3,
      aoeM: 2
    },
    B: {
      name: '❄ Cryo-Lance',
      desc: 'Ralentit ×0.1, dégâts ×2',
      dmgM: 2,
      cryo: true
    }
  },
  TOWER_TESLA: {
    A: {
      name: '⛈ Tempête',
      desc: '×3 chaînes, dégâts ×2',
      chainM: 3,
      dmgM: 2
    },
    B: {
      name: '💫 Surcharge',
      desc: 'Dégâts ×3, stun 2s',
      dmgM: 3,
      stun: 2
    }
  },
  TOWER_LASER: {
    A: {
      name: '☀ Laser Continu',
      desc: 'Dégâts ×0.6 en continu',
      dmgM: 0.6,
      continuous: true
    },
    B: {
      name: '🔺 Prisme',
      desc: '3 faisceaux, dégâts ×0.9',
      dmgM: 0.9,
      prism: true
    }
  },
  TOWER_PLASMA: {
    A: {
      name: '💥 Supernova',
      desc: 'Zone ×3, dégâts ×3',
      dmgM: 3,
      aoeM: 3
    },
    B: {
      name: '🛰 Canon Orbital',
      desc: 'Portée infinie, dégâts ×5',
      dmgM: 5,
      infinite: true
    }
  },
  TOWER_CANNON: {
    A: {
      name: '🔥 Shrapnel',
      desc: 'Éclats: portée ×1.5, dégâts ×2',
      dmgM: 2,
      rangeM: 1.5
    },
    B: {
      name: '💥 Obus Nucléaire',
      desc: 'Zone ×3, dégâts ×3',
      dmgM: 3,
      aoeM: 3
    }
  },
  TOWER_ICE: {
    A: {
      name: '❄ Blizzard',
      desc: 'Zone ×2, ralentit tout',
      aoeM: 2,
      dmgM: 1.5
    },
    B: {
      name: '🧊 Congélation',
      desc: 'Fige 3s, dégâts ×2',
      dmgM: 2,
      stun: 3
    }
  },
  TOWER_MORTAR: {
    A: {
      name: '🔥 Napalm Obus',
      desc: 'Feu persistant 4s, zone ×2',
      dmgM: 1.5,
      aoeM: 2
    },
    B: {
      name: '💥 Volée',
      desc: '×4 bombes, dégâts ×0.6',
      multishot: 4,
      dmgM: 0.6
    }
  },
  TOWER_RAILGUN: {
    A: {
      name: '⚡ Surcharge',
      desc: 'Dégâts ×4, stun 2s',
      dmgM: 4,
      stun: 2
    },
    B: {
      name: '🌀 Canon Orbital',
      desc: 'Portée infinie, dégâts ×6',
      dmgM: 6,
      infinite: true
    }
  }
};
