#!/usr/bin/env node
/* ==========================================================================
   Construit les EMPREINTES VISUELLES des cartes (reconnaissance locale, sans IA)
   Télécharge l'image officielle de chaque carte, calcule son empreinte (src/phash.js)
   et écrit data/print-pokemon.js / data/print-onepiece.js.

   Usage (sur ton PC, connexion Internet nécessaire, reprend là où il s'est arrêté) :
     cd z3-overlay/tools && npm install
     node build-prints.mjs                      → Pokémon FR/EN depuis 2023 + tout One Piece
     node build-prints.mjs --sets sv08,me05     → seulement ces extensions
     node build-prints.mjs --since 2016         → Pokémon depuis 2016
     node build-prints.mjs --region all         → inclut les extensions japonaises
     node build-prints.mjs --game onepiece      → seulement One Piece
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const IMG = path.join(process.env.Z3_CACHE || path.join(HERE, '.cache'), 'img');
fs.mkdirSync(IMG, { recursive: true });

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => { if (v.startsWith('--')) a.push([v.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]); return a; }, []));
const GAME = args.game || 'all', SINCE = String(args.since || '2023'), REGION = args.region || 'int';
const ONLY = args.sets ? new Set(String(args.sets).split(',').map((s) => s.trim())) : null;
const CONC = +(args.concurrency || 12), BASE = args.base || '';      // --base : serveur d'images de test

/* charge le moteur d'empreinte et les bases (fichiers générés par nous, lus comme données JSON) */
globalThis.window = globalThis;
await import(path.join(ROOT, 'src', 'phash.js'));
const readDb = (f) => { const t = fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'); return JSON.parse(t.slice(t.indexOf('=', t.indexOf('Z3DB.')) + 1).trim().replace(/;\s*$/, '')); };
const readPrints = (f) => { const p = path.join(ROOT, 'data', f); if (!fs.existsSync(p)) return {}; const t = fs.readFileSync(p, 'utf8'); return JSON.parse(t.slice(t.indexOf('{', t.indexOf('Z3PRINTS.'))).trim().replace(/;\s*$/, '')); };

const jobs = { pokemon: [], onepiece: [] };
if (GAME === 'all' || GAME === 'pokemon') {
  const P = readDb('db-pokemon.js');
  P.cards.forEach((c) => {
    const s = P.sets[c[0]];
    const [id, region, , , , , , , , , date, serieId] = s;
    if (!serieId) return;
    if (ONLY ? !ONLY.has(id) : ((REGION !== 'all' && region !== REGION) || (date || '') < SINCE)) return;
    jobs.pokemon.push({ key: `pk:${id}:${region}:${c[1]}`, url: `https://assets.tcgdex.net/${region === 'jp' ? 'ja' : 'en'}/${serieId}/${id}/${c[1]}/low.webp` });
  });
}
if (GAME === 'all' || GAME === 'onepiece') {
  const O = readDb('db-onepiece.js');
  O.cards.forEach((c) => { const pack = O.packs[c[1]] || []; if (c[8] && (!ONLY || ONLY.has(pack[1]) || ONLY.has(c[0].split('-')[0]))) jobs.onepiece.push({ key: 'op:' + c[0], url: c[8] }); });
}

async function fetchImg(job) {
  const file = path.join(IMG, job.key.replace(/[^\w.-]/g, '_') + '.img');
  if (fs.existsSync(file)) return fs.readFileSync(file);
  const url = BASE ? job.url.replace(/^https?:\/\/[^/]+/, BASE) : job.url;
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'z3-overlay-master-set/1.0' } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer()); fs.writeFileSync(file, buf); return buf;
    } catch (e) { if (t === 2) throw e; await new Promise((res) => setTimeout(res, 800 * (t + 1))); }
  }
  return null;
}

for (const game of ['pokemon', 'onepiece']) {
  const list = jobs[game]; if (!list.length) continue;
  const outFile = `print-${game}.js`, prints = readPrints(outFile);
  const todo = list.filter((j) => !prints[j.key]);
  console.log(`${game} : ${list.length} cartes sélectionnées, ${todo.length} à calculer`);
  let done = 0, missing = 0, failed = 0, i = 0;
  const save = () => fs.writeFileSync(path.join(ROOT, 'data', outFile),
    `/* Empreintes visuelles ${game} — générées par tools/build-prints.mjs */\nwindow.Z3PRINTS=window.Z3PRINTS||{};window.Z3PRINTS.${game}=${JSON.stringify(prints)};\n`);
  async function worker() {
    while (i < todo.length) {
      const job = todo[i++];
      try {
        const buf = await fetchImg(job);
        if (!buf) { missing++; continue; }
        const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const p = window.Z3Print.cardPrint(data, info.width, info.height);
        prints[job.key] = p.f + p.a + p.c.map((v) => v.toString(16).padStart(2, '0')).join('');
      } catch (e) { failed++; }
      if (++done % 200 === 0) { save(); console.log(`  ${done}/${todo.length}`); }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  save();
  console.log(`✔ ${game} : ${Object.keys(prints).length} empreintes (${missing} images absentes, ${failed} erreurs)`);
}
