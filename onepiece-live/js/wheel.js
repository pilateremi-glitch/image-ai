// Roue de la fortune sur <canvas>. Déterministe : spin(segments, targetIndex, turns) donne la même
// animation dans la fenêtre de contrôle et dans la fenêtre « écran » (OBS).
class Wheel {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.segments = [];
    this.angle = 0;
    this.spinning = false;
    this.onTick = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const size = Math.min(this.c.parentElement.clientWidth, 640);
    if (size < 80) return; // onglet masqué : on redessinera à l'affichage
    const dpr = window.devicePixelRatio || 1;
    this.c.width = size * dpr; this.c.height = size * dpr;
    this.c.style.width = size + 'px'; this.c.style.height = size + 'px';
    this.size = size; this.dpr = dpr;
    this.draw();
  }

  setSegments(segments) { this.segments = segments; this.draw(); }

  draw() {
    const { ctx, size, dpr } = this;
    if (!size) return;
    const r = size / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const segs = this.segments.length ? this.segments : [{ label: 'Choisissez un jeu et un booster', color: '#1d3557' }];
    const n = segs.length, step = (Math.PI * 2) / n;
    ctx.save();
    ctx.translate(r, r);
    // Cerclage « chapeau de paille » : couronne dorée tressée + bande rouge
    ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI * 2); ctx.fillStyle = '#e8b84a'; ctx.fill();
    ctx.save(); ctx.rotate(this.angle * 0.5);
    for (let k = 0; k < 72; k++) {
      ctx.rotate(Math.PI * 2 / 72);
      ctx.fillStyle = k % 2 ? 'rgba(122,78,20,.45)' : 'rgba(255,236,170,.35)';
      ctx.fillRect(r - 9, -3, 7, 6);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r - 10, 0, Math.PI * 2); ctx.fillStyle = '#c8102e'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r - 13, 0, Math.PI * 2); ctx.fillStyle = '#1a0d06'; ctx.fill();
    ctx.rotate(this.angle);
    segs.forEach((s, i) => {
      const a0 = -Math.PI / 2 + i * step - step / 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 14, a0, a0 + step); ctx.closePath();
      ctx.fillStyle = s.color || (i % 2 ? '#123a6b' : '#c8102e'); ctx.fill();
      ctx.strokeStyle = 'rgba(232,184,74,.8)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.save();
      ctx.rotate(a0 + step / 2);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff6dc'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 3;
      const fs = Math.max(10, Math.min(18, (r * step) / 2.2, 300 / Math.max(8, n)));
      ctx.font = `600 ${fs}px "Cinzel", Georgia, serif`;
      let label = s.label;
      const maxW = r - 60;
      while (ctx.measureText(label).width > maxW && label.length > 4) label = label.slice(0, -2);
      if (label !== s.label) label = label.slice(0, -1) + '…';
      ctx.fillText(label, r - 26, 0);
      ctx.restore();
    });
    ctx.restore();
    // Moyeu : Poké Ball qui tourne avec la roue
    ctx.save(); ctx.translate(r, r); ctx.rotate(this.angle);
    const hr = r * 0.14;
    ctx.beginPath(); ctx.arc(0, 0, hr, Math.PI, 0); ctx.fillStyle = '#e3262e'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, hr, 0, Math.PI); ctx.fillStyle = '#f4f4f4'; ctx.fill();
    ctx.fillStyle = '#111'; ctx.fillRect(-hr, -hr * 0.09, hr * 2, hr * 0.18);
    ctx.beginPath(); ctx.arc(0, 0, hr, 0, Math.PI * 2); ctx.lineWidth = Math.max(3, hr * 0.1); ctx.strokeStyle = '#111'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, hr * 0.32, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, hr * 0.2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(-hr * 0.4, -hr * 0.45, hr * 0.15, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fill();
    ctx.restore();
    // Pointeur en haut
    ctx.beginPath(); ctx.moveTo(r - 18, 2); ctx.lineTo(r + 18, 2); ctx.lineTo(r, 42); ctx.closePath();
    ctx.fillStyle = '#c8102e'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffe9a8'; ctx.stroke();
  }

  // Fait tourner la roue pour que le segment targetIndex s'arrête sous le pointeur.
  spin(targetIndex, { turns = 6, duration = 6500 } = {}) {
    if (!this.segments.length) return Promise.resolve();
    const n = this.segments.length, step = (Math.PI * 2) / n;
    const start = this.angle % (Math.PI * 2);
    const target = -targetIndex * step;
    let delta = target - start;
    delta = ((delta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const total = delta + turns * Math.PI * 2;
    const t0 = performance.now();
    this.spinning = true;
    let lastSeg = -1;
    return new Promise(resolve => {
      const frame = now => {
        const p = Math.min(1, (now - t0) / duration);
        const e = 1 - Math.pow(1 - p, 4);
        this.angle = start + total * e;
        const seg = Math.floor(((-this.angle / step) % n + n + 0.5) % n);
        if (seg !== lastSeg) { lastSeg = seg; this.onTick?.(); }
        this.draw();
        if (p < 1) requestAnimationFrame(frame);
        else { this.spinning = false; resolve(); }
      };
      requestAnimationFrame(frame);
    });
  }
}
