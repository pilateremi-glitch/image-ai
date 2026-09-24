// ── Visuels dessinés (SVG) : produits sans photo + icônes ────────────────────
const PALETTE = {
  yellow: ['#fff0a8', '#ffcf4d'], blue: ['#b9dcff', '#6f9cff'], violet: ['#d8c8ff', '#9a74ff'],
  red: ['#ffb3c1', '#ff5f7e'], pink: ['#ffc2e2', '#ff6fb5'], green: ['#bdfbe3', '#3fdca5'], orange: ['#ffd2a8', '#ff9150'],
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
  const shapes = {
    booster: `<path d="${zig(22, -1)}L160 30L40 30Z" fill="${c2}"/><path d="${zig(178, 1)}L160 170L40 170Z" fill="${c2}"/>
      <rect x="40" y="22" width="120" height="156" fill="url(#${id})"/>
      <rect x="40" y="36" width="120" height="10" fill="#141833" opacity=".25"/><rect x="40" y="154" width="120" height="10" fill="#141833" opacity=".25"/>
      ${emblem(100, 96, 30)}
      <rect x="58" y="134" width="84" height="12" rx="3" fill="#141833" opacity=".8"/><text x="100" y="143.5" text-anchor="middle" font-family="monospace" font-weight="700" font-size="9" fill="#fff" letter-spacing="2">BOOSTER</text>
      <rect x="40" y="22" width="120" height="156" fill="url(#${id}f)"/>`,
    box: `<path d="M40 70 L100 44 L170 64 L110 92Z" fill="${c1}"/><path d="M40 70 L110 92 L110 178 L40 156Z" fill="url(#${id})"/><path d="M110 92 L170 64 L170 150 L110 178Z" fill="${c2}"/>
      <path d="M110 92 L170 64 L170 150 L110 178Z" fill="#000" opacity=".18"/>${emblem(75, 122, 22)}
      <path d="M52 86 L98 101" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/><path d="M40 70 L110 92 L110 178 L40 156Z" fill="url(#${id}f)"/>`,
    plush: `<ellipse cx="100" cy="178" rx="52" ry="8" fill="#000" opacity=".25"/>
      <path d="M58 70 L44 20 L84 56Z" fill="url(#${id})"/><path d="M142 70 L156 20 L116 56Z" fill="url(#${id})"/><path d="M47 30 L44 20 L54 27Z" fill="#141833"/><path d="M153 30 L156 20 L146 27Z" fill="#141833"/>
      <ellipse cx="100" cy="112" rx="62" ry="62" fill="url(#${id})"/><ellipse cx="100" cy="150" rx="34" ry="22" fill="#fff" opacity=".35"/>
      <ellipse cx="78" cy="104" rx="7" ry="9" fill="#141833"/><ellipse cx="122" cy="104" rx="7" ry="9" fill="#141833"/><circle cx="80" cy="100" r="2.5" fill="#fff"/><circle cx="124" cy="100" r="2.5" fill="#fff"/>
      <circle cx="62" cy="124" r="10" fill="#ff4d6d" opacity=".8"/><circle cx="138" cy="124" r="10" fill="#ff4d6d" opacity=".8"/><path d="M92 122 Q100 130 108 122" fill="none" stroke="#141833" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="100" cy="112" rx="62" ry="62" fill="url(#${id}f)"/>`,
    figure: `<ellipse cx="100" cy="170" rx="58" ry="14" fill="#141833"/><ellipse cx="100" cy="164" rx="58" ry="14" fill="#2a3160"/>
      <path d="M100 26 C128 60 150 76 142 116 C136 148 112 160 100 160 C88 160 64 148 58 116 C52 88 74 76 76 52 C88 70 92 80 96 86 C102 64 96 44 100 26Z" fill="url(#${id})"/>
      <path d="M100 80 C114 100 124 110 120 130 C116 148 104 152 100 152 C92 152 80 146 78 130 C76 116 88 108 92 96 C96 104 98 108 100 110 C102 100 100 90 100 80Z" fill="#ffe066"/>
      <path d="M100 26 C128 60 150 76 142 116 C136 148 112 160 100 160 C88 160 64 148 58 116 C52 88 74 76 76 52 C88 70 92 80 96 86 C102 64 96 44 100 26Z" fill="url(#${id}f)"/>`,
    stickers: `<g transform="rotate(-14 70 80)"><rect x="30" y="40" width="80" height="80" rx="16" fill="#fff"/><rect x="36" y="46" width="68" height="68" rx="12" fill="url(#${id})"/><path d="M70 62 l7 14 15 2 -11 10 3 15 -14-7 -14 7 3-15 -11-10 15-2z" fill="#fff"/></g>
      <g transform="rotate(10 130 110)"><rect x="92" y="72" width="80" height="80" rx="40" fill="#fff"/><circle cx="132" cy="112" r="34" fill="#ffe066"/><path d="M132 128 c-18-12-26-20-26-30 a12 12 0 0 1 26-4 a12 12 0 0 1 26 4 c0 10-8 18-26 30z" fill="#ff4d6d"/></g>
      <g transform="rotate(-4 90 150)"><rect x="50" y="128" width="84" height="44" rx="12" fill="#fff"/><rect x="55" y="133" width="74" height="34" rx="9" fill="#6fa8ff"/><text x="92" y="156" text-anchor="middle" font-family="monospace" font-weight="700" font-size="14" fill="#fff">GG!</text></g>`,
    keychain: `<circle cx="100" cy="46" r="24" fill="none" stroke="#c9cfee" stroke-width="7"/><rect x="95" y="68" width="10" height="26" rx="4" fill="#c9cfee"/>${emblem(100, 132, 44)}<circle cx="100" cy="132" r="44" fill="url(#${id}f)"/>`,
    binder: `<rect x="44" y="30" width="118" height="148" rx="12" fill="#141833"/><rect x="38" y="24" width="118" height="148" rx="12" fill="url(#${id})"/>
      <rect x="38" y="24" width="18" height="148" rx="8" fill="#000" opacity=".2"/>
      ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${66 + c * 28}" y="${40 + r * 40}" width="22" height="32" rx="3" fill="#fff" opacity="${(r + c) % 2 ? .9 : .55}"/>`).join('')).join('')}
      <rect x="150" y="84" width="14" height="30" rx="5" fill="#141833"/><rect x="38" y="24" width="118" height="148" rx="12" fill="url(#${id}f)"/>`,
    sleeves: `${[0, 1, 2, 3].map(i => `<rect x="${56 + i * 10}" y="${34 + i * 8}" width="76" height="106" rx="8" fill="${i === 3 ? `url(#${id})` : '#dfe6ff'}" opacity="${i === 3 ? 1 : .25 + i * .2}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`).join('')}
      ${emblem(124, 110, 20)}<rect x="86" y="58" width="76" height="106" rx="8" fill="url(#${id}f)"/>`,
    hoodie: `<path d="M70 40 Q100 20 130 40 L166 62 L182 128 L156 136 L148 98 L148 176 L52 176 L52 98 L44 136 L18 128 L34 62Z" fill="url(#${id})"/>
      <path d="M78 40 Q100 76 122 40" fill="none" stroke="#141833" stroke-opacity=".35" stroke-width="6"/><path d="M92 58 L90 92 M108 58 L110 92" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <rect x="72" y="130" width="56" height="30" rx="8" fill="#000" opacity=".15"/>${emblem(122, 96, 11)}
      <path d="M70 40 Q100 20 130 40 L166 62 L182 128 L156 136 L148 98 L148 176 L52 176 L52 98 L44 136 L18 128 L34 62Z" fill="url(#${id}f)"/>`,
  };
  return `<svg class="art" viewBox="0 0 200 200" aria-hidden="true">${defs}${shapes[kind] || shapes.booster}</svg>`;
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
