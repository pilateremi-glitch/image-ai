export default function RemboursementPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold mb-2">Politique de <span className="gold-gradient">Remboursement</span></h1>
        <p className="text-white/40 text-sm mb-10">Votre satisfaction est notre priorité</p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { emoji: '📦', title: '30 jours', desc: 'Pour retourner un produit' },
            { emoji: '💳', title: '5-7 jours', desc: 'Délai de remboursement' },
            { emoji: '✅', title: '100%', desc: 'Remboursé si défectueux' },
          ].map(item => (
            <div key={item.title} className="bg-dark-card border border-dark-border rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">{item.emoji}</div>
              <p className="font-bold text-gold">{item.title}</p>
              <p className="text-xs text-white/50 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6 text-white/70 text-sm leading-relaxed">
          {[
            { title: 'Conditions de retour', content: 'Vous pouvez retourner tout article dans les 30 jours suivant la réception, à condition que le produit soit dans son état d\'origine, non utilisé et dans son emballage d\'origine.' },
            { title: 'Produit défectueux', content: 'Si votre produit est défectueux ou ne correspond pas à la description, nous prenons en charge tous les frais de retour et vous remboursons intégralement ou vous envoyons un remplacement, selon votre préférence.' },
            { title: 'Comment initier un retour', content: 'Contactez-nous via WhatsApp ou par email avec votre numéro de commande et la raison du retour. Nous vous répondrons sous 24h avec les instructions d\'expédition.' },
            { title: 'Délai de remboursement', content: 'Une fois le retour reçu et inspecté, le remboursement est effectué sous 5 à 7 jours ouvrés sur votre moyen de paiement initial.' },
            { title: 'Articles non retournables', content: 'Pour des raisons d\'hygiène, certains articles (lingerie, articles intimes) ne peuvent être retournés. Ces exceptions sont clairement indiquées sur les fiches produits.' },
          ].map(section => (
            <section key={section.title} className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-2">{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
