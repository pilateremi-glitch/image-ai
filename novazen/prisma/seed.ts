import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Masseur Cervical Pro',
    slug: 'masseur-cervical-pro',
    description: 'Le masseur cervical intelligent qui soulage instantanément les tensions du cou et des épaules. Technologie de chaleur infrarouge combinée à 8 têtes de massage rotatives pour une détente profonde.',
    benefits: '["Soulage les douleurs cervicales en 10min","Technologie infrarouge brevetée","8 modes de massage","Rechargeable USB-C","Silencieux < 40dB"]',
    price: 49.99,
    comparePrice: 89.99,
    costPrice: 9.50,
    images: '["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"]',
    category: 'Massage & Bien-être',
    stock: 87,
    isFeatured: true,
    isBestSeller: true,
    variants: null,
  },
  {
    name: 'Oreiller Mémoire de Forme Deluxe',
    slug: 'oreiller-memoire-forme-deluxe',
    description: 'Dormez comme jamais auparavant. Notre oreiller en mousse mémoire de forme ergonomique s\'adapte parfaitement à votre morphologie pour un sommeil profond et réparateur.',
    benefits: '["Support cervical optimal","Mousse mémoire densité 60D","Housse bambou anti-allergique","Régulation thermique","10 ans de garantie"]',
    price: 59.99,
    comparePrice: 119.99,
    costPrice: 12.00,
    images: '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800"]',
    category: 'Sommeil',
    stock: 54,
    isFeatured: true,
    isBestSeller: false,
    variants: '["Standard","Large"]',
  },
  {
    name: 'Bague de Suivi Fitness',
    slug: 'bague-suivi-fitness',
    description: 'La bague connectée ultra-fine qui surveille votre santé 24/7. Fréquence cardiaque, sommeil, stress, SpO2 - tout sur votre doigt avec une autonomie de 7 jours.',
    benefits: '["Suivi cardiaque 24/7","Analyse du sommeil IA","Waterproof IP68","7 jours d\'autonomie","Compatible iOS & Android"]',
    price: 79.99,
    comparePrice: 149.99,
    costPrice: 15.00,
    images: '["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]',
    category: 'Fitness & Tech',
    stock: 43,
    isFeatured: true,
    isBestSeller: true,
    variants: '["Taille 6","Taille 7","Taille 8","Taille 9","Taille 10"]',
  },
  {
    name: 'Correcteur de Posture Intelligent',
    slug: 'correcteur-posture-intelligent',
    description: 'Dites adieu aux douleurs de dos. Ce correcteur de posture connecté vous alerte par vibration dès que vous vous voûtez, et analyse votre posture en temps réel via son app.',
    benefits: '["Alerte vibration intelligente","App de suivi iOS/Android","Discret sous les vêtements","Batterie 30 jours","Certifié médical CE"]',
    price: 44.99,
    comparePrice: 79.99,
    costPrice: 8.50,
    images: '["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800","https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800"]',
    category: 'Posture & Santé',
    stock: 72,
    isFeatured: false,
    isBestSeller: true,
    variants: null,
  },
  {
    name: 'Humidificateur Aromathérapie Zen',
    slug: 'humidificateur-aromatherapie-zen',
    description: 'Transformez votre chambre en spa de luxe. Notre humidificateur diffuse les huiles essentielles tout en créant une ambiance lumineuse avec ses 7 couleurs LED douces.',
    benefits: '["Diffusion 360° silencieuse","7 couleurs LED","Autonomie 12h","Arrêt automatique sécurisé","Capacité 500ml"]',
    price: 34.99,
    comparePrice: 59.99,
    costPrice: 7.00,
    images: '["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800","https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800"]',
    category: 'Bien-être & Relaxation',
    stock: 118,
    isFeatured: false,
    isBestSeller: false,
    variants: '["Blanc","Noir","Rose"]',
  },
  {
    name: 'Pistolet de Massage Percussif',
    slug: 'pistolet-massage-percussif',
    description: 'Récupération musculaire professionnelle à domicile. Le gun de massage percussif à 6 vitesses pénètre en profondeur pour libérer les contractures et accélérer la récupération sportive.',
    benefits: '["6 vitesses 1200-3200 RPM","5 têtes interchangeables","Moteur sans balais silencieux","Autonomie 4h","Poids 700g seulement"]',
    price: 69.99,
    comparePrice: 129.99,
    costPrice: 14.00,
    images: '["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"]',
    category: 'Massage & Bien-être',
    stock: 36,
    isFeatured: true,
    isBestSeller: false,
    variants: null,
  },
  {
    name: 'Matelas de Yoga Premium',
    slug: 'matelas-yoga-premium',
    description: 'Le partenaire idéal de votre pratique. Ce tapis de yoga en caoutchouc naturel offre une adhérence parfaite, un amorti optimal et une épaisseur de 6mm pour protéger vos articulations.',
    benefits: '["Caoutchouc naturel certifié","Épaisseur 6mm","Antidérapant des deux côtés","Marquages d\'alignement","Sac de transport inclus"]',
    price: 54.99,
    comparePrice: 99.99,
    costPrice: 11.00,
    images: '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800","https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800"]',
    category: 'Fitness & Sport',
    stock: 65,
    isFeatured: false,
    isBestSeller: true,
    variants: '["Noir","Gris","Violet","Vert sauge"]',
  },
  {
    name: 'Masque Yeux Anti-Fatigue Chaud/Froid',
    slug: 'masque-yeux-anti-fatigue',
    description: 'Adieu les cernes et les yeux fatigués. Ce masque intelligent combine chaleur douce et vibrations pour drainer les poches, réduire les cernes et soulager la fatigue oculaire en 10 minutes.',
    benefits: '["Chaleur infrarouge 40°C","Vibrations drainantes","Mode compresses froides","Bluetooth & musique","Batterie rechargeable"]',
    price: 39.99,
    comparePrice: 69.99,
    costPrice: 8.00,
    images: '["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800","https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800"]',
    category: 'Soin & Beauté',
    stock: 91,
    isFeatured: false,
    isBestSeller: false,
    variants: null,
  },
];

