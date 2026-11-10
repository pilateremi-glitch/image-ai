/* ==========================================================================
   Z3 — lecture des achats sur la page vendeur (Voggt, Whatnot, ou tout autre site)
   1) Le popup lance « Apprendre » → tu cliques sur un pseudo d'acheteur dans la liste.
   2) L'extension repère la liste et la ligne type, puis surveille les nouvelles lignes.
   3) Chaque nouvel achat → pseudo (+ quantité) envoyé à l'overlay via OBS WebSocket.
   Rien n'est cliqué ni modifié sur la page : lecture seule.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__z3ext) return;
  window.__z3ext = true;
  const HOST = location.hostname;
  let cfg = null, counts = null, timer = null;

  /* ---------- outils de repérage ---------- */
  const stable = (c) => /^[A-Za-z_-]{2,40}$/.test(c);                       // classes sans chiffres (pas les hash générés)
  const sig = (e) => e.tagName + '.' + [...e.classList].filter(stable).sort().join('.');
  function cssPath(el) {
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && e !== document.body && parts.length < 12; e = e.parentElement) {
      if (e.id && /^[A-Za-z][\w-]{1,40}$/.test(e.id) && !/\d{3,}/.test(e.id)) { parts.unshift('#' + CSS.escape(e.id)); break; }
      const cls = [...e.classList].filter(stable).slice(0, 3).map((c) => '.' + CSS.escape(c)).join('');
      const same = e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName) : [];
      parts.unshift(e.tagName.toLowerCase() + cls + (same.length > 1 ? `:nth-of-type(${same.indexOf(e) + 1})` : ''));
    }
    return parts.join(' > ');
  }
  function relPath(row, el) {                       // chemin ligne → élément (tag + rang parmi les frères de même tag)
    const p = [];
    for (let e = el; e && e !== row; e = e.parentElement) {
      const same = [...e.parentElement.children].filter((c) => c.tagName === e.tagName);
      p.unshift([e.tagName, same.indexOf(e)]);
    }
    return p;
  }
  function follow(row, path) {
    let e = row;
    for (const [tag, i] of path) { const same = [...e.children].filter((c) => c.tagName === tag); e = same[i]; if (!e) return null; }
    return e;
  }
  function learn(el) {
    // la « ligne » = premier ancêtre qui a au moins un frère de même forme (liste d'achats)
    let row = null;
    for (let a = el; a && a.parentElement && a !== document.body; a = a.parentElement) {
      const sib = [...a.parentElement.children].filter((c) => c !== a && sig(c) === sig(a));
      if (sib.length >= 1) { row = a; break; }
    }
    if (!row) row = (el.parentElement && el.parentElement.parentElement) || el.parentElement || el;   // un seul achat affiché pour l'instant
    return { container: cssPath(row.parentElement), rowSig: sig(row), path: relPath(row, el), sample: el.textContent.trim().slice(0, 40) };
  }
  function findRows(f) {
    let box = null;
    try { box = document.querySelector(f.container); } catch (e) { box = null; }
    let rows = box ? [...box.children].filter((c) => sig(c) === f.rowSig) : [];
    if (!rows.length) {                           // la page a été redessinée : on cherche la liste par la forme des lignes
      let best = null, n = 0;
      document.querySelectorAll('*').forEach((p) => { if (p.children.length) { const k = [...p.children].filter((c) => sig(c) === f.rowSig).length; if (k > n) { n = k; best = p; } } });
      if (best) rows = [...best.children].filter((c) => sig(c) === f.rowSig);
    }
    return rows;
  }
  const clean = (t) => String(t || '').replace(/\s+/g, ' ').trim().replace(/^@/, '').replace(/^(acheteur|buyer|par|by)\s*:?\s*/i, '').slice(0, 30);
  function qtyOf(t) {
    t = String(t || '');
    const tries = [/(?:^|[\s(])(?:x|×)\s*(\d{1,2})\b/i,                 // « x3 », « (×2) »
      /\b(\d{1,2})\s*(?:x|×)(?!\s*\d)/i,                                // « 3x », « 2 × » (pas « 09 x3 »)
      /(?:qt[ée]?|quantit[ée]|qty)\.?\s*:?\s*(\d{1,2})/i];               // « Qté : 2 »
    for (const re of tries) { const m = t.match(re); if (m) return Math.max(1, Math.min(36, +m[1] || 1)); }
    return 1;
  }

  /* ---------- surveillance ---------- */
  function read() {
    const out = [];
    if (!cfg || !cfg.name) return out;
    for (const row of findRows(cfg.name)) {
      const el = follow(row, cfg.name.path), name = clean(el && el.textContent);
      if (!name) continue;
      const q = cfg.qty ? qtyOf((follow(row, cfg.qty.path) || {}).textContent) : 1;
      out.push({ name, qty: q, key: name + '|' + row.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) });
    }
    return out;
  }
  function scan() {
    if (!cfg || !cfg.active || !cfg.name) return;
    const now = {};
    const items = read();
    items.forEach((it) => { now[it.key] = (now[it.key] || 0) + 1; });
    if (!counts) { counts = now; return; }      // 1er passage : les achats déjà affichés ne comptent pas
    for (const it of items) {
      if ((now[it.key] || 0) > (counts[it.key] || 0)) {
        counts[it.key] = (counts[it.key] || 0) + 1;
        chrome.runtime.sendMessage({ type: 'buyer', name: it.name, qty: it.qty, site: HOST });
      }
    }
    for (const k in now) counts[k] = Math.max(counts[k] || 0, now[k]);
  }
  const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(scan, 400); });
  function start() { counts = null; scan(); observer.disconnect(); observer.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  setInterval(scan, 2500);

  /* ---------- mode « apprendre » (clic sur un pseudo) ---------- */
  let picking = null, hover = null;
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;border:3px solid #ff3fd0;background:rgba(255,63,208,.15);box-shadow:0 0 18px #ff3fd0;display:none;border-radius:4px';
  const tip = document.createElement('div');
  tip.style.cssText = 'position:fixed;z-index:2147483647;left:50%;top:14px;transform:translateX(-50%);padding:10px 18px;background:#12031f;color:#fff;font:600 15px system-ui;border:2px solid #ff3fd0;border-radius:8px;display:none';
  document.documentElement.append(box, tip);
  function onMove(e) { hover = e.target; const r = hover.getBoundingClientRect(); Object.assign(box.style, { display: 'block', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); }
  function onClick(e) {
    e.preventDefault(); e.stopPropagation();
    const field = picking; stopPick();
    const f = learn(e.target);
    cfg = cfg || { active: true };
    cfg[field] = f; cfg.active = true;
    save(); start();
    chrome.runtime.sendMessage({ type: 'learned', field, sample: f.sample, rows: findRows(f).length, site: HOST });
  }
  function onKey(e) { if (e.key === 'Escape') stopPick(); }
  function startPick(field) {
    picking = field;
    tip.textContent = field === 'qty' ? '🎯 Clique sur la QUANTITÉ ou l’article d’un achat (Échap pour annuler)' : '🎯 Clique sur le PSEUDO d’un acheteur dans la liste des achats (Échap pour annuler)';
    tip.style.display = 'block';
    document.addEventListener('mousemove', onMove, true); document.addEventListener('click', onClick, true); document.addEventListener('keydown', onKey, true);
  }
  function stopPick() {
    picking = null; box.style.display = 'none'; tip.style.display = 'none';
    document.removeEventListener('mousemove', onMove, true); document.removeEventListener('click', onClick, true); document.removeEventListener('keydown', onKey, true);
  }

  /* ---------- réglages par site ---------- */
  function save() { chrome.storage.local.get('sites', (o) => { const s = o.sites || {}; s[HOST] = cfg; chrome.storage.local.set({ sites: s }); }); }
  chrome.storage.local.get('sites', (o) => { cfg = (o.sites || {})[HOST] || null; if (cfg && cfg.active) start(); });
  chrome.runtime.onMessage.addListener((m, sender, reply) => {
    if (m.type === 'pick') startPick(m.field);
    else if (m.type === 'toggle') { cfg = cfg || {}; cfg.active = !!m.active; save(); if (cfg.active) start(); }
    else if (m.type === 'forget') { cfg = null; counts = null; save(); }
    else if (m.type === 'preview') reply({ cfg, items: read().slice(-8) });
    return false;
  });
})();
