/**
 * Hero placement and management
 * Imported by: game loop, UI, combat
 */

import { CELL, COLS, ROWS, BASE_COL, SPAWN_COL } from '../config.js';
import { HERO_TYPES } from '../data/hero-types.js';
import { canAfford, spendResources } from '../utils/resource.js';
import { getNearestZombie, getZombiesInRange } from './combat.js';

/**
 * Check if cell can have hero placed
 */
export function canPlaceHero(G, col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;

  // Can't place on base or spawn columns
  if (col === BASE_COL || col === SPAWN_COL) return false;

  const cell = G.grid[row][col];
  return cell.type === 'empty';
}

/**
 * Place hero on grid
 */
export function placeHero(G, col, row, heroTypeId) {
  if (!canPlaceHero(G, col, row)) return null;

  const heroType = HERO_TYPES[heroTypeId];
  if (!heroType) return null;

  if (!canAfford(G.resources, heroType.cost)) {
    return null;
  }

  spendResources(G.resources, heroType.cost);

  const hero = {
    id: G.heroes.length,
    typeId: heroTypeId,
    col,
    row,
    level: 1,
    hp: 100,
    maxHp: 100,
    cooldown: 0,
    _firing: 0
  };

  G.heroes.push(hero);
  G.grid[row][col].type = 'hero';

  return hero;
}

/**
 * Remove hero from grid
 */
export function removeHero(G, heroId) {
  const hero = G.heroes[heroId];
  if (!hero) return;

  const { col, row } = hero;
  G.heroes.splice(heroId, 1);
  if (G.grid[row] && G.grid[row][col]) {
    G.grid[row][col].type = 'empty';
  }
}

/**
 * Update hero logic
 */
export function updateHero(G, hero, dt) {
  if (!hero) return;

  const heroType = HERO_TYPES[hero.typeId];
  if (!heroType) return;

  // Cooldown
  hero.cooldown = Math.max(0, (hero.cooldown || 0) - dt);
  hero._firing = Math.max(0, (hero._firing || 0) - dt);

  // Attack behavior
  const hx = (hero.col + 0.5) * CELL;
  const hy = (hero.row + 0.5) * CELL;

  // Find target
  const target = getNearestZombie(G, hx, hy, heroType.range || 2);

  if (target && hero.cooldown <= 0 && heroType.dmg) {
    // Attack target
    const dmg = heroType.dmg;
    target.hp -= dmg;

    hero.cooldown = 1 / (heroType.rate || 1);
    hero._firing = 0.2;

    if (target.hp <= 0) {
      // Killed
    }
  }

  // Special hero abilities
  if (heroType.healBase) {
    // Medic healing
    G.camp.hp = Math.min(G.camp.maxHp, G.camp.hp + heroType.healBase * dt);
  }

  if (heroType.aura) {
    // Commander aura - would boost tower rates
  }
}

/**
 * Get all active heroes
 */
export function getActiveHeroes(G) {
  return G.heroes.filter(h => h && h.hp > 0);
}

/**
 * Upgrade hero level
 */
export function upgradeHero(G, heroId) {
  if (heroId < 0 || heroId >= G.heroes.length) return false;

  const hero = G.heroes[heroId];
  if (!hero) return false;

  hero.level += 1;
  hero.maxHp = Math.ceil(100 * (1 + (hero.level - 1) * 0.2));
  hero.hp = hero.maxHp;

  return true;
}

/**
 * Damage hero
 */
export function damageHero(G, heroId, amount) {
  if (heroId < 0 || heroId >= G.heroes.length) return;

  const hero = G.heroes[heroId];
  if (!hero) return;

  hero.hp = Math.max(0, hero.hp - amount);

  if (hero.hp <= 0) {
    removeHero(G, heroId);
  }
}
