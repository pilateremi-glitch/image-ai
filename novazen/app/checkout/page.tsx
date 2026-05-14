'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Shield, Truck, Tag, CreditCard, Banknote, Smartphone, Building2, Handshake } from 'lucide-react';
import toast from 'react-hot-toast';

const paymentMethods = [
  { id: 'card', label: 'Carte bancaire', icon: <CreditCard className="w-5 h-5" />, desc: 'Visa, Mastercard, CB' },
  { id: 'paypal', label: 'PayPal', icon: <Smartphone className="w-5 h-5" />, desc: 'Paiement sécurisé PayPal' },
  { id: 'lydia', label: 'Lydia / Sumeria', icon: <Smartphone className="w-5 h-5" />, desc: 'Paiement mobile' },
  { id: 'transfer', label: 'Virement bancaire', icon: <Building2 className="w-5 h-5" />, desc: 'RIB envoyé par email' },
  { id: 'cash', label: 'Espèces', icon: <Banknote className="w-5 h-5" />, desc: 'Remise en main propre uniquement' },
];

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [handPickup, setHandPickup] = useState(false);

  const subtotal = getTotal();
  const shipping = handPickup ? 0 : subtotal >= 60 ? 0 : 5.99;
  const discountAmount = discount > 0 ? subtotal * (discount / 100) : 0;
  const total = subtotal - discountAmount + shipping;

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', country: 'France', notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch(`/api/promo?code=${promoCode}`);
      const data = await res.json();
      if (data.discount) {
        setDiscount(data.discount);
        setPromoError('');
        toast.success(`Code promo appliqué : -${data.discount}%`);
      } else {
        setPromoError('Code invalide ou expiré');
      }
    } catch {
      setPromoError('Erreur lors de la vérification');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    if (paymentMethod === 'cash' && !handPickup) {
      toast.error('Le paiement en espèces est réservé à la remise en main propre');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          paymentMethod,
          promoCode: discount > 0 ? promoCode : undefined,
          discount: discountAmount,
          subtotal,
          shipping,
          total,
          notes: form.notes,
          items: items.map(i => ({
            productId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            variant: i.variant,
          })),
        }),
      });
      if (!res.ok) throw new Error('Erreur commande');
      const order = await res.json();
      clearCart();
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch {
      toast.error('Erreur lors de la commande. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <a href="/products" className="text-gold hover:underline">Découvrir nos produits</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold mb-8">
          Finaliser ma <span className="gold-gradient">commande</span>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form - left */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact */}
              <section className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Informations de contact</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'firstName', label: 'Prénom', type: 'text', required: true },
                    { name: 'lastName', label: 'Nom', type: 'text', required: true },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm text-white/60 mb-1">{field.label} *</label>
                      <input
                        type={field.type}
                        name={field.name}
                        required={field.required}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Email *</label>
                    <input type="email" name="email" required value={form.email} onChange={handleChange}
                      className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Téléphone *</label>
                    <input type="tel" name="phone" required value={form.phone} onChange={handleChange}
                      className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  </div>
                </div>
              </section>

              {/* Delivery */}
              <section className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Adresse de livraison</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Adresse *</label>
                    <input type="text" name="address" required value={form.address} onChange={handleChange}
                      className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Ville *</label>
                      <input type="text" name="city" required value={form.city} onChange={handleChange}
                        className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Code postal *</label>
                      <input type="text" name="postalCode" required value={form.postalCode} onChange={handleChange}
                        className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                  </div>
                  {total >= 90 && (
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-gold/30 bg-gold/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={handPickup}
                        onChange={e => setHandPickup(e.target.checked)}
                        className="mt-0.5 accent-gold"
                      />
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <Handshake className="w-4 h-4 text-gold" />
                          Remise en main propre (Paris & petite couronne)
                        </div>
                        <p className="text-xs text-white/50 mt-1">Disponible à partir de 90€ · Gratuit · Rendez-vous convenu par message</p>
                      </div>
                    </label>
                  )}
                </div>
              </section>

              {/* Payment */}
              <section className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Mode de paiement</h2>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-gold bg-gold/10'
                          : 'border-dark-border hover:border-gold/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-gold"
                      />
                      <span className="text-gold">{method.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{method.label}</p>
                        <p className="text-xs text-white/40">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {paymentMethod === 'transfer' && (
                  <div className="mt-4 p-3 rounded-xl bg-dark border border-dark-border text-sm text-white/60">
                    📧 Le RIB vous sera envoyé par email après validation. La commande sera expédiée dès réception du virement.
                  </div>
                )}
              </section>

              {/* Notes */}
              <section className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Notes (optionnel)</h2>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Instructions particulières, disponibilité pour la remise en main propre..."
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none"
                />
              </section>
            </div>

            {/* Summary - right */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-dark-hover">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                          <span className="absolute -top-1 -right-1 bg-gold text-dark text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          {item.variant && <p className="text-xs text-white/40">{item.variant}</p>}
                        </div>
                        <span className="text-sm font-semibold text-gold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Promo */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Code promo"
                        className="w-full bg-dark border border-dark-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="px-4 py-2.5 bg-gold/20 text-gold text-sm font-medium rounded-xl hover:bg-gold/30 transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-400 mb-3">{promoError}</p>}
                  {discount > 0 && <p className="text-xs text-green-400 mb-3">✓ Code promo -{discount}% appliqué</p>}

                  {/* Totals */}
                  <div className="space-y-2 py-4 border-t border-dark-border text-sm">
                    <div className="flex justify-between text-white/60">
                      <span>Sous-total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Réduction</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white/60">
                      <span>Livraison</span>
                      <span>{shipping === 0 ? <span className="text-green-400">Gratuite</span> : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-dark-border">
                      <span>Total</span>
                      <span className="text-gold">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-light transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                        Traitement...
                      </span>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Confirmer la commande
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" />SSL sécurisé</span>
                  <span className="flex items-center gap-1"><Truck className="w-3 h-3" />Livraison assurée</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
