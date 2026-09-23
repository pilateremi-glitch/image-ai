// ── Header / footer partagés + composants produits ────────────────────────────
const NAV_LINKS = [
  ['index.html', 'Accueil'],
  ['boutique.html', 'Boutique'],
  ['faq.html', 'FAQ'],
  ['contact.html', 'Contact'],
];

function logoHtml() {
  const name = escapeHtml(SHOP_CONFIG.name);
  // Met en couleur la 2e moitié du nom (PokéPop → Poké + Pop)
  const cut = Math.ceil(name.length / 2);
  return `<a href="index.html" class="logo"><span class="ball wiggle"></span><span class="logo-text">${name.slice(0, cut)}<span>${name.slice(cut)}</span></span></a>`;
}

function renderHeader() {
  const el = document.getElementById('site-header');
  if (!el) return;
  const page = location.pathname.split('/').pop() || 'index.html';
  const ship = fmt(SHOP_CONFIG.freeShippingFrom);
  const msgs = [`🚚 Livraison offerte dès ${ship}`, '💬 Commande en DM Insta / TikTok', '⚡ Nouveautés chaque semaine', '📦 Envoi soigné & protégé', '💳 Paiement PayPal'];
  const ticker = [...msgs, ...msgs].map(m => `<span>${m}</span><span>✦</span>`).join('');
  el.innerHTML = `
    <div class="ticker" aria-hidden="true"><div class="ticker-track">${ticker}</div></div>
    <header class="nav">
      <div class="container">
        <div class="nav-inner">
          ${logoHtml()}
          <nav class="nav-links">${NAV_LINKS.map(([href, label]) => `<a href="${href}" class="${href === page ? 'active' : ''}">${label}</a>`).join('')}</nav>
          <div class="nav-actions">
            <a href="panier.html" class="btn btn-yellow btn-sm cart-btn" aria-label="Panier">🛒 <span class="cart-label">Panier</span><span class="cart-count hidden">0</span></a>
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
  el.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            ${logoHtml()}
            <p class="small" style="margin-top:12px;color:#cfc6e2;max-width:320px">${escapeHtml(SHOP_CONFIG.tagline)} : cartes, peluches, figurines et goodies, envoyés avec amour 💛</p>
            <div class="social-row">
              <a href="https://instagram.com/${encodeURIComponent(SHOP_CONFIG.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">IG</a>
              <a href="https://www.tiktok.com/@${encodeURIComponent(SHOP_CONFIG.tiktok)}" target="_blank" rel="noopener" aria-label="TikTok">TT</a>
            </div>
          </div>
          <div><h4>Boutique</h4>${CATEGORIES.map(c => `<a href="boutique.html?cat=${encodeURIComponent(c.name)}">${c.emoji} ${c.name}</a>`).join('')}</div>
          <div><h4>Aide</h4><a href="faq.html">FAQ</a><a href="contact.html">Contact</a><a href="remboursement.html">Retours & remboursement</a><a href="cgv.html">CGV</a></div>
          <div><h4>Commander</h4><a href="panier.html">Mon panier</a><a href="https://ig.me/m/${encodeURIComponent(SHOP_CONFIG.instagram)}" target="_blank" rel="noopener">DM Instagram</a><a href="https://www.tiktok.com/@${encodeURIComponent(SHOP_CONFIG.tiktok)}" target="_blank" rel="noopener">TikTok</a></div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${escapeHtml(SHOP_CONFIG.name)}. Boutique de fans indépendante.</span>
          <span>Pokémon est une marque de Nintendo / Creatures Inc. / GAME FREAK inc.</span>
        </div>
      </div>
    </footer>`;
}

// Visuel produit : photo si dispo, sinon vignette illustrée
function productVisual(p, index = 0) {
  const img = p.images?.[index];
  if (img) return `<div class="pvis holo"><img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy"/></div>`;
  const inner = p.emoji === 'ball' ? '<span class="ball"></span>' : `<span class="pvis-emoji">${p.emoji || '⭐'}</span>`;
  return `<div class="pvis holo bg-${p.color || 'pink'}">${inner}</div>`;
}

const BADGE_COLORS = { 'Best-seller': 'tag-red', 'Nouveau': 'tag-mint', 'Rare': 'tag-lav', 'Précommande': 'tag-sky' };

function productBadges(p) {
  const tags = (p.badges || []).map(b => `<span class="tag ${BADGE_COLORS[b] || 'tag-yellow'}">${escapeHtml(b)}</span>`);
  const d = discount(p.price, p.comparePrice);
  if (d > 0) tags.push(`<span class="tag tag-yellow">-${d}%</span>`);
  if (p.stock > 0 && p.stock <= 5) tags.push('<span class="tag">🔥 Derniers</span>');
  return tags.join('');
}

function productCard(p) {
  const url = `produit.html?id=${encodeURIComponent(p.id)}`;
  const quick = p.variants?.length
    ? `<a href="${url}" class="add-btn" aria-label="Choisir une option">+</a>`
    : `<button class="add-btn" aria-label="Ajouter au panier" onclick="Cart.add('${p.id}')">+</button>`;
  return `
    <article class="pcard">
      <a href="${url}" class="pcard-media">${productVisual(p)}<div class="pcard-badges">${productBadges(p)}</div></a>
      <div class="pcard-body">
        <span class="pcard-cat">${escapeHtml(p.category)}</span>
        <a href="${url}" class="pcard-name">${escapeHtml(p.name)}</a>
        <div class="pcard-foot">
          <div><div class="price">${p.variantPrices ? '<small class="xs">dès </small>' : ''}${fmt(p.price)}</div>${p.comparePrice ? `<div class="price-old">${fmt(p.comparePrice)}</div>` : ''}</div>
          ${quick}
        </div>
      </div>
    </article>`;
}

renderHeader();
renderFooter();
