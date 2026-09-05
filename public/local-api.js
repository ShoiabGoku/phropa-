// Serverless mode.
//
// When Tsongra is served from a static host (GitHub Pages) there is no Node
// process and no SQLite. This module answers exactly the same endpoints as
// lib/api.js, against a JSON store in the browser, so every screen — including
// the deal handshake — works with nothing behind it.
//
// It is a demo, not a marketplace: the data lives in this one browser and
// reaches nobody else. The persona switcher lets one person play both sides,
// which is the only honest way to show a two-sided handshake single-handed.

import { CATALOGUE, CROPS } from './catalogue.js';
import { localise } from './names.js';

localise(CATALOGUE);
const CROP = new Map(CROPS.map((c) => [c.key, c]));

const KEY = 'tsongra.local.db';
const day = 86400000;
let DB = null;

// ── store ──────────────────────────────────────────────────────────────────
function load() {
  if (DB) return DB;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { DB = JSON.parse(raw); return DB; }
  } catch {}
  DB = seed();
  save();
  return DB;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(DB)); }
  catch { /* quota — the session keeps working, it just will not survive a reload */ }
}
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);
export function resetLocal() { try { localStorage.removeItem(KEY); } catch {} DB = null; }

// ── demo content (mirrors seed-demo.js) ────────────────────────────────────
function seed() {
  const t = Date.now();
  const users = [
    { phone: '9000000001', name: 'Tsering Dolma', district: 'leh', village: 'Choglamsar', lang: 'lbj',
      bio: 'Two greenhouses at Choglamsar. Greens all through winter.',
      delivers: true, deliveryAreas: ['leh'], deliveryFee: 50, freeAbove: 800,
      deliveryNote: 'I come into Leh market every Tuesday and Friday morning.', organic: true },
    { phone: '9000000002', name: 'Stanzin Norboo', district: 'nubra', village: 'Turtuk', lang: 'lbj',
      bio: 'Apricot orchard in Turtuk. Fourth generation.',
      delivers: true, deliveryAreas: ['nubra', 'leh'], deliveryFee: 150, freeAbove: 3000,
      deliveryNote: 'Truck goes to Leh twice a month. Ask me for dates.' },
    { phone: '9000000003', name: 'Mohammad Ali', district: 'kargil', village: 'Sankoo', lang: 'ur',
      bio: 'Apricot, walnut and barley from Sankoo valley.',
      delivers: true, deliveryAreas: ['kargil', 'drass'], deliveryFee: 80,
      deliveryNote: 'Kargil town and Drass side only.' },
    { phone: '9000000004', name: 'Rigzin Angmo', district: 'sham', village: 'Skurbuchan', lang: 'lbj',
      bio: 'Raktsey Karpo apricot, dried on clean racks. GI variety kept separate.', organic: true },
    { phone: '9000000005', name: 'Sonam Wangchuk', district: 'changthang', village: 'Nyoma', lang: 'lbj',
      bio: 'Barley, peas and turnip from Nyoma. Also butter and churpe.' },
    { phone: '9000000006', name: 'Padma Deachen', district: 'zanskar', village: 'Padum', lang: 'lbj',
      bio: 'Zanskar naked barley and ngamphey, ground at home.' },
    { phone: '9000000007', name: 'Fatima Bano', district: 'drass', village: 'Drass town', lang: 'ur',
      bio: 'Potato and turnip. Drass grows the hardiest ones.' },
    { phone: '9000000008', name: 'Jigmet Tundup', district: 'leh', village: 'Saboo', lang: 'en', role: 'buyer',
      bio: 'I run a small guest house in Leh. I buy vegetables all summer.' },
  ].map((u, i) => ({
    id: i + 1, pin: '1234', role: u.role || 'both', photoId: null,
    delivers: false, deliveryAreas: [], deliveryFee: 0, freeAbove: 0, deliveryNote: '', organic: false,
    createdAt: t - 40 * day, ...u,
  }));

  const L = [
    [1, 'spinach', 'veg', 'Greenhouse spinach, cut this morning', 90, 'kg', 25, 'Grown in my trench greenhouse at Choglamsar. No spray at all. I cut it the same morning you collect.', 1, 'Today', 0, 31],
    [1, 'chard', 'veg', 'Swiss chard — winter cutting', 110, 'kg', 12, 'One sowing in September, I have been cutting leaves since November. Very tender.', 1, '', 1, 18],
    [1, 'pakchoi', 'veg', 'Pak choi, small heads', 160, 'kg', 8, 'Hotels take most of this. A few kilos spare this week.', 1, '', 2, 24],
    [2, 'apricot', 'fruit', 'Turtuk apricot, fresh', 140, 'kg', 80, 'Picked from our own trees in Turtuk. Sweet, thin skin. Best eaten within three days.', 0, 'Yesterday', 1, 96],
    [2, 'phating', 'dry', 'Sun-dried apricot (phating)', 420, 'kg', 40, 'Dried on racks, never on the ground. No sulphur, no sugar. Keeps a full year.', 0, '', 3, 61],
    [2, 'kernel', 'dry', 'Apricot kernels, sweet variety', 520, 'kg', 15, '', 0, '', 5, 12],
    [3, 'walnut', 'fruit', 'Sankoo walnut, thin shell', 380, 'kg', 60, "Breaks in your hand, no hammer needed. This year's crop.", 0, '', 2, 44],
    [3, 'apricotoil', 'dry', 'Cold-pressed apricot kernel oil', 900, 'litre', 9, 'Pressed at Sankoo. Good for cooking and for skin in winter.', 0, '', 6, 29],
    [4, 'apricot_rk', 'fruit', 'Raktsey Karpo apricot (GI) — graded', 260, 'kg', 35, 'The GI variety with the white kernel. Kept completely separate from ordinary apricot and graded by size.', 1, '', 1, 132],
    [5, 'barley', 'grain', 'Naked barley (nas), cleaned', 55, 'kg', 400, 'Our own village seed, grown at Nyoma. Cleaned and winnowed.', 0, '', 4, 37],
    [5, 'butter', 'dairy', 'Dzo butter', 700, 'kg', 12, '', 0, '', 2, 21],
    [5, 'churpe', 'dairy', 'Hard churpe, dried', 480, 'kg', 7, '', 0, '', 8, 15],
    [6, 'tsampa', 'grain', 'Ngamphey (roasted barley flour)', 95, 'kg', 120, 'Roasted and ground at home in Padum. Nothing added.', 0, '', 3, 58],
    [6, 'peas_dry', 'grain', 'Zanskar dry peas', 85, 'kg', 90, '', 0, '', 7, 19],
    [7, 'potato', 'veg', 'Drass potato', 35, 'kg', 500, 'Stored cool and dark since October. Good for seed as well as eating.', 0, '', 2, 42],
    [7, 'turnip', 'veg', 'Turnip (nyungma), storage crop', 30, 'kg', 250, '', 0, '', 5, 16],
    [1, 'seed_veg', 'seed', 'Siberian kale seed — winter greens', 60, 'packet', 30, 'Saved from my own plants, three winters running. Sow in the trench by early October.', 0, '', 4, 33],
    [4, 'sapling_fruit', 'seed', 'Raktsey Karpo saplings, 2 year', 250, 'sapling', 40, 'Grafted from our registered mother trees. Plant March–April or October.', 0, '', 9, 27],
    [5, 'seabuckthorn', 'fruit', 'Sea buckthorn berry (tsestalulu)', 120, 'kg', 45, 'Cut branches, frozen berries. Best for juice.', 0, '', 6, 23],
    [7, 'fodder', 'other', 'Alfalfa (ol), dried bundles', 25, 'bundle', 200, '', 0, '', 10, 11],
  ];
  const listings = L.map((r, i) => {
    const u = users[r[0] - 1];
    return { id: i + 1, sellerId: u.id, cropKey: r[1], cat: r[2], title: r[3], price: r[4],
      unit: r[5], qty: r[6], note: r[7], organic: !!r[8], harvested: r[9], negotiable: true,
      photoId: null, district: u.district, village: u.village, status: 'live', views: r[11],
      createdAt: Date.now() - r[10] * day };
  });

  const prices = [];
  [['apricot', 'leh_main', [130, 145, 150, 140, 155]], ['apricot', 'diskit', [110, 120, 115]],
   ['potato', 'leh_main', [40, 38, 42, 35]], ['turnip', 'leh_main', [30, 28, 32]],
   ['barley', 'padum', [52, 55, 58]], ['walnut', 'kargil_main', [360, 380, 400]],
   ['spinach', 'leh_main', [80, 95, 100, 90]], ['phating', 'leh_main', [400, 430, 450]],
   ['tsampa', 'leh_main', [90, 95, 92]]].forEach(([c, m, ps]) =>
    ps.forEach((p, i) => prices.push({ id: prices.length + 1, cropKey: c, market: m, price: p,
      unit: 'kg', userId: (i % 8) + 1, createdAt: Date.now() - (ps.length - i) * 2 * day })));

  const wanted = [
    [8, 'tomato', '30 kg a week', 'For my guest house kitchen through the season. Regular order, June to September.'],
    [8, 'lettuce', '10 kg a week', 'Salad greens for guests. I will pay well for a steady supply.'],
    [1, 'compost', '20 bags', 'Well-rotted manure for the greenhouses before spring sowing.'],
    [6, 'seed_potato', '2 quintal', 'Looking for clean seed potato for Padum, ideally certified.'],
  ].map((w, i) => ({ id: i + 1, userId: w[0], cropKey: w[1], qty: w[2], note: w[3],
    district: users[w[0] - 1].district, village: users[w[0] - 1].village, status: 'open',
    createdAt: Date.now() - i * day }));

  const notices = [
    ['Greenhouse subsidy — apply before winter', 'The Agriculture Department runs a subsidy on trench and passive solar greenhouses. Applications usually open before the winter season. Ask at your block Agriculture office or the nearest KVK for this year’s dates and the share you must pay.', 'scheme'],
    ['Grade your Raktsey Karpo separately', 'Raktsey Karpo apricot carries a Geographical Indication, so only fruit grown in Ladakh may be sold under that name. Keep it separate from ordinary apricot when you dry and pack it — mixing varieties is the fastest way to lose the price the GI name earns you.', 'tip'],
    ['Tsongra never handles your money', 'Every payment on Tsongra happens directly between the two people — cash, UPI or bank transfer, whatever you both agree. The app carries no wallet and takes no commission. If anyone asks you to pay through the app or to a "Tsongra account", it is a fraud. Report it.', 'safety'],
    ['Free seed and soil advice at your KVK', 'Krishi Vigyan Kendra Leh and Kargil, and DIHAR in Leh, give free advice on varieties, soil testing and sowing dates for your altitude. If you are trying something new from the Seed Bank, talk to them first — a short conversation can save a whole season.', 'info'],
  ].map((n, i) => ({ id: i + 1, title: n[0], body: n[1], tag: n[2], created_at: Date.now() - i * day }));

  return { users, listings, threads: [], messages: [], prices, wanted, ratings: [],
           notices, photos: {}, sessionUserId: null };
}

