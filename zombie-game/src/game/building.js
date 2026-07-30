/**
 * Building placement and management
 * Imported by: game loop, UI, state management
 */

import { CELL, COLS, BASE_COL, SPAWN_COL } from '../config.js';
import { BUILDING_TYPES } from '../data/building-types.js';

/**
 * Check if a cell can have a building placed on it
 */
export function canBuild(G, col, row, typeId) {
  if (col < 0 || col >= COLS || row < 0) return false;

  // Prevent building on base column (except base itself)
  if (col === BASE_COL) return false;

  // Prevent building on spawn column (except for certain blocks)
  if (col === SPAWN_COL) return false;

  const cell = G.grid[row][col];
  if (cell.type !== 'empty') return false;

  const buildType = BUILDING_TYPES[typeId];
  if (!buildType) return false;

  // Check camp level requirements
  if (buildType.campRequired && G.camp.level < buildType.campRequired) {
    return false;
  }

  return true;
}

/**
 * Place a building on the grid
 */
export function placeBuilding(G, col, row, typeId) {
  if (!canBuild(G, col, row, typeId)) {
    return null;
  }

  const buildType = BUILDING_TYPES[typeId];
  if (!buildType) return null;

  const buildId = G.nextBuildId++;
  const building = {
    id: buildId,
    typeId,
    col,
    row,
    hp: buildType.hp,
    maxHp: buildType.hp,
    level: 1,
    // Tower-specific
    dmg: buildType.dmg || 0,
    range: buildType.range || 0,
    rate: buildType.rate || 0,
    cooldown: 0,
    lastTarget: null
  };

  G.buildings[buildId] = building;
  G.grid[row][col].type = buildType.type;
  G.grid[row][col].buildingId = buildId;

  return building;
}

/**
 * Remove a building from the grid
 */
export function removeBuilding(G, buildId) {
  const building = G.buildings[buildId];
  if (!building) return;

  const { col, row } = building;
  delete G.buildings[buildId];
  G.grid[row][col].type = 'empty';
  G.grid[row][col].buildingId = null;
}

/**
 * Get building by ID
 */
export function getBuilding(G, buildId) {
  return G.buildings[buildId];
}

/**
 * Get building at grid position
 */
export function getBuildingAt(G, col, row) {
  if (row < 0 || row >= G.grid.length) return null;
  if (col < 0 || col >= G.grid[row].length) return null;

  const buildId = G.grid[row][col].buildingId;
  return buildId ? G.buildings[buildId] : null;
}

/**
 * Damage a building
 */
export function damageBuilding(G, buildId, amount) {
  const building = G.buildings[buildId];
  if (!building) return;

  building.hp = Math.max(0, building.hp - amount);

  if (building.hp <= 0) {
    removeBuilding(G, buildId);
  }
}

/**
 * Repair a building
 */
export function repairBuilding(buildId, amount, G) {
  const building = G.buildings[buildId];
  if (!building) return 0;

  const oldHp = building.hp;
  building.hp = Math.min(building.maxHp, building.hp + amount);
  return building.hp - oldHp;
}

/**
 * Upgrade a building level
 */
export function upgradeBuilding(buildId, G) {
  const building = G.buildings[buildId];
  if (!building) return false;

  const buildType = BUILDING_TYPES[building.typeId];
  if (!buildType) return false;

  // Increase level-based stats
  building.level += 1;
  building.maxHp = Math.round(buildType.hp * (1 + (building.level - 1) * 0.15));
  building.hp = building.maxHp;

  if (buildType.dmg) {
    building.dmg = buildType.dmg * (1 + (building.level - 1) * 0.15);
  }

  if (buildType.range) {
    building.range = buildType.range * (1 + (building.level - 1) * 0.1);
  }

  return true;
}
