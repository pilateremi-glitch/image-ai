export default function RemboursementPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold mb-2">Politique de <span className="gold-gradient">Remboursement</span></h1>
        <div className="grid grid-cols-3 gap-4 mb-10 mt-6">
          {[{ emoji: '📦', title: '30 jours', desc: 'Pour retourner' }, { emoji: '💳', title: '5-7 jours', desc: 'Remboursement' }, { emoji: '✅', title: '100%', desc: 'Si défectueux' }].map(item => (
            <div key={item.title} className="bg-dark-card border border-dark-border rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">{item.emoji}</div>
              <p className="font-bold text-gold">{item.title}</p>
              <p className="text-xs text-white/50 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4 text-white/70 text-sm">
          <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
            <h2 className="text-white font-semibold mb-2">Conditions de retour</h2>
            <p>Retour possible dans les 30 jours suivant la réception, produit dans son état d&apos;origine et emballage d&apos;origine.</p>
          </div>
          <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
            <h2 className="text-white font-semibold mb-2">Comment initier un retour</h2>
            <p>Contactez-nous via WhatsApp ou email avec votre numéro de commande. Réponse sous 24h.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
