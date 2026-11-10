#!/usr/bin/env node
/* ==========================================================================
   Construit la base « master set » interne (data/db-*.js) :
     • Pokémon international (FR/EN) + japonais  ← TCGdex  (github.com/tcgdex/cards-database, MIT)
     • One Piece Card Game (FR/EN)               ← Punk Records (github.com/buhbbl/punk-records,
                                                   extrait du site officiel One Piece Card Game)
   Usage :  cd z3-overlay/tools && npm install && node build-db.mjs
   Relancer après chaque nouvelle extension pour mettre la base à jour.
   ========================================================================== */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import * as acorn from 'acorn';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = process.env.Z3_CACHE || path.join(HERE, '.cache');
const OUT = path.join(HERE, '..', 'data');
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

function repo(name, url) {
  const dir = path.join(CACHE, name);
  if (fs.existsSync(dir)) execSync('git pull -q --depth 1', { cwd: dir, stdio: 'inherit' });
  else execSync(`git clone -q --depth 1 ${url} "${dir}"`, { stdio: 'inherit' });
  return dir;
}

/* ---------------- niveaux d'alerte : 0 commune · 1 rare · 2 ultra (HIT) · 3 secrète ---------------- */
const PK_TIER = {
  'Rare': 1, 'Rare Holo': 1, 'Holo Rare': 1,
  'Ultra Rare': 2, 'Double rare': 2, 'Triple Rare': 2, 'Holo Rare V': 2, 'Holo Rare VMAX': 2, 'Holo Rare VSTAR': 2,
  'Rare Holo LV.X': 2, 'Rare PRIME': 2, 'LEGEND': 2, 'Radiant Rare': 2, 'Amazing Rare': 2, 'Shiny rare': 2,
  'Shiny rare V': 2, 'Shiny rare VMAX': 2, 'Illustration rare': 2, 'ACE SPEC Rare': 2, 'Full Art Trainer': 2,
  'Classic Collection': 2, 'Mega Attack Rare': 2, 'Pikachu Rare': 2, 'Character Rare': 2,
  'Secret Rare': 3, 'Special illustration rare': 3, 'Hyper rare': 3, 'Shiny Ultra Rare': 3, 'Mega Hyper Rare': 3,
  'Black White Rare': 3, 'RGB Rare': 3, 'Futuristic Rare': 3, 'Crown': 3, 'Character Super Rare': 3,
};
const HIT_NAME = /(\bex$|-ex$|\bEX$|-EX$|\bGX$|-GX$|\bV$|-V$|VMAX|VSTAR|V-UNION|LV\.X|☆|\bBREAK$|\bPrime$|TAG TEAM|\bLEGEND\b)/i;
const OP_TIER = { Common: 0, Uncommon: 0, Promo: 0, Leader: 1, Rare: 1, SuperRare: 2, SecretRare: 3, Special: 3, TreasureRare: 3 };

/* ---------------- lecture SÛRE des fichiers TCGdex ----------------
   Les fichiers .ts ne sont jamais exécutés : ils sont transpilés (esbuild.transform),
   analysés (acorn) et seules les valeurs littérales (texte, nombres, listes, objets) sont lues. */
const parsed = new Map();
function literal(node, ids) {
  if (!node) return undefined;
  switch (node.type) {
    case 'Literal': return node.value;
    case 'TemplateLiteral': return node.expressions.length ? undefined : node.quasis.map((q) => q.value.cooked).join('');
    case 'UnaryExpression': { const v = literal(node.argument, ids); return node.operator === '-' && typeof v === 'number' ? -v : undefined; }
    case 'ArrayExpression': return node.elements.map((e) => literal(e, ids));
    case 'ObjectExpression': {
      const o = {};
      for (const p of node.properties) {
        if (p.type !== 'Property' || p.computed) continue;
        o[p.key.type === 'Identifier' ? p.key.name : p.key.value] = literal(p.value, ids);
      }
      return o;
    }
    case 'Identifier': return ids[node.name];
    default: return undefined;
  }
}
function readTs(file) {
  if (parsed.has(file)) return parsed.get(file);
  parsed.set(file, undefined);
  const js = esbuild.transformSync(fs.readFileSync(file, 'utf8'), { loader: 'ts', format: 'esm' }).code;
  const ast = acorn.parse(js, { ecmaVersion: 'latest', sourceType: 'module' });
  const ids = {};
  let value;
  for (const n of ast.body) {
    if (n.type === 'ImportDeclaration' && n.source.value.startsWith('.')) {
      const def = n.specifiers.find((x) => x.type === 'ImportDefaultSpecifier');
      const target = path.resolve(path.dirname(file), n.source.value + '.ts');
      if (def && fs.existsSync(target)) ids[def.local.name] = readTs(target);
    } else if (n.type === 'VariableDeclaration') {
      for (const d of n.declarations) if (d.id.type === 'Identifier') ids[d.id.name] = literal(d.init, ids);
    } else if (n.type === 'ExportDefaultDeclaration') {
      value = literal(n.declaration, ids);
    } else if (n.type === 'ExportNamedDeclaration') {            // esbuild : export { card as default }
      for (const sp of n.specifiers || []) if ((sp.exported.name || sp.exported.value) === 'default') value = ids[sp.local.name];
    }
  }
  parsed.set(file, value);
  return value;
}

