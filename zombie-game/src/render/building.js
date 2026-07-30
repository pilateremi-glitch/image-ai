/**
 * Building rendering module
 * Draws towers, walls, traps, and support buildings with isometric 3D effect
 */

import { CELL, isoX, isoY, ISO_TW, ISO_TH, shadeColor, drawIsoDiamond } from '../config.js';
import { BUILDING_TYPES } from '../data/building-types.js';

let animTime = 0;

/**
 * Set animation time
 */
export function setAnimTime(t) {
  animTime = t;
}

/**
 * Draw all buildings on map
 * Buildings are sorted by depth (col + row) for proper rendering
 */
export function drawBuildings(ctx, G) {
  const buildingList = Object.values(G.buildings).sort(
    (a, b) => (a.col + a.row) - (b.col + b.row)
  );

  for (const building of buildingList) {
    drawBuilding(ctx, G, building);
  }
}

/**
 * Draw individual building with 3D isometric effect
 * This is a placeholder - the actual implementation is in index.html
 */
function drawBuilding(ctx, G, building) {
  const bt = BUILDING_TYPES[building.typeId];
  if (!bt) return;

  const x = building.col * CELL;
  const y = building.row * CELL;
  const S = CELL;

  const sx = isoX(building.col, building.row);
  const sy = isoY(building.col, building.row);

  const H = (bt.type === 'tower' ? 32 : bt.type === 'wall' ? 18 : 20) + (building.level - 1) * 3;
  const bc = bt.color || '#4a4a4a';

  // 3D isometric sides
  ctx.fillStyle = shadeColor(bc, -0.45);
  ctx.beginPath();
  ctx.moveTo(sx - ISO_TW / 2, sy - H);
  ctx.lineTo(sx, sy + ISO_TH / 2 - H);
  ctx.lineTo(sx, sy + ISO_TH / 2);
  ctx.lineTo(sx - ISO_TW / 2, sy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#00000033';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.fillStyle = shadeColor(bc, -0.22);
  ctx.beginPath();
  ctx.moveTo(sx + ISO_TW / 2, sy - H);
  ctx.lineTo(sx, sy + ISO_TH / 2 - H);
  ctx.lineTo(sx, sy + ISO_TH / 2);
  ctx.lineTo(sx + ISO_TW / 2, sy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top face (simplified)
  ctx.fillStyle = bc;
  drawIsoDiamond(ctx, sx, sy - H + ISO_TH / 2, ISO_TW, ISO_TH);
  ctx.fill();

  // Level glow for high-level buildings
  if (building.level >= 3) {
    ctx.save();
    ctx.strokeStyle = '#ffd70055';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(x + 1, y + 1, S - 2, S - 2);
    ctx.restore();
  }
}

/**
 * Draw building being placed (preview)
 */
export function drawBuildingPreview(ctx, col, row, buildTypeId, canPlace) {
  const bt = BUILDING_TYPES[buildTypeId];
  if (!bt) return;

  const sx = isoX(col, row);
  const sy = isoY(col, row);

  ctx.globalAlpha = canPlace ? 0.6 : 0.3;
  ctx.fillStyle = canPlace ? bt.color || '#4a4a4a' : '#ff444488';

  drawIsoDiamond(ctx, sx, sy, ISO_TW, ISO_TH);
  ctx.fill();

  ctx.globalAlpha = 1;
}
