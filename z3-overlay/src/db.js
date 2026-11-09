/* ==========================================================================
   Z3 — recherche dans la base master set (data/db-pokemon.js, data/db-onepiece.js)
   Z3Base.find({ jeu, code, numero, nom, variante, setHint }) → carte officielle + niveau
   Z3Base.sets(game) / Z3Base.cardsOf(game, setIndex) pour le suivi du master set
   ========================================================================== */
(function (global) {
  'use strict';
  const TIER = [null, 'rare', 'ultra', 'secret'];
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9぀-ヿ一-鿿]/g, '');

  function sim(a, b) {                       // ressemblance de deux noms (0..1)
    a = norm(a); b = norm(b);
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.85;
    const g = (s) => { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); m.set(k, (m.get(k) || 0) + 1); } return m; };
    const A = g(a), B = g(b); let inter = 0, tot = 0;
    A.forEach((v, k) => { inter += Math.min(v, B.get(k) || 0); tot += v; }); B.forEach((v) => { tot += v; });
    return tot ? (2 * inter) / tot : 0;
  }

  const DB = () => global.Z3DB || {};
  const game = (j) => (/one\s*piece|^op$/i.test(j || '') ? 'onepiece' : 'pokemon');

  /* ---------- Pokémon ---------- */
  function pkSet(i) { const s = DB().pokemon.sets[i]; return { i, id: s[0], region: s[1], serie: s[2], fr: s[3], en: s[4], ja: s[5], code: s[6], codeFr: s[7], off: s[8], total: s[9], date: s[10] }; }
  function pkCard(c) {
    const P = DB().pokemon, s = pkSet(c[0]);
    return { jeu: 'pokemon', key: 'pk:' + s.id + ':' + s.region + ':' + c[1], set: s, numero: c[1] + (s.off ? '/' + s.off : ''),
      nom: c[2] || c[3] || c[4], nomEn: c[3], rarete: P.rarities[c[5]], niveau: c[6], tier: TIER[c[6]] };
  }
  function findPokemon(q) {
    const P = DB().pokemon; if (!P) return null;
    const num = String(q.numero || '');
    const m = num.match(/([A-Z]{0,4})\s*(\d{1,3})\s*\/\s*([A-Z]{0,4})?\s*(\d{1,3})/i) || num.match(/([A-Z]{0,4})\s*(\d{1,3})/i);
    const pref = m ? (m[1] || '').toUpperCase() : '', n = m ? parseInt(m[2], 10) : NaN, den = m && m[4] ? parseInt(m[4], 10) : NaN;
    const code = norm(q.code), wantJp = /[぀-ヿ]/.test(q.nom || '') || /jap|jp/i.test(q.langue || '');
    let best = null, bestScore = 0;
    for (let k = 0; k < P.cards.length; k++) {
      const c = P.cards[k], s = P.sets[c[0]];
      if (q.setHint !== undefined && q.setHint !== null && q.setHint !== '' && c[0] !== +q.setHint) continue;
      let sc = 0;
      const local = c[1], ln = parseInt(local.replace(/^[A-Z]+/i, ''), 10);
      if (!isNaN(n)) {
        const lp = (local.match(/^[A-Z]+/i) || [''])[0].toUpperCase();
        if (ln !== n || lp !== pref) continue;
        sc += 3;
        if (!isNaN(den)) { if (s[8] === den) sc += 3; else if (Math.abs(s[8] - den) <= 2) sc += 1; else sc -= 2; }
      }
      if (code) { if (norm(s[6]) === code || norm(s[7]) === code || norm(s[0]) === code) sc += 3; }
      const ns = Math.max(sim(q.nom, c[2]), sim(q.nom, c[3]), sim(q.nom, c[4]));
      if (q.nom) { if (ns < 0.35 && isNaN(n)) continue; sc += ns * 4; }
      sc += (s[1] === 'jp') === wantJp ? 0.5 : 0;
      if (sc > bestScore) { bestScore = sc; best = c; }
    }
    if (!best || bestScore < 3.5) return null;
    return Object.assign(pkCard(best), { confiance: Math.min(1, bestScore / 10) });
  }

  /* ---------- One Piece ---------- */
  function opCard(c) {
    const O = DB().onepiece, p = O.packs[c[1]] || [];
    return { jeu: 'onepiece', key: 'op:' + c[0], id: c[0], set: { i: c[1], id: p[0], code: p[1], fr: p[2], en: p[3] }, numero: c[0].split('_')[0],
      variante: c[0].split('_')[1] || '', nom: c[2] || c[3], nomEn: c[3], rarete: O.rarities[c[4]], niveau: c[5], tier: TIER[c[5]] };
  }
  function findOnePiece(q) {
    const O = DB().onepiece; if (!O) return null;
    const m = String(q.numero || q.code || '').toUpperCase().match(/(OP|ST|EB|PRB|P)\s*-?\s*(\d{1,2})\s*-\s*(\d{1,3})/) || String(q.numero || '').toUpperCase().match(/(P)\s*-\s*(\d{3})/);
    let list = [];
    if (m) {
      const base = m[3] ? `${m[1]}${m[1] === 'P' ? '' : m[2].padStart(2, '0')}-${m[3].padStart(3, '0')}` : `P-${m[2]}`;
      list = O.cards.filter((c) => c[0].split('_')[0] === base);
    } else if (q.nom) {
      list = O.cards.filter((c) => Math.max(sim(q.nom, c[2]), sim(q.nom, c[3])) > 0.8);
    }
    if (!list.length) return null;
    const para = /parall|alt|manga|special|sp\b|gold|or\b/i.test(q.variante || '');
    const pick = (para && list.find((c) => /_p/.test(c[0]))) || list.find((c) => !c[0].includes('_')) || list[0];
    return Object.assign(opCard(pick), { confiance: m ? 0.9 : 0.6 });
  }

  function find(q) { return game(q.jeu) === 'onepiece' ? findOnePiece(q) : findPokemon(q); }

  /* ---------- listes pour le suivi du master set ---------- */
  function sets(g) {
    if (g === 'onepiece') return (DB().onepiece ? DB().onepiece.packs : []).map((p, i) => ({ i, id: p[0], code: p[1], fr: p[2], en: p[3] }));
    return (DB().pokemon ? DB().pokemon.sets : []).map((s, i) => pkSet(i));
  }
  const groups = {};
  function cardsOf(g, i) {                    // index construit une seule fois par jeu
    if (!groups[g]) {
      groups[g] = new Map();
      const src = g === 'onepiece' ? DB().onepiece.cards : DB().pokemon.cards, col = g === 'onepiece' ? 1 : 0;
      for (const c of src) { if (!groups[g].has(c[col])) groups[g].set(c[col], []); groups[g].get(c[col]).push(c); }
    }
    return (groups[g].get(i) || []).map(g === 'onepiece' ? opCard : pkCard);
  }

  /* ---------- collection (cartes tirées / possédées) ---------- */
  const CKEY = 'z3-collection-v1';
  const coll = { load() { try { return JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch (e) { return {}; } },
    save(o) { try { localStorage.setItem(CKEY, JSON.stringify(o)); } catch (e) { /* rien */ } },
    add(key, n) { const o = coll.load(); o[key] = Math.max(0, (o[key] || 0) + (n === undefined ? 1 : n)); if (!o[key]) delete o[key]; coll.save(o); return o[key] || 0; } };

  global.Z3Base = { find, sets, cardsOf, sim, norm, collection: coll, TIER };
})(typeof window !== 'undefined' ? window : globalThis);
