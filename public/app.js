// Boot, router and bottom navigation.
import { h, $, toast, sheet, closeSheet, avatar } from './ui.js';
import { t, initLang, getLang } from './i18n.js';
import { state, boot as bootStore, loadMe, api } from './store.js';
import { localPersonas, localBecome, resetLocal } from './local-api.js';
import * as V from './views.js';

const app = $('#app');
let deferredPrompt = null;
let needsLanguagePick = false;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  V.setInstallPrompt(e);
  route();                       // repaint so the install card picks it up
});

// ── router ────────────────────────────────────────────────────────────────
const ROUTES = [
  [/^#?\/?$/,                 () => V.viewHome(),            'bazaar'],
  [/^#\/home$/,               () => V.viewHome(),            'bazaar'],
  [/^#\/c\/(.+)$/,            (m) => V.viewBrowse(m[1]),     'bazaar'],
  [/^#\/search\/(.+)$/,       (m) => V.viewBrowse(null, decodeURIComponent(m[1])), 'bazaar'],
  [/^#\/l\/(\d+)$/,           (m) => V.viewListing(m[1]),    'bazaar'],
  [/^#\/seller\/(\d+)$/,      (m) => V.viewSeller(m[1]),     'bazaar'],
  [/^#\/sell$/,               () => V.viewSell(),            'sell'],
  [/^#\/seeds$/,              () => V.viewSeeds(),           'seeds'],
  [/^#\/seed\/(.+)$/,         (m) => V.viewSeed(m[1]),       'seeds'],
  [/^#\/calendar$/,           () => V.viewCalendar(),        'seeds'],
  [/^#\/chats$/,              () => V.viewChats(),           'chats'],
  [/^#\/chat\/(\d+)$/,        (m) => V.viewChat(m[1]),       'chats'],
  [/^#\/rates$/,              () => V.viewRates(),           'bazaar'],
  [/^#\/wanted$/,             () => V.viewWanted(),          'bazaar'],
  [/^#\/notices$/,            () => V.viewNotices(),         'bazaar'],
  [/^#\/me$/,                 () => V.viewMe(deferredPrompt),'me'],
  [/^#\/mine$/,               () => V.viewMine(),            'me'],
  [/^#\/saved$/,              () => V.viewSaved(),           'me'],
  [/^#\/crop\/(.+)$/,         (m) => V.viewBrowse(null, null, m[1]), 'bazaar'],
  [/^#\/signup$/,             () => V.viewAuth('signup'),    'me'],
  [/^#\/login$/,              () => V.viewAuth('login'),     'me'],
];

let token = 0;
async function route() {
  const hash = location.hash || '#/home';
  const my = ++token;

  if (needsLanguagePick) {
    app.replaceChildren(V.viewLanguage(() => { needsLanguagePick = false; route(); }));
    return;
  }

  const hit = ROUTES.find(([rx]) => rx.test(hash));
  if (!hit) { location.hash = '#/home'; return; }

  const [rx, fn, tab] = hit;
  try {
    const node = await fn(hash.match(rx));
    if (my !== token) return;                  // a newer navigation won
    app.replaceChildren(node, nav(tab), demoFab());
    window.scrollTo(0, 0);
  } catch (e) {
    if (my !== token) return;
    app.replaceChildren(
      h('div', { class: 'screen pad', style: 'padding-top:40px' },
        h('p', { class: 'err' }, e.message),
        h('button', { class: 'btn btn-primary btn-block', style: 'margin-top:12px', onclick: () => route() }, t('retry'))),
      nav(tab), demoFab());
  }
}

// ── bottom nav ────────────────────────────────────────────────────────────
function nav(active) {
  const item = (key, icon, label, hash, extra) =>
    h('button', { class: (active === key ? 'on ' : '') + (extra || ''), onclick: () => (location.hash = hash) },
      h('span', { class: 'ico' }, icon),
      h('span', {}, label),
      key === 'chats' && state.unread
        ? h('span', { class: 'pip' }, state.unread > 9 ? '9+' : String(state.unread)) : null);

  return h('nav', { class: 'nav' },
    item('bazaar', '🏔', t('nav_bazaar'), '#/home'),
    item('seeds', '🌱', t('nav_seeds'), '#/seeds'),
    item('sell', '＋', t('nav_sell'), '#/sell', 'sellbtn'),
    item('chats', '💬', t('nav_chats'), '#/chats'),
    item('me', '👤', t('nav_me'), '#/me'));
}


// ── demo mode ─────────────────────────────────────────────────────────────
// With no server there is only one browser, so a two-sided handshake cannot be
// shown by two people. The persona switcher lets one person be each side in
// turn — agree as the buyer, become the seller, agree again, watch the phone
// numbers unlock.
function personaSheet() {
  const people = localPersonas();
  const rows = people.map((p) => h('button', {
    class: 'seller-row', style: 'width:100%;text-align:start;margin-bottom:8px',
    onclick: () => {
      localBecome(p.id);
      closeSheet();
      location.reload();
    },
  },
    avatar(p, 42),
    h('div', { class: 'grow' },
      h('b', {}, p.name),
      h('div', { class: 'tiny muted' },
        `${p.village}, ${(state.cat.DISTRICTS.find((d) => d.key === p.district) || {}).name || ''}`
        + (p.delivers ? ' · 🛵 delivers' : '')),
      p.bio ? h('div', { class: 'tiny muted truncate' }, p.bio) : null),
    state.user && state.user.id === p.id ? h('span', { class: 'badge badge-green' }, '✓') : null));

  sheet('🎭 Demo — become someone',
    h('p', { class: 'muted small', style: 'margin-top:0' },
      'This copy runs entirely in your browser. Nothing you do here reaches anyone else. '
      + 'Switch person to see both sides of a negotiation — the phone numbers only unlock '
      + 'when both of them have agreed the same terms.'),
    ...rows,
    h('button', {
      class: 'btn btn-block', style: 'margin-top:6px',
      onclick: async () => { await api('/api/logout', { method: 'POST' }); closeSheet(); location.reload(); },
    }, 'Browse as a guest'),
    h('button', {
      class: 'btn btn-ghost btn-block', style: 'margin-top:10px;color:var(--maroon)',
      onclick: () => { resetLocal(); closeSheet(); location.reload(); },
    }, '↺ Reset the demo data'));
}

function demoFab() {
  if (!state.local) return null;
  const who = state.user ? state.user.name.split(' ')[0] : 'Guest';
  return h('button', { class: 'demo-fab', onclick: personaSheet, 'aria-label': 'Demo persona' },
    h('span', {}, '🎭'), h('b', {}, who));
}

// ── unread badge ──────────────────────────────────────────────────────────
async function pollUnread() {
  if (!state.user || !navigator.onLine) return;
  try {
    const { unread } = await api('/api/updates');
    if (unread !== state.unread) {
      state.unread = unread;
      const n = $('.nav');
      if (n) n.replaceWith(nav(currentTab()));
    }
  } catch {}
}
const currentTab = () => {
  const hash = location.hash || '#/home';
  const hit = ROUTES.find(([rx]) => rx.test(hash));
  return hit ? hit[2] : 'bazaar';
};

// ── offline strip ─────────────────────────────────────────────────────────
function paintNet() {
  let bar = $('#netbar');
  if (state.online) { if (bar) bar.remove(); return; }
  if (bar) return;
  bar = h('div', { id: 'netbar', class: 'offline-bar' }, '📴 ' + t('offline'));
  document.body.prepend(bar);
}
document.addEventListener('net', paintNet);

// ── boot ──────────────────────────────────────────────────────────────────
(async function boot() {
  const firstRun = initLang();
  needsLanguagePick = firstRun;

  try {
    await bootStore();
  } catch (e) {
    $('#splash').classList.add('gone');
    app.hidden = false;
    app.replaceChildren(h('div', { class: 'pad', style: 'padding-top:60px' },
      h('p', { class: 'err' }, e.message),
      h('button', { class: 'btn btn-primary btn-block', style: 'margin-top:12px', onclick: () => location.reload() }, t('retry'))));
    return;
  }
  await loadMe();
  if (state.user && state.user.lang && !firstRun) {
    const { setLang } = await import('./i18n.js');
    if (state.user.lang !== getLang()) setLang(state.user.lang);
  }

  window.addEventListener('hashchange', route);
  await route();
  paintNet();

  app.hidden = false;
  setTimeout(() => {
    const s = $('#splash');
    s.classList.add('gone');
    setTimeout(() => s.remove(), 500);
  }, 420);

  pollUnread();
  setInterval(pollUnread, 25000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
