// Moteur de jeu : familles, analyse d'un produit, objectifs éligibles, tirage équitable et validation.
// Règle d'or : une carte n'appartient à une famille QUE si l'un de ses traits (données « types /
// affiliation » officielles) figure dans la liste de traits de cette famille. Jamais d'après le nom.
const Games = (() => {
  const CATEGORIES = {
    crew: 'Équipage',
    people: 'Peuple',
    org: 'Organisation',
    arc: 'Arc / lieu',
  };

  // Familles par défaut — modifiables dans « Règles du jeu » (traits exacts tels qu'imprimés en anglais).
  const DEFAULT_FAMILIES = [
    ['straw-hat', 'Équipage du Chapeau de paille', 'crew', ['Straw Hat Crew']],
    ['whitebeard', 'Pirates de Barbe Blanche', 'crew', ['Whitebeard Pirates']],
    ['blackbeard', 'Pirates de Barbe Noire', 'crew', ['Blackbeard Pirates']],
    ['red-haired', 'Pirates du Roux', 'crew', ['Red-Haired Pirates']],
    ['big-mom', 'Pirates de Big Mom', 'crew', ['Big Mom Pirates']],
    ['beasts', 'Pirates aux Cent Bêtes', 'crew', ['Animal Kingdom Pirates']],
    ['heart', 'Heart Pirates', 'crew', ['Heart Pirates']],
    ['kid', 'Kid Pirates', 'crew', ['Kid Pirates']],
    ['donquixote', 'Pirates de Don Quichotte', 'crew', ['Donquixote Pirates']],
    ['roger', 'Pirates de Roger', 'crew', ['Roger Pirates']],
    ['kuja', 'Pirates Kuja', 'crew', ['Kuja Pirates']],
    ['sun', 'Pirates du Soleil', 'crew', ['The Sun Pirates']],
    ['cross-guild', 'Cross Guild', 'crew', ['Cross Guild']],
    ['fishman', 'Hommes-Poissons', 'people', ['Fish-Man']],
    ['merfolk', 'Sirènes et Tritons', 'people', ['Merfolk']],
    ['giant', 'Géants', 'people', ['Giant']],
    ['mink', 'Minks', 'people', ['Minks']],
    ['lunarian', 'Lunariens', 'people', ['Lunarian']],
    ['tontatta', 'Tontattas', 'people', ['The Tontattas']],
    ['human', 'Humains', 'people', ['Human']],
    ['navy', 'Marine', 'org', ['Navy']],
    ['world-gov', 'Gouvernement mondial', 'org', ['World Government', 'CP0', 'CP9', 'Five Elders']],
    ['revolutionary', 'Révolutionnaires', 'org', ['Revolutionary Army']],
    ['vinsmoke', 'Famille Vinsmoke', 'org', ['The Vinsmoke Family']],
    ['baroque', 'Baroque Works', 'org', ['Baroque Works']],
    ['supernovas', 'Supernovas', 'org', ['Supernovas']],
    ['warlords', 'Sept Grands Corsaires', 'org', ['The Seven Warlords of the Sea']],
    ['emperors', 'Quatre Empereurs', 'org', ['The Four Emperors']],
    ['impel-down', 'Impel Down', 'org', ['Impel Down']],
    ['wano', 'Personnages de Wano', 'arc', ['Land of Wano']],
    ['east-blue', 'Personnages d\'East Blue', 'arc', ['East Blue']],
    ['dressrosa', 'Personnages de Dressrosa', 'arc', ['Dressrosa']],
    ['egghead', 'Personnages d\'Egghead', 'arc', ['Egghead']],
    ['alabasta', 'Personnages d\'Alabasta', 'arc', ['Alabasta']],
    ['sky-island', 'Personnages de Skypiea', 'arc', ['Sky Island']],
    ['fishman-island', 'Personnages de l\'Île des Hommes-Poissons', 'arc', ['Fish-Man Island']],
    ['water-seven', 'Personnages de Water Seven', 'arc', ['Water Seven']],
    ['elbaph', 'Personnages d\'Elbaph', 'arc', ['Elbaph']],
  ].map(([id, label, category, traits]) => ({ id, label, category, traits, enabled: true }));

  // Types de jeux : A à F (+ la carte précise)
  const GAME_TYPES = {
    A: { name: 'Jeu A — Les Équipages', kinds: ['crew'], description: 'La roue choisit un équipage. Gagné si une carte portant ce trait sort de tes boosters.' },
    B: { name: 'Jeu B — Les Peuples de Grand Line', kinds: ['people'], description: 'La roue choisit un peuple (Hommes-Poissons, Géants, Minks…). Gagné si une carte de ce peuple sort.' },
    C: { name: 'Jeu C — Les Personnages', kinds: ['character'], description: 'La roue choisit un personnage de l\'extension. Gagné si une carte de ce personnage sort.' },
    D: { name: 'Jeu D — Organisations et Arcs', kinds: ['org', 'arc', 'trait'], description: 'La roue choisit une organisation, une faction ou un arc. Gagné si une carte portant ce trait sort.' },
    E: { name: 'Jeu E — Les Raretés', kinds: ['rarity', 'parallel', 'manga'], description: 'La roue choisit une rareté. Gagné si une carte de cette rareté sort. Aucune rareté n\'est garantie dans un booster.' },
    F: { name: 'Jeu F — La Roue Ultime', kinds: ['crew', 'people', 'character', 'org', 'arc', 'rarity', 'parallel', 'manga'], description: 'Tous les critères mélangés : équipages, peuples, personnages, organisations et raretés.' },
    H: { name: 'Jeu H — Les Familles de la série', kinds: ['crew', 'people', 'org', 'arc'], description: 'La roue choisit une des familles les plus présentes dans la série (équipages, peuples, organisations, arcs). Gagné si une carte de cette famille sort.' },
    G: { name: 'Jeu G — La Carte Précise', kinds: ['card'], description: 'La roue choisit une carte précise (impression exacte) du produit. Gagné si cette carte sort.' },
  };

  const DEFAULT_RULES = id => ({
    id,
    name: GAME_TYPES[id].name,
    description: GAME_TYPES[id].description,
    successText: '',
    boosters: id === 'G' ? 3 : 1,
    validation: 'manual',       // manual | auto
    parallels: 'count',         // count | exclude  (cartes parallèles / alternatives)
    reprints: 'allow',          // allow | exclude  (cartes rééditées d'une autre extension)
    successes: 'single',        // single | multiple
    duplicatesText: 'Si plusieurs cartes valident l\'objectif, une seule réussite est comptée (sauf mode « plusieurs réussites »).',
    products: [],               // extensions compatibles (vide = toutes)
    cancelText: 'Tour annulé et rejoué si : booster abîmé ou ouvert hors caméra, erreur de saisie du pseudo, problème technique avant l\'ouverture.',
    categories: GAME_TYPES[id].kinds.slice(),
    otherTraits: id === 'D',    // proposer aussi les traits non classés présents dans le produit
    topN: id === 'H' ? 6 : 0,   // ne garder que les N familles les plus présentes dans la série (0 = toutes)
    weights: {},                // pondérations explicites { objectiveId: poids } (1 par défaut)
  });

  const norm = s => String(s || '').trim().toLowerCase();
  const isParallel = c => /_p\d+$/i.test(c.print_id) || /parall|alt/i.test(c.variant || '');
  const isManga = c => c.rarity === 'MR' || /manga/i.test(c.variant || '');
  const isReprintVariant = c => /_r\d+$/i.test(c.print_id) || /r[ée]impression/i.test(c.variant || '');

  // Traits « effectifs » : pour une carte non anglaise, on reprend les traits de la même impression
  // officielle anglaise (même identifiant) quand elle existe ; sinon on traduit grâce aux paires connues.
  function buildTraitIndex(allCards) {
    const enByPrint = new Map();
    allCards.forEach(c => { if (c.language === 'en') enByPrint.set(c.print_id, c); });
    const learned = new Map(); // trait local -> trait anglais (appris sur les paires de même longueur)
    allCards.forEach(c => {
      if (c.language === 'en') return;
      const en = enByPrint.get(c.print_id);
      if (en && en.affiliation.length === c.affiliation.length && c.affiliation.length === 1) learned.set(c.affiliation[0], en.affiliation[0]);
    });
    const cache = new Map();
    const traitsOf = c => {
      if (cache.has(c.uid)) return cache.get(c.uid);
      let t = c.affiliation || [];
      if (c.language !== 'en') {
        const en = enByPrint.get(c.print_id);
        t = en ? en.affiliation : t.map(x => learned.get(x) || x);
      }
      cache.set(c.uid, t);
      return t;
    };
    // Nom de référence (anglais si l'impression anglaise existe) pour comparer les personnages entre langues
    traitsOf.nameOf = c => (c.language !== 'en' && enByPrint.get(c.print_id)?.name) || c.name;
    return traitsOf;
  }

  // Cartes connues d'un produit (une carte rééditée appartient à chacun de ses produits)
  function productCards(allCards, products, languages) {
    const ps = new Set(products);
    return allCards.filter(c => (!languages.length || languages.includes(c.language))
      && (c.products || []).some(p => ps.has(p)));
  }

  // Construit la liste des objectifs compatibles avec le produit, avec le nombre de cartes concernées.
  function analyze({ allCards, products, languages, families, rules, traitsOf }) {
    const cards = productCards(allCards, products, languages);
    const usable = cards.filter(c => eligibleByRules(c, rules, products));
    const objectives = [];
    const famTraits = new Set();
    const cats = new Set(rules.categories);
    families.filter(f => f.enabled !== false).forEach(f => {
      f.traits.forEach(t => famTraits.add(norm(t)));
      if (!cats.has(f.category)) return;
      const obj = { id: `fam:${f.id}`, kind: 'family', category: f.category, label: f.label, traits: f.traits.slice() };
      objectives.push(withCount(obj, usable, rules, traitsOf, cards));
    });
    if (rules.otherTraits) {
      const seen = new Map();
      usable.forEach(c => traitsOf(c).forEach(t => { if (!famTraits.has(norm(t)) && t !== '?') seen.set(t, true); }));
      [...seen.keys()].sort().forEach(t => objectives.push(withCount(
        { id: `trait:${t}`, kind: 'family', category: 'trait', label: `Trait « ${t} »`, traits: [t] }, usable, rules, traitsOf, cards)));
    }
    if (cats.has('character')) {
      const names = new Map();
      usable.filter(c => c.type === 'Character' || c.type === 'Leader').forEach(c => {
        const n = traitsOf.nameOf(c);
        if (!names.has(norm(n))) names.set(norm(n), n);
      });
      [...names.values()].sort((a, b) => a.localeCompare(b)).forEach(n => objectives.push(withCount(
        { id: `char:${norm(n)}`, kind: 'character', category: 'character', label: n, name: n }, usable, rules, traitsOf, cards)));
    }
    if (cats.has('rarity')) {
      const rar = [...new Set(usable.map(c => c.rarity).filter(Boolean))];
      const order = Cards.RARITIES;
      rar.sort((a, b) => (order.indexOf(a) + 99 * (order.indexOf(a) < 0)) - (order.indexOf(b) + 99 * (order.indexOf(b) < 0)));
      const hasC = rar.includes('C'), hasUC = rar.includes('UC');
      if (hasC || hasUC) objectives.push(withCount({ id: 'rar:C|UC', kind: 'rarity', category: 'rarity', label: 'Rareté C ou UC', codes: ['C', 'UC'] }, usable, rules, traitsOf, cards));
      rar.filter(r => r !== 'C' && r !== 'UC').forEach(r => objectives.push(withCount(
        { id: `rar:${r}`, kind: 'rarity', category: 'rarity', label: `Rareté ${r}${Cards.RARITY_LABELS[r] && Cards.RARITY_LABELS[r] !== r ? ' — ' + Cards.RARITY_LABELS[r] : ''}`, codes: [r] },
        usable, rules, traitsOf, cards)));
    }
    if (cats.has('parallel')) objectives.push(withCount({ id: 'parallel', kind: 'parallel', category: 'rarity', label: 'Carte parallèle / alternative' }, cards, rules, traitsOf, cards));
    if (cats.has('manga')) objectives.push(withCount({ id: 'manga', kind: 'manga', category: 'rarity', label: 'Manga Rare' }, cards, rules, traitsOf, cards));
    if (cats.has('card')) {
      usable.forEach(c => objectives.push({ id: `card:${c.uid}`, kind: 'card', category: 'card', uid: c.uid,
        label: `${c.name} (${c.print_id}${c.variant !== 'Normale' ? ' · ' + c.variant : ''})`, count: 1,
        pending: c.status !== 'published', examples: [c] }));
    }
    // Jeu « familles de la série » : on ne garde que les N familles qui ont le plus de cartes
    let excluded = [];
    if (rules.topN > 0) {
      const fams = objectives.filter(o => o.kind === 'family');
      const keep = new Set(topFamilies(fams, rules.topN).map(o => o.id));
      excluded = fams.filter(o => o.count > 0 && !keep.has(o.id));
      for (let i = objectives.length - 1; i >= 0; i--) {
        if (objectives[i].kind === 'family' && !keep.has(objectives[i].id)) objectives.splice(i, 1);
      }
    }
    return { cards, usable, objectives, excluded, coverage: coverage(cards, traitsOf) };
  }

  // Les N familles les plus représentées (au moins 2 cartes si possible, sinon au moins 1)
  function topFamilies(fams, n) {
    const sorted = fams.filter(o => o.count > 0).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    const solid = sorted.filter(o => o.count >= 2);
    return (solid.length >= Math.min(n, 4) ? solid : sorted).slice(0, n);
  }

  function withCount(obj, pool, rules, traitsOf, all) {
    const matches = pool.filter(c => matchCard(c, obj, rules, traitsOf, null, true));
    obj.count = matches.length;
    obj.pending = matches.length > 0 && matches.every(c => c.status !== 'published');
    obj.examples = matches.slice(0, 6);
    return obj;
  }

  function eligibleByRules(c, rules, products) {
    if (rules.parallels === 'exclude' && isParallel(c)) return false;
    if (rules.reprints === 'exclude') {
      if (isReprintVariant(c)) return false;
      // Carte d'une autre extension rééditée dans ce produit
      if (products && products.length && !products.some(p => p === c.set_code || p.replace('-', '').includes(c.set_code.replace('-', '')))) return false;
    }
    return true;
  }

  // Une carte valide l'objectif uniquement si ses critères correspondent exactement.
  function matchCard(c, obj, rules, traitsOf, products, skipRules) {
    if (obj.kind === 'parallel') return isParallel(c) && (rules.reprints !== 'exclude' || !isReprintVariant(c));
    if (obj.kind === 'manga') return isManga(c);
    if (!skipRules && !eligibleByRules(c, rules, products)) return false;
    switch (obj.kind) {
      case 'family': {
        const want = new Set(obj.traits.map(norm));
        return traitsOf(c).some(t => want.has(norm(t)));
      }
      case 'character': return norm(traitsOf.nameOf(c)) === norm(obj.name);
      case 'rarity': return obj.codes.includes(c.rarity);
      case 'card': return c.uid === obj.uid;
      default: return false;
    }
  }

  function coverage(cards, traitsOf) {
    const notPublished = cards.filter(c => c.status !== 'published').length;
    const noTraits = cards.filter(c => (c.type === 'Character' || c.type === 'Leader') && !traitsOf(c).length).length;
    const warnings = [];
    if (!cards.length) warnings.push('Aucune carte connue pour ce produit : importez ou synchronisez ses données avant de jouer.');
    if (notPublished) warnings.push(`${notPublished} carte(s) du produit ne sont pas au statut « publiée » : objectifs concernés non confirmés.`);
    if (noTraits) warnings.push(`${noTraits} personnage(s) sans trait renseigné : les objectifs d'équipage/peuple peuvent être sous-estimés.`);
    return { total: cards.length, notPublished, noTraits, warnings };
  }

  // Tirage équitable (crypto) parmi les objectifs actifs, avec pondérations explicites éventuelles.
  function draw(objectives, weights) {
    const w = objectives.map(o => Math.max(0, Number(weights?.[o.id] ?? 1)));
    const total = w.reduce((a, b) => a + b, 0);
    if (!total) return null;
    const r = (crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * total;
    let acc = 0;
    for (let i = 0; i < objectives.length; i++) { acc += w[i]; if (r < acc) return { objective: objectives[i], index: i, probability: w[i] / total }; }
    return { objective: objectives[objectives.length - 1], index: objectives.length - 1, probability: w[w.length - 1] / total };
  }

  function successText(rules, obj) {
    const parts = [];
    if (obj) {
      if (obj.kind === 'family') parts.push(`Une carte portant le trait ${obj.traits.map(t => `« ${t} »`).join(' ou ')}`);
      if (obj.kind === 'character') parts.push(`Une carte du personnage « ${obj.name} »`);
      if (obj.kind === 'rarity') parts.push(`Une carte de rareté ${obj.codes.join(' ou ')}`);
      if (obj.kind === 'parallel') parts.push('Une carte parallèle / alternative');
      if (obj.kind === 'manga') parts.push('Une Manga Rare');
      if (obj.kind === 'card') parts.push(`La carte exacte ${obj.label}`);
    } else parts.push('Une carte correspondant exactement à l\'objectif tiré');
    parts.push(`sort dans les ${rules.boosters} booster(s) ouverts pour ce tour`);
    let s = parts.join(' ') + '.';
    if (obj?.kind !== 'parallel') s += rules.parallels === 'exclude' ? ' Les cartes parallèles / alternatives ne comptent pas.' : ' Les versions parallèles / alternatives comptent.';
    s += rules.reprints === 'exclude' ? ' Les réimpressions ne comptent pas.' : ' Les réimpressions comptent.';
    s += rules.successes === 'multiple' ? ' Chaque carte valide compte comme une réussite.' : ' Une seule réussite est comptée.';
    return s;
  }


  // ---------- Règles automatiques par série ----------
  // Type de produit déduit du code officiel
  function seriesKind(code) {
    if (/^OP-?\d+$/.test(code)) return 'booster';
    if (/^EB-?\d+$/.test(code)) return 'extra';
    if (/^PRB-?\d+$/.test(code)) return 'premium';
    if (/^ST-?\d+$/.test(code)) return 'starter';
    return 'other';
  }
  const KIND_LABELS = { booster: 'Booster principal', extra: 'Extra Booster', premium: 'Premium Booster',
    starter: 'Starter Deck', other: 'Promo / autre produit' };
  // Ordre de préférence des jeux selon le type de produit
  const KIND_PREFS = {
    booster: ['H', 'A', 'F', 'D', 'B', 'E', 'C'],
    extra: ['H', 'D', 'A', 'F', 'E', 'C'],
    premium: ['H', 'E', 'A', 'F', 'D'],
    starter: ['E', 'C', 'G'],
    other: ['E', 'C', 'G'],
  };
  const MIN_OBJ = 4, MAX_OBJ = 30; // une roue lisible et un vrai suspense

  // Propose le jeu et les réglages adaptés à une série, à partir des cartes réellement connues.
  function recommend({ allCards, product, language, families, games, traitsOf }) {
    const kind = seriesKind(product);
    const counts = {};
    Object.keys(GAME_TYPES).forEach(id => {
      const rules = { ...games[id] };
      if (kind === 'premium') rules.reprints = 'allow';
      const a = analyze({ allCards, products: [product], languages: language ? [language] : [], families, rules, traitsOf });
      counts[id] = a.objectives.filter(o => o.count > 0).length;
      if (id === 'A') counts.total = a.cards.length;
    });
    const prefs = KIND_PREFS[kind];
    let gameId = prefs.find(id => counts[id] >= MIN_OBJ && counts[id] <= MAX_OBJ)
      || prefs.find(id => counts[id] >= 2) || prefs[0];
    const cfg = {};
    const reasons = [`${product} est un ${KIND_LABELS[kind].toLowerCase()} : ${counts.total} carte(s) connue(s).`];
    const warnings = [];
    if (kind === 'premium') {
      cfg.reprints = 'allow';
      reasons.push('Un Premium Booster ne contient que des réimpressions : elles sont donc autorisées.');
    }
    if (kind === 'starter') warnings.push('Un Starter Deck a un contenu fixe : aucun objectif n\'y relève du hasard. À utiliser seulement pour un jeu spécial.');
    if (kind === 'other') warnings.push('Produit promotionnel ou divers : le contenu exact d\'un paquet n\'est pas documenté, vérifiez avant de jouer.');
    if (!counts.total) warnings.push('Aucune carte connue pour cette série : importez ou synchronisez ses données avant de jouer.');
    reasons.push(`${GAME_TYPES[gameId].name} retenu : ${counts[gameId]} objectif(s) compatible(s) dans cette série.`);
    return { gameId, cfg, kind, kindLabel: KIND_LABELS[kind], counts, reasons, warnings };
  }

  return { recommend, seriesKind, topFamilies, KIND_LABELS, CATEGORIES, DEFAULT_FAMILIES, GAME_TYPES, DEFAULT_RULES, buildTraitIndex, productCards, analyze,
    matchCard, draw, successText, isParallel, isManga };
})();
