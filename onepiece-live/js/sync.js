// Synchronisation manuelle avec des sources externes.
// Chaque source est un « adaptateur » : pour en ajouter une nouvelle, il suffit d'ajouter un objet
// { id, label, description, options, fetch(opts, progress) } dans SOURCES. fetch() renvoie
// { cards: [...cartes normalisées...], meta: {...} } ou lève une erreur explicite.
const Sync = (() => {
  const PUNK_BASE = 'https://raw.githubusercontent.com/buhbbl/punk-records/main';
  const PUNK_API = 'https://api.github.com/repos/buhbbl/punk-records/contents';
  const PUNK_LANGS = { en: 'english', jp: 'japanese', fr: 'french', 'en-asia': 'english-asia',
    'zh-hk': 'chinese-hongkong', 'zh-tw': 'chinese-taiwan', th: 'thai' };
  const RARITY = { Common: 'C', Uncommon: 'UC', Rare: 'R', SuperRare: 'SR', SecretRare: 'SEC', Leader: 'L',
    Special: 'SP', TreasureRare: 'TR', Promo: 'P' };
  const TYPE = { Leader: 'Leader', Character: 'Character', Event: 'Event', Stage: 'Stage', Don: 'DON!!' };

  const decode = s => { const t = document.createElement('textarea'); t.innerHTML = s || ''; return t.value; };

  async function getJSON(url) {
    let res;
    try { res = await fetch(url, { cache: 'no-store' }); }
    catch (e) { throw new Error(`Source injoignable (${url}) : vérifiez la connexion internet.`); }
    if (!res.ok) throw new Error(`La source a répondu ${res.status} pour ${url}`);
    return res.json();
  }

  // Même règle que tools/build_seed.py
  function packCode(packId, label) {
    if (label) return label;
    const fam = packId.slice(-3, -2), n = packId.slice(-2);
    return { 0: `ST-${n}`, 1: `OP-${n}`, 2: `EB-${n}`, 3: `PRB-${n}`, 8: 'OTHER', 9: 'PROMO' }[fam] || `PACK-${packId.slice(-3)}`;
  }

  // Pages combinées du site (« OP14-EB04 ») : même règle que tools/build_seed.py
  function productFor(product, setCode) {
    const m = product.match(/^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/);
    if (m && [`${m[1]}-${m[2]}`, `${m[3]}-${m[4]}`].includes(setCode)) return setCode;
    return product;
  }

  // Préfixe numérique des identifiants de produits par langue sur le site officiel (plan B sans API GitHub)
  const PACK_PREFIX = { english: '569', japanese: '550', french: '622', 'english-asia': '556',
    'chinese-hongkong': '554', 'chinese-taiwan': '554', thai: '563' };
  async function langPrefix(folder) {
    if (PACK_PREFIX[folder]) return PACK_PREFIX[folder];
    throw new Error(`Impossible de déterminer les produits disponibles pour ${folder}.`);
  }

  async function pool(items, size, fn) {
    const out = []; let i = 0;
    await Promise.all(Array.from({ length: size }, async () => {
      while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
    }));
    return out;
  }

  const punkRecords = {
    id: 'punk-records',
    label: 'Punk Records (données du site officiel One Piece Card Game)',
    description: 'Jeu de données JSON public généré à partir de la liste officielle (en.onepiece-cardgame.com, '
      + 'onepiece-cardgame.dev pour le Japon…). Langues : anglais, japonais, français, anglais Asie, chinois, thaï. '
      + 'Le dépôt est mis à jour par la communauté : il peut avoir quelques jours de retard sur une sortie.',
    languages: Object.keys(PUNK_LANGS),
    async fetch({ languages, sets }, progress) {
      const wanted = sets && sets.length ? new Set(sets.map(s => s.toUpperCase())) : null;
      // Noms des extensions (référence anglaise)
      const setNames = { PROMO: 'Promotion card', OTHER: 'Other Product Card' };
      const enPacks = await getJSON(`${PUNK_BASE}/english/packs.json`);
      Object.values(enPacks).forEach(p => {
        const lab = p.title_parts?.label || '';
        if (/^(OP|ST|EB|PRB)-\d+$/.test(lab) && p.title_parts?.title) setNames[lab] = decode(p.title_parts.title);
        const m = lab.match(/^OP(\d+)-EB\d+$/);
        if (m && p.title_parts?.title && p.title_parts.title !== 'BOOSTER PACK') setNames[`OP-${m[1]}`] ||= decode(p.title_parts.title);
      });
      const cards = new Map();
      const meta = { languages: {}, files: 0 };
      for (const lang of languages) {
        const folder = PUNK_LANGS[lang];
        progress(`Lecture de la liste des produits (${lang})…`);
        let manifest = null;
        try { manifest = await getJSON(`${PUNK_BASE}/${folder}/manifest.json`); } catch (e) { /* facultatif */ }
        let packs = {};
        try { packs = await getJSON(`${PUNK_BASE}/${folder}/packs.json`); } catch (e) { packs = {}; }
        let ids = Object.keys(packs);
        let probe = false;
        if (!ids.length) {
          // Certaines langues n'ont pas de packs.json rempli : on liste le dossier via l'API GitHub,
          // ou, si elle est limitée, on teste les identifiants de produits connus (+ les suivants).
          try {
            const listing = await getJSON(`${PUNK_API}/${folder}/data`);
            ids = listing.filter(f => f.name.endsWith('.json')).map(f => f.name.replace('.json', ''));
          } catch (e) {
            progress('API GitHub indisponible : recherche des produits par identifiant…');
            const prefix = await langPrefix(folder);
            const fams = {};
            Object.keys(enPacks).forEach(id => { const f = id.slice(-3, -2); fams[f] = Math.max(fams[f] || 0, Number(id.slice(-2))); });
            ids = [];
            Object.entries(fams).forEach(([f, max]) => { for (let n = 1; n <= max + 3; n++) ids.push(`${prefix}${f}${String(n).padStart(2, '0')}`); });
            ['701', '702'].forEach(x => ids.push(prefix + x));
            probe = true;
          }
        }
        meta.languages[lang] = { generated_at: manifest?.generated_at ? new Date(manifest.generated_at * 1000).toISOString() : null, packs: 0 };
        let done = 0;
        await pool(ids, 6, async pid => {
          const packProduct = packCode(pid, packs[pid]?.title_parts?.label);
          let list;
          try { list = await getJSON(`${PUNK_BASE}/${folder}/data/${pid}.json`); }
          catch (e) { if (probe && /\b404\b/.test(e.message)) return; throw e; }
          meta.files++; meta.languages[lang].packs++;
          progress(`${lang.toUpperCase()} : ${++done}/${ids.length} produits téléchargés`);
          list.forEach(c => {
            const printId = c.id;
            const cardId = printId.replace(/_[a-z]+\d*$/, '');
            const { set_code, number } = Cards.setFromId(cardId);
            const sc = set_code || 'OTHER';
            const product = productFor(packProduct, sc);
            if (wanted && !wanted.has(sc) && !wanted.has(product.toUpperCase())) return;
            const uid = `${lang}:${printId}`;
            const prev = cards.get(uid);
            if (prev) { if (!prev.products.includes(product)) prev.products.push(product); return; }
            const card = {
              uid, card_id: cardId, print_id: printId, name: decode(c.name), set_code: sc,
              set_name: setNames[sc] || sc, number, rarity: RARITY[c.rarity] || c.rarity || '',
              type: TYPE[c.category] || c.category || '', colors: c.colors || [],
              affiliation: (c.types || []).map(decode), variant: Cards.variantFromPrint(printId),
              image_url: c.img_full_url || '', release_date: '', status: 'published', language: lang,
              products: [product], source: 'punk-records',
            };
            ['cost', 'power', 'counter'].forEach(f => { if (c[f] !== null && c[f] !== undefined) card[f] = c[f]; });
            cards.set(uid, card);
          });
        });
      }
      return { cards: [...cards.values()], meta };
    },
  };

  // Source générique : n'importe quelle URL renvoyant un JSON ou un CSV au format de l'application.
  const customUrl = {
    id: 'custom-url',
    label: 'URL personnalisée (JSON ou CSV au format de l\'application)',
    description: 'Pour une future source (Koala Kollect, votre propre fichier hébergé, etc.). '
      + 'L\'URL doit être accessible depuis le navigateur (CORS autorisé).',
    needsUrl: true,
    async fetch({ url }, progress) {
      if (!url) throw new Error('Indiquez l\'URL de la source.');
      progress('Téléchargement…');
      let res;
      try { res = await fetch(url, { cache: 'no-store' }); }
      catch (e) { throw new Error('Source injoignable (réseau ou CORS bloqué).'); }
      if (!res.ok) throw new Error(`La source a répondu ${res.status}.`);
      const text = await res.text();
      const rows = text.trim().startsWith('[') || text.trim().startsWith('{')
        ? Cards.rowsFromJSON(JSON.parse(text)) : Cards.parseCSV(text);
      return { cards: rows, meta: { url, rows: rows.length }, raw: true };
    },
  };

  const SOURCES = [punkRecords, customUrl];
  return { SOURCES, get: id => SOURCES.find(s => s.id === id) };
})();
