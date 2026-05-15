export default function CGVPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold mb-2">Conditions Générales de Vente</h1>
        <p className="text-white/40 text-sm mb-10">Dernière mise à jour : janvier 2024</p>
        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          {[
            { title: '1. Objet', content: 'Les présentes CGV s\'appliquent à toutes les ventes conclues entre NovaZen et ses clients.' },
            { title: '2. Prix', content: 'Les prix sont indiqués en euros TTC. NovaZen se réserve le droit de modifier ses prix à tout moment.' },
            { title: '3. Paiement', content: 'Nous acceptons : carte bancaire, PayPal, Lydia, virement bancaire et espèces (remise en main propre uniquement).' },
            { title: '4. Livraison', content: 'Livraison en France métropolitaine sous 3 à 5 jours ouvrés. Remise en main propre disponible sur Paris et petite couronne dès 90€.' },
            { title: '5. Retours', content: 'Vous disposez de 14 jours à compter de la réception pour exercer votre droit de rétractation.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-white font-semibold text-lg mb-2">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
