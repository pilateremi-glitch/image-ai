/**
 * Core configuration constants for the zombie tower defense game
 * No dependencies - this is imported by all other modules
 */

// Grid and isometric display
export const COLS = 18;
export const ROWS = 10;
export const CELL = 52;

export const BASE_COL = 0;
export const SPAWN_COL = COLS - 1;
export const CW = COLS * CELL;
export const CH = ROWS * CELL;

// Isometric rendering constants
export const ISO_TW = 64;
export const ISO_TH = 32;
export const ISO_OX = 340;
export const ISO_OY = 50;

// Color palette
export const COLORS = {
  neon: '#39ff14',
  neon2: '#00eeff',
  danger: '#ff1744',
  warn: '#ffaa00',
  dark: '#060a06',
  panel: '#0c120c',
  border: '#1a2a1a'
};

// Isometric coordinate transformation functions
export function isoX(c, r) {
  return ISO_OX + (c - r) * (ISO_TW / 2);
}

export function isoY(c, r) {
  return ISO_OY + (c + r) * (ISO_TH / 2);
}

export function isoFromPx(px, py) {
  const c = px / CELL;
  const r = py / CELL;
  return {
    sx: ISO_OX + (c - r) * (ISO_TW / 2),
    sy: ISO_OY + (c + r) * (ISO_TH / 2)
  };
}

export function gridFromIso(sx, sy) {
  const u = (sx - ISO_OX) / (ISO_TW / 2);
  const v = (sy - ISO_OY) / (ISO_TH / 2);
  return {
    col: Math.round((u + v) / 2),
    row: Math.round((v - u) / 2)
  };
}

// Utility color functions
export function shadeColor(hex, f) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b2 = parseInt(hex.slice(5, 7), 16);
  const m = f < 0 ? 1 + f : 1;
  const a2 = f > 0 ? f * 255 : 0;
  return '#' + [r, g, b2]
    .map(v => Math.min(255, Math.max(0, Math.round(v * m + a2))).toString(16).padStart(2, '0'))
    .join('');
}

// Drawing utility for isometric diamonds
export function drawIsoDiamond(ctx, sx, sy, tw, th) {
  ctx.beginPath();
  ctx.moveTo(sx, sy - th / 2);
  ctx.lineTo(sx + tw / 2, sy);
  ctx.lineTo(sx, sy + th / 2);
  ctx.lineTo(sx - tw / 2, sy);
  ctx.closePath();
}
