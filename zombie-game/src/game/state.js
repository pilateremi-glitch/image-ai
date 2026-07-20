/**
 * Game state initialization and management
 * Imported by: main game loop, save/load, UI updates
 */

import { ROWS, COLS } from '../config.js';

/**
 * Create and return a fresh game state
 * @returns {Object} Default game state object
 */
export function defaultState() {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = {
        type: c === 0 ? 'base' : 'empty',
        buildingId: null,
        hp: null,
        maxHp: null
      };
    }
  }

  return {
    resources: {
      gold: 2500,
      scrap: 600,
      wood: 900,
      energy: 120,
      crystals: 25,
      techPoints: 20,
      xp: 0
    },
    camp: {
      level: 1,
      hp: 500,
      maxHp: 500,
      shield: 0
    },
    wave: 0,
    phase: 'build', // 'build' | 'wave' | 'gameover'
    grid,
    buildings: {}, // id -> building obj
    nextBuildId: 1,
    zombies: {}, // id -> zombie obj
    nextZombieId: 1,
    projectiles: [],
    effects: [],
    heroes: [], // placed hero objects
    research: {}, // techId -> true
    currentEvent: null,
    eventModifiers: {},
    stats: {
      totalKills: 0,
      totalWaves: 0,
      totalGold: 0,
      bestWave: 0,
      zombiesKilled: {}
    },
    ui: {
      selectedBuild: null,
      selectedCell: null,
      buildTab: 'walls',
      gameSpeed: 1,
      sellMode: false
    },
    specials: {
      AIRSTRIKE: { cd: 0 },
      EMP: { cd: 0 },
      REPAIR: { cd: 0 },
      BERSERK: { cd: 0 },
      NAPALM: { cd: 0 }
    },
    berserkTimer: 0,
    napalmZones: [],
    troops: [],
    nextTroopId: 1,
    troopLevels: {} // typeId -> level (1 = base, 2+ = upgraded)
  };
}

/**
 * Clone state for save/restore
 */
export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
