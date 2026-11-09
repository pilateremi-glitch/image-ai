// Onglet ADMINISTRATION : base de cartes, import, synchronisation, export / sauvegarde, historique.
const Admin = (() => {
  const PAGE = 50;
  const F = { q: '', language: '', set_code: '', type: '', rarity: '', status: '', variant: '', page: 0 };
  let pendingImport = null;   // résultat d'analyse en attente de confirmation
  let pendingSync = null;

  const opt = (v, l, cur) => `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`;

  // ================= BASE =================
  function renderBase() {
    const all = App.cards;
    const sets = [...new Set(all.map(c => c.set_code))].sort();
    const langs = App.languages();
    const byLang = langs.map(l => `${Cards.LANG_LABELS[l] || l} : <b>${all.filter(c => c.language === l).length}</b>`).join(' · ');
    $('#sub-base').innerHTML = `<div class="panel">
      <div class="row between"><h2>🗃 Base de cartes</h2>
        <div class="row"><button id="addCard" class="primary">➕ Ajouter une carte</button><button id="bulkSet" class="ghost">Modifier une extension (date / statut)</button></div></div>
      <p>${all.length} impressions enregistrées · ${byLang} · ${sets.length} extensions</p>
      <div class="filters">
        <input id="fQ" placeholder="Rechercher (nom, identifiant, trait)…" value="${esc(F.q)}">
        <select id="fLang">${opt('', 'Toutes langues', F.language)}${langs.map(l => opt(l, Cards.LANG_LABELS[l] || l, F.language)).join('')}</select>
        <select id="fSet">${opt('', 'Toutes extensions', F.set_code)}${sets.map(s => opt(s, s, F.set_code)).join('')}</select>
        <select id="fType">${opt('', 'Tous types', F.type)}${Cards.TYPES.map(t => opt(t, t, F.type)).join('')}</select>
        <select id="fRar">${opt('', 'Toutes raretés', F.rarity)}${[...new Set(all.map(c => c.rarity))].sort().map(r => opt(r, r, F.rarity)).join('')}</select>
        <select id="fVar">${opt('', 'Toutes versions', F.variant)}${opt('normal', 'Normales', F.variant)}${opt('parallel', 'Parallèles / alt', F.variant)}${opt('reprint', 'Réimpressions', F.variant)}</select>
        <select id="fStatus">${opt('', 'Tous statuts', F.status)}${Object.entries(Cards.STATUSES).map(([k, l]) => opt(k, l, F.status)).join('')}</select>
      </div>
      <div id="baseTable"></div></div>`;
    const bindF = (id, k) => { $(id).oninput = e => { F[k] = e.target.value; F.page = 0; renderTable(); }; };
    bindF('#fQ', 'q'); bindF('#fLang', 'language'); bindF('#fSet', 'set_code'); bindF('#fType', 'type');
    bindF('#fRar', 'rarity'); bindF('#fStatus', 'status'); bindF('#fVar', 'variant');
    $('#addCard').onclick = () => editCard(null);
    $('#bulkSet').onclick = bulkSet;
    renderTable();
  }

  function filtered() {
    const q = F.q.trim().toLowerCase();
    return App.cards.filter(c => (!F.language || c.language === F.language) && (!F.set_code || c.set_code === F.set_code)
      && (!F.type || c.type === F.type) && (!F.rarity || c.rarity === F.rarity) && (!F.status || c.status === F.status)
      && (!F.variant || (F.variant === 'parallel' ? Games.isParallel(c) : F.variant === 'reprint' ? /_r\d+$/.test(c.print_id) : c.variant === 'Normale'))
      && (!q || c.name.toLowerCase().includes(q) || c.print_id.toLowerCase().includes(q) || c.affiliation.some(t => t.toLowerCase().includes(q))));
  }

  function renderTable() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    F.page = Math.min(F.page, pages - 1);
    const rows = list.slice(F.page * PAGE, F.page * PAGE + PAGE);
    $('#baseTable').innerHTML = `<p class="muted">${list.length} résultat(s)</p>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Identifiant</th><th>Nom</th><th>Extension</th><th>Rareté</th><th>Type</th><th>Couleurs</th><th>Affiliation</th><th>Version</th><th>Produits</th><th>Langue</th><th>Statut</th><th></th></tr></thead><tbody>
      ${rows.map(c => `<tr><td>${c.image_url ? `<img class="mini" loading="lazy" src="${esc(c.image_url)}" alt="" onerror="this.style.visibility='hidden'">` : ''}</td>
        <td><code>${esc(c.print_id)}</code></td><td>${esc(c.name)}</td><td>${esc(c.set_code)}<br><small class="muted">${esc(c.set_name)}</small></td>
        <td>${esc(c.rarity)}</td><td>${esc(c.type)}</td><td>${esc(c.colors.map(x => Cards.COLOR_LABELS[x] || x).join(', '))}</td>
        <td><small>${esc(c.affiliation.join(' / '))}</small></td><td><small>${esc(c.variant)}</small></td><td><small>${esc((c.products || []).join(', '))}</small></td>
        <td>${esc(c.language)}</td><td><span class="badge st-${c.status}">${esc(Cards.STATUSES[c.status] || c.status)}</span></td>
        <td class="nowrap"><button class="link" data-edit="${esc(c.uid)}" title="Modifier">✏️</button><button class="link" data-del="${esc(c.uid)}" title="Supprimer">🗑</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="row center"><button class="ghost" id="pPrev" ${F.page ? '' : 'disabled'}>◀</button> Page ${F.page + 1} / ${pages} <button class="ghost" id="pNext" ${F.page < pages - 1 ? '' : 'disabled'}>▶</button></div>`;
    $('#pPrev').onclick = () => { F.page--; renderTable(); };
    $('#pNext').onclick = () => { F.page++; renderTable(); };
    $$('[data-edit]').forEach(b => { b.onclick = () => editCard(App.cards.find(c => c.uid === b.dataset.edit)); });
    $$('#baseTable [data-del]').forEach(b => { b.onclick = () => deleteCard(b.dataset.del); });
  }

  function editCard(card) {
    const c = card || { card_id: '', print_id: '', name: '', set_code: '', set_name: '', number: '', rarity: '', type: 'Character', colors: [],
      affiliation: [], variant: 'Normale', image_url: '', release_date: '', status: 'pending', language: 'en', products: [] };
    const field = (k, label, extra = '') => `<label>${label}<input data-k="${k}" value="${esc(Array.isArray(c[k]) ? c[k].join(' | ') : c[k] ?? '')}" ${extra}></label>`;
    const b = App.modal(`<h3>${card ? 'Modifier' : 'Ajouter'} une carte</h3>
      <div class="form-grid">
        ${field('card_id', 'Identifiant officiel *', 'placeholder="OP17-001"')}
        ${field('print_id', 'Identifiant d\'impression', 'placeholder="OP17-001_p1 (vide = identique)"')}
        ${field('name', 'Nom *')}
        ${field('set_code', 'Code extension', 'placeholder="OP-17"')}
        ${field('set_name', 'Nom de la série')}
        ${field('number', 'Numéro')}
        <label>Rareté<input data-k="rarity" list="rarList" value="${esc(c.rarity)}"><datalist id="rarList">${Cards.RARITIES.map(r => `<option value="${r}">${esc(Cards.RARITY_LABELS[r])}</option>`).join('')}</datalist></label>
        <label>Type<select data-k="type">${Cards.TYPES.map(t => opt(t, t, c.type)).join('')}</select></label>
        ${field('colors', 'Couleur(s) (séparées par |)', 'placeholder="Red | Green"')}
        ${field('affiliation', 'Équipage / famille / traits (séparés par |)')}
        <label>Version<input data-k="variant" list="varList" value="${esc(c.variant)}"><datalist id="varList"><option value="Normale"><option value="Parallèle / Alt-art 1"><option value="Manga Rare"><option value="Réimpression 1"></datalist></label>
        ${field('products', 'Produits où elle est imprimée (séparés par |)', 'placeholder="OP-17 | PRB-02"')}
        ${field('image_url', 'URL de l\'image')}
        ${field('release_date', 'Date de sortie', 'type="date"')}
        <label>Statut<select data-k="status">${Object.entries(Cards.STATUSES).map(([k, l]) => opt(k, l, c.status)).join('')}</select></label>
        <label>Langue<input data-k="language" list="langList" value="${esc(c.language)}"><datalist id="langList">${Object.entries(Cards.LANG_LABELS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</datalist></label>
      </div>
      ${c.image_url ? `<img class="preview" src="${esc(c.image_url)}" alt="">` : ''}
      <div class="row end"><button class="ghost" data-a="no">Annuler</button><button class="primary" data-a="save">Enregistrer</button></div>`);
    b.onclick = async e => {
      const a = e.target.dataset.a; if (!a) return;
      if (a === 'no') return App.closeModal();
      const raw = {};
      $$('[data-k]', b).forEach(i => { raw[i.dataset.k] = i.value; });
      const { card: n, error } = Cards.normalize(raw, { source: card?.source || 'manuel' });
      if (error) return App.toast(error, 'error');
      if (card && card.uid !== n.uid && App.cards.some(x => x.uid === n.uid)) return App.toast(`Une carte ${n.uid} existe déjà (doublon).`, 'error');
      if (!card && App.cards.some(x => x.uid === n.uid)) return App.toast(`Doublon : ${n.uid} existe déjà. Modifiez-la plutôt.`, 'error');
      n.updated_at = new Date().toISOString();
      if (card && card.uid !== n.uid) await DB.deleteCards([card.uid]);
      await DB.putCards([n]);
      await DB.log(card ? 'Modification manuelle' : 'Ajout manuel', n.uid, card ? { updated: 1 } : { added: 1 });
      b.onclick = null; App.closeModal(); App.toast('Carte enregistrée.', 'ok');
      await App.reload();
    };
  }

  async function deleteCard(uid) {
    const c = App.cards.find(x => x.uid === uid); if (!c) return;
    if (!await App.confirm(`Supprimer définitivement <b>${esc(c.name)}</b> (${esc(c.uid)}) ?`, 'Supprimer')) return;
    await DB.deleteCards([uid]); await DB.log('Suppression', uid, { deleted: 1 });
    App.toast('Carte supprimée.', 'ok'); await App.reload();
  }

  function bulkSet() {
    const sets = [...new Set(App.cards.map(c => c.set_code))].sort();
    const b = App.modal(`<h3>Modifier toute une extension</h3>
      <p class="muted">Applique une date de sortie, un statut et/ou un nom de série à toutes les cartes d'une extension (et d'une langue).</p>
      <div class="form-grid"><label>Extension<select id="bSet">${sets.map(s => opt(s, s, '')).join('')}</select></label>
      <label>Langue<select id="bLang">${opt('', 'Toutes', '')}${App.languages().map(l => opt(l, l, '')).join('')}</select></label>
      <label>Nom de la série (vide = inchangé)<input id="bName"></label>
      <label>Date de sortie (vide = inchangée)<input id="bDate" type="date"></label>
      <label>Statut<select id="bStatus">${opt('', 'Inchangé', '')}${Object.entries(Cards.STATUSES).map(([k, l]) => opt(k, l, '')).join('')}</select></label></div>
      <div class="row end"><button class="ghost" data-a="no">Annuler</button><button class="primary" data-a="ok">Appliquer</button></div>`);
    b.onclick = async e => {
      const a = e.target.dataset.a; if (!a) return;
      if (a === 'no') return App.closeModal();
      const set = $('#bSet').value, lang = $('#bLang').value, name = $('#bName').value.trim(), date = $('#bDate').value, st = $('#bStatus').value;
      const list = App.cards.filter(c => c.set_code === set && (!lang || c.language === lang));
      list.forEach(c => { if (name) c.set_name = name; if (date) c.release_date = date; if (st) c.status = st; c.updated_at = new Date().toISOString(); });
      await DB.putCards(list); await DB.log('Modification d\'extension', `${set} ${lang || 'toutes langues'}`, { updated: list.length });
      b.onclick = null; App.closeModal(); App.toast(`${list.length} cartes mises à jour.`, 'ok'); await App.reload();
    };
  }

  // ================= IMPORT =================
  function renderImport() {
    $('#sub-import').innerHTML = `<div class="panel"><h2>📥 IMPORTER DES CARTES</h2>
      <p class="muted">Fichiers CSV (séparateur , ou ;) ou JSON. Les en-têtes français ou anglais sont reconnus (nom/name, extension/set_code, rareté/rarity…).
      Les listes multiples (couleurs, affiliations, produits) sont séparées par « | ».
      <button class="link" id="tplCsv">Télécharger un modèle CSV</button> · <button class="link" id="tplJson">modèle JSON</button></p>
      <div class="form-grid">
        <label>Fichier<input type="file" id="impFile" accept=".csv,.json,.txt,.tsv"></label>
        <label>Mode d'import<select id="impMode">
          <option value="merge">Ajouter / mettre à jour (recommandé)</option>
          <option value="set">Une seule extension : remplacer uniquement cette extension</option>
          <option value="replace">Liste complète : remplacer toute la base</option></select></label>
        <label>Langue par défaut (si absente du fichier)<select id="impLang">${Object.entries(Cards.LANG_LABELS).map(([k, l]) => opt(k, l, 'en')).join('')}</select></label>
        <label>Statut par défaut<select id="impStatus">${Object.entries(Cards.STATUSES).map(([k, l]) => opt(k, l, 'published')).join('')}</select></label>
        <label>Code extension par défaut (ex. OP-19)<input id="impSet" placeholder="déduit de l'identifiant si vide"></label>
        <label>Nom de série par défaut<input id="impSetName"></label>
      </div>
      <button id="impAnalyze" class="primary">🔍 Prévisualiser l'import</button>
      <div id="impPreview"></div></div>`;
    $('#tplCsv').onclick = () => App.download('modele-cartes.csv', Cards.toCSV([sampleCard()]), 'text/csv');
    $('#tplJson').onclick = () => App.download('modele-cartes.json', JSON.stringify({ cards: [sampleCard()] }, null, 2), 'application/json');
    $('#impAnalyze').onclick = analyzeImport;
  }

  const sampleCard = () => ({ uid: '', card_id: 'OP19-001', print_id: 'OP19-001', name: 'Nom du personnage', set_code: 'OP-19', set_name: 'Nom de la série',
    number: '001', rarity: 'L', type: 'Leader', colors: ['Red'], affiliation: ['Straw Hat Crew'], variant: 'Normale', image_url: 'https://…',
    release_date: '2026-11-01', status: 'announced', language: 'en', products: ['OP-19'], cost: '', power: 5000, counter: '', source: 'manuel' });

  async function analyzeImport() {
    const file = $('#impFile').files[0];
    if (!file) return App.toast('Choisissez un fichier.', 'error');
    let rows;
    try {
      const text = await file.text();
      rows = /\.json$/i.test(file.name) || /^\s*[[{]/.test(text) ? Cards.rowsFromJSON(JSON.parse(text)) : Cards.parseCSV(text);
    } catch (e) { return App.toast('Fichier illisible : ' + e.message, 'error'); }
    const defaults = { language: $('#impLang').value, status: $('#impStatus').value, set_code: $('#impSet').value.trim().toUpperCase(),
      set_name: $('#impSetName').value.trim(), source: 'import:' + file.name };
    const result = Cards.analyze(rows, App.cards, defaults);
    pendingImport = { result, mode: $('#impMode').value, file: file.name };
    showPreview($('#impPreview'), result, pendingImport.mode, 'import');
  }

  // Aperçu commun à l'import et à la synchronisation
  function showPreview(box, result, mode, kind) {
    const cnt = s => result.filter(r => r.status === s).length;
    const LABEL = { new: 'Nouvelles', update: 'Modifiées', same: 'Identiques (ignorées)', dup_file: 'Doublons dans le fichier', dup_probable: 'Doublons probables', error: 'Erreurs' };
    const sets = [...new Set(result.filter(r => r.card).map(r => r.card.set_code))];
    let warn = '';
    if (mode === 'set') warn = `<p class="warn-t">Mode « une extension » : les cartes des extensions ${esc(sets.join(', '))} absentes du fichier seront supprimées (pour les langues présentes dans le fichier).</p>`;
    if (mode === 'replace') warn = `<p class="warn-t">Mode « remplacer toute la base » : toutes les cartes actuelles (${App.cards.length}) seront remplacées par le fichier. Une sauvegarde automatique est faite avant.</p>`;
    box.innerHTML = `<h3>Prévisualisation — ${result.length} ligne(s)</h3>
      <div class="stats">${Object.entries(LABEL).map(([k, l]) => `<button class="stat s-${k}" data-filter="${k}"><b>${cnt(k)}</b><span>${l}</span></button>`).join('')}</div>
      ${warn}
      <div class="row"><label class="inline"><input type="checkbox" id="optUpd" checked> Appliquer les modifications</label>
        <label class="inline"><input type="checkbox" id="optDup"> Importer quand même les doublons probables</label>
        <button id="doApply" class="primary">✅ Confirmer ${kind === 'sync' ? 'la synchronisation' : 'l\'import'}</button></div>
      <div id="prevRows"></div>`;
    const showRows = f => {
      const list = result.filter(r => !f || r.status === f).slice(0, 300);
      $('#prevRows', box).innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ligne</th><th>Statut</th><th>Identifiant</th><th>Nom</th><th>Extension</th><th>Rareté</th><th>Version</th><th>Langue</th><th>Détail</th></tr></thead><tbody>
        ${list.map(r => `<tr class="r-${r.status}"><td>${r.line}</td><td>${LABEL[r.status]}</td><td><code>${esc(r.card?.print_id || '')}</code></td><td>${esc(r.card?.name || '')}</td>
        <td>${esc(r.card?.set_code || '')}</td><td>${esc(r.card?.rarity || '')}</td><td>${esc(r.card?.variant || '')}</td><td>${esc(r.card?.language || '')}</td><td><small>${esc(r.message)}</small></td></tr>`).join('')}
        </tbody></table></div>${result.filter(r => !f || r.status === f).length > 300 ? '<p class="muted">Affichage limité à 300 lignes.</p>' : ''}`;
    };
    showRows(null);
    $$('[data-filter]', box).forEach(b => { b.onclick = () => showRows(b.dataset.filter); });
    $('#doApply', box).onclick = () => apply(result, mode, kind, $('#optUpd', box).checked, $('#optDup', box).checked, box);
  }

  async function apply(result, mode, kind, withUpdates, withDups, box) {
    const label = kind === 'sync' ? 'Synchronisation' : 'Import';
    const source = kind === 'sync' ? pendingSync?.sourceLabel : pendingImport?.file;
    const toAdd = result.filter(r => r.status === 'new' || (withDups && r.status === 'dup_probable')).map(r => r.card);
    const toUpd = withUpdates ? result.filter(r => r.status === 'update').map(r => r.card) : [];
    const counts = { added: toAdd.length, updated: toUpd.length, deleted: 0,
      ignored: result.filter(r => ['same', 'dup_file'].includes(r.status) || (!withDups && r.status === 'dup_probable') || (!withUpdates && r.status === 'update')).length,
      errors: result.filter(r => r.status === 'error').length };
    App.loading(`${label} en cours…`);
    try {
      const now = new Date().toISOString();
      if (mode !== 'merge') await DB.snapshot(`Avant ${label.toLowerCase()} (${mode === 'replace' ? 'remplacement complet' : 'remplacement d\'extension'})`);
      if (mode === 'replace') {
        const keep = new Set(result.filter(r => r.card).map(r => r.card.uid));
        const del = App.cards.filter(c => !keep.has(c.uid)).map(c => c.uid);
        await DB.deleteCards(del); counts.deleted = del.length;
      } else if (mode === 'set') {
        const cards = result.filter(r => r.card).map(r => r.card);
        const sets = new Set(cards.map(c => c.set_code)), langs = new Set(cards.map(c => c.language)), keep = new Set(cards.map(c => c.uid));
        const del = App.cards.filter(c => sets.has(c.set_code) && langs.has(c.language) && !keep.has(c.uid)).map(c => c.uid);
        await DB.deleteCards(del); counts.deleted = del.length;
      }
      await DB.putCards([...toAdd, ...toUpd].map(c => ({ ...c, updated_at: now })));
      await DB.log(label, `${source || ''} — mode ${mode}`, counts);
      await App.reload();
      box.innerHTML = reportHTML(label, counts, result);
      App.toast(`${label} terminé(e) : ${counts.added} ajoutée(s), ${counts.updated} modifiée(s).`, 'ok');
    } catch (e) {
      await DB.log(`${label} échoué(e)`, e.message, counts);
      App.toast(`${label} échoué(e) : ${e.message}`, 'error');
    } finally { App.loading(false); }
  }

  function reportHTML(label, c, result) {
    const errs = result.filter(r => r.status === 'error');
    return `<div class="report"><h3>Rapport — ${esc(label)}</h3>
      <div class="stats"><div class="stat s-new"><b>${c.added}</b><span>ajoutées</span></div><div class="stat s-update"><b>${c.updated}</b><span>modifiées</span></div>
      <div class="stat s-same"><b>${c.ignored}</b><span>ignorées</span></div><div class="stat s-error"><b>${c.errors}</b><span>en erreur</span></div>
      ${c.deleted ? `<div class="stat s-error"><b>${c.deleted}</b><span>supprimées</span></div>` : ''}</div>
      ${errs.length ? `<details><summary>Voir les erreurs</summary><ul>${errs.slice(0, 200).map(r => `<li>Ligne ${r.line} : ${esc(r.message)}</li>`).join('')}</ul></details>` : ''}
      <p class="muted">Les objectifs des jeux ont été recalculés automatiquement avec la base mise à jour.</p></div>`;
  }

  // ================= SYNCHRONISATION =================
  function renderSync() {
    $('#sub-sync').innerHTML = `<div class="panel"><h2>🔄 SYNCHRONISER LES NOUVELLES CARTES</h2>
      <p class="muted">La synchronisation est toujours lancée manuellement. Rien n'est enregistré avant votre confirmation, et l'application indique clairement si la source est indisponible ou si aucune nouvelle carte n'a été trouvée.</p>
      <div class="form-grid">
        <label>Source<select id="syncSource">${Sync.SOURCES.map(s => opt(s.id, s.label, 'punk-records')).join('')}</select></label>
        <label id="syncUrlL" class="hidden">URL<input id="syncUrl" placeholder="https://…/cartes.json"></label>
        <fieldset id="syncLangs"><legend>Langues</legend>${Object.entries(Cards.LANG_LABELS).map(([k, l]) => `<label class="inline"><input type="checkbox" value="${k}" ${['en', 'jp'].includes(k) ? 'checked' : ''}> ${l}</label>`).join('')}</fieldset>
        <label>Limiter à certaines extensions (optionnel)<input id="syncSets" placeholder="ex. OP-18, OP-19, EB-06 (vide = tout)"></label>
      </div>
      <p id="syncDesc" class="muted small"></p>
      <button id="syncGo" class="primary big">🔄 SYNCHRONISER LES NOUVELLES CARTES</button>
      <div id="syncOut"></div></div>`;
    const desc = () => {
      const s = Sync.get($('#syncSource').value);
      $('#syncDesc').textContent = s.description;
      $('#syncUrlL').classList.toggle('hidden', !s.needsUrl);
      $('#syncLangs').classList.toggle('hidden', !!s.needsUrl);
    };
    $('#syncSource').onchange = desc; desc();
    $('#syncGo').onclick = runSync;
  }

  async function runSync() {
    const src = Sync.get($('#syncSource').value);
    const languages = $$('#syncLangs input:checked').map(i => i.value);
    const sets = $('#syncSets').value.split(',').map(s => s.trim()).filter(Boolean);
    const out = $('#syncOut');
    if (!src.needsUrl && !languages.length) return App.toast('Choisissez au moins une langue.', 'error');
    $('#syncGo').disabled = true;
    out.innerHTML = '<p class="progress" id="syncProg">Connexion à la source…</p>';
    try {
      const res = await src.fetch({ languages, sets, url: $('#syncUrl')?.value.trim() }, msg => { const p = $('#syncProg'); if (p) p.textContent = msg; });
      if (!res.cards.length) throw new Error(sets.length ? `La source ne contient aucune carte pour ${sets.join(', ')}.` : 'La source n\'a renvoyé aucune carte.');
      const result = Cards.analyze(res.cards, App.cards, { source: src.id });
      const nNew = result.filter(r => r.status === 'new').length, nUpd = result.filter(r => r.status === 'update').length;
      pendingSync = { sourceLabel: src.label };
      const metaTxt = res.meta?.languages ? Object.entries(res.meta.languages).map(([l, m]) =>
        `${Cards.LANG_LABELS[l] || l} : ${m.packs} produits${m.generated_at ? `, données générées le ${fmtDate(m.generated_at)}` : ''}`).join(' · ') : '';
      out.innerHTML = `<div class="cov ${nNew || nUpd ? 'ok' : 'warn'}"><b>Source joignable.</b> ${res.cards.length} cartes lues. ${esc(metaTxt)}<br>
        ${nNew || nUpd ? `<b>${nNew}</b> nouvelle(s) carte(s) et <b>${nUpd}</b> modification(s) trouvée(s). Vérifiez puis confirmez.`
          : '<b>Aucune nouvelle carte trouvée</b> : votre base est déjà à jour par rapport à cette source. Rien n\'a été modifié.'}</div><div id="syncPrev"></div>`;
      await DB.log('Synchronisation (analyse)', `${src.label} — ${languages.join(',')} ${sets.join(',')}`, { found_new: nNew, found_updates: nUpd, read: res.cards.length });
      if (nNew || nUpd) showPreview($('#syncPrev'), result, 'merge', 'sync');
    } catch (e) {
      out.innerHTML = `<div class="cov warn"><b>Synchronisation impossible.</b> ${esc(e.message)}<br>Aucune donnée n'a été modifiée. L'application continue de fonctionner avec les cartes déjà enregistrées.</div>`;
      await DB.log('Synchronisation échouée', `${src.label} : ${e.message}`, null);
    } finally { $('#syncGo').disabled = false; }
  }

  // ================= EXPORT / SAUVEGARDE =================
  async function renderExport() {
    const backups = await DB.backups();
    $('#sub-export').innerHTML = `<div class="panel"><h2>💾 Exporter</h2>
      <div class="row"><button id="expCsv" class="primary">Exporter toute la base en CSV</button><button id="expJson" class="primary">Exporter toute la base en JSON</button></div>
      <p class="muted small">Astuce : utilisez les filtres de l'onglet « Base de cartes » puis <button class="link" id="expFiltered">exportez seulement la sélection (CSV)</button>.</p></div>
      <div class="panel"><h2>🛟 Sauvegarde et restauration</h2>
      <p class="muted">La sauvegarde complète contient les cartes, les familles, les règles des jeux, l'historique des tours et l'historique des mises à jour.</p>
      <div class="row"><button id="bkSave" class="primary">Télécharger une sauvegarde complète</button>
        <label class="file-btn ghost">Restaurer depuis un fichier…<input type="file" id="bkFile" accept=".json" hidden></label></div>
      <h3>Sauvegardes automatiques internes</h3><p class="muted small">Créées avant chaque remplacement ou restauration (les 5 dernières sont conservées).</p>
      <table class="tbl"><thead><tr><th>Date</th><th>Motif</th><th>Cartes</th><th></th></tr></thead><tbody>
      ${backups.reverse().map(b => `<tr><td>${fmtDate(b.date)}</td><td>${esc(b.label)}</td><td>${b.count}</td><td><button class="ghost small" data-restore="${b.id}">Restaurer</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Aucune</td></tr>'}
      </tbody></table>
      <h3>Réinstaller la base fournie</h3><button id="reseed" class="ghost">Recharger la base initiale fournie avec l'application (fusion)</button></div>`;
    const stamp = () => new Date().toISOString().slice(0, 10);
    $('#expCsv').onclick = async () => { App.download(`cartes-onepiece-${stamp()}.csv`, Cards.toCSV(App.cards), 'text/csv'); await DB.log('Export CSV', '', { exported: App.cards.length }); };
    $('#expJson').onclick = async () => { App.download(`cartes-onepiece-${stamp()}.json`, JSON.stringify({ exported_at: new Date().toISOString(), cards: App.cards }, null, 1), 'application/json'); await DB.log('Export JSON', '', { exported: App.cards.length }); };
    $('#expFiltered').onclick = () => App.download(`cartes-selection-${stamp()}.csv`, Cards.toCSV(filtered()), 'text/csv');
    $('#bkSave').onclick = async () => {
      const data = { type: 'grandline-live-backup', version: 1, date: new Date().toISOString(), cards: App.cards, families: App.families,
        games: App.games, turns: App.turns, history: await DB.history() };
      App.download(`sauvegarde-grandline-${stamp()}.json`, JSON.stringify(data), 'application/json');
      await DB.log('Sauvegarde téléchargée', '', { cards: App.cards.length });
    };
    $('#bkFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      let data;
      try { data = JSON.parse(await f.text()); } catch (err) { return App.toast('Fichier de sauvegarde illisible.', 'error'); }
      if (data.type !== 'grandline-live-backup' || !Array.isArray(data.cards)) return App.toast('Ce fichier n\'est pas une sauvegarde Grand Line Live. Pour des cartes seules, utilisez « Importer ».', 'error');
      if (!await App.confirm(`Restaurer la sauvegarde du ${fmtDate(data.date)} (${data.cards.length} cartes) ? La base actuelle sera remplacée (une sauvegarde automatique est faite avant).`, 'Restaurer')) return;
      await restore(data.cards, `fichier ${f.name}`, data);
    };
    $$('[data-restore]').forEach(b => {
      b.onclick = async () => {
        const bk = await DB.getBackup(Number(b.dataset.restore));
        if (!await App.confirm(`Restaurer la sauvegarde « ${esc(bk.label)} » (${bk.count} cartes) ?`, 'Restaurer')) return;
        await restore(bk.cards, `sauvegarde interne du ${fmtDate(bk.date)}`);
      };
    });
    $('#reseed').onclick = async () => {
      App.loading('Chargement de la base initiale…');
      try {
        if (!window.OPTCG_SEED) await loadScript('data/seed-cards.js?' + Date.now());
        const result = Cards.analyze(window.OPTCG_SEED.cards, App.cards, {});
        App.loading(false);
        $$('#subtabs button').find(b => b.dataset.sub === 'import').click();
        pendingImport = { result, mode: 'merge', file: 'base initiale' };
        showPreview($('#impPreview'), result, 'merge', 'import');
      } catch (err) { App.loading(false); App.toast(err.message, 'error'); }
    };
  }

  async function restore(cards, label, full) {
    App.loading('Restauration…');
    try {
      await DB.snapshot('Avant restauration');
      await DB.clearCards(); await DB.putCards(cards);
      if (full) {
        if (full.families) App.families = full.families;
        if (full.games) Object.assign(App.games, full.games);
        if (full.turns) App.turns = full.turns;
        await App.saveSettings(); await App.saveTurns();
      }
      await DB.log('Restauration', label, { cards: cards.length });
      await App.reload(); App.toast('Restauration terminée.', 'ok');
    } catch (e) { App.toast('Restauration échouée : ' + e.message, 'error'); }
    finally { App.loading(false); renderExport(); }
  }

  // ================= HISTORIQUE =================
  async function renderHistory() {
    const h = (await DB.history()).reverse();
    const fmtCounts = c => c ? Object.entries(c).map(([k, v]) => `${{ added: 'ajoutées', updated: 'modifiées', ignored: 'ignorées', errors: 'erreurs', deleted: 'supprimées' }[k] || k} : ${v}`).join(' · ') : '';
    $('#sub-history').innerHTML = `<div class="panel"><h2>🕓 Historique des mises à jour</h2>
      <table class="tbl"><thead><tr><th>Date</th><th>Action</th><th>Détails</th><th>Résultat</th></tr></thead><tbody>
      ${h.map(x => `<tr class="${/échou/i.test(x.action) ? 'r-error' : ''}"><td class="nowrap">${fmtDate(x.date)}</td><td>${esc(x.action)}</td><td><small>${esc(x.details)}</small></td><td><small>${esc(fmtCounts(x.counts))}</small></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Aucune entrée</td></tr>'}
      </tbody></table></div>`;
  }

  App.onChange(() => { renderBase(); if (!$('#impFile')) renderImport(); if (!$('#syncSource')) renderSync(); renderExport(); renderHistory(); });
  return {};
})();
