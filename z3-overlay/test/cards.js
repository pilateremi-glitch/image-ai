/* Cartes de test synthétiques pour valider la détection (fond + 5 types de cartes) */
(function (g) {
  function rng(seed) { let a = seed; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
  const CARD = { x: 240, y: 40, w: 160, h: 224 };
  function table(ctx, seed) {
    const R = rng(seed || 3);
    const gr = ctx.createLinearGradient(0, 0, 640, 360); gr.addColorStop(0, '#2b1d16'); gr.addColorStop(1, '#3a281c');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 640, 360);
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,220,180'},${R() * .06})`; ctx.fillRect(R() * 640, R() * 360, 2 + R() * 30, 1 + R() * 2); }
  }
  function sparkles(ctx, n, R) { for (let i = 0; i < n; i++) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(CARD.x + 14 + R() * (CARD.w - 28), CARD.y + 16 + R() * (CARD.h - 32), .8 + R() * 2.2, 0, 6.3); ctx.fill(); } }
  function rainbow(ctx, x, y, w, h, off) {
    const gr = ctx.createLinearGradient(x, y, x + w, y + h);
    ['#ff3b5c', '#ffb02e', '#f6ff3a', '#3dff8b', '#36d1ff', '#6a5cff', '#ff4fe1'].forEach((c, i) => gr.addColorStop(((i / 6) + off) % 1, c));
    ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  }
  function card(ctx, type, seed) {
    const R = rng(seed || 7), { x, y, w, h } = CARD;
    const pokemon = type.indexOf('pk') === 0;
    ctx.fillStyle = pokemon ? '#f2cf2f' : '#ececec'; ctx.fillRect(x, y, w, h);               // bordure
    const ix = x + 9, iy = y + 9, iw = w - 18, ih = h - 18;
    if (type.endsWith('common')) {
      ctx.fillStyle = '#d8d4c8'; ctx.fillRect(ix, iy, iw, ih);
      ctx.fillStyle = '#6aa65a'; ctx.fillRect(ix + 6, iy + 20, iw - 12, 80);                 // illustration
      ctx.fillStyle = '#c0533a'; ctx.beginPath(); ctx.arc(ix + iw / 2, iy + 62, 22, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#efeadf'; ctx.fillRect(ix + 4, iy + 108, iw - 8, ih - 114);          // texte pâle
      ctx.fillStyle = '#555'; for (let l = 0; l < 7; l++) ctx.fillRect(ix + 10, iy + 118 + l * 12, iw - 30 - R() * 30, 3);
    } else if (type.endsWith('holo')) {                                                     // rare holo : illus. holo seulement
      ctx.fillStyle = '#d8d4c8'; ctx.fillRect(ix, iy, iw, ih);
      rainbow(ctx, ix + 6, iy + 20, iw - 12, 80, R()); sparkles(ctx, 25, R);
      ctx.fillStyle = '#efeadf'; ctx.fillRect(ix + 4, iy + 108, iw - 8, ih - 114);
      ctx.fillStyle = '#555'; for (let l = 0; l < 7; l++) ctx.fillRect(ix + 10, iy + 118 + l * 12, iw - 30 - R() * 30, 3);
    } else if (type.endsWith('fullart')) {                                                  // full art arc-en-ciel
      rainbow(ctx, ix, iy, iw, ih, R()); sparkles(ctx, 90, R);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(ix + 4, iy + 150, iw - 8, 30);
    } else if (type.endsWith('gold')) {                                                     // secrète dorée
      const gr = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
      gr.addColorStop(0, '#fff2a8'); gr.addColorStop(.3, '#e8b923'); gr.addColorStop(.6, '#fbe27a'); gr.addColorStop(1, '#c9971a');
      ctx.fillStyle = gr; ctx.fillRect(ix, iy, iw, ih); sparkles(ctx, 120, R);
    }
  }
  g.Z3Test = { table, card, CARD };
})(window);
