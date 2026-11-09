/* ==========================================================================
   Z3 LIVE — alertes & événements du live
   Z3.event({ type, name, amount })   type : follow · achat · don · sub · raid · bits
   Sources :
     ?se=<JWT StreamElements>     (Dashboard StreamElements › Mon compte › Canaux › JWT)
     ?sl=<token socket Streamlabs> (Streamlabs › Paramètres › Clés API › Socket API Token)
     Touches de test (Interagir) : 1 follow · 2 achat · 3 don · 4 sub · 5 raid
     ?demoevents                    événements de démonstration automatiques
   Temps ajouté par événement (façon subathon) : ?addtime
     réglable : &t_follow=60&t_sub=300&t_don=60 (par €/unité)&t_achat=120&t_raid=300&t_bits=60 (par 100)
   ========================================================================== */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.has('static')) return;
  const $ = (s) => document.querySelector(s);

  const TYPES = {
    follow: { t: 'NOUVEAU FOLLOW', jp: 'フォロー', c: '#ff7be6', icon: '❤', sec: +(Q.get('t_follow') || 60) },
    achat:  { t: 'NOUVEL ACHAT', jp: '購入', c: '#ffd23a', icon: '✦', sec: +(Q.get('t_achat') || 120) },
    don:    { t: 'DON', jp: '支援', c: '#7bffea', icon: '◆', sec: +(Q.get('t_don') || 60), per: 1 },
    sub:    { t: 'NOUVEL ABONNÉ', jp: 'サブスク', c: '#b98cff', icon: '★', sec: +(Q.get('t_sub') || 300) },
    raid:   { t: 'RAID', jp: 'レイド', c: '#ff5a7a', icon: '⚔', sec: +(Q.get('t_raid') || 300) },
    bits:   { t: 'BITS', jp: 'ビッツ', c: '#7bd0ff', icon: '◆', sec: +(Q.get('t_bits') || 60), per: 100 },
  };
  const ADDTIME = Q.has('addtime');

  const css = document.createElement('style');
  css.textContent = `
  #evt{position:absolute;inset:0;pointer-events:none}
  #evt .ban{position:absolute;left:50%;top:330px;width:900px;margin-left:-450px;text-align:center;opacity:0}
  #evt .ban.go{animation:banIn 5s cubic-bezier(.2,1.4,.4,1) forwards}
  @keyframes banIn{0%{opacity:0;transform:scale(.2) rotate(-8deg);filter:blur(0)}8%{opacity:1;transform:scale(1.12) rotate(-3deg);filter:blur(0)}14%{transform:scale(1) rotate(-3deg)}85%{opacity:1;transform:scale(1) rotate(-3deg);filter:blur(0)}100%{opacity:0;transform:scale(1.4) rotate(-3deg);filter:blur(8px)}}
  #evt .plate{position:relative;display:inline-block;padding:18px 70px 22px;background:linear-gradient(135deg,rgba(16,4,32,.92),rgba(60,10,90,.85));
    clip-path:polygon(28px 0,100% 0,calc(100% - 28px) 100%,0 100%);border-bottom:6px solid var(--c)}
  #evt .kind{font-family:Rajdhani;font-weight:700;font-size:30px;letter-spacing:12px;color:var(--c);text-shadow:0 0 14px var(--c)}
  #evt .kind .jp{font-family:NotoJP;font-size:22px;letter-spacing:4px;margin-left:12px;color:#fff;opacity:.85}
  #evt .who{font-family:Bangers;font-size:110px;line-height:1;letter-spacing:3px;color:#fff;-webkit-text-stroke:3px var(--c);
    text-shadow:0 0 22px var(--c),0 6px 0 #3a0a66;white-space:nowrap;max-width:860px;overflow:hidden;text-overflow:ellipsis}
  #evt .amt{font-family:Orbitron;font-weight:900;font-size:40px;color:var(--c);text-shadow:0 0 12px var(--c)}
  #evt .plus{position:absolute;right:-20px;top:-30px;font-family:Bangers;font-size:44px;color:#fff;background:var(--c);padding:2px 16px;transform:rotate(8deg);
    box-shadow:0 0 20px var(--c);color:#2a0748}
  #evt .rays{position:absolute;left:50%;top:50%;width:1400px;height:1400px;margin:-700px 0 0 -700px;z-index:-1;opacity:.55;
    background:repeating-conic-gradient(from 0deg,var(--c) 0 3deg,transparent 3deg 12deg);
    -webkit-mask:radial-gradient(circle,#000 0,transparent 60%);mask:radial-gradient(circle,#000 0,transparent 60%);animation:spin 6s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  #alerts .zone .feed{position:absolute;inset:8px;display:flex;flex-direction:column;gap:8px;justify-content:flex-end}
  #alerts .zone .it{display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(255,255,255,.06);border-left:4px solid var(--c);
    font-size:20px;letter-spacing:1px;animation:itIn .5s cubic-bezier(.2,1.5,.4,1)}
  #alerts .zone .it b{color:var(--c);font-size:14px;letter-spacing:3px;min-width:96px}
  #alerts .zone .it span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
  #alerts .zone .it i{font-style:normal;font-family:Orbitron;font-weight:900;font-size:14px;color:var(--c)}
  @keyframes itIn{from{transform:translateX(-40px);opacity:0}}
  .widget.ping{animation:ping .9s ease-out}
  @keyframes ping{0%{transform:scale(1.06);filter:brightness(1.8)}100%{transform:none}}
  `;
  document.head.appendChild(css);
  const evt = document.createElement('div'); evt.id = 'evt'; evt.className = 'layer';
  document.body.appendChild(evt);
  const zone = $('#alerts .zone');
  if (zone) { zone.querySelector('.ph') && (zone.querySelector('.ph').style.display = 'none'); zone.insertAdjacentHTML('beforeend', '<div class="feed"></div>'); }

  /* top supporter : cumul des dons/achats sauvegardé */
  const TKEY = 'z3f4-top-v1';
  let tops = {}; try { tops = JSON.parse(localStorage.getItem(TKEY) || '{}'); } catch (e) { tops = {}; }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const queue = []; let busy = false;
  function event(e) {
    const type = TYPES[e.type] ? e.type : 'follow';
    queue.push({ type, name: String(e.name || 'Anonyme').slice(0, 24), amount: +e.amount || 0 });
    if (!busy) play();
  }
  function play() {
    const e = queue.shift(); if (!e) { busy = false; return; }
    busy = true;
    const T = TYPES[e.type];
    const amtTxt = e.amount ? (e.type === 'don' || e.type === 'achat' ? e.amount.toFixed(2).replace('.', ',') + ' €' : e.type === 'raid' ? e.amount + ' viewers' : e.type === 'sub' ? e.amount + ' mois' : e.amount + '') : '';
    let added = 0;
    if (ADDTIME && window.Z3 && window.Z3.add) {
      added = T.per ? Math.round((e.amount || 1) / T.per * T.sec) : T.sec;
      if (e.type === 'bits' && e.amount < 100) added = 0;
      if (added) window.Z3.add(added);
    }
    evt.innerHTML = `<div class="ban" style="--c:${T.c}"><div class="rays"></div><div class="plate">
      <div class="kind">${T.icon} ${T.t}<span class="jp">${T.jp}</span></div>
      <div class="who">${esc(e.name)}</div>${amtTxt ? `<div class="amt">${esc(amtTxt)}</div>` : ''}
      ${added ? `<div class="plus">+${added >= 60 ? Math.round(added / 60) + ' MIN' : added + ' S'}</div>` : ''}</div></div>`;
    requestAnimationFrame(() => evt.firstChild.classList.add('go'));
    const fx = window.Z3fx;
    if (fx) { fx.burst(960, 420, 60); fx.burst(960, 420, 26, 'petal'); fx.flash(960, 420); fx.shake(); setTimeout(() => fx.burst(700, 380, 30), 300); setTimeout(() => fx.burst(1220, 460, 30), 500); }

    // widgets + fil d'alertes
    const set = (id, v) => { const el = document.getElementById(id); if (el) { el.textContent = v; const w = el.closest('.widget'); if (w) { w.classList.remove('ping'); void w.offsetWidth; w.classList.add('ping'); } } };
    if (e.type === 'follow') set('vFollow', e.name);
    if (e.type === 'achat') set('vBuyer', e.name);
    if (e.type === 'don' || e.type === 'achat' || e.type === 'bits') {
      tops[e.name] = (tops[e.name] || 0) + (e.type === 'bits' ? e.amount / 100 : e.amount);
      try { localStorage.setItem(TKEY, JSON.stringify(tops)); } catch (err) { /* stockage indisponible */ }
      const best = Object.entries(tops).sort((a, b) => b[1] - a[1])[0];
      if (best) set('vTop', best[0]);
    }
    const feed = zone && zone.querySelector('.feed');
    if (feed) {
      feed.insertAdjacentHTML('beforeend', `<div class="it" style="--c:${T.c}"><b>${T.t.split(' ').pop()}</b><span>${esc(e.name)}</span><i>${esc(amtTxt)}</i></div>`);
      while (feed.children.length > 5) feed.firstChild.remove();
    }
    setTimeout(play, 5200);
  }
  window.Z3 = Object.assign(window.Z3 || {}, { event });

  /* ---------------- tests & démo ---------------- */
  const NAMES = ['SachaDu93', 'Dracaufeu_Z', 'KaizokuKing', 'MewtwoMaster', 'Zoro_Senpai', 'PikaPika77', 'NamiDeals', 'Ectoplasma'];
  const pick = (a) => a[(Math.random() * a.length) | 0];
  const fake = (type) => event({ type, name: pick(NAMES), amount: type === 'don' ? pick([5, 10, 20, 50]) : type === 'achat' ? pick([24.9, 49.9, 159]) : type === 'raid' ? pick([12, 45, 120]) : type === 'sub' ? pick([1, 3, 12]) : type === 'bits' ? pick([100, 500]) : 0 });
  window.addEventListener('keydown', (k) => { const m = { 1: 'follow', 2: 'achat', 3: 'don', 4: 'sub', 5: 'raid' }[k.key]; if (m) fake(m); });
  if (Q.has('demoevents')) {
    const seq = ['follow', 'achat', 'don', 'sub', 'raid', 'follow', 'don', 'achat'];
    let i = 0; setTimeout(function loop() { fake(seq[i++ % seq.length]); setTimeout(loop, +(Q.get('demoevents') || 6000) || 6000); }, 1500);
  }

  /* ---------------- connecteurs ---------------- */
  function loadIO(cb) {
    if (window.io) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/socket.io-client@2.5.0/dist/socket.io.js';
    s.onload = cb; s.onerror = () => console.warn('[Z3] socket.io introuvable (pas de connexion ?)');
    document.head.appendChild(s);
  }
  const SE = { follower: 'follow', subscriber: 'sub', tip: 'don', cheer: 'bits', raid: 'raid', purchase: 'achat', merch: 'achat' };
  if (Q.get('se')) loadIO(() => {
    const sock = window.io('https://realtime.streamelements.com', { transports: ['websocket'] });
    sock.on('connect', () => sock.emit('authenticate', { method: 'jwt', token: Q.get('se') }));
    sock.on('authenticated', () => console.log('[Z3] StreamElements connecté'));
    sock.on('unauthorized', (e) => console.warn('[Z3] StreamElements : jeton refusé', e));
    const h = (ev) => { const d = (ev && ev.data) || {}; const t = SE[ev && ev.type]; if (t) event({ type: t, name: d.displayName || d.username || d.name, amount: d.amount }); };
    sock.on('event', h); sock.on('event:test', (ev) => h(ev.listener ? { type: ev.listener.replace('-latest', ''), data: ev.event } : ev));
  });
  const SL = { follow: 'follow', subscription: 'sub', resub: 'sub', donation: 'don', bits: 'bits', raid: 'raid' };
  if (Q.get('sl')) loadIO(() => {
    const sock = window.io('https://sockets.streamlabs.com?token=' + encodeURIComponent(Q.get('sl')), { transports: ['websocket'] });
    sock.on('connect', () => console.log('[Z3] Streamlabs connecté'));
    sock.on('event', (ev) => { const t = SL[ev && ev.type]; if (!t) return; (ev.message || []).forEach((m) => event({ type: t, name: m.name || m.from, amount: m.amount || m.months || m.raiders })); });
  });
})();
