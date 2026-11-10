/* Z3 — raretés : nom français + ordre (de la commune à la gold) pour le récap */
(function (global) {
  'use strict';
  const T = {
    'Common': ['Commune', 0], 'None': ['Commune', 0], 'Uncommon': ['Peu commune', 1], 'Promo': ['Promo', 1.5],
    'Rare': ['Rare', 2], 'Rare Holo': ['Rare holo', 3], 'Holo Rare': ['Rare holo', 3], 'Leader': ['Leader', 3],
    'ACE SPEC Rare': ['ACE SPEC', 4], 'Radiant Rare': ['Radieuse', 4], 'Amazing Rare': ['Magnifique', 4],
    'Holo Rare V': ['V', 4.5], 'Holo Rare VMAX': ['VMAX', 4.6], 'Holo Rare VSTAR': ['VSTAR', 4.7],
    'Double rare': ['Double rare (ex)', 5], 'SuperRare': ['Super rare (SR)', 5], 'Triple Rare': ['Triple rare', 5.5],
    'Ultra Rare': ['Ultra rare', 6], 'Shiny rare': ['Chromatique', 6.5], 'Shiny rare V': ['Chromatique', 6.5], 'Shiny rare VMAX': ['Chromatique', 6.5],
    'Illustration rare': ['Illustration rare', 7], 'Character Rare': ['Illustration rare', 7], 'Classic Collection': ['Collection classique', 7],
    'Special illustration rare': ['Illustration spéciale', 8], 'Character Super Rare': ['Illustration spéciale', 8], 'Special': ['Spéciale (SP)', 8],
    'Shiny Ultra Rare': ['Chromatique ultra', 8.5], 'Secret Rare': ['Secrète', 9], 'SecretRare': ['Secrète (SEC)', 9],
    'Hyper rare': ['Hyper rare (gold)', 9.5], 'Mega Hyper Rare': ['Méga hyper rare (gold)', 9.6], 'Black White Rare': ['Black & White', 9.6],
    'Crown': ['Couronne (gold)', 9.7], 'TreasureRare': ['Trésor (TR)', 10],
    'Futuristic Rare': ['Futuriste', 9.3], 'RGB Rare': ['RGB', 9.2], 'Mega Attack Rare': ['Méga attaque', 7.5], 'Pikachu Rare': ['Pikachu', 6], 'Full Art Trainer': ['Dresseur full art', 7],
  };
  function info(r) { const v = T[r]; return v ? { label: v[0], rank: v[1] } : { label: r || 'Commune', rank: 5 }; }
  /* { 'Common': 120, 'Rare': 8, … } → [{ label, count, rank }] fusionnés et triés commune → gold */
  function summary(counts) {
    const m = new Map();
    Object.entries(counts || {}).forEach(([r, n]) => { const i = info(r); const cur = m.get(i.label) || { label: i.label, count: 0, rank: i.rank }; cur.count += n; cur.rank = Math.min(cur.rank, i.rank); m.set(i.label, cur); });
    return [...m.values()].sort((a, b) => a.rank - b.rank);
  }
  global.Z3Rarity = { info, summary };
})(typeof window !== 'undefined' ? window : globalThis);