/* ---------------- Pokémon (TCGdex) ---------------- */
async function pokemon(root, dataDir, region) {
  const src = path.join(root, dataDir);
  const files = [];
  (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name.endsWith('.ts')) files.push(p); } })(src);
  const sets = new Map(), cards = [];
  for (const f of files) {
    const rel = path.relative(src, f), parts = rel.split(path.sep);
    if (parts.length !== 3) continue;                                    // Série/Extension/carte.ts
    const c = readTs(f) || {}, s = c.set || {}, serie = s.serie || {};
    if (!s.id || /pocket/i.test(serie.name && serie.name.en || '') || serie.id === 'tcgp') continue;   // TCG Pocket = numérique
    if (!sets.has(s.id)) {
      sets.set(s.id, {
        id: s.id, region, serieId: serie.id || '', serie: (serie.name && (serie.name.fr || serie.name.en || serie.name.ja)) || serie.id || '',
        fr: (s.name && s.name.fr) || '', en: (s.name && s.name.en) || '', ja: (s.name && s.name.ja) || '',
        code: (s.abbreviations && s.abbreviations.official) || '', codeFr: (s.abbreviations && s.abbreviations.fr) || '',
        off: (s.cardCount && s.cardCount.official) || 0, date: typeof s.releaseDate === 'object' && s.releaseDate ? String(Object.values(s.releaseDate)[0] || '') : String(s.releaseDate || ''), n: 0,
      });
    }
    const set = sets.get(s.id); set.n++;
    const local = parts[2].replace(/\.ts$/, ''), num = parseInt(local, 10);
    let tier = PK_TIER[c.rarity] || 0;
    const nm = (c.name && (c.name.en || c.name.fr)) || '';
    if (tier < 2 && c.rarity !== 'Promo' && HIT_NAME.test(nm)) tier = 2;             // ex / EX / GX / V / VMAX / VSTAR / LV.X / ☆ / Prime…
    if (set.off && num > set.off && tier < 2 && c.rarity !== 'Promo') tier = 3;   // numéro hors set = secrète
    cards.push({ s: s.id, l: local, fr: (c.name && c.name.fr) || '', en: (c.name && c.name.en) || '', ja: (c.name && c.name.ja) || '', r: c.rarity || '', t: tier, c: c.category || '' });
  }
  return { sets: [...sets.values()], cards };
}

