#!/usr/bin/env node
/* ==========================================================================
   Z3 — EPIC music for the recap video (shōnen opening style), 100% synthesized
   No samples → free of rights. 160 BPM · D minor · Dm – B♭ – C – A
   Instruments: distorted guitar (power chords), heavy drums + taiko, "aah" choirs,
   brass, heroic lead, risers, crashes.
   Structure aligned with recap-video.html (1 bar = 1.5 s):
     bars 0-1  (0–3 s)   intro: choir + taiko + riser
     bars 2-5  (3–9 s)   build: palm-mute guitar, drums, choir      ← stats
     bars 6-17 (9–27 s)  DROP: everything + lead + double kick     ← hits, rarities
     bars 18-19 (27–30 s) finale: chord hits + choir, fade
   Usage: node tools/build-music.mjs  → data/musique-recap.wav
          ffmpeg -i data/musique-recap.wav -c:a libopus -b:a 128k data/musique-recap.ogg
          then regenerate data/musique-recap.js (base64), see README.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100, BPM = 160, BEAT = 60 / BPM, BAR = BEAT * 4, BARS = 20, LEN = BAR * BARS + 2;
const N = Math.ceil(LEN * SR), L = new Float32Array(N), R = new Float32Array(N);
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
function add(t0, dur, fn, gain = 1, pan = 0) {
  const a = Math.max(0, Math.floor(t0 * SR)), b = Math.min(N, Math.floor((t0 + dur) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = a; i < b; i++) { const v = fn((i - a) / SR); L[i] += v * gl; R[i] += v * gr; }
}
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
const saw = (f, t, h = 12) => { let s = 0; for (let k = 1; k <= h && f * k < 15000; k++) s += Math.sin(2 * Math.PI * f * k * t) / k; return s * 0.6; };

/* ---------------- drums ---------------- */
const kick = (t0, g = 1) => add(t0, 0.4, (t) => { const f = 42 + 140 * Math.exp(-t * 32);
  return Math.tanh(1.6 * Math.sin(2 * Math.PI * f * t + 2.4 * Math.exp(-t * 35))) * env(t, 0.001, 0.17) + rnd() * env(t, 0.0005, 0.004) * 0.6; }, 0.95 * g);
const snare = (t0, g = 1) => { let lp = 0;
  add(t0, 0.5, (t) => { const n = rnd(); lp += (n - lp) * 0.5; return (n - lp * 0.5) * env(t, 0.001, 0.13) * 0.8 + Math.sin(2 * Math.PI * 180 * t) * env(t, 0.001, 0.06) * 0.7; }, 0.6 * g, 0.05); };
const hat = (t0, g = 1) => { let p = 0; add(t0, 0.07, (t) => { const n = rnd(), h = n - p; p = n; return h * env(t, 0.001, 0.02); }, 0.09 * g, 0.35); };
const ride = (t0) => { let p = 0; add(t0, 0.5, (t) => { const n = rnd(), h = n - p; p = n; return (h * 0.6 + Math.sin(2 * Math.PI * 5200 * t) * 0.15) * env(t, 0.001, 0.16); }, 0.08, 0.4); };
const crash = (t0, g = 1) => { let p = 0; add(t0, 2.6, (t) => { const n = rnd(), h = n - p; p = n; return h * env(t, 0.002, 0.85); }, 0.24 * g, -0.25); };
const taiko = (t0, g = 1, pan = 0) => add(t0, 0.9, (t) => { const f = 70 + 45 * Math.exp(-t * 18);
  return (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.3 * t)) * env(t, 0.002, 0.28) + rnd() * env(t, 0.001, 0.012) * 0.5; }, 0.8 * g, pan);
const tom = (t0, m) => add(t0, 0.4, (t) => Math.sin(2 * Math.PI * midi(m) * (1 + 0.4 * Math.exp(-t * 20)) * t) * env(t, 0.002, 0.15), 0.5, (m - 50) / 20);

