/**
 * Resource management utilities
 * Works with game state to manage gold, scrap, wood, etc.
 */

/**
 * Get the emoji icon for a resource type
 */
export function resIcon(type) {
  const icons = {
    gold: '🪙',
    scrap: '⚙️',
    wood: '🌲',
    energy: '⚡',
    crystals: '💎',
    techPoints: '🔬',
    xp: '⭐'
  };
  return icons[type] || '?';
}

/**
 * Get the display color for a resource type
 */
export function resColor(type) {
  const colors = {
    gold: '#ffcc00',
    scrap: '#8a9a8a',
    wood: '#88dd00',
    energy: '#00ccff',
    crystals: '#cc88ff',
    techPoints: '#00eeff',
    xp: '#ffaa00'
  };
  return colors[type] || '#b0c0b0';
}

/**
 * Get formatted label for a resource
 */
export function resLabel(type) {
  const labels = {
    gold: 'Or',
    scrap: 'Ferraille',
    wood: 'Bois',
    energy: 'Énergie',
    crystals: 'Cristaux',
    techPoints: 'Tech',
    xp: 'XP'
  };
  return labels[type] || type;
}

/**
 * Check if game state can afford a cost object
 * @param {Object} resources - current resources object
 * @param {Object} cost - cost object with resource amounts
 */
export function canAfford(resources, cost) {
  if (!cost) return true;
  for (const [res, amount] of Object.entries(cost)) {
    if ((resources[res] || 0) < amount) return false;
  }
  return true;
}

/**
 * Subtract cost from resources
 * @param {Object} resources - current resources object (modified in place)
 * @param {Object} cost - cost object with resource amounts
 */
export function spendResources(resources, cost) {
  if (!cost) return;
  for (const [res, amount] of Object.entries(cost)) {
    resources[res] = (resources[res] || 0) - amount;
  }
}

/**
 * Add resources to the pool
 * @param {Object} resources - current resources object (modified in place)
 * @param {Object} gain - resources to add
 */
export function gainResources(resources, gain) {
  if (!gain) return;
  for (const [res, amount] of Object.entries(gain)) {
    resources[res] = (resources[res] || 0) + amount;
  }
}

/**
 * Format number for display (e.g., 1000 -> "1.0K")
 */
export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

/**
 * Get all resource types
 */
export const RESOURCE_TYPES = [
  'gold',
  'scrap',
  'wood',
  'energy',
  'crystals',
  'techPoints',
  'xp'
];
