import { h, $, toast, sheet, closeSheet, rupee, unitLabel, ago, clock, avatar,
         topbar, empty, banner, shrinkImage, speak, flagstrip, nm } from './ui.js';
import { t, getLang, setLang, LANGS } from './i18n.js';
import { state, api, crop, category, district, zone, cacheListings, cachedListings,
         photoUrl } from './store.js';

export const go = (hash) => { location.hash = hash; };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ═══════════════════════════════════════════════════════════════════════════
// Onboarding
// ═══════════════════════════════════════════════════════════════════════════
export function viewLanguage(next) {
  return h('div', { class: 'screen' },
    h('div', { class: 'hero', style: 'padding-top:34px' },
      mountains(),
      h('div', { class: 'hero-greet', style: 'font-size:30px' }, 'Julley 👋'),
      h('div', { class: 'hero-sub' }, 'TSONGRA · Ladakh Local Market')),
    flagstrip(),
    h('div', { class: 'pad', style: 'padding-top:24px' },
      h('h3', { style: 'margin-bottom:4px' }, t('pick_lang')),
      h('p', { class: 'muted small', style: 'margin-top:0' }, 'Choose your language · अपनी भाषा चुनें'),
      h('div', { class: 'stack', style: 'margin-top:18px' },
        ...LANGS.map((l) => h('button', {
          class: 'btn btn-block',
          style: 'justify-content:space-between',
          onclick: () => { setLang(l.key); next(); },
        }, h('span', {}, l.native), h('span', { class: 'muted small' }, l.label))))));
}

export function viewAuth(mode = 'signup') {
  const D = state.cat.DISTRICTS;
  const err = h('div', { class: 'err', hidden: true });
  const f = {};
  const inp = (key, label, attrs = {}) => {
    f[key] = h('input', { class: 'input', ...attrs });
    return h('label', { class: 'field' }, h('span', {}, label), f[key]);
  };

  const distSel = h('select', { class: 'input', onchange: () => fillVillages() },
    ...D.map((d) => h('option', { value: d.key }, `${d.name} — ${d.hq}`)));
  const villSel = h('input', { class: 'input', list: 'villages', placeholder: '…' });
  const dl = h('datalist', { id: 'villages' });
  const fillVillages = () => {
    const d = D.find((x) => x.key === distSel.value) || D[0];
    dl.replaceChildren(...d.villages.map((v) => h('option', { value: v })));
  };
  fillVillages();

  let role = 'both';
  const roleBtns = [['both', '🤝', t('role_both')], ['seller', '🌾', t('role_seller')], ['buyer', '🧺', t('role_buyer')]]
    .map(([k, ico, lbl]) => h('button', {
      class: 'pick' + (k === role ? ' on' : ''), type: 'button',
      onclick: (e) => {
        role = k;
        e.currentTarget.parentElement.querySelectorAll('.pick').forEach((b) => b.classList.remove('on'));
        e.currentTarget.classList.add('on');
      },
    }, h('div', { class: 'ico' }, ico), h('div', { class: 'lbl' }, lbl)));

  const submit = async () => {
    err.hidden = true;
    btn.disabled = true;
    try {
      const payload = mode === 'signup'
        ? { name: f.name.value, phone: f.phone.value, pin: f.pin.value,
            district: distSel.value, village: villSel.value, role, lang: getLang() }
        : { phone: f.phone.value, pin: f.pin.value };
      const { user } = await api(mode === 'signup' ? '/api/signup' : '/api/login', { method: 'POST', body: payload });
      state.user = user;
      if (mode === 'login' && user.lang) setLang(user.lang);
      go('#/home');
      location.reload();
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
    } finally { btn.disabled = false; }
  };

  const btn = h('button', { class: 'btn btn-primary btn-block', onclick: submit },
    mode === 'signup' ? t('signup') : t('login'));

  return h('div', { class: 'screen' },
    topbar(mode === 'signup' ? t('signup') : t('login'), { sub: t('welcome') }),
    h('div', { class: 'pad', style: 'padding-top:18px' },
      err,
      h('div', { style: 'height:8px' }),
      mode === 'signup' ? inp('name', t('your_name'), { autocomplete: 'name' }) : null,
      inp('phone', t('phone_label'), { type: 'tel', inputmode: 'numeric', maxlength: 10, placeholder: '9419xxxxxx' }),
      inp('pin', mode === 'signup' ? t('pin_label') : t('pin_login'),
        { type: 'password', inputmode: 'numeric', maxlength: 6, placeholder: '••••' }),
      mode === 'signup' ? h('label', { class: 'field' }, h('span', {}, t('district_label')), distSel) : null,
      mode === 'signup' ? h('label', { class: 'field' }, h('span', {}, t('village_label')), villSel, dl) : null,
      mode === 'signup' ? h('div', { class: 'field' },
        h('span', {}, t('role_label')),
        h('div', { class: 'pick-grid' }, ...roleBtns)) : null,
      banner(t('phone_never'), '', '🔒'),
      h('div', { style: 'height:16px' }),
      btn,
      h('button', {
        class: 'btn btn-ghost btn-block', style: 'margin-top:10px',
        onclick: () => go(mode === 'signup' ? '#/login' : '#/signup'),
      }, mode === 'signup' ? t('have_account') : t('new_here'))));
}

// ═══════════════════════════════════════════════════════════════════════════
// Home
// ═══════════════════════════════════════════════════════════════════════════
function mountains() {
  return h('div', { class: 'mountains', html:
    `<svg viewBox="0 0 400 70" preserveAspectRatio="none" style="width:100%;height:70px">
      <path d="M0 70 L48 26 L78 48 L120 12 L165 52 L210 20 L248 46 L292 8 L340 44 L372 24 L400 58 L400 70 Z" fill="#fff"/>
    </svg>` });
}

export async function viewHome() {
  const root = h('div', { class: 'screen' });
  const u = state.user;
  const search = h('input', {
    class: '', placeholder: t('search_ph'), 'aria-label': t('search_ph'),
    onkeydown: (e) => { if (e.key === 'Enter' && e.target.value.trim()) go('#/search/' + encodeURIComponent(e.target.value.trim())); },
  });

  const mic = h('button', { class: 'mic', 'aria-label': 'Voice search', onclick: () => voiceSearch(search, mic) });
  mic.textContent = '🎤';

  root.append(
    h('div', { class: 'hero' },
      mountains(),
      h('div', { style: 'padding-top:max(14px,env(safe-area-inset-top))' }),
      h('div', { class: 'row-between', style: 'position:relative' },
        h('div', {},
          h('div', { class: 'hero-greet' }, `${t('greet')}${u ? ', ' + u.name.split(' ')[0] : ''} 👋`),
          h('div', { class: 'hero-sub' }, t('greet_sub'))),
        h('button', { class: 'topbar-btn', onclick: () => go('#/notices'), 'aria-label': t('notices_title') }, '🔔')),
      h('div', { class: 'search' }, search, mic)),
    flagstrip(),
  );

  // Categories
  root.append(
    h('div', { class: 'section-title' }, t('browse_cat')),
    h('div', { class: 'cats' },
      ...state.cat.CATEGORIES.map((c) => h('button', {
        class: 'cat', onclick: () => go('#/c/' + c.key),
        oncontextmenu: (e) => { e.preventDefault(); speak(c.label, getLang()); },
      },
        h('div', { class: 'ico' }, c.icon),
        h('div', { class: 'lbl' }, nm(c)),
        h('div', { class: 'loc' }, c.local)))),
  );

  // The four things that make this app worth opening even when you are not buying.
  root.append(h('div', { class: 'quick' },
    quickCard('🌱', t('seedbank_title'), t('seedbank_sub'), '#/seeds'),
    quickCard('📊', t('rates_title'), t('rates_sub'), '#/rates'),
    quickCard('🙋', t('wanted_title'), t('wanted_sub'), '#/wanted'),
    quickCard('📢', t('notices_title'), t('notices_sub'), '#/notices'),
  ));

  root.append(h('div', { class: 'section-title' }, t('fresh_today'),
    h('button', { class: 'tiny', style: 'color:var(--turq);font-weight:700', onclick: () => go('#/c/all') }, t('see_all'))));

  const slot = h('div', { class: 'list' }, h('div', { class: 'muted pad small' }, t('loading')));
  root.append(slot);
  fetchListings({}, 'home').then((ls) => {
    slot.replaceChildren(...(ls.length
      ? ls.slice(0, 8).map(listingCard)
      : [empty('🧺', t('nothing_yet'), t('nothing_yet_sub'),
          h('button', { class: 'btn btn-primary', onclick: () => go('#/sell') }, t('sell_title')))]));
  }).catch((e) => slot.replaceChildren(h('div', { class: 'pad muted small' }, e.message)));

  return root;
}

