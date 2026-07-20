/**
 * Camp display and upgrade management
 */

import { CAMP_LEVELS } from '../data/game-data.js';
import { canAfford, spendResources } from '../utils/resource.js';

/**
 * Update camp display
 */
export function updateCampDisplay(G) {
  const campNameLbl = document.getElementById('camp-name-lbl');
  const campHpLbl = document.getElementById('camp-hp-lbl');
  const campHpFill = document.getElementById('camp-hp-fill');
  const campUpgradeBtn = document.getElementById('camp-upgrade-btn');

  if (campNameLbl) {
    const currentLevel = CAMP_LEVELS[G.camp.level - 1];
    campNameLbl.textContent = `${currentLevel?.name || 'Camp'} Niv.${G.camp.level}`;
  }

  if (campHpLbl) {
    campHpLbl.textContent = `${Math.ceil(G.camp.hp)} / ${Math.ceil(G.camp.maxHp)} HP`;
  }

  if (campHpFill) {
    const ratio = Math.max(0, G.camp.hp / G.camp.maxHp);
    campHpFill.style.width = (ratio * 100) + '%';
  }

  if (campUpgradeBtn) {
    const nextLevel = CAMP_LEVELS[G.camp.level];
    if (nextLevel) {
      campUpgradeBtn.disabled = !canAfford(G.resources, nextLevel.cost);
    } else {
      campUpgradeBtn.disabled = true;
    }
  }
}

/**
 * Upgrade camp to next level
 */
export function upgradeCamp(G) {
  if (G.camp.level >= CAMP_LEVELS.length) {
    return false;
  }

  const nextLevel = CAMP_LEVELS[G.camp.level];
  if (!nextLevel || !nextLevel.cost) {
    return false;
  }

  if (!canAfford(G.resources, nextLevel.cost)) {
    return false;
  }

  spendResources(G.resources, nextLevel.cost);

  G.camp.level += 1;
  G.camp.maxHp = nextLevel.maxHp;
  G.camp.hp = nextLevel.maxHp;

  // Unlock new buildings
  if (nextLevel.unlocks) {
    for (const buildingId of nextLevel.unlocks) {
      // Mark as unlocked in UI
    }
  }

  updateCampDisplay(G);

  return true;
}

/**
 * Get current camp level info
 */
export function getCampLevel(G) {
  if (G.camp.level < 1 || G.camp.level > CAMP_LEVELS.length) {
    return null;
  }
  return CAMP_LEVELS[G.camp.level - 1];
}

/**
 * Get next camp level info
 */
export function getNextCampLevel(G) {
  if (G.camp.level >= CAMP_LEVELS.length) {
    return null;
  }
  return CAMP_LEVELS[G.camp.level];
}

/**
 * Check if building is unlocked by camp level
 */
export function isBuildingUnlocked(G, buildTypeId, buildingType) {
  if (!buildingType.campRequired) {
    return true;
  }
  return G.camp.level >= buildingType.campRequired;
}
