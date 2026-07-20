/**
 * Grid and terrain rendering
 * Imported by: main render loop
 */

import { COLS, ROWS, CELL, isoX, isoY, ISO_TW, ISO_TH, SPAWN_COL, BASE_COL, drawIsoDiamond } from '../config.js';

/**
 * Draw the main grid and terrain
 */
export function drawGrid(ctx, G) {
  // Draw isometric tiles in depth order
  for (let ds = 0; ds < COLS + ROWS - 1; ds++) {
    for (let rr = Math.max(0, ds - COLS + 1); rr <= Math.min(ds, ROWS - 1); rr++) {
      const cc = ds - rr;
      if (cc < 0 || cc >= COLS) continue;

      const sx = isoX(cc, rr);
      const sy = isoY(cc, rr);

      let fill, stroke;
      if (cc === BASE_COL) {
        fill = '#1e1e4a';
        stroke = '#3a3a8a66';
      } else if (cc === SPAWN_COL) {
        fill = '#2e1414';
        stroke = '#7a282866';
      } else {
        // Terrain shading: darker for columns closer to spawn for depth cues
        if (cc > 10) {
          fill = (cc + rr) % 2 === 0 ? '#0a0f0a' : '#090d09';
        } else {
          fill = (cc + rr) % 2 === 0 ? '#131f13' : '#111b11';
        }
        stroke = '#1e2e1e44';
      }

      ctx.fillStyle = fill;
      drawIsoDiamond(ctx, sx, sy, ISO_TW, ISO_TH);
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

/**
 * Draw base HP indicator
 */
export function drawBaseHp(ctx, G) {
  const hp = G.camp.hp / G.camp.maxHp;
  const bsx = isoX(BASE_COL, Math.floor(ROWS / 2));
  const bsy = isoY(BASE_COL, Math.floor(ROWS / 2));

  // HP bar background
  ctx.fillStyle = '#ef444455';
  ctx.fillRect(bsx - 22, bsy - 5, 44, 7);

  // HP bar fill
  ctx.fillStyle = hp > 0.5 ? '#4ade80' : hp > 0.25 ? '#fbbf24' : '#ef4444';
  ctx.fillRect(bsx - 22, bsy - 5, 44 * hp, 7);

  // Label
  ctx.fillStyle = '#6a6aaa';
  ctx.font = 'bold 9px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('BASE', bsx, bsy - 8);
}

/**
 * Draw spawn zone indicator
 */
export function drawSpawnZone(ctx, G) {
  const spsx = isoX(SPAWN_COL, Math.floor(ROWS / 2));
  const spsy = isoY(SPAWN_COL, Math.floor(ROWS / 2));

  ctx.fillStyle = '#7a3030';
  ctx.font = 'bold 9px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('SPAWN', spsx, spsy - 8);
}

/**
 * Draw subtle depth fog
 */
export function drawDepthFog(ctx, CW, CH) {
  ctx.fillStyle = 'rgba(10,10,10,0.05)';
  ctx.fillRect(0, CH * 0.6, CW, CH * 0.4);
}