/* ---------------- distorted guitar (power chords) ---------------- */
function guitar(t0, root, dur, mute, pan) {        // root + fifth + octave, drive, low-pass
  let y = 0; const a = mute ? 0.18 : 0.32;
  add(t0, dur + (mute ? 0.02 : 0.25), (t) => {
    const x = saw(midi(root), t, 14) + saw(midi(root + 7) * 1.002, t, 12) * 0.8 + saw(midi(root + 12) * 0.998, t, 10) * 0.6;
    const d = Math.tanh(x * (mute ? 5 : 7));
    y += a * (d - y);
    const e = mute ? env(t, 0.002, 0.07) : Math.min(1, t / 0.005) * (t > dur ? Math.exp(-(t - dur) / 0.08) : 1);
    return y * e;
  }, mute ? 0.16 : 0.13, pan);
}
/* ---------------- "aah" choir (formants) ---------------- */
function choir(t0, notes, dur, g = 1) {
  const F = [[730, 1, 90], [1090, 0.5, 110], [2440, 0.18, 160]];               // vowel "a"
  notes.forEach((m, k) => [-0.09, 0.07].forEach((det, j) => {
    const f0 = midi(m) * Math.pow(2, det / 12), H = Math.floor(5000 / f0), w = [];
    for (let h = 1; h <= H; h++) { const fh = f0 * h; w.push(F.reduce((s, [fc, amp, bw]) => s + amp * Math.exp(-Math.pow((fh - fc) / bw, 2) / 2), 0.02)); }
    add(t0, dur + 0.5, (t) => {
      const vib = 1 + 0.006 * Math.sin(2 * Math.PI * (5 + j * 0.4) * t + k);
      let s = 0; for (let h = 1; h <= H; h++) s += w[h - 1] * Math.sin(2 * Math.PI * f0 * vib * h * t);
      return s * Math.min(1, t / 0.35) * (t > dur ? Math.exp(-(t - dur) / 0.25) : 1);
    }, 0.05 * g, (j ? 0.5 : -0.5) * (k % 2 ? 1 : 0.6));
  }));
}
/* ---------------- brass + heroic lead ---------------- */
const brass = (t0, notes, dur, g = 1) => notes.forEach((m, k) => add(t0, dur + 0.15, (t) => {
  const br = Math.min(1, t / 0.06); return saw(midi(m), t, Math.round(3 + br * 9)) * br * (t > dur ? Math.exp(-(t - dur) / 0.07) : 1); }, 0.07 * g, k % 2 ? 0.3 : -0.3));
const lead = (t0, m, dur) => { let y = 0; add(t0, dur + 0.12, (t) => {
  const vib = 1 + 0.005 * Math.sin(2 * Math.PI * 6 * Math.max(0, t - 0.12));
  const x = Math.tanh((saw(midi(m) * vib, t, 12) + saw(midi(m) * vib * 1.005, t, 12)) * 2.2); y += 0.35 * (x - y);
  return y * Math.min(1, t / 0.01) * (t > dur ? Math.exp(-(t - dur) / 0.05) : 1); }, 0.11, 0.08); };
const bass = (t0, m, dur) => add(t0, dur, (t) => (Math.tanh(saw(midi(m), t, 8) * 2) * 0.6 + Math.sin(2 * Math.PI * midi(m) * t) * 0.7) * env(t, 0.003, dur * 0.8), 0.36);
const riser = (t0, dur) => { let p = 0; add(t0, dur, (t) => { const n = rnd(), h = n - p * (0.15 + 0.8 * t / dur); p = n; return h * Math.pow(t / dur, 2.4); }, 0.3); };
const boom = (t0) => add(t0, 2.5, (t) => Math.sin(2 * Math.PI * (38 + 30 * Math.exp(-t * 6)) * t) * env(t, 0.003, 0.9), 0.8);

/* ---------------- harmony D minor: Dm – B♭ – C – A ---------------- */
const CH = [
  { gtr: 38, bass: 26, choir: [62, 65, 69], brass: [62, 65, 69, 74] },   // Dm
  { gtr: 34, bass: 34 - 12, choir: [62, 65, 70], brass: [58, 62, 65, 70] },   // B♭
  { gtr: 36, bass: 36 - 12, choir: [64, 67, 72], brass: [60, 64, 67, 72] },   // C
  { gtr: 33, bass: 33 - 12, choir: [61, 64, 69], brass: [57, 61, 64, 69] },   // A (major: tension)
];
// heroic hook over 4 bars: [beat, note, length in beats]
const HOOK = [[0, 74, 1.5], [1.5, 76, 0.5], [2, 77, 1], [3, 76, 0.5], [3.5, 74, 0.5],
  [4, 77, 1.5], [5.5, 79, 0.5], [6, 81, 2],
  [8, 79, 1], [9, 77, 1], [10, 76, 1], [11, 79, 1],
  [12, 76, 1], [13, 73, 1], [14, 76, 1], [15, 81, 1]];

