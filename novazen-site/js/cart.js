// ── Cart ──────────────────────────────────────────────────────────────────────
const Cart = {
  items: [],

  init() {
    try {
      this.items = JSON.parse(localStorage.getItem('nz-cart') || '[]');
    } catch { this.items = []; }
    // Retire les articles qui n'existent plus dans le catalogue
    this.items = this.items.filter(i => PRODUCTS.some(p => p.id === i.id));
    this.render();
  },

  save() {
    try { localStorage.setItem('nz-cart', JSON.stringify(this.items)); } catch {}
    this.render();
  },

  add(productId, qty = 1, variant = null) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const key = productId + (variant ? '|' + variant : '');
    const price = (variant && product.variantPrices?.[variant]) || product.price;
    const existing = this.items.find(i => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ key, id: productId, name: product.name, price, qty, variant });
    }
    this.save();
    showToast(`✓ ${product.name} ajouté au panier !`);
    bumpCart();
  },

  remove(key) {
    this.items = this.items.filter(i => i.key !== key);
    this.save();
  },

  setQty(key, qty) {
    if (qty < 1) { this.remove(key); return; }
    const item = this.items.find(i => i.key === key);
    if (item) { item.qty = qty; this.save(); }
  },

  subtotal() {
    return round2(this.items.reduce((s, i) => s + i.price * i.qty, 0));
  },

  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  clear() {
    this.items = [];
    this.save();
  },

  applyPromo(code) {
    const promo = PROMO_CODES[String(code || '').trim().toUpperCase()];
    if (!promo) return null;
    const sub = this.subtotal();
    const discount = round2(promo.type === 'percent'
      ? sub * promo.discount / 100
      : Math.min(promo.discount, sub));
    return { ...promo, discountAmount: discount, total: round2(sub - discount) };
  },

  // Sous-total, réduction, livraison et total à payer
  totals(promoCode) {
    const subtotal = this.subtotal();
    const promo = promoCode ? this.applyPromo(promoCode) : null;
    const discount = promo ? promo.discountAmount : 0;
    const shipping = subtotal - discount >= SHOP_CONFIG.freeShippingFrom || subtotal === 0 ? 0 : SHOP_CONFIG.shippingFee;
    return { subtotal, promo, discount, shipping, total: round2(subtotal - discount + shipping) };
  },

  render() {
    const count = this.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('hidden', count === 0);
    });
  },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, error = false) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast' + (error ? ' error' : '');
  t.setAttribute('role', 'status');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => t.classList.remove('show'), 2600);
  setTimeout(() => t.remove(), 3000);
}

function bumpCart() {
  document.querySelectorAll('.cart-btn').forEach(b => {
    b.classList.remove('wiggle-now');
    void b.offsetWidth;
    b.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg) scale(1.08)' }, { transform: 'rotate(8deg) scale(1.08)' }, { transform: 'rotate(0)' }], { duration: 450 });
  });
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function round2(n) {
  return Math.round(n * 100) / 100;
}

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: SHOP_CONFIG.currency }).format(n);
}

function discount(price, compare) {
  return compare ? Math.round((compare - price) / compare * 100) : 0;
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.addEventListener('DOMContentLoaded', () => Cart.init());
