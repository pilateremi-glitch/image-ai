/**
 * Zombie AI and pathfinding logic
 * Imported by: game loop, wave management
 */

import { CELL, BASE_COL, SPAWN_COL, COLS, ROWS } from '../config.js';
import { ZOMBIE_TYPES } from '../data/zombie-types.js';
import { distance } from '../utils/math.js';

/**
 * Update zombie movement and behavior
 */
export function updateZombie(G, zombie, dt) {
  if (zombie.hp <= 0) return;

  // Fade in on spawn
  if (!zombie.spawned) {
    if (!zombie.spawnTime) zombie.spawnTime = Date.now() / 1000;
    const elapsed = Date.now() / 1000 - zombie.spawnTime;
    if (elapsed > 0.4) {
      zombie.spawned = true;
    }
  }

  // Apply poison damage
  if (zombie.poison && zombie.poison > 0) {
    zombie.poison -= dt;
    const dmg = 0.5; // Damage per second from poison
    zombie.hp -= dmg * dt;
  }

  // Apply stun
  if (zombie.stun && zombie.stun > 0) {
    zombie.stun -= dt;
    return; // Don't move while stunned
  }

  // Move toward base
  const targetX = BASE_COL * CELL + CELL / 2;
  const targetY = (ROWS / 2) * CELL;

  const dx = targetX - zombie.px;
  const dy = targetY - zombie.py;
  const dist = distance(zombie.px, zombie.py, targetX, targetY);

  if (dist > 5) {
    const speed = ZOMBIE_TYPES[zombie.typeId]?.speed || 20;
    const spd = (speed * dt) / Math.max(1, dist);

    zombie.vx = dx * spd;
    zombie.vy = dy * spd;

    zombie.px += zombie.vx;
    zombie.py += zombie.vy;
  } else {
    // Reached base - deal damage
    G.camp.hp -= (ZOMBIE_TYPES[zombie.typeId]?.dmgPerSec || 1) * dt;
    zombie.attackTimer = 0.2;
  }

  // Keep zombie in bounds
  zombie.px = Math.max(CELL / 2, Math.min(zombie.px, (SPAWN_COL - 0.5) * CELL));
  zombie.py = Math.max(CELL / 2, Math.min(zombie.py, (ROWS - 0.5) * CELL));
}

/**
 * Check if zombie reached base
 */
export function zombieReachedBase(zombie) {
  const zt = ZOMBIE_TYPES[zombie.typeId];
  return zombie.px < CELL * 2 && zt && zombie.hp > 0;
}

/**
 * Get all active zombies
 */
export function getActiveZombies(G) {
  const active = [];
  for (const zId in G.zombies) {
    const z = G.zombies[zId];
    if (z && z.hp > 0) {
      active.push(z);
    }
  }
  return active;
}

/**
 * Get zombies by type
 */
export function getZombiesByType(G, typeId) {
  const result = [];
  for (const zId in G.zombies) {
    const z = G.zombies[zId];
    if (z && z.typeId === typeId && z.hp > 0) {
      result.push(z);
    }
  }
  return result;
}

/**
 * Apply slow effect to zombie
 */
export function applySlowToZombie(G, zombieId, slowFactor) {
  const zombie = G.zombies[zombieId];
  if (!zombie) return;

  zombie.slowFactor = Math.min(zombie.slowFactor || 1, slowFactor);
  zombie.slowTimer = Math.max(zombie.slowTimer || 0, 3);
}

/**
 * Apply stun to zombie
 */
export function applyStunToZombie(G, zombieId, duration) {
  const zombie = G.zombies[zombieId];
  if (!zombie) return;

  zombie.stun = Math.max(zombie.stun || 0, duration);
}

/**
 * Calculate zombie effective speed with modifiers
 */
export function getZombieEffectiveSpeed(zombie, eventModifiers = {}) {
  let speed = ZOMBIE_TYPES[zombie.typeId]?.speed || 20;

  if (zombie.slowFactor !== undefined) {
    speed *= zombie.slowFactor;
  }

  if (zombie.slowTimer && zombie.slowTimer > 0) {
    speed *= 0.5; // 50% slow
  }

  return speed;
}

/**
 * Get zombie danger level (how close to reaching base)
 */
export function getZombieDangerLevel(zombie) {
  // Danger based on how close to base (left side of map at x=0)
  return Math.max(0, 1 - zombie.px / (20 * CELL));
}
