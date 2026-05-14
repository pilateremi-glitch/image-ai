'use client';

import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();
  const shipping = total >= 60 ? 0 : 5.99;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
        <p className="text-white/50 mb-6">Découvrez nos produits bien-être tendance</p>
        <Link href="/products" className="bg-gold text-dark font-bold px-8 py-3 rounded-xl hover:bg-gold-light transition-colors">
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold mb-8">Mon <span className="gold-gradient">Panier</span></h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.variant ? `${item.id}-${item.variant}` : item.id}
                className="flex gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-dark-hover flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.variant && <p className="text-sm text-white/40 mt-0.5">{item.variant}</p>}
                  <p className="text-gold font-bold mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-dark border border-dark-border rounded-xl p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                        className="w-7 h-7 flex items-center justify-center hover:text-gold transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                        className="w-7 h-7 flex items-center justify-center hover:text-gold transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gold">{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.id, item.variant)}
                        className="text-white/30 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 h-fit sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-white/60">
                <span>Sous-total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Livraison</span>
                <span>{shipping === 0 ? <span className="text-green-400">Gratuite</span> : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-white/40">Plus que {formatPrice(60 - total)} pour la livraison gratuite</p>
              )}
            </div>
            <div className="border-t border-dark-border pt-3 flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span className="text-gold">{formatPrice(total + shipping)}</span>
            </div>
            <Link href="/checkout"
              className="block w-full bg-gold text-dark font-bold py-3 rounded-xl text-center hover:bg-gold-light transition-colors flex items-center justify-center gap-2">
              Commander
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="block text-center text-sm text-white/40 hover:text-white mt-3 transition-colors">
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
