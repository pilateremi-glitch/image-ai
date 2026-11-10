/* Z3 — popup de l'extension */
const $ = (id) => document.getElementById(id);
const tabParam = new URLSearchParams(location.search).get('tab');   // pour les tests : ?tab=ID
let tabId = tabParam ? +tabParam : null, active = true;

async function currentTab() {
  if (tabId) return chrome.tabs.get(tabId);
  const [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  tabId = t && t.id; return t;
}
async function ensureScript() {   // injecte le lecteur sur les sites hors Voggt/Whatnot (clic = autorisation de l'onglet)
  try { await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }); } catch (e) { /* déjà présent ou page protégée */ }
}
const msgTab = (m) => new Promise((r) => chrome.tabs.sendMessage(tabId, m, (x) => { void chrome.runtime.lastError; r(x); }));

async function refresh() {
  const t = await currentTab();
  $('site').textContent = t && t.url ? new URL(t.url).hostname : '';
  const p = await msgTab({ type: 'preview' });
  if (p && p.cfg && p.cfg.name) {
    active = p.cfg.active !== false;
    $('toggle').textContent = active ? 'Pause' : 'Reprendre';
    $('preview').innerHTML = `✔ Liste repérée (exemple : <b>${esc(p.cfg.name.sample)}</b>)${p.cfg.qty ? ' · quantité ✔' : ''}<br>Derniers lus : ${p.items.map((i) => esc(i.name) + (i.qty > 1 ? ' ×' + i.qty : '')).join(', ') || '—'}`;
  } else $('preview').textContent = 'Pas encore réglé pour ce site : clique sur « Apprendre ».';
  chrome.storage.local.get(['log', 'obs'], (o) => {
    const c = o.obs || {}; if (c.host) { $('host').value = c.host; $('port').value = c.port; $('pass').value = c.password || ''; }
    $('log').innerHTML = (o.log || []).slice(0, 10).map((l) => `<div>${new Date(l.t).toLocaleTimeString()} · ${l.learned ? 'appris ' + esc(l.learned) + ' (« ' + esc(l.sample) + ' », ' + l.rows + ' lignes)' : `<span class="${l.ok ? 'ok' : 'ko'}">${l.ok ? '✔' : '✖'}</span> ${esc(l.name)}${l.qty > 1 ? ' ×' + l.qty : ''}${l.test ? ' (test)' : ''}${l.err ? ' — ' + esc(l.err) : ''}`}</div>`).join('') || '<div class="mut">Aucun achat détecté pour l\'instant.</div>';
  });
}
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

$('save').onclick = () => chrome.storage.local.set({ obs: { host: $('host').value.trim(), port: $('port').value.trim(), password: $('pass').value } }, () => {
  $('obsState').textContent = 'connexion…';
  chrome.runtime.sendMessage({ type: 'reconnect' }, (r) => { $('obsState').innerHTML = r && r.ok ? '<span class="ok">✔ connecté</span>' : '<span class="ko">✖ ' + esc(r && r.err) + '</span>'; });
});
$('pickName').onclick = async () => { await currentTab(); await ensureScript(); await msgTab({ type: 'pick', field: 'name' }); if (!tabParam) window.close(); };
$('pickQty').onclick = async () => { await currentTab(); await ensureScript(); await msgTab({ type: 'pick', field: 'qty' }); if (!tabParam) window.close(); };
$('toggle').onclick = async () => { active = !active; await msgTab({ type: 'toggle', active }); refresh(); };
$('forget').onclick = async () => { await msgTab({ type: 'forget' }); refresh(); };
$('test').onclick = () => chrome.runtime.sendMessage({ type: 'test', name: $('testName').value.trim() || 'TestZ3' }, () => refresh());
chrome.storage.onChanged.addListener(refresh);
refresh();