// ── shaping (mirrors the server) ───────────────────────────────────────────
const me = () => DB.users.find((u) => u.id === DB.sessionUserId) || null;

function publicUser(u, revealPhone = false) {
  if (!u) return null;
  const rs = DB.ratings.filter((r) => r.rateeId === u.id);
  const deals = DB.threads.filter((t) => (t.buyerId === u.id || t.sellerId === u.id) && t.dealAt).length;
  return {
    id: u.id, name: u.name, district: u.district, village: u.village, bio: u.bio || '',
    photoId: u.photoId, delivers: !!u.delivers, deliveryAreas: u.deliveryAreas || [],
    deliveryFee: u.deliveryFee || 0, freeAbove: u.freeAbove || 0, deliveryNote: u.deliveryNote || '',
    organic: !!u.organic,
    rating: rs.length ? Math.round((rs.reduce((s, r) => s + r.stars, 0) / rs.length) * 10) / 10 : null,
    ratingCount: rs.length, deals, memberSince: u.createdAt,
    phone: revealPhone ? u.phone : null,
  };
}
const selfUser = (u) => ({ ...publicUser(u, true), role: u.role, lang: u.lang });

function deliversTo(seller, district) {
  if (!seller || !seller.delivers) return false;
  const areas = seller.deliveryAreas || [];
  return areas.length ? areas.includes(district) : seller.district === district;
}

