'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleCart, getCount } = useCartStore();
  const count = getCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/products', label: 'Boutique' },
    { href: '/products?category=Massage+%26+Bien-être', label: 'Massage' },
    { href: '/products?category=Sommeil', label: 'Sommeil' },
    { href: '/products?category=Fitness+%26+Sport', label: 'Fitness' },
    { href: '/products?category=Soin+%26+Beauté', label: 'Beauté' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/95 backdrop-blur-md border-b border-dark-border' : 'bg-transparent'
      }`}
    >
      {/* Announcement bar */}
      <div className="bg-gold text-dark text-center py-2 text-xs font-semibold tracking-wider uppercase">
        🚚 Livraison gratuite dès 60€ • Remise en main propre Paris disponible
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold gold-gradient">NovaZen</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors duration-200 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/products" className="hidden md:flex items-center text-white/70 hover:text-gold transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/account/wishlist" className="hidden md:flex items-center text-white/70 hover:text-gold transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <button
              onClick={toggleCart}
              className="relative flex items-center text-white/70 hover:text-gold transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-dark text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
            <button
              className="md:hidden text-white/70 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-dark-border py-4 space-y-3 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-white/70 hover:text-gold py-2 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