const quickCard = (ico, title, sub, hash) =>
  h('button', { class: 'quick-card', onclick: () => go(hash) },
    h('span', { class: 'ico' }, ico),
    h('span', {}, h('b', {}, title), h('span', {}, sub)));

function voiceSearch(input, mic) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Voice search is not available on this phone'); return; }
  const r = new SR();
  r.lang = { hi: 'hi-IN', ur: 'ur-PK', en: 'en-IN', lbj: 'hi-IN' }[getLang()] || 'en-IN';
  r.onstart = () => mic.classList.add('live');
  r.onend = () => mic.classList.remove('live');
  r.onresult = (e) => {
    const said = e.results[0][0].transcript.trim();
    input.value = said;
    if (said) go('#/search/' + encodeURIComponent(said));
  };
  r.onerror = () => { mic.classList.remove('live'); toast('Could not hear that'); };
  r.start();
}

// ═══════════════════════════════════════════════════════════════════════════
// Browse / search
// ═══════════════════════════════════════════════════════════════════════════
async function fetchListings(params, cacheKey) {
  const qs = new URLSearchParams(params).toString();
  try {
    const { listings } = await api('/api/listings' + (qs ? '?' + qs : ''));
    cacheListings(cacheKey, listings);
    return listings;
  } catch (e) {
    const c = cachedListings(cacheKey);
    if (c) { toast(t('offline')); return c.listings; }
    throw e;
  }
}

export function listingCard(l) {
  return h('button', { class: 'lcard', onclick: () => go('#/l/' + l.id) },
    h('div', { class: 'lthumb' },
      l.photoId ? h('img', { src: photoUrl(l.photoId), alt: '', loading: 'lazy' }) : l.icon),
    h('div', { class: 'lbody' },
      h('div', { class: 'lname' }, l.title),
      h('div', { class: 'lloc' }, `${l.village || district(l.district).name} · ${ago(l.createdAt)}`),
      h('div', { class: 'lprice' }, rupee(l.price), h('small', {}, ` / ${unitLabel(l.unit)}`)),
      h('div', { class: 'lbadges' },
        l.deliversToMe ? h('span', { class: 'badge badge-turq' }, '🛵 ' + t('delivers_badge')) : null,
        l.organic ? h('span', { class: 'badge badge-green' }, '🌿 ' + t('organic_badge')) : null,
        l.negotiable ? h('span', { class: 'badge' }, '💬 ' + t('negotiable')) : null,
        l.qty ? h('span', { class: 'badge badge-gold' }, `${l.qty} ${unitLabel(l.unit)} ${t('available')}`) : null)));
}

export async function viewBrowse(catKey, searchQ) {
  const c = catKey && catKey !== 'all' ? category(catKey) : null;
  const filters = { deliver: false, organic: false, sort: 'new' };
  if (catKey && catKey !== 'all') filters.cat = catKey;
  if (searchQ) filters.q = searchQ;

  const list = h('div', { class: 'list' }, h('div', { class: 'muted pad small' }, t('loading')));

  const chip = (label, on, onclick) =>
    h('button', { class: 'chip' + (on ? ' on' : ''), onclick }, label);

  const chipRow = h('div', { class: 'chip-row' });
  const renderChips = () => chipRow.replaceChildren(
    chip('🛵 ' + t('filter_deliver'), filters.deliver, () => { filters.deliver = !filters.deliver; renderChips(); load(); }),
    chip('🌿 ' + t('filter_organic'), filters.organic, () => { filters.organic = !filters.organic; renderChips(); load(); }),
    chip('🆕 ' + t('sort_new'), filters.sort === 'new', () => { filters.sort = 'new'; renderChips(); load(); }),
    chip('💰 ' + t('sort_cheap'), filters.sort === 'price', () => { filters.sort = 'price'; renderChips(); load(); }),
  );
  renderChips();

  const load = async () => {
    list.replaceChildren(h('div', { class: 'muted pad small' }, t('loading')));
    const p = { sort: filters.sort };
    if (filters.cat) p.cat = filters.cat;
    if (filters.q) p.q = filters.q;
    if (filters.deliver) p.delivers = '1';
    if (filters.organic) p.organic = '1';
    try {
      const ls = await fetchListings(p, 'browse.' + (filters.cat || filters.q || 'all'));
      list.replaceChildren(...(ls.length ? ls.map(listingCard)
        : [empty(c ? c.icon : '🔍', t('nothing_yet'), t('nothing_yet_sub'),
            h('button', { class: 'btn btn-primary', onclick: () => go('#/sell') }, t('sell_title')))]));
    } catch (e) {
      list.replaceChildren(h('div', { class: 'pad muted small' }, e.message));
    }
  };
  load();

  return h('div', { class: 'screen' },
    topbar(searchQ ? `“${searchQ}”` : (c ? nm(c) : t('nav_bazaar')),
      { sub: c ? c.local : null, back: () => go('#/home') }),
    chipRow, list);
}

// ═══════════════════════════════════════════════════════════════════════════
// Listing detail
// ═══════════════════════════════════════════════════════════════════════════
export async function viewListing(id) {
  const root = h('div', { class: 'screen' }, h('div', { class: 'pad muted', style: 'padding-top:40px' }, t('loading')));
  let l;
  try { ({ listing: l } = await api('/api/listings/' + id)); }
  catch (e) { return h('div', { class: 'screen' }, topbar('', { back: true }), empty('😕', e.message, '')); }

  const c = crop(l.cropKey);
  const total = l.qty ? l.price * l.qty : null;

  const openChat = async () => {
    if (!state.user) { toast(t('need_login')); go('#/signup'); return; }
    try {
      const { thread } = await api('/api/threads', { method: 'POST', body: { listingId: l.id } });
      go('#/chat/' + thread.id);
    } catch (e) { toast(e.message); }
  };

  const actions = l.mine
    ? h('div', { class: 'sticky-actions' },
        h('button', { class: 'btn btn-ghost grow', onclick: () => ownerMenu(l) }, '⚙️ ' + t('my_listing')))
    : h('div', { class: 'sticky-actions' },
        h('button', { class: 'btn btn-primary btn-block', onclick: openChat }, '💬 ' + t('chat_now')));

  root.replaceChildren(
    topbar(l.title, { sub: c.local, back: () => history.back() }),
    h('div', { class: 'photo-big' },
      l.photoId ? h('img', { src: photoUrl(l.photoId), alt: l.title }) : l.icon),
    h('div', { class: 'pad', style: 'padding-top:14px' },
      h('div', { class: 'row-between' },
        h('div', {},
          h('div', { class: 'price-big' }, rupee(l.price), h('small', {}, ` / ${unitLabel(l.unit)}`)),
          h('div', { class: 'muted small' }, l.negotiable ? '💬 ' + t('negotiable') : '🔒 ' + t('fixed_price'))),
        h('button', {
          class: 'topbar-btn', style: 'background:var(--sand-2);color:var(--ink)',
          'aria-label': 'Speak', onclick: () => speak(`${l.title}. ${rupee(l.price)} ${unitLabel(l.unit)}`, getLang()),
        }, '🔊')),
      h('div', { class: 'lbadges', style: 'margin-top:10px' },
        l.deliversToMe ? h('span', { class: 'badge badge-turq' }, '🛵 ' + t('delivers_badge')) : null,
        l.organic ? h('span', { class: 'badge badge-green' }, '🌿 ' + t('organic_badge')) : null,
        c.local ? h('span', { class: 'badge badge-apricot' }, c.local) : null),
      l.note ? h('p', { style: 'margin-top:14px;line-height:1.55' }, l.note) : null,
      h('div', { class: 'card card-pad', style: 'margin-top:14px' },
        h('dl', { class: 'kv' },
          h('dt', {}, t('qty_avail')), h('dd', {}, l.qty ? `${l.qty} ${unitLabel(l.unit)}` : '—'),
          total ? h('dt', {}, t('deal_total')) : null, total ? h('dd', {}, rupee(total)) : null,
          h('dt', {}, t('harvested')), h('dd', {}, l.harvested || ago(l.createdAt)),
          h('dt', {}, '📍'), h('dd', {}, `${l.village || ''}${l.village ? ', ' : ''}${district(l.district).name}`),
          h('dt', {}, '👁'), h('dd', {}, `${l.views} ${t('views')}`))),
      h('div', { class: 'section-title', style: 'padding-inline:0' }, t('seller')),
      h('button', {
        class: 'seller-row', style: 'width:100%;text-align:start',
        onclick: () => go('#/seller/' + l.seller.id),
      },
        avatar(l.seller),
        h('div', { class: 'grow' },
          h('b', {}, l.seller.name),
          h('div', { class: 'tiny muted' },
            `${l.seller.village || ''}${l.seller.village ? ', ' : ''}${district(l.seller.district).name}`),
          h('div', { class: 'tiny muted' },
            (l.seller.rating ? `⭐ ${l.seller.rating} (${l.seller.ratingCount}) · ` : '') +
            `${l.seller.deals} ${t('deals_done')}`)),
        h('span', { class: 'muted' }, '›'),
      ),
      l.seller.delivers ? h('div', { style: 'margin-top:12px' },
        banner(
          `🛵 ${t('delivers_badge')}: ${l.seller.deliveryNote || '—'}` +
          (l.seller.deliveryFee ? ` · ${rupee(l.seller.deliveryFee)}` : ' · free') +
          (l.seller.freeAbove ? ` · free above ${rupee(l.seller.freeAbove)}` : ''),
          '', '🛵')) : null,
      h('div', { style: 'margin-top:12px' }, banner(t('pay_direct'), 'warn', '💵')),
      h('div', { class: 'center', style: 'margin-top:16px' },
        h('button', { class: 'btn btn-ghost btn-sm', onclick: () => reportListing(l.id) }, '🚩 ' + t('report')))),
    actions);
  return root;
}

