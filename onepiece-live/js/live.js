// Onglet LIVE : préparation de la partie, roue, tour verrouillé, validation, historique des tours.
const Live = (() => {
  // Couleurs du thème : veste rouge, ceinture verte, ciel, paille
  const CAT_COLORS = { crew: '#c8102e', people: '#2f7d4a', org: '#1f5fa8', arc: '#7b3fa0', trait: '#3d5a80',
    character: '#b8741a', rarity: '#b0174f', card: '#1f6f8b' };
  const CAT_LABELS = { ...Games.CATEGORIES, trait: 'Autres traits', character: 'Personnages', rarity: 'Raretés', card: 'Cartes' };
  const MAX_SEGMENTS = 24;
  const S = { gameId: 'A', products: [], lang: 'en', disabled: {}, turn: null, analysis: null, cfg: {}, objFilter: '',
    series: null, group: 'booster', seriesQuery: '' };
  let profiles = {}; // règles mémorisées par série { code: { gameId, lang, cfg } }
  let rec = null;    // recommandation automatique pour la série courante
  let wheel;

  const rulesFor = () => ({ ...App.games[S.gameId], ...S.cfg });
  const disabledKey = () => `${S.gameId}|${[...S.products].sort().join('+')}|${S.lang}`;
  const disabledSet = () => new Set(S.disabled[disabledKey()] || []);
  const langs = () => (S.lang === 'all' ? [] : [S.lang]);

  async function saveSession() {
    await DB.set('session', { gameId: S.gameId, products: S.products, lang: S.lang, disabled: S.disabled, turn: S.turn, cfg: S.cfg, series: S.series });
  }

  function activeObjectives() {
    if (!S.analysis) return [];
    const off = disabledSet();
    return S.analysis.objectives.filter(o => o.count > 0 && !off.has(o.id));
  }

  // ---------- Choix de la série (règles automatiques) ----------
  const GROUPS = { booster: 'Boosters OP', extra: 'Extra Boosters EB', premium: 'Premium PRB', starter: 'Starter Decks ST', other: 'Promos & autres' };
  const FAMILY_CATS = ['crew', 'people', 'org', 'arc'];
  const isSingleSeries = () => S.series && S.products.length === 1 && S.products[0] === S.series;
  const pendingTurn = () => S.turn && S.turn.status === 'pending';

  function langCounts(code) {
    const m = {};
    App.cards.forEach(c => { if ((c.products || []).includes(code)) m[c.language] = (m[c.language] || 0) + 1; });
    return m;
  }

  function computeRec() {
    rec = S.series ? Games.recommend({ allCards: App.cards, product: S.series, language: S.lang === 'all' ? '' : S.lang,
      families: App.families, games: App.games, traitsOf: App.traitsOf }) : null;
  }

  async function selectSeries(code) {
    if (pendingTurn()) return App.toast('Terminez ou annulez le tour en cours avant de changer de série.', 'error');
    const prof = profiles[code];
    const lc = langCounts(code);
    S.series = code; S.products = [code];
    if (prof?.lang && (lc[prof.lang] || prof.lang === 'all')) S.lang = prof.lang;
    else if (!lc[S.lang]) S.lang = Object.entries(lc).sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';
    computeRec();
    if (prof) { S.gameId = prof.gameId; S.cfg = { ...prof.cfg }; }
    else { S.gameId = rec.gameId; S.cfg = { ...rec.cfg }; }
    S.pickerOpen = false;
    renderPrep(); recompute(); renderSeries(); saveSession();
    App.toast(`${code} sélectionné : ${App.games[S.gameId].name} ${prof ? '(vos règles mémorisées)' : '(règles automatiques)'}.`, 'ok');
  }

  // Toute modification du jeu ou des réglages est mémorisée pour la série courante
  async function rememberProfile() {
    if (!isSingleSeries()) return;
    profiles[S.series] = { gameId: S.gameId, lang: S.lang, cfg: { ...S.cfg } };
    await DB.set('seriesProfiles', profiles);
    renderSeries();
  }

  async function resetProfile() {
    if (!S.series || pendingTurn()) return;
    delete profiles[S.series]; await DB.set('seriesProfiles', profiles);
    computeRec(); S.gameId = rec.gameId; S.cfg = { ...rec.cfg };
    renderPrep(); recompute(); renderSeries(); saveSession();
  }

  function renderSeries() {
    const cur = S.series && App.products().find(p => p.code === S.series);
    const open = !cur || S.pickerOpen;
    $('#seriesPicker').classList.toggle('hidden', !open);
    $('#seriesSearch').classList.toggle('hidden', !open);
    $('#seriesToggle').classList.toggle('hidden', !cur);
    $('#seriesToggle').textContent = open ? 'Fermer' : 'Changer de série';
    $('#seriesToggle').disabled = pendingTurn();
    if (open) renderPicker();
    if (!cur) { $('#seriesCurrent').innerHTML = ''; return; }
    const saved = !!profiles[S.series];
    const r = rulesFor();
    // Familles réellement présentes dans la série (indépendamment du jeu choisi)
    const fam = Games.analyze({ allCards: App.cards, products: [S.series], languages: langs(), families: App.families,
      rules: { ...r, categories: FAMILY_CATS, otherTraits: false, topN: 0 }, traitsOf: App.traitsOf }).objectives
      .filter(o => o.count > 0).sort((a, b) => b.count - a.count);
    const topN = Number(r.topN) || 0;
    const famById = new Map(App.families.map(f => [`fam:${f.id}`, f]));
    const umbrella = o => r.noUmbrella && famById.has(o.id) && Games.isUmbrella(famById.get(o.id));
    const topMin = Math.min(topN, Number(r.topMin) || topN);
    const top = topN ? Games.topFamilies(fam.filter(o => !umbrella(o)), topN, topMin) : [];
    const bal = Games.balanceOf(top);
    const balClass = !bal ? '' : bal.max <= 1.5 * bal.min ? 'good' : bal.max <= 2 * bal.min ? 'ok' : 'bad';
    const MODES = [{ label: 'Auto 5-6', max: 6, min: 5 }, { label: '5 familles', max: 5, min: 5 }, { label: '6 familles', max: 6, min: 6 }];
    const others = fam.filter(o => !top.includes(o));
    const absent = App.families.filter(f => f.enabled !== false && !fam.some(o => o.id === `fam:${f.id}`));
    $('#seriesCurrent').innerHTML = `<div class="series-now">
      <div><div class="big">${esc(cur.code)}</div><small class="muted">${esc(cur.name || '')}</small><br>
        <span class="badge">${esc(rec?.kindLabel || '')}</span></div>
      <div>
        <div><b>${esc(App.games[S.gameId].name)}</b> <span class="badge ${saved ? 'saved' : 'auto'}">${saved ? '★ Vos règles mémorisées pour cette série' : '⚙ Règles choisies automatiquement'}</span></div>
        <ul>
          <li>${r.boosters} booster(s) par participation · parallèles ${r.parallels === 'exclude' ? 'exclues' : 'comptées'} · réimpressions ${r.reprints === 'exclude' ? 'exclues' : 'autorisées'} · validation ${r.validation === 'auto' ? 'automatique' : 'manuelle'}</li>
          ${(rec?.warnings || []).map(x => `<li class="warn-t">⚠ ${esc(x)}</li>`).join('')}</ul>
        <details class="small"><summary class="muted">Pourquoi ce jeu ?</summary>${(rec?.reasons || []).map(x => esc(x)).join('<br>')}</details>
        ${topN ? `<div><b>Les ${top.length} familles de ${esc(cur.code)} sur la roue</b> <small class="muted">(choisies pour avoir des nombres de cartes proches)</small>
          <span class="topn">${MODES.map(m => `<button class="ghost small ${m.max === topN && m.min === topMin ? 'on' : ''}" data-topn="${m.max}" data-topmin="${m.min}" ${pendingTurn() ? 'disabled' : ''}>${m.label}</button>`).join('')}</span></div>
        <div class="fam-chips">${top.map(o => `<span class="fam-chip top">${esc(o.label)} <b>${o.count}</b></span>`).join('') || '<span class="muted">Aucune famille reconnue (traits absents des données).</span>'}</div>
        ${bal ? `<div class="balance ${balClass}">Équilibre : de <b>${bal.min}</b> à <b>${bal.max}</b> cartes par famille${balClass === 'bad'
          ? ' — les familles de cette série sont très inégales ; vous pouvez désactiver la plus grosse dans les réglages avancés.'
          : balClass === 'ok' ? ' — correct.' : ' — bien équilibré.'}</div>` : ''}
        ${others.length ? `<details class="small"><summary class="muted">${others.length} autre(s) famille(s) présente(s), non retenue(s)</summary><div class="fam-chips">${others.map(o => `<span class="fam-chip">${esc(o.label)} <b>${o.count}</b>${umbrella(o) ? ' <small>(regroupe plusieurs équipages)</small>' : ''}</span>`).join('')}</div></details>` : ''}`
        : `<div><b>Familles présentes dans ${esc(cur.code)}</b> (${fam.length}) :</div>
        <div class="fam-chips">${fam.map(o => `<span class="fam-chip">${esc(o.label)} <b>${o.count}</b></span>`).join('') || '<span class="muted">Aucune famille reconnue (traits absents des données).</span>'}</div>`}
        ${absent.length ? `<details class="small"><summary class="muted">${absent.length} famille(s) absente(s) de cette série — exclues automatiquement</summary>${absent.map(f => esc(f.label)).join(' · ')}</details>` : ''}
      </div>
      <div class="row" style="flex-direction:column;align-items:stretch">
        ${saved ? '<button id="seriesReset" class="ghost small">Revenir aux règles automatiques</button>' : ''}
        <button id="seriesEdit" class="ghost small">Réglages avancés</button>
      </div></div>`;
    if ($('#seriesReset')) $('#seriesReset').onclick = resetProfile;
    $$('#seriesCurrent [data-topn]').forEach(b => {
      b.onclick = () => { S.cfg.topN = Number(b.dataset.topn); S.cfg.topMin = Number(b.dataset.topmin); recompute(); renderSeries(); saveSession(); rememberProfile(); };
    });
    $('#seriesEdit').onclick = () => { $('#advanced').open = true; $('#advanced').scrollIntoView({ behavior: 'smooth' }); };
  }

  function renderPicker() {
    const all = App.products();
    const q = S.seriesQuery.trim().toLowerCase();
    const counts = {};
    all.forEach(p => { const k = Games.seriesKind(p.code); counts[k] = (counts[k] || 0) + 1; });
    $('#seriesGroups').innerHTML = Object.entries(GROUPS).filter(([k]) => counts[k]).map(([k, l]) =>
      `<button class="ghost small group-btn ${k === S.group && !q ? 'active' : ''}" data-group="${k}">${l} (${counts[k]})</button>`).join('');
    const list = all.filter(p => q ? (p.code + ' ' + (p.name || '')).toLowerCase().includes(q) : Games.seriesKind(p.code) === S.group);
    $('#seriesGrid').innerHTML = list.map(p => {
      const kind = Games.seriesKind(p.code);
      return `<button class="series-tile ${p.code === S.series ? 'active' : ''} ${kind === 'starter' ? 'fixed' : ''}" data-series="${esc(p.code)}">
        <span class="code">${esc(p.code)}</span><span class="name">${esc(p.name || Games.KIND_LABELS[kind])}</span>
        <span class="meta">${p.count} cartes · ${[...p.langs].map(l => l.toUpperCase()).join(' / ')}${profiles[p.code] ? ' · ★ règles mémorisées' : ''}</span></button>`;
    }).join('') || '<p class="muted">Aucune série trouvée. Importez ou synchronisez les nouvelles cartes dans Administration.</p>';
  }

  // ---------- Préparation ----------
  function renderPrep() {
    $('#gameSelect').innerHTML = Object.keys(Games.GAME_TYPES).map(id =>
      `<option value="${id}" ${id === S.gameId ? 'selected' : ''}>${esc(App.games[id].name)}</option>`).join('');
    $('#productList').innerHTML = App.products().map(p =>
      `<option value="${esc(p.code)}">${esc(p.name || '')} — ${p.count} cartes (${[...p.langs].join('/')})</option>`).join('');
    const ls = App.languages();
    $('#langSelect').innerHTML = ls.map(l => `<option value="${l}" ${l === S.lang ? 'selected' : ''}>${esc(Cards.LANG_LABELS[l] || l)}</option>`).join('')
      + `<option value="all" ${S.lang === 'all' ? 'selected' : ''}>Toutes les langues</option>`;
    $('#productChips').innerHTML = S.products.map(p => `<span class="chip">${esc(p)} <button data-rm="${esc(p)}" title="Retirer">✕</button></span>`).join('')
      || '<span class="muted small">Aucun produit sélectionné</span>';
    const locked = S.turn && S.turn.status === 'pending';
    ['#gameSelect', '#productSearch', '#langSelect', '#tBoosters', '#tValidation', '#tParallels', '#tReprints', '#tSuccesses', '#tPick']
      .forEach(s => { $(s).disabled = locked; });
    $$('#productChips button').forEach(b => { b.disabled = locked; });
    const r = rulesFor();
    $('#tBoosters').value = r.boosters; $('#tValidation').value = r.validation; $('#tParallels').value = r.parallels;
    $('#tReprints').value = r.reprints; $('#tSuccesses').value = r.successes;
  }

  function recompute() {
    if (!S.products.length) { S.analysis = null; return renderObjectives(); }
    S.analysis = Games.analyze({ allCards: App.cards, products: S.products, languages: langs(), families: App.families,
      rules: rulesFor(), traitsOf: App.traitsOf });
    renderObjectives();
  }

  function renderObjectives() {
    const box = $('#objectives'), cov = $('#coverage');
    const r = rulesFor();
    if (!S.analysis) {
      box.innerHTML = '<p class="muted">Choisissez la série du soir en haut de la page : le jeu et les règles se règlent automatiquement.</p>';
      cov.innerHTML = ''; $('#objCount').textContent = ''; updateWheel(); renderSummary(); return;
    }
    const a = S.analysis, off = disabledSet();
    const incompatible = r.products?.length && S.products.some(p => !r.products.includes(p));
    cov.innerHTML = `<div class="cov ${a.coverage.warnings.length || incompatible ? 'warn' : 'ok'}">
      <strong>${a.coverage.total}</strong> cartes connues pour ${esc(S.products.join(' + '))} (${esc(S.lang === 'all' ? 'toutes langues' : Cards.LANG_LABELS[S.lang] || S.lang)}).
      ${a.coverage.warnings.map(w => `<div>⚠ ${esc(w)}</div>`).join('')}
      ${incompatible ? `<div>⚠ Ce jeu est réservé aux extensions : ${esc(r.products.join(', '))}</div>` : ''}</div>`;
    const usable = a.objectives.filter(o => o.count > 0);
    const active = usable.filter(o => !off.has(o.id));
    $('#objCount').textContent = `${active.length} actifs / ${usable.length} compatibles`;
    const weights = r.weights || {};
    const showW = $('#showWeights').checked;
    const totalW = active.reduce((s, o) => s + Math.max(0, Number(weights[o.id] ?? 1)), 0) || 1;
    const q = S.objFilter.toLowerCase();
    const groups = {};
    const showAbsent = $('#showAbsent').checked;
    a.objectives.filter(o => (showAbsent || o.count > 0) && (!q || o.label.toLowerCase().includes(q))).forEach(o => { (groups[o.category] ||= []).push(o); });
    box.innerHTML = Object.entries(groups).map(([cat, list]) => `<div class="obj-group"><h4>${esc(CAT_LABELS[cat] || cat)}</h4>${list.slice(0, 400).map(o => {
      const dis = o.count === 0;
      const on = !dis && !off.has(o.id);
      const p = on ? Math.max(0, Number(weights[o.id] ?? 1)) / totalW : 0;
      return `<div class="obj ${dis ? 'zero' : ''} ${on ? 'on' : ''}" data-id="${esc(o.id)}">
        <label class="inline"><input type="checkbox" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''} data-toggle="${esc(o.id)}">
        <span>${esc(o.label)}</span></label>
        <span class="meta">${dis ? 'aucune carte connue' : `${o.count} carte${o.count > 1 ? 's' : ''}`}${o.pending ? ' · <b class="warn-t">non confirmé</b>' : ''}
        ${showW && !dis ? `<input type="number" min="0" step="0.5" value="${weights[o.id] ?? 1}" data-weight="${esc(o.id)}" title="Poids"> ${(p * 100).toFixed(1)}%` : ''}
        <button class="link" data-info="${esc(o.id)}" title="Voir les cartes concernées">👁</button></span></div>`;
    }).join('')}${list.length > 400 ? `<p class="muted">… ${list.length - 400} de plus (filtrez pour les voir)</p>` : ''}</div>`).join('')
      || '<p class="muted">Aucun objectif.</p>';
    updateWheel(); renderSummary();
  }

  function segmentsFor(list, winner) {
    let segs = list;
    if (list.length > MAX_SEGMENTS) {
      // Roue d'affichage : échantillon visible contenant l'objectif tiré (le tirage, lui, porte sur toute la liste)
      const others = list.filter(o => o !== winner);
      for (let i = others.length - 1; i > 0; i--) {
        const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [others[i], others[j]] = [others[j], others[i]];
      }
      segs = others.slice(0, MAX_SEGMENTS - (winner ? 1 : 0));
      if (winner) segs.splice(crypto.getRandomValues(new Uint32Array(1))[0] % (segs.length + 1), 0, winner);
    }
    return segs.map((o, i) => ({ id: o.id, label: o.label, color: i % 2 ? '#0f2a52' : (CAT_COLORS[o.category] || '#c8102e') }));
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, v + amt)));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function updateWheel() {
    if (wheel?.spinning) return;
    if (S.turn && S.turn.segments) { wheel.setSegments(S.turn.segments); return; }
    const segs = segmentsFor(activeObjectives(), null);
    wheel.setSegments(segs);
    App.broadcast({ type: 'segments', segments: segs });
    const n = activeObjectives().length;
    $('#drawInfo').textContent = n > MAX_SEGMENTS ? `${n} objectifs éligibles — la roue en affiche ${MAX_SEGMENTS}, le tirage se fait parmi les ${n}.` : n ? `${n} objectif(s) éligible(s).` : '';
    // Liste « objectif manuel »
    const sel = $('#tPick'), cur = sel.value;
    sel.innerHTML = '<option value="wheel">Tiré par la roue</option>' + activeObjectives().slice(0, 500)
      .map(o => `<option value="${esc(o.id)}">Choisi : ${esc(o.label)}</option>`).join('');
    if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
  }

  // ---------- Résumé des règles ----------
  function summaryHTML(rules, objective, products) {
    const crit = rules.successText?.trim() || Games.successText(rules, objective);
    return `<div class="summary">
      <h4>${esc(rules.name)}</h4>
      <p>${esc(rules.description)}</p>
      <ul>
        <li><b>Produit :</b> ${esc((products || []).join(' + ') || '—')}</li>
        <li><b>Boosters par participation :</b> ${esc(rules.boosters)}</li>
        <li><b>Pour gagner :</b> ${esc(crit)}</li>
        <li><b>Doublons :</b> ${esc(rules.duplicatesText)}</li>
        <li><b>Parallèles / alternatives :</b> ${rules.parallels === 'exclude' ? 'ne comptent pas' : 'comptent'} · <b>Réimpressions :</b> ${rules.reprints === 'exclude' ? 'exclues' : 'autorisées'}</li>
        <li><b>Validation :</b> ${rules.validation === 'auto' ? 'automatique (cartes saisies et vérifiées par l\'application)' : 'manuelle par l\'animateur'}</li>
        <li><b>Annulation :</b> ${esc(rules.cancelText)}</li>
        <li><b>Tirage :</b> ${rules.weights && Object.values(rules.weights).some(w => Number(w) !== 1) ? 'pondéré (probabilités affichées)' : 'équitable entre tous les objectifs éligibles'}. Aucune rareté n'est garantie dans un booster.</li>
      </ul></div>`;
  }
  function renderSummary() {
    const t = S.turn;
    const html = t ? summaryHTML(t.rules, t.objective, t.products) : summaryHTML(rulesFor(), null, S.products);
    $('#rulesSummary').innerHTML = html;
    App.broadcast({ type: 'summary', html });
  }

  // ---------- Tour ----------
  async function spin() {
    if (wheel.spinning) return;
    if (S.turn && S.turn.status === 'pending') return App.toast('Terminez ou annulez le tour en cours avant d\'en lancer un nouveau.', 'error');
    const pseudo = $('#pseudo').value.trim();
    if (!pseudo) return App.toast('Saisissez le pseudo du participant.', 'error');
    if (!S.products.length) return App.toast('Sélectionnez au moins un booster / produit.', 'error');
    const rules = rulesFor();
    if (rules.products?.length && S.products.some(p => !rules.products.includes(p))) return App.toast('Ce jeu n\'est pas compatible avec ce produit (voir Règles du jeu).', 'error');
    const pool = activeObjectives();
    if (!pool.length) return App.toast('Aucun objectif éligible : vérifiez la base ou activez des objectifs.', 'error');
    let pick, probability, how;
    const manual = $('#tPick').value;
    if (manual !== 'wheel') {
      pick = pool.find(o => o.id === manual); probability = null; how = 'manual';
      if (!pick) return App.toast('Objectif choisi introuvable.', 'error');
    } else {
      const d = Games.draw(pool, rules.weights);
      pick = d.objective; probability = d.probability; how = 'wheel';
    }
    const segments = segmentsFor(pool, pick);
    const target = segments.findIndex(s => s.id === pick.id);
    const { examples, ...objective } = pick;
    // Le tour est verrouillé AVANT l'animation : critères et règles sont figés dans l'objet du tour.
    S.turn = {
      id: Date.now().toString(36), date: new Date().toISOString(), pseudo, gameId: S.gameId, gameName: rules.name,
      products: S.products.slice(), languages: langs(), boosters: Number($('#tBoosters').value) || 1,
      rules: { ...rules, boosters: Number($('#tBoosters').value) || 1 }, objective, probability, eligible: pool.length, how,
      segments, status: 'pending', pulls: [], successes: 0, lockedAt: new Date().toISOString(),
    };
    await saveSession();
    renderPrep(); renderSeries(); renderTurn(true);
    wheel.setSegments(segments);
    App.broadcast({ type: 'spin', segments, target, turn: publicTurn() });
    if (how === 'wheel') await wheel.spin(target);
    else await wheel.spin(target, { turns: 2, duration: 2000 });
    renderTurn();
    App.broadcast({ type: 'turn', turn: publicTurn() });
    renderSummary();
  }

  function publicTurn() {
    const t = S.turn; if (!t) return null;
    return { pseudo: t.pseudo, objective: t.objective.label, products: t.products, boosters: t.boosters, status: t.status,
      successes: t.successes, gameName: t.gameName, probability: t.probability, eligible: t.eligible, how: t.how };
  }

  const STATUS = { pending: '⏳ En attente de validation', won: '🏆 GAGNÉ', lost: '❌ Perdu', cancelled: '🚫 Tour annulé' };

  function turnCards() {
    const t = S.turn;
    return Games.productCards(App.cards, t.products, t.languages);
  }
  const matches = c => Games.matchCard(c, S.turn.objective, S.turn.rules, App.traitsOf, S.turn.products);

  function renderTurn(spinning) {
    const t = S.turn, box = $('#turnCard');
    if (!t) { box.innerHTML = ''; return; }
    const pulls = t.pulls.map(uid => App.cards.find(c => c.uid === uid)).filter(Boolean);
    const ok = pulls.filter(matches);
    const pend = t.status === 'pending';
    box.innerHTML = `<div class="turn-box status-${t.status}">
      <div class="turn-head"><div><small>Participant</small><div class="pseudo">${esc(t.pseudo)}</div></div>
        <div class="status">${STATUS[t.status]}${t.status === 'won' && t.rules.successes === 'multiple' ? ` × ${t.successes}` : ''}</div></div>
      <div class="objective"><small>${esc(t.gameName)} · objectif ${t.how === 'manual' ? 'choisi par l\'animateur' : `tiré au sort parmi ${t.eligible}${t.probability ? ` (${(t.probability * 100).toFixed(1)} %)` : ''}`}</small>
        <div class="obj-label">${spinning ? '…' : esc(t.objective.label)}</div>
        ${t.objective.pending ? '<div class="warn-t">⚠ Couverture non confirmée pour cet objectif (cartes en attente de vérification)</div>' : ''}</div>
      <div class="facts"><span>📦 ${esc(t.products.join(' + '))}</span><span>🎴 ${t.boosters} booster(s)</span>
        <span>🔒 Verrouillé à ${new Date(t.lockedAt).toLocaleTimeString('fr-FR')}</span></div>
      ${spinning ? '' : `
      <div class="validation">
        ${pend ? `<div class="row"><input id="pullSearch" list="pullList" placeholder="${t.rules.validation === 'auto' ? 'Saisir une carte sortie (nom ou numéro)…' : 'Optionnel : noter les cartes sorties…'}">
          <datalist id="pullList"></datalist><button id="pullAdd" class="ghost">Ajouter</button></div>` : ''}
        <div class="pulls">${pulls.map((c, i) => `<span class="pull ${matches(c) ? 'yes' : 'no'}">${matches(c) ? '✅' : '▫️'} ${esc(c.name)} <small>${esc(c.print_id)} · ${esc(c.rarity)}</small>
          ${pend ? `<button data-rmpull="${i}">✕</button>` : ''}</span>`).join('') || '<span class="muted small">Aucune carte saisie.</span>'}</div>
        ${t.rules.validation === 'auto' && pulls.length ? `<p class="small">${ok.length} carte(s) valident l'objectif.</p>` : ''}
        ${pend ? `<div class="row">
          ${t.rules.validation === 'auto'
            ? `<button id="closeAuto" class="primary">Clore le tour (résultat automatique)</button>`
            : `<button id="markWon" class="success">🏆 Gagné</button><button id="markLost" class="danger">❌ Perdu</button>`}
          <button id="cancelTurn" class="ghost">🚫 Annuler le tour</button></div>`
          : `<div class="row">${t.cancelReason ? `<span class="muted">Motif : ${esc(t.cancelReason)}</span>` : ''}<button id="newTurn" class="ghost">➡ Tour suivant</button></div>`}
      </div>`}</div>`;
    if (spinning) return;
    if (pend) {
      const list = turnCards();
      $('#pullList').innerHTML = list.slice(0, 3000).map(c => `<option value="${esc(c.print_id)} — ${esc(c.name)} (${esc(c.rarity)}, ${esc(c.variant)})">`).join('');
      const add = () => {
        const v = $('#pullSearch').value.trim(); if (!v) return;
        const pid = v.split(' — ')[0].trim().toUpperCase();
        const c = list.find(x => x.print_id.toUpperCase() === pid) || list.find(x => x.name.toLowerCase() === v.toLowerCase());
        if (!c) return App.toast('Carte introuvable dans les cartes connues de ce produit.', 'error');
        t.pulls.push(c.uid); $('#pullSearch').value = ''; saveSession(); renderTurn();
        setTimeout(() => $('#pullSearch')?.focus(), 0);
      };
      $('#pullAdd').onclick = add;
      $('#pullSearch').onkeydown = e => { if (e.key === 'Enter') add(); };
      $$('[data-rmpull]').forEach(b => { b.onclick = () => { t.pulls.splice(Number(b.dataset.rmpull), 1); saveSession(); renderTurn(); }; });
      if ($('#closeAuto')) $('#closeAuto').onclick = () => finish(ok.length > 0 ? 'won' : 'lost', ok.length);
      if ($('#markWon')) $('#markWon').onclick = async () => {
        let n = 1;
        if (t.rules.successes === 'multiple') n = Math.max(1, Number(prompt('Nombre de réussites ?', String(Math.max(1, ok.length)))) || 1);
        finish('won', n);
      };
      if ($('#markLost')) $('#markLost').onclick = () => finish('lost', 0);
      $('#cancelTurn').onclick = cancelTurn;
    } else {
      $('#newTurn').onclick = async () => { S.turn = null; $('#pseudo').value = ''; await saveSession(); renderPrep(); renderTurn(); updateWheel(); renderSummary(); App.broadcast({ type: 'turn', turn: null }); $('#pseudo').focus(); };
    }
  }

  async function finish(status, successes) {
    const t = S.turn;
    t.status = status;
    t.successes = status === 'won' ? (t.rules.successes === 'multiple' ? successes : 1) : 0;
    t.closedAt = new Date().toISOString();
    await archive();
  }

  async function cancelTurn() {
    const reasons = (S.turn.rules.cancelText || '').split(/[,;:]\s*|\n/).map(s => s.trim()).filter(s => s.length > 3 && !/^tour annul/i.test(s));
    const b = App.modal(`<h3>Annuler le tour de ${esc(S.turn.pseudo)}</h3>
      <p class="muted">Conditions prévues : ${esc(S.turn.rules.cancelText)}</p>
      <select id="cReason">${reasons.map(r => `<option>${esc(r)}</option>`).join('')}<option value="">Autre motif…</option></select>
      <input id="cOther" placeholder="Motif (obligatoire si « Autre »)">
      <div class="row end"><button class="ghost" data-a="no">Retour</button><button class="danger" data-a="yes">Annuler le tour</button></div>`);
    b.onclick = async e => {
      const a = e.target.dataset.a; if (!a) return;
      if (a === 'no') return App.closeModal();
      const reason = $('#cOther').value.trim() || $('#cReason').value;
      if (!reason) return App.toast('Indiquez un motif.', 'error');
      App.closeModal(); b.onclick = null;
      S.turn.status = 'cancelled'; S.turn.cancelReason = reason; S.turn.closedAt = new Date().toISOString();
      await archive();
    };
  }

  async function archive() {
    const t = S.turn;
    const { segments, ...rec } = t;
    const i = App.turns.findIndex(x => x.id === t.id);
    if (i >= 0) App.turns[i] = rec; else App.turns.unshift(rec);
    await App.saveTurns(); await saveSession();
    renderTurn(); renderHistory(); renderPrep(); renderSeries();
    App.broadcast({ type: 'turn', turn: publicTurn() });
    if (t.status === 'won') confetti();
  }

  function renderHistory() {
    $('#turnHistory').innerHTML = App.turns.slice(0, 60).map(t => `<div class="hrow status-${t.status}">
      <b>${esc(t.pseudo)}</b> · ${esc(t.objective.label)}<br><small>${fmtDate(t.date)} · ${esc(t.products.join('+'))} · ${t.boosters} booster(s) · ${STATUS[t.status]}${t.cancelReason ? ' — ' + esc(t.cancelReason) : ''}</small></div>`).join('')
      || '<p class="muted small">Aucun tour joué.</p>';
  }

  function exportTurns() {
    const head = ['date', 'pseudo', 'jeu', 'produits', 'langues', 'boosters', 'objectif', 'mode', 'probabilite', 'statut', 'reussites', 'cartes_saisies', 'motif_annulation'];
    const rows = App.turns.map(t => [t.date, t.pseudo, t.gameName, t.products.join('|'), (t.languages || []).join('|'), t.boosters, t.objective.label,
      t.how === 'manual' ? 'choisi' : 'roue', t.probability ? (t.probability * 100).toFixed(2) + '%' : '', t.status, t.successes,
      (t.pulls || []).join('|'), t.cancelReason || '']);
    const csv = '﻿' + [head, ...rows].map(r => r.map(v => /[",;\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\r\n');
    App.download(`tours-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv');
  }

  function showObjective(id) {
    const o = S.analysis?.objectives.find(x => x.id === id); if (!o) return;
    const pool = S.analysis.cards.filter(c => o.kind === 'card' ? c.uid === o.uid : Games.matchCard(c, o, rulesFor(), App.traitsOf, S.products));
    App.modal(`<h3>${esc(o.label)}</h3>
      <p class="muted">${pool.length} carte(s) connue(s) du produit correspondent exactement à ce critère.${o.traits ? ` Traits pris en compte : ${o.traits.map(esc).join(', ')}.` : ''}</p>
      <div class="card-grid">${pool.slice(0, 120).map(cardThumb).join('')}</div>`);
  }

  function cardThumb(c) {
    return `<figure class="thumb"><img loading="lazy" src="${esc(c.image_url)}" alt="${esc(c.name)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'noimg',textContent:'Image indisponible'}))">
      <figcaption>${esc(c.name)}<br><small>${esc(c.print_id)} · ${esc(c.rarity)} · ${esc(c.variant)}</small></figcaption></figure>`;
  }

  function confetti() {
    const n = 80, root = document.body;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.className = 'confetti';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.background = ['#c9a227', '#e63946', '#f6e7c1', '#2a9d8f'][i % 4];
      s.style.animationDelay = Math.random() * 0.6 + 's';
      root.appendChild(s); setTimeout(() => s.remove(), 3500);
    }
  }

  // ---------- Événements ----------
  function bind() {
    wheel = new Wheel($('#wheel'));
    let ctx;
    wheel.onTick = () => {
      if (!$('#soundOn') || $('#soundOn').checked) {
        try {
          ctx ||= new AudioContext();
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.frequency.value = 900; g.gain.setValueAtTime(0.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
          o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.05);
        } catch (e) { /* audio indisponible */ }
      }
    };
    $('#gameSelect').onchange = e => { S.gameId = e.target.value; S.cfg = isSingleSeries() && rec ? { ...rec.cfg } : {}; renderPrep(); recompute(); saveSession(); rememberProfile(); };
    $('#langSelect').onchange = e => { S.lang = e.target.value; computeRec(); recompute(); saveSession(); rememberProfile(); };
    $('#seriesGroups').onclick = e => { const g = e.target.dataset.group; if (!g) return; S.group = g; S.seriesQuery = ''; $('#seriesSearch').value = ''; renderPicker(); };
    $('#seriesGrid').onclick = e => { const t = e.target.closest('[data-series]'); if (t) selectSeries(t.dataset.series); };
    $('#seriesSearch').oninput = e => { S.seriesQuery = e.target.value; renderPicker(); };
    $('#seriesToggle').onclick = () => { S.pickerOpen = !S.pickerOpen; if (S.series) S.group = Games.seriesKind(S.series); renderSeries(); };
    $('#showAbsent').onchange = renderObjectives;
    const addProduct = () => {
      const v = $('#productSearch').value.trim().toUpperCase(); if (!v) return;
      const known = App.products().find(p => p.code.toUpperCase() === v || p.code.replace('-', '') === v.replace('-', ''));
      if (!known) return App.toast(`Aucune carte connue pour « ${v} ». Importez ou synchronisez ce produit d'abord.`, 'error');
      if (!S.products.includes(known.code)) S.products.push(known.code);
      $('#productSearch').value = ''; renderPrep(); recompute(); renderSeries(); saveSession();
    };
    $('#productSearch').onkeydown = e => { if (e.key === 'Enter') addProduct(); };
    $('#productSearch').onchange = addProduct;
    $('#productChips').onclick = e => {
      const p = e.target.dataset.rm; if (!p) return;
      S.products = S.products.filter(x => x !== p); if (!S.products.length) S.series = null; renderPrep(); recompute(); renderSeries(); saveSession();
    };
    const cfg = (id, key, num) => { $(id).onchange = e => { S.cfg[key] = num ? Number(e.target.value) : e.target.value; recompute(); saveSession(); rememberProfile(); }; };
    cfg('#tBoosters', 'boosters', true); cfg('#tValidation', 'validation'); cfg('#tParallels', 'parallels');
    cfg('#tReprints', 'reprints'); cfg('#tSuccesses', 'successes');
    $('#objectives').addEventListener('change', e => {
      const id = e.target.dataset.toggle, w = e.target.dataset.weight;
      if (id) {
        const set = disabledSet();
        e.target.checked ? set.delete(id) : set.add(id);
        S.disabled[disabledKey()] = [...set]; saveSession(); renderObjectives();
      }
      if (w) {
        const g = App.games[S.gameId]; g.weights = { ...(g.weights || {}), [w]: Math.max(0, Number(e.target.value) || 0) };
        App.saveSettings(); renderObjectives();
      }
    });
    $('#objectives').addEventListener('click', e => { const id = e.target.dataset.info; if (id) showObjective(id); });
    $('#objAll').onclick = () => { S.disabled[disabledKey()] = []; saveSession(); renderObjectives(); };
    $('#objNone').onclick = () => { S.disabled[disabledKey()] = S.analysis ? S.analysis.objectives.map(o => o.id) : []; saveSession(); renderObjectives(); };
    $('#showWeights').onchange = renderObjectives;
    $('#objFilter').oninput = e => { S.objFilter = e.target.value; renderObjectives(); };
    $('#spinBtn').onclick = spin;
    $('#exportTurns').onclick = exportTurns;
    $('#pseudo').onkeydown = e => { if (e.key === 'Enter') spin(); };
    // La fenêtre écran demande l'état courant à son ouverture
    if (App.channel) App.channel.addEventListener('message', e => {
      if (e.data?.type === 'hello') {
        App.broadcast({ type: 'segments', segments: wheel.segments });
        App.broadcast({ type: 'turn', turn: publicTurn() });
        renderSummary();
      }
    });
  }

  bind();
  App.onChange(async () => {
    const sess = await DB.get('session');
    if (sess && !S._loaded) Object.assign(S, sess, { _loaded: true });
    S._loaded = true;
    // Les produits qui n'existent plus dans la base sont retirés
    const codes = new Set(App.products().map(p => p.code));
    S.products = S.products.filter(p => codes.has(p));
    if (!App.languages().includes(S.lang) && S.lang !== 'all') S.lang = App.languages()[0] || 'en';
    if (S.series && !codes.has(S.series)) S.series = null;
    profiles = (await DB.get('seriesProfiles')) || {};
    computeRec();
    renderPrep(); recompute(); renderSeries(); renderTurn(); renderHistory();
  });

  return { recompute: () => { renderPrep(); computeRec(); recompute(); renderSeries(); }, cardThumb };
})();
