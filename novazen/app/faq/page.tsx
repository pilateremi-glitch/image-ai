'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Nous livrons en 3 à 5 jours ouvrés pour la France métropolitaine. Vous recevrez un email de suivi dès l\'expédition de votre commande.',
  },
  {
    q: 'La livraison est-elle gratuite ?',
    a: 'Oui ! La livraison est offerte à partir de 60€ d\'achat. En dessous, les frais de port sont de 5,99€.',
  },
  {
    q: 'La remise en main propre est-elle disponible ?',
    a: 'Absolument ! La remise en main propre est disponible sur Paris et la petite couronne pour toute commande de 90€ minimum. Contactez-nous via WhatsApp pour convenir d\'un rendez-vous.',
  },
  {
    q: 'Quels modes de paiement acceptez-vous ?',
    a: 'Nous acceptons les cartes bancaires (Visa, Mastercard, CB), PayPal, Lydia/Sumeria, le virement bancaire, et les espèces pour la remise en main propre.',
  },
  {
    q: 'Puis-je retourner un produit ?',
    a: 'Oui, vous disposez de 30 jours à partir de la réception pour retourner un produit. Il doit être dans son état d\'origine et son emballage d\'origine. Consultez notre politique de remboursement pour plus de détails.',
  },
  {
    q: 'Comment puis-je suivre ma commande ?',
    a: 'Dès l\'expédition de votre commande, vous recevrez un email avec votre numéro de suivi. Vous pouvez également nous contacter via WhatsApp pour un suivi personnalisé.',
  },
  {
    q: 'Les produits sont-ils de qualité ?',
    a: 'Absolument. Chaque produit est soigneusement sélectionné et testé avant d\'être proposé dans notre boutique. Nous ne vendons que des produits qui répondent à nos critères de qualité premium.',
  },
  {
    q: 'Comment utiliser un code promo ?',
    a: 'Entrez votre code promo dans le champ dédié à l\'étape de paiement lors de votre commande. La réduction sera automatiquement appliquée.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">Questions <span className="gold-gradient">Fréquentes</span></h1>
          <p className="text-white/50">Tout ce que vous devez savoir sur NovaZen</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gold flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-dark-border pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-dark-card border border-gold/20 rounded-2xl text-center">
          <p className="text-white/60 mb-4">Vous n&apos;avez pas trouvé votre réponse ?</p>
          <a
            href={`https://wa.me/33612345678`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold text-dark font-bold px-6 py-3 rounded-xl hover:bg-gold-light transition-colors"
          >
            💬 Contacter via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
