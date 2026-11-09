/* Z3 — service worker : relaie les achats détectés vers l'overlay (OBS WebSocket → CustomEvent) */
importScripts('obsws.js');
let obs = null, connecting = null;
const get = (k) => new Promise((r) => chrome.storage.local.get(k, (o) => r(o[k])));
async function connection() {
  if (obs && obs.ready) return obs;
  if (connecting) return connecting;
  const c = (await get('obs')) || {};
  obs = new self.Z3OBS({ host: c.host || '127.0.0.1', port: c.port || 4455, password: c.password || '', retry: false });
  connecting = obs.connect().finally(() => { connecting = null; });
  return connecting;
}
async function log(entry) {
  const l = (await get('log')) || [];
  l.unshift(Object.assign({ t: Date.now() }, entry));
  chrome.storage.local.set({ log: l.slice(0, 25) });
}
async function sendBuyer(name, qty, site, test) {
  try {
    const o = await connection();
    await o.broadcast({ id: 'ext' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kind: 'event', type: 'achat', name, qty: qty || 1, source: site || '' });
    await log({ name, qty, site, ok: true, test: !!test });
    return { ok: true };
  } catch (e) {
    await log({ name, qty, site, ok: false, err: e.message, test: !!test });
    return { ok: false, err: e.message };
  }
}
chrome.runtime.onMessage.addListener((m, sender, reply) => {
  if (m.type === 'buyer') { sendBuyer(m.name, m.qty, m.site).then(reply); return true; }
  if (m.type === 'test') { sendBuyer(m.name || 'TestZ3', 1, 'test', true).then(reply); return true; }
  if (m.type === 'reconnect') { if (obs) obs.close(); obs = null; connection().then(() => reply({ ok: true }), (e) => reply({ ok: false, err: e.message })); return true; }
  if (m.type === 'status') { reply({ ok: !!(obs && obs.ready) }); return false; }
  if (m.type === 'learned') { log({ learned: m.field, sample: m.sample, rows: m.rows, site: m.site }); return false; }
  return false;
});