function reportListing(id) {
  const ta = h('textarea', { class: 'input', placeholder: '…' });
  sheet(t('report'), ta,
    h('button', {
      class: 'btn btn-primary btn-block', style: 'margin-top:12px',
      onclick: async () => {
        try { await api('/api/reports', { method: 'POST', body: { listingId: id, reason: ta.value } }); } catch {}
        closeSheet(); toast(t('reported'));
      },
    }, t('confirm')));
}

function ownerMenu(l) {
  const act = async (body) => {
    try { await api('/api/listings/' + l.id, { method: 'PATCH', body }); closeSheet(); toast(t('saved')); location.reload(); }
    catch (e) { toast(e.message); }
  };
  sheet(l.title,
    h('div', { class: 'stack' },
      l.status !== 'sold' ? h('button', { class: 'btn btn-green btn-block', onclick: () => act({ status: 'sold' }) }, '✅ ' + t('mark_sold')) : null,
      l.status === 'live'
        ? h('button', { class: 'btn btn-block', onclick: () => act({ status: 'paused' }) }, '⏸ ' + t('pause_listing'))
        : h('button', { class: 'btn btn-block', onclick: () => act({ status: 'live' }) }, '▶️ ' + t('resume_listing')),
      h('button', {
        class: 'btn btn-block', style: 'color:var(--maroon)',
        onclick: async () => {
          try { await api('/api/listings/' + l.id, { method: 'DELETE' }); closeSheet(); toast(t('saved')); go('#/mine'); }
          catch (e) { toast(e.message); }
        },
      }, '🗑 ' + t('delete_listing'))));
}

export async function viewSeller(id) {
  const root = h('div', { class: 'screen' });
  try {
    const { listings } = await api('/api/listings?seller=' + id);
    const s = listings.length ? listings[0].seller : null;
    root.append(
      topbar(s ? s.name : t('seller'), { back: true }),
      s ? h('div', { class: 'pad', style: 'padding-top:14px' },
        h('div', { class: 'seller-row' },
          avatar(s, 56),
          h('div', { class: 'grow' },
            h('b', { style: 'font-size:17px' }, s.name),
            h('div', { class: 'tiny muted' }, `${s.village || ''}${s.village ? ', ' : ''}${district(s.district).name}`),
            h('div', { class: 'tiny muted' },
              (s.rating ? `⭐ ${s.rating} (${s.ratingCount}) · ` : '') + `${s.deals} ${t('deals_done')}`))),
        s.bio ? h('p', { class: 'small', style: 'margin-top:10px' }, s.bio) : null,
        s.delivers ? h('div', { style: 'margin-top:10px' },
          banner(`🛵 ${t('delivers_badge')} · ${s.deliveryNote || ''}`, '', '🛵')) : null) : null,
      h('div', { class: 'section-title' }, t('my_listings')),
      h('div', { class: 'list' }, ...listings.map(listingCard)));
  } catch (e) { root.append(topbar('', { back: true }), empty('😕', e.message, '')); }
  return root;
}

