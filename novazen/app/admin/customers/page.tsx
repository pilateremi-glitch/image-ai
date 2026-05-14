'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import { Search, Download, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  notes?: string;
  createdAt: string;
  orders: { total: number; status: string; orderNumber: string; createdAt: string }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const url = search ? `/api/customers?q=${encodeURIComponent(search)}` : '/api/customers';
    const res = await fetch(url);
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const exportCSV = () => {
    window.open('/api/customers?format=csv', '_blank');
    toast.success('Export CSV en cours...');
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/customers/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      toast.success('Notes sauvegardées');
      fetchCustomers();
    } catch {
      toast.error('Erreur');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">CRM Clients</h1>
          <p className="text-white/40 text-sm mt-1">{customers.length} client(s)</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-gold/20 text-gold border border-gold/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gold/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-dark-card border border-dark-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {/* Customers table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40">Chargement...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun client trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Nom', 'Email', 'Téléphone', 'Ville', 'Commandes', 'Total dépensé', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => {
                  const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0);
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-dark-border hover:bg-dark-hover transition-colors cursor-pointer"
                      onClick={() => { setSelected(customer); setNotes(customer.notes || ''); }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{customer.email}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{customer.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{customer.city || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{customer.orders.length}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gold">{formatPrice(totalSpent)}</td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="text-xs text-gold/70 hover:text-gold transition-colors"
                          onClick={e => { e.stopPropagation(); setSelected(customer); setNotes(customer.notes || ''); }}
                        >
                          Détails →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end" onClick={() => setSelected(null)}>
          <div className="bg-dark-card border-l border-dark-border w-full max-w-lg h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white">✕</button>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              {[
                { label: 'Email', value: selected.email },
                { label: 'Téléphone', value: selected.phone || '-' },
                { label: 'Ville', value: selected.city || '-' },
                { label: 'Client depuis', value: new Date(selected.createdAt).toLocaleDateString('fr-FR') },
              ].map(info => (
                <div key={info.label} className="p-3 bg-dark rounded-xl border border-dark-border">
                  <p className="text-white/40 text-xs mb-1">{info.label}</p>
                  <p className="font-medium truncate">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-dark rounded-xl border border-dark-border text-center">
                <p className="text-2xl font-bold text-gold">{selected.orders.length}</p>
                <p className="text-xs text-white/40 mt-1">Commandes</p>
              </div>
              <div className="p-3 bg-dark rounded-xl border border-dark-border text-center">
                <p className="text-2xl font-bold text-gold">{formatPrice(selected.orders.reduce((s, o) => s + o.total, 0))}</p>
                <p className="text-xs text-white/40 mt-1">Total dépensé</p>
              </div>
            </div>

            {/* Orders history */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3">Historique commandes</h3>
              <div className="space-y-2">
                {selected.orders.map(order => (
                  <div key={order.orderNumber} className="flex items-center justify-between p-3 bg-dark rounded-xl border border-dark-border text-sm">
                    <div>
                      <p className="font-mono text-gold text-xs">{order.orderNumber}</p>
                      <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total)}</p>
                      <p className="text-xs text-white/40">{order.status}</p>
                    </div>
                  </div>
                ))}
                {selected.orders.length === 0 && <p className="text-white/30 text-sm text-center py-2">Aucune commande</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Notes internes</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Notes sur ce client (visible uniquement par l'admin)..."
                className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50 resize-none"
              />
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="mt-2 bg-gold/20 text-gold border border-gold/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50"
              >
                {savingNotes ? 'Sauvegarde...' : 'Sauvegarder les notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
