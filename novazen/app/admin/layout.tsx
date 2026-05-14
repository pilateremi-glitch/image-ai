'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/orders', label: 'Commandes', icon: <ShoppingCart className="w-4 h-4" /> },
  { href: '/admin/products', label: 'Produits', icon: <Package className="w-4 h-4" /> },
  { href: '/admin/customers', label: 'Clients CRM', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/promos', label: 'Promotions', icon: <Tag className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col">
        <div className="p-6 border-b border-dark-border">
          <Link href="/">
            <span className="font-display text-xl font-bold gold-gradient">NovaZen</span>
          </Link>
          <p className="text-xs text-white/30 mt-1">Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                pathname === item.href
                  ? 'bg-gold/20 text-gold font-medium'
                  : 'text-white/50 hover:text-white hover:bg-dark-hover'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            ← Retour au site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
