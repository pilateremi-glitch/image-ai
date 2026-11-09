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
  document.body.insertAdjacentHTML('beforeend', '<div id="hit" class="layer"></div><div id="hitcount" class="layer-free">HITS DU LIVE <b id="hitn">0</b></div>');
  const box = document.getElementById('hit');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const emblem = window.Z3Art ? window.Z3Art.emblemSVG(200, 'emHit') : '';

  let hits = 0; try { hits = +(sessionStorage.getItem('z3f4-hits') || 0); } catch (e) { hits = 0; }
  function showCount() { const hc = document.getElementById('hitcount'); if (hits > 0) { hc.style.display = 'flex'; document.getElementById('hitn').textContent = hits; } }
  showCount();

  const queue = []; let busy = false;
  function hit(tier, name) {
    if (!TIERS[tier]) tier = 'ultra';
    queue.push({ tier, name: name ? String(name).slice(0, 28) : '' });
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
        <div class="face front"><div class="nm">${esc(h.name || (T.flop ? 'Commune' : 'Carte du live'))}</div>
          <div class="art"><b>${T.flop ? '…' : 'Z3'}</b></div>
          <div class="stars">${T.flop ? '●' : '★'.repeat(T.star)}</div>
          <div class="ft">TEAM Z3F4 × LE RAINTÉ DU TCG</div>${T.flop ? '' : '<div class="shine"></div>'}</div>
      </div></div>
      <div class="sub">${esc(h.name ? h.name.toUpperCase() + ' · ' + T.sub : T.sub)}</div>`;
    const fx = window.Z3fx;
    if (fx && !T.flop) {
      fx.shake(); fx.flash(960, 500);
      const pops = T.god ? 7 : T.star + 1;
      for (let i = 0; i < pops; i++) setTimeout(() => { fx.burst(360 + Math.random() * 1200, 200 + Math.random() * 600, Math.round(T.n / pops) + 20, '', T.cols); }, 700 + i * 380);
      setTimeout(() => fx.burst(960, 500, T.n, '', T.cols), 1500);
      if (T.god) for (let i = 0; i < 4; i++) setTimeout(() => { fx.shake(); fx.burst(960, 500, 60, 'petal'); }, 1500 + i * 900);
    }
    if (!T.flop) { hits++; try { sessionStorage.setItem('z3f4-hits', hits); } catch (e) { /* rien */ } showCount(); }
    const feed = document.querySelector('#alerts .zone .feed');
    if (feed) { feed.insertAdjacentHTML('beforeend', `<div class="it" style="--c:${T.c1}"><b>${T.flop ? 'FLOP' : 'HIT'}</b><span>${esc(h.name || T.t)}</span><i>${'★'.repeat(T.star)}</i></div>`); while (feed.children.length > 5) feed.firstChild.remove(); }
    setTimeout(() => { box.className = 'layer'; box.innerHTML = ''; play(); }, T.ms + 200);
  }

  window.Z3 = Object.assign(window.Z3 || {}, { hit });
  const KEYS = { 6: 'rare', 7: 'ultra', 8: 'secret', 9: 'god', 0: 'flop' };
  window.addEventListener('keydown', (e) => {
    const t = KEYS[e.key]; if (!t) return;
    const name = Q.has('hitname') && t !== 'flop' ? window.prompt('Nom de la carte ? (vide = aucun)') : '';
    hit(t, name);
  });
  if (Q.has('demohits')) {
    const seq = [['rare', 'Évoli'], ['ultra', 'Dracaufeu ex'], ['flop', ''], ['secret', 'Luffy Gear 5 Alt Art'], ['god', '']];
    seq.forEach(([t, n], i) => setTimeout(() => hit(t, n), 1200 + i * 200));
  }
})();