const reviews = [
  { author: 'Sophie M.', rating: 5, comment: 'Incroyable ! Mes douleurs cervicales ont disparu après 3 jours d\'utilisation. Je recommande à 100% !', productSlug: 'masseur-cervical-pro' },
  { author: 'Thomas K.', rating: 5, comment: 'Qualité premium, livraison rapide. Exactement ce que je cherchais.', productSlug: 'masseur-cervical-pro' },
  { author: 'Amélie D.', rating: 4, comment: 'Super oreiller, je dors enfin bien. Juste un peu de temps pour s\'y habituer.', productSlug: 'oreiller-memoire-forme-deluxe' },
  { author: 'Lucas B.', rating: 5, comment: 'La bague est stylée et les données sont précises. J\'adore le suivi du sommeil !', productSlug: 'bague-suivi-fitness' },
  { author: 'Chloé R.', rating: 5, comment: 'Mon dos ne me fait plus mal au bureau. Produit révolutionnaire !', productSlug: 'correcteur-posture-intelligent' },
];

const promoCodes = [
  { code: 'NOVAZEN10', discount: 10, type: 'PERCENT', maxUsage: 100 },
  { code: 'BIENVENUE', discount: 15, type: 'PERCENT', maxUsage: 50 },
  { code: 'NOVAZEN5', discount: 5, type: 'FIXED', maxUsage: null },
];

async function main() {
  console.log('Seeding database...');

  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.promoCode.deleteMany();

  const createdProducts: Record<string, string> = {};

  for (const product of products) {
    const created = await prisma.product.create({ data: product });
    createdProducts[product.slug] = created.id;
  }

  for (const review of reviews) {
    const productId = createdProducts[review.productSlug];
    if (productId) {
      await prisma.review.create({
        data: {
          productId,
          author: review.author,
          rating: review.rating,
          comment: review.comment,
        },
      });
    }
  }

  for (const promo of promoCodes) {
    await prisma.promoCode.create({ data: promo });
  }

  const customer = await prisma.customer.create({
    data: {
      name: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      phone: '+33 6 12 34 56 78',
      address: '15 rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'NZ-2024-001',
      customerName: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      phone: '+33 6 12 34 56 78',
      address: '15 rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      paymentMethod: 'card',
      subtotal: 49.99,
      total: 49.99,
      status: 'DELIVERED',
      customerId: customer.id,
      items: {
        create: {
          productId: createdProducts['masseur-cervical-pro'],
          name: 'Masseur Cervical Pro',
          price: 49.99,
          quantity: 1,
        },
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
