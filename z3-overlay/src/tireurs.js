/* ==========================================================================
   Z3 — TOP TIREURS : chaque booster acheté par un viewer lui est attribué,
   les hits sortis de SON booster lui rapportent des points.
   Points : RARE 1 · HIT 3 · SECRÈTE 6 · GOD PACK 10
   File d'attente : chaque achat (StreamElements/Streamlabs ou dock) ajoute un booster.
   Commandes (dock / script) : Z3.buyer('Sacha') · Z3.nextBuyer() · Z3.addBooster('Sacha', 2)
   ========================================================================== */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.has('static') || Q.has('hitonly') || !window.Z3 || !window.Z3.hit) return;   // l'overlay principal tient le classement
  const RKEY = 'z3-recap-v1', PTS = { rare: 1, ultra: 3, secret: 6, god: 10, flop: 0 };
  const load = () => { try { return JSON.parse(localStorage.getItem(RKEY) || 'null') || window.Z3.recap(); } catch (e) { return window.Z3.recap(); } };
  const save = (r) => { try { localStorage.setItem(RKEY, JSON.stringify(r)); } catch (e) { /* rien */ } };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = (n) => String(n || '').trim().replace(/^@/, '').slice(0, 24);
  function ensure(r) { r.queue = r.queue || []; r.current = r.current || ''; r.players = r.players || {}; return r; }
  function player(r, name) { return (r.players[name] = r.players[name] || { boosters: 0, rare: 0, ultra: 0, secret: 0, god: 0, flop: 0, score: 0, best: null }); }
  function ranking(r) { return Object.entries(r.players).map(([name, p]) => Object.assign({ name }, p)).filter((p) => p.boosters || p.score).sort((a, b) => b.score - a.score || b.secret - a.secret || b.boosters - a.boosters); }

  /* ---------- panneau overlay ---------- */
  const css = document.createElement('style');
  css.textContent = `
  #tireurs{position:absolute;inset:0;pointer-events:none}
  #tireurs .box{position:absolute;left:20px;top:640px;width:340px;height:246px;display:none}
  #tireurs.on .box{display:block}
  #tireurs .cur{position:absolute;left:16px;right:16px;top:44px;height:34px;display:flex;align-items:center;gap:8px;padding:0 10px;font-size:17px;letter-spacing:1px;
    background:linear-gradient(90deg,rgba(255,63,208,.9),rgba(139,44,255,.85));clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);white-space:nowrap;overflow:hidden}
  #tireurs .cur small{font-size:12px;letter-spacing:3px;opacity:.85}
  #tireurs .cur b{overflow:hidden;text-overflow:ellipsis}
  #tireurs .cur i{margin-left:auto;font-style:normal;font-size:13px;opacity:.9}
  #tireurs .rows{position:absolute;left:16px;right:16px;top:86px;display:grid;gap:4px}
  #tireurs .row{display:grid;grid-template-columns:26px 1fr auto 44px;gap:8px;align-items:center;height:28px;padding:0 8px;background:rgba(255,255,255,.05);font-size:17px}
  #tireurs .row.flash{animation:trow 1.2s ease}
  @keyframes trow{0%{background:rgba(255,210,58,.6)}100%{background:rgba(255,255,255,.05)}}
  #tireurs .rk{font-family:Orbitron;font-weight:900;font-size:14px;color:#ffd23a;text-align:center}
  #tireurs .row:nth-child(2) .rk{color:#e6e9f2} #tireurs .row:nth-child(3) .rk{color:#e09a5a} #tireurs .row:nth-child(n+4) .rk{color:#b9a2d6}
  #tireurs .nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #tireurs .ic{font-size:12px;letter-spacing:1px;white-space:nowrap}
  #tireurs .ic span{margin-left:4px} .tc1{color:#7bd0ff} .tc2{color:#ffd23a} .tc3{color:#ff7be6}
  #tireurs .sc{font-family:Orbitron;font-weight:900;font-size:15px;text-align:right;color:#fff;text-shadow:0 0 8px #ff3fd0}
  #tireurs .empty{position:absolute;left:16px;right:16px;top:96px;font-size:13px;letter-spacing:3px;color:rgba(255,255,255,.45);text-align:center}`;
  document.head.appendChild(css);
  const lay = document.createElement('div'); lay.id = 'tireurs'; lay.className = 'layer';
  lay.innerHTML = `<div class="panel box" data-panel='{"a1":0.6,"a2":0.3}'><div class="head">TOP TIREURS<span class="jp">神引き</span></div><div class="cur"></div><div class="rows"></div></div>`;
  const alerts = document.getElementById('alerts');
  (alerts ? alerts.parentNode.insertBefore(lay, alerts.nextSibling) : document.body.appendChild(lay));
  // fond du panneau (même style verre néon que les autres)
  lay.querySelector('.box').insertAdjacentHTML('afterbegin', `<svg class="pbg" width="340" height="246" viewBox="0 0 340 246">
    <defs><linearGradient id="trg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10031f" stop-opacity=".6"/><stop offset="1" stop-color="#2c0846" stop-opacity=".3"/></linearGradient>
    <linearGradient id="trs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff3fd0"/><stop offset=".5" stop-color="#b44dff"/><stop offset="1" stop-color="#7b5cff"/></linearGradient></defs>
    <polygon points="14,0 340,0 340,232 326,246 0,246 0,14" fill="url(#trg)"/><polygon points="14,0 340,0 340,232 326,246 0,246 0,14" fill="none" stroke="url(#trs)" stroke-width="1.8"/>
    <path d="M0,40 L0,14 L14,0 L60,0" fill="none" stroke="#fff" stroke-width="3.2"/><path d="M340,206 L340,232 L326,246 L280,246" fill="none" stroke="#ff3fd0" stroke-width="3.2"/></svg>`);

  let flashName = '';
  function render() {
    const r = ensure(load()), top = ranking(r).slice(0, 5);
    lay.classList.toggle('on', !!(r.current || top.length || r.queue.length) && !Q.has('notireurs'));
    lay.querySelector('.cur').innerHTML = r.current
      ? `<small>BOOSTER DE</small><b>@${esc(r.current)}</b><i>${r.queue.length ? '+' + r.queue.length + ' en file' : ''}</i>`
      : `<small>FILE</small><b>${r.queue.length ? esc(r.queue[0]) + ' …' : 'aucun booster'}</b><i>${r.queue.length ? r.queue.length + ' en file' : ''}</i>`;
    lay.querySelector('.rows').innerHTML = top.length ? top.map((p, i) => `<div class="row${p.name === flashName ? ' flash' : ''}"><span class="rk">${i + 1}</span><span class="nm">${esc(p.name)}</span>
      <span class="ic">${p.secret ? `<span class="tc3">★${p.secret}</span>` : ''}${p.ultra ? `<span class="tc2">◆${p.ultra}</span>` : ''}${p.rare ? `<span class="tc1">●${p.rare}</span>` : ''}${p.god ? `<span class="tc2">GOD</span>` : ''}</span><span class="sc">${p.score}</span></div>`).join('')
      : '';
    if (!top.length) lay.querySelector('.rows').innerHTML = '<div class="empty">LES HITS DE VOS BOOSTERS<br>VOUS RAPPORTENT DES POINTS</div>';
    flashName = '';
    publish(r);
  }
  function publish(r) {
    if (window.Z3send) window.Z3send({ kind: 'state', items: r.items || {}, boosters: r.boosters || 0, cards: r.cards || 0, current: r.current, queue: r.queue.slice(0, 30), top: ranking(r).slice(0, 10).map((p) => ({ name: p.name, score: p.score, boosters: p.boosters })) });
  }

  /* ---------- actions ---------- */
  function setBuyer(name, fromQueue) {
    const r = ensure(load()); name = clean(name);
    r.current = name;
    if (name) { if (!fromQueue) { const i = r.queue.indexOf(name); if (i >= 0) r.queue.splice(i, 1); } player(r, name).boosters++;
      if (!Q.has('nocountbuyer')) { r.items = r.items || {}; r.items.Booster = (r.items.Booster || 0) + 1; r.boosters = (r.boosters || 0) + 1; } }
    save(r); render();
  }
  function nextBuyer() { const r = ensure(load()); const n = r.queue.shift() || ''; save(r); setBuyer(n, true); }
  function addBooster(name, qty) {
    const r = ensure(load()); name = clean(name); if (!name) return;
    for (let i = 0; i < Math.max(1, Math.min(36, +qty || 1)); i++) r.queue.push(name);
    save(r); render();
  }
  function credit(tier, name, opts) {
    const r = ensure(load()); if (!r.current) return;
    const p = player(r, r.current); p[tier] = (p[tier] || 0) + 1; p.score += PTS[tier] || 0;
    const rank = { god: 4, secret: 3, ultra: 2, rare: 1 };
    if (tier !== 'flop' && (!p.best || rank[tier] > rank[p.best.tier])) p.best = { tier, name: name || '', img: (opts && opts.img) || '' };
    save(r); flashName = r.current; render();
  }

  /* ---------- branchements ---------- */
  const origHit = window.Z3.hit;
  window.Z3.hit = function (tier, name, opts) {
    const r = ensure(load());
    credit(tier, name, opts);
    return origHit(tier, name, Object.assign({}, opts, { by: r.current }));
  };
  if (window.Z3.event) {
    const origEvent = window.Z3.event;
    window.Z3.event = function (e) {
      if (e && e.type === 'achat') addBooster(e.name, e.qty || (Q.get('boosterprice') && e.amount ? Math.round(e.amount / +Q.get('boosterprice')) : 1));
      return origEvent(e);
    };
  }
  window.Z3.buyer = setBuyer; window.Z3.nextBuyer = nextBuyer; window.Z3.addBooster = addBooster;
  window.Z3.cmd = function (m) {
    if (m.cmd === 'buyer') setBuyer(m.name);
    else if (m.cmd === 'nextbuyer') nextBuyer();
    else if (m.cmd === 'addbooster') addBooster(m.name, m.qty);
    else if (m.cmd === 'state') render();
    else if (m.cmd === 'item' || m.cmd === 'itemundo') {        // produit ouvert (ETB, UPC, Tripack…)
      const r = ensure(load()); r.items = r.items || {}; const k = String(m.item || 'Booster').slice(0, 24), n = Math.max(0, +m.boosters || 0), d = m.cmd === 'item' ? 1 : -1;
      if (d < 0 && !r.items[k]) return;
      r.items[k] = (r.items[k] || 0) + d; if (!r.items[k]) delete r.items[k];
      r.boosters = Math.max(0, (r.boosters || 0) + d * n); save(r); render();
    }
    else if (m.cmd === 'getrecap' && window.Z3send) window.Z3send({ kind: 'recapdata', recap: ensure(load()), rank: ranking(ensure(load())) });
  };
  window.Z3.tireurs = () => ranking(ensure(load()));
  // touches de test (Interagir) : N = booster suivant
  window.addEventListener('keydown', (e) => { if (e.key === 'n' || e.key === 'N') nextBuyer(); });
  setTimeout(render, 50);
  // fin du live (chrono à zéro) → prévient la page vidéo récap (recap-video.html?auto)
  let ended = false;
  setInterval(() => { const t = document.getElementById('vTime'); if (!t) return; const z = t.textContent === '00:00:00';
    if (z && !ended && window.Z3send) window.Z3send({ kind: 'liveend', recap: ensure(load()), rank: ranking(ensure(load())) }); ended = z; }, 1000);
})();
