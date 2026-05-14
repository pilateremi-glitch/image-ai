'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const key = item.variant ? `${item.id}-${item.variant}` : item.id;
          const existing = state.items.find(
            (i) => (i.variant ? `${i.id}-${i.variant}` : i.id) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                (i.variant ? `${i.id}-${i.variant}` : i.id) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (id, variant) => {
        set((state) => ({
          items: state.items.filter((i) => {
            const key = i.variant ? `${i.id}-${i.variant}` : i.id;
            const targetKey = variant ? `${id}-${variant}` : id;
            return key !== targetKey;
          }),
        }));
      },

      updateQuantity: (id, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(id, variant);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            const key = i.variant ? `${i.id}-${i.variant}` : i.id;
            const targetKey = variant ? `${id}-${variant}` : id;
            return key === targetKey ? { ...i, quantity } : i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: 'novazen-cart' }
  )
);

export interface WishlistStore {
  items: string[];
  toggleItem: (id: string) => void;
  hasItem: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (id) => {
        set((state) => ({
          items: state.items.includes(id)
            ? state.items.filter((i) => i !== id)
            : [...state.items, id],
        }));
      },
      hasItem: (id) => get().items.includes(id),
    }),
    { name: 'novazen-wishlist' }
  )
);
