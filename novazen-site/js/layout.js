// ── Header / footer partagés + composants produits ────────────────────────────
const NAV_LINKS = [
  ['index.html', 'Accueil'],
  ['boutique.html', 'Boutique'],
  ['faq.html', 'FAQ'],
  ['contact.html', 'Contact'],
];

function logoHtml() {
  const name = escapeHtml(SHOP_CONFIG.name.toUpperCase());
  const cut = Math.ceil(name.length / 2);
  return `<a href="index.html" class="logo"><span class="ball wiggle"></span><span class="logo-text">${name.slice(0, cut)}<span>${name.slice(cut)}</span></span></a>`;
}

function renderHeader() {
  const el = document.getElementById('site-header');
  if (!el) return;
  const page = location.pathname.split('/').pop() || 'index.html';
  const msgs = [`Livraison offerte dès ${fmt(SHOP_CONFIG.freeShippingFrom)}`, 'Commande en DM Insta / TikTok', 'Nouveaux drops chaque semaine', 'Cartes envoyées sous toploader', 'Paiement PayPal'];
  const ticker = [...msgs, ...msgs].map(m => `<span>${m}</span><span>★</span>`).join('');
  el.innerHTML = `
    <div class="ticker" aria-hidden="true"><div class="ticker-track">${ticker}</div></div>
    <header class="nav">
      <div class="container">
        <div class="nav-inner">
          ${logoHtml()}
          <nav class="nav-links">${NAV_LINKS.map(([href, label]) => `<a href="${href}" class="${href === page ? 'active' : ''}">${label}</a>`).join('')}</nav>
          <div class="nav-actions">
            <a href="panier.html" class="btn btn-yellow btn-sm cart-btn" aria-label="Panier"><span style="width:16px;height:16px;display:inline-flex">${icon('bag')}</span><span class="cart-label">Panier</span><span class="cart-count hidden">0</span></a>
            <button class="menu-btn" aria-label="Menu" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">☰</button>
          </div>
        </div>
        <nav id="mobile-menu" class="mobile-menu hidden">${NAV_LINKS.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</nav>
      </div>
    </header>`;
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  const ig = encodeURIComponent(SHOP_CONFIG.instagram), tt = encodeURIComponent(SHOP_CONFIG.tiktok);
  el.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            ${logoHtml()}
            <p class="muted small" style="margin-top:14px;max-width:320px">${escapeHtml(SHOP_CONFIG.tagline)}. Boosters, coffrets, peluches et goodies, emballés comme des trésors.</p>
            <div class="social-row">
              <a href="https://instagram.com/${ig}" target="_blank" rel="noopener" aria-label="Instagram">${icon('insta')}</a>
              <a href="https://www.tiktok.com/@${tt}" target="_blank" rel="noopener" aria-label="TikTok">${icon('tiktok')}</a>
            </div>
          </div>
          <div><h4>Boutique</h4>${CATEGORIES.map(c => `<a href="boutique.html?cat=${encodeURIComponent(c.name)}">${c.name}</a>`).join('')}</div>
          <div><h4>Aide</h4><a href="faq.html">FAQ</a><a href="contact.html">Contact</a><a href="remboursement.html">Retours</a><a href="cgv.html">CGV</a></div>
          <div><h4>Commander</h4><a href="panier.html">Mon panier</a><a href="https://ig.me/m/${ig}" target="_blank" rel="noopener">DM Instagram</a><a href="https://www.tiktok.com/@${tt}" target="_blank" rel="noopener">TikTok</a></div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${escapeHtml(SHOP_CONFIG.name)} · Boutique indépendante de fans</span>
          <span>Pokémon est une marque de Nintendo / Creatures Inc. / GAME FREAK inc.</span>
        </div>
      </div>
    </footer>`;
}

// Visuel produit : photo si dispo, sinon visuel dessiné
function productVisual(p, index = 0) {
  const [c1] = pal(p.color);
  const soft = `--pc-soft:${c1}55`;
  const img = p.images?.[index];
  if (img) return `<div class="pvis foil" style="${soft}"><img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy"/></div>`;
  return `<div class="pvis foil" style="${soft}">${productArt(p.art, p.color)}</div>`;
}

