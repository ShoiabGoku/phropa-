// Boot, router and bottom navigation.
import { h, $, toast } from './ui.js';
import { t, initLang, getLang } from './i18n.js';
import { state, loadCatalogue, loadMe, api } from './store.js';
import * as V from './views.js';

const app = $('#app');
let deferredPrompt = null;
let needsLanguagePick = false;

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

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
    app.replaceChildren(node, nav(tab));
    window.scrollTo(0, 0);
  } catch (e) {
    if (my !== token) return;
    app.replaceChildren(
      h('div', { class: 'screen pad', style: 'padding-top:40px' },
        h('p', { class: 'err' }, e.message),
        h('button', { class: 'btn btn-primary btn-block', style: 'margin-top:12px', onclick: () => route() }, t('retry'))),
      nav(tab));
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
    await loadCatalogue();
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
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
})();