// ═══════════════════════════════════════════════════════════════════════════
// Sell — four steps, almost no typing
// ═══════════════════════════════════════════════════════════════════════════
export function viewSell() {
  if (!state.user) { go('#/signup'); return h('div'); }
  const draft = { cropKey: null, price: '', qty: '', unit: 'kg', note: '', organic: false,
                  negotiable: true, photoId: null, harvested: '' };
  let step = 0;
  const body = h('div');
  const steps = h('div', { class: 'steps' }, h('i'), h('i'), h('i'), h('i'));

  const render = () => {
    steps.querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', i <= step));
    body.replaceChildren([stepWhat, stepPrice, stepPhoto, stepDeliver][step]());
    window.scrollTo(0, 0);
  };
  const next = () => { step = Math.min(3, step + 1); render(); };
  const prev = () => { if (step === 0) go('#/home'); else { step--; render(); } };

  // 1 — pick the crop from icons, grouped by category. No keyboard needed.
  function stepWhat() {
    const wrap = h('div', { class: 'pad', style: 'padding-top:10px' },
      h('h3', {}, t('step_what')));
    for (const cat of state.cat.CATEGORIES) {
      const items = state.cat.CROPS.filter((c) => c.cat === cat.key);
      if (!items.length) continue;
      wrap.append(
        h('div', { class: 'section-title', style: 'padding-inline:0' }, `${cat.icon} ${nm(cat)}`),
        h('div', { class: 'pick-grid' },
          ...items.map((c) => h('button', {
            class: 'pick' + (draft.cropKey === c.key ? ' on' : ''),
            onclick: () => { draft.cropKey = c.key; next(); },
          }, h('div', { class: 'ico' }, c.icon),
             h('div', { class: 'lbl' }, nm(c)),
             c.local ? h('div', { class: 'loc' }, c.local) : null))));
    }
    return wrap;
  }

  // 2 — price and quantity
  function stepPrice() {
    const c = crop(draft.cropKey);
    const price = h('input', { class: 'input', type: 'number', inputmode: 'numeric', min: 1,
      placeholder: '0', value: draft.price, style: 'font-size:24px;font-weight:800;text-align:center' });
    const qty = h('input', { class: 'input', type: 'number', inputmode: 'decimal', min: 0, placeholder: '0', value: draft.qty });
    const unit = h('select', { class: 'input' }, ...state.cat.UNITS.map((u) =>
      h('option', { value: u.key, selected: u.key === draft.unit }, u.label)));
    const note = h('textarea', { class: 'input', placeholder: t('note_ph') }, draft.note);
    const neg = h('input', { type: 'checkbox', checked: true });
    const org = h('input', { type: 'checkbox' });
    const harvested = h('input', { class: 'input', type: 'date', max: new Date().toISOString().slice(0, 10) });

    return h('div', { class: 'pad', style: 'padding-top:10px' },
      h('h3', {}, t('step_price')),
      h('div', { class: 'card card-pad row', style: 'gap:12px;margin:12px 0' },
        h('div', { style: 'font-size:34px' }, c.icon),
        h('div', {}, h('b', {}, nm(c)), h('div', { class: 'tiny muted' }, c.local))),
      h('label', { class: 'field' }, h('span', {}, t('price_label')), price),
      h('label', { class: 'field' }, h('span', {}, t('unit_label')), unit),
      h('label', { class: 'field' }, h('span', {}, t('qty_label')), qty),
      h('label', { class: 'field' }, h('span', {}, t('harvested')), harvested),
      h('label', { class: 'field' }, h('span', {}, t('note_label')), note),
      h('div', { class: 'card' },
        h('label', { class: 'switch' }, neg, h('span', { class: 'track' }), h('span', { class: 'grow' }, '💬 ' + t('negotiable'))),
        h('label', { class: 'switch', style: 'border-top:1px solid var(--line)' }, org, h('span', { class: 'track' }), h('span', { class: 'grow' }, '🌿 ' + t('organic_badge')))),
      h('div', { class: 'row', style: 'margin-top:18px;gap:10px' },
        h('button', { class: 'btn btn-ghost', onclick: prev }, t('back')),
        h('button', {
          class: 'btn btn-primary grow',
          onclick: () => {
            if (!(Number(price.value) > 0)) { toast(t('price_label')); price.focus(); return; }
            Object.assign(draft, {
              price: price.value, qty: qty.value, unit: unit.value, note: note.value,
              negotiable: neg.checked, organic: org.checked, harvested: harvested.value,
            });
            next();
          },
        }, t('next'))));
  }

  // 3 — photo, shrunk in the browser before it ever touches the network
  function stepPhoto() {
    const preview = h('div', { class: 'photo-big', style: 'border-radius:16px;overflow:hidden' }, crop(draft.cropKey).icon);
    const file = h('input', { type: 'file', accept: 'image/*', hidden: true });
    const cam = h('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true });
    const status = h('div', { class: 'hint center' });

    const handle = async (input) => {
      const f = input.files && input.files[0];
      if (!f) return;
      status.textContent = t('loading');
      try {
        const blob = await shrinkImage(f);
        preview.replaceChildren(h('img', { src: URL.createObjectURL(blob), alt: '' }));
        const { photoId } = await api('/api/photos', { method: 'POST', raw: blob, type: 'image/jpeg' });
        draft.photoId = photoId;
        status.textContent = `✅ ${Math.round(blob.size / 1024)} KB`;
      } catch (e) { status.textContent = e.message; }
    };
    file.addEventListener('change', () => handle(file));
    cam.addEventListener('change', () => handle(cam));

    return h('div', { class: 'pad', style: 'padding-top:10px' },
      h('h3', {}, t('step_photo')),
      h('p', { class: 'muted small' }, t('photo_help')),
      preview, status, file, cam,
      h('div', { class: 'stack', style: 'margin-top:14px' },
        h('button', { class: 'btn btn-primary btn-block', onclick: () => cam.click() }, '📷 ' + t('take_photo')),
        h('button', { class: 'btn btn-block', onclick: () => file.click() }, '🖼 ' + t('choose_photo'))),
      h('div', { class: 'row', style: 'margin-top:18px;gap:10px' },
        h('button', { class: 'btn btn-ghost', onclick: prev }, t('back')),
        h('button', { class: 'btn btn-primary grow', onclick: next },
          draft.photoId ? t('next') : t('skip_photo'))));
  }

  // 4 — delivery, then publish
  function stepDeliver() {
    const u = state.user;
    const on = h('input', { type: 'checkbox', checked: !!u.delivers });
    const fee = h('input', { class: 'input', type: 'number', min: 0, value: u.deliveryFee || 0 });
    const freeAbove = h('input', { class: 'input', type: 'number', min: 0, value: u.freeAbove || 0 });
    const note = h('textarea', { class: 'input', placeholder: t('delivery_note_ph') }, u.deliveryNote || '');
    const areas = new Set(u.deliveryAreas || []);
    const areaChips = h('div', { class: 'chip-row', style: 'flex-wrap:wrap;overflow:visible;padding-inline:0' },
      ...state.cat.DISTRICTS.map((d) => {
        const b = h('button', { class: 'chip' + (areas.has(d.key) ? ' on' : '') }, d.name);
        b.onclick = () => { areas.has(d.key) ? areas.delete(d.key) : areas.add(d.key); b.classList.toggle('on'); };
        return b;
      }));

    const detail = h('div', { hidden: !u.delivers },
      h('label', { class: 'field' }, h('span', {}, t('delivery_where')), areaChips),
      h('label', { class: 'field' }, h('span', {}, t('delivery_fee')), fee),
      h('label', { class: 'field' }, h('span', {}, t('free_above')), freeAbove),
      h('label', { class: 'field' }, h('span', {}, t('delivery_note')), note));
    on.addEventListener('change', () => { detail.hidden = !on.checked; });

    const publish = h('button', { class: 'btn btn-primary btn-block' }, '✅ ' + t('publish'));
    publish.onclick = async () => {
      publish.disabled = true;
      try {
        if (on.checked !== !!u.delivers || on.checked) {
          const { user } = await api('/api/me', {
            method: 'PATCH',
            body: { delivers: on.checked, deliveryAreas: [...areas],
                    deliveryFee: Number(fee.value) || 0, freeAbove: Number(freeAbove.value) || 0,
                    deliveryNote: note.value },
          });
          state.user = user;
        }
        const { listing } = await api('/api/listings', { method: 'POST', body: { ...draft } });
        toast(t('published'));
        go('#/l/' + listing.id);
      } catch (e) { toast(e.message); publish.disabled = false; }
    };

    return h('div', { class: 'pad', style: 'padding-top:10px' },
      h('h3', {}, t('step_deliver')),
      h('p', { class: 'muted small' }, t('delivery_on_sub')),
      h('div', { class: 'card', style: 'margin-block:12px' },
        h('label', { class: 'switch' }, on, h('span', { class: 'track' }),
          h('span', { class: 'grow' }, h('b', {}, '🛵 ' + t('delivery_on'))))),
      detail,
      banner(t('pay_direct'), 'warn', '💵'),
      h('div', { class: 'row', style: 'margin-top:18px;gap:10px' },
        h('button', { class: 'btn btn-ghost', onclick: prev }, t('back')),
        h('div', { class: 'grow' }, publish)));
  }

  render();
  return h('div', { class: 'screen' },
    topbar(t('sell_title'), { back: prev }), steps, body);
}

// ═══════════════════════════════════════════════════════════════════════════
// Seed Bank
// ═══════════════════════════════════════════════════════════════════════════
const statusBadge = (s) => ({
  traditional: h('span', { class: 'badge badge-maroon' }, '🏔 ' + t('st_traditional')),
  emerging: h('span', { class: 'badge badge-green' }, '✨ ' + t('st_emerging')),
  rare: h('span', { class: 'badge badge-gold' }, '💎 ' + t('st_rare')),
}[s]);

export function viewSeeds() {
  const saved = (state.user && state.user.district)
    ? (state.cat.DISTRICTS.find((d) => d.key === state.user.district) || {}).zone
    : null;
  let z = localStorage.getItem('tsongra.zone') || saved || 'mid';
  let filter = 'all';

  const list = h('div', { class: 'list' });
  const zoneRow = h('div', { class: 'chip-row' });
  const filtRow = h('div', { class: 'chip-row', style: 'padding-top:0' });

  const render = () => {
    localStorage.setItem('tsongra.zone', z);
    zoneRow.replaceChildren(...state.cat.ZONES.map((zz) =>
      h('button', {
        class: 'chip' + (zz.key === z ? ' on' : ''),
        onclick: () => { z = zz.key; render(); },
      }, `${zz.key === 'gh' ? '🏠' : '⛰'} ${nm(zz)}`)));

    filtRow.replaceChildren(...[
      ['all', '🌱 ' + t('filter_all')],
      ['emerging', '✨ ' + t('st_emerging')],
      ['traditional', '🏔 ' + t('st_traditional')],
      ['rare', '💎 ' + t('st_rare')],
    ].map(([k, lbl]) => h('button', {
      class: 'chip' + (filter === k ? ' on' : ''),
      onclick: () => { filter = k; render(); },
    }, lbl)));

    const zObj = zone(z);
    const seeds = state.cat.SEEDS.filter((s) => filter === 'all' || s.status === filter);
    list.replaceChildren(
      h('div', { class: 'card card-pad', style: 'background:var(--turq-l);border-color:#B9DBDE' },
        h('b', {}, `⛰ ${nm(zObj)} · ${zObj.alt}`),
        h('div', { class: 'small', style: 'margin-top:4px' }, zObj.note),
        h('div', { class: 'tiny muted', style: 'margin-top:6px' }, `${zObj.example}`),
        h('div', { class: 'tiny', style: 'margin-top:6px;font-weight:700;color:var(--turq)' }, `🗓 ${zObj.season}`)),
      ...seeds.map((s) => seedCard(s, z)));
  };

  render();
  return h('div', { class: 'screen' },
    topbar(t('seeds_title'), { sub: t('seedbank_sub') }),
    h('p', { class: 'pad small muted', style: 'padding-top:12px;margin:0' }, t('seeds_intro')),
    h('div', { class: 'section-title' }, t('zone_pick')),
    zoneRow, filtRow,
    h('div', { class: 'center', style: 'padding:0 14px 12px' },
      h('button', { class: 'btn btn-turq btn-block btn-sm', onclick: () => go('#/calendar') },
        '🗓 ' + t('calendar_title'))),
    list);
}

function seedCard(s, z) {
  const sow = s.sow[z];
  const unsuited = !sow || /^Not |^Marginal|^—/.test(sow);
  return h('button', { class: 'seed-card', onclick: () => go('#/seed/' + s.key) },
    h('div', { class: 'seed-top' },
      h('div', { class: 'seed-ico' }, s.icon),
      h('div', { class: 'grow' },
        h('div', { class: 'seed-head' }, nm(s)),
        s.local !== s.name ? h('div', { class: 'seed-local' }, s.local) : null,
        h('div', { class: 'seed-line' }, s.headline)),
      h('span', { class: 'muted' }, '›')),
    h('div', { class: 'seed-tags' },
      statusBadge(s.status),
      unsuited
        ? h('span', { class: 'badge' }, '⚠️ ' + t('not_here'))
        : h('span', { class: 'badge badge-turq' }, '🌱 ' + sow),
      h('span', { class: 'badge' }, '⏱ ' + s.days)));
}

export function viewSeed(key) {
  const s = state.cat.SEEDS.find((x) => x.key === key);
  if (!s) return h('div', { class: 'screen' }, topbar('', { back: true }), empty('🌱', 'Not found', ''));
  const z = localStorage.getItem('tsongra.zone') || 'mid';
  const zObj = zone(z);
  const sow = s.sow[z], harv = s.harvest[z];
  const unsuited = !sow || /^Not |^Marginal|^—/.test(sow);

  const row = (label, value, icon) => h('div', { class: 'rate-row' },
    h('span', { style: 'font-size:20px;width:26px' }, icon),
    h('div', { class: 'grow' },
      h('div', { class: 'tiny muted' }, label),
      h('div', { style: 'font-weight:600' }, value)));

  return h('div', { class: 'screen' },
    topbar(nm(s), { sub: s.local !== s.name ? s.local : null, back: true }),
    h('div', { class: 'pad', style: 'padding-top:14px' },
      h('div', { class: 'row', style: 'gap:14px' },
        h('div', { class: 'seed-ico', style: 'width:64px;height:64px;font-size:34px' }, s.icon),
        h('div', { class: 'grow' }, statusBadge(s.status),
          h('p', { style: 'margin:8px 0 0;font-weight:600;line-height:1.45' }, s.headline))),

      h('div', { class: 'section-title', style: 'padding-inline:0' }, t('why_here')),
      h('p', { style: 'line-height:1.6;margin:0' }, s.why),

      h('div', { class: 'section-title', style: 'padding-inline:0' }, `${nm(zObj)} · ${zObj.alt}`),
      unsuited
        ? banner(`${t('not_here')} — ${sow || '—'}`, 'warn', '⚠️')
        : h('div', { class: 'card card-pad' },
            h('div', { class: 'row-between' },
              h('div', {}, h('div', { class: 'tiny muted' }, t('when_sow')),
                h('b', { style: 'color:var(--green)' }, sow)),
              h('div', { style: 'text-align:end' }, h('div', { class: 'tiny muted' }, t('when_harvest')),
                h('b', { style: 'color:var(--gold)' }, harv || '—')))),

      h('div', { class: 'card', style: 'margin-top:14px;padding:0 14px' },
        row(t('days_ready'), s.days, '⏱'),
        row(t('frost_tol'), s.frost, '❄️'),
        row(t('water_need'), s.water, '💧'),
        row(t('expect_yield'), s.yield, '⚖️'),
        row(t('expect_price'), s.price, '💰'),
        row(t('where_seed'), s.source, '🏪')),

      h('div', { class: 'section-title', style: 'padding-inline:0' }, t('how_care')),
      h('p', { style: 'line-height:1.6;margin:0' }, s.care),

      h('div', { class: 'lbadges', style: 'margin-top:14px' },
        ...s.tags.map((tg) => h('span', { class: 'badge badge-apricot' }, tg))),

      h('div', { class: 'stack', style: 'margin-top:20px' },
        h('button', { class: 'btn btn-turq btn-block', onclick: () => go('#/search/' + encodeURIComponent(s.name)) },
          '🔍 ' + t('who_sells')),
        h('button', { class: 'btn btn-block', onclick: () => go('#/calendar') }, '🗓 ' + t('calendar_title')))));
}

// A month grid is the fastest way to answer "what do I sow now?" — the single
// question the Seed Bank exists to answer.
export function viewCalendar() {
  let z = localStorage.getItem('tsongra.zone') || 'mid';
  const table = h('div', { class: 'calendar' });
  const zoneRow = h('div', { class: 'chip-row' });

  // Turn a phrase like "October – March under cover" or "March–April or October"
  // into the months it actually covers. Two traps worth the care: a range can
  // wrap the year end, and "or" / "," introduce separate windows rather than
  // one long span.
  const MONTH_RX = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/gi;

  const monthsOf = (text) => {
    if (!text || /^(not|marginal|—)/i.test(text.trim())) return [];
    const out = new Set();
    for (const part of text.split(/,| or | and again /i)) {
      const seq = [];
      for (const m of part.matchAll(MONTH_RX)) {
        const i = MONTHS.findIndex((x) => m[1].toLowerCase().startsWith(x.toLowerCase()));
        if (i >= 0) seq.push(i);
      }
      if (!seq.length) continue;
      if (seq.length >= 2 && /[–—-]|\bto\b|through/i.test(part)) {
        for (let i = seq[0]; ; i = (i + 1) % 12) { out.add(i); if (i === seq[seq.length - 1]) break; }
      } else seq.forEach((i) => out.add(i));
    }
    return [...out];
  };

  const render = () => {
    localStorage.setItem('tsongra.zone', z);
    zoneRow.replaceChildren(...state.cat.ZONES.map((zz) =>
      h('button', { class: 'chip' + (zz.key === z ? ' on' : ''), onclick: () => { z = zz.key; render(); } },
        `${zz.key === 'gh' ? '🏠' : '⛰'} ${nm(zz)}`)));

    const rows = state.cat.SEEDS.map((s) => {
      const sowM = monthsOf(s.sow[z]);
      const harvM = monthsOf(s.harvest[z]);
      if (!sowM.length && !harvM.length) return null;
      return h('tr', {},
        h('th', {}, `${s.icon} ${nm(s)}`),
        ...MONTHS.map((_, i) => {
          const isS = sowM.includes(i), isH = harvM.includes(i);
          return h('td', {}, h('div', {
            class: 'cell' + (isS && isH ? ' both' : isS ? ' sow' : isH ? ' harv' : ''),
            title: `${nm(s)} · ${MONTHS[i]}`,
          }));
        }));
    }).filter(Boolean);

    table.replaceChildren(h('table', {},
      h('thead', {}, h('tr', {}, h('th'), ...MONTHS.map((m) => h('th', {}, m)))),
      h('tbody', {}, ...rows)));
  };
  render();

  return h('div', { class: 'screen' },
    topbar(t('calendar_title'), { sub: t('seeds_title'), back: () => go('#/seeds') }),
    zoneRow,
    h('div', { class: 'legend' },
      h('span', {}, h('i', { style: 'background:var(--green)' }), t('legend_sow')),
      h('span', {}, h('i', { style: 'background:var(--gold)' }), t('legend_harv'))),
    h('div', { style: 'height:10px' }),
    table,
    h('p', { class: 'pad tiny muted' }, t('seeds_intro')));
}

// ═══════════════════════════════════════════════════════════════════════════
// Chats
// ═══════════════════════════════════════════════════════════════════════════
export async function viewChats() {
  if (!state.user) { go('#/signup'); return h('div'); }
  const root = h('div', { class: 'screen' }, topbar(t('chats_title')));
  const list = h('div', {}, h('div', { class: 'pad muted small' }, t('loading')));
  root.append(list);
  try {
    const { threads } = await api('/api/threads');
    list.replaceChildren(...(threads.length ? threads.map(threadRow)
      : [empty('💬', t('no_chats'), t('no_chats_sub'),
          h('button', { class: 'btn btn-primary', onclick: () => go('#/home') }, t('nav_bazaar')))]));
  } catch (e) { list.replaceChildren(h('div', { class: 'pad muted small' }, e.message)); }
  return root;
}

function threadPreview(th) {
  if (th.sealed) return '✅ ' + t('deal_sealed');
  switch (th.lastKind) {
    case 'offer': return '💰 ' + th.lastBody;
    case 'deal': return '🤝 ' + t('deal_pending');
    case 'system': return th.lastBody === 'deal_withdrawn' ? t('deal_withdraw') : t('chat_opened');
    default: return th.lastBody || '';
  }
}

const threadRow = (th) =>
  h('button', { class: 'thread-row', onclick: () => go('#/chat/' + th.id) },
    h('div', { class: 'lthumb', style: 'width:52px;height:52px;font-size:24px' },
      th.listing && th.listing.photoId
        ? h('img', { src: photoUrl(th.listing.photoId), alt: '', loading: 'lazy' })
        : (th.listing ? th.listing.icon : '🧺')),
    h('div', { class: 'grow' },
      h('div', { class: 'row-between' },
        h('b', { class: 'truncate' }, th.other.name),
        h('span', { class: 'tiny muted' }, ago(th.lastAt))),
      h('div', { class: 'tiny muted truncate' }, th.listing ? th.listing.title : '—'),
      h('div', { class: 'tiny truncate', style: 'color:var(--ink-2)' }, threadPreview(th))),
    th.unread ? h('div', { class: 'dot' }) : null);

export async function viewChat(id) {
  if (!state.user) { go('#/signup'); return h('div'); }
  const root = h('div', { class: 'screen', style: 'padding-bottom:0' });
  const scroll = h('div', { class: 'chat-scroll' }, h('div', { class: 'muted small center' }, t('loading')));
  let th = null;
  let drawnCount = -1;   // -1 until the first paint, so the first draw jumps to the newest

  const ta = h('textarea', { class: '', rows: 1, placeholder: t('msg_ph') });
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; });
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  const quick = h('div', { class: 'chip-row', style: 'padding:0 0 8px' });
  const composer = h('div', { class: 'composer' }, quick,
    h('div', { class: 'composer-row' },
      h('button', { class: 'send', style: 'background:var(--gold)', 'aria-label': t('make_offer'), onclick: () => offerSheet() }, '💰'),
      ta,
      h('button', { class: 'send', 'aria-label': 'Send', onclick: () => send() }, '➤')));

  async function load(silent) {
    try {
      const r = await api('/api/threads/' + id);
      th = r.thread;
      draw();
    } catch (e) { if (!silent) scroll.replaceChildren(h('div', { class: 'muted small center' }, e.message)); }
  }

  async function send() {
    const body = ta.value.trim();
    if (!body) return;
    ta.value = ''; ta.style.height = 'auto';
    try { const r = await api(`/api/threads/${id}/messages`, { method: 'POST', body: { body } }); th = r.thread; draw(); }
    catch (e) { toast(e.message); }
  }

  async function quickSend(text) {
    try { const r = await api(`/api/threads/${id}/messages`, { method: 'POST', body: { body: text } }); th = r.thread; draw(); }
    catch (e) { toast(e.message); }
  }

  function offerSheet() {
    const inp = h('input', { class: 'input', type: 'number', inputmode: 'numeric', min: 1,
      placeholder: String(th.listing ? th.listing.price : ''), style: 'font-size:24px;text-align:center;font-weight:800' });
    sheet(t('make_offer'),
      h('p', { class: 'muted small' }, `${t('per')} ${unitLabel(th.listing ? th.listing.unit : 'kg')}`),
      inp,
      h('button', {
        class: 'btn btn-primary btn-block', style: 'margin-top:12px',
        onclick: async () => {
          const p = Number(inp.value);
          if (!(p > 0)) return;
          closeSheet();
          try {
            const r = await api(`/api/threads/${id}/messages`, {
              method: 'POST',
              body: { kind: 'offer', body: `${rupee(p)} / ${unitLabel(th.listing ? th.listing.unit : 'kg')}`, meta: { price: p } },
            });
            th = r.thread; draw();
          } catch (e) { toast(e.message); }
        },
      }, t('confirm')));
    setTimeout(() => inp.focus(), 120);
  }

  // The deal sheet is where the app's whole promise is kept: agree here, and
  // only then do phone numbers appear.
  function dealSheet() {
    const price = h('input', { class: 'input', type: 'number', min: 1,
      value: th.dealPrice || (th.listing ? th.listing.price : ''), style: 'text-align:center;font-weight:800;font-size:22px' });
    const qty = h('input', { class: 'input', type: 'number', min: 0, step: 'any', value: th.dealQty || '' });
    const delv = h('input', { type: 'checkbox', checked: !!th.dealDelivery });
    const totalEl = h('div', { class: 'price-big center', style: 'margin:8px 0' });
    const recalc = () => {
      const base = (Number(price.value) || 0) * (Number(qty.value) || 0);
      const fee = delv.checked && !(th.freeAbove && base >= th.freeAbove) ? (th.deliveryFee || 0) : 0;
      totalEl.textContent = base ? rupee(base + fee) + (fee ? ` (incl. ${rupee(fee)} delivery)` : '') : '—';
    };
    [price, qty].forEach((el) => el.addEventListener('input', recalc));
    delv.addEventListener('change', recalc);
    recalc();

    sheet(t('agree_deal'),
      h('label', { class: 'field' }, h('span', {}, `${t('deal_rate')} (₹ / ${unitLabel(th.listing ? th.listing.unit : 'kg')})`), price),
      h('label', { class: 'field' }, h('span', {}, `${t('deal_qty')} (${unitLabel(th.listing ? th.listing.unit : 'kg')})`), qty),
      th.sellerDelivers && th.canDeliverHere
        ? h('div', { class: 'card' }, h('label', { class: 'switch' }, delv, h('span', { class: 'track' }),
            h('span', { class: 'grow' }, h('b', {}, '🛵 ' + t('deal_delivery')),
              h('div', { class: 'tiny muted' }, th.deliveryFee ? `+ ${rupee(th.deliveryFee)}` : 'free'))))
        : banner(t('deal_pickup') + ' · ' + th.sellerPlace, '', '📍'),
      h('div', { class: 'card card-pad', style: 'margin-top:12px' },
        h('div', { class: 'tiny muted center' }, t('deal_total')), totalEl),
      banner(t('pay_direct'), 'warn', '💵'),
      h('button', {
        class: 'btn btn-green btn-block', style: 'margin-top:12px',
        onclick: async () => {
          closeSheet();
          try {
            const r = await api(`/api/threads/${id}/deal`, {
              method: 'POST',
              body: { agree: true, price: Number(price.value), qty: Number(qty.value), delivery: delv.checked },
            });
            th = r.thread; draw();
            if (th.sealed) toast('✅ ' + t('deal_sealed'));
          } catch (e) { toast(e.message); }
        },
      }, '🤝 ' + t('deal_accept')));
  }

  function rateSheet() {
    let stars = 5;
    const starEl = h('div', { class: 'stars center' });
    const paint = () => { starEl.textContent = '★★★★★'.slice(0, stars) + '☆☆☆☆☆'.slice(0, 5 - stars); };
    paint();
    const row = h('div', { class: 'row', style: 'justify-content:center;gap:6px;margin:10px 0' },
      ...[1, 2, 3, 4, 5].map((n) => h('button', { class: 'btn btn-sm', onclick: () => { stars = n; paint(); } }, String(n))));
    const note = h('textarea', { class: 'input', placeholder: '…' });
    sheet(t('rate_them'), starEl, row, note,
      h('button', {
        class: 'btn btn-primary btn-block', style: 'margin-top:12px',
        onclick: async () => {
          try { await api('/api/ratings', { method: 'POST', body: { threadId: id, stars, note: note.value } }); }
          catch (e) { toast(e.message); return; }
          closeSheet(); toast(t('rated_thanks')); load();
        },
      }, t('rate_send')));
  }

  function draw() {
    quick.replaceChildren(...(th.sealed ? [] : [
      th.role === 'buyer' ? t('q_available') : null,
      th.role === 'buyer' ? t('q_bestprice') : null,
      th.role === 'buyer' ? t('q_deliver') : null,
      th.role === 'buyer' ? t('q_when') : null,
      t('q_julley'),
    ].filter(Boolean).map((x) => h('button', { class: 'chip', onclick: () => quickSend(x) }, x))));

    const kids = [];
    for (const m of th.messages) {
      if (m.kind === 'system') {
        kids.push(h('div', { class: 'sysmsg' },
          m.body === 'chat_opened' ? t('chat_opened') : m.body === 'deal_withdrawn' ? t('deal_withdraw') : m.body));
      } else if (m.kind === 'offer') {
        kids.push(h('div', { class: 'offer' },
          h('div', { class: 'tiny muted' }, (m.me ? 'You' : th.other.name) + ' ' + t('offered')),
          h('div', { class: 'price-big' }, m.body)));
      } else if (m.kind === 'deal') {
        kids.push(dealBubble(m, th));
      } else {
        kids.push(h('div', { class: 'bub ' + (m.me ? 'me' : 'them') }, m.body, h('time', {}, clock(m.at))));
      }
    }

    if (th.sealed) {
      kids.push(h('div', { class: 'phonebox' },
        h('div', {}, '📞 ' + t('deal_sealed_sub')),
        h('div', { class: 'num' }, th.other.phone || '—'),
        h('div', { class: 'row', style: 'gap:8px;justify-content:center' },
          h('a', { class: 'btn btn-sm', style: 'background:#fff;color:var(--turq)', href: `tel:${th.other.phone}` }, '📞 ' + t('call_now')),
          h('a', { class: 'btn btn-sm', style: 'background:#fff;color:var(--green)', href: `https://wa.me/91${th.other.phone}`, target: '_blank', rel: 'noopener' }, '💬 ' + t('whatsapp'))),
        h('div', { class: 'tiny', style: 'margin-top:10px;opacity:.9' }, t('pay_direct'))));
      if (!th.rated) {
        kids.push(h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:10px', onclick: rateSheet },
          '⭐ ' + t('rate_them')));
      }
    } else {
      kids.push(h('div', { class: 'banner', style: 'margin-top:8px' },
        h('span', { class: 'ico' }, '🔒'), h('div', {}, t('phone_locked'))));
    }

    // Only follow the conversation down if the reader was already at the bottom.
    // The five-second poll used to yank the view back mid-read otherwise.
    const wasAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 140;
    scroll.replaceChildren(...kids);
    if (drawnCount !== th.messages.length && (wasAtBottom || drawnCount < 0)) {
      requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
    }
    drawnCount = th.messages.length;

    dealBtn.textContent = th.sealed ? '✅ ' + t('deal_sealed') : (th.myOk ? '⏳ ' + t('deal_pending') : '🤝 ' + t('agree_deal'));
    dealBtn.disabled = th.sealed;
    dealBtn.className = 'btn btn-sm btn-block ' + (th.sealed ? 'btn-green' : th.myOk ? 'btn-ghost' : 'btn-green');
  }

  const dealBtn = h('button', { class: 'btn btn-sm btn-green btn-block', onclick: () => dealSheet() }, t('agree_deal'));

  // The deal button gets its own row. Squeezed beside the title it wrapped to
  // three lines in Ladakhi and Urdu, where the label is much longer.
  const bar = h('div', { class: 'topbar' },
    h('div', { class: 'topbar-row' },
      h('button', { class: 'topbar-btn', onclick: () => go('#/chats') }, '←'),
      h('div', { class: 'grow', style: 'min-width:0' },
        h('h2', { class: 'truncate', style: 'font-size:17px' }, t('loading')),
        h('div', { class: 'sub truncate' }, ''))),
    h('div', { style: 'padding:9px 0 3px' }, dealBtn),
    flagstrip());

  root.append(bar, scroll, composer);

  load().then(() => {
    if (!th) return;
    $('h2', bar).textContent = th.other.name;
    $('.sub', bar).textContent = th.listing
      ? `${th.listing.title} · ${rupee(th.listing.price)}/${unitLabel(th.listing.unit)}` : '';
  });

  // Poll rather than hold a socket open: on a village tower a dropped socket is
  // far more likely than a dropped request, and this reconnects for free.
  const timer = setInterval(() => { if (location.hash === '#/chat/' + id) load(true); else clearInterval(timer); }, 5000);

  return root;
}

