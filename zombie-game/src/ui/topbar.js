/**
 * Top bar resource display updates
 * Shows: gold, scrap, wood, energy, crystals, tech points, XP
 */

import { resIcon } from '../utils/resource.js';

/**
 * Update resource display in top bar
 */
export function updateTopBar(G) {
  const resources = ['gold', 'scrap', 'wood', 'energy', 'crystals', 'techPoints', 'xp'];

  for (const res of resources) {
    const el = document.getElementById(`r-${res}`);
    if (el) {
      el.textContent = Math.floor(G.resources[res] || 0);
    }
  }

  updateWaveInfo(G);
}

/**
 * Update wave and phase display
 */
export function updateWaveInfo(G) {
  const waveBadge = document.getElementById('wave-badge');
  const phaseLabel = document.getElementById('phase-label');

  if (waveBadge) {
    waveBadge.textContent = `VAGUE ${G.wave}`;
  }

  if (phaseLabel) {
    const phaseText = G.phase === 'build' ? 'CONSTRUCTION' : 'VAGUE EN COURS';
    phaseLabel.textContent = phaseText;
  }
}

/**
 * Set message in bottom bar
 */
export function setMsg(text) {
  const msgBar = document.getElementById('msg-bar');
  if (msgBar) {
    msgBar.textContent = text;
    // Clear message after 3 seconds
    setTimeout(() => {
      if (msgBar) msgBar.textContent = '';
    }, 3000);
  }
}