const BADGE_COLORS = { 'Best-seller': 'tag-yellow', 'Nouveau': 'tag-mint', 'Rare': 'tag-lav', 'Précommande': 'tag-sky' };

function productBadges(p) {
  const tags = (p.badges || []).map(b => `<span class="tag ${BADGE_COLORS[b] || ''}">${escapeHtml(b)}</span>`);
  const d = discount(p.price, p.comparePrice);
  if (d > 0) tags.push(`<span class="tag tag-red">-${d}%</span>`);
  if (p.stock > 0 && p.stock <= 5) tags.push('<span class="tag">Derniers</span>');
  return tags.join('');
}

function productCard(p) {
  const url = `produit.html?id=${encodeURIComponent(p.id)}`;
  const quick = p.variants?.length
    ? `<a href="${url}" class="add-btn" aria-label="Choisir une option">+</a>`
    : `<button class="add-btn" aria-label="Ajouter au panier" onclick="Cart.add('${p.id}')">+</button>`;
  return `
    <article class="pcard" style="--glow:${pal(p.color)[0]}88">
      <a href="${url}" class="pcard-media">${productVisual(p)}<div class="pcard-badges">${productBadges(p)}</div></a>
      <div class="pcard-body">
        <span class="pcard-cat">${escapeHtml(p.category)}</span>
        <a href="${url}" class="pcard-name">${escapeHtml(p.name)}</a>
        <div class="pcard-foot">
          <div><div class="price">${p.variantPrices ? '<span class="xs muted" style="font-family:var(--font)">dès </span>' : ''}${fmt(p.price)}</div>${p.comparePrice ? `<div class="price-old">${fmt(p.comparePrice)}</div>` : ''}</div>
          ${quick}
        </div>
      </div>
    </article>`;
}

// Inclinaison 3D + reflet holo qui suit la souris (desktop uniquement)
function initTilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointermove', e => {
    const card = e.target.closest?.('.pcard, .tilt');
    document.querySelectorAll('.pcard[data-tilt], .tilt[data-tilt]').forEach(c => {
      if (c !== card) { c.removeAttribute('data-tilt'); c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); }
    });
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.setAttribute('data-tilt', '');
    card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
    card.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
    card.querySelectorAll('.foil').forEach(f => {
      f.style.setProperty('--mx', `${x * 100}%`); f.style.setProperty('--my', `${y * 100}%`);
      f.style.setProperty('--hx', `${x * 100}%`); f.style.setProperty('--hy', `${y * 100}%`);
    });
  });
}

// La police pixel n'a pas d'accents : on les retire dans les éléments qui l'utilisent
const PIXEL_SEL = '.btn, .eyebrow, .logo-text, .tag, .pcard-cat, .price, .dialog, .toast, .footer h4, .stat small, .order-ref, .ticker, .pixel, .cat small, .ref';
function stripAccents(root) {
  const els = root.matches?.(PIXEL_SEL) ? [root] : [];
  root.querySelectorAll?.(PIXEL_SEL).forEach(e => els.push(e));
  els.forEach(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) {
      const t = n.nodeValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (t !== n.nodeValue) n.nodeValue = t;
    }
  });
}
function initPixelText() {
  stripAccents(document.body);
  new MutationObserver(muts => muts.forEach(m => {
    m.addedNodes.forEach(n => n.nodeType === 1 ? stripAccents(n) : n.parentElement && stripAccents(n.parentElement));
    if (m.type === 'characterData' && m.target.parentElement) stripAccents(m.target.parentElement);
  })).observe(document.body, { childList: true, subtree: true, characterData: true });
}

renderHeader();
renderFooter();
initTilt();
document.addEventListener('DOMContentLoaded', initPixelText);
