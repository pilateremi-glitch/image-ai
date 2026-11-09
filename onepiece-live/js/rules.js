// Onglet RÈGLES DU JEU : édition des règles de chaque jeu et des familles (sans programmer).
const Rules = (() => {
  let gameId = 'A';
  const CAT_OPTIONS = { crew: 'Équipages', people: 'Peuples', org: 'Organisations', arc: 'Arcs / lieux', character: 'Personnages',
    rarity: 'Raretés', parallel: 'Cartes parallèles', manga: 'Manga Rare', card: 'Carte précise' };

  function renderForm() {
    $('#rulesGame').innerHTML = Object.keys(Games.GAME_TYPES).map(id =>
      `<option value="${id}" ${id === gameId ? 'selected' : ''}>${esc(App.games[id].name)}</option>`).join('');
    const r = App.games[gameId];
    const products = App.products();
    $('#rulesForm').innerHTML = `<div class="form-grid">
      <label>Nom du jeu<input data-f="name" value="${esc(r.name)}"></label>
      <label>Boosters par participation<input data-f="boosters" type="number" min="1" value="${r.boosters}"></label>
      <label>Familles par série : maximum <small class="muted">(0 = toutes)</small><input data-f="topN" type="number" min="0" max="20" value="${r.topN || 0}"></label>
      <label>Familles par série : minimum <small class="muted">(l'application choisit le nombre le plus équilibré)</small><input data-f="topMin" type="number" min="0" max="20" value="${r.topMin || r.topN || 0}"></label>
      <label class="span2">Description<textarea data-f="description" rows="2">${esc(r.description)}</textarea></label>
      <label class="span2">Critères de réussite <small class="muted">(laisser vide pour le texte automatique, recommandé : il reflète exactement les réglages)</small>
        <textarea data-f="successText" rows="2" placeholder="${esc(Games.successText(r, null))}">${esc(r.successText)}</textarea></label>
      <fieldset class="span2"><legend>Critères / familles autorisés dans ce jeu</legend>
        ${Object.entries(CAT_OPTIONS).map(([k, l]) => `<label class="inline"><input type="checkbox" data-cat="${k}" ${r.categories.includes(k) ? 'checked' : ''}> ${l}</label>`).join('')}
        <label class="inline"><input type="checkbox" data-f="otherTraits" ${r.otherTraits ? 'checked' : ''}> + autres traits présents dans le produit (non classés dans une famille)</label>
        <label class="inline"><input type="checkbox" data-f="noUmbrella" ${r.noUmbrella ? 'checked' : ''}> Exclure les regroupements de plusieurs équipages (Quatre Empereurs, Sept Grands Corsaires, Supernovas…)</label>
      </fieldset>
      <label>Validation<select data-f="validation"><option value="manual">Manuelle</option><option value="auto">Automatique</option></select></label>
      <label>Cartes parallèles / alternatives<select data-f="parallels"><option value="count">Comptent (variantes du même personnage)</option><option value="exclude">Ne comptent pas</option></select></label>
      <label>Réimpressions<select data-f="reprints"><option value="allow">Autorisées</option><option value="exclude">Exclues (seules les cartes de l'extension d'origine comptent)</option></select></label>
      <label>Réussites<select data-f="successes"><option value="single">Une seule réussite par tour</option><option value="multiple">Plusieurs réussites comptées</option></select></label>
      <label class="span2">Traitement des doublons<textarea data-f="duplicatesText" rows="2">${esc(r.duplicatesText)}</textarea></label>
      <label class="span2">Conditions d'annulation d'un tour <small class="muted">(séparez les motifs par des virgules : ils seront proposés au moment d'annuler)</small><textarea data-f="cancelText" rows="2">${esc(r.cancelText)}</textarea></label>
      <label class="span2">Extensions compatibles <small class="muted">(vide = toutes ; séparez par des virgules, ex. OP-13, OP-16, OP-17, EB-05)</small>
        <input data-f="products" list="rulesProducts" value="${esc((r.products || []).join(', '))}"><datalist id="rulesProducts">${products.map(p => `<option value="${esc(p.code)}">`).join('')}</datalist></label>
    </div>
    <h3>Aperçu affiché aux viewers</h3><div id="rulesPreview" class="rules-box"></div>`;
    ['validation', 'parallels', 'reprints', 'successes'].forEach(f => { $(`[data-f="${f}"]`).value = r[f]; });
    preview();
  }

  function preview() {
    const r = App.games[gameId];
    $('#rulesPreview').innerHTML = `<b>${esc(r.name)}</b><p>${esc(r.description)}</p><p><b>Pour gagner :</b> ${esc(r.successText || Games.successText(r, null))}</p>
      <p><b>Boosters :</b> ${r.boosters} · <b>Extensions :</b> ${esc((r.products || []).join(', ') || 'toutes')}</p>
      <p><b>Doublons :</b> ${esc(r.duplicatesText)}</p><p><b>Annulation :</b> ${esc(r.cancelText)}</p>`;
  }

  function onInput(e) {
    const r = App.games[gameId];
    const f = e.target.dataset.f, cat = e.target.dataset.cat;
    if (f) {
      let v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      if (f === 'boosters') v = Math.max(1, Number(v) || 1);
      if (f === 'topN' || f === 'topMin') v = Math.max(0, Math.min(20, Number(v) || 0));
      if (f === 'products') v = v.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      r[f] = v;
    }
    if (cat) r.categories = e.target.checked ? [...new Set([...r.categories, cat])] : r.categories.filter(c => c !== cat);
    App.saveSettings(); preview(); Live.recompute();
  }

  // ---------- Familles ----------
  function renderFamilies() {
    const counts = traitCounts();
    $('#familyTable').innerHTML = `<table class="tbl"><thead><tr><th>Actif</th><th>Nom affiché</th><th>Catégorie</th><th title="Famille qui regroupe des membres de plusieurs équipages">Regroupement</th><th>Traits exacts (séparés par des virgules)</th><th>Cartes</th><th></th></tr></thead><tbody>
      ${App.families.map((f, i) => {
        const n = f.traits.reduce((s, t) => s + (counts.get(t) || 0), 0);
        return `<tr data-i="${i}"><td><input type="checkbox" data-k="enabled" ${f.enabled !== false ? 'checked' : ''}></td>
        <td><input data-k="label" value="${esc(f.label)}"></td>
        <td><select data-k="category">${Object.entries(Games.CATEGORIES).map(([k, l]) => `<option value="${k}" ${f.category === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
        <td><input type="checkbox" data-k="umbrella" ${Games.isUmbrella(f) ? 'checked' : ''}></td>
        <td><input data-k="traits" value="${esc(f.traits.join(', '))}"></td>
        <td class="${n ? '' : 'warn-t'}">${n || '0 — trait absent de la base'}</td>
        <td><button class="link" data-del="${i}" title="Supprimer">🗑</button></td></tr>`;
      }).join('')}</tbody></table>`;
    renderTraits();
  }

  function traitCounts() {
    const m = new Map();
    App.cards.forEach(c => { if (c.language === 'en') c.affiliation.forEach(t => m.set(t, (m.get(t) || 0) + 1)); });
    if (!m.size) App.cards.forEach(c => App.traitsOf(c).forEach(t => m.set(t, (m.get(t) || 0) + 1)));
    return m;
  }

  function renderTraits() {
    const q = ($('#traitFilter').value || '').toLowerCase();
    const covered = new Map();
    App.families.forEach(f => f.traits.forEach(t => covered.set(t, f.label)));
    const list = [...traitCounts().entries()].filter(([t]) => !q || t.toLowerCase().includes(q)).sort((a, b) => b[1] - a[1]);
    $('#traitList').innerHTML = list.map(([t, n]) => `<span class="trait ${covered.has(t) ? 'covered' : ''}" title="${covered.has(t) ? 'Famille : ' + esc(covered.get(t)) : 'Non classé'}">${esc(t)} <small>${n}</small></span>`).join('')
      || '<p class="muted">Aucun trait.</p>';
  }

  function bind() {
    $('#rulesGame').onchange = e => { gameId = e.target.value; renderForm(); };
    $('#rulesForm').addEventListener('change', onInput);
    $('#rulesForm').addEventListener('input', e => { if (e.target.tagName !== 'SELECT' && e.target.type !== 'checkbox') onInput(e); });
    $('#rulesReset').onclick = async () => {
      if (!await App.confirm(`Rétablir les règles par défaut de « ${esc(App.games[gameId].name)} » ?`, 'Rétablir')) return;
      App.games[gameId] = Games.DEFAULT_RULES(gameId); await App.saveSettings(); renderForm(); Live.recompute();
    };
    $('#familyTable').addEventListener('change', e => {
      const tr = e.target.closest('tr[data-i]'); const k = e.target.dataset.k; if (!tr || !k) return;
      const f = App.families[Number(tr.dataset.i)];
      if (k === 'enabled') f.enabled = e.target.checked;
      else if (k === 'umbrella') f.umbrella = e.target.checked;
      else if (k === 'traits') f.traits = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
      else f[k] = e.target.value;
      App.saveSettings(); renderFamilies(); Live.recompute();
    });
    $('#familyTable').addEventListener('click', async e => {
      const i = e.target.dataset.del; if (i === undefined) return;
      if (!await App.confirm(`Supprimer la famille « ${esc(App.families[i].label)} » ?`, 'Supprimer')) return;
      App.families.splice(Number(i), 1); App.saveSettings(); renderFamilies(); Live.recompute();
    });
    $('#famAdd').onclick = () => {
      App.families.push({ id: 'fam-' + Date.now().toString(36), label: 'Nouvelle famille', category: 'crew', traits: [], enabled: true });
      App.saveSettings(); renderFamilies();
    };
    $('#famReset').onclick = async () => {
      if (!await App.confirm('Rétablir la liste de familles par défaut ? Vos modifications seront perdues.', 'Rétablir')) return;
      App.families = structuredClone(Games.DEFAULT_FAMILIES); await App.saveSettings(); renderFamilies(); Live.recompute();
    };
    $('#traitFilter').oninput = renderTraits;
  }

  bind();
  App.onChange(() => { renderForm(); renderFamilies(); });
  return {};
})();
