#!/usr/bin/env node
/* ==========================================================================
   Z3 — music for the recap video, 100% synthesized (no samples: free of rights)
   128 BPM · "royal road" J-pop progression (Fmaj7 – G7 – Em7 – Am7) · 16 bars ≈ 30 s
   Structure aligned with recap-video.html:
     0–4 s intro (pads + riser) · 4–9 s groove (stats) · 9 s DROP (hits) · end: outro + fade
   Usage: node tools/build-music.mjs → data/musique-recap.wav  (then encoding, see README)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, BPM = 128, BEAT = 60 / BPM, BAR = BEAT * 4, BARS = 16, LEN = BAR * BARS + 1.5;
const N = Math.ceil(LEN * SR), L = new Float32Array(N), R = new Float32Array(N);
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
function add(t0, dur, fn, gain = 1, pan = 0) {        // fn(t, i) → sample ; pan -1..1
  const a = Math.max(0, Math.floor(t0 * SR)), b = Math.min(N, Math.floor((t0 + dur) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = a; i < b; i++) { const v = fn((i - a) / SR, i); L[i] += v * gl; R[i] += v * gr; }
}
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
// approximated saw (band-limited by number of harmonics)
const saw = (f, t, h = 12) => { let s = 0; for (let k = 1; k <= h && f * k < 16000; k++) s += Math.sin(2 * Math.PI * f * k * t) / k; return s * 0.6; };
const sq = (f, t, h = 9) => { let s = 0; for (let k = 1; k <= h && f * k < 16000; k += 2) s += Math.sin(2 * Math.PI * f * k * t) / k; return s * 0.8; };

/* ---------- instruments ---------- */
const kick = (t0, g = 1) => add(t0, 0.35, (t) => { const f = 45 + 110 * Math.exp(-t * 28); return Math.sin(2 * Math.PI * f * t + 2 * Math.exp(-t * 30)) * env(t, 0.002, 0.16); }, 0.9 * g);
const snare = (t0, g = 1) => { let lp = 0;
  add(t0, 0.3, (t) => { const n = rnd(); lp += (n - lp) * 0.55; return (n - lp * 0.6) * env(t, 0.001, 0.09) * 0.7 + Math.sin(2 * Math.PI * 190 * t) * env(t, 0.001, 0.05) * 0.5; }, 0.55 * g, 0.05); };
const hat = (t0, open, g = 1) => { let p = 0; add(t0, open ? 0.25 : 0.06, (t) => { const n = rnd(); const h = n - p; p = n; return h * env(t, 0.001, open ? 0.08 : 0.018); }, 0.11 * g, 0.3); };
const clap = (t0) => [0, 0.012, 0.024].forEach((d) => snare(t0 + d, 0.5));
const crash = (t0) => { let p = 0; add(t0, 2.2, (t) => { const n = rnd(); const h = n - p; p = n; return h * env(t, 0.002, 0.7); }, 0.22, -0.2); };
const bass = (t0, m, dur) => add(t0, dur, (t) => (saw(midi(m), t, 8) * 0.7 + Math.sin(2 * Math.PI * midi(m - 12) * t) * 0.6) * env(t, 0.004, dur * 0.7), 0.42);
const pad = (t0, notes, dur, g = 1) => notes.forEach((m, k) => [-0.12, 0, 0.12].forEach((det, j) =>
  add(t0, dur + 0.4, (t) => saw(midi(m) * Math.pow(2, det / 12), t, 6) * Math.min(1, t / 0.25) * (t > dur ? Math.exp(-(t - dur) / 0.15) : 1), 0.055 * g, (j - 1) * 0.6 + (k % 2 ? 0.1 : -0.1))));
const pluck = (t0, m, g = 1, pan = 0) => add(t0, 0.4, (t) => (sq(midi(m), t, 7) * 0.6 + Math.sin(2 * Math.PI * midi(m + 12) * t) * 0.3) * env(t, 0.002, 0.11), 0.16 * g, pan);
const lead = (t0, m, dur, g = 1) => add(t0, dur + 0.1, (t) => { const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * Math.max(0, t - 0.15));
  return (saw(midi(m) * vib, t, 10) * 0.5 + saw(midi(m) * vib * 1.004, t, 10) * 0.5) * Math.min(1, t / 0.01) * (t > dur ? Math.exp(-(t - dur) / 0.06) : 1); }, 0.12 * g, 0.1);
const riser = (t0, dur) => { let p = 0; add(t0, dur, (t) => { const n = rnd(); const h = n - p * (0.2 + 0.75 * t / dur); p = n; return h * Math.pow(t / dur, 2.2); }, 0.25, 0); };
const sparkle = (t0) => [0, 0.06, 0.12, 0.18, 0.24].forEach((d, i) => add(t0 + d, 0.5, (t) => Math.sin(2 * Math.PI * midi(96 + [0, 4, 7, 12, 16][i]) * t) * env(t, 0.002, 0.15), 0.09, (i % 2 ? 0.5 : -0.5)));