function dealBubble(m, th) {
  const { price, qty, delivery } = m.meta || {};
  const base = (price || 0) * (qty || 0);
  const fee = delivery && !(th.freeAbove && base >= th.freeAbove) ? (th.deliveryFee || 0) : 0;
  const sealed = m.body === 'deal_agreed';
  const mine = m.me;
  return h('div', { class: 'dealcard' + (sealed ? '' : ' pending') },
    h('div', { class: 'center', style: 'font-weight:800;font-size:16px' },
      sealed ? '🤝 ' + t('deal_sealed') : (mine ? '⏳ ' + t('deal_pending') : '📩 ' + t('deal_they_want'))),
    h('dl', { class: 'kv', style: 'margin-top:10px' },
      h('dt', {}, t('deal_item')), h('dd', {}, th.listing ? th.listing.title : '—'),
      h('dt', {}, t('deal_rate')), h('dd', {}, `${rupee(price)} / ${unitLabel(th.listing ? th.listing.unit : 'kg')}`),
      h('dt', {}, t('deal_qty')), h('dd', {}, `${qty || 0} ${unitLabel(th.listing ? th.listing.unit : 'kg')}`),
      h('dt', {}, delivery ? '🛵' : '📍'), h('dd', {}, delivery ? t('deal_delivery') : t('deal_pickup')),
      h('dt', {}, t('deal_total')), h('dd', { style: 'font-weight:800;color:var(--apricot-d)' }, rupee(base + fee))),
    h('div', { class: 'tiny center muted', style: 'margin-top:8px' }, t('pay_direct')));
}

