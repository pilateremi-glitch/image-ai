/**
 * Combat calculations and targeting
 * Imported by: towers, heroes, troops
 */

import { distance } from '../utils/math.js';
import { CELL } from '../config.js';

/**
 * Find all zombies in range of a position
 */
export function getZombiesInRange(G, x, y, range) {
  const rangePx = range * CELL;
  const targets = [];

  for (const zId in G.zombies) {
    const z = G.zombies[zId];
    if (!z || z.hp <= 0 || !z.spawned) continue;

    const dist = distance(z.px, z.py, x, y);
    if (dist <= rangePx) {
      targets.push({ zombie: z, distance: dist });
    }
  }

  return targets;
}

/**
 * Find nearest zombie to a position
 */
export function getNearestZombie(G, x, y, maxRange = Infinity) {
  const rangePx = maxRange * CELL;
  let nearest = null;
  let minDist = Infinity;

  for (const zId in G.zombies) {
    const z = G.zombies[zId];
    if (!z || z.hp <= 0 || !z.spawned) continue;

    const dist = distance(z.px, z.py, x, y);
    if (dist <= rangePx && dist < minDist) {
      minDist = dist;
      nearest = z;
    }
  }

  return nearest;
}

/**
 * Find zombie closest to spawn (most progress toward base)
 */
export function getZombieClosestToBase(G) {
  let closest = null;
  let minDist = Infinity;

  for (const zId in G.zombies) {
    const z = G.zombies[zId];
    if (!z || z.hp <= 0) continue;

    // Zombies progress from right (spawn) to left (base)
    // Lower px = closer to base
    if (z.px < minDist) {
      minDist = z.px;
      closest = z;
    }
  }

  return closest;
}

/**
 * Calculate damage with modifiers
 */
export function calculateDamage(baseDamage, modifiers = {}) {
  let dmg = baseDamage;

  if (modifiers.dmgMult !== undefined) {
    dmg *= modifiers.dmgMult;
  }

  if (modifiers.armor !== undefined) {
    dmg = Math.max(1, dmg - modifiers.armor);
  }

  if (modifiers.berserk) {
    dmg *= 2;
  }

  return Math.ceil(dmg);
}

/**
 * Apply damage to zombie
 */
export function damageZombie(G, zombieId, amount, effects = []) {
  const zombie = G.zombies[zombieId];
  if (!zombie || zombie.hp <= 0) return false;

  zombie.hp -= amount;

  // Apply additional effects
  if (effects.includes('poison')) {
    zombie.poison = (zombie.poison || 0) + 5;
  }
  if (effects.includes('slow')) {
    zombie.slowTimer = Math.max(zombie.slowTimer || 0, 3);
  }
  if (effects.includes('stun')) {
    zombie.stun = Math.max(zombie.stun || 0, 2);
  }

  return zombie.hp <= 0;
}

/**
 * Kill a zombie
 */
export function killZombie(G, zombie) {
  if (!zombie) return;

  zombie.hp = 0;

  // Award resources
  const zt = zombie.typeId; // Will need to import ZOMBIE_TYPES
  const reward = zombie.reward || 10;
  const bonusMultiplier = G.currentEvent?.effect === 'doubleGold' ? 2 : 1;

  G.resources.gold += Math.round(reward * bonusMultiplier);
  G.stats.totalKills += 1;

  // Track kills by type
  G.stats.zombiesKilled[zt] = (G.stats.zombiesKilled[zt] || 0) + 1;
}

/**
 * Apply area damage to all zombies in radius
 */
export function applyAreaDamage(G, cx, cy, radius, damage, effects = []) {
  const radiusPx = radius * CELL;
  let kills = 0;

  for (const zId in G.zombies) {
    const z = G.zombies[zId];
    if (!z || z.hp <= 0 || !z.spawned) continue;

    const dist = distance(z.px, z.py, cx, cy);
    if (dist <= radiusPx) {
      if (damageZombie(G, zId, damage, effects)) {
        killZombie(G, z);
        kills++;
      }
    }
  }

  return kills;
}

/**
 * Check if target is in valid range
 */
export function isInRange(x1, y1, x2, y2, rangeInCells) {
  return distance(x1, y1, x2, y2) <= rangeInCells * CELL;
}
