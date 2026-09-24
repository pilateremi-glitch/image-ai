// ── Visuels dessinés (SVG) : produits sans photo + icônes ────────────────────
const PALETTE = {
  yellow: ['#fff0a8', '#ffcf4d'], blue: ['#b9dcff', '#6f9cff'], violet: ['#d8c8ff', '#9a74ff'],
  red: ['#ffb3c1', '#ff5f7e'], pink: ['#ffc2e2', '#ff6fb5'], green: ['#bdfbe3', '#3fdca5'], orange: ['#ffd2a8', '#ff9150'], black: ['#4a3d66', '#1a1326'],
};
function pal(color) { return PALETTE[color] || PALETTE.yellow; }

let _artId = 0;
function productArt(kind, color) {
  const [c1, c2] = pal(color);
  const id = 'g' + (++_artId);
  const defs = `<defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".45" stop-color="#fff" stop-opacity=".55"/><stop offset=".55" stop-color="#fff" stop-opacity=".0"/></linearGradient>
  </defs>`;
  const emblem = (cx, cy, r) => `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><path d="M${cx - r} ${cy}a${r} ${r} 0 0 1 ${2 * r} 0z" fill="#e8283f"/><rect x="${cx - r}" y="${cy - r * .09}" width="${2 * r}" height="${r * .18}" fill="#141833"/><circle cx="${cx}" cy="${cy}" r="${r * .32}" fill="#fff" stroke="#141833" stroke-width="${r * .14}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#141833" stroke-width="${r * .12}"/></g>`;
  const zig = (y, dir) => { let d = `M40 ${y}`; for (let x = 40; x < 160; x += 8) d += `L${x + 4} ${y + dir * 6}L${x + 8} ${y}`; return d; };
  const INK = '#07050c';
  const cap = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
      <path d="M22 128 Q92 104 178 124 Q176 150 104 154 Q42 154 22 128Z" fill="${c2}"/>
      <path d="M42 126 C40 66 78 40 112 40 C150 40 172 74 170 122 Q108 108 42 126Z" fill="url(#${id})"/>
      <path d="M112 42 C104 64 102 92 104 114 M112 42 C132 58 146 84 150 116" fill="none" stroke-width="3" opacity=".55"/>
      <circle cx="112" cy="40" r="7" fill="${c2}"/>
    </g>
    ${emblem(90, 88, 20)}
    <path d="M42 126 C40 66 78 40 112 40 C150 40 172 74 170 122 Q108 108 42 126Z" fill="url(#${id}f)"/>`;
  const flag = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
      <rect x="26" y="22" width="10" height="164" rx="4" fill="#e9e2f7"/>
      <circle cx="31" cy="20" r="9" fill="${c1}"/>
      <path d="M36 34 Q72 18 108 34 T180 34 L180 128 Q144 112 108 128 T36 128Z" fill="url(#${id})"/>
    </g>
    <circle cx="44" cy="42" r="4" fill="#e9e2f7" stroke="${INK}" stroke-width="2.5"/><circle cx="44" cy="120" r="4" fill="#e9e2f7" stroke="${INK}" stroke-width="2.5"/>
    ${emblem(110, 80, 26)}
    <path d="M60 48 Q72 42 84 46" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>
    <path d="M36 34 Q72 18 108 34 T180 34 L180 128 Q144 112 108 128 T36 128Z" fill="url(#${id}f)"/>`;
  const shapes = {
    cap,
    flag,
    pack: `<g transform="translate(18 -6) scale(.82)">${flag}</g><g transform="translate(-6 62) scale(.72)">${cap}</g>`,
  };
  return `<svg class="art" viewBox="0 0 200 200" aria-hidden="true">${defs}${shapes[kind] || shapes.cap}</svg>`;
}

const ICONS = {
  cards: '<path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M12 8l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-7 0-4-3-6-4-10-1.5 2-2 3.5-2 5-1.5-1-2.5-3-2.5-5C7 7.5 5 11 5 15c0 4.2 3 7 7 7z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
  tiktok: '<path d="M14 3v11a4 4 0 1 1-4-4"/><path d="M14 3c.5 2.5 2.5 4.5 5 5"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  cap: '<path d="M4 15c0-5 3.5-9 8-9s8 4 8 9z"/><path d="M4 15h17c0 2-3 3-8 3s-9-1-9-3z"/>',
  flag: '<path d="M5 21V4"/><path d="M5 5c3-2 6 2 9 0s5-1 5-1v9s-2-1-5 1-6-2-9 0"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1s6 1 6 1c2-4 6-4 6-1s-6 1-6 1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
};
// Mascotte : petit fantôme kawaii (création originale)
function ghostArt() {
  return `<svg class="ghost-svg" viewBox="0 0 120 130" aria-hidden="true">
    <path d="M60 6C30 6 12 30 12 60v58l12-10 12 12 12-12 12 12 12-12 12 12 12-12 12 10V60C108 30 90 6 60 6Z" fill="#b89cff" stroke="#07050c" stroke-width="5" stroke-linejoin="round"/>
    <path d="M26 34c6-12 18-20 30-21" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="44" cy="60" rx="8" ry="11" fill="#07050c"/><ellipse cx="76" cy="60" rx="8" ry="11" fill="#07050c"/>
    <circle cx="46" cy="56" r="3" fill="#fff"/><circle cx="78" cy="56" r="3" fill="#fff"/>
    <ellipse cx="32" cy="76" rx="8" ry="5" fill="#ff8fc8"/><ellipse cx="88" cy="76" rx="8" ry="5" fill="#ff8fc8"/>
    <path d="M52 78q8 8 16 0" fill="none" stroke="#07050c" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 80v6" stroke="#ff5fae" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;
}
