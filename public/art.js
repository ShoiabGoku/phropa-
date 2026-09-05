// Crop illustrations, drawn as inline SVG.
//
// Photographs would have been the obvious choice and are the wrong one here:
// they cost bandwidth Ladakh often does not have, they break when the signal
// goes, and stock produce photos carry licences. Vector drawings cost nothing
// over the wire, stay sharp from a 26px tile to a full-width hero, and work
// with the phone in aeroplane mode.
//
// Rather than draw 68 pictures, there are ~20 botanical shapes — stone fruit,
// taproot, leafy head, grain stalk, pod, bulb — and each crop supplies a
// palette. A turnip and a beetroot are the same drawing in different colours,
// which is roughly true of turnips and beetroots.

const svg = (inner) =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        style="width:100%;height:100%;display:block">${inner}</svg>`;

const leaf = (x, y, rot, s, c, c2) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 C8 -11 24 -13 33 -2 C24 10 8 11 0 0 Z" fill="${c}"/>
    <path d="M1 0 C12 -2 22 -3 31 -2" stroke="${c2}" stroke-width="1.4" fill="none" opacity=".7"/>
  </g>`;

const shine = (cx, cy, rx, ry, rot = -20, o = 0.34) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${o}"
            transform="rotate(${rot} ${cx} ${cy})"/>`;

const stem = (x1, y1, x2, y2, c = '#7A5B33', w = 3.4) =>
  `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + 3} ${(y1 + y2) / 2} ${x2} ${y2}"
         stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

