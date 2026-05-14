'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import { Search, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'SHIPPED', label: 'Expédiées' },
  { value: 'DELIVERED', label: 'Livrées' },
  { value: 'CANCELLED', label: 'Annulées' },
];

const statusColors: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-blue-400 bg-blue-400/10',
  SHIPPED: 'text-purple-400 bg-purple-400/10',
  DELIVERED: 'text-green-400 bg-green-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
};

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/orders${statusFilter ? `?status=${statusFilter}` : ''}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Statut mis à jour');
      fetchOrders();
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Commandes</h1>
          <p className="text-white/40 text-sm mt-1">{orders.length} commande(s)</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === opt.value
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-dark-card border border-dark-border text-white/50 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-white/40">Aucune commande</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['N° Commande', 'Client', 'Total', 'Paiement', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b border-dark-border hover:bg-dark-hover transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3 font-mono text-gold text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <p className="text-xs text-white/40">{order.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-sm text-white/60 capitalize">{order.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || 'text-white/60 bg-white/10'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="bg-dark border border-dark-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-gold/50"
                      >
                        {statusOptions.filter(o => o.value).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg font-mono text-gold">{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/40 text-xs">Client</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Email</p>
                  <p>{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Téléphone</p>
                  <p>{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Paiement</p>
                  <p className="capitalize">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
              <div className="border-t border-dark-border pt-4">
                <p className="text-xs text-white/40 mb-2">Articles</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-gold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-border pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-gold">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
