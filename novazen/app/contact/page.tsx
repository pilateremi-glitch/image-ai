import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">Nous <span className="gold-gradient">Contacter</span></h1>
          <p className="text-white/50">Notre équipe répond en moins de 24h</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              { icon: <MessageCircle className="w-5 h-5" />, title: 'WhatsApp', desc: '+33 6 12 34 56 78', href: 'https://wa.me/33612345678', cta: 'Écrire sur WhatsApp', color: 'text-green-400' },
              { icon: <Mail className="w-5 h-5" />, title: 'Email', desc: 'contact@novazen.fr', href: 'mailto:contact@novazen.fr', cta: 'Envoyer un email', color: 'text-blue-400' },
              { icon: <MapPin className="w-5 h-5" />, title: 'Zone de service', desc: 'Paris & Île-de-France (remise en main propre)', color: 'text-gold' },
              { icon: <Clock className="w-5 h-5" />, title: 'Horaires', desc: 'Lun-Sam : 9h-20h', color: 'text-purple-400' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-5 bg-dark-card border border-dark-border rounded-2xl">
                <div className={`w-10 h-10 rounded-xl bg-dark flex items-center justify-center ${item.color} flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-white/50 text-sm mt-0.5">{item.desc}</p>
                  {item.href && item.cta && (
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                      className={`text-xs mt-2 inline-block font-medium ${item.color} hover:underline`}>
                      {item.cta} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-dark-card border border-gold/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-2">Réponse rapide garantie</h2>
              <p className="text-white/50 text-sm">Notre équipe est disponible via WhatsApp pour répondre à toutes vos questions rapidement.</p>
            </div>
            <a
              href="https://wa.me/33612345678?text=Bonjour NovaZen, j'ai une question..."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl text-center hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Discuter sur WhatsApp
            </a>
            <a
              href="mailto:contact@novazen.fr"
              className="w-full border border-dark-border text-white/60 py-3 rounded-xl text-center hover:text-white hover:border-gold/30 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Envoyer un email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
