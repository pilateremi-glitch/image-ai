/* ==========================================================================
   Z3 LIVE — TEAM Z3F4 × LA MAISON DU TCG — overlay OBS
   - Mode LIVE (source navigateur OBS) : chrono + sandwich + boisson automatiques
   - Mode STATIC (?static=1) : utilisé par render.js pour exporter les PNG
   ========================================================================== */
(function () {
  'use strict';
  const A = window.Z3Art;
  const Q = new URLSearchParams(location.search);
  const $ = (s, r = document) => r.querySelector(s);
  const P = (k, d) => (Q.has(k) ? Q.get(k) : d);

  const STATIC = Q.has('static');
  document.body.classList.add(STATIC ? 'static' : 'live');
  if (Q.has('digits')) document.body.classList.add('digits');
  if (Q.has('previewbg')) document.body.classList.add('preview-bg');

  /* ---------------- icônes ---------------- */
  const ICON = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.5l2.2 10.2a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.2L21 8H6.3"/><circle cx="9.5" cy="19.5" r="1.4" fill="#fff"/><circle cx="17" cy="19.5" r="1.4" fill="#fff"/><path d="M12 6.2v4.6M9.8 8.5h4.4" stroke-width="2"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.8-4.6-9.2-9.7C1.9 7.4 4 4.5 7.1 4.5c2 0 3.5 1.1 4.9 3 1.4-1.9 2.9-3 4.9-3 3.1 0 5.2 2.9 4.3 6.3-1.4 5.1-9.2 9.7-9.2 9.7z" fill="#fff"/><path d="M6.5 8.2c.4-1 1.2-1.6 2.2-1.7" stroke="#ff3fd0" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    crown: '<svg viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 4.5 16.5 12 21 8l-2 10.5H5z" fill="#fff"/><rect x="5" y="19.3" width="14" height="2.2" rx="1" fill="#fff"/><circle cx="12" cy="13.6" r="1.7" fill="#ff3fd0"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1.8 12S5.6 5 12 5s10.2 7 10.2 7-3.8 7-10.2 7S1.8 12 1.8 12z" fill="none" stroke="#ff7be6" stroke-width="2"/><circle cx="12" cy="12" r="3.6" fill="#fff"/><circle cx="13.2" cy="10.8" r="1.1" fill="#ff3fd0"/></svg>',
    clock: '<svg viewBox="0 0 48 48"><circle cx="24" cy="27" r="17" fill="none" stroke="#fff" stroke-width="4"/><rect x="19" y="3" width="10" height="5" rx="2" fill="#ff7be6"/><path d="M24 8v3" stroke="#fff" stroke-width="4"/><path d="M24 27V17" stroke="#ff3fd0" stroke-width="4" stroke-linecap="round"/><path d="M24 27l7 5" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><circle cx="24" cy="27" r="2.6" fill="#fff"/><path d="M37 11l3 -3" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
    devil: '<svg viewBox="0 0 32 32"><path d="M5 4l5 7M27 4l-5 7" stroke="#ff2f8a" stroke-width="4" stroke-linecap="round"/><circle cx="16" cy="18" r="12" fill="#b44dff"/><path d="M8.5 14.5l5 2.2M23.5 14.5l-5 2.2" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.8" fill="#fff"/><circle cx="20" cy="17.6" r="1.8" fill="#fff"/><path d="M9.5 21.5q6.5 6 13 0" fill="#fff"/><path d="M11.5 22.5l1 2 1-1.6M18.6 22.9l1 1.6 1-2" fill="#b44dff"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13.5" height="12" rx="2.5" fill="#fff"/><path d="M16.5 10.5l5-3v9l-5-3z" fill="#fff"/><circle cx="7" cy="10" r="1.6" fill="#ff3fd0"/></svg>',
  };

  /* ---------------- panneaux SVG (verre + contour néon, coins coupés) ---------------- */
  let pid = 0;
  function panelSVG(w, h, o = {}) {
    const c = o.cut ?? 14, id = 'pn' + (pid++);
    const pts = `${c},0 ${w},0 ${w},${h - c} ${w - c},${h} 0,${h} 0,${c}`;
    const acc = o.accent !== false;
    return `<svg class="pbg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10031f" stop-opacity="${o.a1 ?? .78}"/><stop offset="1" stop-color="#2c0846" stop-opacity="${o.a2 ?? .5}"/></linearGradient>
      <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff3fd0"/><stop offset=".5" stop-color="#b44dff"/><stop offset="1" stop-color="#7b5cff"/></linearGradient></defs>
      ${o.fill === false ? '' : `<polygon points="${pts}" fill="url(#${id}g)"/>`}
      <polygon points="${pts}" fill="none" stroke="url(#${id}s)" stroke-width="1.8"/>
      ${acc ? `<path d="M0,${c + 26} L0,${c} L${c},0 L${c + 46},0" fill="none" stroke="#fff" stroke-width="3.2"/>
      <path d="M${w},${h - c - 26} L${w},${h - c} L${w - c},${h} L${w - c - 46},${h}" fill="none" stroke="#ff3fd0" stroke-width="3.2"/>
      <rect x="${w - 40}" y="6" width="28" height="3" fill="#ff3fd0"/><rect x="${w - 52}" y="6" width="7" height="3" fill="#fff"/>` : ''}
    </svg>`;
  }
  function mountPanels() {
    document.querySelectorAll('[data-panel]').forEach((el) => {
      const o = JSON.parse(el.dataset.panel || '{}');
      el.insertAdjacentHTML('afterbegin', panelSVG(el.offsetWidth, el.offsetHeight, o));
    });
  }

  /* ---------------- calque DÉCOR ---------------- */
  function bolt(x, y, len, ang, seed, cls) {
    const R = A.rng(seed);
    let d = `M0,0`, px = 0;
    const segs = 9;
    for (let i = 1; i <= segs; i++) { px = (len / segs) * i; d += ` L${px.toFixed(1)},${((R() - .5) * 26).toFixed(1)}`; }
    let br = ''; // ramification
    const bx = len * .45; br = `M${bx},${((R() - .5) * 10).toFixed(1)} l${len * .12},${22 + R() * 10} l${len * .08},-4 l${len * .1},18`;
    return `<g class="bolt ${cls || ''}" transform="translate(${x},${y}) rotate(${ang})" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${d}" stroke="#b44dff" stroke-width="9" opacity=".35" filter="url(#blur6)"/>
      <path d="${d}" stroke="#ff3fd0" stroke-width="4.2"/><path d="${d}" stroke="#fff" stroke-width="1.6"/>
      <path d="${br}" stroke="#ff7be6" stroke-width="2.2"/><path d="${br}" stroke="#fff" stroke-width=".8"/></g>`;
  }
  function petal(x, y, s, rot, op, i) {
    return `<g class="petal" style="animation-delay:${(i * 0.73) % 9}s" transform="translate(${x},${y}) rotate(${rot}) scale(${s})" opacity="${op}">
      <path d="M0,-9 C6,-7 8,1 0,9 C-8,1 -6,-7 0,-9 Z" fill="#ff8fe4"/><path d="M0,-9 L0,-5" stroke="#ffd4f5" stroke-width="1.4"/></g>`;
  }
  function decorSVG() {
    const R = A.rng(99);
    let parts = '';
    // particules : uniquement sur les bords, jamais au centre
    for (let i = 0; i < 170; i++) {
      let x = R() * 1920, y = R() * 1080;
      if (x > 380 && x < 1420 && y > 150 && y < 830) continue;
      const r = .7 + R() * 2.2, c = R() < .5 ? '#ff7be6' : R() < .6 ? '#ffffff' : '#b44dff';
      parts += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${c}" opacity="${(.35 + R() * .6).toFixed(2)}"/>`;
    }
    let petals = '', pi = 0;
    [[70, 660], [120, 760], [300, 690], [40, 820], [1400, 760], [1330, 140], [1250, 100], [1440, 620], [380, 60], [700, 150], [1180, 820], [560, 820], [30, 140], [1880, 860], [240, 860]]
      .forEach(([x, y]) => { petals += petal(x, y, .8 + R() * .9, R() * 360, .55 + R() * .4, pi++); });
    const W = 1920, H = 1080;
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="blur6" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <linearGradient id="edgeL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3fd0" stop-opacity="0"/><stop offset=".5" stop-color="#b44dff"/><stop offset="1" stop-color="#ff3fd0" stop-opacity="0"/></linearGradient>
    <linearGradient id="edgeT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b44dff" stop-opacity="0"/><stop offset=".5" stop-color="#ff3fd0"/><stop offset="1" stop-color="#b44dff" stop-opacity="0"/></linearGradient>
    <radialGradient id="smoke" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8b2cff" stop-opacity=".38"/><stop offset=".6" stop-color="#ff3fd0" stop-opacity=".08"/><stop offset="1" stop-color="#8b2cff" stop-opacity="0"/></radialGradient>
  </defs>
  <!-- fumée néon dans les coins -->
  <ellipse cx="80" cy="1000" rx="260" ry="120" fill="url(#smoke)"/>
  <ellipse cx="1860" cy="980" rx="240" ry="130" fill="url(#smoke)"/>
  <ellipse cx="200" cy="60" rx="320" ry="110" fill="url(#smoke)" opacity=".7"/>
  <ellipse cx="1760" cy="560" rx="200" ry="260" fill="url(#smoke)" opacity=".45"/>
  <!-- lignes de bord -->
  <rect x="6" y="160" width="2.5" height="700" fill="url(#edgeL)"/>
  <rect x="1911" y="400" width="2.5" height="480" fill="url(#edgeL)"/>
  <rect x="680" y="10" width="560" height="2" fill="url(#edgeT)"/>
  <rect x="380" y="1074" width="1160" height="2" fill="url(#edgeT)" opacity=".8"/>
  <!-- repères de coins -->
  <g fill="none" stroke-linecap="square">
    <path d="M6,6 h70 M6,6 v70" stroke="#ff3fd0" stroke-width="4"/><path d="M16,16 h26 M16,16 v26" stroke="#fff" stroke-width="2"/>
    <path d="M1914,6 h-70 M1914,6 v70" stroke="#ff3fd0" stroke-width="4"/><path d="M1904,16 h-26 M1904,16 v26" stroke="#fff" stroke-width="2"/>
  </g>
  <!-- kanji verticaux discrets -->
  <text x="382" y="200" class="jp" font-family="NotoJP" font-weight="900" font-size="22" fill="#fff" opacity=".22" writing-mode="tb" letter-spacing="10">生配信</text>
  <!-- traits de vitesse manga -->
  <g stroke="#fff" stroke-linecap="round" opacity=".5">
    <path d="M668,64 h60" stroke-width="2"/><path d="M690,80 h36" stroke-width="1.4"/><path d="M1192,64 h60" stroke-width="2"/><path d="M1194,80 h36" stroke-width="1.4"/>
  </g>
  ${bolt(24, 168, 330, 4, 11, 'b1')}
  ${bolt(1896, 390, 260, 172, 23, 'b2')}
  ${bolt(1896, 840, 240, 186, 37, 'b1')}
  <g>${parts}</g>
  <g>${petals}</g>
</svg>`;
  }

  /* ---------------- cadre webcam ---------------- */
  function camSVG(w, h) {
    const c = 22;
    const outer = `${c},0 ${w},0 ${w},${h - c} ${w - c},${h} 0,${h} 0,${c}`;
    const i = 8;
    return `<svg class="pbg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="filter:drop-shadow(0 0 6px rgba(255,63,208,.8)) drop-shadow(0 0 16px rgba(180,77,255,.5))">
      <defs><linearGradient id="camS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3fd0"/><stop offset=".5" stop-color="#b44dff"/><stop offset="1" stop-color="#ff3fd0"/></linearGradient>
      <mask id="camHole"><rect width="${w}" height="${h}" fill="#fff"/><polygon points="${c - 2 + i},${i} ${w - i},${i} ${w - i},${h - c + 2 - i} ${w - c + 2 - i},${h - i} ${i},${h - i} ${i},${c - 2 + i}" fill="#000"/></mask></defs>
      <polygon points="${outer}" fill="#12031f" fill-opacity=".85" mask="url(#camHole)"/>
      <polygon points="${outer}" fill="none" stroke="url(#camS)" stroke-width="2.4"/>
      <polygon points="${c - 2 + i},${i} ${w - i},${i} ${w - i},${h - c + 2 - i} ${w - c + 2 - i},${h - i} ${i},${h - i} ${i},${c - 2 + i}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>
      <path d="M0,${c + 60} L0,${c} L${c},0 L${c + 120},0" fill="none" stroke="#fff" stroke-width="5"/>
      <path d="M${w},${h - c - 60} L${w},${h - c} L${w - c},${h} L${w - c - 120},${h}" fill="none" stroke="#fff" stroke-width="5"/>
      <path d="M${w - 90},0 h90 v44" fill="none" stroke="#ff3fd0" stroke-width="5"/>
      <path d="M0,${h - 44} v44 h90" fill="none" stroke="#ff3fd0" stroke-width="5"/>
      <g fill="#fff">${[0, 1, 2, 3, 4].map((k) => `<rect x="${w - 3}" y="${70 + k * 12}" width="3" height="6"/>`).join('')}</g>
      <g fill="#ff7be6">${[0, 1, 2, 3, 4].map((k) => `<rect x="0" y="${70 + k * 12}" width="3" height="6"/>`).join('')}</g>
    </svg>`;
  }

  /* ---------------- rail de la jauge ---------------- */
  function railSVG() {
    const w = 1880, h = 140, notchL = 940 - 20 - 280, notchR = 940 - 20 + 280;
    const sx = (r) => A.SW.x0 + r * (A.SW.x1 - A.SW.x0);   // coordonnée sandwich
    const ticks = [0, .25, .5, .75, 1].map((r) => {
      const x = sx(r);
      return `<g transform="translate(${x.toFixed(1)},0)"><rect x="-1" y="${h - 20}" width="2" height="12" fill="#fff" opacity=".8"/>
        <text x="0" y="${h - 1}" text-anchor="middle" font-family="Orbitron" font-weight="900" font-size="10" fill="#e9c7ff" opacity=".9">${Math.round(r * 100)}%</text></g>`;
    }).join('');
    return `<svg class="pbg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="filter:drop-shadow(0 0 5px rgba(180,77,255,.8))">
      <defs><linearGradient id="railF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12031f" stop-opacity=".2"/><stop offset=".45" stop-color="#12031f" stop-opacity=".55"/><stop offset="1" stop-color="#1b0530" stop-opacity=".7"/></linearGradient>
      <linearGradient id="railS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff3fd0" stop-opacity=".2"/><stop offset=".2" stop-color="#ff3fd0"/><stop offset=".5" stop-color="#b44dff"/><stop offset=".8" stop-color="#ff3fd0"/><stop offset="1" stop-color="#ff3fd0" stop-opacity=".2"/></linearGradient></defs>
      <path d="M18,24 L${notchL},24 L${notchL + 24},2 L${notchR - 24},2 L${notchR},24 L${w - 18},24 L${w},42 L${w},${h} L0,${h} L0,42 Z" fill="url(#railF)"/>
      <path d="M18,24 L${notchL},24 L${notchL + 24},2 L${notchR - 24},2 L${notchR},24 L${w - 18},24 L${w},42" fill="none" stroke="url(#railS)" stroke-width="2.4"/>
      <path d="M0,42 L18,24" fill="none" stroke="#ff3fd0" stroke-width="2.4"/>
      <g transform="translate(0,0)">${ticks}</g>
    </svg>`;
  }

  /* ---------------- badge du chrono ---------------- */
  function timerSVG(w, h) {
    const c = 26;
    const pts = `${c},0 ${w - c},0 ${w},${h / 2} ${w - c},${h} ${c},${h} 0,${h / 2}`;
    return `<svg class="pbg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="filter:drop-shadow(0 0 8px rgba(255,63,208,.85)) drop-shadow(0 0 22px rgba(180,77,255,.6))">
      <defs><linearGradient id="tbF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0748" stop-opacity=".92"/><stop offset="1" stop-color="#0e0219" stop-opacity=".92"/></linearGradient>
      <linearGradient id="tbS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff3fd0"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#b44dff"/></linearGradient></defs>
      <polygon points="${pts}" fill="url(#tbF)"/>
      <polygon points="${pts}" fill="none" stroke="url(#tbS)" stroke-width="3"/>
      <polygon points="${c + 8},6 ${w - c - 8},6 ${w - 7},${h / 2} ${w - c - 8},${h - 6} ${c + 8},${h - 6} 7,${h / 2}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>
      <path d="M${c + 30},${h - 1} h${w - 2 * c - 60}" stroke="#ff3fd0" stroke-width="4"/>
      <g fill="#ff3fd0"><polygon points="-26,${h / 2 - 12} -4,${h / 2} -26,${h / 2 + 12} -18,${h / 2}"/><polygon points="${w + 26},${h / 2 - 12} ${w + 4},${h / 2} ${w + 26},${h / 2 + 12} ${w + 18},${h / 2}"/></g>
      <g fill="#fff" opacity=".8"><polygon points="-46,${h / 2 - 8} -30,${h / 2} -46,${h / 2 + 8} -40,${h / 2}"/><polygon points="${w + 46},${h / 2 - 8} ${w + 30},${h / 2} ${w + 46},${h / 2 + 8} ${w + 40},${h / 2}"/></g>
    </svg>`;
  }

  /* ---------------- construction du DOM ---------------- */
  const txt = (k, d) => (STATIC && !Q.has('demo') ? '' : P(k, d));
  const demo = Q.has('demo');

  document.body.insertAdjacentHTML('beforeend', `
  <div class="layer" id="decor">${decorSVG()}</div>

  <div class="layer" id="brand">
    <div class="panel plate" data-panel='{"cut":22,"a1":0.62,"a2":0.18}'>
      <div class="emblem">${A.emblemSVG(142, 'emB')}</div>
      <div class="z3">Z3</div><div class="live-tag">LIVE</div><div class="divider"></div>
      <div class="team">TEAM <b>Z3F4</b></div>
      <div class="by"><small>BY</small><span class="lmdt">LA MAISON DU TCG</span></div>
      <div class="jp jp-tag">カードの館 · ライブ</div>
    </div>
    <div class="abs live-pill"><span class="dot"></span><span>EN DIRECT</span><span class="jp">生配信</span></div>
    <div class="abs live-sub">Z3F4 <b>×</b> LA MAISON DU TCG</div>
  </div>

  <div class="layer" id="webcam">
    <div class="panel cam" id="camBox">
      <div class="tab">${ICON.cam.replace('<svg', '<svg width="20" height="20"')}Z3F4 CAM</div>
      <div class="ribbon">${A.emblemSVG(22, 'emC', { ring: false })}LA MAISON DU TCG</div>
    </div>
  </div>

  <div class="layer" id="viewers">
    <div class="abs pill">${ICON.eye}<div><div class="lbl">VIEWERS</div><div class="val" id="vViewers">${txt('viewers', demo ? '1 337' : '')}</div></div><span class="rec"></span></div>
  </div>

  <div class="layer" id="widgets">
    <div class="panel widget" style="top:392px" data-panel='{}'>
      <div class="icon">${ICON.cart}</div>
      <div class="lbl">DERNIER ACHETEUR<span class="jp">購入</span></div>
      <div class="val" id="vBuyer">${txt('buyer', demo ? 'SachaDu93' : '')}</div>
    </div>
    <div class="panel widget" style="top:480px" data-panel='{}'>
      <div class="icon">${ICON.heart}</div>
      <div class="lbl">DERNIER FOLLOW<span class="jp">家</span></div>
      <div class="val" id="vFollow">${txt('follow', demo ? 'Dracaufeu_Z' : '')}</div>
    </div>
    <div class="panel widget" style="top:568px" data-panel='{}'>
      <div class="icon">${ICON.crown}</div>
      <div class="lbl">TOP SUPPORTER<span class="jp">支援</span></div>
      <div class="val" id="vTop">${txt('top', demo ? 'KaizokuKing' : '')}</div>
    </div>
  </div>

  <div class="layer" id="partner">
    <div class="panel card" data-panel='{"cut":18}'>
      <div class="emb">${A.emblemSVG(144, 'emP')}</div>
      <div class="t1">PARTENAIRE OFFICIEL</div>
      <div class="t2">LA MAISON<br>DU TCG</div>
      <div class="t3">BOOSTERS · DISPLAYS · CARTES</div>
    </div>
  </div>

  <div class="layer" id="goal">
    <div class="panel box" data-panel='{}'>
      <div class="head">OBJECTIF DU LIVE<span class="jp">目標</span></div>
      <div class="goal-txt" id="vGoal">${txt('goal', demo ? 'OUVERTURE DISPLAY 151' : '')}</div>
      <div class="pct" id="vGoalPct">${txt('goalpct', demo ? '68' : '') ? P('goalpct', '68') + '%' : ''}</div>
      <div class="bar"><i id="vGoalBar" style="width:${demo ? P('goalpct', '68') : P('goalpct', STATIC ? '0' : '0')}%"></i></div>
    </div>
  </div>

  <div class="layer" id="alerts">
    <div class="panel box" data-panel='{"a1":0.5,"a2":0.25}'>
      <div class="head">ALERTES<span class="jp">ライブ</span></div>
      <div class="zone"><span class="ph">ZONE ALERTES<br>STREAMELEMENTS / STREAMLABS</span></div>
    </div>
  </div>

  <div class="layer" id="gauge">
    <div class="panel rail" id="railBox"></div>
    <div class="mention">LE LIVE SE TERMINE QUAND IL NE RESTE PLUS RIEN ${ICON.devil}</div>
    <div class="brand-mini">${A.emblemSVG(26, 'emG', { ring: false })}SPONSORISÉ PAR LA MAISON DU TCG</div>
  </div>

  <div class="layer" id="timer">
    <div class="abs badge" id="timerBox">
      <div class="lbl">TEMPS RESTANT<span class="jp">時間</span></div>
      <div class="digits">${ICON.clock}<span class="t" id="vTime">00:00:00</span></div>
      <div class="foot">Z3F4 × LA MAISON DU TCG</div>
    </div>
  </div>

  <div class="layer" id="sandwich"><div class="sprite sandwich-glow" id="swBox"></div></div>
  <div class="layer" id="drink"><div class="sprite" id="dkBox"></div><div class="sfx" id="sfx"></div></div>
  `);

  $('#camBox').insertAdjacentHTML('afterbegin', camSVG(452, 263));
  $('#railBox').insertAdjacentHTML('afterbegin', railSVG());
  $('#timerBox').insertAdjacentHTML('afterbegin', timerSVG(500, 104));
  mountPanels();

  /* calque unique (export) */
  if (Q.has('only')) {
    document.body.dataset.only = '1';
    Q.get('only').split(',').forEach((id) => { const el = document.getElementById(id); if (el) el.style.display = 'block'; });
  }

  /* ---------------- sandwich + boisson ---------------- */
  let curLevel = -1;
  function setLevel(level, animate) {
    level = Math.max(0, Math.min(A.LEVELS - 1, level));
    if (level === curLevel) return;
    const prev = curLevel; curLevel = level;
    [['#swBox', A.sandwichSVG], ['#dkBox', A.drinkSVG]].forEach(([sel, fn]) => {
      const box = $(sel);
      const fr = document.createElement('div');
      fr.className = 'frame'; fr.innerHTML = fn(level, sel.slice(1) + level);
      if (animate) { fr.style.opacity = 0; box.appendChild(fr); requestAnimationFrame(() => requestAnimationFrame(() => { fr.style.opacity = 1; }));
        const old = [...box.children].filter((c) => c !== fr); setTimeout(() => old.forEach((o) => o.remove()), 1000);
      } else { box.innerHTML = ''; box.appendChild(fr); }
    });
    if (animate && prev >= 0 && level > prev) sfx(level);
  }
  const SFX = ['CROC !', 'MIAM !', 'SLURP !', 'CRUNCH !', 'GLOUPS !', 'NOM NOM !'];
  function sfx(level) {
    const el = $('#sfx');
    const remaining = A.sandwichRemaining(level);
    el.textContent = level === A.LEVELS - 1 ? 'PLUS RIEN !' : SFX[level % SFX.length];
    el.style.left = Math.max(80, 20 + A.SW.x0 + remaining * (A.SW.x1 - A.SW.x0) - 110) + 'px';
    el.style.top = '880px';
    el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
  }

  /* ---------------- chrono ---------------- */
  function parseDur(s) {
    if (!s) return 3 * 3600;
    if (/^\d+:\d{1,2}(:\d{1,2})?$/.test(s)) { const p = s.split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 3600 + p[1] * 60; }
    let t = 0; const re = /(\d+(?:\.\d+)?)\s*(h|m|s)/g; let m;
    while ((m = re.exec(s))) t += parseFloat(m[1]) * (m[2] === 'h' ? 3600 : m[2] === 'm' ? 60 : 1);
    return t || parseFloat(s) || 3 * 3600;
  }
  const fmt = (sec) => { sec = Math.max(0, Math.ceil(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':'); };

  if (STATIC) {
    setLevel(parseInt(P('level', '0'), 10) || 0, false);
    if (Q.has('time')) $('#vTime').textContent = P('time');
    document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });
    return;
  }

  const KEY = 'z3f4-timer-v1';
  const total = parseDur(P('duration', '3h'));
  let st = null;
  try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { st = null; }
  if (!st || st.total !== total || Q.has('reset')) st = { total, endAt: Date.now() + total * 1000, paused: Q.has('paused'), left: total };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* stockage indisponible */ } };
  const remaining = () => (st.paused ? st.left : (st.endAt - Date.now()) / 1000);
  save();

  function tick() {
    const rem = Math.max(0, remaining());
    $('#vTime').textContent = fmt(rem);
    const level = rem <= 0 ? A.LEVELS - 1 : Math.min(A.LEVELS - 2, Math.floor((1 - rem / st.total) * (A.LEVELS - 1)));
    setLevel(level, curLevel >= 0);
    document.body.classList.toggle('urgent', rem > 0 && rem <= 300);
  }
  function shift(sec) {
    if (st.paused) st.left = Math.max(0, st.left + sec); else st.endAt += sec * 1000;
    st.total = Math.max(st.total, remaining()); save(); tick();
  }
  // Raccourcis (OBS › clic droit sur la source › Interagir)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { if (st.paused) { st.endAt = Date.now() + st.left * 1000; st.paused = false; } else { st.left = remaining(); st.paused = true; } save(); tick(); }
    else if (e.key === '+' || e.key === 'ArrowUp') shift(300);
    else if (e.key === '-' || e.key === 'ArrowDown') shift(-300);
    else if (e.key === 'ArrowRight') shift(60);
    else if (e.key === 'ArrowLeft') shift(-60);
    else if (e.key === 'r' || e.key === 'R') { st = { total, endAt: Date.now() + total * 1000, paused: false, left: total }; save(); curLevel = -1; tick(); }
  });
  // API pour docks / scripts : window.Z3.add(600), window.Z3.pause() …
  window.Z3 = { add: shift, pause: () => { if (!st.paused) { st.left = remaining(); st.paused = true; save(); } },
    resume: () => { if (st.paused) { st.endAt = Date.now() + st.left * 1000; st.paused = false; save(); } },
    setLevel: (l) => setLevel(l, true) };

  tick();
  setInterval(tick, 250);
})();
