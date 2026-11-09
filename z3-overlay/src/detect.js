/* ==========================================================================
   Z3 — détection automatique des HITS (analyse d'image, sans IA)
   features(imageData)  → mesures de la carte (doré, holo arc-en-ciel, reflets, full art)
   new Z3Detector(opts) → machine à états : carte posée & stable → analyse → niveau
   ========================================================================== */
(function (global) {
  'use strict';

  function hsv(r, g, b) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, mx ? d / mx : 0, mx / 255];
  }

  /* Mesures sur l'image de la zone carte (ImageData, idéalement ~120×168) */
  function features(img) {
    const { data, width: W, height: H } = img;
    const bins = new Float32Array(12);
    let n = 0, ni = 0, gold = 0, colorful = 0, spark = 0, lowSat = 0, lowN = 0, satSum = 0;
    const TW = 24, TH = 32, thumb = new Float32Array(TW * TH), tc = new Float32Array(TW * TH);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, r = data[i], g = data[i + 1], b = data[i + 2];
        const [h, s, v] = hsv(r, g, b);
        n++; satSum += s;
        const inner = x > W * 0.09 && x < W * 0.91 && y > H * 0.07 && y < H * 0.93;   // sans la bordure
        if (inner) {
          ni++;
          if (h >= 33 && h <= 58 && s > 0.42 && v > 0.5) gold++;
          if (s > 0.45 && v > 0.42) { colorful++; bins[Math.min(11, (h / 30) | 0)]++; }
        }
        if (y > H * 0.58 && x > W * 0.08 && x < W * 0.92) { lowSat += s; lowN++; }
        const k = ((y * TH / H) | 0) * TW + ((x * TW / W) | 0);
        thumb[k] += 0.299 * r + 0.587 * g + 0.114 * b; tc[k]++;
      }
    }
    for (let k = 0; k < thumb.length; k++) thumb[k] /= tc[k] || 1;
    // reflets : points très clairs nettement plus lumineux que leur voisinage (pas un aplat blanc)
    const L = (x, y) => { const i = (y * W + x) * 4; return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114; };
    for (let y = ((H * 0.07) | 0) + 2; y < H * 0.93 - 2; y++) {
      for (let x = ((W * 0.09) | 0) + 2; x < W * 0.91 - 2; x++) {
        const l = L(x, y);
        if (l > 225 && l - (L(x - 2, y) + L(x + 2, y) + L(x, y - 2) + L(x, y + 2)) / 4 > 28) spark++;
      }
    }
    let ent = 0;
    if (colorful) for (const c of bins) if (c) { const p = c / colorful; ent -= p * Math.log(p); }
    const colorFrac = colorful / (ni || 1);
    return {
      gold: gold / (ni || 1),
      rainbow: (ent / Math.log(12)) * Math.min(1, colorFrac * 2.5),  // diversité des teintes vives
      sparkle: spark / (ni || 1),
      lowerSat: lowN ? lowSat / lowN : 0,                            // full art : bas de carte coloré
      sat: satSum / n,
      thumb,
    };
  }

  function diff(a, b) {
    if (!a || !b) return 255;
    let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
    return s / a.length;
  }

  const DEFAULT_COMMON = { gold: 0.02, rainbow: 0.3, sparkle: 0.01, lowerSat: 0.16 };

  function score(f, common) {
    const c = common || DEFAULT_COMMON;
    const d = (k) => Math.max(0, f[k] - c[k]);
    const parts = {
      gold: 4.0 * Math.min(1, d('gold') / 0.5) * (1 - Math.min(1, f.rainbow)),   // or métallique (pas l'arc-en-ciel)
      rainbow: 1.6 * Math.min(1, d('rainbow') / 0.5),                            // holo / arc-en-ciel
      sparkle: 0.4 * Math.min(1, d('sparkle') / 0.03),                           // reflets de foil
      fullart: 1.2 * Math.min(1, d('lowerSat') / 0.35),                          // illustration pleine carte
    };
    return { total: parts.gold + parts.rainbow + parts.sparkle + parts.fullart, parts };
  }

  function tierFromScore(s, sensitivity) {
    const k = sensitivity || 1;
    if (s >= 3.6 / k) return 'secret';
    if (s >= 2.4 / k) return 'ultra';
    if (s >= 1.2 / k) return 'rare';
    return null;
  }

  /* Machine à états : détecte « une nouvelle carte posée et immobile » */
  class Z3Detector {
    constructor(o = {}) {
      this.o = Object.assign({ stableFrames: 3, motionThr: 7, presenceThr: 16, sameCardThr: 12, packGapMs: 12000 }, o);
      this.prev = null; this.stable = 0; this.lastCard = null; this.background = null;
      this.pack = { cards: 0, hits: 0, last: 0, god: false };
    }
    setBackground(f) { this.background = f.thumb.slice(); }
    /* renvoie { motion, presence, card?: true, packEnd?: {cards,hits} } */
    push(f, now) {
      const out = { motion: diff(f.thumb, this.prev), presence: this.background ? diff(f.thumb, this.background) : 255 };
      this.prev = f.thumb;
      if (this.pack.cards && now - this.pack.last > this.o.packGapMs) {
        out.packEnd = { cards: this.pack.cards, hits: this.pack.hits };
        this.pack = { cards: 0, hits: 0, last: 0, god: false };
      }
      if (out.motion > this.o.motionThr) { this.stable = 0; return out; }
      this.stable++;
      const present = out.presence > this.o.presenceThr;
      if (!present) { this.lastCard = null; return out; }
      if (this.stable === this.o.stableFrames && diff(f.thumb, this.lastCard) > this.o.sameCardThr) {
        this.lastCard = f.thumb.slice();
        this.pack.cards++; this.pack.last = now;
        out.card = true;
      }
      this.pack.last = now;
      return out;
    }
    registerHit() { this.pack.hits++; return this.pack.hits; }
  }

  global.Z3Detect = { features, diff, score, tierFromScore, Z3Detector, DEFAULT_COMMON };
})(typeof window !== 'undefined' ? window : globalThis);
