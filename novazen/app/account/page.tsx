'use client';

import { Heart, Package, User } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-gold" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Mon <span className="gold-gradient">Compte</span></h1>
        <p className="text-white/50 mb-10">Gérez vos commandes et préférences</p>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/products" className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-gold/30 transition-all group">
            <Package className="w-8 h-8 text-gold mx-auto mb-3" />
            <p className="font-semibold group-hover:text-gold transition-colors">Mes commandes</p>
            <p className="text-xs text-white/40 mt-1">Suivre mes achats</p>
          </Link>
          <Link href="/products" className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-gold/30 transition-all group">
            <Heart className="w-8 h-8 text-gold mx-auto mb-3" />
            <p className="font-semibold group-hover:text-gold transition-colors">Ma liste de souhaits</p>
            <p className="text-xs text-white/40 mt-1">Mes produits favoris</p>
          </Link>
        </div>

        <div className="mt-8 p-6 bg-dark-card border border-dark-border rounded-2xl">
          <p className="text-white/60 text-sm">Pour suivre votre commande, utilisez votre numéro de commande (format : NZ-2024-XXXXX) reçu par email ou contactez-nous directement.</p>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-gold text-sm hover:underline">
            Contacter le support →
          </Link>
        </div>
      </div>
    </div>
  );
}
