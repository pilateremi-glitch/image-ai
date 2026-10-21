// Catalogue TCG — uniquement les produits du catalogue précommande Card's House Paris.
// Prix TTC (unité et case) repris du catalogue. Visuels dans img/tcg/.
const TCG_CATALOGUE = [
  // ── Pokémon — Règne Delta (ME06) ─────────────────────────────────────────────
  { id: 'pkm-etb-me06', name: 'ETB ME06 – Règne Delta', category: 'Pokémon', type: 'ETB', serie: 'ME06 Règne Delta',
    status: 'Précommande', langs: ['FR', 'US'], caseQty: 10, unit: 77.75, case: 777.49,
    images: ['img/tcg/pokemon/delta-reign-elite-trainer-box.jpg'] },
  { id: 'pkm-display-me06', name: 'Display ME06 – Règne Delta', category: 'Pokémon', type: 'Display', serie: 'ME06 Règne Delta',
    status: 'Précommande', langs: ['FR', 'US'], caseQty: 6, unit: 272.16, case: 1632.96,
    images: ['img/tcg/pokemon/delta-reign-booster-box.jpg'] },
  { id: 'pkm-tripack-me06', name: 'Tripack ME06 – Règne Delta', category: 'Pokémon', type: 'Tripack', serie: 'ME06 Règne Delta',
    status: 'Précommande', langs: ['FR', 'US'], caseQty: 12, unit: 27.00, case: 324.00,
    images: ['img/tcg/pokemon/delta-reign-3-pack-blister.jpg'] },
  { id: 'pkm-bundle-me06', name: 'Bundle ME06 – Règne Delta', category: 'Pokémon', type: 'Bundle', serie: 'ME06 Règne Delta',
    status: 'Précommande', langs: ['FR', 'US'], caseQty: 25, unit: 59.29, case: 1482.30,
    images: ['img/tcg/pokemon/delta-reign-booster-bundle.jpg'] },

  // ── Pokémon — 30 ans (vagues 2 et 3) ─────────────────────────────────────────
  ...[
    { id: 'pkm-etb-30ans', name: 'ETB 30 ans', type: 'ETB', caseQty: 10, unit: 170.00, case: 1700.00,
      images: ['img/tcg/pokemon/30th-celebration-elite-trainer-box.jpg'] },
    { id: 'pkm-upc-30ans', name: 'UPC 30 ans', type: 'UPC', caseQty: 4, unit: 450.00, case: 1800.00,
      images: ['img/tcg/pokemon/30th-celebration-ultra-premium-collection-day.jpg', 'img/tcg/pokemon/30th-celebration-ultra-premium-collection-night.jpg'] },
    { id: 'pkm-bundle-30ans', name: 'Bundle 30 ans', type: 'Bundle', caseQty: 25, unit: 75.00, case: 1875.00,
      images: ['img/tcg/pokemon/30th-celebration-booster-bundle.jpg'] },
    { id: 'pkm-minitin-30ans', name: 'Mini Tin 30 ans', type: 'Mini Tin', caseQty: 4, unit: 245.00, case: 980.00,
      images: ['img/tcg/pokemon/30th-celebration-mini-tin-display.jpg', 'img/tcg/pokemon/30th-celebration-mini-tin-day-pikachu.jpg', 'img/tcg/pokemon/30th-celebration-mini-tin-night-pikachu.jpg'] },
    { id: 'pkm-duopack-30ans', name: 'Duopack 30 ans', type: 'Duopack', caseQty: 12, unit: 27.00, case: 324.00,
      images: ['img/tcg/pokemon/30th-celebration-2-pack-blister.jpg'] },
    { id: 'pkm-tripack-30ans', name: 'Tripack 30 ans', type: 'Tripack', caseQty: 12, unit: 43.09, case: 517.10,
      images: ['img/tcg/pokemon/30th-celebration-tripack.jpg'] },
    { id: 'pkm-classeur-30ans', name: 'Coffret Classeur 30 ans', type: 'Coffret', caseQty: 6, unit: 64.69, case: 388.15,
      images: ['img/tcg/pokemon/30th-celebration-binder-collection.jpg'] },
    { id: 'pkm-figurine-30ans', name: 'Coffret Figurine 30 ans', type: 'Coffret', caseQty: 6, unit: 75.49, case: 452.95,
      images: ['img/tcg/pokemon/30th-celebration-figure-collection-mew.jpg', 'img/tcg/pokemon/30th-celebration-figure-collection-mewtwo.jpg'] },
  ].map(p => ({ ...p, category: 'Pokémon', serie: 'Pokémon 30 ans', langs: ['FR', 'US'],
    status: 'Précommande', delivery: 'Vagues 2 et 3 · livraison entre mars et septembre 2027' })),

  // ── One Piece ────────────────────────────────────────────────────────────────
  { id: 'op-display-eb05', name: 'Display EB05', category: 'One Piece', type: 'Display', serie: 'EB05 Heroines Edition Vol. 2',
    langs: ['FR', 'US'], caseQty: 12, unit: 187.50, case: 2250.00,
    images: ['img/tcg/onepiece/extra-booster-one-piece-heroines-edition-vol-2-booster-box.jpg'] },
  { id: 'op-display-op17', name: 'Display OP17', category: 'One Piece', type: 'Display', serie: "OP17 The World's Strongest Warriors",
    status: 'Commande 1', delivery: 'Vague 2027', langs: ['FR', 'US'], caseQty: 12, unit: 216.67, case: 2600.00,
    images: ['img/tcg/onepiece/the-world-s-strongest-warriors-booster-box.jpg'] },
  { id: 'op-display-op18', name: 'Display OP18', category: 'One Piece', type: 'Display', serie: 'OP18 The Dominance of God',
    status: 'Précommande', delivery: 'Novembre 2026', langs: ['FR', 'US'], caseQty: 12, unit: 187.50, case: 2250.00,
    images: ['img/tcg/onepiece/the-dominance-of-god-booster-box.jpg'] },
  { id: 'op-display-eb06', name: 'Display EB06', category: 'One Piece', type: 'Display', serie: 'EB06',
    langs: ['FR', 'US'], caseQty: 12, unit: 187.50, case: 2250.00,
    images: ['img/tcg/onepiece/display-eb06.jpg'] },

  // ── Riftbound ────────────────────────────────────────────────────────────────
  ...[
    ['origin', 'Origin', 'origins', 151.63, 909.79, 172.80, 1036.80],
    ['spirit', 'Spirit', 'spiritforged', 129.60, 777.60, 162.00, 972.00],
    ['unleash', 'Unleash', 'unleashed', 129.60, 777.60, 151.63, 909.79],
    ['vendetta', 'Vendetta', 'vendetta', 119.23, 715.39, 141.26, 847.58],
    ['radiance', 'Radiance', 'radiance', 119.23, 715.39, 141.26, 847.58],
  ].flatMap(([key, label, img, frUnit, frCase, usUnit, usCase]) => [
    { id: `rb-display-${key}-fr`, name: `Display ${label} 🇫🇷`, lang: 'FR', unit: frUnit, case: frCase,
      status: 'Disponible', delivery: 'Livraison sous 2 à 3 semaines' },
    { id: `rb-display-${key}-us`, name: `Display ${label} 🇺🇸`, lang: 'US', unit: usUnit, case: usCase },
  ].map(p => ({ ...p, category: 'Riftbound', type: 'Display', serie: `Riftbound ${label}`, caseQty: 6,
    images: [`img/tcg/riftbound/${img}-booster-display.jpg`] }))),
];

