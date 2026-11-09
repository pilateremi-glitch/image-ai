/* ==========================================================================
   Z3 — pont dock ⇄ overlay
   Reçoit les ordres du détecteur / dock :
     • BroadcastChannel 'z3'  (dock et sources dans le même OBS : aucun réglage)
     • obs-websocket CustomEvent  (?obs  [&obspass=…&obsport=4455&obshost=127.0.0.1])
   Messages : {kind:'hit', tier, name} · {kind:'event', type, name, amount} · {kind:'cmd', cmd, sec}
   ========================================================================== */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.has('static')) return;
  const seen = new Set();
  function handle(m) {
    if (!m || !m.z3 || (m.id && seen.has(m.id))) return;
    if (m.id) { seen.add(m.id); if (seen.size > 200) seen.delete(seen.values().next().value); }
    const Z = window.Z3 || {}, fx = window.Z3fx;
    if (m.kind === 'hit' && Z.hit) Z.hit(m.tier, m.name);
    else if (m.kind === 'event' && Z.event) Z.event(m);
    else if (m.kind === 'cmd') {
      if (m.cmd === 'add' && Z.add) Z.add(+m.sec || 0);
      else if (m.cmd === 'pause' && Z.pause) Z.pause();
      else if (m.cmd === 'resume' && Z.resume) Z.resume();
      else if (m.cmd === 'nextbg' && fx && fx.next) fx.next();
      else if (m.cmd === 'theme' && window.Z3theme) window.Z3theme(m.theme);
    }
  }
  try { new BroadcastChannel('z3').onmessage = (e) => handle(e.data); } catch (e) { /* non disponible */ }
  if (Q.has('obs') && window.Z3OBS) {
    const obs = new window.Z3OBS({ host: Q.get('obshost') || '127.0.0.1', port: Q.get('obsport') || 4455, password: Q.get('obspass') || '' });
    obs.on('CustomEvent', handle);
    (function go() { obs.connect().then(() => console.log('[Z3] relié à OBS WebSocket')).catch((e) => { console.warn('[Z3] OBS :', e.message); setTimeout(go, 5000); }); })();
  }
})();