// ═══════════════════════════════════════════════════════════════════════════
// Rates, Wanted, Notices
// ═══════════════════════════════════════════════════════════════════════════
export async function viewRates() {
  const root = h('div', { class: 'screen' },
    topbar(t('rates_title'), { sub: t('rates_sub'), back: () => go('#/home') }));
  const list = h('div', { class: 'pad' }, h('div', { class: 'muted small' }, t('loading')));

  const reportSheet = () => {
    if (!state.user) { toast(t('need_login')); return; }
    const cropSel = h('select', { class: 'input' },
      ...state.cat.CROPS.map((c) => h('option', { value: c.key }, `${c.icon} ${nm(c)}${c.local ? ' · ' + c.local : ''}`)));
    const mkt = h('select', { class: 'input' },
      ...state.cat.MARKETS.map((m) => h('option', { value: m.key }, m.name)));
    const price = h('input', { class: 'input', type: 'number', min: 1, style: 'font-size:22px;text-align:center;font-weight:800' });
    const unit = h('select', { class: 'input' }, ...state.cat.UNITS.map((u) => h('option', { value: u.key }, u.label)));
    sheet(t('report_price'),
      h('p', { class: 'muted small' }, t('report_price_sub')),
      h('label', { class: 'field' }, h('span', {}, t('step_what')), cropSel),
      h('label', { class: 'field' }, h('span', {}, t('market_label')), mkt),
      h('label', { class: 'field' }, h('span', {}, t('price_label')), price),
      h('label', { class: 'field' }, h('span', {}, t('unit_label')), unit),
      h('button', {
        class: 'btn btn-primary btn-block',
        onclick: async () => {
          try {
            await api('/api/prices', { method: 'POST',
              body: { cropKey: cropSel.value, market: mkt.value, price: Number(price.value), unit: unit.value } });
            closeSheet(); toast(t('saved')); load();
          } catch (e) { toast(e.message); }
        },
      }, t('confirm')));
  };

  const load = async () => {
    try {
      const { prices } = await api('/api/prices');
      list.replaceChildren(...(prices.length ? prices.map((p) => h('div', { class: 'rate-row' },
        h('span', { style: 'font-size:26px;width:34px' }, p.crop.icon),
        h('div', { class: 'grow' },
          h('b', {}, nm(p.crop)),
          h('div', { class: 'tiny muted' }, `${p.reports} ${t('from_reports')} · ${ago(p.updatedAt)}`)),
        h('div', { style: 'text-align:end' },
          h('div', { style: 'font-weight:800;color:var(--apricot-d)' }, `${rupee(p.median)}`),
          h('div', { class: 'tiny muted' }, `${rupee(p.low)}–${rupee(p.high)} / ${unitLabel(p.unit)}`),
          p.trend ? h('div', { class: 'tiny ' + (p.trend > 0 ? 'trend-up' : 'trend-down') },
            `${p.trend > 0 ? '▲' : '▼'} ${Math.abs(p.trend)}%`) : null)))
        : [empty('📊', t('nothing_yet'), t('report_price_sub'))]));
    } catch (e) { list.replaceChildren(h('div', { class: 'muted small' }, e.message)); }
  };
  load();

  root.append(
    h('div', { class: 'pad', style: 'padding-top:14px' },
      banner(t('report_price_sub'), '', '📊'),
      h('button', { class: 'btn btn-primary btn-block', style: 'margin-top:12px', onclick: reportSheet },
        '➕ ' + t('report_price'))),
    h('div', { class: 'section-title' }, t('median_price')),
    list);
  return root;
}