function shapeListing(l) {
  const c = CROP.get(l.cropKey) || {};
  const seller = DB.users.find((u) => u.id === l.sellerId);
  const viewer = me();
  return {
    ...l, cropName: c.name || l.title, cropLocal: c.local || '', icon: c.icon || '🧺',
    createdAt: l.createdAt, mine: viewer ? viewer.id === l.sellerId : false,
    seller: publicUser(seller),
    deliversToMe: viewer ? deliversTo(seller, viewer.district) : false,
  };
}

function shapeThread(t, withMessages) {
  const viewer = me();
  const listing = DB.listings.find((l) => l.id === t.listingId);
  const buyer = DB.users.find((u) => u.id === t.buyerId);
  const seller = DB.users.find((u) => u.id === t.sellerId);
  const isBuyer = t.buyerId === viewer.id;
  const other = isBuyer ? seller : buyer;
  const sealed = !!t.dealAt;
  const c = listing ? (CROP.get(listing.cropKey) || {}) : {};
  const msgs = DB.messages.filter((m) => m.threadId === t.id);
  const last = msgs[msgs.length - 1];
  const place = (u) => `${u.village || ''}${u.village ? ', ' : ''}${(CATALOGUE.DISTRICTS.find((d) => d.key === u.district) || {}).name || ''}`;

  const out = {
    id: t.id, listingId: t.listingId,
    listing: listing ? { id: listing.id, title: listing.title, price: listing.price, unit: listing.unit,
      photoId: listing.photoId, icon: c.icon || '🧺', village: listing.village,
      district: listing.district, status: listing.status, cropLocal: c.local || '' } : null,
    role: isBuyer ? 'buyer' : 'seller',
    other: publicUser(other, sealed),
    myOk: isBuyer ? !!t.buyerOk : !!t.sellerOk,
    theirOk: isBuyer ? !!t.sellerOk : !!t.buyerOk,
    sealed, dealPrice: t.dealPrice, dealQty: t.dealQty, dealDelivery: !!t.dealDelivery, dealAt: t.dealAt,
    sellerDelivers: !!seller.delivers, deliveryFee: seller.deliveryFee || 0,
    freeAbove: seller.freeAbove || 0, deliveryNote: seller.deliveryNote || '',
    canDeliverHere: deliversTo(seller, buyer.district),
    buyerPlace: place(buyer), sellerPlace: place(seller),
    unread: msgs.filter((m) => m.senderId !== viewer.id && !(isBuyer ? m.seenBuyer : m.seenSeller)).length,
    lastAt: t.lastAt, lastKind: last ? last.kind : 'text', lastBody: last ? last.body : '',
    rated: DB.ratings.some((r) => r.threadId === t.id && r.raterId === viewer.id),
  };
  if (withMessages) {
    out.messages = msgs.map((m) => ({ id: m.id, kind: m.kind, body: m.body, at: m.createdAt,
      meta: m.meta || {}, me: m.senderId === viewer.id }));
  }
  return out;
}

