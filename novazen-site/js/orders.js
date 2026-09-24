// ── Orders ────────────────────────────────────────────────────────────────────
const ORDER_STATUSES = ['En attente', 'Payée', 'Envoyée'];
const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const Orders = {
  all() {
    try { return JSON.parse(localStorage.getItem('nz-orders') || '[]'); }
    catch { return []; }
  },

  saveAll(orders) {
    localStorage.setItem('nz-orders', JSON.stringify(orders));
  },

  // Référence unique : 4 caractères aléatoires + compteur (ex : Z3F4-0001)
  newRef() {
    let seq = parseInt(localStorage.getItem('nz-order-seq') || '0', 10) + 1;
    localStorage.setItem('nz-order-seq', String(seq));
    const rand = Array.from(crypto.getRandomValues(new Uint32Array(4)), n => REF_CHARS[n % REF_CHARS.length]).join('');
    return `${rand}-${String(seq).padStart(4, '0')}`;
  },

  create({ customer, method, items, subtotal, promo, discount, shipping, total }) {
    const order = {
      ref: this.newRef(),
      customer: customer.trim().replace(/^@?/, '@'),
      method,
      items: items.map(i => ({ name: i.name, variant: i.variant || null, qty: i.qty, price: i.price })),
      subtotal, promo: promo || null, discount: discount || 0, shipping: shipping || 0, total,
      status: 'En attente',
      createdAt: new Date().toISOString(),
    };
    this.upsert(order);
    return order;
  },

  upsert(order) {
    const orders = this.all().filter(o => o.ref !== order.ref);
    orders.unshift(order);
    this.saveAll(orders);
  },

  setStatus(ref, status) {
    const orders = this.all();
    const o = orders.find(o => o.ref === ref);
    if (o) { o.status = status; this.saveAll(orders); }
  },

  remove(ref) {
    this.saveAll(this.all().filter(o => o.ref !== ref));
  },

  recap(o) {
    const date = new Date(o.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    const lines = [
      `COMMANDE ${SHOP_CONFIG.name.toUpperCase()}`,
      `Réf : ${o.ref}`,
      `Client : ${o.customer}`,
      `Date : ${date}`,
      `Paiement : ${o.method}`,
      '',
      ...o.items.map(i => `• ${i.name}${i.variant ? ` (${i.variant})` : ''} ×${i.qty} — ${fmt(i.price * i.qty)}`),
      '',
      `Sous-total : ${fmt(o.subtotal)}`,
    ];
    if (o.discount) lines.push(`Réduction${o.promo ? ` (${o.promo})` : ''} : -${fmt(o.discount)}`);
    lines.push(`Livraison : ${o.shipping ? fmt(o.shipping) : 'Offerte'}`, `TOTAL : ${fmt(o.total)}`);
    return lines.join('\n');
  },

  // Reconstruit une commande depuis un récap reçu en DM (utilisé par l'admin)
  parseRecap(text) {
    const ref = text.match(/R[ée]f\s*:\s*([A-Z0-9]{4}-\d{4,})/i);
    const total = text.match(/^TOTAL\s*:\s*([^\n]+)/m);
    if (!ref || !total) return null;
    const field = re => (text.match(re) || [])[1]?.trim() || '';
    const items = [...text.matchAll(/^•\s*(.+?)\s*×(\d+)\s*—\s*(.+)$/gm)].map(m => {
      const qty = parseInt(m[2], 10);
      const [, name, variant] = m[1].match(/^(.*?)(?:\s*\(([^)]*)\))?$/);
      return { name, variant: variant || null, qty, price: parseAmount(m[3]) / qty };
    });
    const sub = field(/Sous-total\s*:\s*([^\n]+)/i);
    const ship = field(/Livraison\s*:\s*([^\n]+)/i);
    const disc = text.match(/Réduction(?:\s*\(([^)]*)\))?\s*:\s*-?([^\n]+)/i);
    return {
      ref: ref[1].toUpperCase(),
      customer: field(/Client\s*:\s*([^\n]+)/i) || '—',
      method: field(/Paiement\s*:\s*([^\n]+)/i) || 'DM',
      items,
      subtotal: sub ? parseAmount(sub) : parseAmount(total[1]),
      promo: disc?.[1] || null,
      discount: disc ? parseAmount(disc[2]) : 0,
      shipping: ship ? parseAmount(ship) : 0,
      total: parseAmount(total[1]),
      status: 'En attente',
      createdAt: new Date().toISOString(),
    };
  },
};

function parseAmount(str) {
  return parseFloat(String(str).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')) || 0;
}


function paypalLink(total) {
  return `https://paypal.me/${SHOP_CONFIG.paypalMe}/${total.toFixed(2)}${SHOP_CONFIG.currency}`;
}

async function copyText(text, msg = '✓ Récap copié !') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  showToast(msg);
}
