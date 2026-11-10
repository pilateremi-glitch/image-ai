#!/usr/bin/env node
/* Removes the white background around a logo (flood fill from the edges, soft edge)
   Usage: node tools/cutout-logo.mjs input.png|webp|jpg output.png */
import sharp from 'sharp';
const [, , src, out] = process.argv;
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
const white = (i, tol) => { const [r, g, b] = px(i); return r > 255 - tol && g > 255 - tol && b > 255 - tol; };
const bg = new Uint8Array(W * H), st = [];
for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1);
while (st.length) { const i = st.pop(); if (bg[i] || !white(i, 40)) continue; bg[i] = 1; const x = i % W, y = (i / W) | 0;
  if (x > 0) st.push(i - 1); if (x < W - 1) st.push(i + 1); if (y > 0) st.push(i - W); if (y < H - 1) st.push(i + W); }
// soft edge: pixels next to the background become partially transparent depending on their whiteness
for (let i = 0; i < W * H; i++) {
  if (bg[i]) { data[i * 4 + 3] = 0; continue; }
  const x = i % W, y = (i / W) | 0; let near = 0;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = (y + dy) * W + x + dx; if (j >= 0 && j < W * H && bg[j]) near = 1; }
  if (near) { const [r, g, b] = px(i), w = Math.min(r, g, b); if (w > 200) data[i * 4 + 3] = Math.round(255 * (255 - w) / 55); }
}
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(out);
console.log('✔', out);
