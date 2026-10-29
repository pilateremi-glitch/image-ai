// Stockage local (IndexedDB) : cartes, historique des mises à jour, sauvegardes.
// Tout reste dans le navigateur de l'animateur : aucun serveur n'est nécessaire.
const DB = (() => {
  const NAME = 'optcg-live';
  const VERSION = 1;
  let dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('cards')) {
          const s = db.createObjectStore('cards', { keyPath: 'uid' });
          s.createIndex('set_code', 'set_code');
          s.createIndex('language', 'language');
        }
        if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        if (!db.objectStoreNames.contains('backups')) db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbp;
  }

  async function tx(store, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      let result;
      Promise.resolve(fn(s)).then(r => { result = r; });
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  const req2p = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

  return {
    allCards: () => tx('cards', 'readonly', s => req2p(s.getAll())),
    putCards: cards => tx('cards', 'readwrite', s => { cards.forEach(c => s.put(c)); return cards.length; }),
    deleteCards: uids => tx('cards', 'readwrite', s => { uids.forEach(u => s.delete(u)); return uids.length; }),
    clearCards: () => tx('cards', 'readwrite', s => req2p(s.clear())),
    countCards: () => tx('cards', 'readonly', s => req2p(s.count())),

    log: (action, details, counts) => tx('history', 'readwrite', s =>
      req2p(s.add({ date: new Date().toISOString(), action, details: details || '', counts: counts || null }))),
    history: () => tx('history', 'readonly', s => req2p(s.getAll())),
    clearHistory: () => tx('history', 'readwrite', s => req2p(s.clear())),

    // Sauvegardes internes automatiques (avant chaque opération destructive). On garde les 5 dernières.
    async snapshot(label) {
      const cards = await this.allCards();
      await tx('backups', 'readwrite', s => req2p(s.add({ date: new Date().toISOString(), label, count: cards.length, cards })));
      const list = await this.backups();
      const extra = list.slice(0, Math.max(0, list.length - 5));
      if (extra.length) await tx('backups', 'readwrite', s => extra.forEach(b => s.delete(b.id)));
    },
    backups: () => tx('backups', 'readonly', s => new Promise(res => {
      // On ne charge pas les cartes de chaque sauvegarde pour la liste
      const out = [];
      s.openCursor().onsuccess = e => {
        const c = e.target.result;
        if (!c) return res(out);
        const { id, date, label, count } = c.value;
        out.push({ id, date, label, count });
        c.continue();
      };
    })),
    getBackup: id => tx('backups', 'readonly', s => req2p(s.get(id))),

    get: key => tx('kv', 'readonly', s => req2p(s.get(key))),
    set: (key, val) => tx('kv', 'readwrite', s => req2p(s.put(val, key))),
  };
})();
