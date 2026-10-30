// Schéma des cartes, normalisation, CSV, détection des doublons et comparaison avec la base.
const Cards = (() => {
  // Colonnes officielles du format d'import/export
  const FIELDS = ['uid', 'card_id', 'print_id', 'name', 'set_code', 'set_name', 'number', 'rarity', 'type',
    'colors', 'affiliation', 'variant', 'image_url', 'release_date', 'status', 'language', 'products',
    'cost', 'power', 'counter', 'source'];
  const LIST_FIELDS = ['colors', 'affiliation', 'products'];
  const NUM_FIELDS = ['cost', 'power', 'counter'];
  const TYPES = ['Leader', 'Character', 'Event', 'Stage', 'DON!!', 'Autre'];
  const STATUSES = { published: 'Publiée', announced: 'Annoncée', pending: 'À vérifier' };
  const RARITIES = ['L', 'C', 'UC', 'R', 'SR', 'SEC', 'SP', 'TR', 'MR', 'P', 'DON'];
  const RARITY_LABELS = { L: 'Leader', C: 'Commune', UC: 'Peu commune', R: 'Rare', SR: 'Super Rare', SEC: 'Secret Rare',
    SP: 'Special (SP)', TR: 'Treasure Rare', MR: 'Manga Rare', P: 'Promo', DON: 'DON!!' };
  const LANG_LABELS = { en: 'Anglais', jp: 'Japonais', fr: 'Français', 'en-asia': 'Anglais (Asie)',
    'zh-hk': 'Chinois (HK)', 'zh-tw': 'Chinois (TW)', th: 'Thaï' };

  // En-têtes acceptés à l'import (français, anglais, formats courants)
  const ALIASES = {
    uid: ['uid', 'cle', 'clé', 'key'],
    card_id: ['card_id', 'id', 'identifiant', 'code', 'card number', 'cardnumber', 'card_code', 'numero carte'],
    print_id: ['print_id', 'impression', 'print', 'variant_id', 'id_impression'],
    name: ['name', 'nom', 'personnage', 'card_name', 'nom de la carte'],
    set_code: ['set_code', 'extension', 'set', 'code extension', 'code_extension', 'set_id', 'serie_code'],
    set_name: ['set_name', 'serie', 'série', 'nom serie', 'nom de la série', 'nom_extension', 'series'],
    number: ['number', 'numero', 'numéro', 'no', 'num'],
    rarity: ['rarity', 'rarete', 'rareté'],
    type: ['type', 'category', 'categorie', 'catégorie', 'card_type'],
    colors: ['colors', 'color', 'couleur', 'couleurs', 'colour'],
    affiliation: ['affiliation', 'equipage', 'équipage', 'famille', 'types', 'traits', 'crew', 'sub_types'],
    variant: ['variant', 'version', 'variante'],
    image_url: ['image_url', 'image', 'img', 'img_url', 'img_full_url', 'url image', 'url_image'],
    release_date: ['release_date', 'date', 'date de sortie', 'date_sortie', 'sortie'],
    status: ['status', 'statut'],
    language: ['language', 'langue', 'lang'],
    products: ['products', 'produits', 'packs', 'pack', 'reimpressions', 'réimpressions'],
    cost: ['cost', 'cout', 'coût'],
    power: ['power', 'puissance'],
    counter: ['counter', 'contre'],
    source: ['source'],
  };
  const aliasMap = {};
  const norm = s => String(s ?? '').trim();
  const key = s => norm(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s_-]+/g, ' ');
  Object.entries(ALIASES).forEach(([f, list]) => [f, ...list].forEach(a => { aliasMap[key(a)] = f; }));

  const RARITY_IN = {
    common: 'C', commune: 'C', c: 'C', uncommon: 'UC', 'peu commune': 'UC', uc: 'UC', rare: 'R', r: 'R',
    superrare: 'SR', 'super rare': 'SR', sr: 'SR', secretrare: 'SEC', 'secret rare': 'SEC', sec: 'SEC', scr: 'SEC',
    leader: 'L', l: 'L', special: 'SP', sp: 'SP', 'sp card': 'SP', treasurerare: 'TR', 'treasure rare': 'TR', tr: 'TR',
    'manga rare': 'MR', mangarare: 'MR', manga: 'MR', mr: 'MR', promo: 'P', p: 'P', pr: 'P', don: 'DON', 'don!!': 'DON',
  };
  const TYPE_IN = { leader: 'Leader', character: 'Character', personnage: 'Character', event: 'Event', evenement: 'Event',
    'événement': 'Event', stage: 'Stage', lieu: 'Stage', terrain: 'Stage', don: 'DON!!', 'don!!': 'DON!!' };
  const STATUS_IN = { published: 'published', publiee: 'published', 'publiée': 'published', released: 'published',
    announced: 'announced', annoncee: 'announced', 'annoncée': 'announced', pending: 'pending',
    'en attente': 'pending', 'à vérifier': 'pending', 'a verifier': 'pending', 'en attente de vérification': 'pending' };
  const LANG_IN = { english: 'en', anglais: 'en', en: 'en', japanese: 'jp', japonais: 'jp', jp: 'jp', ja: 'jp',
    french: 'fr', 'français': 'fr', francais: 'fr', fr: 'fr' };
  const COLOR_IN = { rouge: 'Red', red: 'Red', vert: 'Green', green: 'Green', bleu: 'Blue', blue: 'Blue',
    violet: 'Purple', purple: 'Purple', noir: 'Black', black: 'Black', jaune: 'Yellow', yellow: 'Yellow' };
  const COLOR_LABELS = { Red: 'Rouge', Green: 'Vert', Blue: 'Bleu', Purple: 'Violet', Black: 'Noir', Yellow: 'Jaune' };

  function toList(v) {
    if (Array.isArray(v)) return v.map(norm).filter(Boolean);
    return norm(v).split(/[|;\/]/).map(norm).filter(Boolean);
  }

  function setFromId(cardId) {
    let m = cardId.match(/^(OP|ST|EB|PRB)(\d+)-(\d+)/i);
    if (m) return { set_code: `${m[1].toUpperCase()}-${m[2]}`, number: m[3] };
    m = cardId.match(/^P-(\d+)/i);
    if (m) return { set_code: 'PROMO', number: m[1] };
    return { set_code: '', number: '' };
  }

  function variantFromPrint(printId) {
    const m = printId.match(/_(p|r)(\d+)$/);
    if (!m) return 'Normale';
    return m[1] === 'p' ? `Parallèle / Alt-art ${m[2]}` : `Réimpression ${m[2]}`;
  }

  // Transforme une ligne (CSV ou JSON, n'importe quel format reconnu) en carte normalisée.
  // Retourne { card } ou { error }.
  function normalize(raw, defaults = {}) {
    const r = {};
    // Format brut Punk Records / site officiel
    if (raw && raw.img_full_url !== undefined && raw.category !== undefined) {
      raw = { print_id: raw.id, name: raw.name, rarity: raw.rarity, type: raw.category, colors: raw.colors,
        affiliation: raw.types, image_url: raw.img_full_url, cost: raw.cost, power: raw.power, counter: raw.counter };
    }
    Object.entries(raw || {}).forEach(([k, v]) => {
      const f = aliasMap[key(k)] || (FIELDS.includes(k) ? k : null);
      if (f && (r[f] === undefined || r[f] === '')) r[f] = v;
    });
    const c = {};
    c.print_id = norm(r.print_id);
    c.card_id = norm(r.card_id).toUpperCase() || c.print_id.replace(/_[a-z]+\d*$/i, '').toUpperCase();
    if (!c.print_id) c.print_id = c.card_id;
    c.name = norm(r.name).replace(/&amp;/g, '&');
    if (!c.card_id) return { error: 'Identifiant de carte manquant' };
    if (!c.name) return { error: `Nom manquant pour ${c.card_id}` };
    const fromId = setFromId(c.card_id);
    c.set_code = norm(r.set_code).toUpperCase() || defaults.set_code || fromId.set_code || 'AUTRE';
    c.set_name = norm(r.set_name) || defaults.set_name || '';
    c.number = norm(r.number) || fromId.number;
    const rar = norm(r.rarity);
    c.rarity = RARITY_IN[rar.toLowerCase()] || rar.toUpperCase();
    const ty = norm(r.type);
    c.type = TYPE_IN[ty.toLowerCase()] || (ty ? ty : 'Autre');
    c.colors = toList(r.colors).map(x => COLOR_IN[x.toLowerCase()] || x);
    c.affiliation = toList(r.affiliation);
    c.variant = norm(r.variant) || variantFromPrint(c.print_id);
    // Une variante non normale sans identifiant d'impression propre reçoit un suffixe pour rester distincte
    if (c.print_id === c.card_id && c.variant !== 'Normale' && norm(r.variant)) {
      c.print_id = `${c.card_id}_${c.variant.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }
    c.image_url = norm(r.image_url);
    c.release_date = norm(r.release_date);
    const st = norm(r.status);
    c.status = STATUS_IN[st.toLowerCase()] || (st ? 'pending' : (defaults.status || 'published'));
    const lg = norm(r.language);
    c.language = LANG_IN[lg.toLowerCase()] || lg.toLowerCase() || defaults.language || 'en';
    c.products = toList(r.products);
    if (!c.products.length) c.products = [c.set_code];
    NUM_FIELDS.forEach(f => {
      const n = r[f] === '' || r[f] === null || r[f] === undefined ? null : Number(r[f]);
      if (n !== null && !Number.isNaN(n)) c[f] = n;
    });
    c.source = norm(r.source) || defaults.source || 'import';
    c.uid = `${c.language}:${c.print_id}`;
    return { card: c };
  }

  // Champs comparés pour savoir si une carte a été modifiée
  const COMPARE = FIELDS.filter(f => !['uid', 'source'].includes(f));
  function same(a, b) {
    return COMPARE.every(f => {
      const x = a[f], y = b[f];
      if (LIST_FIELDS.includes(f)) return (x || []).join('|') === (y || []).join('|');
      return (x ?? '') === (y ?? '');
    });
  }
  function diffFields(a, b) {
    return COMPARE.filter(f => LIST_FIELDS.includes(f)
      ? (a[f] || []).join('|') !== (b[f] || []).join('|') : (a[f] ?? '') !== (b[f] ?? ''));
  }

  const mergeProducts = (a, b) => [...new Set([...(a || []), ...(b || [])])];

  // Analyse d'un lot de lignes face à la base actuelle.
  // Chaque ligne obtient un statut : new | update | same | dup_file | dup_probable | error
  function analyze(rows, existing, defaults = {}) {
    const byUid = new Map(existing.map(c => [c.uid, c]));
    // Signature « même carte, même illustration » pour repérer les doublons sous un autre identifiant
    const sig = c => `${c.language}|${c.card_id}|${c.image_url || c.variant}`;
    const bySig = new Map();
    existing.forEach(c => bySig.set(sig(c), c));
    const seen = new Map();
    const out = [];
    rows.forEach((raw, i) => {
      const { card, error } = normalize(raw, defaults);
      if (error) return out.push({ line: i + 1, status: 'error', message: error, raw });
      const prev = seen.get(card.uid);
      if (prev) {
        // Même impression présente deux fois dans le fichier : on fusionne les produits (réimpression)
        prev.card.products = mergeProducts(prev.card.products, card.products);
        return out.push({ line: i + 1, status: 'dup_file', card, message: `Doublon de la ligne ${prev.line} (produits fusionnés)` });
      }
      const entry = { line: i + 1, card };
      seen.set(card.uid, entry);
      const old = byUid.get(card.uid);
      if (old) {
        card.products = mergeProducts(old.products, card.products);
        if (!card.release_date && old.release_date) card.release_date = old.release_date;
        if (same(old, card)) { entry.status = 'same'; entry.message = 'Déjà à jour'; }
        else { entry.status = 'update'; entry.old = old; entry.message = 'Modifié : ' + diffFields(old, card).join(', '); }
      } else {
        const twin = bySig.get(sig(card));
        if (twin && card.image_url) { entry.status = 'dup_probable'; entry.message = `Doublon probable de ${twin.uid}`; }
        else { entry.status = 'new'; entry.message = 'Nouvelle carte'; }
      }
      out.push(entry);
    });
    return out;
  }

  // ---------- CSV ----------
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const first = text.split(/\r?\n/, 1)[0];
    const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';'
      : (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? '\t' : ',';
    const rows = [];
    let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    const nonEmpty = rows.filter(r => r.some(c => c.trim() !== ''));
    if (!nonEmpty.length) return [];
    const head = nonEmpty[0].map(h => h.trim());
    return nonEmpty.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
  }

  function toCSV(cards) {
    const esc = v => {
      const s = Array.isArray(v) ? v.join('|') : (v ?? '') + '';
      return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return '﻿' + [FIELDS.join(','), ...cards.map(c => FIELDS.map(f => esc(c[f])).join(','))].join('\r\n');
  }

  // Lit le contenu d'un fichier JSON quel que soit son format (liste, sauvegarde, export Punk Records…)
  function rowsFromJSON(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.cards)) return data.cards;
    if (data && typeof data === 'object') {
      const vals = Object.values(data);
      if (vals.every(v => v && typeof v === 'object' && !Array.isArray(v))) return vals;
    }
    throw new Error('Format JSON non reconnu : une liste de cartes ou un objet { "cards": [...] } est attendu.');
  }

  return { FIELDS, TYPES, STATUSES, RARITIES, RARITY_LABELS, LANG_LABELS, COLOR_LABELS, normalize, analyze, parseCSV, toCSV,
    rowsFromJSON, mergeProducts, variantFromPrint, setFromId };
})();
