/* ==========================================================================
   Client obs-websocket v5 minimal (intégré à OBS 28+ : Outils › Paramètres WebSocket)
   const obs = new Z3OBS({ host, port, password });
   await obs.connect(); await obs.call('GetInputList'); obs.on('CustomEvent', fn)
   ========================================================================== */
(function (global) {
  'use strict';
  async function sha256b64(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    let bin = ''; new Uint8Array(buf).forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  class Z3OBS {
    constructor(o = {}) {
      this.url = `ws://${o.host || '127.0.0.1'}:${o.port || 4455}`;
      this.password = o.password || '';
      this.handlers = {}; this.pending = {}; this.seq = 0; this.ready = false;
      this.retry = o.retry !== false;
    }
    on(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); return this; }
    emit(ev, d) { (this.handlers[ev] || []).forEach((fn) => { try { fn(d); } catch (e) { console.error(e); } }); }
    connect() {
      return new Promise((resolve, reject) => {
        let ws;
        try { ws = new WebSocket(this.url, 'obswebsocket.json'); } catch (e) { reject(e); return; }
        this.ws = ws;
        ws.onmessage = async (m) => {
          const msg = JSON.parse(m.data);
          if (msg.op === 0) {                                   // Hello
            const d = { rpcVersion: 1, eventSubscriptions: 1 }; // General (CustomEvent)
            if (msg.d.authentication) {
              const { challenge, salt } = msg.d.authentication;
              d.authentication = await sha256b64((await sha256b64(this.password + salt)) + challenge);
            }
            ws.send(JSON.stringify({ op: 1, d }));
          } else if (msg.op === 2) {                            // Identified
            this.ready = true; this.emit('open'); resolve(this);
          } else if (msg.op === 5) {                            // Event
            this.emit(msg.d.eventType, msg.d.eventData);
          } else if (msg.op === 7) {                            // RequestResponse
            const p = this.pending[msg.d.requestId]; if (!p) return;
            delete this.pending[msg.d.requestId];
            if (msg.d.requestStatus.result) p.res(msg.d.responseData || {});
            else p.rej(new Error(msg.d.requestStatus.comment || ('code ' + msg.d.requestStatus.code)));
          }
        };
        ws.onclose = (e) => {
          const was = this.ready; this.ready = false;
          Object.values(this.pending).forEach((p) => p.rej(new Error('connexion fermée')));
          this.pending = {};
          this.emit('close', e);
          if (!was) reject(new Error(e.code === 4009 ? 'mot de passe OBS incorrect' : 'OBS injoignable (WebSocket activé ?)'));
          if (this.retry && was) setTimeout(() => this.connect().catch(() => {}), 3000);
        };
        ws.onerror = () => {};
      });
    }
    call(requestType, requestData) {
      if (!this.ready) return Promise.reject(new Error('non connecté'));
      const requestId = 'z3-' + (++this.seq);
      return new Promise((res, rej) => {
        this.pending[requestId] = { res, rej };
        this.ws.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
        setTimeout(() => { if (this.pending[requestId]) { delete this.pending[requestId]; rej(new Error('délai dépassé')); } }, 8000);
      });
    }
    broadcast(data) { return this.call('BroadcastCustomEvent', { eventData: Object.assign({ z3: 1 }, data) }); }
    close() { this.retry = false; if (this.ws) this.ws.close(); }
  }
  global.Z3OBS = Z3OBS;
})(typeof window !== 'undefined' ? window : globalThis);
