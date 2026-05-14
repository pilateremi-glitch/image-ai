import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { TrendingUp, ShoppingCart, Users, Package, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/10' },
  CONFIRMED: { label: 'Confirmée', color: 'text-blue-400 bg-blue-400/10' },
  SHIPPED: { label: 'Expédiée', color: 'text-purple-400 bg-purple-400/10' },
  DELIVERED: { label: 'Livrée', color: 'text-green-400 bg-green-400/10' },
  CANCELLED: { label: 'Annulée', color: 'text-red-400 bg-red-400/10' },
};

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalOrders, totalCustomers, totalProducts, pendingOrders, revenue, monthlyRevenue, recentOrders, topProducts] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { items: true } }),
    prisma.orderItem.groupBy({ by: ['name'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
  ]);

  return { totalOrders, totalCustomers, totalProducts, pendingOrders, revenue, monthlyRevenue, recentOrders, topProducts };
}

export default async function AdminDashboard() {
  const { totalOrders, totalCustomers, totalProducts, pendingOrders, revenue, monthlyRevenue, recentOrders, topProducts } = await getDashboardData();

  const stats = [
    { label: 'Chiffre d\'affaires total', value: formatPrice(revenue._sum.total || 0), icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Ce mois-ci', value: formatPrice(monthlyRevenue._sum.total || 0), icon: <TrendingUp className="w-5 h-5" />, color: 'text-gold' },
    { label: 'Commandes totales', value: totalOrders, icon: <ShoppingCart className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Clients', value: totalCustomers, icon: <Users className="w-5 h-5" />, color: 'text-purple-400' },
    { label: 'Produits actifs', value: totalProducts, icon: <Package className="w-5 h-5" />, color: 'text-gold' },
    { label: 'En attente', value: pendingOrders, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Vue d&apos;ensemble de votre boutique</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <div className={`flex items-center gap-2 mb-3 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Commandes récentes</h2>
            <a href="/admin/orders" className="text-gold text-xs hover:underline">Voir tout</a>
          </div>
          <div className="space-y-2">
            {recentOrders.map(order => {
              const status = statusLabels[order.status] || { label: order.status, color: 'text-white/60 bg-white/10' };
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                  <div>
                    <p className="text-sm font-medium font-mono text-gold">{order.orderNumber}</p>
                    <p className="text-xs text-white/40">{order.customerName} · {order.items.length} article(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Produits populaires</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.name}</p>
                  <p className="text-xs text-white/40">{p._sum.quantity} vendus</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-white/30 text-sm">Aucune vente pour l&apos;instant</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
