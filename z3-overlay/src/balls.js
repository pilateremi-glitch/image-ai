/* ==========================================================================
   Z3 — Balls (Poké, Super, Hyper, Master) : 3D rendering + rolling motion
   • Two layers: the BODY (markings) rotates as it rolls, the LIGHT
     (shading, reflections, glints) stays fixed → real feel of a rolling sphere.
   • Rolling without slipping: angle = distance traveled / radius.
   • Eased speed (fast launch, slowdown at the end), trail of sparks and ghost images,
     contour drawn in sync, then a "capture": small hop, 3 wobbles, flash.
   Z3Balls.svg(type) · Z3Balls.trace({ host, W, H, r, size, type, dur, color, rects, onDone })
   ========================================================================== */
(function (global) {
  'use strict';
  let uid = 0;

  /* ---------------- design ---------------- */
  function svg(type) {
    const id = 'zb' + (++uid);
    const C = {
      poke:   { top: ['#ff5a5f', '#e3242b', '#9c0f16'] },
      super:  { top: ['#5aa2ff', '#2a6fe0', '#163e8f'] },
      hyper:  { top: ['#3a3a40', '#1c1c20', '#050507'] },
      master: { top: ['#b678ff', '#7b2fbe', '#3f1270'] },
    }[type] || { top: ['#ff5a5f', '#e3242b', '#9c0f16'] };
    // markings of the upper half (in the body coordinates, rotating)
    const marks = {
      poke: '',
      super: `<path d="M14 34 C17 22 25 13 35 9 L41 21 C32 25 26 31 23 39 Z" fill="url(#${id}r)"/>
              <path d="M86 34 C83 22 75 13 65 9 L59 21 C68 25 74 31 77 39 Z" fill="url(#${id}r)"/>`,
      hyper: `<path d="M24 44 C24 30 27 20 33 12 L40 15 C36 23 34 32 34 44 Z" fill="url(#${id}y)"/>
              <path d="M76 44 C76 30 73 20 67 12 L60 15 C64 23 66 32 66 44 Z" fill="url(#${id}y)"/>
              <path d="M33 25 C44 22 56 22 67 25 L66 31 C55 28 45 28 34 31 Z" fill="url(#${id}y)"/>`,
      master: `<circle cx="25" cy="30" r="7.5" fill="url(#${id}p)" stroke="#2a0a45" stroke-width="1.5"/>
               <circle cx="75" cy="30" r="7.5" fill="url(#${id}p)" stroke="#2a0a45" stroke-width="1.5"/>
               <path d="M37 37 V18 L50 29 L63 18 V37" fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
               <path d="M37 37 V18 L50 29 L63 18 V37" fill="none" stroke="#e8d8ff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" transform="translate(-.6 -.6)"/>`,
    }[type] || '';
    return `<svg class="zb" viewBox="0 0 100 100" overflow="visible"><defs>
      <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.top[0]}"/><stop offset=".55" stop-color="${C.top[1]}"/><stop offset="1" stop-color="${C.top[2]}"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eceef3"/><stop offset="1" stop-color="#b9bfcc"/></linearGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#c8151d"/></linearGradient>
      <linearGradient id="${id}y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#ffcc1a"/><stop offset="1" stop-color="#d79a00"/></linearGradient>
      <radialGradient id="${id}p" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ffc2e6"/><stop offset=".6" stop-color="#ff5fb0"/><stop offset="1" stop-color="#c2257a"/></radialGradient>
      <radialGradient id="${id}s" cx=".36" cy=".32" r=".78"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
      <radialGradient id="${id}b" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e9ecf2"/><stop offset="1" stop-color="#aab1bf"/></radialGradient>
      <linearGradient id="${id}rim" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="${id}c"><circle cx="50" cy="50" r="46"/></clipPath>
    </defs>
    <g class="zb-body" clip-path="url(#${id}c)">
      <rect x="0" y="0" width="100" height="50" fill="url(#${id}t)"/>
      <rect x="0" y="50" width="100" height="50" fill="url(#${id}w)"/>
      ${marks}
      <rect x="0" y="45.5" width="100" height="9" fill="#141418"/>
      <rect x="0" y="45.5" width="100" height="2" fill="#3a3a44"/>
      <circle cx="50" cy="50" r="15.5" fill="#141418"/>
      <circle cx="50" cy="50" r="11.5" fill="url(#${id}b)"/>
      <circle cx="50" cy="50" r="6.2" fill="#fff" stroke="#c9ced8" stroke-width="1.6"/>
    </g>
    <g class="zb-light" pointer-events="none">
      <circle cx="50" cy="50" r="46" fill="url(#${id}s)"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#${id}rim)" stroke-width="3"/>
      <ellipse cx="35" cy="27" rx="15" ry="9" fill="#fff" opacity=".55" transform="rotate(-32 35 27)"/>
      <ellipse cx="31" cy="23" rx="5.5" ry="3.2" fill="#fff" opacity=".95" transform="rotate(-32 31 23)"/>
      <circle cx="68" cy="76" r="2.2" fill="#fff" opacity=".45"/>
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="#0b0b10" stroke-width="3"/>
    </g></svg>`;
  }

  /* ---------------- geometry: rounded rect, travelled clockwise from (r,0) ---------------- */
  function perimeter(W, H, r) {
    const segs = [], q = (Math.PI / 2) * r;
    const L = (x0, y0, x1, y1) => ({ len: Math.hypot(x1 - x0, y1 - y0), at: (u) => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u] });
    const A = (cx, cy, a0) => ({ len: q, at: (u) => { const a = a0 + u * Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; } });
    segs.push(L(r, 0, W - r, 0), A(W - r, r, -Math.PI / 2), L(W, r, W, H - r), A(W - r, H - r, 0), L(W - r, H, r, H), A(r, H - r, Math.PI / 2), L(0, H - r, 0, r), A(r, r, Math.PI));
    const total = segs.reduce((s, g) => s + g.len, 0);
    return { total, at(s) { s = ((s % total) + total) % total; for (const g of segs) { if (s <= g.len) return g.at(g.len ? s / g.len : 0); s -= g.len; } return [r, 0]; } };
  }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);   // easeInOutCubic

  /* ---------------- rolling animation ---------------- */
  function trace(o) {
    const { host, W, H, r, size, type, dur, color, rects } = o;
    const P = perimeter(W, H, r), R = size / 2;
    const css = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;margin:${-R}px 0 0 ${-R}px;will-change:transform;pointer-events:none`;
    // glow halo on the ground + ghost images (motion blur) + the ball
    const glow = document.createElement('div');
    glow.style.cssText = css + `;border-radius:50%;background:radial-gradient(circle, ${color}cc 0, ${color}55 40%, transparent 70%);transform-origin:center;filter:blur(2px)`;
    const ghosts = [0.32, 0.2, 0.1].map((a) => { const g = document.createElement('div'); g.style.cssText = css + `;opacity:${a};filter:blur(${(1 - a) * 3}px)`; g.innerHTML = svg(type); return g; });
    const ball = document.createElement('div');
    ball.style.cssText = css + `;filter:drop-shadow(0 ${size * 0.08}px ${size * 0.12}px rgba(0,0,0,.55)) drop-shadow(0 0 ${size * 0.25}px ${color})`;
    ball.innerHTML = svg(type);
    host.append(glow, ...ghosts, ball);
    const bodies = [ball, ...ghosts].map((el) => el.querySelector('.zb-body'));
    bodies.forEach((b) => { b.style.transformOrigin = '50px 50px'; });
    const hist = [];
    const t0 = performance.now(), D = dur * 1000;
    let lastSpark = 0;
    function place(el, x, y, rot, s, bodyEl) { el.style.transform = `translate(${x}px,${y}px) scale(${s})`; if (bodyEl) bodyEl.style.transform = `rotate(${rot}deg)`; }
    function spark(x, y) {
      const sp = document.createElement('i'), a = Math.random() * 6.28, d = R * (0.6 + Math.random() * 1.2), sz = 2 + Math.random() * 4;
      sp.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;margin:${-sz / 2}px;border-radius:50%;background:${Math.random() < .5 ? '#fff' : color};box-shadow:0 0 8px ${color};pointer-events:none;transition:transform .7s cubic-bezier(.1,.7,.3,1),opacity .7s ease`;
      host.appendChild(sp);
      requestAnimationFrame(() => { sp.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(.2)`; sp.style.opacity = '0'; });
      setTimeout(() => sp.remove(), 750);
    }
    function frame(now) {
      const t = Math.min(1, (now - t0) / D), s = ease(t) * P.total, [x, y] = P.at(s);
      const rot = (s / R) * (180 / Math.PI);                          // rolling without slipping
      const v = t < 1 ? Math.abs(ease(Math.min(1, t + 0.01)) - ease(t)) * 100 : 0;
      place(ball, x, y, rot, 1, bodies[0]);
      place(glow, x, y, 0, 1.6 + v * 0.6);
      hist.unshift([x, y, rot]); if (hist.length > 12) hist.pop();
      ghosts.forEach((g, i) => { const h = hist[Math.min(hist.length - 1, (i + 1) * 3)]; place(g, h[0], h[1], h[2], 1 - i * 0.06, bodies[i + 1]); g.style.visibility = v > 0.4 ? 'visible' : 'hidden'; });
      (rects || []).forEach((rc) => { rc.style.strokeDashoffset = String(1000 * (1 - s / P.total)); });
      if (now - lastSpark > 28 && t < 1) { spark(x, y); lastSpark = now; }
      if (t < 1) requestAnimationFrame(frame); else capture(x, y, rot);
    }
    function capture(x, y, rot) {                                  // hop, 3 wobbles, flash
      ghosts.forEach((g) => g.remove());
      const seq = [[0, 0, 1], [120, -R * 0.9, 1.08], [240, 0, 1], [330, 0, 1, -18], [450, 0, 1, 14], [570, 0, 1, -8], [680, 0, 1, 0]];
      const t1 = performance.now();
      (function hop(now) {
        const e = now - t1; let i = 0; while (i < seq.length - 1 && seq[i + 1][0] <= e) i++;
        const a = seq[i], b = seq[Math.min(i + 1, seq.length - 1)], u = b[0] > a[0] ? Math.min(1, (e - a[0]) / (b[0] - a[0])) : 1;
        const dy = a[1] + (b[1] - a[1]) * u, sc = a[2] + (b[2] - a[2]) * u, wob = (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * u;
        ball.style.transform = `translate(${x}px,${y + dy}px) scale(${sc}) rotate(${wob}deg)`;
        glow.style.transform = `translate(${x}px,${y}px) scale(${1.6 - dy / R * 0.3})`;
        if (e < 700) requestAnimationFrame(hop);
        else {
          for (let k = 0; k < 18; k++) spark(x, y);
          const fl = document.createElement('div');
          fl.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size * 3}px;height:${size * 3}px;margin:${-size * 1.5}px;border-radius:50%;background:radial-gradient(circle,#fff 0,${color} 35%,transparent 70%);pointer-events:none;transition:transform .45s ease-out,opacity .45s ease-out;transform:scale(.2)`;
          host.appendChild(fl);
          requestAnimationFrame(() => { fl.style.transform = 'scale(1.4)'; fl.style.opacity = '0'; });
          ball.style.transition = 'transform .3s ease-in, opacity .3s ease-in';
          ball.style.transform = `translate(${x}px,${y}px) scale(.2)`; ball.style.opacity = '0'; glow.style.transition = 'opacity .3s'; glow.style.opacity = '0';
          setTimeout(() => { fl.remove(); ball.remove(); glow.remove(); }, 600);
          if (o.onDone) o.onDone();
        }
      })(t1);
    }
    requestAnimationFrame(frame);
    return dur + 0.7;                                               // total duration (rolling + capture)
  }

  global.Z3Balls = { svg, trace, perimeter };
})(typeof window !== 'undefined' ? window : globalThis);
