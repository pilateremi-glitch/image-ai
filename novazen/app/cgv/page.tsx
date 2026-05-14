export default function CGVPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold mb-2">Conditions Générales de Vente</h1>
        <p className="text-white/40 text-sm mb-10">Dernière mise à jour : janvier 2024</p>

        <div className="prose prose-invert space-y-8 text-white/70 text-sm leading-relaxed">
          {[
            {
              title: '1. Objet',
              content: 'Les présentes CGV s\'appliquent à toutes les ventes conclues entre NovaZen et ses clients via le site novazen.fr. Toute commande implique l\'acceptation sans réserve de ces conditions.',
            },
            {
              title: '2. Produits',
              content: 'Nos produits sont décrits avec précision sur le site. Les photographies sont présentatives. Nous nous réservons le droit de modifier notre catalogue sans préavis.',
            },
            {
              title: '3. Prix',
              content: 'Les prix sont indiqués en euros TTC. NovaZen se réserve le droit de modifier ses prix à tout moment. Les commandes sont facturées au prix en vigueur au moment de la validation.',
            },
            {
              title: '4. Commandes',
              content: 'Toute commande est soumise à validation par notre équipe. Nous nous réservons le droit de refuser une commande en cas de litige avec un client ou de stock insuffisant.',
            },
            {
              title: '5. Paiement',
              content: 'Le paiement est dû au moment de la commande. Nous acceptons : carte bancaire, PayPal, Lydia, virement bancaire et espèces (remise en main propre uniquement). En cas de virement, la commande est expédiée à réception du paiement.',
            },
            {
              title: '6. Livraison',
              content: 'La livraison s\'effectue en France métropolitaine sous 3 à 5 jours ouvrés. La remise en main propre est disponible sur Paris et petite couronne pour les commandes de 90€ minimum. Les frais de port sont offerts à partir de 60€.',
            },
            {
              title: '7. Droit de rétractation',
              content: 'Conformément à la loi, vous disposez de 14 jours à compter de la réception pour exercer votre droit de rétractation. Les frais de retour sont à la charge du client sauf en cas de produit défectueux.',
            },
            {
              title: '8. Garanties',
              content: 'Nos produits bénéficient de la garantie légale de conformité (2 ans) et de la garantie contre les vices cachés. Pour toute réclamation, contactez-nous via WhatsApp ou email.',
            },
          ].map(section => (
            <section key={section.title}>
              <h2 className="text-white font-semibold text-lg mb-2">{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
