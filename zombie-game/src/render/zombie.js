/**
 * Zombie rendering and animation
 * This module contains all zombie drawing logic extracted from index.html
 */

import { CELL, isoFromPx } from '../config.js';
import { ZOMBIE_TYPES } from '../data/zombie-types.js';

let animTime = 0;

/**
 * Set animation time for all renders
 */
export function setAnimTime(t) {
  animTime = t;
}

/**
 * Draw all active zombies
 */
export function drawZombies(ctx, G) {
  // Sort zombies by depth (column + row) for proper rendering order
  const zombieList = Object.values(G.zombies)
    .filter(z => z && z.hp > 0)
    .sort((a, b) => (a.col || 0) + (a.row || 0) - (b.col || 0) - (b.row || 0));

  for (const zombie of zombieList) {
    drawZombieAnimated(ctx, zombie);
  }
}

/**
 * Draw individual zombie with animation
 * This is a placeholder - the full implementation is in index.html
 */
function drawZombieAnimated(ctx, zombie) {
  const zt = ZOMBIE_TYPES[zombie.typeId];
  if (!zt) return;

  const r = CELL * zt.r * 0.5;
  const ph = zombie.phase || 0;
  const t = animTime;

  // Scale animation speed to movement velocity
  const spd = Math.hypot(zombie.vx || 0, zombie.vy || 0);
  const spdR = Math.min(1, spd / Math.max(1, zt.speed || 1));

  // Vertical bobbing animation
  const bob = zombie.stun > 0 ? 0 : Math.sin(t * 3.5 * Math.max(0.3, spdR) + ph) * 2.2 * Math.max(0.2, spdR);

  ctx.save();

  // Fade-in on spawn
  const fadeIn = zombie.spawnTime !== undefined
    ? Math.min(1, (animTime - zombie.spawnTime) / 0.4)
    : 1;

  if (fadeIn < 1) ctx.globalAlpha = fadeIn;

  const { sx, sy } = isoFromPx(zombie.px, zombie.py);

  // Lean in movement direction
  if (spd > 3 && (zombie.vy || 0) !== 0) {
    ctx.translate(sx, sy + bob);
    ctx.rotate((zombie.vy || 0) / Math.max(1, spd) * 0.18);
  } else {
    ctx.translate(sx, sy + bob);
  }

  // Drop shadow
  ctx.shadowColor = '#00000066';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 6;

  // Phantom transparency
  if (zombie.typeId === 'PHANTOM') {
    ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * 2.2 + ph));
  }

  // Draw zombie body (simplified - actual implementation in index.html)
  ctx.fillStyle = zt.color || '#4a5a4a';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // HP bar
  const hpR = zombie.hp / zombie.maxHp;
  const bw = r * 2.2;
  const bh = 3;

  ctx.fillStyle = '#111';
  ctx.fillRect(-bw / 2, -r - 8, bw, bh);

  ctx.fillStyle = hpR > 0.5 ? '#39ff14' : hpR > 0.25 ? '#ffaa00' : '#ff1744';
  ctx.fillRect(-bw / 2, -r - 8, bw * hpR, bh);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.restore();
}
