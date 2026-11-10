/* ==========================================================================
   Z3 — bruitages synthétisés (Web Audio, aucun fichier) pour la capture des hits
   roll(sec)  : roulement de la balle sur le cadre
   capture(t) : « clic » de fermeture + 3 secousses + jingle (plus fort selon le niveau)
   ?nosound pour couper · ?volume=0.6 (0 à 1)
   Dans OBS : Propriétés de la source › cocher « Contrôler l'audio via OBS » pour le régler au mixeur.
   ========================================================================== */
(function (global) {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const VOL = Math.max(0, Math.min(1, parseFloat(Q.get('volume') || '0.7')));
  let ac = null;
  function ctx() {
    if (Q.has('nosound') || !VOL) return null;
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
    return ac;
  }
  function out(a, v) { const g = a.createGain(); g.gain.value = v * VOL; g.connect(a.destination); return g; }
  function tone(a, dest, f, t, d, type, v, f2) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.05);
  }
  function noise(a, dest, t, d, v, freq, q) {
    const n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * d), a.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    const g = a.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    n.buffer = b; n.connect(f); f.connect(g); g.connect(dest); n.start(t);
  }
  /* roulement : petits chocs réguliers + grondement */
  function roll(sec) {
    const a = ctx(); if (!a) return;
    const d = out(a, 0.5), t0 = a.currentTime;
    noise(a, d, t0, sec, 0.25, 180, 0.7);
    for (let t = 0; t < sec; t += 0.09) noise(a, d, t0 + t, 0.05, 0.5, 900 + Math.random() * 500, 3);
  }
  const JINGLE = {                       // notes du jingle par niveau
    rare: [784, 988, 1175],
    ultra: [659, 784, 988, 1319],
    secret: [523, 659, 784, 1047, 1319, 1568],
    god: [523, 659, 784, 1047, 784, 1047, 1319, 1568, 2093],
  };
  function capture(tier) {
    const a = ctx(); if (!a) return;
    const d = out(a, 0.8), t0 = a.currentTime;
    // clic de fermeture
    tone(a, d, 1800, t0, 0.06, 'square', 0.25, 600); noise(a, d, t0, 0.05, 0.6, 2500, 2);
    // 3 secousses « toc… toc… toc »
    [0.28, 0.62, 0.96].forEach((s) => { tone(a, d, 220, t0 + s, 0.12, 'triangle', 0.5, 140); noise(a, d, t0 + s, 0.06, 0.35, 1200, 4); });
    // « clic » final de capture puis jingle
    const tj = t0 + 1.3;
    tone(a, d, 2400, tj, 0.05, 'square', 0.2, 1200);
    (JINGLE[tier] || JINGLE.rare).forEach((f, i) => { tone(a, d, f, tj + 0.12 + i * 0.11, 0.35, 'square', 0.12); tone(a, d, f * 2, tj + 0.12 + i * 0.11, 0.3, 'sine', 0.08); });
    if (tier === 'secret' || tier === 'god') for (let i = 0; i < 14; i++) tone(a, d, 2500 + Math.random() * 2500, tj + 0.2 + i * 0.07, 0.18, 'sine', 0.05);   // scintillement
    if (tier === 'god') tone(a, d, 130, tj + 0.1, 1.6, 'sawtooth', 0.12, 260);   // montée épique
  }
  global.Z3Sfx = { roll, capture };
})(typeof window !== 'undefined' ? window : globalThis);
