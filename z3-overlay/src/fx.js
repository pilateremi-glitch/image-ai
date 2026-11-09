/* ==========================================================================
   Z3 LIVE — décors animés & interactifs
   ?fx               pétales, étincelles, éclairs, réactions aux niveaux
   ?scene=mix        fonds qui alternent (toutes les images de preview/fond-*)
   ?scene=<fichier>  un seul fond animé (Ken Burns + parallaxe)
   ?slide=7          durée d'un fond en secondes (mode mix)
   Interactif (OBS › Interagir) : souris = parallaxe + les pétales s'écartent,
   clic = explosion d'énergie, B = fond suivant, F = décors on/off.
   ========================================================================== */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const scene = Q.get('scene');

  /* ---------------- thèmes de couleur (rotation de teinte de l'interface) ---------------- */
  const THEMES = { violet: 0, rouge: 45, cyan: -130, rose: 18, or: 92 };
  const THEME_OF = { 'fond-1': 'rouge', 'fond-2': 'violet', 'fond-3': 'cyan', 'fond-4': 'rose', 'fond-5': 'or' };
  const themeCss = document.createElement('style');
  themeCss.textContent = `body{--hue:0deg}.layer:not(#sandwich):not(#drink):not(#decor):not(#evt){filter:hue-rotate(var(--hue));transition:filter 1.2s ease}#decor{filter:hue-rotate(var(--hue))}`;
  document.head.appendChild(themeCss);
  function setTheme(t) {
    if (!(t in THEMES)) return;
    document.body.style.setProperty('--hue', THEMES[t] + 'deg');
    document.body.dataset.theme = t;
  }
  const themeParam = Q.get('theme') || (scene === 'mix' ? 'auto' : scene ? 'auto' : 'violet');
  const autoTheme = themeParam === 'auto';
  if (!autoTheme) setTheme(themeParam);
  window.Z3theme = setTheme;
  if (!Q.has('fx') && !scene) return;
  const STATIC = Q.has('static');
  const W = 1920, H = 1080;
  const FONDS = ['fond-2-z3-violet.png', 'fond-1-z3-rouge.png', 'fond-3-z3-ruelle.png', 'fond-4-z3-sakura.png', 'fond-5-team-z3f4.jpg'];
  const url = (f) => new URL('preview/' + f, location.href).href;
  const rnd = (a, b) => a + Math.random() * (b - a);

  const css = document.createElement('style');
  css.textContent = `
  #scene{position:absolute;inset:0;z-index:0;overflow:hidden;background:#0b0214}
  #scene .sl{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease}
  #scene .sl.on{opacity:1}
  #scene .sl.wipe{animation:wipe 1s cubic-bezier(.7,0,.2,1) forwards}
  @keyframes wipe{from{clip-path:polygon(0 0,0 0,-30% 100%,-30% 100%)}to{clip-path:polygon(0 0,130% 0,100% 100%,-30% 100%)}}
  #scene .bl{position:absolute;inset:-80px;background:center/cover no-repeat;filter:blur(30px) brightness(.5) saturate(1.4)}
  #scene .mn{position:absolute;inset:0;background:center/contain no-repeat;transform-origin:50% 40%;will-change:transform}
  #scene .sl.on .mn{animation:kb var(--d,7s) ease-in-out forwards}
  @keyframes kb{from{transform:scale(1.02) translate(0,0)}to{transform:scale(1.14) translate(0,-18px)}}
  #scene .tint{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 35%,rgba(20,2,40,.75) 100%),linear-gradient(180deg,rgba(80,10,140,.18),rgba(255,40,200,.08));mix-blend-mode:normal}
  #scene .flashline{position:absolute;top:-20%;bottom:-20%;width:26px;background:linear-gradient(90deg,transparent,#fff,#ff7be6,transparent);filter:blur(2px);opacity:0;transform:skewX(-17deg)}
  #scene .flashline.go{animation:sweep 1s cubic-bezier(.7,0,.2,1) forwards}
  @keyframes sweep{0%{left:-10%;opacity:1}100%{left:115%;opacity:.2}}
  #fxc{position:absolute;inset:0;pointer-events:none}
  #flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at var(--fx,50%) var(--fy,90%),rgba(255,255,255,.75),rgba(255,63,208,.35) 25%,transparent 60%);opacity:0}
  #flash.go{animation:fl .6s ease-out}
  @keyframes fl{0%{opacity:1}100%{opacity:0}}
  body.shake .layer:not(#decor){animation:shk .45s linear}
  @keyframes shk{0%,100%{transform:none}15%{transform:translate(-9px,4px) rotate(-.3deg)}30%{transform:translate(8px,-5px)}45%{transform:translate(-6px,3px)}60%{transform:translate(5px,-2px)}80%{transform:translate(-2px,1px)}}
  #redv{position:absolute;inset:0;pointer-events:none;opacity:0;box-shadow:inset 0 0 220px 40px rgba(255,30,90,.65)}
  body.urgent #redv{animation:rv 1s ease-in-out infinite}
  @keyframes rv{50%{opacity:1}}
  `;
  document.head.appendChild(css);

  /* ---------------- fonds ---------------- */
  let slides = [], cur = -1, mouseX = 0.5, mouseY = 0.5;
  if (scene) {
    const list = scene === 'mix' ? FONDS : [scene];
    const sc = document.createElement('div'); sc.id = 'scene';
    const dur = parseFloat(Q.get('slide') || '7');
    sc.style.setProperty('--d', dur + 1.5 + 's');
    list.forEach((f) => {
      const s = document.createElement('div'); s.className = 'sl'; s.dataset.f = f;
      s.innerHTML = `<div class="bl" style="background-image:url('${url(f)}')"></div><div class="mn" style="background-image:url('${url(f)}')"></div>`;
      sc.appendChild(s); slides.push(s);
    });
    sc.insertAdjacentHTML('beforeend', '<div class="tint"></div><div class="flashline"></div>');
    document.body.prepend(sc);
    window.Z3bg = next;
    next();
    if (!STATIC && list.length > 1) setInterval(next, dur * 1000);
  }
  function next() {
    if (!slides.length) return;
    const prev = slides[cur];
    cur = (cur + 1) % slides.length;
    const s = slides[cur];
    if (autoTheme) setTheme(THEME_OF[(s.dataset.f || '').slice(0, 6)] || 'violet');
    s.classList.remove('on', 'wipe'); void s.offsetWidth;
    s.style.zIndex = 2; if (prev) prev.style.zIndex = 1;
    s.classList.add('on'); if (prev) { s.classList.add('wipe'); const fl = document.querySelector('#scene .flashline'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); burst(rnd(300, 1600), rnd(200, 800), 30, 'petal'); }
    if (prev) setTimeout(() => { prev.classList.remove('on', 'wipe'); }, 1300);
  }

  /* ---------------- canvas FX ---------------- */
  const cv = document.createElement('canvas'); cv.id = 'fxc'; cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const sc = document.getElementById('scene');
  if (sc) sc.after(cv); else document.body.prepend(cv);
  document.body.insertAdjacentHTML('beforeend', '<div id="flash"></div><div id="redv"></div>');
  let enabled = true;

  const P = [];   // particules
  function petal(x, y, vx, vy) {
    return { k: 'petal', x, y, vx: vx ?? rnd(-0.6, 0.3), vy: vy ?? rnd(0.5, 1.4), r: rnd(6, 13), a: rnd(0, 6.28), va: rnd(-0.04, 0.04), f: rnd(0, 6.28), vf: rnd(0.03, 0.08), life: 1e9, c: Math.random() < .7 ? '#ff9be8' : '#ffd6f5' };
  }
  function spark(x, y, vx, vy, c) {
    return { k: 'spark', x, y, vx, vy, r: rnd(1.2, 3.2), life: rnd(40, 90), max: 90, c: c || (Math.random() < .5 ? '#ff3fd0' : Math.random() < .5 ? '#ffffff' : '#b44dff') };
  }
  function crumb(x, y) {
    const cs = ['#f2a93b', '#ffd98a', '#58c43c', '#ff3348', '#ffd23a', '#ff9bb0'];
    return { k: 'crumb', x, y, vx: rnd(-5, 5), vy: rnd(-9, -3), r: rnd(2, 5), a: rnd(0, 6), life: 120, max: 120, c: cs[(Math.random() * cs.length) | 0] };
  }
  for (let i = 0; i < 46; i++) P.push(petal(rnd(0, W), rnd(-H, H)));
  for (let i = 0; i < 40; i++) P.push({ k: 'mote', x: rnd(0, W), y: rnd(0, H), vy: rnd(-0.6, -0.15), r: rnd(0.8, 2.4), t: rnd(0, 6.28), life: 1e9, c: Math.random() < .5 ? '#ff7be6' : '#ffffff' });

  const rings = [];
  function burst(x, y, n, kind) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), v = rnd(2, 9);
      if (kind === 'petal') { const p = petal(x, y, Math.cos(a) * v * .6, Math.sin(a) * v * .6); p.life = 260; p.max = 260; P.push(p); }
      else P.push(spark(x, y, Math.cos(a) * v, Math.sin(a) * v));
    }
    rings.push({ x, y, r: 10, life: 30 });
  }
  function flash(x, y) {
    const f = document.getElementById('flash');
    f.style.setProperty('--fx', (x / W * 100) + '%'); f.style.setProperty('--fy', (y / H * 100) + '%');
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  }

  let bolt = null, nextBolt = 120;
  function makeBolt() {
    const left = Math.random() < .5;
    const x0 = left ? rnd(10, 330) : rnd(1450, 1900), pts = [[x0, 0]];
    let x = x0, y = 0;
    while (y < H * rnd(.35, .7)) { y += rnd(30, 70); x += rnd(-40, 40); pts.push([x, y]); }
    return { pts, life: 14 };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!enabled) return requestAnimationFrame(draw);
    const mx = mouseX * W, my = mouseY * H;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      if (p.k === 'petal') {
        p.f += p.vf; p.a += p.va;
        p.x += p.vx + Math.sin(p.f) * 0.8 + 0.25; p.y += p.vy;
        if (p.life < 1e8) { p.vx *= .97; p.vy = p.vy * .97 + .03; p.life--; }
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (hasMouse && d < 170) { p.x += dx / d * (170 - d) * .08; p.y += dy / d * (170 - d) * .08; }
        if (p.life <= 0) { P.splice(i, 1); continue; }
        if (p.y > H + 20 || p.x > W + 30 || p.x < -30) { if (p.life < 1e8) { P.splice(i, 1); continue; } p.y = -20; p.x = rnd(-100, W); }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, Math.abs(Math.cos(p.f)) * .8 + .2);
        ctx.globalAlpha = p.life < 1e8 ? Math.min(1, p.life / 60) * .95 : .8;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.bezierCurveTo(p.r * .8, -p.r * .7, p.r * .9, p.r * .2, 0, p.r); ctx.bezierCurveTo(-p.r * .9, p.r * .2, -p.r * .8, -p.r * .7, 0, -p.r); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-.6, -p.r * .8, 1.2, p.r * .6);
        ctx.restore();
      } else if (p.k === 'mote') {
        p.t += .03; p.y += p.vy; p.x += Math.sin(p.t) * .3;
        if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
        ctx.globalAlpha = .35 + Math.sin(p.t * 2) * .3; ctx.fillStyle = p.c;
        ctx.shadowColor = p.c; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
      } else {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.k === 'spark') { p.vx *= .95; p.vy = p.vy * .95 + .05; } else { p.vy += .35; p.a += .2; if (p.y > 1062) { p.y = 1062; p.vy *= -.35; p.vx *= .7; } }
        if (p.life <= 0) { P.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, p.life / 30); ctx.fillStyle = p.c;
        if (p.k === 'spark') { ctx.shadowColor = p.c; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0; }
        else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .8); ctx.restore(); }
      }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.r += 14; r.life--;
      if (r.life <= 0) { rings.splice(i, 1); continue; }
      ctx.globalAlpha = r.life / 30; ctx.strokeStyle = '#ff7be6'; ctx.lineWidth = 4; ctx.shadowColor = '#ff3fd0'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.28); ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (--nextBolt <= 0) { bolt = makeBolt(); nextBolt = rnd(160, 420); }
    if (bolt) {
      ctx.globalAlpha = bolt.life / 14 * (bolt.life % 4 < 2 ? 1 : .4);
      ctx.lineJoin = 'round';
      [[10, '#b44dff', 25], [4, '#ff3fd0', 12], [1.6, '#ffffff', 0]].forEach(([w, c, b]) => {
        ctx.strokeStyle = c; ctx.lineWidth = w; ctx.shadowColor = c; ctx.shadowBlur = b;
        ctx.beginPath(); bolt.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      });
      ctx.shadowBlur = 0;
      if (--bolt.life <= 0) bolt = null;
    }
    ctx.globalAlpha = 1;
    if (sc) slides.forEach((s) => { s.firstChild.style.transform = `translate(${(mouseX - .5) * -30}px,${(mouseY - .5) * -20}px)`; s.lastChild.style.translate = `${(mouseX - .5) * 26}px ${(mouseY - .5) * 16}px`; });
    requestAnimationFrame(draw);
  }

  /* ---------------- interactions ---------------- */
  let hasMouse = false;
  window.addEventListener('mousemove', (e) => { hasMouse = true; mouseX = e.clientX / W; mouseY = e.clientY / H; if (Math.random() < .25) P.push(spark(e.clientX, e.clientY, rnd(-1, 1), rnd(-2, 0))); });
  window.addEventListener('mousedown', (e) => { burst(e.clientX, e.clientY, 40); burst(e.clientX, e.clientY, 12, 'petal'); flash(e.clientX, e.clientY); });
  window.addEventListener('keydown', (e) => { if (e.key === 'b' || e.key === 'B') next(); if (e.key === 'f' || e.key === 'F') enabled = !enabled; });
  window.addEventListener('z3level', (e) => {
    const { x, y } = e.detail;
    for (let i = 0; i < 26; i++) P.push(crumb(x, y));
    burst(x, y - 20, 22); flash(x, y);
    document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
  });

  window.Z3fx = { burst, flash, next, shake: () => { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); } };
  requestAnimationFrame(draw);
})();
