# NovaZen - Boutique E-commerce Bien-être Premium

Site e-commerce dropshipping complet pour NovaZen, spécialisé dans les produits bien-être et lifestyle tendance.

## Stack Technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (thème noir/or premium)
- **Prisma + SQLite** (base de données)
- **Zustand** (état panier)
- **React Hot Toast** (notifications)

## Installation

```bash
cd novazen
npm install
npm run setup    # Initialise la BDD et insère les données de démo
npm run dev      # Lance le serveur de développement
```

## Structure

```
novazen/
├── app/
│   ├── page.tsx              # Page d'accueil
│   ├── products/             # Liste + fiches produits
│   ├── cart/                 # Panier
│   ├── checkout/             # Commande + paiement
│   ├── admin/                # Panel administrateur
│   │   ├── page.tsx          # Dashboard
│   │   ├── orders/           # Gestion commandes
│   │   ├── products/         # Gestion produits
│   │   ├── customers/        # CRM clients
│   │   └── promos/           # Codes promo
│   ├── faq/                  # FAQ
│   ├── cgv/                  # CGV
│   └── contact/              # Contact
├── components/               # Composants React
├── lib/                      # Utilitaires (Prisma, Zustand, utils)
└── prisma/                   # Schéma DB + données de démo
```

## Fonctionnalités

### Boutique
- Page d'accueil premium avec hero, produits tendances, témoignages
- Catalogue avec filtres par catégorie et tri
- Fiches produits avec photos, bénéfices, variantes, avis
- Panier persistant (localStorage via Zustand)
- Liste de souhaits

### Paiement
- Carte bancaire, PayPal, Lydia, virement, espèces
- Codes promo avec réduction %  ou montant fixe
- Livraison gratuite dès 60€
- Remise en main propre Paris/IDF dès 90€

### Admin (`/admin`)
- Dashboard avec statistiques et revenus
- Gestion commandes avec changement de statut
- Gestion produits (CRUD complet)
- CRM clients avec export CSV
- Gestion codes promo

## Déploiement Vercel

1. Push le code sur GitHub
2. Connecter sur vercel.com
3. Définir `DATABASE_URL` dans les variables d'environnement
4. Déployer

## Variables d'environnement

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_WHATSAPP="33612345678"
```
