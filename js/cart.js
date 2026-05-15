const Cart = {
  items: [],

  init() {
    try {
      this.items = JSON.parse(localStorage.getItem('nz-cart') || '[]');
    } catch { this.items = []; }
    this.render();
  },

  save() {
    localStorage.setItem('nz-cart', JSON.stringify(this.items));
    this.render();
  },

  add(productId, qty = 1, variant = null) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const key = productId + (variant || '');
    const existing = this.items.find(i => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ key, id: productId, name: product.name, price: product.price, image: product.image, qty, variant });
    }
    this.save();
    showToast('✓ Ajouté au panier !');
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
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  clear() {
    this.items = [];
    this.save();
  },

  applyPromo(code) {
    const promo = PROMO_CODES[code.trim().toUpperCase()];
    if (!promo) return null;
    const sub = this.subtotal();
    const discount = promo.type === 'percent'
      ? sub * promo.discount / 100
      : Math.min(promo.discount, sub);
    return { ...promo, discountAmount: discount, total: sub - discount };
  },

  render() {
    const count = this.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('hidden', count === 0);
    });
  },
};

function showToast(msg, error = false) {
  const t = document.createElement('div');
  t.className = 'fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl text-sm font-medium shadow-xl transition-all duration-300';
  t.style.cssText = `background:${error ? '#ef4444' : '#141414'};color:#fff;border:1px solid ${error ? '#ef4444' : 'rgba(201,168,76,.35)'};`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; }, 2800);
  setTimeout(() => t.remove(), 3200);
}

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function discount(price, compare) {
  return Math.round((compare - price) / compare * 100);
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
}

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  initMobileMenu();
});
