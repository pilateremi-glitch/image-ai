'use client';

import { useState } from 'react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { ShoppingBag, Heart, Minus, Plus, Zap } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductActionsProps {
  product: Product;
  variants: string[] | null;
  images: string[];
}

export function ProductActions({ product, variants, images }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants?.[0] || undefined);
  const { addItem, toggleCart } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const isWished = hasItem(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      quantity,
      variant: selectedVariant,
    });
    toast.success(`${product.name} ajouté au panier !`);
    toggleCart();
  };

  return (
    <div className="space-y-4">
      {/* Variants */}
      {variants && (
        <div>
          <p className="text-sm text-white/60 mb-2">Variante : <strong className="text-white">{selectedVariant}</strong></p>
          <div className="flex flex-wrap gap-2">
            {variants.map(v => (
              <button
                key={v}
                onClick={() => setSelectedVariant(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedVariant === v
                    ? 'border-gold bg-gold/20 text-gold'
                    : 'border-dark-border text-white/60 hover:border-gold/40'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/60">Quantité</span>
        <div className="flex items-center gap-3 bg-dark-card border border-dark-border rounded-xl p-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center hover:text-gold transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-8 h-8 flex items-center justify-center hover:text-gold transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 bg-gold text-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-light transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-5 h-5" />
          Ajouter au panier
        </button>
        <button
          onClick={() => toggleItem(product.id)}
          className={`w-14 h-14 flex-shrink-0 border rounded-xl flex items-center justify-center transition-all ${
            isWished ? 'border-gold bg-gold/20 text-gold' : 'border-dark-border text-white/50 hover:border-gold/40 hover:text-gold'
          }`}
        >
          <Heart className={`w-5 h-5 ${isWished ? 'fill-gold' : ''}`} />
        </button>
      </div>

      <Link
        href="/checkout"
        onClick={() => {
          addItem({ id: product.id, name: product.name, price: product.price, image: images[0], quantity, variant: selectedVariant });
        }}
        className="block w-full bg-dark border border-gold/30 text-gold font-semibold py-3 rounded-xl text-center hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        Acheter maintenant
      </Link>
    </div>
  );
}
