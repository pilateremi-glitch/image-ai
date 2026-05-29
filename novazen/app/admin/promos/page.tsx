'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number | null;
  expiresAt?: string | null;
  createdAt: string;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '', type: 'PERCENT', maxUsage: '', expiresAt: '' });

  const fetchPromos = async () => {
    setLoading(true);
    const res = await fetch('/api/promos');
    if (res.ok) {
      const data = await res.json();
      setPromos(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          discount: parseFloat(form.discount),
          type: form.type,
          maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Code promo créé');
      setShowForm(false);
      fetchPromos();
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Codes Promotionnels</h1>
          <p className="text-white/40 text-sm mt-1">{promos.length} code(s)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gold text-dark font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gold-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau code
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40">Chargement...</div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun code promo</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Code', 'Réduction', 'Type', 'Utilisations', 'Expire le', 'Statut'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.map(promo => (
                <tr key={promo.id} className="border-b border-dark-border hover:bg-dark-hover transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-gold">{promo.code}</td>
                  <td className="px-4 py-3 font-semibold">
                    {promo.discount}{promo.type === 'PERCENT' ? '%' : '€'}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">{promo.type === 'PERCENT' ? 'Pourcentage' : 'Montant fixe'}</td>
                  <td className="px-4 py-3 text-sm">
                    {promo.usageCount}{promo.maxUsage ? `/${promo.maxUsage}` : ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('fr-FR') : 'Illimité'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${promo.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {promo.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-lg mb-4">Nouveau code promo</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">Code *</label>
                <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="SWEETSENT20"
                  className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-gold/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Réduction *</label>
                  <input type="number" required value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Type *</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50">
                    <option value="PERCENT">% Pourcentage</option>
                    <option value="FIXED">€ Montant fixe</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Nb max utilisations</label>
                  <input type="number" value={form.maxUsage} onChange={e => setForm(p => ({ ...p, maxUsage: e.target.value }))}
                    placeholder="Illimité"
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Date d&apos;expiration</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gold text-dark font-bold py-2.5 rounded-xl hover:bg-gold-light transition-colors">
                  Créer le code
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 border border-dark-border rounded-xl text-white/60 hover:text-white">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
