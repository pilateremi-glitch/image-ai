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
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link href="/products" className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-gold/30 transition-all group">
            <Package className="w-8 h-8 text-gold mx-auto mb-3" />
            <p className="font-semibold">Mes commandes</p>
          </Link>
          <Link href="/products" className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-gold/30 transition-all group">
            <Heart className="w-8 h-8 text-gold mx-auto mb-3" />
            <p className="font-semibold">Ma liste de souhaits</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