export async function viewWanted() {
  const root = h('div', { class: 'screen' },
    topbar(t('wanted_title'), { sub: t('wanted_sub'), back: () => go('#/home') }));
  const list = h('div', { class: 'list' }, h('div', { class: 'muted pad small' }, t('loading')));

  const postSheet = () => {
    if (!state.user) { toast(t('need_login')); return; }
    const cropSel = h('select', { class: 'input' },
      ...state.cat.CROPS.map((c) => h('option', { value: c.key }, `${c.icon} ${nm(c)}${c.local ? ' · ' + c.local : ''}`)));
    const qty = h('input', { class: 'input', placeholder: 'e.g. 20 kg' });
    const note = h('textarea', { class: 'input', placeholder: t('note_ph') });
    sheet(t('post_wanted'),
      h('label', { class: 'field' }, h('span', {}, t('step_what')), cropSel),
      h('label', { class: 'field' }, h('span', {}, t('wanted_qty')), qty),
      h('label', { class: 'field' }, h('span', {}, t('note_label')), note),
      h('button', {
        class: 'btn btn-primary btn-block',
        onclick: async () => {
          try {
            await api('/api/wanted', { method: 'POST', body: { cropKey: cropSel.value, qty: qty.value, note: note.value } });
            closeSheet(); toast(t('saved')); load();
          } catch (e) { toast(e.message); }
        },
      }, t('confirm')));
  };

  const load = async () => {
    try {
      const { wanted } = await api('/api/wanted');
      list.replaceChildren(...(wanted.length ? wanted.map((w) => h('div', { class: 'card card-pad row', style: 'gap:12px' },
        h('span', { style: 'font-size:28px' }, w.crop.icon),
        h('div', { class: 'grow' },
          h('b', {}, `${nm(w.crop)}${w.qty ? ' · ' + w.qty : ''}`),
          h('div', { class: 'tiny muted' }, `${w.user.name} · ${w.village || ''}, ${district(w.district).name} · ${ago(w.createdAt)}`),
          w.note ? h('div', { class: 'small', style: 'margin-top:4px' }, w.note) : null),
        !w.mine ? h('button', {
          class: 'btn btn-sm btn-turq',
          onclick: () => go('#/c/' + w.crop.cat),
        }, t('i_have_this')) : h('button', {
          class: 'btn btn-sm btn-ghost',
          onclick: async () => { try { await api('/api/wanted/' + w.id, { method: 'DELETE' }); load(); } catch (e) { toast(e.message); } },
        }, '🗑'))) : [empty('🙋', t('nothing_yet'), t('wanted_sub'))]));
    } catch (e) { list.replaceChildren(h('div', { class: 'pad muted small' }, e.message)); }
  };
  load();

  root.append(
    h('div', { class: 'pad', style: 'padding-top:14px' },
      h('button', { class: 'btn btn-primary btn-block', onclick: postSheet }, '➕ ' + t('post_wanted'))),
    h('div', { class: 'section-title' }, t('wanted_title')),
    list);
  return root;
}

