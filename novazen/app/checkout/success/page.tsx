import Link from 'next/link';
import { CheckCircle, Package, MessageCircle } from 'lucide-react';

export default function SuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order || 'NZ-XXXX';

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-white/60">Merci pour votre confiance. Votre commande est enregistrée.</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gold" />
            <div>
              <p className="text-sm font-semibold">N° de commande</p>
              <p className="text-gold font-mono font-bold">{orderNumber}</p>
            </div>
          </div>
          <div className="text-sm text-white/50 pt-2 border-t border-dark-border">
            Un email de confirmation vous a été envoyé. Notre équipe validera votre commande dans les plus brefs délais.
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/products"
            className="block w-full bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold-light transition-colors"
          >
            Continuer mes achats
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '33612345678'}?text=Bonjour, j'ai une question sur ma commande ${orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-dark-border text-white/60 py-3 rounded-xl hover:text-white hover:border-gold/30 transition-all text-sm"
          >
            <MessageCircle className="w-4 h-4 text-green-400" />
            Contacter via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