for (let bar = 0; bar < BARS; bar++) {
  const t = bar * BAR, c = CH[bar % 4];
  const intro = bar < 2, build = bar >= 2 && bar < 6, drop = bar >= 6 && bar < 18, fin = bar >= 18;
  if (intro) {
    choir(t, c.choir, BAR, 1.3);
    [0, 1.5, 2, 3].forEach((b, i) => taiko(t + b * BEAT, 0.8 + i * 0.1, i % 2 ? 0.3 : -0.3));
    if (bar === 1) { riser(t, BAR); [2, 2.5, 3, 3.25, 3.5, 3.75].forEach((b, i) => tom(t + b * BEAT, 52 - i * 3)); }
  }
  if (build) {
    choir(t, c.choir, BAR, 0.9);
    for (let e = 0; e < 8; e++) { guitar(t + e * BEAT / 2, c.gtr, BEAT / 2 * 0.8, true, -0.6); guitar(t + e * BEAT / 2 + 0.008, c.gtr, BEAT / 2 * 0.8, true, 0.6); }
    for (let e = 0; e < 8; e++) bass(t + e * BEAT / 2, c.bass, BEAT / 2 * 0.85);
    for (let b = 0; b < 4; b++) { kick(t + b * BEAT); hat(t + b * BEAT + BEAT / 2); if (b % 2) snare(t + b * BEAT); }
    taiko(t, 0.7);
    if (bar === 5) { riser(t, BAR); for (let k = 0; k < 8; k++) snare(t + 2 * BEAT + k * BEAT / 4, 0.35 + k * 0.09); }
  }
  if (drop) {
    choir(t, c.choir.map((m) => m + 12).concat(c.choir), BAR, 1.1);
    guitar(t, c.gtr, BAR * 0.98, false, -0.7); guitar(t + 0.01, c.gtr, BAR * 0.98, false, 0.7);
    brass(t, c.brass, BEAT * 1.5, 1); brass(t + BEAT * 2.5, c.brass, BEAT * 0.5, 0.9); brass(t + BEAT * 3, c.brass, BEAT * 0.9, 1);
    for (let e = 0; e < 8; e++) bass(t + e * BEAT / 2, c.bass + (e % 4 === 3 ? 12 : 0), BEAT / 2 * 0.85);
    for (let b = 0; b < 4; b++) { kick(t + b * BEAT); if (bar % 4 === 3 && b >= 2) kick(t + b * BEAT + BEAT / 2, 0.8);   // double kick at end of phrase
      ride(t + b * BEAT); hat(t + b * BEAT + BEAT / 2, 0.8); if (b % 2) snare(t + b * BEAT, 1.1); }
    if (bar % 4 === 0) { crash(t, 1.1); boom(t); taiko(t, 1); }
    const h0 = ((bar - 6) % 4) * 4; HOOK.filter((n) => n[0] >= h0 && n[0] < h0 + 4).forEach(([b, m, d]) => lead(t + (b - h0) * BEAT, m + (bar >= 14 ? 12 : 0), d * BEAT * 0.95));
    if (bar === 17) [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].forEach((b, i) => tom(t + b * BEAT, 55 - i * 2));
  }
  if (fin) {
    if (bar === 18) { crash(t, 1.2); boom(t); [0, 1, 1.5, 2.5].forEach((b) => { kick(t + b * BEAT, 1.1); taiko(t + b * BEAT, 0.9); brass(t + b * BEAT, CH[0].brass, BEAT * 0.4, 1.1); }); }
    if (bar === 19) { kick(t, 1.2); crash(t, 1); boom(t); guitar(t, 38, BAR * 1.2, false, -0.6); guitar(t + 0.01, 38, BAR * 1.2, false, 0.6); brass(t, [50, 57, 62, 69, 74], BAR * 1.1, 1.2); }
    choir(t, [62, 65, 69, 74], BAR, 1.4);
  }
}

/* ---------------- mastering: reverb (combs + diffusion), bus drive, normalization, fades ---------------- */
function reverb(x, ds, g) { const y = Float32Array.from(x); for (const d of ds) { const n = Math.floor(d * SR); for (let i = n; i < N; i++) y[i] += y[i - n] * g; } return y; }
const RL = reverb(L, [0.029, 0.041, 0.057], 0.2), RR = reverb(R, [0.033, 0.045, 0.061], 0.2);
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = Math.min(1, t / 0.03) * (t > LEN - 2.2 ? Math.max(0, (LEN - t) / 2.2) : 1);
  RL[i] = Math.tanh(RL[i] * 1.25) * fade; RR[i] = Math.tanh(RR[i] * 1.25) * fade;
  peak = Math.max(peak, Math.abs(RL[i]), Math.abs(RR[i]));
}
// level aligned on the previous version (≈ -12.5 dB average) 
const k = 0.89 / peak * 0.72, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(RL[i] * k * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(RR[i] * k * 32767), 46 + i * 4); }
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'musique-recap.wav');
fs.writeFileSync(out, buf);
console.log('✔', out, LEN.toFixed(1) + ' s');
