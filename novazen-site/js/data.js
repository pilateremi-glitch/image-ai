// ── Boutique : à personnaliser ────────────────────────────────────────────────
const SHOP_CONFIG = {
  name: 'PokéShop',            // nom affiché (logo, titres)
  tagline: 'Merch & cartes Pokémon',
  paypalMe: 'MON_PSEUDO',      // https://paypal.me/MON_PSEUDO
  instagram: 'MON_INSTAGRAM',  // pseudo Instagram sans @
  tiktok: 'MON_TIKTOK',        // pseudo TikTok sans @
  currency: 'EUR',
  freeShippingFrom: 35,        // livraison offerte dès ce montant
  shippingFee: 4.9,            // sinon
  adminPin: '1234',            // code d'accès à admin.html (à changer)
};

// ── Produits ──────────────────────────────────────────────────────────────────
// images : chemins vers tes photos (ex : 'img/peluche-pikachu.jpg').
// Sans image, un visuel dessiné est affiché :
// art = booster | box | plush | figure | stickers | keychain | binder | sleeves | hoodie
// color = yellow | blue | violet | red | pink | green | orange
const PRODUCTS = [
  {
    id: 'peluche-pikachu-30cm',
    name: 'Peluche Pikachu 30 cm',
    price: 24.9,
    comparePrice: 29.9,
    category: 'Peluches',
    art: 'plush', color: 'yellow',
    images: [],
    description: 'Le compagnon star, tout doux et ultra câlin. Broderies soignées, tissu minky premium : parfait sur une étagère comme dans un lit.',
    benefits: ['Tissu minky ultra doux', 'Broderies (pas de pièces collées)', '30 cm de câlins', 'Produit officiel sous licence'],
    badges: ['Best-seller'],
    stock: 12,
  },
  {
    id: 'booster-pokemon-ev',
    name: 'Booster Pokémon (à l\'unité)',
    price: 5.9,
    category: 'Cartes',
    art: 'booster', color: 'blue',
    images: [],
    description: 'Un booster scellé de l\'extension du moment. 10 cartes dont au moins une rare… et peut-être une carte illustration spéciale !',
    benefits: ['Booster scellé d\'origine', '10 cartes par booster', 'Envoi protégé sous sleeve rigide', 'Version française'],
    badges: ['Nouveau'],
    stock: 48,
    variants: ['1 booster', 'Lot de 3', 'Lot de 6'],
    variantPrices: { 'Lot de 3': 16.9, 'Lot de 6': 32.9 },
  },
  {
    id: 'coffret-dresseur-elite',
    name: 'Coffret Dresseur d\'Élite',
    price: 54.9,
    comparePrice: 59.9,
    category: 'Cartes',
    art: 'box', color: 'violet',
    images: [],
    description: 'Le coffret ultime pour les collectionneurs : 9 boosters, sleeves, dés, marqueurs et une boîte de rangement collector.',
    benefits: ['9 boosters inclus', '65 protège-cartes', 'Dés & marqueurs', 'Boîte de rangement collector'],
    badges: ['Rare'],
    stock: 4,
  },
  {
    id: 'peluche-evoli-25cm',
    name: 'Peluche Évoli 25 cm',
    price: 22.9,
    category: 'Peluches',
    art: 'plush', color: 'orange',
    images: [],
    description: 'Évoli et sa collerette toute douce. Le cadeau parfait pour les fans de ses évolutions.',
    benefits: ['Collerette extra moelleuse', '25 cm', 'Produit officiel sous licence'],
    badges: [],
    stock: 9,
  },
  {
    id: 'figurine-dracaufeu',
    name: 'Figurine Dracaufeu',
    price: 19.9,
    category: 'Figurines',
    art: 'figure', color: 'red',
    images: [],
    description: 'Figurine détaillée de Dracaufeu en pose de combat, peinte à la main. Idéale pour ton bureau ou ta vitrine.',
    benefits: ['Peinte à la main', 'Socle inclus', 'Environ 12 cm'],
    badges: ['Best-seller'],
    stock: 15,
  },
  {
    id: 'stickers-kawaii-x20',
    name: 'Lot de 20 stickers kawaii',
    price: 6.9,
    category: 'Goodies',
    art: 'stickers', color: 'pink',
    images: [],
    description: '20 stickers vinyles waterproof aux couleurs pastel pour customiser gourde, laptop, classeur ou téléphone.',
    benefits: ['Vinyle waterproof', 'Finition mate', '20 designs différents'],
    badges: ['Nouveau'],
    stock: 60,
  },
  {
    id: 'porte-cles-pokeball',
    name: 'Porte-clés Pokéball',
    price: 8.9,
    category: 'Goodies',
    art: 'keychain', color: 'red',
    images: [],
    description: 'Une Pokéball en métal émaillé qui s\'ouvre vraiment. Toujours prête pour une capture.',
    benefits: ['Métal émaillé', 'S\'ouvre et se ferme', 'Anneau renforcé'],
    badges: [],
    stock: 25,
    variants: ['Pokéball', 'Superball', 'Hyperball'],
  },
  {
    id: 'classeur-9-cases',
    name: 'Classeur 9 cases – 360 cartes',
    price: 17.9,
    category: 'Accessoires',
    art: 'binder', color: 'violet',
    images: [],
    description: 'Range et protège ta collection : 20 pages double face à 9 poches, fermeture zip et couverture rigide.',
    benefits: ['360 cartes', 'Poches side-loading anti-chute', 'Fermeture zip', 'Sans acide (PVC free)'],
    badges: [],
    stock: 18,
  },
  {
    id: 'sleeves-x100',
    name: 'Protège-cartes x100',
    price: 4.9,
    category: 'Accessoires',
    art: 'sleeves', color: 'blue',
    images: [],
    description: 'Sleeves transparentes taille standard pour protéger tes cartes des rayures et de la poussière.',
    benefits: ['Taille standard 66×91 mm', 'Transparentes', 'Sans acide'],
    badges: [],
    stock: 80,
  },
  {
    id: 'sweat-pikachu',
    name: 'Sweat Pikachu brodé',
    price: 39.9,
    comparePrice: 44.9,
    category: 'Goodies',
    art: 'hoodie', color: 'yellow',
    images: [],
    description: 'Sweat oversize doux à l\'intérieur, avec petite broderie Pikachu sur le cœur. Unisexe.',
    benefits: ['Coton bio molletonné', 'Broderie haute qualité', 'Coupe oversize unisexe'],
    badges: ['Précommande'],
    stock: 20,
    variants: ['S', 'M', 'L', 'XL'],
  },
];

const PROMO_CODES = {
  'POKESHOP10': { discount: 10, type: 'percent', label: '-10%' },
  'BIENVENUE': { discount: 15, type: 'percent', label: '-15%' },
  'POKESHOP5':  { discount: 5,  type: 'fixed',   label: '-5€' },
};

const CATEGORIES = [
  { name: 'Cartes', icon: 'cards', color: 'yellow', hint: 'Boosters & coffrets' },
  { name: 'Peluches', icon: 'heart', color: 'pink', hint: 'Ultra douces' },
  { name: 'Figurines', icon: 'flame', color: 'orange', hint: 'Pour ta vitrine' },
  { name: 'Accessoires', icon: 'shield', color: 'blue', hint: 'Protège ta collec' },
  { name: 'Goodies', icon: 'star', color: 'green', hint: 'Stickers, sweats…' },
];
