// ── Boutique : à personnaliser ────────────────────────────────────────────────
const SHOP_CONFIG = {
  name: 'PokéShop',            // nom affiché (logo, titres)
  tagline: 'Casquettes & drapeaux Pokémon',
  paypalMe: 'MON_PSEUDO',      // https://paypal.me/MON_PSEUDO
  instagram: 'MON_INSTAGRAM',  // pseudo Instagram sans @
  tiktok: 'MON_TIKTOK',        // pseudo TikTok sans @
  currency: 'EUR',
  freeShippingFrom: 35,        // livraison offerte dès ce montant
  shippingFee: 4.9,            // sinon
  adminPin: '1234',            // code d'accès à admin.html (à changer)
};

// ── Produits ──────────────────────────────────────────────────────────────────
// images : chemins vers tes photos (ex : 'img/casquette-pikachu.jpg').
// Sans image, un visuel dessiné est affiché :
// art = cap | flag | pack
// color = couleur principale : yellow | blue | violet | red | pink | green | orange | black
const PRODUCTS = [
  {
    id: 'casquette-pikachu-brodee',
    name: 'Casquette Pikachu brodée',
    price: 24.9,
    comparePrice: 29.9,
    category: 'Casquettes',
    art: 'cap', color: 'yellow',
    images: [],
    description: 'Casquette baseball avec Pikachu brodé en relief sur le devant. Visière incurvée, réglable à l\'arrière : elle va à tout le monde.',
    benefits: ['Broderie 3D en relief', 'Coton épais structuré', 'Taille unique réglable (sangle)', 'Visière incurvée'],
    badges: ['Best-seller'],
    stock: 14,
    variants: ['Noir', 'Jaune', 'Crème'],
  },
  {
    id: 'casquette-ectoplasma-snapback',
    name: 'Snapback Ectoplasma',
    price: 27.9,
    category: 'Casquettes',
    art: 'cap', color: 'violet',
    images: [],
    description: 'Snapback visière plate avec le sourire d\'Ectoplasma brodé. Le côté shadow de la collection.',
    benefits: ['Visière plate', 'Fermeture snap réglable', 'Broderie haute densité', 'Œillets brodés'],
    badges: ['Nouveau'],
    stock: 9,
    variants: ['Noir', 'Violet'],
  },
  {
    id: 'casquette-trucker-pokeball',
    name: 'Casquette trucker Pokéball',
    price: 22.9,
    category: 'Casquettes',
    art: 'cap', color: 'red',
    images: [],
    description: 'Trucker à l\'arrière en filet respirant, patch Pokéball sur le devant. Parfaite pour l\'été et les conventions.',
    benefits: ['Arrière en filet respirant', 'Patch tissé', 'Taille unique réglable'],
    badges: [],
    stock: 20,
    variants: ['Rouge/Blanc', 'Noir/Blanc'],
  },
  {
    id: 'casquette-evoli-dad-hat',
    name: 'Dad hat Évoli',
    price: 21.9,
    category: 'Casquettes',
    art: 'cap', color: 'orange',
    images: [],
    description: 'Casquette souple non structurée avec une petite broderie Évoli, style minimal.',
    benefits: ['Coton délavé doux', 'Non structurée', 'Boucle métal réglable'],
    badges: [],
    stock: 4,
    variants: ['Beige', 'Rose pastel'],
  },
  {
    id: 'drapeau-pikachu',
    name: 'Drapeau Pikachu',
    price: 19.9,
    comparePrice: 24.9,
    category: 'Drapeaux',
    art: 'flag', color: 'yellow',
    images: [],
    description: 'Grand drapeau imprimé en couleurs vives, avec 2 œillets métal pour l\'accrocher au mur de ta chambre ou de ta setup.',
    benefits: ['Impression HD des deux côtés', 'Polyester résistant', '2 œillets métal', 'Couleurs qui ne passent pas'],
    badges: ['Best-seller'],
    stock: 18,
    variants: ['90 × 150 cm', '60 × 90 cm'],
    variantPrices: { '60 × 90 cm': 14.9 },
  },
  {
    id: 'drapeau-ectoplasma',
    name: 'Drapeau Ectoplasma',
    price: 19.9,
    category: 'Drapeaux',
    art: 'flag', color: 'violet',
    images: [],
    description: 'Ectoplasma et son sourire dans l\'ombre : le drapeau parfait pour une chambre ou un setup gaming un peu dark.',
    benefits: ['Impression HD', 'Polyester résistant', '2 œillets métal'],
    badges: ['Nouveau'],
    stock: 11,
    variants: ['90 × 150 cm', '60 × 90 cm'],
    variantPrices: { '60 × 90 cm': 14.9 },
  },
  {
    id: 'drapeau-pokeball',
    name: 'Drapeau Pokéball',
    price: 17.9,
    category: 'Drapeaux',
    art: 'flag', color: 'red',
    images: [],
    description: 'Le classique : une Pokéball géante sur fond rouge et blanc. Simple, efficace, iconique.',
    benefits: ['Impression HD', 'Polyester résistant', '2 œillets métal'],
    badges: [],
    stock: 25,
    variants: ['90 × 150 cm', '60 × 90 cm'],
    variantPrices: { '60 × 90 cm': 12.9 },
  },
  {
    id: 'drapeau-dracaufeu',
    name: 'Drapeau Dracaufeu',
    price: 19.9,
    category: 'Drapeaux',
    art: 'flag', color: 'orange',
    images: [],
    description: 'Dracaufeu en pleine flamme sur fond sombre. Pour les fans de la première génération.',
    benefits: ['Impression HD', 'Polyester résistant', '2 œillets métal'],
    badges: ['Rare'],
    stock: 5,
    variants: ['90 × 150 cm', '60 × 90 cm'],
    variantPrices: { '60 × 90 cm': 14.9 },
  },
  {
    id: 'pack-casquette-drapeau',
    name: 'Pack casquette + drapeau',
    price: 39.9,
    comparePrice: 44.8,
    category: 'Packs',
    art: 'pack', color: 'pink',
    images: [],
    description: 'Une casquette et un drapeau 90 × 150 cm au choix, à prix réduit. Précise tes modèles dans ton DM.',
    benefits: ['1 casquette au choix', '1 drapeau 90 × 150 cm au choix', 'Économise 5 €'],
    badges: ['Promo'],
    stock: 10,
  },
];

const PROMO_CODES = {
  'POKESHOP10': { discount: 10, type: 'percent', label: '-10%' },
  'BIENVENUE': { discount: 15, type: 'percent', label: '-15%' },
  'POKESHOP5':  { discount: 5,  type: 'fixed',   label: '-5€' },
};

const CATEGORIES = [
  { name: 'Casquettes', icon: 'cap', color: 'pink' },
  { name: 'Drapeaux', icon: 'flag', color: 'lav' },
  { name: 'Packs', icon: 'gift', color: 'green' },
];
