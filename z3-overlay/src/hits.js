/* ==========================================================================
   Z3 LIVE — alertes spéciales TCG pendant les ouvertures
   Touches (Interagir) : 6 RARE · 7 HIT · 8 SECRÈTE · 9 GOD PACK · 0 FLOP
   Script : Z3.hit('ultra', 'Dracaufeu ex')
   ?hitname=1  demande le nom de la carte avant l'alerte (fenêtre de saisie)
   ========================================================================== */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.has('static')) return;

  const TIERS = {
    rare:   { t: 'CARTE RARE !', jp: 'レア', sub: 'ÇA COMMENCE À CHAUFFER', c1: '#7bd0ff', c2: '#e6f6ff', cols: ['#7bd0ff', '#ffffff', '#b44dff'], ms: 4200, n: 60, star: 1 },
    ultra:  { t: 'HIT !!', jp: '当たり', sub: 'GROS TIRAGE EN DIRECT', c1: '#ffd23a', c2: '#fff4b0', cols: ['#ffd23a', '#ffffff', '#ff9a2f'], ms: 4800, n: 110, star: 2 },
    secret: { t: 'SECRÈTE !!!', jp: 'シークレット', sub: 'CARTE SECRÈTE · ALT ART', c1: '#ff3fd0', c2: '#9bfff0', cols: ['#ff3fd0', '#7bffea', '#ffd23a', '#b44dff', '#ffffff'], ms: 5600, n: 160, star: 3, rainbow: 1 },
    god:    { t: 'GOD PACK !!!!', jp: '神引き', sub: 'LE CHAT EST EN FEU', c1: '#ffd23a', c2: '#ff3fd0', cols: ['#ffd23a', '#ff3fd0', '#7bffea', '#ffffff', '#b44dff'], ms: 7000, n: 240, star: 5, rainbow: 1, god: 1 },
    flop:   { t: 'FLOP…', jp: '爆死', sub: 'QUE DES COMMUNES… LE PROCHAIN SERA LE BON', c1: '#9aa3b5', c2: '#d7dbe5', cols: ['#9aa3b5', '#6f7a90'], ms: 4200, n: 0, star: 0, flop: 1 },
  };

  const css = document.createElement('style');
  css.textContent = `
  #hit{position:absolute;inset:0;pointer-events:none;display:none;z-index:50}
  #hit.on{display:block}
  #hit .dim{position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(0,0,0,.15),rgba(6,0,14,.82) 70%);animation:hdim var(--ms) ease forwards}
  @keyframes hdim{0%{opacity:0}8%{opacity:1}85%{opacity:1}100%{opacity:0}}
  #hit .speed{position:absolute;left:50%;top:52%;width:2600px;height:2600px;margin:-1300px 0 0 -1300px;
    background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.0) 0 1.4deg,var(--c1) 1.6deg 2deg,rgba(255,255,255,0) 2.2deg 5deg);
    -webkit-mask:radial-gradient(circle,transparent 16%,#000 40%);mask:radial-gradient(circle,transparent 16%,#000 40%);opacity:.55;animation:hspin 1.2s linear infinite, hdim var(--ms) ease forwards}
  #hit.flop .speed{display:none}
  @keyframes hspin{to{transform:rotate(18deg)}}
  #hit .glow{position:absolute;left:50%;top:52%;width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;
    background:radial-gradient(circle,var(--c2) 0,var(--c1) 18%,transparent 62%);opacity:.0;animation:hglow var(--ms) ease forwards}
  @keyframes hglow{0%{opacity:0;transform:scale(.3)}12%{opacity:.9;transform:scale(1.1)}80%{opacity:.6;transform:scale(1)}100%{opacity:0}}
  #hit .card{position:absolute;left:50%;top:52%;width:300px;height:420px;margin:-210px 0 0 -150px;perspective:1400px}
  #hit .inner{position:absolute;inset:0;transform-style:preserve-3d;animation:hflip var(--ms) cubic-bezier(.2,1.2,.3,1) forwards}
  @keyframes hflip{0%{transform:translateY(500px) rotateY(180deg) scale(.4)}22%{transform:translateY(0) rotateY(180deg) scale(1)}40%{transform:rotateY(0) scale(1.08)}48%{transform:rotateY(0) scale(1)}100%{transform:rotateY(0) scale(1.25)}}
  #hit .card{animation:hcard var(--ms) ease forwards}
  @keyframes hcard{0%,86%{opacity:1}100%{opacity:0}}
  #hit.flop .inner{animation-name:hflipflop}
  @keyframes hflipflop{0%{transform:translateY(500px) rotateY(180deg) scale(.4)}22%{transform:rotateY(180deg)}40%{transform:rotateY(0)}70%{transform:rotateY(0) rotateZ(0)}86%{transform:translateY(40px) rotateZ(-14deg)}100%{transform:translateY(400px) rotateZ(-40deg)}}
  #hit .face{position:absolute;inset:0;border-radius:18px;backface-visibility:hidden;overflow:hidden;box-shadow:0 0 0 6px #fff,0 0 40px var(--c1),0 0 90px var(--c1)}
  #hit .back{transform:rotateY(180deg);background:radial-gradient(circle at 50% 50%,#3a0c66,#12031f 70%);display:grid;place-items:center}
  #hit .front{background:linear-gradient(160deg,var(--c2),var(--c1) 45%,#2a0748 100%)}
  #hit.rainbow .front{background:linear-gradient(125deg,#ff3fd0,#ffd23a,#7bffea,#7b9bff,#ff3fd0);background-size:300% 300%;animation:holo 1.6s linear infinite}
  @keyframes holo{to{background-position:300% 0}}
  #hit.flop .front{background:linear-gradient(160deg,#d7dbe5,#8a92a6 60%,#4a5163);filter:grayscale(1)}
  #hit .front .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}
  #hit .front .tag{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:8px 10px;background:linear-gradient(transparent,rgba(10,2,20,.92));font-family:Rajdhani;font-weight:700;font-size:20px;color:#fff;text-align:center;letter-spacing:1px}
  #hit .front .shine{z-index:3}
  #hit .front .art{position:absolute;left:18px;right:18px;top:54px;height:200px;border-radius:8px;background:rgba(18,3,31,.65);display:grid;place-items:center;overflow:hidden}
  #hit .front .art b{font-family:Bangers;font-size:110px;color:#fff;letter-spacing:2px;text-shadow:0 0 20px var(--c1),0 5px 0 #3a0a66}
  #hit .front .nm{position:absolute;left:18px;right:18px;top:16px;font-family:Rajdhani;font-weight:700;font-size:22px;letter-spacing:2px;color:#12031f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #hit .front .stars{position:absolute;left:0;right:0;top:270px;text-align:center;font-size:34px;letter-spacing:6px;color:#fff;text-shadow:0 0 10px var(--c1),0 2px 0 #3a0a66}
  #hit .front .ft{position:absolute;left:10px;right:10px;bottom:20px;font-family:Rajdhani;font-weight:700;font-size:14px;letter-spacing:2px;white-space:nowrap;color:#12031f;text-align:center}
  #hit .front .shine{position:absolute;inset:-40%;background:linear-gradient(110deg,transparent 40%,rgba(255,255,255,.85) 50%,transparent 60%);animation:hshine 1.4s ease-in-out .9s infinite}
  @keyframes hshine{from{transform:translateX(-60%)}to{transform:translateX(60%)}}
  #hit .ttl{position:absolute;left:0;right:0;top:56px;text-align:center;font-family:Bangers;font-size:170px;line-height:1;letter-spacing:6px;color:#fff;
    -webkit-text-stroke:4px var(--c1);text-shadow:0 0 30px var(--c1),0 0 70px var(--c1),0 8px 0 #3a0a66;animation:httl var(--ms) cubic-bezier(.2,1.6,.4,1) forwards}
  #hit.god .ttl{font-size:200px}
  @keyframes httl{0%{opacity:0;transform:scale(3) rotate(-10deg)}10%{opacity:1;transform:scale(.9) rotate(-5deg)}16%{transform:scale(1.05) rotate(-5deg)}86%{opacity:1;transform:scale(1) rotate(-5deg)}100%{opacity:0;transform:scale(1.3) rotate(-5deg)}}
  #hit.flop .ttl{animation-name:hflopttl;-webkit-text-stroke:3px #6f7a90;text-shadow:0 6px 0 #2a2f3a}
  @keyframes hflopttl{0%{opacity:0;transform:translateY(-200px)}12%{opacity:1;transform:translateY(0)}50%{transform:translateY(0) rotate(0)}70%{transform:translateY(20px) rotate(6deg)}86%{opacity:1}100%{opacity:0;transform:translateY(60px) rotate(9deg)}}
  #hit .jp{position:absolute;left:0;right:0;top:250px;text-align:center;font-family:NotoJP;font-weight:900;font-size:44px;letter-spacing:22px;color:var(--c2);text-shadow:0 0 18px var(--c1);animation:hdim var(--ms) ease forwards}
  #hit .sub{position:absolute;left:0;right:0;top:786px;text-align:center;font-family:Rajdhani;font-weight:700;font-size:38px;letter-spacing:10px;color:#fff;text-shadow:0 0 14px var(--c1);animation:hdim var(--ms) ease forwards}
  #hit .rain{position:absolute;inset:0;overflow:hidden}
  #hit .rain i{position:absolute;top:-60px;width:3px;height:60px;background:linear-gradient(transparent,#b9c3d8);opacity:.7;animation:hrain .7s linear infinite}
  @keyframes hrain{to{transform:translateY(1200px)}}
  #hitcount{position:absolute;left:378px;top:842px;display:none;align-items:center;gap:8px;padding:4px 12px;font-family:Rajdhani;font-weight:700;font-size:18px;letter-spacing:3px;
    background:rgba(16,4,32,.8);border:1.5px solid #ffd23a;color:#fff;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
  #hitcount b{font-family:Orbitron;font-weight:900;color:#ffd23a}
  `;
  document.head.appendChild(css);
  /* carte affichée À LA PLACE de la caméra pendant un hit : ?cam=x,y,largeur,hauteur (px, canevas 1920×1080) */
  const CAM = (Q.get('cam') || (Q.has('hitonly') ? '1456,112,436,247' : '')).split(',').map(Number);
  const camOn = CAM.length === 4 && CAM.every((v) => !isNaN(v)) && !Q.has('nocam');
  const centerOn = !Q.has('camonly');
  const CAM_TIERS = (Q.get('camtiers') || 'ultra,secret,god').split(',');   // la carte ne s'affiche sur la cam que pour ces niveaux
  const css2 = document.createElement('style');
  css2.textContent = `
  #hit .camwrap{position:absolute;animation:camout var(--ms) linear forwards}
  #hit .camcov{position:absolute;inset:0;overflow:hidden;background:#0b0214;border-radius:10px;opacity:0;animation:camin .5s ease var(--trace) forwards}
  #hit .camframe{position:absolute;inset:-9px;width:calc(100% + 18px);height:calc(100% + 18px);overflow:visible;pointer-events:none}
  #hit .camframe rect{fill:none;stroke:var(--c1);stroke-width:7;stroke-linecap:round;stroke-dasharray:1000;stroke-dashoffset:1000;filter:drop-shadow(0 0 8px var(--c1)) drop-shadow(0 0 18px var(--c1));animation:trace var(--trace) linear forwards}
  #hit .camframe rect.w{stroke:#fff;stroke-width:2.5;filter:none}
  @keyframes trace{to{stroke-dashoffset:0}}
  #hit .pball{position:absolute;left:0;top:0;width:var(--pb);height:var(--pb);margin:calc(var(--pb) / -2) 0 0 calc(var(--pb) / -2);offset-rotate:0deg;
    offset-path:var(--op);offset-distance:0%;animation:roll var(--trace) linear forwards, pbout .35s ease var(--trace) forwards;z-index:3;filter:drop-shadow(0 0 10px var(--c1))}
  #hit .pball svg{width:100%;height:100%;display:block;animation:spin calc(var(--trace) / 4) linear infinite}
  @keyframes roll{to{offset-distance:100%}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pbout{to{transform:scale(1.8);opacity:0}}
  @keyframes camout{0%,93%{opacity:1}100%{opacity:0}}
  #hit .camcov .bgb{position:absolute;inset:-30px;background:center/cover no-repeat;filter:blur(22px) brightness(.55) saturate(1.4)}
  #hit .camcov img.cc{position:absolute;inset:6% 0 14%;margin:auto;height:80%;max-width:94%;object-fit:contain;filter:drop-shadow(0 0 18px var(--c1));animation:camcard 1.6s ease-in-out infinite alternate}
  #hit .camcov .ct{position:absolute;left:0;right:0;top:4px;text-align:center;font-family:Bangers;font-size:var(--fs,40px);letter-spacing:2px;color:#fff;-webkit-text-stroke:2px var(--c1);text-shadow:0 0 14px var(--c1)}
  #hit .camcov .cn{position:absolute;left:0;right:0;bottom:6px;text-align:center;font-family:Rajdhani;font-weight:700;font-size:calc(var(--fs,40px) * .5);color:#fff;text-shadow:0 0 10px var(--c1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px}
  #hit .camcov .z3{position:absolute;inset:0;display:grid;place-items:center;font-family:Bangers;font-size:calc(var(--fs,40px) * 2.4);color:#fff;text-shadow:0 0 30px var(--c1)}
  @keyframes camin{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
  @keyframes camcard{from{transform:scale(1) rotate(-1deg)}to{transform:scale(1.05) rotate(1deg)}}
  body.camonly #hit .dim, body.camonly #hit .speed, body.camonly #hit .glow, body.camonly #hit .ttl, body.camonly #hit .jp, body.camonly #hit .card, body.camonly #hit .sub{display:none}`;
  document.head.appendChild(css2);
  if (!centerOn) document.body.classList.add('camonly');
  document.body.insertAdjacentHTML('beforeend', '<div id="hit" class="layer"></div><div id="hitcount" class="layer-free">HITS DU LIVE <b id="hitn">0</b></div>');
  const box = document.getElementById('hit');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const emblem = window.Z3Art ? window.Z3Art.emblemSVG(200, 'emHit') : '';

  let hits = 0; try { hits = +(sessionStorage.getItem('z3f4-hits') || 0); } catch (e) { hits = 0; }
  function showCount() { const hc = document.getElementById('hitcount'); if (hits > 0) { hc.style.display = 'flex'; document.getElementById('hitn').textContent = hits; } }
  showCount();

  const queue = []; let busy = false;
  /* ---------- récap du live (lu par la scène « Merci » : scenes.html?mode=end) ---------- */
  const RKEY = 'z3-recap-v1';
  const recap = {
    load() { try { return JSON.parse(localStorage.getItem(RKEY) || 'null') || this.fresh(); } catch (e) { return this.fresh(); } },
    fresh() { return { start: Date.now(), hits: [], flops: 0, cards: 0, newCards: 0, seen: {}, rarities: {}, items: {}, boosters: 0 }; },
    save(r) { if (Q.has('hitonly')) return;   // l'overlay « hits seulement » n'écrit pas le récap (évite le double comptage)
      try { localStorage.setItem(RKEY, JSON.stringify(r)); } catch (e) { /* stockage plein : on garde la session */ } },
  };
  if (Q.has('reset') || Q.has('newlive')) recap.save(recap.fresh());
  function card(m) {                             // carte identifiée par le détecteur (commune ou non)
    const r = recap.load(); r.cards++;
    if (m.newCard) r.newCards++;
    if (m.key) r.seen[m.key] = (r.seen[m.key] || 0) + 1;
    r.rarities = r.rarities || {}; const rk = m.rarete || 'Common'; r.rarities[rk] = (r.rarities[rk] || 0) + 1;
    recap.save(r);
  }

  function hit(tier, name, opts) {
    if (!TIERS[tier]) tier = 'ultra';
    opts = opts || {};
    queue.push({ tier, name: name ? String(name).slice(0, 34) : '', img: opts.img || '', snap: opts.snap || '', key: opts.key || '', by: opts.by || '' });
    if (!busy) play();
  }
  function play() {
    const h = queue.shift(); if (!h) { busy = false; return; }
    busy = true;
    const T = TIERS[h.tier];
    box.className = 'layer on ' + h.tier + (T.rainbow ? ' rainbow' : '') + (T.god ? ' god' : '') + (T.flop ? ' flop' : '');
    box.style.cssText = `--c1:${T.c1};--c2:${T.c2};--ms:${T.ms}ms`;
    let rain = '';
    if (T.flop) for (let i = 0; i < 70; i++) rain += `<i style="left:${(Math.random() * 100).toFixed(1)}%;animation-delay:${(Math.random() * .7).toFixed(2)}s"></i>`;
    box.innerHTML = `<div class="dim"></div>${T.flop ? `<div class="rain">${rain}</div>` : '<div class="speed"></div>'}<div class="glow"></div>
      <div class="ttl">${T.t}</div><div class="jp">${T.jp}</div>
      <div class="card"><div class="inner">
        <div class="face back">${emblem}</div>
        <div class="face front">${h.img || h.snap ? `<img class="photo" src="${esc(h.img || h.snap)}" data-alt="${esc(h.img ? h.snap : '')}"><div class="tag">${esc(h.name)}</div>` : ''}<div class="nm">${esc(h.name || (T.flop ? 'Commune' : 'Carte du live'))}</div>
          <div class="art"><b>${T.flop ? '…' : 'Z3'}</b></div>
          <div class="stars">${T.flop ? '●' : '★'.repeat(T.star)}</div>
          <div class="ft">TEAM Z3F4 × LE RAINTÉ DU TCG</div>${T.flop ? '' : '<div class="shine"></div>'}</div>
      </div></div>
      <div class="sub">${esc((h.name ? h.name.toUpperCase() + ' · ' : '') + (h.by ? 'BOOSTER DE @' + h.by.toUpperCase() : T.sub))}</div>`;
    const fx = window.Z3fx;
    if (fx && !T.flop) {
      fx.shake(); fx.flash(960, 500);
      const pops = T.god ? 7 : T.star + 1;
      for (let i = 0; i < pops; i++) setTimeout(() => { fx.burst(360 + Math.random() * 1200, 200 + Math.random() * 600, Math.round(T.n / pops) + 20, '', T.cols); }, 700 + i * 380);
      setTimeout(() => fx.burst(960, 500, T.n, '', T.cols), 1500);
      if (T.god) for (let i = 0; i < 4; i++) setTimeout(() => { fx.shake(); fx.burst(960, 500, 60, 'petal'); }, 1500 + i * 900);
    }
    if (camOn && CAM_TIERS.includes(h.tier)) {
      const [cx, cy, cw, ch] = CAM, src = h.img || h.snap, trace = 1.6;
      // cadre tracé par une Poké Ball qui roule sur le contour, puis la carte apparaît
      const wrap = document.createElement('div'); wrap.className = 'camwrap';
      const pb = Math.max(34, Math.round(Math.min(cw, ch) / 7)), W2 = cw + 18, H2 = ch + 18, r = 14;
      const route = `M ${r} 0 H ${W2 - r} Q ${W2} 0 ${W2} ${r} V ${H2 - r} Q ${W2} ${H2} ${W2 - r} ${H2} H ${r} Q 0 ${H2} 0 ${H2 - r} V ${r} Q 0 0 ${r} 0 Z`;
      wrap.style.cssText = `left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;--trace:${trace}s;--pb:${pb}px`;
      wrap.innerHTML = `<svg class="camframe" viewBox="0 0 ${W2} ${H2}"><rect x="0" y="0" width="${W2}" height="${H2}" rx="${r}" pathLength="1000"/><rect class="w" x="0" y="0" width="${W2}" height="${H2}" rx="${r}" pathLength="1000"/></svg>
        <div class="pball" style="--op:path('${route}');left:-9px;top:-9px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#fff" stroke="#111" stroke-width="6"/>
        <path d="M3 50 A47 47 0 0 1 97 50 Z" fill="#e3242b" stroke="#111" stroke-width="6"/><rect x="3" y="46" width="94" height="8" fill="#111"/>
        <circle cx="50" cy="50" r="14" fill="#fff" stroke="#111" stroke-width="7"/><circle cx="50" cy="50" r="6" fill="#fff" stroke="#bbb" stroke-width="2"/>
        <path d="M20 30 Q28 16 44 12" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/></svg></div>`;
      const cc = document.createElement('div'); cc.className = 'camcov';
      cc.style.cssText = `--fs:${Math.max(22, Math.round(Math.min(cw, ch * 1.6) / 9))}px`;
      cc.innerHTML = src ? `<div class="bgb" style="background-image:url('${esc(src)}')"></div><img class="cc" src="${esc(src)}" data-alt="${esc(h.img ? h.snap : '')}">` : `<div class="z3">Z3</div>`;
      cc.insertAdjacentHTML('beforeend', `<div class="ct">${esc(T.t)}</div><div class="cn">${esc(h.name || '')}</div>`);
      const ci = cc.querySelector('img.cc');
      if (ci) ci.onerror = () => { if (ci.dataset.alt) { ci.src = ci.dataset.alt; cc.querySelector('.bgb').style.backgroundImage = `url('${ci.dataset.alt}')`; ci.dataset.alt = ''; } else { ci.remove(); } };
      wrap.prepend(cc); box.appendChild(wrap);
    }
    const ph = box.querySelector('.photo');                 // image officielle → sinon photo caméra → sinon carte Z3
    if (ph) ph.onerror = () => { if (ph.dataset.alt) { ph.src = ph.dataset.alt; ph.dataset.alt = ''; } else { ph.remove(); const tg = box.querySelector('.tag'); if (tg) tg.remove(); } };
    if (!T.flop) { hits++; try { sessionStorage.setItem('z3f4-hits', hits); } catch (e) { /* rien */ } showCount(); }
    { const r = recap.load(); if (T.flop) r.flops++; else { r.hits.push({ tier: h.tier, name: h.name, img: h.img, snap: h.snap, key: h.key, by: h.by, t: Date.now() }); if (r.hits.length > 40) r.hits.shift(); } recap.save(r); }
    const feed = document.querySelector('#alerts .zone .feed');
    if (feed) { feed.insertAdjacentHTML('beforeend', `<div class="it" style="--c:${T.c1}"><b>${T.flop ? 'FLOP' : 'HIT'}</b><span>${esc(h.name || T.t)}</span><i>${'★'.repeat(T.star)}</i></div>`); while (feed.children.length > 4) feed.firstChild.remove(); }
    setTimeout(() => { box.className = 'layer'; box.innerHTML = ''; play(); }, T.ms + 200);
  }

  window.Z3 = Object.assign(window.Z3 || {}, { hit, card, recap: () => recap.load(), saveRecap: (r) => recap.save(r) });
  const KEYS = { 6: 'rare', 7: 'ultra', 8: 'secret', 9: 'god', 0: 'flop' };
  window.addEventListener('keydown', (e) => {
    const t = KEYS[e.key]; if (!t) return;
    const name = Q.has('hitname') && t !== 'flop' ? window.prompt('Nom de la carte ? (vide = aucun)') : '';
    (window.Z3.hit || hit)(t, name);
  });
  if (Q.has('demohits')) {
    const seq = [['rare', 'Évoli'], ['ultra', 'Dracaufeu ex'], ['flop', ''], ['secret', 'Luffy Gear 5 Alt Art'], ['god', '']];
    seq.forEach(([t, n], i) => setTimeout(() => (window.Z3.hit || hit)(t, n), 1200 + i * 200));
  }
})();
