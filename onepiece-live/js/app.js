// Noyau de l'application : état global, chargement de la base, onglets, utilitaires d'interface.
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = iso => iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

const App = {
  cards: [],          // toutes les cartes en mémoire
  families: [],
  games: {},          // règles par jeu (A..G)
  turns: [],          // historique des tours joués
  traitsOf: null,
  channel: 'BroadcastChannel' in window ? new BroadcastChannel('grandline-live') : null,
  listeners: [],

  async reload() {
    this.cards = await DB.allCards();
    this.traitsOf = Games.buildTraitIndex(this.cards);
    this.listeners.forEach(fn => fn());
  },
  onChange(fn) { this.listeners.push(fn); },

  async saveSettings() {
    await DB.set('families', this.families);
    await DB.set('games', this.games);
  },
  async saveTurns() { await DB.set('turns', this.turns); },

  toast(msg, type = 'info') {
    const t = $('#toast');
    t.textContent = msg; t.className = `toast ${type}`;
    clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.add('hidden'), 4500);
  },
  modal(html) {
    $('#modalBody').innerHTML = html;
    $('#modal').classList.remove('hidden');
    return $('#modalBody');
  },
  closeModal() { $('#modal').classList.add('hidden'); },
  confirm(message, okLabel = 'Confirmer') {
    return new Promise(res => {
      const b = this.modal(`<h3>Confirmation</h3><p>${message}</p>
        <div class="row end"><button class="ghost" data-a="no">Annuler</button><button class="danger" data-a="yes">${esc(okLabel)}</button></div>`);
      b.onclick = e => {
        const a = e.target.dataset.a; if (!a) return;
        this.closeModal(); b.onclick = null; res(a === 'yes');
      };
    });
  },
  download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  loading(text) {
    const l = $('#loading');
    if (text === false) return l.classList.add('hidden');
    $('#loadingText').textContent = text; l.classList.remove('hidden');
  },
  broadcast(msg) { try { this.channel?.postMessage(msg); } catch (e) { /* fenêtre écran absente */ } },

  // Liste des produits connus (extensions + produits de réimpression)
  products() {
    const m = new Map();
    this.cards.forEach(c => (c.products || []).forEach(p => {
      const e = m.get(p) || { code: p, name: '', count: 0, langs: new Set() };
      e.count++; e.langs.add(c.language);
      if (!e.name && c.set_code === p) e.name = c.set_name;
      m.set(p, e);
    }));
    const rank = p => {
      const x = p.match(/^(OP|EB|PRB|ST)-?(\d+)/); const o = { OP: 0, EB: 1, PRB: 2, ST: 3 };
      return x ? o[x[1]] * 1000 - Number(x[2]) : 9000;
    };
    return [...m.values()].sort((a, b) => rank(a.code) - rank(b.code) || a.code.localeCompare(b.code));
  },
  languages() { return [...new Set(this.cards.map(c => c.language))].sort(); },
};

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Impossible de charger ' + src));
    document.head.appendChild(s);
  });
}

async function boot() {
  try {
    App.loading('Ouverture de la base de données…');
    const count = await DB.countCards();
    const seeded = await DB.get('seeded');
    if (!count && !seeded) {
      App.loading('Premier lancement : installation de la base de cartes (≈ 10 000 cartes)…');
      await loadScript('data/seed-cards.js');
      const seed = window.OPTCG_SEED;
      await DB.putCards(seed.cards);
      await DB.set('seeded', seed.generated_at);
      await DB.log('Installation initiale', `Base fournie avec l'application (${seed.source}, générée le ${fmtDate(seed.generated_at)})`,
        { added: seed.cards.length, updated: 0, ignored: 0, errors: 0 });
      delete window.OPTCG_SEED;
    }
    App.families = (await DB.get('families')) || structuredClone(Games.DEFAULT_FAMILIES);
    const games = (await DB.get('games')) || {};
    Object.keys(Games.GAME_TYPES).forEach(id => { App.games[id] = { ...Games.DEFAULT_RULES(id), ...(games[id] || {}) }; });
    App.turns = (await DB.get('turns')) || [];
    await App.reload();
  } catch (e) {
    console.error(e);
    App.toast('Erreur au chargement : ' + e.message, 'error');
  } finally {
    App.loading(false);
  }
}

// Onglets
$('#tabs').addEventListener('click', e => {
  const t = e.target.closest('button[data-tab]'); if (!t) return;
  $$('#tabs button').forEach(b => b.classList.toggle('active', b === t));
  $$('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + t.dataset.tab));
  window.dispatchEvent(new Event('resize'));
});
$('#subtabs').addEventListener('click', e => {
  const t = e.target.closest('button[data-sub]'); if (!t) return;
  $$('#subtabs button').forEach(b => b.classList.toggle('active', b === t));
  $$('.sub').forEach(s => s.classList.toggle('active', s.id === 'sub-' + t.dataset.sub));
});
$('#modalClose').onclick = () => App.closeModal();
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') App.closeModal(); });

document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
