'use client';

import { useCartStore } from '@/lib/store';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { isOpen, toggleCart, items, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-dark-card border-l border-dark-border z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h2 className="font-semibold text-lg">Mon Panier ({items.length})</h2>
          </div>
          <button onClick={toggleCart} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/50">Votre panier est vide</p>
              <button
                onClick={toggleCart}
                className="mt-4 text-gold text-sm underline"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variant ? `${item.id}-${item.variant}` : item.id}
                className="flex gap-4 p-3 rounded-xl bg-dark border border-dark-border"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-dark-hover">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                  {item.variant && (
                    <p className="text-xs text-white/40 mt-0.5">{item.variant}</p>
                  )}
                  <p className="text-gold font-semibold mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                      className="w-6 h-6 rounded bg-dark-hover flex items-center justify-center hover:bg-dark-border transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                      className="w-6 h-6 rounded bg-dark-hover flex items-center justify-center hover:bg-dark-border transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id, item.variant)}
                      className="ml-auto text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-dark-border space-y-4">
            {total >= 60 ? (
              <div className="text-center text-xs text-green-400 bg-green-400/10 rounded-lg py-2">
                ✓ Livraison offerte
              </div>
            ) : (
              <div className="text-center text-xs text-white/50">
                Plus que {formatPrice(60 - total)} pour la livraison gratuite
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total</span>
              <span className="text-xl font-bold text-gold">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={toggleCart}
              className="block w-full bg-gold text-dark font-semibold py-3 rounded-xl text-center hover:bg-gold-light transition-colors"
            >
              Commander maintenant
            </Link>
            <button
              onClick={toggleCart}
              className="block w-full text-white/50 text-sm text-center hover:text-white transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
