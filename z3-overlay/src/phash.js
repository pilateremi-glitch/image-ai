/* ==========================================================================
   Z3 — empreinte visuelle d'une carte (même code dans le navigateur et dans Node)
   cardPrint(rgba, w, h) → { f: hash carte entière, a: hash illustration, c: couleur moyenne }
   printDistance(p, q) → distance (0 = identique ; < ~22 = même carte en pratique)
   ========================================================================== */
(function (global) {
  'use strict';
  const N = 32, K = 8;
  const COS = (() => { const t = new Float64Array(N * N); for (let u = 0; u < N; u++) for (let x = 0; x < N; x++) t[u * N + x] = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)); return t; })();

  /* moyenne par zones (réduction propre, indépendante du navigateur / de sharp) */
  function boxResize(rgba, w, h, x0, y0, cw, ch, W, H) {
    const out = new Float32Array(W * H * 3);
    for (let Y = 0; Y < H; Y++) {
      const ya = y0 + (Y * ch) / H, yb = y0 + ((Y + 1) * ch) / H;
      for (let X = 0; X < W; X++) {
        const xa = x0 + (X * cw) / W, xb = x0 + ((X + 1) * cw) / W;
        let r = 0, g = 0, b = 0, n = 0;
        for (let y = Math.floor(ya); y < Math.ceil(yb) && y < h; y++) {
          for (let x = Math.floor(xa); x < Math.ceil(xb) && x < w; x++) {
            const i = (y * w + x) * 4; r += rgba[i]; g += rgba[i + 1]; b += rgba[i + 2]; n++;
          }
        }
        const o = (Y * W + X) * 3; n = n || 1; out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
      }
    }
    return out;
  }
  function phash(rgb32) {                      // rgb 32×32 → 64 bits (hex)
    const g = new Float64Array(N * N);
    for (let i = 0; i < N * N; i++) g[i] = 0.299 * rgb32[i * 3] + 0.587 * rgb32[i * 3 + 1] + 0.114 * rgb32[i * 3 + 2];
    const tmp = new Float64Array(N * K), d = [];
    for (let y = 0; y < N; y++) for (let u = 0; u < K; u++) { let s = 0; for (let x = 0; x < N; x++) s += g[y * N + x] * COS[u * N + x]; tmp[y * K + u] = s; }
    for (let v = 0; v < K; v++) for (let u = 0; u < K; u++) { let s = 0; for (let y = 0; y < N; y++) s += tmp[y * K + u] * COS[v * N + y]; d.push(s); }
    const ac = d.slice(1), med = ac.slice().sort((a, b) => a - b)[ac.length >> 1];
    let hex = '';
    for (let i = 0; i < 64; i += 4) { let n = 0; for (let j = 0; j < 4; j++) n = (n << 1) | (d[i + j] > med ? 1 : 0); hex += n.toString(16); }
    return hex;
  }
  function cardPrint(rgba, w, h) {
    const mx = w * 0.04, my = h * 0.03;                                  // sans le bord extérieur
    const full = boxResize(rgba, w, h, mx, my, w - 2 * mx, h - 2 * my, N, N);
    const art = boxResize(rgba, w, h, w * 0.08, h * 0.1, w * 0.84, h * 0.44, N, N);   // zone illustration
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < N * N; i++) { r += art[i * 3]; g += art[i * 3 + 1]; b += art[i * 3 + 2]; }
    const k = N * N;
    return { f: phash(full), a: phash(art), c: [Math.round(r / k), Math.round(g / k), Math.round(b / k)] };
  }
  const POP = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
  function ham(a, b) { let d = 0; for (let i = 0; i < 16; i++) d += POP[parseInt(a[i], 16) ^ parseInt(b[i], 16)]; return d; }
  function printDistance(p, q) {
    const dc = Math.abs(p.c[0] - q.c[0]) + Math.abs(p.c[1] - q.c[1]) + Math.abs(p.c[2] - q.c[2]);
    return ham(p.f, q.f) + ham(p.a, q.a) + dc / 24;
  }
  /* recherche de la meilleure carte ; renvoie { key, d, marge } */
  function match(p, index, keys) {
    let best = null, bd = 1e9, second = 1e9;
    const list = keys || Object.keys(index);
    for (const k of list) {
      const q = index[k]; if (!q) continue;
      const d = printDistance(p, q);
      if (d < bd) { second = bd; bd = d; best = k; } else if (d < second) second = d;
    }
    return best ? { key: best, d: bd, marge: second - bd } : null;
  }
  global.Z3Print = { cardPrint, printDistance, match, ham };
})(typeof window !== 'undefined' ? window : globalThis);
