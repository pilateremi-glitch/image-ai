/* ==========================================================================
   Z3 / TEAM Z3F4 × LA MAISON DU TCG — générateurs SVG vectoriels
   Sandwich (15 niveaux) · Boisson (15 niveaux) · Emblème Maison du TCG
   Tout est déterministe : même position, même taille, même éclairage
   pour chaque niveau → remplacement image par image sans décalage.
   ========================================================================== */
(function (global) {
  'use strict';

  const LEVELS = 15;              // 0 = 100 % restant … 14 = 0 % (miettes)
  const LAST = LEVELS - 1;

  function rng(seed) {            // mulberry32
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f = (n) => Math.round(n * 10) / 10;

  /* ------------------------------------------------------------------ */
  /* SANDWICH                                                           */
  /* ------------------------------------------------------------------ */
  const SW = { w: 1600, h: 112, x0: 10, x1: 1590 };

  function sandwichRemaining(level) { return (LAST - level) / LAST; }

  function sandwichSVG(level, uid) {
    level = Math.max(0, Math.min(LAST, level | 0));
    uid = uid || 'sw' + level;
    const { w, h, x0, x1 } = SW;
    const r = sandwichRemaining(level);
    const L = x1 - x0;
    const biteX = x0 + r * L;                 // bord mangé (côté droit)
    const R = rng(7331);

    /* ---- pain du dessus / dessous ---- */
    const topBun = `M${x0 + 30},50 C${x0 - 4},50 ${x0 - 2},20 ${x0 + 44},14 ` +
      `Q${w / 2},6 ${x1 - 44},14 C${x1 + 2},20 ${x1 + 4},50 ${x1 - 30},50 Z`;
    const botBun = `M${x0 + 26},70 L${x1 - 26},70 C${x1 + 4},72 ${x1},98 ${x1 - 42},98 ` +
      `L${x0 + 42},98 C${x0},98 ${x0 - 4},72 ${x0 + 26},70 Z`;

    /* ---- salade (frisée qui déborde) ---- */
    let let1 = `M${x0 + 8},52 `;
    for (let x = x0 + 8; x < x1 - 8; x += 18) {
      const d = 6 + R() * 7;
      let1 += `Q${x + 5},${f(78 + d)} ${x + 9},${f(75 + R() * 3)} Q${x + 13},${f(80 + d * 0.8)} ${x + 18},${f(73 + R() * 3)} `;
    }
    let1 += `L${x1 - 8},52 `;
    for (let x = x1 - 8; x > x0 + 8; x -= 22) {
      let1 += `Q${x - 11},${f(40 - R() * 6)} ${x - 22},${f(50 + R() * 2)} `;
    }
    let1 += 'Z';
    let letVeins = '';
    for (let x = x0 + 30; x < x1 - 30; x += 40 + R() * 26) {
      letVeins += `<path d="M${f(x)},66 q7,6 15,9" />`;
    }

    /* ---- jambon (vague rose qui pend) ---- */
    let ham = `M${x0 + 16},52 `;
    for (let x = x0 + 16; x < x1 - 16; x += 44) {
      ham += `Q${x + 22},${f(73 + R() * 3)} ${x + 44},${f(64 + R() * 2)} `;
    }
    ham += `L${x1 - 16},52 Z`;
    let hamFolds = '';
    for (let x = x0 + 38; x < x1 - 40; x += 88) {
      hamFolds += `<path d="M${x},62 q11,5 24,1" />`;
    }

    /* ---- fromage (triangles) ---- */
    let cheese = '', cheeseShade = '';
    for (let x = x0 + 60; x < x1 - 50; x += 118) {
      cheese += `<path d="M${x - 24},54 L${x + 24},54 L${x + 2},${f(80 + R() * 3)} Z"/>`;
      cheeseShade += `<path d="M${x + 4},54 L${x + 24},54 L${x + 2},79 Z"/>`;
    }

    /* ---- tomates ---- */
    let tomato = '';
    for (let x = x0 + 118; x < x1 - 60; x += 118) {
      const cx = x + (R() - 0.5) * 12;
      tomato += `<g transform="translate(${f(cx)},51)">
        <ellipse rx="31" ry="11" fill="#e8243a"/>
        <ellipse rx="27" ry="8.4" fill="#ff5a5a"/>
        <ellipse rx="11" ry="3.2" fill="#ff2f45" opacity=".6"/>
        <ellipse cx="-13" cy="-1" rx="3" ry="1.6" fill="#ffe9a8"/>
        <ellipse cx="13" cy="1" rx="3" ry="1.6" fill="#ffe9a8"/>
        <ellipse cx="0" cy="-4.4" rx="2.6" ry="1.3" fill="#ffe9a8"/>
        <ellipse cx="-16" cy="-4.5" rx="9" ry="1.8" fill="#fff" opacity=".5"/>
      </g>`;
    }

    /* ---- entailles de la baguette ---- */
    let cuts = '';
    for (let x = x0 + 86; x < x1 - 70; x += 112) {
      cuts += `<g transform="translate(${x},${f(23 + Math.sin(x / 300) * 1.5)}) rotate(-12)">
        <ellipse rx="43" ry="7.2" fill="#b8661a" opacity=".5" transform="translate(2,3)"/>
        <ellipse rx="41" ry="6" fill="#ffd98c"/>
        <ellipse rx="30" ry="2.2" fill="#fff1cc" transform="translate(-5,-1.4)"/>
      </g>`;
    }

    /* ---- farine / points de lumière ---- */
    let flour = '';
    for (let i = 0; i < 90; i++) {
      const x = x0 + 40 + R() * (L - 80), y = 18 + R() * 26;
      flour += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + R() * 1.2)}"/>`;
    }

    /* ---- morsures (masque) ---- */
    const BR = rng(900 + level * 17);
    const bites = [
      { y: 16 + BR() * 6, r: 26 + BR() * 5, dx: 0 },
      { y: 50 + BR() * 6, r: 24 + BR() * 5, dx: -14 },
      { y: 86 + BR() * 6, r: 26 + BR() * 5, dx: -4 },
    ];
    const biteCirc = (grow) => bites.map((b, i) =>
      `<circle cx="${f(biteX + 16 + b.dx)}" cy="${f(b.y)}" r="${f(b.r + grow)}"/>`).join('');

    /* mie exposée + petits débris au bord de la morsure */
    let spill = '';
    if (level > 0 && level < LAST) {
      const SR = rng(4242 + level);
      const cols = ['#58c43c', '#ff4a55', '#ffd23a', '#ff9bb0', '#58c43c'];
      for (let i = 0; i < 7; i++) {
        const x = biteX - 2 + SR() * 14, y = 50 + SR() * 20;
        spill += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3 + SR() * 4)}" ry="${f(1.5 + SR() * 2)}" fill="${cols[i % cols.length]}" transform="rotate(${f(SR() * 60 - 30)} ${f(x)} ${f(y)})"/>`;
      }
    }

    /* ---- miettes : positions fixes, apparaissent quand la zone est mangée ---- */
    let crumbs = '';
    if (level > 0) {
      const CR = rng(2024);
      const types = [
        ['#f2a93b', '#ffd98a'], ['#e39a38', '#ffe0a2'], ['#f6e2b5', '#fff4d6'],
        ['#f2a93b', '#ffd98a'], ['#58c43c', '#9be86a'], ['#ff3348', '#ff8a7a'],
        ['#ffd23a', '#fff09a'], ['#f6e2b5', '#fff4d6'], ['#ff9bb0', '#ffc6d2'],
      ];
      for (let i = 0; i < 300; i++) {
        const x = x0 + 6 + CR() * (L - 10);
        const y = 90 + CR() * 16;
        const s = 1.4 + CR() * 3.6;
        const t = types[(CR() * types.length) | 0];
        const rot = CR() * 180;
        const show = level === LAST ? true : x > biteX + 16 + CR() * 20;
        if (!show) continue;
        // densité : plus de miettes près de la morsure, quelques-unes plus loin
        if (level < LAST && CR() > 0.35 + 0.65 * Math.exp(-(x - biteX) / 260)) continue;
        crumbs += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})">
          <path d="M${-s},0 L${-s * 0.3},${-s * 0.9} L${s},${-s * 0.4} L${s * 0.7},${s * 0.6} L${-s * 0.5},${s * 0.7} Z" fill="${t[0]}"/>
          <circle cx="${f(-s * 0.2)}" cy="${f(-s * 0.3)}" r="${f(s * 0.35)}" fill="${t[1]}"/></g>`;
      }
    }

    const showBody = level < LAST;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="art-sandwich">
  <defs>
    <linearGradient id="${uid}-top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffc766"/><stop offset=".5" stop-color="#f0a038"/><stop offset="1" stop-color="#d9822a"/>
    </linearGradient>
    <linearGradient id="${uid}-bot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f0a844"/><stop offset="1" stop-color="#c9731f"/>
    </linearGradient>
    <linearGradient id="${uid}-rim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#b44dff" stop-opacity=".22"/><stop offset=".12" stop-color="#ff3fd0" stop-opacity="0"/><stop offset=".88" stop-color="#ff3fd0" stop-opacity="0"/><stop offset="1" stop-color="#ff3fd0" stop-opacity=".25"/>
    </linearGradient>
    <clipPath id="${uid}-buns"><path d="${topBun}"/><path d="${botBun}"/></clipPath>
    <clipPath id="${uid}-topclip"><path d="${topBun}"/></clipPath>
    <mask id="${uid}-eat" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
      <rect x="0" y="0" width="${f(level > 0 ? biteX + 18 : w)}" height="${h}" fill="#fff"/>
      ${level > 0 ? `<g fill="#000">${biteCirc(0)}</g>` : ''}
    </mask>
  </defs>
  ${showBody ? `<g mask="url(#${uid}-eat)">
    <path d="${botBun}" fill="url(#${uid}-bot)"/>
    <path d="M${x0 + 30},91 L${x1 - 30},91 C${x1 - 10},91 ${x1 - 16},98 ${x1 - 42},98 L${x0 + 42},98 C${x0 + 16},98 ${x0 + 10},91 ${x0 + 30},91 Z" fill="#a95a16" opacity=".55"/>
    <rect x="${x0 + 50}" y="74" width="${L - 100}" height="3" rx="1.5" fill="#ffd98c" opacity=".6"/>
    <path d="${let1}" fill="#2f9a2c"/>
    <path d="${let1}" fill="#5fd043" transform="translate(0,-2.5)"/>
    <g stroke="#b6f78a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9">${letVeins}</g>
    <path d="${ham}" fill="#ff9bb0"/>
    <g stroke="#e8708e" stroke-width="2" fill="none" stroke-linecap="round">${hamFolds}</g>
    <g fill="#ffd23a">${cheese}</g><g fill="#f2ad1f" opacity=".75">${cheeseShade}</g>
    ${tomato}
    <path d="${topBun}" fill="url(#${uid}-top)"/>
    <g clip-path="url(#${uid}-topclip)">
      <rect x="0" y="39" width="${w}" height="20" fill="#cf7a24" opacity=".7"/>
      <rect x="${x0 + 60}" y="14.5" width="${L - 120}" height="4.5" rx="2.2" fill="#fff0c4" opacity=".75"/>
      ${cuts}
      <g fill="#fff6dc" opacity=".55">${flour}</g>
      <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${uid}-rim)"/>
    </g>
    ${level > 0 ? `<g clip-path="url(#${uid}-buns)"><g fill="#f6e2b5">${biteCirc(8)}</g><g fill="#e2bf7c" opacity=".75">${biteCirc(3)}</g></g>` : ''}
  </g>` : ''}
  ${level > 0 && showBody ? `<g mask="url(#${uid}-eat)">${spill}</g>` : ''}
  <g class="crumbs">${crumbs}</g>
</svg>`;
  }

  /* ------------------------------------------------------------------ */
  /* BOISSON                                                            */
  /* ------------------------------------------------------------------ */
  const DK = { w: 200, h: 220, cx: 100, top: 44, bot: 206, hwTop: 64, hwBot: 47 };

  function drinkFill(level) {
    level = Math.max(0, Math.min(LAST, level | 0));
    if (level <= 12) return 1 - level * (0.88 / 12);   // 100 % → 12 %
    if (level === 13) return 0.035;                     // quelques gouttes
    return 0;                                           // vide
  }

  function drinkSVG(level, uid) {
    level = Math.max(0, Math.min(LAST, level | 0));
    uid = uid || 'dk' + level;
    const { w, h, cx, top, bot, hwTop, hwBot } = DK;
    const hw = (y) => hwBot + ((bot - y) / (bot - top)) * (hwTop - hwBot);
    const fill = drinkFill(level);
    const innerTop = 58, innerBot = bot - 4;
    const liqY = innerBot - fill * (innerBot - innerTop);
    const cupPath = `M${cx - hwTop},${top} L${cx + hwTop},${top} L${cx + hwBot},${bot} L${cx - hwBot},${bot} Z`;
    const inner = `M${cx - hwTop + 4},${top} L${cx + hwTop - 4},${top} L${cx + hwBot - 4},${innerBot} L${cx - hwBot + 4},${innerBot} Z`;

    /* glaçons */
    let ice = '';
    const cubes = [
      { dx: -26, dy: 6, s: 30, a: -12 }, { dx: 12, dy: 2, s: 28, a: 16 },
      { dx: -6, dy: 30, s: 26, a: 34 }, { dx: 30, dy: 28, s: 22, a: -24 },
    ];
    if (level < LAST) {
      const melt = level <= 12 ? 1 - level * 0.042 : 0.3;
      const count = level <= 9 ? 4 : level <= 11 ? 3 : 2;
      cubes.slice(0, count).forEach((c, i) => {
        const s = c.s * melt;
        let y = liqY + c.dy * Math.max(0.35, fill) - s * 0.25;
        y = Math.min(y, innerBot - s * 0.62);
        const x = cx + c.dx * (0.75 + 0.25 * fill);
        ice += `<g transform="translate(${f(x)},${f(y)}) rotate(${c.a + level * 3 * (i % 2 ? 1 : -1)})">
          <rect x="${f(-s / 2)}" y="${f(-s / 2)}" width="${f(s)}" height="${f(s)}" rx="${f(s * 0.22)}" fill="#e9f4ff" opacity=".42"/>
          <path d="M${f(-s / 2 + 3)},${f(-s / 2 + 5)} L${f(s / 2 - 5)},${f(-s / 2 + 3)} L${f(s / 2 - 8)},${f(-s / 6)} L${f(-s / 2 + 5)},${f(-s / 6 + 2)} Z" fill="#ffffff" opacity=".55"/>
          <rect x="${f(-s / 2 + 4)}" y="${f(-s / 2 + 3)}" width="${f(s * 0.12)}" height="${f(s * 0.62)}" rx="2" fill="#fff" opacity=".9"/>
          <rect x="${f(-s / 2)}" y="${f(-s / 2)}" width="${f(s)}" height="${f(s)}" rx="${f(s * 0.22)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"/>
        </g>`;
      });
    }

    /* bulles */
    let bubbles = '';
    const BB = rng(555);
    for (let i = 0; i < 26; i++) {
      const y = innerTop + BB() * (innerBot - innerTop);
      const x = cx + (BB() - 0.5) * 2 * (hw(y) - 12);
      const r = 0.9 + BB() * 2;
      if (fill > 0.05 && y > liqY + 6) bubbles += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
    }

    /* condensation */
    let drops = '';
    const CD = rng(8080);
    for (let i = 0; i < 46; i++) {
      const y = top + 14 + CD() * (bot - top - 22);
      const x = cx + (CD() - 0.5) * 2 * (hw(y) - 6);
      const r = 1.2 + CD() * 2.6;
      const cold = fill > 0.02 && y > liqY - 6;
      const op = cold ? 0.85 : 0.28;
      drops += `<g opacity="${op}"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 1.25)}" fill="#dff1ff" fill-opacity=".38"/>` +
        `<circle cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.45)}" r="${f(Math.max(0.5, r * 0.32))}" fill="#fff"/></g>`;
      if (cold && i % 9 === 0) {
        drops += `<path d="M${f(x)},${f(y + r)} q-1,${f(10 + r * 3)} 1,${f(16 + r * 3)}" stroke="#e8f6ff" stroke-opacity=".5" stroke-width="${f(r * 0.7)}" fill="none" stroke-linecap="round"/>`;
      }
    }

    /* gouttes au fond pour le niveau « quelques gouttes » / vide */
    let puddle = '';
    if (level === 13) {
      puddle = `<ellipse cx="${cx - 4}" cy="${innerBot - 2}" rx="30" ry="3.2" fill="#5a1a0e" opacity=".9"/>
        <ellipse cx="${cx - 10}" cy="${innerBot - 3}" rx="10" ry="1.2" fill="#c0634a" opacity=".8"/>
        <ellipse cx="${cx + 26}" cy="${innerBot - 10}" rx="2.4" ry="3" fill="#6b2412"/>
        <ellipse cx="${cx - 30}" cy="${innerBot - 18}" rx="2" ry="2.6" fill="#6b2412"/>`;
    } else if (level === LAST) {
      puddle = `<ellipse cx="${cx + 18}" cy="${innerBot - 6}" rx="1.8" ry="2.2" fill="#6b2412" opacity=".7"/>`;
    }

    const showLiquid = level <= 12;
    const surfHW = hw(liqY) - 4;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="art-drink">
  <defs>
    <linearGradient id="${uid}-liq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8e2f18"/><stop offset=".35" stop-color="#5c1a0c"/><stop offset="1" stop-color="#2c0905"/>
    </linearGradient>
    <linearGradient id="${uid}-liqside" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff3fd0" stop-opacity=".35"/><stop offset=".25" stop-color="#ff3fd0" stop-opacity="0"/>
      <stop offset=".8" stop-color="#b44dff" stop-opacity="0"/><stop offset="1" stop-color="#b44dff" stop-opacity=".45"/>
    </linearGradient>
    <linearGradient id="${uid}-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".18" stop-color="#ffffff" stop-opacity=".06"/>
      <stop offset=".7" stop-color="#ffffff" stop-opacity=".03"/><stop offset="1" stop-color="#ffffff" stop-opacity=".2"/>
    </linearGradient>
    <clipPath id="${uid}-in"><path d="${inner}"/></clipPath>
    <clipPath id="${uid}-cup"><path d="${cupPath}"/></clipPath>
    <pattern id="${uid}-stripe" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <rect width="16" height="16" fill="#ffffff"/><rect width="8" height="16" fill="#ff2fb4"/>
    </pattern>
  </defs>
  <!-- verre : face arrière -->
  <path d="${cupPath}" fill="url(#${uid}-glass)"/>
  <ellipse cx="${cx}" cy="${top}" rx="${hwTop}" ry="8" fill="#ffffff" fill-opacity=".05"/>
  <path d="M${cx - hwTop},${top} A${hwTop},8 0 0 1 ${cx + hwTop},${top}" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.5"/>
  <!-- paille (partie dans le verre) -->
  <g clip-path="url(#${uid}-in)"><path d="M112,${innerBot - 2} L150,4" stroke="url(#${uid}-stripe)" stroke-width="11" stroke-linecap="round"/></g>
  <!-- liquide -->
  <g clip-path="url(#${uid}-in)">
    ${showLiquid ? `<rect x="0" y="${f(liqY)}" width="${w}" height="${h}" fill="url(#${uid}-liq)" opacity=".9"/>
    <rect x="0" y="${f(liqY)}" width="${w}" height="${h}" fill="url(#${uid}-liqside)"/>
    <g fill="#ffb08a" opacity=".55">${bubbles}</g>
    <ellipse cx="${cx}" cy="${f(liqY)}" rx="${f(surfHW)}" ry="5.5" fill="#a8452a"/>
    <ellipse cx="${cx - 8}" cy="${f(liqY - 0.6)}" rx="${f(surfHW * 0.6)}" ry="2.2" fill="#e08a64" opacity=".55"/>` : ''}
    ${puddle}
    ${ice}
  </g>
  <!-- paille (partie hors du verre) -->
  <g><clipPath id="${uid}-above"><rect x="0" y="0" width="${w}" height="${top + 1}"/></clipPath>
    <path clip-path="url(#${uid}-above)" d="M112,${innerBot - 2} L150,4" stroke="url(#${uid}-stripe)" stroke-width="11" stroke-linecap="round"/>
    <path clip-path="url(#${uid}-above)" d="M112,${innerBot - 2} L150,4" stroke="#fff" stroke-opacity=".5" stroke-width="2.5" transform="translate(-3,0)"/></g>
  <!-- verre : face avant, reflets -->
  <g clip-path="url(#${uid}-cup)">
    <path d="M${cx - hwTop + 10},${top + 6} L${cx - hwTop + 22},${top + 6} L${cx - hwBot + 18},${bot - 10} L${cx - hwBot + 9},${bot - 10} Z" fill="#fff" opacity=".42"/>
    <path d="M${cx - hwTop + 27},${top + 12} L${cx - hwTop + 31},${top + 12} L${cx - hwBot + 25},${bot - 20} L${cx - hwBot + 22},${bot - 20} Z" fill="#fff" opacity=".3"/>
    <path d="M${cx + hwTop - 12},${top + 10} L${cx + hwTop - 7},${top + 10} L${cx + hwBot - 6},${bot - 16} L${cx + hwBot - 10},${bot - 16} Z" fill="#ff9be8" opacity=".35"/>
    ${drops}
  </g>
  <path d="M${cx - hwTop},${top} L${cx - hwBot},${bot}" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.6"/>
  <path d="M${cx + hwTop},${top} L${cx + hwBot},${bot}" stroke="#e7b6ff" stroke-opacity=".5" stroke-width="1.6"/>
  <path d="M${cx - hwTop},${top} A${hwTop},8 0 0 0 ${cx + hwTop},${top}" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="2"/>
  <ellipse cx="${cx}" cy="${bot}" rx="${hwBot}" ry="5" fill="#ffffff" fill-opacity=".12" stroke="#ffffff" stroke-opacity=".45" stroke-width="1.4"/>
  <ellipse cx="${cx - 18}" cy="${bot + 1}" rx="16" ry="1.6" fill="#fff" opacity=".5"/>
</svg>`;
  }

  /* ------------------------------------------------------------------ */
  /* EMBLÈME « LA MAISON DU TCG » : maison japonaise + cartes + énergie  */
  /* ------------------------------------------------------------------ */
  function emblemSVG(size, uid, opts) {
    uid = uid || 'em';
    opts = opts || {};
    const ring = opts.ring !== false;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" class="art-emblem">
  <defs>
    <linearGradient id="${uid}-roof" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff5fe0"/><stop offset="1" stop-color="#8b2cff"/>
    </linearGradient>
    <linearGradient id="${uid}-card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a0c4d"/><stop offset="1" stop-color="#120524"/>
    </linearGradient>
    <radialGradient id="${uid}-core" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#ff9cf0"/><stop offset="1" stop-color="#b44dff" stop-opacity="0"/>
    </radialGradient>
    <path id="${uid}-arc" d="M100,100 m-78,0 a78,78 0 1,1 156,0"/>
    <path id="${uid}-arc2" d="M100,100 m-84,0 a84,84 0 0,0 168,0"/>
  </defs>
  ${ring ? `<circle cx="100" cy="100" r="96" fill="#12031f" fill-opacity=".82"/>
  <circle cx="100" cy="100" r="93" fill="none" stroke="url(#${uid}-roof)" stroke-width="3.5"/>
  <circle cx="100" cy="100" r="66" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="2 5"/>
  <text font-family="Rajdhani, sans-serif" font-weight="700" font-size="17" letter-spacing="4.2" fill="#fff">
    <textPath href="#${uid}-arc" startOffset="50%" text-anchor="middle">LA MAISON DU TCG</textPath></text>
  <text font-family="Rajdhani, sans-serif" font-weight="700" font-size="12" letter-spacing="6" fill="#ff7be6">
    <textPath href="#${uid}-arc2" startOffset="50%" text-anchor="middle">★ OFFICIAL PARTNER ★</textPath></text>` : ''}
  <!-- éventail de cartes -->
  <g transform="translate(100,118)">
    <g transform="rotate(-20) translate(-17,-44)"><rect width="34" height="48" rx="4" fill="url(#${uid}-card)" stroke="#b44dff" stroke-width="2.4"/><circle cx="17" cy="24" r="7" fill="none" stroke="#b44dff" stroke-width="2"/></g>
    <g transform="rotate(20) translate(-17,-44)"><rect width="34" height="48" rx="4" fill="url(#${uid}-card)" stroke="#b44dff" stroke-width="2.4"/><circle cx="17" cy="24" r="7" fill="none" stroke="#b44dff" stroke-width="2"/></g>
    <g transform="translate(-19,-50)"><rect width="38" height="54" rx="4.5" fill="url(#${uid}-card)" stroke="#ff5fe0" stroke-width="2.8"/>
      <circle cx="19" cy="27" r="15" fill="url(#${uid}-core)"/>
      <path d="M22,10 L12,29 L19,29 L15,45 L27,24 L20,24 Z" fill="#ffffff"/></g>
  </g>
  <!-- toit de maison japonaise (irimoya) -->
  <g transform="translate(100,70)">
    <path d="M-62,6 Q-40,2 -26,-10 L-14,-22 L14,-22 L26,-10 Q40,2 62,6 Q44,10 30,6 L-30,6 Q-44,10 -62,6 Z" fill="url(#${uid}-roof)"/>
    <path d="M-44,-18 Q-26,-22 -16,-34 L16,-34 Q26,-22 44,-18 Q30,-14 20,-17 L-20,-17 Q-30,-14 -44,-18 Z" fill="url(#${uid}-roof)"/>
    <rect x="-18" y="-40" width="36" height="5" rx="2" fill="#ffffff"/>
    <rect x="-30" y="6" width="60" height="3.5" fill="#ffffff" opacity=".9"/>
    <path d="M-60,6 Q-40,3 -26,-8" stroke="#fff" stroke-width="1.6" fill="none" opacity=".75"/>
  </g>
  <circle cx="44" cy="70" r="2" fill="#fff"/><circle cx="160" cy="84" r="1.6" fill="#ff9cf0"/><circle cx="150" cy="54" r="1.2" fill="#fff"/>
</svg>`;
  }

  global.Z3Art = { LEVELS, SW, DK, sandwichSVG, drinkSVG, emblemSVG, sandwichRemaining, drinkFill, rng };
})(typeof window !== 'undefined' ? window : globalThis);