const TCG_DESCRIPTIONS = {
  ETB: "Elite Trainer Box officielle : boosters, sleeves, dés, marqueurs et carte promo exclusive.",
  Display: "Display scellée d'usine contenant l'intégralité des boosters de l'extension. Le meilleur rapport quantité/prix pour ouvrir ou collectionner.",
  Bundle: "Bundle de boosters de l'extension, scellé d'usine.",
  Tripack: "Blister de 3 boosters avec carte promo, scellé d'usine.",
  Duopack: "Blister de 2 boosters avec carte promo, scellé d'usine.",
  UPC: "Ultra-Premium Collection : le coffret collector le plus complet de la série, avec cartes promo exclusives.",
  'Mini Tin': "Display de Mini Tins collector, chacune contenant boosters et accessoires.",
  Coffret: "Coffret collector officiel, scellé d'usine, contenant boosters et cartes promo exclusives.",
};

// Options proposées : langue (si FR/US) × unité / case, chacune avec son prix TTC
TCG_CATALOGUE.forEach(t => {
  const formats = [['Unité', t.unit], [`Case de ${t.caseQty}`, t.case]];
  const variantPrices = {};
  (t.langs || [null]).forEach(lang => formats.forEach(([fmtLabel, price]) => {
    variantPrices[lang ? `${lang} · ${fmtLabel}` : fmtLabel] = price;
  }));

  PRODUCTS.push({
    id: t.id,
    name: t.name,
    price: t.unit,
    category: t.category,
    type: t.type,
    serie: t.serie,
    status: t.status,
    delivery: t.delivery,
    image: t.images[0],
    images: t.images,
    description: TCG_DESCRIPTIONS[t.type],
    benefits: [
      'Produit officiel 100% authentique',
      'Scellé d\'usine',
      t.langs ? 'Disponible en version FR ou US' : `Version ${t.lang}`,
      `Case de ${t.caseQty} disponible`,
      ...(t.delivery ? [t.delivery] : []),
    ],
    variants: Object.keys(variantPrices),
    variantPrices,
    isFeatured: false,
    isBestSeller: false,
    stock: 50,
  });
});

CATEGORIES.push('Pokémon', 'One Piece', 'Riftbound');
