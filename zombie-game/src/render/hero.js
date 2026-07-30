/**
 * Hero rendering module
 * Draws placed heroes on the map with animations
 */

import { CELL, isoX, isoY, isoFromPx } from '../config.js';
import { HERO_TYPES } from '../data/hero-types.js';

let animTime = 0;

/**
 * Set animation time
 */
export function setAnimTime(t) {
  animTime = t;
}

/**
 * Draw all active heroes
 */
export function drawHeroes(ctx, G) {
  for (const hero of G.heroes) {
    if (hero && hero.hp > 0) {
      drawHero(ctx, hero);
    }
  }
}

/**
 * Draw individual hero with animation
 * This is a placeholder - actual implementation in index.html has detailed graphics
 */
function drawHero(ctx, hero) {
  if (hero.col === undefined) return;

  const r = CELL * 0.38;
  const bx = isoX(hero.col, hero.row);
  const by = isoY(hero.col, hero.row);
  const t = animTime;
  const ph = hero.col * 1.3 + hero.row;

  // Bobbing animation
  const bob = Math.sin(t * 2 + ph) * 0.8;
  const firing = hero._firing > 0;

  ctx.save();
  ctx.translate(bx, by + bob);

  // Drop shadow
  ctx.shadowColor = '#00000066';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 6;

  // Draw hero body (simplified - detailed implementation in index.html)
  const ht = HERO_TYPES[hero.typeId];
  if (ht) {
    ctx.fillStyle = '#3a5a3a';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.42, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#4a6a4a';
    ctx.beginPath();
    ctx.arc(0, -r * 0.5, r * 0.34, Math.PI, 0);
    ctx.fill();

    // Firing indicator
    if (firing) {
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 8;
    }
  }

  // Level badge
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 8px Courier New';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('H' + hero.level, -r * 0.9, -r * 0.9);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.restore();
}

/**
 * Draw hero placement preview
 */
export function drawHeroPreview(ctx, col, row, heroTypeId) {
  const r = CELL * 0.38;
  const bx = isoX(col, row);
  const by = isoY(col, row);

  ctx.save();
  ctx.translate(bx, by);
  ctx.globalAlpha = 0.6;

  ctx.fillStyle = '#3a5a3a';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.1, r * 0.42, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
