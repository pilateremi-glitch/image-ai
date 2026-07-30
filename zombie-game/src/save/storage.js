/**
 * Game save/load to localStorage
 */

const SAVE_KEY = 'zombie_tower_defense_save';
const STATS_KEY = 'zombie_tower_defense_stats';

/**
 * Save game state to localStorage
 */
export function saveGame(G) {
  try {
    const data = JSON.stringify(G);
    localStorage.setItem(SAVE_KEY, data);
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    return false;
  }
}

/**
 * Load game state from localStorage
 */
export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

/**
 * Check if save exists
 */
export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Erase save data
 */
export function eraseSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(STATS_KEY);
    return true;
  } catch (e) {
    console.error('Failed to erase save:', e);
    return false;
  }
}

/**
 * Save game statistics (persistent across games)
 */
export function saveStats(stats) {
  try {
    const data = JSON.stringify(stats);
    localStorage.setItem(STATS_KEY, data);
    return true;
  } catch (e) {
    console.error('Failed to save stats:', e);
    return false;
  }
}

/**
 * Load game statistics
 */
export function loadStats() {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load stats:', e);
    return null;
  }
}

/**
 * Export game data as JSON file
 */
export function exportGame(G) {
  const data = JSON.stringify(G, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `zombie-save-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Import game data from JSON file
 */
export function importGame(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      callback(data);
    } catch (err) {
      console.error('Failed to import game:', err);
      callback(null);
    }
  };
  reader.readAsText(file);
}
