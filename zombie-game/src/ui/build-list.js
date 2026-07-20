/**
 * Build menu list rendering and management
 */

import { BUILDING_TYPES } from '../data/building-types.js';
import { HERO_TYPES } from '../data/hero-types.js';
import { MOBILE_UNITS } from '../data/mobile-units.js';
import { canAfford } from '../utils/resource.js';
import { resIcon } from '../utils/resource.js';

/**
 * Update the build list for current tab
 */
export function updateBuildList(G) {
  const buildList = document.getElementById('build-list');
  if (!buildList) return;

  buildList.innerHTML = '';

  const tab = G.ui.buildTab || 'walls';

  if (tab === 'walls') {
    renderBuildingCategory(G, buildList, 'wall');
  } else if (tab === 'towers') {
    renderBuildingCategory(G, buildList, 'tower');
  } else if (tab === 'traps') {
    renderBuildingCategory(G, buildList, 'trap');
  } else if (tab === 'support') {
    renderBuildingCategory(G, buildList, 'support');
  } else if (tab === 'heroes') {
    renderHeroesList(G, buildList);
  } else if (tab === 'troops') {
    renderTroopsList(G, buildList);
  }
}

/**
 * Render building category
 */
function renderBuildingCategory(G, container, type) {
  for (const [typeId, buildType] of Object.entries(BUILDING_TYPES)) {
    if (buildType.type !== type) continue;

    const canBuild = canAfford(G.resources, buildType.cost);
    const locked = buildType.campRequired && G.camp.level < buildType.campRequired;

    const item = document.createElement('div');
    item.className = `build-item ${locked ? 'locked' : ''} ${!canBuild ? 'disabled' : ''}`;
    item.dataset.buildType = typeId;

    item.innerHTML = `
      <div class="bi-header">
        <span>${buildType.emoji}</span>
        <span class="bi-name">${buildType.name}</span>
      </div>
      <div class="bi-cost">${formatCost(buildType.cost)}</div>
      <div class="bi-desc">${buildType.desc}</div>
    `;

    item.addEventListener('click', () => {
      // Select this building type
      G.ui.selectedBuild = typeId;
      updateBuildList(G);
    });

    container.appendChild(item);
  }
}

/**
 * Render heroes list
 */
function renderHeroesList(G, container) {
  for (const [typeId, heroType] of Object.entries(HERO_TYPES)) {
    const canAffordHero = canAfford(G.resources, heroType.cost);

    const item = document.createElement('div');
    item.className = `build-item ${!canAffordHero ? 'disabled' : ''}`;
    item.dataset.heroType = typeId;

    item.innerHTML = `
      <div class="bi-header">
        <span>${heroType.emoji}</span>
        <span class="bi-name">${heroType.name}</span>
      </div>
      <div class="bi-cost">${formatCost(heroType.cost)}</div>
      <div class="bi-desc">${heroType.desc}</div>
    `;

    item.addEventListener('click', () => {
      G.ui.selectedBuild = typeId;
      updateBuildList(G);
    });

    container.appendChild(item);
  }
}

/**
 * Render troops list
 */
function renderTroopsList(G, container) {
  for (const [typeId, unit] of Object.entries(MOBILE_UNITS)) {
    const canAffordUnit = canAfford(G.resources, unit.cost);

    const item = document.createElement('div');
    item.className = `build-item ${!canAffordUnit ? 'disabled' : ''}`;
    item.dataset.troopType = typeId;

    item.innerHTML = `
      <div class="bi-header">
        <span>${unit.emoji}</span>
        <span class="bi-name">${unit.name}</span>
      </div>
      <div class="bi-cost">${formatCost(unit.cost)}</div>
      <div class="bi-desc">${unit.desc}</div>
    `;

    item.addEventListener('click', () => {
      G.ui.selectedBuild = typeId;
      updateBuildList(G);
    });

    container.appendChild(item);
  }
}

/**
 * Format cost object for display
 */
function formatCost(cost) {
  if (!cost) return '';

  return Object.entries(cost)
    .map(([res, amount]) => `${resIcon(res)}${amount}`)
    .join(' ');
}
