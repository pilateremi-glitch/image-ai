/**
 * Wave generation and management
 * Imported by: game loop, UI
 */

import { ZOMBIE_TYPES } from '../data/zombie-types.js';
import { SPAWN_COL, ROWS, CELL } from '../config.js';

/**
 * Generate wave zombies for a given wave number
 */
export function generateWave(waveNum) {
  const zombies = [];
  const waveComposition = calculateWaveComposition(waveNum);

  let spawnId = 0;
  for (const [typeId, count] of Object.entries(waveComposition)) {
    for (let i = 0; i < count; i++) {
      const zt = ZOMBIE_TYPES[typeId];
      if (!zt) continue;

      const zombie = {
        id: spawnId++,
        typeId,
        hp: zt.hp,
        maxHp: zt.hp,
        speed: zt.speed,
        px: SPAWN_COL * CELL + 10 + Math.random() * 20,
        py: (2 + Math.random() * (ROWS - 4)) * CELL,
        vx: 0,
        vy: 0,
        reward: zt.reward,
        stun: 0,
        spawned: false,
        spawnTime: undefined,
        phase: Math.random() * Math.PI * 2,
        attackTimer: 0
      };

      zombies.push(zombie);
    }
  }

  return zombies;
}

/**
 * Calculate zombie composition for a wave
 */
export function calculateWaveComposition(waveNum) {
  const composition = {};

  // Base composition: mostly walkers
  composition.WALKER = Math.max(3, waveNum + 2);

  // Add variety as waves progress
  if (waveNum >= 2) {
    composition.RUNNER = Math.max(1, Math.floor(waveNum / 3));
  }
  if (waveNum >= 4) {
    composition.TANK = Math.max(1, Math.floor(waveNum / 5));
  }
  if (waveNum >= 6) {
    composition.TOXIC = Math.max(1, Math.floor((waveNum - 6) / 2));
  }
  if (waveNum >= 8) {
    composition.ARMORED = Math.max(1, Math.floor((waveNum - 8) / 3));
  }
  if (waveNum >= 10) {
    composition.SPIDER = Math.max(1, Math.floor((waveNum - 10) / 4));
  }
  if (waveNum >= 12) {
    composition.BERSERKER = Math.max(1, Math.floor((waveNum - 12) / 3));
  }

  // Boss waves
  if (waveNum > 0 && waveNum % 10 === 0) {
    composition.BOSS_TITAN = 1;
  } else if (waveNum > 0 && waveNum % 15 === 0) {
    composition.BOSS_BEHEMOTH = 1;
  } else if (waveNum > 0 && waveNum % 25 === 0) {
    composition.BOSS_ZOMBIE_KING = 1;
  }

  return composition;
}

/**
 * Calculate wave rewards multiplier
 */
export function getWaveMultiplier(waveNum) {
  return 1 + waveNum * 0.15;
}

/**
 * Check if wave is complete
 */
export function isWaveComplete(G) {
  // Wave is complete if no zombies left
  for (const zId in G.zombies) {
    const z = G.zombies[zId];
    if (z && z.hp > 0) return false;
  }

  // And no more queued to spawn
  return G.wave > 0; // (In real implementation, check spawn queue)
}

/**
 * Get wave info
 */
export function getWaveInfo(waveNum) {
  return {
    waveNum,
    composition: calculateWaveComposition(waveNum),
    multiplier: getWaveMultiplier(waveNum)
  };
}
