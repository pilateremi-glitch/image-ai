import Link from 'next/link';
import { Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-display text-2xl font-bold gold-gradient">Sweet Sent</span>
            <p className="text-white/50 text-sm leading-relaxed">
              Votre destination bien-être premium. Des produits soigneusement sélectionnés pour votre quotidien.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center text-white/50 hover:text-gold hover:border-gold transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '33612345678'}`}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center text-white/50 hover:text-gold hover:border-gold transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Boutique</h3>
            <ul className="space-y-2">
              {[
                { href: '/products', label: 'Tous les produits' },
                { href: '/products?category=Massage+%26+Bien-être', label: 'Massage & Bien-être' },
                { href: '/products?category=Sommeil', label: 'Sommeil' },
                { href: '/products?category=Fitness+%26+Sport', label: 'Fitness' },
                { href: '/products?new=true', label: 'Nouveautés' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Informations</h3>
            <ul className="space-y-2">
              {[
                { href: '/faq', label: 'FAQ' },
                { href: '/cgv', label: 'CGV' },
                { href: '/politique-remboursement', label: 'Remboursement' },
                { href: '/contact', label: 'Contact' },
                { href: '/account', label: 'Mon compte' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-gold" />
                contact@sweetsent.fr
              </li>
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-gold" />
                +33 6 12 34 56 78
              </li>
              <li className="flex items-start gap-2 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-gold mt-0.5" />
                Paris & Île-de-France
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-dark border border-gold/20">
              <p className="text-xs text-white/60">
                🤝 <strong className="text-gold">Remise en main propre</strong> sur Paris et petite couronne dès 90€ d&apos;achat
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 pt-8 border-t border-dark-border flex flex-wrap justify-center gap-8">
          {['🔒 Paiement 100% sécurisé', '🚀 Livraison rapide 3-5j', '↩️ Retour 30 jours', '⭐ 4.9/5 satisfaction'].map(badge => (
            <span key={badge} className="text-white/40 text-xs font-medium">{badge}</span>
          ))}
        </div>

        <div className="mt-8 text-center text-white/30 text-xs">
          © 2024 Sweet Sent. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
