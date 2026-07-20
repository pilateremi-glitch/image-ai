/**
 * Input handling and building selection
 * Imported by: main game loop
 */

import { CELL, gridFromIso, COLS, ROWS } from '../config.js';
import { BUILDING_TYPES } from '../data/building-types.js';

/**
 * Get grid cell from mouse position
 */
export function getGridFromMouse(mouseX, mouseY) {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();
  const px = mouseX - rect.left;
  const py = mouseY - rect.top;

  return gridFromIso(px, py);
}

/**
 * Select building type for placement
 */
export function selectBuilding(G, typeId) {
  const buildType = BUILDING_TYPES[typeId];
  if (!buildType) return false;

  G.ui.selectedBuild = typeId;
  updateBuildSelection();
  return true;
}

/**
 * Deselect current building
 */
export function deselectBuilding(G) {
  G.ui.selectedBuild = null;
  updateBuildSelection();
}

/**
 * Update build selection UI (highlight)
 */
export function updateBuildSelection() {
  const items = document.querySelectorAll('.build-item');
  for (const item of items) {
    item.classList.remove('selected');
  }

  // Highlight selected item (would need data attribute to track)
}

/**
 * Change building tab
 */
export function changeBuildTab(G, tabName) {
  const validTabs = ['walls', 'towers', 'traps', 'support', 'heroes', 'troops'];
  if (!validTabs.includes(tabName)) return;

  G.ui.buildTab = tabName;

  // Update tab styling
  const tabs = document.querySelectorAll('.build-tab');
  for (const tab of tabs) {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  }
}

/**
 * Set game speed multiplier
 */
export function setGameSpeed(G, speed) {
  const validSpeeds = [1, 2, 4];
  if (!validSpeeds.includes(speed)) return;

  G.ui.gameSpeed = speed;

  // Update button styling
  const buttons = document.querySelectorAll('.speed-btn');
  for (const btn of buttons) {
    if (parseInt(btn.dataset.speed) === speed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
}

/**
 * Toggle sell mode
 */
export function toggleSellMode(G) {
  G.ui.sellMode = !G.ui.sellMode;

  const sellBtn = document.getElementById('sell-btn');
  if (sellBtn) {
    if (G.ui.sellMode) {
      sellBtn.style.background = 'rgba(255, 23, 68, 0.2)';
    } else {
      sellBtn.style.background = '';
    }
  }
}

/**
 * Select cell for info display
 */
export function selectCell(G, col, row) {
  G.ui.selectedCell = { col, row };
  updateCellInfo(G, col, row);
}

/**
 * Update cell info display
 */
export function updateCellInfo(G, col, row) {
  const cellInfoDiv = document.getElementById('cell-info');
  if (!cellInfoDiv) return;

  if (!G.grid[row] || !G.grid[row][col]) {
    cellInfoDiv.innerHTML = '<div class="ci-title">Position invalide</div>';
    return;
  }

  const cell = G.grid[row][col];

  if (cell.buildingId) {
    const building = G.buildings[cell.buildingId];
    if (building) {
      const buildType = BUILDING_TYPES[building.typeId];
      cellInfoDiv.innerHTML = `
        <div class="ci-title">${buildType.name}</div>
        <div class="ci-hp">HP: ${building.hp}/${building.maxHp}</div>
        <div class="ci-hp">Niveau: ${building.level}</div>
      `;
    }
  } else {
    cellInfoDiv.innerHTML = `<div class="ci-title">Cellule vide (${col}, ${row})</div>`;
  }
}
