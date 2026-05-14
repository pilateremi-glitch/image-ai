import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

const categories = [
  'Massage & Bien-être',
  'Sommeil',
  'Fitness & Sport',
  'Fitness & Tech',
  'Posture & Santé',
  'Bien-être & Relaxation',
  'Soin & Beauté',
];

interface SearchParams {
  category?: string;
  sort?: string;
  q?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, sort, q } = searchParams;

  const where = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(q ? { name: { contains: q } } : {}),
  };

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' as const } :
    sort === 'price_desc' ? { price: 'desc' as const } :
    sort === 'popular' ? { isBestSeller: 'desc' as const } :
    { createdAt: 'desc' as const };

  const products = await prisma.product.findMany({ where, orderBy });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">
            {category || 'Toute la'} <span className="gold-gradient">Boutique</span>
          </h1>
          <p className="text-white/50">{products.length} produits disponibles</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40 mb-3">
                  <SlidersHorizontal className="w-4 h-4" /> Catégories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/products"
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-gold/20 text-gold font-medium' : 'text-white/60 hover:text-white hover:bg-dark-hover'}`}
                    >
                      Tout voir
                    </Link>
                  </li>
                  {categories.map(cat => (
                    <li key={cat}>
                      <Link
                        href={`/products?category=${encodeURIComponent(cat)}`}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${category === cat ? 'bg-gold/20 text-gold font-medium' : 'text-white/60 hover:text-white hover:bg-dark-hover'}`}
                      >
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-3">Trier par</h3>
                <ul className="space-y-1">
                  {[
                    { label: 'Nouveautés', value: '' },
                    { label: 'Populaires', value: 'popular' },
                    { label: 'Prix croissant', value: 'price_asc' },
                    { label: 'Prix décroissant', value: 'price_desc' },
                  ].map(option => (
                    <li key={option.value}>
                      <Link
                        href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}sort=${option.value}`}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${sort === option.value || (!sort && !option.value) ? 'bg-gold/20 text-gold font-medium' : 'text-white/60 hover:text-white hover:bg-dark-hover'}`}
                      >
                        {option.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p className="text-lg">Aucun produit trouvé.</p>
                <Link href="/products" className="text-gold mt-2 inline-block hover:underline">
                  Voir tous les produits
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
