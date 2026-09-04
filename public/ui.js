// Tiny DOM helpers. No framework — this has to load fast on a 2G tail and a
// five-year-old Android.
import { t, isRTL, getLang } from './i18n.js';

// Localised display name for a catalogue entry. Categories carry `label`,
// crops/seeds/zones carry `name`/`label`; both fall back to English.
export const nm = (x) => {
  if (!x) return '';
  const tr = x.i18n && x.i18n[getLang()];
  return tr || x.name || x.label || '';
};

export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  let hasText = false;
  for (const kid of kids.flat(3)) {
    if (kid === null || kid === undefined || kid === false) continue;
    if (kid instanceof Node) el.append(kid);
    else { hasText = true; el.append(document.createTextNode(String(kid))); }
  }
  // This app mixes scripts on one screen — Urdu chrome around English agronomy
  // notes, Ladakhi names beside Devanagari. Letting each label take its
  // direction from its own text stops punctuation jumping to the wrong end.
  if (hasText && !el.hasAttribute('dir')) el.setAttribute('dir', 'auto');
  return el;
}

export const $ = (sel, root = document) => root.querySelector(sel);

export function toast(msg, ms = 2600) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), ms);
}

// One bottom sheet, reused. Returns a close function.
export function sheet(title, ...content) {
  const wrap = $('#sheet');
  const box = $('.sheet', wrap);
  box.replaceChildren(
    title ? h('h3', {}, title) : null,
    ...content,
  );
  wrap.hidden = false;
  document.body.style.overflow = 'hidden';
  return closeSheet;
}

export function closeSheet() {
  $('#sheet').hidden = true;
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-sheet]')) closeSheet();
});

// ── formatting ─────────────────────────────────────────────────────────────
export const rupee = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const UNIT_WORDS = {
  kg:      ['kg', 'किलो', 'kg', 'کلو'],
  quintal: ['quintal', 'क्विंटल', 'quintal', 'کوئنٹل'],
  bag:     ['bag', 'बोरी', 'bag', 'بوری'],
  bundle:  ['bundle', 'गट्ठर', 'bundle', 'گٹھا'],
  dozen:   ['dozen', 'दर्जन', 'dozen', 'درجن'],
  piece:   ['piece', 'नग', 'piece', 'عدد'],
  litre:   ['litre', 'लीटर', 'litre', 'لیٹر'],
  packet:  ['packet', 'पैकेट', 'packet', 'پیکٹ'],
  sapling: ['sapling', 'पौधा', 'sapling', 'پودا'],
};
const LANG_COL = { en: 0, hi: 1, lbj: 2, ur: 3 };

export function unitLabel(unit) {
  const row = UNIT_WORDS[unit];
  return row ? (row[LANG_COL[getLang()] ?? 0] || row[0]) : unit;
}

export function ago(ts) {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d <= 0) return t('today');
  if (d === 1) return t('yesterday');
  return `${d} ${t('days_ago')}`;
}

export function clock(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const initials = (name) =>
  String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Speak a label aloud. Low-literacy users lean on this; it silently does
// nothing where the browser has no matching voice, which is fine.
export function speak(text, lang) {
  if (!('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = { hi: 'hi-IN', ur: 'ur-PK', en: 'en-IN', lbj: 'hi-IN' }[lang] || 'en-IN';
    u.rate = 0.92;
    speechSynthesis.speak(u);
  } catch {}
}

export function avatar(user, size = 46) {
  const box = h('div', { class: 'avatar', style: `width:${size}px;height:${size}px;font-size:${size / 2.6}px` });
  if (user && user.photoId) box.append(h('img', { src: `/photo/${user.photoId}`, alt: '', loading: 'lazy' }));
  else box.textContent = initials(user && user.name);
  return box;
}

export function flagstrip() {
  return h('div', { class: 'flagstrip', 'aria-hidden': 'true' },
    h('i'), h('i'), h('i'), h('i'), h('i'));
}

export function topbar(title, { sub, back, actions } = {}) {
  return h('div', { class: 'topbar' },
    h('div', { class: 'topbar-row' },
      back ? h('button', {
        class: 'topbar-btn', 'aria-label': t('back'),
        onclick: back === true ? () => history.back() : back,
      }, isRTL() ? '→' : '←') : null,
      h('div', { class: 'grow' },
        h('h2', {}, title),
        sub ? h('div', { class: 'sub' }, sub) : null),
      ...(actions || []),
    ),
    flagstrip(),
  );
}

export function empty(icon, title, sub, action) {
  return h('div', { class: 'empty' },
    h('div', { class: 'ico' }, icon),
    h('b', {}, title),
    sub ? h('div', { class: 'small' }, sub) : null,
    action ? h('div', { style: 'margin-top:18px' }, action) : null);
}

export function banner(text, kind = '', icon = 'ℹ️') {
  return h('div', { class: `banner ${kind}` }, h('span', { class: 'ico' }, icon), h('div', {}, text));
}

// Downscale a camera photo in the browser. A raw phone photo is 4 MB and would
// never upload from a village tower; this gets it to roughly 60–120 KB.
export function shrinkImage(file, max = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read that photo'))), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that photo')); };
    img.src = url;
  });
}