/* ---------- harmony: Fmaj7 – G7 – Em7 – Am7 (C major) ---------- */
const CH = [
  { root: 41, pad: [65, 69, 72, 76], arp: [65, 69, 72, 76, 77, 76, 72, 69] },
  { root: 43, pad: [67, 71, 74, 77], arp: [67, 71, 74, 77, 79, 77, 74, 71] },
  { root: 40, pad: [64, 67, 71, 74], arp: [64, 67, 71, 74, 76, 74, 71, 67] },
  { root: 45, pad: [69, 72, 76, 79], arp: [69, 72, 76, 79, 81, 79, 76, 72] },
];
// lead melody (hook) over 4 bars: [beat, midi note, length in beats]
const HOOK = [[0, 81, 1], [1, 79, 0.5], [1.5, 77, 0.5], [2, 76, 1], [3, 79, 1],
  [4, 79, 1], [5, 77, 0.5], [5.5, 76, 0.5], [6, 74, 1.5], [7.5, 76, 0.5],
  [8, 76, 1], [9, 74, 0.5], [9.5, 72, 0.5], [10, 71, 1], [11, 74, 1],
  [12, 72, 1.5], [13.5, 74, 0.5], [14, 76, 2]];

for (let bar = 0; bar < BARS; bar++) {
  const t = bar * BAR, c = CH[bar % 4];
  const intro = bar < 2, groove = bar >= 2 && bar < 5, drop = bar >= 5 && bar < 14, outro = bar >= 14;
  pad(t, c.pad, BAR, intro || outro ? 1.3 : 0.9);
  if (!intro) for (let e = 0; e < 8; e++) bass(t + e * BEAT / 2, c.root + (e % 2 && drop ? 12 : 0), BEAT / 2 * 0.9);
  if (intro) { for (let e = 0; e < 8; e++) pluck(t + e * BEAT / 2, c.arp[e], 0.6, e % 2 ? 0.4 : -0.4); }
  if (bar === 1) riser(t, BAR);
  if (bar === 4) riser(t + BAR / 2, BAR / 2);
  if (groove || drop) {
    for (let b = 0; b < 4; b++) {
      kick(t + b * BEAT);
      hat(t + b * BEAT + BEAT / 2, b === 3 && groove);
      if (drop) { hat(t + b * BEAT + BEAT / 4, false, 0.6); hat(t + b * BEAT + 3 * BEAT / 4, false, 0.6); }
      if (b % 2) (drop ? snare : clap)(t + b * BEAT);
    }
    for (let e = 0; e < (drop ? 16 : 8); e++) pluck(t + e * BEAT / (drop ? 4 : 2), c.arp[e % 8] + (drop && e >= 8 ? 12 : 0), drop ? 0.7 : 0.8, e % 2 ? 0.45 : -0.45);
  }
  if (drop) { const h0 = ((bar - 5) % 4) * 4; HOOK.filter((n) => n[0] >= h0 && n[0] < h0 + 4).forEach(([b, m, d]) => lead(t + (b - h0) * BEAT, m, d * BEAT * 0.95, 1)); }
  if (bar === 5 || bar === 9) { crash(t); sparkle(t); }
  if (bar === 13) for (let k = 0; k < 4; k++) snare(t + 3 * BEAT + k * BEAT / 4, 0.4 + k * 0.15);   // roll before the outro
  if (bar === 14) { crash(t); kick(t, 1.2); sparkle(t + BEAT); }
  if (outro) for (let e = 0; e < 8; e++) pluck(t + e * BEAT / 2, c.arp[e], 0.5, e % 2 ? 0.4 : -0.4);
}
// final chord held + fade out
pad(BARS * BAR, [69, 72, 76, 81], 1.2, 1.2);

/* ---------- mastering: light reverb (comb delays), soft compression, normalization, fades ---------- */
const rev = (x, ds, g) => { const y = Float32Array.from(x); for (const d of ds) { const n = Math.floor(d * SR); for (let i = n; i < N; i++) y[i] += y[i - n] * g; } return y; };
const RL = rev(L, [0.031, 0.047], 0.18), RR = rev(R, [0.037, 0.053], 0.18);
let peak = 0;
for (let i = 0; i < N; i++) { const t = i / SR, fade = Math.min(1, t / 0.05) * (t > LEN - 2 ? Math.max(0, (LEN - t) / 2) : 1);
  RL[i] = Math.tanh(RL[i] * 1.4) * fade; RR[i] = Math.tanh(RR[i] * 1.4) * fade; peak = Math.max(peak, Math.abs(RL[i]), Math.abs(RR[i])); }
const k = 0.89 / peak, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(RL[i] * k * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(RR[i] * k * 32767), 46 + i * 4); }
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'musique-recap.wav');
fs.writeFileSync(out, buf);
console.log('✔', out, (LEN).toFixed(1) + ' s');