const decode = (t) => { let x = String(t || ''), prev; do { prev = x; x = x.replace(/&amp;/g, '&').replace(/&(apos|#39);/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); } while (x !== prev); return x; };
/* ---------------- One Piece (Punk Records) ---------------- */
function onepiece(root) {
  const packs = new Map(), cards = new Map();
  for (const [lang, key] of [['english', 'en'], ['french', 'fr']]) {
    const dir = path.join(root, lang);
    if (!fs.existsSync(dir)) continue;
    const pk = JSON.parse(fs.readFileSync(path.join(dir, 'packs.json'), 'utf8'));
    for (const p of Object.values(pk)) {
      const label = (p.title_parts && p.title_parts.label) || (p.raw_title.match(/\[([^\]]+)\]/) || [])[1] || '';
      const cur = packs.get(p.id) || { id: p.id, label, en: '', fr: '' };
      cur[key] = decode(p.raw_title); if (!cur.label) cur.label = label; packs.set(p.id, cur);
    }
    for (const sub of fs.readdirSync(path.join(dir, 'cards'))) {
      for (const f of fs.readdirSync(path.join(dir, 'cards', sub))) {
        const d = JSON.parse(fs.readFileSync(path.join(dir, 'cards', sub, f), 'utf8'));
        const cur = cards.get(d.id) || { id: d.id, base: d.id.split('_')[0], v: (d.id.split('_')[1] || ''), p: d.pack_id, en: '', fr: '', r: d.rarity, k: d.category, col: (d.colors || []).join('/'), img: '' };
        if (d.img_full_url && (key === 'fr' || !cur.img)) cur.img = d.img_full_url;
        cur[key] = decode(d.name); cards.set(d.id, cur);
      }
    }
  }
  for (const c of cards.values()) {
    let t = OP_TIER[c.r] ?? 0;
    if (c.v.startsWith('p')) t = Math.max(t, c.r === 'Leader' || c.r === 'Rare' || c.r === 'Common' || c.r === 'Uncommon' ? 2 : 3);   // parallèle / alt art
    c.t = t;
  }
  return { packs: [...packs.values()], cards: [...cards.values()] };
}

/* ---------------- écriture compacte ---------------- */
function writePokemon(intl, jp) {
  const sets = [...intl.sets, ...jp.sets].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const idx = new Map(sets.map((s, i) => [s.id + '|' + s.region, i]));
  const rar = [...new Set([...intl.cards, ...jp.cards].map((c) => c.r))];
  const rows = [];
  for (const [list, region] of [[intl.cards, 'int'], [jp.cards, 'jp']]) {
    for (const c of list) rows.push([idx.get(c.s + '|' + region), c.l, c.fr, c.en, c.ja, rar.indexOf(c.r), c.t]);
  }
  const db = { v: 1, built: new Date().toISOString(), source: 'TCGdex (MIT)', rarities: rar,
    sets: sets.map((s) => [s.id, s.region, s.serie, s.fr, s.en, s.ja, s.code, s.codeFr, s.off, s.n, s.date, s.serieId]), cards: rows };
  fs.writeFileSync(path.join(OUT, 'db-pokemon.js'), '/* Base master set Pokémon — générée par tools/build-db.mjs — source TCGdex (MIT) */\n' +
    'window.Z3DB=window.Z3DB||{};window.Z3DB.pokemon=' + JSON.stringify(db) + ';\n');
  return { sets: sets.length, cards: rows.length };
}
function writeOnePiece(op) {
  const packs = op.packs.filter((p) => p.label || p.en || p.fr);
  const pidx = new Map(packs.map((p, i) => [p.id, i]));
  const rar = [...new Set(op.cards.map((c) => c.r))];
  const db = { v: 1, built: new Date().toISOString(), source: 'Punk Records / site officiel One Piece Card Game', rarities: rar,
    packs: packs.map((p) => [p.id, p.label, p.fr, p.en]),
    cards: op.cards.sort((a, b) => a.id.localeCompare(b.id)).map((c) => [c.id, pidx.has(c.p) ? pidx.get(c.p) : -1, c.fr, c.en, rar.indexOf(c.r), c.t, c.k, c.col, c.img]) };
  fs.writeFileSync(path.join(OUT, 'db-onepiece.js'), '/* Base master set One Piece Card Game — générée par tools/build-db.mjs — données © Bandai / Eiichiro Oda */\n' +
    'window.Z3DB=window.Z3DB||{};window.Z3DB.onepiece=' + JSON.stringify(db) + ';\n');
  return { packs: packs.length, cards: db.cards.length };
}

const tcgdex = repo('cards-database', 'https://github.com/tcgdex/cards-database.git');
const punk = repo('punk-records', 'https://github.com/buhbbl/punk-records.git');
console.log('Pokémon international…'); const intl = await pokemon(tcgdex, 'data', 'int');
console.log('Pokémon japonais…'); const jp = await pokemon(tcgdex, 'data-asia', 'jp');
console.log('One Piece…'); const op = onepiece(punk);
const a = writePokemon(intl, jp), b = writeOnePiece(op);
const meta = { built: new Date().toISOString(), pokemon: a, onepiece: b };
fs.writeFileSync(path.join(OUT, 'db-meta.json'), JSON.stringify(meta, null, 2));
console.log('✔ Base écrite :', JSON.stringify(meta));
