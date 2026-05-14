'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { formatPrice, getDiscount } from '@/lib/utils';
import { useCartStore, useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string;
  category: string;
  stock: number;
  isBestSeller: boolean;
  isFeatured: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  const images = JSON.parse(product.images) as string[];
  const { addItem, toggleCart } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const isWished = hasItem(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      quantity: 1,
    });
    toast.success('Ajouté au panier !');
    toggleCart();
  };

  const discount = product.comparePrice
    ? getDiscount(product.price, product.comparePrice)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-dark-hover">
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-gold text-dark text-xs font-bold px-2 py-0.5 rounded-full">
                Best seller
              </span>
            )}
            {product.stock <= 20 && (
              <span className="bg-orange-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Stock limité
              </span>
            )}
          </div>
          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggleItem(product.id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-gold text-gold' : 'text-white'}`} />
          </button>
          {/* Quick add */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 left-3 right-3 bg-gold text-dark font-semibold text-sm py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 hover:bg-gold-light"
          >
            <ShoppingBag className="w-4 h-4" />
            Ajouter au panier
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-gold/70 uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-gold text-gold" />
            ))}
            <span className="text-xs text-white/40 ml-1">(4.9)</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-gold">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-sm text-white/30 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
