/**
 * Technology research and progression system
 * Imported by: game loop, UI, state
 */

import { TECHNOLOGIES } from '../data/game-data.js';
import { canAfford, spendResources } from '../utils/resource.js';

/**
 * Research a technology
 */
export function researchTech(G, techId) {
  const tech = getTechById(techId);
  if (!tech) return false;

  // Check requirements
  if (tech.requires && !G.research[tech.requires]) {
    return false;
  }

  // Check cost
  const cost = { techPoints: tech.cost };
  if (!canAfford(G.resources, cost)) {
    return false;
  }

  // Spend resources
  spendResources(G.resources, cost);

  // Mark as researched
  G.research[techId] = true;

  // Apply effect
  applyTechEffect(G, tech);

  return true;
}

/**
 * Apply technology effect to game state
 */
export function applyTechEffect(G, tech) {
  if (!tech || !tech.effect) return;

  const val = tech.val || 0;

  switch (tech.effect) {
    case 'wallHp':
      // Increase wall max HP
      for (const buildId in G.buildings) {
        const b = G.buildings[buildId];
        if (b && (b.typeId.startsWith('WALL') || b.typeId.startsWith('BLOCK'))) {
          b.maxHp = Math.ceil(b.maxHp * (1 + val));
          b.hp = Math.min(b.hp, b.maxHp);
        }
      }
      break;

    case 'towerDmg':
      // Increase tower damage
      for (const buildId in G.buildings) {
        const b = G.buildings[buildId];
        if (b && b.typeId.startsWith('TOWER')) {
          b.dmg = Math.ceil(b.dmg * (1 + val));
        }
      }
      break;

    case 'towerRange':
      // Increase tower range
      for (const buildId in G.buildings) {
        const b = G.buildings[buildId];
        if (b && b.typeId.startsWith('TOWER') && b.range) {
          b.range *= 1 + val;
        }
      }
      break;

    case 'towerRate':
      // Increase tower fire rate
      for (const buildId in G.buildings) {
        const b = G.buildings[buildId];
        if (b && b.typeId.startsWith('TOWER') && b.rate) {
          b.rate *= 1 + val;
        }
      }
      break;

    case 'goldBonus':
      // Bonus is applied when calculating rewards
      break;

    case 'resBonus':
      // Bonus is applied when calculating rewards
      break;

    case 'baseHp':
      // Increase base max HP
      G.camp.maxHp = Math.ceil(G.camp.maxHp * (1 + val));
      G.camp.hp = Math.min(G.camp.hp, G.camp.maxHp);
      break;

    case 'autoRepair':
      // Auto-repair applies during wave phase
      break;

    case 'shield':
      // Add shield to base
      G.camp.shield = (G.camp.shield || 0) + val;
      break;

    default:
      console.log('Unknown tech effect:', tech.effect);
  }
}

/**
 * Check if technology is researched
 */
export function isTechResearched(G, techId) {
  return G.research[techId] === true;
}

/**
 * Check if technology can be researched
 */
export function canResearchTech(G, techId) {
  const tech = getTechById(techId);
  if (!tech) return false;

  // Already researched
  if (G.research[techId]) return false;

  // Missing prerequisite
  if (tech.requires && !G.research[tech.requires]) return false;

  // Can afford
  const cost = { techPoints: tech.cost };
  return canAfford(G.resources, cost);
}

/**
 * Get technology by ID
 */
export function getTechById(techId) {
  return TECHNOLOGIES.find(t => t.id === techId);
}

/**
 * Get all techs in a branch
 */
export function getTechsByBranch(branch) {
  return TECHNOLOGIES.filter(t => t.branch === branch);
}

/**
 * Get technology bonus multiplier
 */
export function getTechBonus(G, effectType) {
  const bonusMap = {
    wallHp: 1,
    towerDmg: 1,
    towerRange: 1,
    towerRate: 1,
    goldBonus: 1,
    resBonus: 1,
    baseHp: 1
  };

  for (const techId in G.research) {
    const tech = getTechById(techId);
    if (tech && tech.effect === effectType && tech.val) {
      bonusMap[effectType] *= 1 + tech.val;
    }
  }

  return bonusMap[effectType] || 1;
}
