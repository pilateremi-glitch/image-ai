import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice, getDiscount } from '@/lib/utils';
import { ProductActions } from '@/components/product/ProductActions';
import Image from 'next/image';
import { Shield, Truck, RotateCcw, Star, CheckCircle } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map(p => ({ id: p.slug }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.id } });
  if (!product) return {};
  return {
    title: `${product.name} | Sweet Sent`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.id },
    include: { reviews: true },
  });

  if (!product || !product.isActive) notFound();

  const images = JSON.parse(product.images) as string[];
  const benefits = JSON.parse(product.benefits) as string[];
  const variants = product.variants ? JSON.parse(product.variants) as string[] : null;
  const discount = product.comparePrice ? getDiscount(product.price, product.comparePrice) : 0;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 5;

  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id }, isActive: true },
    take: 4,
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product main */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-card border border-dark-border">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-full">
                    -{discount}%
                  </span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-dark-card border border-dark-border cursor-pointer hover:border-gold/50 transition-colors">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>
              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-gold text-gold' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="text-sm text-white/60">
                  {avgRating.toFixed(1)} ({product.reviews.length} avis)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gold">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-xl text-white/30 line-through">{formatPrice(product.comparePrice)}</span>
              )}
              {discount > 0 && (
                <span className="text-sm font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                  Économisez {formatPrice(product.comparePrice! - product.price)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 20 ? 'bg-green-400' : product.stock > 0 ? 'bg-orange-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-white/60">
                {product.stock > 20 ? 'En stock' : product.stock > 0 ? `Plus que ${product.stock} en stock !` : 'Rupture de stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-white/60 leading-relaxed">{product.description}</p>

            {/* Benefits */}
            <div className="space-y-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="text-sm text-white/80">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Product Actions (client component for cart) */}
            <ProductActions product={product} variants={variants} images={images} />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dark-border">
              {[
                { icon: <Truck className="w-4 h-4" />, text: 'Livraison 3-5j' },
                { icon: <Shield className="w-4 h-4" />, text: 'Paiement sécurisé' },
                { icon: <RotateCcw className="w-4 h-4" />, text: 'Retour 30j' },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-dark border border-dark-border">
                  <span className="text-gold">{badge.icon}</span>
                  <span className="text-xs text-white/50">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="mb-20">
            <h2 className="font-display text-2xl font-bold mb-8">Avis clients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map(review => (
                <div key={review.id} className="p-5 rounded-xl bg-dark-card border border-dark-border">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">&ldquo;{review.comment}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{review.author}</span>
                    {review.isVerified && (
                      <span className="text-xs text-green-400">✓ Vérifié</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-8">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
