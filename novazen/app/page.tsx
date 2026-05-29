import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight, Shield, Truck, RotateCcw, Star, Zap, Heart, Award } from 'lucide-react';

export const revalidate = 60;

async function getHomeData() {
  const [featured, bestSellers, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 4,
    }),
    prisma.review.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true } } },
    }),
  ]);
  return { featured, bestSellers, reviews };
}

export default async function HomePage() {
  const { featured, bestSellers, reviews } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-card to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Tendances TikTok • Livraison Express</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
              Votre Bien-être,{' '}
              <span className="gold-gradient">Réinventé.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-xl">
              Découvrez notre collection premium de produits bien-être, massage et lifestyle.
              Soigneusement sélectionnés pour transformer votre quotidien.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gold text-dark font-bold px-8 py-4 rounded-xl hover:bg-gold-light transition-all duration-200 shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_40px_rgba(201,168,76,0.5)]"
              >
                Découvrir la boutique
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/products?category=Massage+%26+Bien-être"
                className="inline-flex items-center gap-2 border border-gold/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-gold/10 transition-all duration-200"
              >
                <Heart className="w-5 h-5 text-gold" />
                Best-sellers
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {['😊', '🎯', '✨', '💪', '🌟'].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-dark-hover border-2 border-dark flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
                </div>
                <p className="text-white/40 text-sm">+2 500 clients satisfaits</p>
              </div>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4 h-[600px]">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-72 bg-dark-hover">
                <Image src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600" alt="Massage" fill className="object-cover" />
              </div>
              <div className="relative rounded-2xl overflow-hidden h-40 bg-dark-hover">
                <Image src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600" alt="Fitness" fill className="object-cover" />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="relative rounded-2xl overflow-hidden h-40 bg-dark-hover">
                <Image src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600" alt="Sleep" fill className="object-cover" />
              </div>
              <div className="relative rounded-2xl overflow-hidden h-72 bg-dark-hover">
                <Image src="https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600" alt="Tech" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs">
          <span>Découvrir</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-dark-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-6 h-6" />, title: 'Livraison Rapide', desc: '3-5 jours ouvrés' },
              { icon: <Shield className="w-6 h-6" />, title: 'Paiement Sécurisé', desc: 'SSL 256-bit' },
              { icon: <RotateCcw className="w-6 h-6" />, title: 'Retour 30 jours', desc: 'Satisfait ou remboursé' },
              { icon: <Award className="w-6 h-6" />, title: 'Qualité Premium', desc: 'Sélection rigoureuse' },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 p-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  {badge.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">Sélection</p>
              <h2 className="font-display text-4xl font-bold">Produits <span className="gold-gradient">Tendance</span></h2>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm font-medium">
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 flex justify-center md:hidden">
            <Link href="/products" className="inline-flex items-center gap-2 text-gold border border-gold/30 px-6 py-3 rounded-xl hover:bg-gold/10 transition-all text-sm font-medium">
              Voir tous les produits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Categories Banner */}
      <section className="py-16 bg-dark-card border-y border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Explorez nos <span className="gold-gradient">univers</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Massage & Bien-être', emoji: '💆', href: '/products?category=Massage+%26+Bien-être', color: 'from-purple-900/40 to-dark-card' },
              { name: 'Sommeil', emoji: '🌙', href: '/products?category=Sommeil', color: 'from-blue-900/40 to-dark-card' },
              { name: 'Fitness & Sport', emoji: '💪', href: '/products?category=Fitness+%26+Sport', color: 'from-green-900/40 to-dark-card' },
              { name: 'Tech & Innovation', emoji: '⚡', href: '/products?category=Fitness+%26+Tech', color: 'from-yellow-900/40 to-dark-card' },
            ].map(cat => (
              <Link key={cat.name} href={cat.href}
                className={`relative group p-6 rounded-2xl bg-gradient-to-br ${cat.color} border border-dark-border hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)] text-center`}>
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <p className="font-semibold text-sm group-hover:text-gold transition-colors">{cat.name}</p>
                <ArrowRight className="w-4 h-4 text-gold/0 group-hover:text-gold/70 transition-all mt-2 mx-auto" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">⭐ Populaires</p>
              <h2 className="font-display text-4xl font-bold">Best <span className="gold-gradient">Sellers</span></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="py-20 bg-dark-card border-y border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">Avis clients</p>
              <h2 className="font-display text-4xl font-bold">Ce que disent nos <span className="gold-gradient">clients</span></h2>
              <div className="flex items-center justify-center gap-2 mt-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-gold text-gold" />)}
                <span className="text-white/60 ml-2">4.9/5 • +2500 avis</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 rounded-2xl bg-dark border border-dark-border hover:border-gold/20 transition-all">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{review.author}</p>
                      <p className="text-xs text-white/40">{review.product?.name}</p>
                    </div>
                    {review.isVerified && (
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        ✓ Achat vérifié
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/5 border border-gold/30 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.15)_0%,transparent_70%)]" />
          <div className="relative">
            <p className="text-gold font-semibold uppercase tracking-widest text-sm mb-4">Offre Exclusive</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              -10% sur votre <span className="gold-gradient">première commande</span>
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Utilisez le code <strong className="text-gold">SWEETSENT10</strong> à la caisse
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gold text-dark font-bold px-10 py-4 rounded-xl hover:bg-gold-light transition-all shadow-[0_0_40px_rgba(201,168,76,0.4)]"
            >
              J&apos;en profite maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
