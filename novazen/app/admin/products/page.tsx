'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  costPrice: number;
  images: string;
  category: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
}

const emptyForm = {
  name: '', description: '', benefits: '', price: '', comparePrice: '',
  costPrice: '', images: '', category: '', stock: '100',
  variants: '', isActive: true, isFeatured: false, isBestSeller: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: '',
      benefits: '',
      price: p.price.toString(),
      comparePrice: p.comparePrice?.toString() || '',
      costPrice: p.costPrice.toString(),
      images: p.images,
      category: p.category,
      stock: p.stock.toString(),
      variants: '',
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      costPrice: parseFloat(form.costPrice),
      stock: parseInt(form.stock),
      images: form.images.startsWith('[') ? form.images : JSON.stringify([form.images]),
      benefits: form.benefits.startsWith('[') ? form.benefits : JSON.stringify(form.benefits.split('\n').filter(Boolean)),
    };

    try {
      if (editing) {
        await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Produit mis à jour');
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Produit créé');
      }
      setShowForm(false);
      fetchProducts();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const toggleActive = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    toast.success(p.isActive ? 'Produit désactivé' : 'Produit activé');
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Désactiver ce produit ?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    toast.success('Produit supprimé');
    fetchProducts();
  };

  const margin = (p: Product) => {
    return Math.round(((p.price - p.costPrice) / p.price) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Produits</h1>
          <p className="text-white/40 text-sm mt-1">{products.length} produit(s)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gold text-dark font-semibold px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Products table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Produit', 'Catégorie', 'Prix', 'Coût', 'Marge', 'Stock', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const images = JSON.parse(p.images) as string[];
                  const m = margin(p);
                  return (
                    <tr key={p.id} className="border-b border-dark-border hover:bg-dark-hover transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-dark flex-shrink-0">
                            <Image src={images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <div className="flex gap-1 mt-0.5">
                              {p.isFeatured && <span className="text-[10px] bg-blue-400/20 text-blue-400 px-1.5 py-0.5 rounded-full">Tendance</span>}
                              {p.isBestSeller && <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">Best seller</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{p.category}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gold">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{formatPrice(p.costPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${m >= 70 ? 'text-green-400' : m >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {m}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                          {p.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-dark-border text-white/50 hover:text-white transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleActive(p)} className="p-1.5 rounded-lg hover:bg-dark-border text-white/50 hover:text-white transition-colors">
                            {p.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-400/10 text-white/50 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Nom du produit *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Bénéfices (un par ligne)</label>
                  <textarea rows={3} value={form.benefits} onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50 resize-none" />
                </div>
                {[
                  { key: 'price', label: 'Prix de vente (€) *', required: true },
                  { key: 'comparePrice', label: 'Prix barré (€)' },
                  { key: 'costPrice', label: 'Coût fournisseur (€) *', required: true },
                  { key: 'stock', label: 'Stock *', required: true },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-white/50 mb-1">{f.label}</label>
                    <input type="number" step="0.01" required={f.required}
                      value={form[f.key as keyof typeof form] as string}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-white/50 mb-1">Catégorie *</label>
                  <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50">
                    <option value="">Choisir...</option>
                    {['Massage & Bien-être','Sommeil','Fitness & Sport','Fitness & Tech','Posture & Santé','Bien-être & Relaxation','Soin & Beauté'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Images (URLs, une par ligne ou JSON)</label>
                  <textarea rows={2} value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50 resize-none" />
                </div>
                <div className="col-span-2 flex flex-wrap gap-4">
                  {[
                    { key: 'isActive', label: 'Actif' },
                    { key: 'isFeatured', label: 'Mis en avant' },
                    { key: 'isBestSeller', label: 'Best seller' },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={form[f.key as keyof typeof form] as boolean}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))}
                        className="accent-gold" />
                      <span className="text-sm">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold-light transition-colors">
                  {editing ? 'Mettre à jour' : 'Créer le produit'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 border border-dark-border rounded-xl text-white/60 hover:text-white transition-colors">
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