// ── router ─────────────────────────────────────────────────────────────────
const fail = (msg) => { throw new Error(msg); };
const needUser = () => me() || fail('Please log in.');
const normPhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);

export async function localApi(path, { method = 'GET', body, raw } = {}) {
  load();
  const [p, qs] = path.split('?');
  const q = Object.fromEntries(new URLSearchParams(qs || ''));
  const seg = p.replace(/^\/api\/?/, '').split('/');
  const r = route(seg, method, body || {}, q, raw);
  save();
  return r;
}

function route(seg, method, b, q, raw) {
  const [a, id, sub] = seg;

  if (a === 'catalogue') return CATALOGUE;

  if (a === 'me') {
    if (method === 'GET') { const u = me(); return { user: u ? selfUser(u) : null }; }
    const u = needUser();
    for (const k of ['name', 'district', 'village', 'lang', 'role', 'bio', 'photoId',
                     'deliveryNote', 'deliveryAreas']) if (b[k] !== undefined) u[k] = b[k];
    for (const k of ['organic', 'delivers']) if (b[k] !== undefined) u[k] = !!b[k];
    for (const k of ['deliveryFee', 'freeAbove']) if (b[k] !== undefined) u[k] = Math.max(0, Number(b[k]) || 0);
    if (b.pin !== undefined) u.pin = String(b.pin);
    return { user: selfUser(u) };
  }

  if (a === 'signup') {
    const phone = normPhone(b.phone);
    if (phone.length !== 10) fail('Enter a 10-digit mobile number.');
    if (!/^\d{4,6}$/.test(String(b.pin || ''))) fail('Your PIN must be 4 to 6 digits.');
    if (!String(b.name || '').trim()) fail('Please enter your name.');
    if (DB.users.some((u) => u.phone === phone)) fail('This number is already registered. Log in instead.');
    const u = { id: nextId(DB.users), phone, name: String(b.name).trim().slice(0, 60), pin: String(b.pin),
      role: b.role || 'both', district: b.district || 'leh', village: b.village || '', lang: b.lang || 'en',
      bio: '', photoId: null, delivers: false, deliveryAreas: [], deliveryFee: 0, freeAbove: 0,
      deliveryNote: '', organic: false, createdAt: Date.now() };
    DB.users.push(u); DB.sessionUserId = u.id;
    return { user: selfUser(u) };
  }
  if (a === 'login') {
    const u = DB.users.find((x) => x.phone === normPhone(b.phone) && x.pin === String(b.pin));
    if (!u) fail('That number and PIN do not match.');
    DB.sessionUserId = u.id;
    return { user: selfUser(u) };
  }
  if (a === 'logout') { DB.sessionUserId = null; return { ok: true }; }

  if (a === 'listings' && !id) {
    if (method === 'GET') {
      let rows = DB.listings.filter((l) => l.status === 'live');
      if (q.cat) rows = rows.filter((l) => l.cat === q.cat);
      if (q.crop) rows = rows.filter((l) => l.cropKey === q.crop);
      if (q.district) rows = rows.filter((l) => l.district === q.district);
      if (q.seller) rows = rows.filter((l) => l.sellerId === Number(q.seller));
      if (q.organic === '1') rows = rows.filter((l) => l.organic);
      if (q.q) {
        const s = q.q.toLowerCase();
        rows = rows.filter((l) => (l.title + ' ' + l.note + ' ' + l.village + ' ' + l.cropKey).toLowerCase().includes(s));
      }
      if (q.seller) rows = DB.listings.filter((l) => l.sellerId === Number(q.seller));  // own listings: all states
      const viewer = me();
      if (q.delivers === '1' && viewer) {
        rows = rows.filter((l) => deliversTo(DB.users.find((u) => u.id === l.sellerId), viewer.district));
      }
      rows = [...rows].sort((x, y) => q.sort === 'price' ? x.price - y.price
        : q.sort === 'price_desc' ? y.price - x.price : y.createdAt - x.createdAt);
      return { listings: rows.map(shapeListing) };
    }
    const u = needUser();
    const crop = CROP.get(b.cropKey) || fail('Pick what you are selling.');
    if (!(Number(b.price) > 0)) fail('Enter a price.');
    const l = { id: nextId(DB.listings), sellerId: u.id, cropKey: crop.key, cat: crop.cat,
      title: String(b.title || crop.name).slice(0, 80), note: String(b.note || '').slice(0, 500),
      price: Math.round(Number(b.price)), unit: b.unit || 'kg', qty: Number(b.qty) || 0,
      negotiable: b.negotiable !== false, organic: !!b.organic, harvested: b.harvested || '',
      photoId: b.photoId || null, district: b.district || u.district, village: b.village || u.village,
      status: 'live', views: 0, createdAt: Date.now() };
    DB.listings.push(l);
    return { listing: shapeListing(l) };
  }

  if (a === 'listings' && id) {
    const l = DB.listings.find((x) => x.id === Number(id)) || fail('This listing is gone.');
    if (method === 'GET') {
      const viewer = me();
      if (!viewer || viewer.id !== l.sellerId) l.views++;
      const out = shapeListing(l);
      if (viewer) {
        const th = DB.threads.find((t) => t.listingId === l.id && t.buyerId === viewer.id);
        out.threadId = th ? th.id : null;
      }
      return { listing: out };
    }
    const u = needUser();
    if (l.sellerId !== u.id) fail('This is not your listing.');
    if (method === 'DELETE') { DB.listings = DB.listings.filter((x) => x.id !== l.id); return { ok: true }; }
    if (b.price !== undefined) l.price = Math.round(Number(b.price)) || l.price;
    if (b.qty !== undefined) l.qty = Number(b.qty) || 0;
    if (b.note !== undefined) l.note = String(b.note).slice(0, 500);
    if (b.negotiable !== undefined) l.negotiable = !!b.negotiable;
    if (b.status !== undefined && ['live', 'paused', 'sold'].includes(b.status)) l.status = b.status;
    return { listing: shapeListing(l) };
  }

  if (a === 'threads' && !id) {
    const u = needUser();
    if (method === 'GET') {
      return { threads: DB.threads.filter((t) => t.buyerId === u.id || t.sellerId === u.id)
        .sort((x, y) => y.lastAt - x.lastAt).map((t) => shapeThread(t, false)) };
    }
    const l = DB.listings.find((x) => x.id === Number(b.listingId)) || fail('Listing gone.');
    if (l.sellerId === u.id) fail('This is your own listing.');
    let t = DB.threads.find((x) => x.listingId === l.id && x.buyerId === u.id);
    if (!t) {
      t = { id: nextId(DB.threads), listingId: l.id, buyerId: u.id, sellerId: l.sellerId,
        buyerOk: 0, sellerOk: 0, dealPrice: null, dealQty: null, dealDelivery: 0, dealAt: null,
        createdAt: Date.now(), lastAt: Date.now() };
      DB.threads.push(t);
      DB.messages.push({ id: nextId(DB.messages), threadId: t.id, senderId: null, kind: 'system',
        body: 'chat_opened', meta: {}, seenBuyer: 1, seenSeller: 1, createdAt: Date.now() });
    }
    return { thread: shapeThread(t, true) };
  }

  if (a === 'threads' && id) {
    const u = needUser();
    const t = DB.threads.find((x) => x.id === Number(id)) || fail('Not found.');
    if (t.buyerId !== u.id && t.sellerId !== u.id) fail('Not your chat.');
    const isBuyer = t.buyerId === u.id;

    if (method === 'GET') {
      DB.messages.forEach((m) => { if (m.threadId === t.id) { if (isBuyer) m.seenBuyer = 1; else m.seenSeller = 1; } });
      return { thread: shapeThread(t, true) };
    }

    if (sub === 'messages') {
      const kind = ['text', 'offer'].includes(b.kind) ? b.kind : 'text';
      const bodyText = String(b.body || '').slice(0, 1000);
      if (!bodyText && kind === 'text') fail('Empty message.');
      DB.messages.push({ id: nextId(DB.messages), threadId: t.id, senderId: u.id, kind,
        body: bodyText, meta: b.meta || {}, seenBuyer: isBuyer ? 1 : 0, seenSeller: isBuyer ? 0 : 1,
        createdAt: Date.now() });
      t.lastAt = Date.now();
      return { thread: shapeThread(t, true) };
    }

    if (sub === 'deal') {
      if (b.agree === false) {
        t.buyerOk = 0; t.sellerOk = 0; t.dealAt = null; t.lastAt = Date.now();
        DB.messages.push({ id: nextId(DB.messages), threadId: t.id, senderId: u.id, kind: 'system',
          body: 'deal_withdrawn', meta: {}, seenBuyer: 1, seenSeller: 1, createdAt: Date.now() });
        return { thread: shapeThread(t, true) };
      }
      const price = b.price !== undefined ? Math.round(Number(b.price)) : t.dealPrice;
      const qty = b.qty !== undefined ? Number(b.qty) : t.dealQty;
      const delivery = b.delivery !== undefined ? (b.delivery ? 1 : 0) : t.dealDelivery;
      // Any change of terms wipes both agreements — nobody is bound by surprise.
      const changed = price !== t.dealPrice || qty !== t.dealQty || delivery !== t.dealDelivery;
      let buyerOk = changed ? 0 : t.buyerOk;
      let sellerOk = changed ? 0 : t.sellerOk;
      if (isBuyer) buyerOk = 1; else sellerOk = 1;
      const both = buyerOk && sellerOk;
      Object.assign(t, { buyerOk, sellerOk, dealPrice: price, dealQty: qty, dealDelivery: delivery,
        dealAt: both ? Date.now() : null, lastAt: Date.now() });
      DB.messages.push({ id: nextId(DB.messages), threadId: t.id, senderId: u.id, kind: 'deal',
        body: both ? 'deal_agreed' : 'deal_proposed', meta: { price, qty, delivery },
        seenBuyer: isBuyer ? 1 : 0, seenSeller: isBuyer ? 0 : 1, createdAt: Date.now() });
      return { thread: shapeThread(t, true) };
    }
  }

  if (a === 'ratings') {
    const u = needUser();
    const t = DB.threads.find((x) => x.id === Number(b.threadId)) || fail('Not found.');
    if (t.buyerId !== u.id && t.sellerId !== u.id) fail('Not your chat.');
    if (!t.dealAt) fail('Rate only after a deal is agreed.');
    const rateeId = t.buyerId === u.id ? t.sellerId : t.buyerId;
    DB.ratings = DB.ratings.filter((r) => !(r.threadId === t.id && r.raterId === u.id));
    DB.ratings.push({ id: nextId(DB.ratings), threadId: t.id, raterId: u.id, rateeId,
      stars: Math.min(5, Math.max(1, Math.round(Number(b.stars) || 0))),
      note: String(b.note || '').slice(0, 200), createdAt: Date.now() });
    return { ok: true };
  }

  if (a === 'prices') {
    if (method === 'GET') {
      const cutoff = Date.now() - 14 * day;
      const byCrop = new Map();
      for (const r of DB.prices.filter((x) => x.createdAt > cutoff).sort((x, y) => y.createdAt - x.createdAt)) {
        if (!byCrop.has(r.cropKey)) byCrop.set(r.cropKey, []);
        byCrop.get(r.cropKey).push(r);
      }
      const out = [];
      for (const [cropKey, list] of byCrop) {
        const sorted = [...list].sort((x, y) => x.price - y.price);
        const half = Math.ceil(list.length / 2);
        const avg = (xs) => xs.reduce((s, x) => s + x.price, 0) / (xs.length || 1);
        const recent = list.slice(0, half), older = list.slice(half);
        out.push({ cropKey, crop: CROP.get(cropKey) || { name: cropKey, icon: '🧺' },
          median: sorted[Math.floor(sorted.length / 2)].price, low: sorted[0].price,
          high: sorted[sorted.length - 1].price, reports: list.length, unit: list[0].unit,
          updatedAt: list[0].createdAt,
          trend: older.length ? Math.round(((avg(recent) - avg(older)) / avg(older)) * 100) : 0,
          markets: [...new Set(list.map((x) => x.market))] });
      }
      return { prices: out.sort((x, y) => y.reports - x.reports) };
    }
    const u = needUser();
    if (!CROP.has(b.cropKey)) fail('Pick a crop.');
    if (!(Number(b.price) > 0)) fail('Enter a price.');
    DB.prices.push({ id: nextId(DB.prices), cropKey: b.cropKey, market: b.market || 'leh_main',
      price: Math.round(Number(b.price)), unit: b.unit || 'kg', userId: u.id, createdAt: Date.now() });
    return { ok: true };
  }

  if (a === 'wanted') {
    if (method === 'GET') {
      const viewer = me();
      return { wanted: DB.wanted.filter((w) => w.status === 'open')
        .sort((x, y) => y.createdAt - x.createdAt).map((w) => ({
          ...w, crop: CROP.get(w.cropKey) || { name: w.cropKey, icon: '🧺', cat: 'other' },
          mine: viewer ? viewer.id === w.userId : false,
          user: publicUser(DB.users.find((u) => u.id === w.userId)) })) };
    }
    const u = needUser();
    if (method === 'DELETE') {
      const w = DB.wanted.find((x) => x.id === Number(id)) || fail('Not found.');
      if (w.userId !== u.id) fail('Not yours.');
      DB.wanted = DB.wanted.filter((x) => x.id !== w.id);
      return { ok: true };
    }
    if (!CROP.has(b.cropKey)) fail('Pick what you need.');
    DB.wanted.push({ id: nextId(DB.wanted), userId: u.id, cropKey: b.cropKey,
      qty: String(b.qty || '').slice(0, 40), note: String(b.note || '').slice(0, 300),
      district: b.district || u.district, village: b.village || u.village,
      status: 'open', createdAt: Date.now() });
    return { ok: true };
  }

  if (a === 'notices') return { notices: DB.notices };
  if (a === 'reports') return { ok: true };

  if (a === 'updates') {
    const u = me();
    if (!u) return { unread: 0 };
    let n = 0;
    for (const t of DB.threads) {
      if (t.buyerId !== u.id && t.sellerId !== u.id) continue;
      const isBuyer = t.buyerId === u.id;
      n += DB.messages.filter((m) => m.threadId === t.id && m.senderId !== u.id
        && !(isBuyer ? m.seenBuyer : m.seenSeller)).length;
    }
    return { unread: n };
  }

  if (a === 'photos') {
    needUser();
    const pid = 'p' + Date.now();
    DB.photos[pid] = raw;                 // already a data URL in local mode
    return { photoId: pid };
  }

  fail('Unknown endpoint');
}

export const localPhoto = (id) => { load(); return DB.photos[id] || null; };

// The demo persona switcher needs a roster and a way to become someone.
export function localPersonas() { load(); return DB.users.map((u) => ({ ...publicUser(u), lang: u.lang })); }
export function localBecome(userId) { load(); DB.sessionUserId = userId; save(); }