// ── shapes ─────────────────────────────────────────────────────────────────
const SHAPE = {
  // apricot, plum — round with a crease
  stone: (p) => `
    <ellipse cx="50" cy="60" rx="27" ry="26" fill="${p.a}"/>
    <path d="M50 35 C43 46 43 74 50 85" stroke="${p.b}" stroke-width="2.6" fill="none" opacity=".55"/>
    ${shine(39, 50, 9, 6)}
    ${stem(52, 36, 60, 24)}
    ${leaf(60, 24, -28, 0.85, p.leaf || '#4C7A34', '#365C22')}`,

  // apple, pear — shouldered body
  pome: (p) => `
    <path d="M50 33 C31 27 19 42 21 60 C23 79 38 89 50 84 C62 89 77 79 79 60 C81 42 69 27 50 33 Z" fill="${p.a}"/>
    <path d="M50 34 C44 44 43 70 50 84" stroke="${p.b}" stroke-width="2" fill="none" opacity=".4"/>
    ${shine(36, 50, 9, 7)}
    ${stem(50, 34, 52, 21)}
    ${leaf(52, 22, -25, 0.8, p.leaf || '#4C7A34', '#365C22')}`,

  // sea buckthorn, currant, grape — a cluster on a sprig
  berries: (p) => {
    const pts = [[38, 44], [56, 40], [48, 55], [64, 54], [40, 62], [56, 68], [46, 76], [64, 40]];
    return `
      ${stem(50, 24, 46, 44, '#6B5B33', 3)}
      ${leaf(52, 30, -35, 0.7, p.leaf || '#5C7A34', '#3F5A22')}
      ${leaf(44, 36, 200, 0.6, p.leaf || '#5C7A34', '#3F5A22')}
      ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 8.5 : 7.5}" fill="${p.a}"/>
        <circle cx="${x - 2.5}" cy="${y - 2.5}" r="2.4" fill="#fff" opacity=".4"/>`).join('')}`;
  },

  strawberry: (p) => `
    <path d="M50 88 C30 76 26 56 32 45 C38 35 62 35 68 45 C74 56 70 76 50 88 Z" fill="${p.a}"/>
    ${[[42, 52], [56, 50], [49, 62], [60, 63], [40, 66], [52, 74]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="3" fill="#FFE9A8"/>`).join('')}
    <path d="M34 43 L50 38 L66 43 L58 47 L50 43 L42 47 Z" fill="#4C7A34"/>
    ${leaf(50, 40, -150, 0.5, '#4C7A34', '#365C22')}
    ${stem(50, 38, 50, 26, '#4C7A34', 3)}`,

  // walnut, almond
  nut: (p) => `
    <ellipse cx="50" cy="58" rx="26" ry="28" fill="${p.a}"/>
    <path d="M50 32 C50 46 50 72 50 86" stroke="${p.b}" stroke-width="2.4" fill="none"/>
    <path d="M38 42 C46 50 46 66 38 76 M62 42 C54 50 54 66 62 76"
          stroke="${p.b}" stroke-width="2" fill="none" opacity=".75"/>
    ${shine(38, 46, 7, 5)}`,

  // pumpkin, melon
  gourd: (p) => `
    <ellipse cx="50" cy="60" rx="32" ry="27" fill="${p.a}"/>
    ${[-18, -9, 0, 9, 18].map((d) =>
      `<path d="M${50 + d} 34 C${50 + d * 1.5} 46 ${50 + d * 1.5} 74 ${50 + d} 86"
             stroke="${p.b}" stroke-width="2" fill="none" opacity=".6"/>`).join('')}
    ${shine(34, 50, 8, 6)}
    ${stem(50, 34, 50, 24, '#5C7A34', 4)}
    ${leaf(52, 25, -30, 0.7, '#4C7A34', '#365C22')}`,

  // carrot, radish — taproot with fronds
  root: (p) => `
    <path d="M50 88 L38 46 Q50 40 62 46 Z" fill="${p.a}"/>
    ${[54, 62, 70, 78].map((y, i) =>
      `<path d="M${44 + i * 1.6} ${y} L${56 - i * 1.6} ${y - 3}" stroke="${p.b}" stroke-width="1.6" opacity=".6"/>`).join('')}
    ${leaf(50, 42, -95, 0.75, '#4C7A34', '#365C22')}
    ${leaf(50, 42, -60, 0.7, '#5C8A3C', '#365C22')}
    ${leaf(50, 42, -125, 0.7, '#5C8A3C', '#365C22')}`,

  // turnip, beetroot, kohlrabi — round root with a leafy crown
  bulbroot: (p) => `
    <path d="M50 90 C32 78 28 60 34 52 C40 44 60 44 66 52 C72 60 68 78 50 90 Z" fill="${p.a}"/>
    <path d="M34 54 C46 60 56 60 66 54" stroke="${p.b}" stroke-width="2.2" fill="none" opacity=".5"/>
    ${shine(41, 60, 6, 9, 10, 0.3)}
    ${leaf(50, 46, -100, 0.8, '#4C7A34', '#365C22')}
    ${leaf(50, 46, -62, 0.72, '#5C8A3C', '#365C22')}
    ${leaf(50, 46, -138, 0.72, '#5C8A3C', '#365C22')}`,

  tuber: (p) => `
    <path d="M26 58 C24 42 44 34 60 36 C76 38 82 52 78 64 C74 78 56 84 42 78 C30 73 27 68 26 58 Z" fill="${p.a}"/>
    ${[[42, 52], [58, 48], [64, 64], [46, 68], [70, 55]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="3" ry="2.2" fill="${p.b}" opacity=".65"/>`).join('')}
    ${shine(40, 46, 8, 5)}`,

  // cabbage, lettuce — nested leaves
  head: (p) => `
    <circle cx="50" cy="58" r="30" fill="${p.a}"/>
    <path d="M22 58 C34 44 66 44 78 58" stroke="${p.b}" stroke-width="2.4" fill="none" opacity=".7"/>
    <path d="M27 70 C38 56 62 56 73 70" stroke="${p.b}" stroke-width="2.4" fill="none" opacity=".7"/>
    <path d="M50 28 C40 42 40 74 50 88" stroke="${p.b}" stroke-width="2.4" fill="none" opacity=".55"/>
    ${shine(38, 44, 9, 6)}`,

  // spinach, chard, kale, herbs — a fan of leaves
  bunch: (p) => `
    ${stem(50, 88, 50, 56, p.b, 3.4)}
    ${leaf(50, 60, -150, 0.95, p.a, p.b)}
    ${leaf(50, 60, -30, 0.95, p.a, p.b)}
    ${leaf(50, 52, -110, 0.85, p.a2 || p.a, p.b)}
    ${leaf(50, 52, -70, 0.85, p.a2 || p.a, p.b)}
    ${leaf(50, 44, -90, 0.8, p.a, p.b)}`,

  // cauliflower, broccoli — curd on a stalk
  floret: (p) => `
    ${leaf(50, 66, -160, 0.9, '#5C8A3C', '#3F5A22')}
    ${leaf(50, 66, -20, 0.9, '#5C8A3C', '#3F5A22')}
    ${stem(50, 84, 50, 58, '#6B9440', 5)}
    ${[[50, 42, 15], [36, 50, 11], [64, 50, 11], [42, 58, 9], [58, 58, 9], [50, 55, 10]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.a}"/>`).join('')}
    ${[[44, 40], [56, 40], [50, 34], [38, 48], [62, 48]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="4" fill="${p.b}" opacity=".5"/>`).join('')}`,

  // onion, garlic
  bulb: (p) => `
    <path d="M50 90 C30 80 26 60 34 48 C40 39 60 39 66 48 C74 60 70 80 50 90 Z" fill="${p.a}"/>
    ${[-14, -7, 0, 7, 14].map((d) =>
      `<path d="M${50 + d} 44 C${50 + d * 1.4} 60 ${50 + d * 1.4} 78 50 90"
             stroke="${p.b}" stroke-width="1.8" fill="none" opacity=".55"/>`).join('')}
    <path d="M50 44 L44 26 M50 44 L50 24 M50 44 L57 27" stroke="#8A9A4A" stroke-width="3"
          fill="none" stroke-linecap="round"/>`,

  // peas, broad bean
  pod: (p) => `
    <path d="M22 66 C30 40 70 34 82 44 C72 66 44 82 22 66 Z" fill="${p.a}"/>
    <path d="M24 64 C34 44 68 39 79 46" stroke="${p.b}" stroke-width="2.4" fill="none"/>
    ${[[38, 58], [50, 54], [62, 50]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="7" fill="${p.b}" opacity=".85"/>
       <circle cx="${x - 2}" cy="${y - 2}" r="2" fill="#fff" opacity=".35"/>`).join('')}
    ${stem(82, 44, 88, 34, '#5C7A34', 3)}`,

  // barley, wheat, quinoa, amaranth, mustard
  grain: (p) => {
    const ears = [];
    for (let i = 0; i < 7; i++) {
      const y = 30 + i * 7;
      ears.push(`<ellipse cx="${43}" cy="${y}" rx="7" ry="4.4" fill="${p.a}" transform="rotate(-28 43 ${y})"/>`);
      ears.push(`<ellipse cx="${57}" cy="${y + 3}" rx="7" ry="4.4" fill="${p.a2 || p.a}" transform="rotate(28 57 ${y + 3})"/>`);
    }
    const awns = p.awns
      ? [0, 1, 2, 3, 4].map((i) => `<path d="M${44 + i * 3} 28 L${40 + i * 5} 8"
          stroke="${p.b}" stroke-width="1.3" opacity=".7"/>`).join('')
      : '';
    return `${awns}<path d="M50 92 L50 34" stroke="${p.b}" stroke-width="3.4" stroke-linecap="round"/>
            ${ears.join('')}
            <ellipse cx="50" cy="26" rx="6" ry="7" fill="${p.a}"/>`;
  },

  // tomato, capsicum, cucumber
  fruitveg: (p) => (p.long ? `
    <rect x="36" y="26" width="28" height="60" rx="14" fill="${p.a}"/>
    ${[-7, 0, 7].map((d) => `<path d="M${50 + d} 32 L${50 + d} 80" stroke="${p.b}"
      stroke-width="1.8" opacity=".5"/>`).join('')}
    ${shine(43, 44, 4, 11, 0, 0.3)}
    ${stem(50, 26, 50, 16, '#5C7A34', 4)}` : `
    <path d="M50 88 C28 88 22 70 24 56 C26 42 38 34 50 34 C62 34 74 42 76 56 C78 70 72 88 50 88 Z" fill="${p.a}"/>
    ${shine(38, 50, 9, 7)}
    <path d="M42 34 L50 26 L58 34 L54 38 L50 32 L46 38 Z" fill="#4C7A34"/>
    ${stem(50, 28, 50, 18, '#4C7A34', 3.4)}`),

  // seed packet
  packet: (p) => `
    <rect x="26" y="24" width="48" height="60" rx="6" fill="${p.a}"/>
    <path d="M26 30 L74 30" stroke="${p.b}" stroke-width="2.4"/>
    <rect x="34" y="38" width="32" height="24" rx="4" fill="#fff" opacity=".85"/>
    ${[[42, 50], [50, 46], [58, 50], [46, 56], [54, 56]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="4.4" fill="${p.b}" transform="rotate(20 ${x} ${y})"/>`).join('')}
    <path d="M34 70 L66 70 M34 76 L58 76" stroke="#fff" stroke-width="2.6" opacity=".7" stroke-linecap="round"/>`,

  sapling: (p) => `
    <path d="M32 74 L68 74 L63 92 L37 92 Z" fill="#B07A44"/>
    <path d="M30 70 L70 70 L70 76 L30 76 Z" fill="#8A5C30"/>
    ${stem(50, 70, 50, 40, '#5C7A34', 3.4)}
    ${leaf(50, 52, -160, 0.85, p.a, p.b)}
    ${leaf(50, 52, -20, 0.85, p.a, p.b)}
    ${leaf(50, 40, -150, 0.7, p.a, p.b)}
    ${leaf(50, 40, -30, 0.7, p.a, p.b)}`,

  jar: (p) => `
    <rect x="30" y="22" width="40" height="10" rx="3" fill="#8A6A3A"/>
    <path d="M32 32 L68 32 L72 50 L72 84 Q72 90 66 90 L34 90 Q28 90 28 84 L28 50 Z" fill="${p.a}" opacity=".55"/>
    <path d="M33 56 L67 56 L67 84 Q67 86 65 86 L35 86 Q33 86 33 84 Z" fill="${p.b}"/>
    ${[[42, 64], [54, 62], [48, 72], [60, 72], [40, 76]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="4.5" fill="${p.a}"/>`).join('')}
    ${shine(38, 46, 4, 10, 0, 0.4)}`,

  dairy: (p) => `
    <path d="M30 44 L70 44 L74 88 Q74 92 70 92 L30 92 Q26 92 26 88 Z" fill="${p.a}"/>
    <path d="M38 20 L62 20 L64 34 L36 34 Z" fill="${p.a}" opacity=".85"/>
    <path d="M36 34 L64 34 L70 44 L30 44 Z" fill="${p.b}"/>
    <rect x="34" y="56" width="32" height="20" rx="4" fill="#fff" opacity=".75"/>
    ${shine(36, 60, 3, 9, 0, 0.3)}`,

  bundle: (p) => `
    ${[-16, -8, 0, 8, 16].map((d, i) =>
      `<path d="M${50 + d} 88 C${50 + d * 1.3} 60 ${50 + d * 1.8} 40 ${50 + d * 2.2} 22"
             stroke="${i % 2 ? p.a2 || p.a : p.a}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join('')}
    <rect x="30" y="58" width="40" height="9" rx="4" fill="${p.b}"/>
    <rect x="30" y="72" width="40" height="9" rx="4" fill="${p.b}"/>`,

  basket: (p) => `
    <path d="M22 50 L78 50 L70 88 Q70 90 68 90 L32 90 Q30 90 30 88 Z" fill="${p.a}"/>
    ${[-18, -9, 0, 9, 18].map((d) =>
      `<path d="M${50 + d} 52 L${50 + d * 0.75} 88" stroke="${p.b}" stroke-width="2" opacity=".6"/>`).join('')}
    <path d="M24 58 L76 58 M26 70 L74 70" stroke="${p.b}" stroke-width="2.4" opacity=".6"/>
    <path d="M32 50 Q50 24 68 50" stroke="${p.b}" stroke-width="4.5" fill="none"/>`,

  // asparagus spears
  spear: (p) => `
    ${[[40, -6], [50, 0], [60, 6]].map(([x, r]) => `
      <g transform="translate(${x} 0) rotate(${r} ${x} 60)">
        <rect x="${x - 5}" y="34" width="10" height="54" rx="5" fill="${p.a}"/>
        <path d="M${x - 5} 40 Q${x} 28 ${x + 5} 40 Z" fill="${p.b}"/>
        ${[38, 44, 50, 56].map((y) => `<path d="M${x - 5} ${y} L${x + 5} ${y - 2}"
           stroke="${p.b}" stroke-width="1.5" opacity=".7"/>`).join('')}
      </g>`).join('')}`,

  // hop cones
  cone: (p) => `
    ${stem(50, 90, 50, 30, '#6B8A3A', 3)}
    ${[[36, 44], [64, 52], [46, 66]].map(([x, y]) => `
      <g transform="translate(${x} ${y})">
        ${[0, 6, 12, 18].map((d, i) => `<ellipse cx="0" cy="${d}" rx="${11 - i * 1.6}" ry="5"
           fill="${i % 2 ? p.a2 || p.a : p.a}"/>`).join('')}
      </g>`).join('')}
    ${leaf(50, 34, -140, 0.6, '#5C8A3C', '#3F5A22')}`,

  // rhodiola — alpine rosette with a flower head
  alpine: (p) => `
    <path d="M32 88 Q50 82 68 88" stroke="#8A7A5A" stroke-width="3" fill="none"/>
    ${stem(50, 88, 50, 44, '#6B8A4A', 3.4)}
    ${[[38, 62, -150], [62, 62, -30], [36, 74, -160], [64, 74, -20]].map(([x, y, r]) =>
      leaf(x, y, r, 0.55, '#7A9A5A', '#5A7A3A')).join('')}
    ${[[50, 36, 9], [40, 42, 7], [60, 42, 7]].map(([x, y, rr]) =>
      `<circle cx="${x}" cy="${y}" r="${rr}" fill="${p.a}"/>`).join('')}
    ${[[50, 36], [40, 42], [60, 42]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="2.6" fill="${p.b}"/>`).join('')}`,

  compost: (p) => `
    <path d="M20 78 Q50 52 80 78 Q80 88 74 88 L26 88 Q20 88 20 78 Z" fill="${p.a}"/>
    ${[[36, 76], [50, 70], [64, 76], [44, 82], [58, 82]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.4" fill="${p.b}" opacity=".6"/>`).join('')}
    ${leaf(56, 56, -40, 0.6, '#5C8A3C', '#3F5A22')}
    ${leaf(44, 58, -140, 0.55, '#6B9440', '#3F5A22')}`,

  honey: (p) => `
    <path d="M36 24 L64 24 L64 32 L70 40 L70 86 Q70 90 66 90 L34 90 Q30 90 30 86 L30 40 L36 32 Z" fill="${p.a}"/>
    <rect x="34" y="52" width="32" height="24" rx="3" fill="#fff" opacity=".8"/>
    ${[[44, 60], [56, 60], [50, 68]].map(([x, y]) =>
      `<path d="M${x} ${y - 4} L${x + 3.5} ${y - 2} L${x + 3.5} ${y + 2} L${x} ${y + 4}
                L${x - 3.5} ${y + 2} L${x - 3.5} ${y - 2} Z" fill="${p.b}"/>`).join('')}
    ${shine(37, 44, 3, 8, 0, 0.45)}`,

  bottle: (p) => `
    <rect x="44" y="16" width="12" height="14" rx="3" fill="#7A6A4A"/>
    <path d="M42 30 L58 30 L68 48 L68 86 Q68 90 64 90 L36 90 Q32 90 32 86 L32 48 Z" fill="${p.a}" opacity=".6"/>
    <path d="M35 54 L65 54 L65 86 Q65 87 64 87 L36 87 Q35 87 35 86 Z" fill="${p.b}"/>
    ${shine(39, 46, 3, 9, 0, 0.5)}`,

  wool: (p) => `
    <ellipse cx="50" cy="62" rx="30" ry="24" fill="${p.a}"/>
    ${[[36, 52], [52, 46], [66, 54], [40, 70], [58, 72], [50, 60]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="11" fill="${p.a2 || p.a}" opacity=".9"/>`).join('')}
    <path d="M30 74 Q50 84 70 72" stroke="${p.b}" stroke-width="2.6" fill="none" opacity=".6"/>`,
};

// ── crop → shape + palette ────────────────────────────────────────────────
const G = { a: '#5C8A3C', b: '#3F5A22', a2: '#6FA048' };       // green
const P = (a, b, extra = {}) => ({ a, b, ...extra });

const MAP = {
  // vegetables
  turnip:      ['bulbroot', P('#E8DFF0', '#B49BC8')],
  radish:      ['root', P('#E05A6A', '#B03848')],
  potato:      ['tuber', P('#C99A5E', '#8A6236')],
  cabbage:     ['head', P('#8FBF6A', '#5F8F3C')],
  cauliflower: ['floret', P('#F4EDD8', '#D9CBA4')],
  kohlrabi:    ['bulbroot', P('#9FC98A', '#6E9455')],
  spinach:     ['bunch', P('#3F7A34', '#2A5522', { a2: '#4E9040' })],
  chard:       ['bunch', P('#4C8A3C', '#B03848', { a2: '#5C9A45' })],
  kale:        ['bunch', P('#2F6B4A', '#1E4A33', { a2: '#3E7F5A' })],
  pakchoi:     ['bunch', P('#6FA048', '#D8E4C0', { a2: '#8FBF6A' })],
  lettuce:     ['head', P('#A8CE7A', '#7BA84E')],
  coriander:   ['bunch', P('#5FA046', '#3F7030', { a2: '#72B356' })],
  onion:       ['bulb', P('#D9A05A', '#A9743A')],
  garlic:      ['bulb', P('#F2E9DC', '#C9B99E')],
  carrot:      ['root', P('#E88A2F', '#B85F14')],
  beetroot:    ['bulbroot', P('#9E2B54', '#6E163A')],
  peas_green:  ['pod', P('#7FB550', '#4E8030')],
  broadbean:   ['pod', P('#8FBF6A', '#5F8F3C')],
  pumpkin:     ['gourd', P('#E07A2F', '#B05614')],
  tomato:      ['fruitveg', P('#D8452F', '#A02A18')],
  cucumber:    ['fruitveg', P('#4C8A3C', '#33612A', { long: true })],
  capsicum:    ['fruitveg', P('#4EA045', '#2F7030')],
  broccoli:    ['floret', P('#4C8A4C', '#33612A')],
  mint:        ['bunch', P('#4EA05C', '#2F7040', { a2: '#62B870' })],

  // fruit and nuts
  apricot:      ['stone', P('#F0A03A', '#C9701A')],
  apricot_rk:   ['stone', P('#F5B04A', '#D08020')],
  apple:        ['pome', P('#D8452F', '#A02A18')],
  walnut:       ['nut', P('#B98A52', '#8A6236')],
  almond:       ['nut', P('#D9B98A', '#A98A5A')],
  seabuckthorn: ['berries', P('#F0A828', '#C97E10')],
  mulberry:     ['berries', P('#6A2A54', '#45163A')],
  grape:        ['berries', P('#7A4A9A', '#523070')],
  blackcurrant: ['berries', P('#3A2450', '#241436')],
  strawberry:   ['strawberry', P('#D8322F', '#A01818')],
  melon:        ['gourd', P('#8FBF5A', '#5F8F3C')],
  pear:         ['pome', P('#C9C24A', '#98922A')],

  // grain and flour
  barley:     ['grain', P('#D9B45A', '#A98A3A', { awns: true, a2: '#E3C270' })],
  tsampa:     ['jar', P('#D9B45A', '#C9A44A')],
  wheat:      ['grain', P('#E0BC62', '#B0913A', { awns: true, a2: '#EACB78' })],
  wheatflour: ['jar', P('#EDE2CC', '#DCCFB4')],
  buckwheat:  ['grain', P('#C0A878', '#8F7A4A', { a2: '#D0BA90' })],
  peas_dry:   ['pod', P('#9AA84A', '#6E7A2A')],
  quinoa:     ['grain', P('#E0705A', '#B04434', { a2: '#EE8C74' })],
  amaranth:   ['grain', P('#C0304A', '#8A1830', { a2: '#D8485F' })],
  mustardoil: ['grain', P('#F0C82A', '#C09A10', { a2: '#F7D850' })],

  // seeds and saplings
  seed_veg:      ['packet', P('#4C8A3C', '#33612A')],
  seed_grain:    ['packet', P('#C9A44A', '#9A7A2A')],
  seed_potato:   ['packet', P('#B98A52', '#8A6236')],
  sapling_fruit: ['sapling', P('#5C8A3C', '#3F5A22')],
  sapling_tree:  ['sapling', P('#6B9A5A', '#47703A')],
  seedling:      ['sapling', P('#7FB550', '#4E8030')],
  compost:       ['compost', P('#6B5230', '#47341A')],

  // dairy
  butter:    ['dairy', P('#F0D060', '#D8B03A')],
  churpe:    ['dairy', P('#E8DCC0', '#C9B894')],
  milk:      ['dairy', P('#F4F1E8', '#D8D2C2')],
  curd:      ['dairy', P('#F7F4EC', '#DCD6C6')],
  yakcheese: ['dairy', P('#E3D2A8', '#C0AA78')],

  // dried and preserved
  phating:    ['jar', P('#E09A3A', '#C07A1A')],
  kernel:     ['jar', P('#D9B98A', '#B08A5A')],
  apricotoil: ['bottle', P('#F0C050', '#D8A430')],
  sbt_juice:  ['bottle', P('#F0A828', '#D88A10')],
  dryveg:     ['jar', P('#8A9A4A', '#6A7A2A')],
  honey:      ['honey', P('#E8A82A', '#C98410')],
  herbs_dry:  ['jar', P('#6B8A4A', '#4A6A2A')],

  // other
  fodder:     ['bundle', P('#9AB05A', '#7A6A3A', { a2: '#B0C070' })],
  wool:       ['wool', P('#F0EAE0', '#C9BEA8', { a2: '#F7F3EC' })],
  basket:     ['basket', P('#C9A46A', '#9A7A42')],
  other_item: ['basket', P('#C0B49A', '#948870')],
};

// Seed-bank entries that are not themselves a sellable crop.
const SEED_MAP = {
  asparagus:        ['spear', P('#5C8A4C', '#3F6A32')],
  hops:             ['cone', P('#8FB05A', '#6A8A3A', { a2: '#A0C46C' })],
  rhodiola:         ['alpine', P('#E0A82A', '#B07A10')],
  fodderbeet:       ['bulbroot', P('#D8802A', '#A85A10')],
  buckwheat_bitter: ['grain', P('#B09868', '#7F6A3A', { a2: '#C0A878' })],
  garlic_local:     ['bulb', P('#F2E9DC', '#C9B99E')],
  barley_naked:     ['grain', P('#D9B45A', '#A98A3A', { awns: true, a2: '#E3C270' })],
  seedpotato:       ['tuber', P('#C99A5E', '#8A6236')],
  alfalfa:          ['bundle', P('#7FA84A', '#5F7A2A', { a2: '#93BC5E' })],
  cherrytomato:     ['fruitveg', P('#E0452F', '#A82A18')],
};

// Category tiles reuse a representative crop's drawing.
export const CATEGORY_ART = {
  veg: 'cabbage', fruit: 'apricot', grain: 'barley', seed: 'seed_veg',
  dairy: 'butter', dry: 'phating', other: 'basket',
};

const render = ([shape, palette]) => svg(SHAPE[shape](palette));

// Markup for a crop, a seed-bank entry, or a category. Falls back to a basket
// rather than throwing, so a new catalogue entry never breaks a screen.
export function art(key) {
  if (!key) return render(MAP.other_item);
  if (SEED_MAP[key]) return render(SEED_MAP[key]);
  if (MAP[key]) return render(MAP[key]);
  return render(MAP.other_item);
}

export const categoryArt = (catKey) => art(CATEGORY_ART[catKey] || 'other_item');

// An <img>-like element ready to drop into a card.
export function artEl(key, cls = '') {
  const d = document.createElement('div');
  d.className = 'art ' + cls;
  d.innerHTML = art(key);
  return d;
}

export const hasArt = (key) => !!(MAP[key] || SEED_MAP[key]);