export async function viewNotices() {
  const root = h('div', { class: 'screen' }, topbar(t('notices_title'), { back: () => go('#/home') }));
  const list = h('div', { class: 'list', style: 'padding-top:14px' }, h('div', { class: 'muted small' }, t('loading')));
  root.append(list);
  const tagIcon = { scheme: '🏛', tip: '💡', safety: '🛡', info: 'ℹ️' };
  try {
    const { notices } = await api('/api/notices');
    list.replaceChildren(...notices.map((n) => h('div', { class: 'card card-pad' },
      h('div', { class: 'row', style: 'gap:10px;align-items:flex-start' },
        h('span', { style: 'font-size:22px' }, tagIcon[n.tag] || 'ℹ️'),
        h('div', {}, h('b', {}, n.title),
          h('p', { class: 'small', style: 'margin:6px 0 0;line-height:1.55' }, n.body),
          h('div', { class: 'tiny muted', style: 'margin-top:6px' }, ago(n.created_at)))))));
  } catch (e) { list.replaceChildren(h('div', { class: 'muted small' }, e.message)); }
  return root;
}

// ═══════════════════════════════════════════════════════════════════════════
// Me
// ═══════════════════════════════════════════════════════════════════════════
export function viewMe(deferredPrompt) {
  const u = state.user;
  if (!u) {
    return h('div', { class: 'screen' }, topbar(t('me_title')),
      h('div', { class: 'pad', style: 'padding-top:24px' },
        empty('👤', t('welcome'), t('phone_never'),
          h('div', { class: 'stack' },
            h('button', { class: 'btn btn-primary btn-block', onclick: () => go('#/signup') }, t('signup')),
            h('button', { class: 'btn btn-block', onclick: () => go('#/login') }, t('login'))))));
  }

  const langSel = h('select', { class: 'input' },
    ...LANGS.map((l) => h('option', { value: l.key, selected: l.key === getLang() }, `${l.native} · ${l.label}`)));
  langSel.onchange = async () => {
    setLang(langSel.value);
    try { await api('/api/me', { method: 'PATCH', body: { lang: langSel.value } }); } catch {}
    location.reload();
  };

  return h('div', { class: 'screen' },
    topbar(t('me_title'), { sub: u.name }),
    h('div', { class: 'pad', style: 'padding-top:14px' },
      h('div', { class: 'seller-row' },
        avatar(u, 56),
        h('div', { class: 'grow' },
          h('b', { style: 'font-size:17px' }, u.name),
          h('div', { class: 'tiny muted' }, `📍 ${u.village || ''}${u.village ? ', ' : ''}${district(u.district).name}`),
          h('div', { class: 'tiny muted' }, `📞 ${u.phone}  ·  ${u.deals} ${t('deals_done')}` +
            (u.rating ? `  ·  ⭐ ${u.rating}` : '')))),

      h('div', { class: 'quick', style: 'padding-inline:0;margin-top:14px' },
        quickCard('📦', t('my_listings'), '', '#/mine'),
        quickCard('💬', t('chats_title'), '', '#/chats')),

      h('div', { class: 'section-title', style: 'padding-inline:0' }, t('delivery_setup')),
      deliverySettings(),

      h('div', { class: 'section-title', style: 'padding-inline:0' }, t('language')),
      langSel,

      deferredPrompt ? h('div', { style: 'margin-top:18px' },
        h('div', { class: 'card card-pad' },
          h('b', {}, '📲 ' + t('install_app')),
          h('p', { class: 'small muted', style: 'margin:6px 0 10px' }, t('install_sub')),
          h('button', {
            class: 'btn btn-primary btn-block',
            onclick: async () => { deferredPrompt.prompt(); await deferredPrompt.userChoice; },
          }, t('install_app')))) : null,

      h('div', { style: 'margin-top:22px' }, banner(t('pay_direct'), 'warn', '💵')),

      h('button', {
        class: 'btn btn-ghost btn-block', style: 'margin-top:18px;color:var(--maroon)',
        onclick: async () => { await api('/api/logout', { method: 'POST' }); location.hash = '#/home'; location.reload(); },
      }, t('logout')),
      h('p', { class: 'tiny muted center', style: 'margin-top:20px' },
        'TSONGRA · Ladakh Local Market · no commission, no wallet')));
}

function deliverySettings() {
  const u = state.user;
  const on = h('input', { type: 'checkbox', checked: !!u.delivers });
  const fee = h('input', { class: 'input', type: 'number', min: 0, value: u.deliveryFee || 0 });
  const freeAbove = h('input', { class: 'input', type: 'number', min: 0, value: u.freeAbove || 0 });
  const note = h('textarea', { class: 'input', placeholder: t('delivery_note_ph') }, u.deliveryNote || '');
  const areas = new Set(u.deliveryAreas || []);

  const villagePanel = h('div');
  const distRow = h('div', { class: 'chip-row', style: 'flex-wrap:wrap;overflow:visible;padding-inline:0' },
    ...state.cat.DISTRICTS.map((d) => {
      const b = h('button', { class: 'chip' + (areas.has(d.key) ? ' on' : '') }, d.name);
      b.onclick = () => {
        if (areas.has(d.key)) areas.delete(d.key); else areas.add(d.key);
        b.classList.toggle('on');
      };
      return b;
    }));

  const detail = h('div', { hidden: !u.delivers },
    h('label', { class: 'field' }, h('span', {}, t('delivery_where')), distRow, villagePanel),
    h('label', { class: 'field' }, h('span', {}, t('delivery_fee')), fee),
    h('label', { class: 'field' }, h('span', {}, t('free_above')), freeAbove),
    h('label', { class: 'field' }, h('span', {}, t('delivery_note')), note));
  on.addEventListener('change', () => { detail.hidden = !on.checked; });

  const save = h('button', { class: 'btn btn-primary btn-block' }, t('save'));
  save.onclick = async () => {
    save.disabled = true;
    try {
      const { user } = await api('/api/me', {
        method: 'PATCH',
        body: { delivers: on.checked, deliveryAreas: [...areas], deliveryFee: Number(fee.value) || 0,
                freeAbove: Number(freeAbove.value) || 0, deliveryNote: note.value },
      });
      state.user = user;
      toast(t('saved'));
    } catch (e) { toast(e.message); } finally { save.disabled = false; }
  };

  return h('div', {},
    h('div', { class: 'card' },
      h('label', { class: 'switch' }, on, h('span', { class: 'track' }),
        h('span', { class: 'grow' }, h('b', {}, '🛵 ' + t('delivery_on')),
          h('div', { class: 'tiny muted' }, t('delivery_on_sub'))))),
    h('div', { style: 'height:12px' }),
    detail, save);
}

export async function viewMine() {
  if (!state.user) { go('#/signup'); return h('div'); }
  const root = h('div', { class: 'screen' }, topbar(t('my_listings'), { back: () => go('#/me') }));
  const list = h('div', { class: 'list', style: 'padding-top:14px' }, h('div', { class: 'muted small' }, t('loading')));
  root.append(list);
  try {
    const { listings } = await api('/api/listings?seller=' + state.user.id);
    list.replaceChildren(...(listings.length ? listings.map(listingCard)
      : [empty('📦', t('nothing_yet'), t('nothing_yet_sub'),
          h('button', { class: 'btn btn-primary', onclick: () => go('#/sell') }, t('sell_title')))]));
  } catch (e) { list.replaceChildren(h('div', { class: 'muted small' }, e.message)); }
  return root;
}
