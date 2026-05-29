'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Quels sont les délais de livraison ?', a: 'Nous livrons en 3 à 5 jours ouvrés pour la France métropolitaine.' },
  { q: 'La livraison est-elle gratuite ?', a: 'Oui ! La livraison est offerte à partir de 60€ d\'achat.' },
  { q: 'La remise en main propre est-elle disponible ?', a: 'Oui, disponible sur Paris et petite couronne pour toute commande de 90€ minimum.' },
  { q: 'Quels modes de paiement acceptez-vous ?', a: 'Carte bancaire, PayPal, Lydia, virement bancaire, et espèces pour la remise en main propre.' },
  { q: 'Puis-je retourner un produit ?', a: 'Oui, vous disposez de 30 jours à partir de la réception pour retourner un produit dans son état d\'origine.' },
  { q: 'Comment utiliser un code promo ?', a: 'Entrez votre code dans le champ dédié à l\'étape de paiement. Codes disponibles : SWEETSENT10 (-10%) et BIENVENUE (-15%).' },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">Questions <span className="gold-gradient">Fréquentes</span></h1>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gold flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-dark-border pt-4">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
