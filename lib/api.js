import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db, one, all, run, now } from './db.js';
import { CATALOGUE, CROPS, DISTRICTS, districtZone } from '../public/catalogue.js';
import { localise } from '../public/names.js';

localise(CATALOGUE);   // adds .i18n = { hi, ur } to categories, crops, seeds and zones

const CROP = new Map(CROPS.map((c) => [c.key, c]));
const MAX_PHOTO = 400 * 1024; // photos are downscaled in the browser first

// --- auth helpers ----------------------------------------------------------
function hashPin(pin, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(String(pin), salt, 32).toString('hex') };
}
function pinMatches(pin, salt, hash) {
  const a = Buffer.from(scryptSync(String(pin), salt, 32).toString('hex'));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}
const normPhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);

export function userFromToken(token) {
  if (!token) return null;
  const s = one('SELECT user_id FROM sessions WHERE token = ?', token);
  if (!s) return null;
  const u = one('SELECT * FROM users WHERE id = ?', s.user_id);
  if (u) run('UPDATE users SET last_seen = ? WHERE id = ?', now(), u.id);
  return u;
}

// Never leak pin material or a phone number the caller has not earned.
function publicUser(u, revealPhone = false) {
  if (!u) return null;
  const r = one(
    'SELECT AVG(stars) avg, COUNT(*) n FROM ratings WHERE ratee_id = ?', u.id);
  const deals = one(
    'SELECT COUNT(*) n FROM threads WHERE (buyer_id = ? OR seller_id = ?) AND deal_at IS NOT NULL',
    u.id, u.id).n;
  return {
    id: u.id,
    name: u.name,
    district: u.district,
    village: u.village,
    bio: u.bio,
    photoId: u.photo_id,
    delivers: !!u.delivers,
    deliveryAreas: JSON.parse(u.delivery_areas || '[]'),
    deliveryFee: u.delivery_fee,
    freeAbove: u.free_above,
    deliveryNote: u.delivery_note,
    organic: !!u.organic,
    rating: r.n ? Math.round(r.avg * 10) / 10 : null,
    ratingCount: r.n,
    deals,
    memberSince: u.created_at,
    phone: revealPhone ? u.phone : null,
  };
}

function selfUser(u) {
  return {
    ...publicUser(u, true),
    role: u.role,
    lang: u.lang,
  };
}

function shapeListing(row, viewer) {
  const crop = CROP.get(row.crop_key) || {};
  const seller = one('SELECT * FROM users WHERE id = ?', row.seller_id);
  return {
    id: row.id,
    cropKey: row.crop_key,
    cat: row.cat,
    title: row.title,
    cropName: crop.name || row.title,
    cropLocal: crop.local || '',
    icon: crop.icon || '🧺',
    note: row.note,
    price: row.price,
    unit: row.unit,
    qty: row.qty,
    negotiable: !!row.negotiable,
    organic: !!row.organic,
    harvested: row.harvested,
    photoId: row.photo_id,
    photos: JSON.parse(row.photos || '[]'),
    district: row.district,
    village: row.village,
    status: row.status,
    views: row.views,
    createdAt: row.created_at,
    mine: viewer ? viewer.id === row.seller_id : false,
    seller: publicUser(seller),
  };
}

// A merchant delivers to an area if they ticked that district or that village.
function deliversTo(seller, district, village) {
  if (!seller || !seller.delivers) return false;
  let areas = [];
  try { areas = JSON.parse(seller.delivery_areas || '[]'); } catch { areas = []; }
  if (!areas.length) return seller.district === district;
  return areas.includes(district) || areas.includes(`${district}:${village}`);
}

// ---------------------------------------------------------------------------
// Routes. Each returns [status, body] or throws {code, msg}.
// ---------------------------------------------------------------------------
const err = (code, msg) => { const e = new Error(msg); e.code = code; throw e; };

export const routes = {
  'POST /api/signup': (ctx) => {
    const b = ctx.body || {};
    const phone = normPhone(b.phone);
    if (phone.length !== 10) err(400, 'Enter a 10-digit mobile number.');
    if (!/^\d{4,6}$/.test(String(b.pin || ''))) err(400, 'Your PIN must be 4 to 6 digits.');
    if (!String(b.name || '').trim()) err(400, 'Please enter your name.');
    if (one('SELECT id FROM users WHERE phone = ?', phone)) {
      err(409, 'This number is already registered. Log in instead.');
    }
    const { salt, hash } = hashPin(b.pin);
    const t = now();
    const r = run(
      `INSERT INTO users (phone,name,pin_hash,pin_salt,role,district,village,lang,created_at,last_seen)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      phone, String(b.name).trim().slice(0, 60), hash, salt,
      ['buyer', 'seller', 'both'].includes(b.role) ? b.role : 'both',
      b.district || 'leh', String(b.village || '').slice(0, 60), b.lang || 'en', t, t);
    const u = one('SELECT * FROM users WHERE id = ?', r.lastInsertRowid);
    return startSession(ctx, u);
  },

  'POST /api/login': (ctx) => {
    const b = ctx.body || {};
    const u = one('SELECT * FROM users WHERE phone = ?', normPhone(b.phone));
    if (!u || !pinMatches(b.pin, u.pin_salt, u.pin_hash)) {
      err(401, 'That number and PIN do not match.');
    }
    return startSession(ctx, u);
  },

  'POST /api/logout': (ctx) => {
    if (ctx.token) run('DELETE FROM sessions WHERE token = ?', ctx.token);
    ctx.clearCookie = true;
    return [200, { ok: true }];
  },

  'GET /api/me': (ctx) => [200, { user: ctx.user ? selfUser(ctx.user) : null }],

  'PATCH /api/me': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const b = ctx.body || {};
    const f = [], v = [];
    const set = (col, val) => { f.push(`${col} = ?`); v.push(val); };
    if (b.name !== undefined) set('name', String(b.name).trim().slice(0, 60));
    if (b.district !== undefined) set('district', b.district);
    if (b.village !== undefined) set('village', String(b.village).slice(0, 60));
    if (b.lang !== undefined) set('lang', b.lang);
    if (b.role !== undefined) set('role', b.role);
    if (b.bio !== undefined) set('bio', String(b.bio).slice(0, 300));
    if (b.photoId !== undefined) set('photo_id', b.photoId || null);
    if (b.organic !== undefined) set('organic', b.organic ? 1 : 0);
    if (b.delivers !== undefined) set('delivers', b.delivers ? 1 : 0);
    if (b.deliveryAreas !== undefined) set('delivery_areas', JSON.stringify(b.deliveryAreas || []));
    if (b.deliveryFee !== undefined) set('delivery_fee', Math.max(0, Number(b.deliveryFee) || 0));
    if (b.freeAbove !== undefined) set('free_above', Math.max(0, Number(b.freeAbove) || 0));
    if (b.deliveryNote !== undefined) set('delivery_note', String(b.deliveryNote).slice(0, 200));
    if (b.pin !== undefined) {
      if (!/^\d{4,6}$/.test(String(b.pin))) err(400, 'Your PIN must be 4 to 6 digits.');
      const { salt, hash } = hashPin(b.pin);
      set('pin_hash', hash); set('pin_salt', salt);
    }
    if (!f.length) return [200, { user: selfUser(u) }];
    v.push(u.id);
    run(`UPDATE users SET ${f.join(', ')} WHERE id = ?`, ...v);
    return [200, { user: selfUser(one('SELECT * FROM users WHERE id = ?', u.id)) }];
  },

  'GET /api/catalogue': () => [200, CATALOGUE],

  'GET /api/listings': (ctx) => {
    const q = ctx.query;
    const where = ["l.status = 'live'"], args = [];
    if (q.cat) { where.push('l.cat = ?'); args.push(q.cat); }
    if (q.crop) { where.push('l.crop_key = ?'); args.push(q.crop); }
    if (q.district) { where.push('l.district = ?'); args.push(q.district); }
    if (q.seller) { where.push('l.seller_id = ?'); args.push(Number(q.seller)); }
    if (q.organic === '1') where.push('l.organic = 1');
    if (q.q) {
      where.push('(LOWER(l.title) LIKE ? OR LOWER(l.note) LIKE ? OR LOWER(l.village) LIKE ? OR LOWER(l.crop_key) LIKE ?)');
      const like = `%${String(q.q).toLowerCase()}%`;
      args.push(like, like, like, like);
    }
    const order = q.sort === 'price' ? 'l.price ASC'
      : q.sort === 'price_desc' ? 'l.price DESC'
      : 'l.created_at DESC';
    let rows = all(
      `SELECT l.* FROM listings l WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT 300`, ...args);

    // "Delivers to me" is computed rather than stored, so a merchant changing
    // their delivery area instantly changes what buyers see.
    if (q.delivers === '1' && ctx.user) {
      rows = rows.filter((r) => {
        const s = one('SELECT * FROM users WHERE id = ?', r.seller_id);
        return deliversTo(s, ctx.user.district, ctx.user.village);
      });
    }
    const out = rows.map((r) => shapeListing(r, ctx.user));
    if (ctx.user) {
      for (const l of out) {
        l.deliversToMe = deliversTo(
          one('SELECT * FROM users WHERE id = ?', l.seller.id), ctx.user.district, ctx.user.village);
      }
    }
    return [200, { listings: out }];
  },

  'POST /api/listings': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const b = ctx.body || {};
    const crop = CROP.get(b.cropKey) || err(400, 'Pick what you are selling.');
    const price = Math.round(Number(b.price));
    if (!(price > 0)) err(400, 'Enter a price.');
    const t = now();
    const r = run(
      `INSERT INTO listings (seller_id,crop_key,cat,title,note,price,unit,qty,negotiable,organic,
        harvested,photo_id,photos,district,village,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      u.id, crop.key, crop.cat,
      String(b.title || crop.name).slice(0, 80),
      String(b.note || '').slice(0, 500),
      price, b.unit || 'kg', Number(b.qty) || 0,
      b.negotiable === false ? 0 : 1, b.organic ? 1 : 0,
      String(b.harvested || '').slice(0, 40),
      (Array.isArray(b.photos) && b.photos.length ? b.photos[0] : b.photoId) || null,
      JSON.stringify(Array.isArray(b.photos) ? b.photos.slice(0, 5) : (b.photoId ? [b.photoId] : [])),
      b.district || u.district, String(b.village || u.village).slice(0, 60), t, t);
    return [201, { listing: shapeListing(one('SELECT * FROM listings WHERE id = ?', r.lastInsertRowid), u) }];
  },

  'GET /api/listings/:id': (ctx) => {
    const row = one('SELECT * FROM listings WHERE id = ?', ctx.params.id) || err(404, 'This listing is gone.');
    if (!ctx.user || ctx.user.id !== row.seller_id) {
      run('UPDATE listings SET views = views + 1 WHERE id = ?', row.id);
    }
    const l = shapeListing(row, ctx.user);
    if (ctx.user) {
      const s = one('SELECT * FROM users WHERE id = ?', row.seller_id);
      l.deliversToMe = deliversTo(s, ctx.user.district, ctx.user.village);
      const th = one('SELECT id FROM threads WHERE listing_id = ? AND buyer_id = ?', row.id, ctx.user.id);
      l.threadId = th ? th.id : null;
    }
    return [200, { listing: l }];
  },

  'PATCH /api/listings/:id': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const row = one('SELECT * FROM listings WHERE id = ?', ctx.params.id) || err(404, 'Not found.');
    if (row.seller_id !== u.id) err(403, 'This is not your listing.');
    const b = ctx.body || {};
    const f = [], v = [];
    const set = (c, val) => { f.push(`${c} = ?`); v.push(val); };
    if (b.price !== undefined) set('price', Math.round(Number(b.price)) || row.price);
    if (b.qty !== undefined) set('qty', Number(b.qty) || 0);
    if (b.note !== undefined) set('note', String(b.note).slice(0, 500));
    if (b.status !== undefined && ['live', 'paused', 'sold'].includes(b.status)) set('status', b.status);
    if (b.negotiable !== undefined) set('negotiable', b.negotiable ? 1 : 0);
    if (Array.isArray(b.photos)) {
      set('photos', JSON.stringify(b.photos.slice(0, 5)));
      set('photo_id', b.photos[0] || null);
    }
    set('updated_at', now());
    v.push(row.id);
    run(`UPDATE listings SET ${f.join(', ')} WHERE id = ?`, ...v);
    return [200, { listing: shapeListing(one('SELECT * FROM listings WHERE id = ?', row.id), u) }];
  },

  'DELETE /api/listings/:id': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const row = one('SELECT * FROM listings WHERE id = ?', ctx.params.id) || err(404, 'Not found.');
    if (row.seller_id !== u.id) err(403, 'This is not your listing.');
    run('DELETE FROM listings WHERE id = ?', row.id);
    return [200, { ok: true }];
  },

  // --- chat ---------------------------------------------------------------
  'GET /api/threads': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const rows = all(
      'SELECT * FROM threads WHERE buyer_id = ? OR seller_id = ? ORDER BY last_at DESC', u.id, u.id);
    return [200, { threads: rows.map((t) => shapeThread(t, u, false)) }];
  },

  'POST /api/threads': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const listing = one('SELECT * FROM listings WHERE id = ?', ctx.body.listingId) || err(404, 'Listing gone.');
    if (listing.seller_id === u.id) err(400, 'This is your own listing.');
    let t = one('SELECT * FROM threads WHERE listing_id = ? AND buyer_id = ?', listing.id, u.id);
    if (!t) {
      const ts = now();
      const r = run(
        'INSERT INTO threads (listing_id,buyer_id,seller_id,created_at,last_at) VALUES (?,?,?,?,?)',
        listing.id, u.id, listing.seller_id, ts, ts);
      t = one('SELECT * FROM threads WHERE id = ?', r.lastInsertRowid);
      run(`INSERT INTO messages (thread_id,sender_id,kind,body,created_at) VALUES (?,?,?,?,?)`,
        t.id, null, 'system', 'chat_opened', ts);
    }
    return [200, { thread: shapeThread(t, u, true) }];
  },

  'GET /api/threads/:id': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const t = one('SELECT * FROM threads WHERE id = ?', ctx.params.id) || err(404, 'Not found.');
    if (t.buyer_id !== u.id && t.seller_id !== u.id) err(403, 'Not your chat.');
    const col = t.buyer_id === u.id ? 'seen_buyer' : 'seen_seller';
    run(`UPDATE messages SET ${col} = 1 WHERE thread_id = ?`, t.id);
    return [200, { thread: shapeThread(t, u, true) }];
  },

  'POST /api/threads/:id/messages': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const t = one('SELECT * FROM threads WHERE id = ?', ctx.params.id) || err(404, 'Not found.');
    if (t.buyer_id !== u.id && t.seller_id !== u.id) err(403, 'Not your chat.');
    const kind = ['text', 'offer'].includes(ctx.body.kind) ? ctx.body.kind : 'text';
    const body = String(ctx.body.body || '').slice(0, 1000);
    if (!body && kind === 'text') err(400, 'Empty message.');
    const ts = now();
    const isBuyer = t.buyer_id === u.id;
    run(`INSERT INTO messages (thread_id,sender_id,kind,body,meta,seen_buyer,seen_seller,created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
      t.id, u.id, kind, body, JSON.stringify(ctx.body.meta || {}),
      isBuyer ? 1 : 0, isBuyer ? 0 : 1, ts);
    run('UPDATE threads SET last_at = ? WHERE id = ?', ts, t.id);
    return [200, { thread: shapeThread(one('SELECT * FROM threads WHERE id = ?', t.id), u, true) }];
  },

  // Both sides must agree before either phone number is shown. This is the
  // whole trust model of the app, so it lives in one place.
  'POST /api/threads/:id/deal': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const t = one('SELECT * FROM threads WHERE id = ?', ctx.params.id) || err(404, 'Not found.');
    if (t.buyer_id !== u.id && t.seller_id !== u.id) err(403, 'Not your chat.');
    const isBuyer = t.buyer_id === u.id;
    const b = ctx.body || {};
    const ts = now();

    if (b.agree === false) {
      run('UPDATE threads SET buyer_ok = 0, seller_ok = 0, deal_at = NULL WHERE id = ?', t.id);
      run(`INSERT INTO messages (thread_id,sender_id,kind,body,created_at) VALUES (?,?,?,?,?)`,
        t.id, u.id, 'system', 'deal_withdrawn', ts);
      run('UPDATE threads SET last_at = ? WHERE id = ?', ts, t.id);
      return [200, { thread: shapeThread(one('SELECT * FROM threads WHERE id = ?', t.id), u, true) }];
    }

    // Whoever proposes sets the terms; if the other side had already agreed to
    // different terms, their agreement is reset so nobody is bound by surprise.
    const price = b.price !== undefined ? Math.round(Number(b.price)) : t.deal_price;
    const qty = b.qty !== undefined ? Number(b.qty) : t.deal_qty;
    const delivery = b.delivery !== undefined ? (b.delivery ? 1 : 0) : t.deal_delivery;
    const changed = price !== t.deal_price || qty !== t.deal_qty || delivery !== t.deal_delivery;

    let buyerOk = t.buyer_ok, sellerOk = t.seller_ok;
    if (changed) { buyerOk = 0; sellerOk = 0; }
    if (isBuyer) buyerOk = 1; else sellerOk = 1;

    const bothNow = buyerOk && sellerOk;
    run(`UPDATE threads SET buyer_ok = ?, seller_ok = ?, deal_price = ?, deal_qty = ?,
         deal_delivery = ?, deal_at = ?, last_at = ? WHERE id = ?`,
      buyerOk, sellerOk, price, qty, delivery, bothNow ? ts : null, ts, t.id);

    run(`INSERT INTO messages (thread_id,sender_id,kind,body,meta,created_at) VALUES (?,?,?,?,?,?)`,
      t.id, u.id, 'deal', bothNow ? 'deal_agreed' : 'deal_proposed',
      JSON.stringify({ price, qty, delivery }), ts);

    return [200, { thread: shapeThread(one('SELECT * FROM threads WHERE id = ?', t.id), u, true) }];
  },

  'POST /api/ratings': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const t = one('SELECT * FROM threads WHERE id = ?', ctx.body.threadId) || err(404, 'Not found.');
    if (t.buyer_id !== u.id && t.seller_id !== u.id) err(403, 'Not your chat.');
    if (!t.deal_at) err(400, 'Rate only after a deal is agreed.');
    const ratee = t.buyer_id === u.id ? t.seller_id : t.buyer_id;
    const stars = Math.min(5, Math.max(1, Math.round(Number(ctx.body.stars) || 0)));
    run(`INSERT INTO ratings (thread_id,rater_id,ratee_id,stars,note,created_at)
         VALUES (?,?,?,?,?,?)
         ON CONFLICT(thread_id, rater_id) DO UPDATE SET stars = excluded.stars, note = excluded.note`,
      t.id, u.id, ratee, stars, String(ctx.body.note || '').slice(0, 200), now());
    return [200, { ok: true }];
  },

  // --- rate board ----------------------------------------------------------
  'GET /api/prices': () => {
    const cutoff = now() - 14 * 86400000;
    const rows = all(
      `SELECT crop_key, market, price, unit, created_at FROM prices
       WHERE created_at > ? ORDER BY created_at DESC`, cutoff);
    const byCrop = new Map();
    for (const r of rows) {
      if (!byCrop.has(r.crop_key)) byCrop.set(r.crop_key, []);
      byCrop.get(r.crop_key).push(r);
    }
    const out = [];
    for (const [cropKey, list] of byCrop) {
      const sorted = [...list].sort((a, b) => a.price - b.price);
      const median = sorted[Math.floor(sorted.length / 2)].price;
      const recent = list.slice(0, Math.ceil(list.length / 2));
      const older = list.slice(Math.ceil(list.length / 2));
      const avg = (xs) => xs.reduce((s, x) => s + x.price, 0) / (xs.length || 1);
      out.push({
        cropKey,
        crop: CROP.get(cropKey) || { name: cropKey, icon: '🧺' },
        median,
        low: sorted[0].price,
        high: sorted[sorted.length - 1].price,
        reports: list.length,
        unit: list[0].unit,
        updatedAt: list[0].created_at,
        trend: older.length ? Math.round(((avg(recent) - avg(older)) / avg(older)) * 100) : 0,
        markets: [...new Set(list.map((r) => r.market))],
        series: [...list].reverse().slice(-14).map((r) => r.price),
      });
    }
    out.sort((a, b) => b.reports - a.reports);
    return [200, { prices: out }];
  },

  'POST /api/prices': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const b = ctx.body || {};
    if (!CROP.has(b.cropKey)) err(400, 'Pick a crop.');
    const price = Math.round(Number(b.price));
    if (!(price > 0)) err(400, 'Enter a price.');
    run('INSERT INTO prices (crop_key,market,price,unit,user_id,created_at) VALUES (?,?,?,?,?,?)',
      b.cropKey, String(b.market || 'leh_main'), price, b.unit || 'kg', u.id, now());
    return [201, { ok: true }];
  },

  // --- wanted board --------------------------------------------------------
  'GET /api/wanted': (ctx) => {
    const rows = all(
      `SELECT * FROM wanted WHERE status = 'open' ORDER BY created_at DESC LIMIT 100`);
    return [200, {
      wanted: rows.map((w) => ({
        id: w.id, cropKey: w.crop_key, crop: CROP.get(w.crop_key) || { name: w.crop_key, icon: '🧺' },
        qty: w.qty, note: w.note, district: w.district, village: w.village,
        createdAt: w.created_at, mine: ctx.user ? ctx.user.id === w.user_id : false,
        user: publicUser(one('SELECT * FROM users WHERE id = ?', w.user_id)),
      })),
    }];
  },

  'POST /api/wanted': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const b = ctx.body || {};
    if (!CROP.has(b.cropKey)) err(400, 'Pick what you need.');
    run(`INSERT INTO wanted (user_id,crop_key,qty,note,district,village,created_at)
         VALUES (?,?,?,?,?,?,?)`,
      u.id, b.cropKey, String(b.qty || '').slice(0, 40), String(b.note || '').slice(0, 300),
      b.district || u.district, b.village || u.village, now());
    return [201, { ok: true }];
  },

  'DELETE /api/wanted/:id': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    const w = one('SELECT * FROM wanted WHERE id = ?', ctx.params.id) || err(404, 'Not found.');
    if (w.user_id !== u.id) err(403, 'Not yours.');
    run('DELETE FROM wanted WHERE id = ?', w.id);
    return [200, { ok: true }];
  },

  'GET /api/notices': () => [200, { notices: all('SELECT * FROM notices ORDER BY created_at DESC') }],

  'POST /api/reports': (ctx) => {
    run('INSERT INTO reports (user_id,listing_id,reason,created_at) VALUES (?,?,?,?)',
      ctx.user ? ctx.user.id : null, Number(ctx.body.listingId) || null,
      String(ctx.body.reason || '').slice(0, 300), now());
    return [200, { ok: true }];
  },

  // Cheap poll for the unread badge. Deliberately tiny.
  'GET /api/updates': (ctx) => {
    if (!ctx.user) return [200, { unread: 0 }];
    const col = 'CASE WHEN t.buyer_id = ? THEN m.seen_buyer ELSE m.seen_seller END';
    const n = one(
      `SELECT COUNT(*) c FROM messages m JOIN threads t ON t.id = m.thread_id
       WHERE (t.buyer_id = ? OR t.seller_id = ?) AND m.sender_id IS NOT ? AND ${col} = 0`,
      ctx.user.id, ctx.user.id, ctx.user.id, ctx.user.id).c;
    return [200, { unread: n }];
  },

  'POST /api/photos': (ctx) => {
    const u = ctx.user || err(401, 'Please log in.');
    if (!ctx.raw || !ctx.raw.length) err(400, 'No image.');
    if (ctx.raw.length > MAX_PHOTO) err(413, 'That photo is too large.');
    const r = run('INSERT INTO photos (user_id,mime,bytes,created_at) VALUES (?,?,?,?)',
      u.id, ctx.contentType || 'image/jpeg', ctx.raw, now());
    return [201, { photoId: Number(r.lastInsertRowid) }];
  },
};

function startSession(ctx, u) {
  const token = randomBytes(24).toString('hex');
  run('INSERT INTO sessions (token,user_id,created_at) VALUES (?,?,?)', token, u.id, now());
  ctx.setCookie = token;
  return [200, { user: selfUser(u) }];
}

function shapeThread(t, viewer, withMessages) {
  const listing = one('SELECT * FROM listings WHERE id = ?', t.listing_id);
  const buyer = one('SELECT * FROM users WHERE id = ?', t.buyer_id);
  const seller = one('SELECT * FROM users WHERE id = ?', t.seller_id);
  const isBuyer = t.buyer_id === viewer.id;
  const other = isBuyer ? seller : buyer;
  const sealed = !!t.deal_at;                    // both sides agreed
  const crop = listing ? (CROP.get(listing.crop_key) || {}) : {};

  const unreadCol = isBuyer ? 'seen_buyer' : 'seen_seller';
  const unread = one(
    `SELECT COUNT(*) c FROM messages WHERE thread_id = ? AND ${unreadCol} = 0 AND sender_id IS NOT ?`,
    t.id, viewer.id).c;
  const last = one('SELECT body, kind, created_at FROM messages WHERE thread_id = ? ORDER BY id DESC LIMIT 1', t.id);

  const out = {
    id: t.id,
    listingId: t.listing_id,
    listing: listing ? {
      id: listing.id, title: listing.title, price: listing.price, unit: listing.unit,
      photoId: listing.photo_id, icon: crop.icon || '🧺', cropKey: listing.crop_key, village: listing.village,
      district: listing.district, status: listing.status, cropLocal: crop.local || '',
    } : null,
    role: isBuyer ? 'buyer' : 'seller',
    other: publicUser(other, sealed),           // phone only once the deal is sealed
    myOk: isBuyer ? !!t.buyer_ok : !!t.seller_ok,
    theirOk: isBuyer ? !!t.seller_ok : !!t.buyer_ok,
    sealed,
    dealPrice: t.deal_price,
    dealQty: t.deal_qty,
    dealDelivery: !!t.deal_delivery,
    dealAt: t.deal_at,
    sellerDelivers: !!seller.delivers,
    deliveryFee: seller.delivery_fee,
    freeAbove: seller.free_above,
    deliveryNote: seller.delivery_note,
    canDeliverHere: deliversTo(seller, buyer.district, buyer.village),
    buyerPlace: `${buyer.village || ''}${buyer.village ? ', ' : ''}${(DISTRICTS.find((d) => d.key === buyer.district) || {}).name || ''}`,
    sellerPlace: `${seller.village || ''}${seller.village ? ', ' : ''}${(DISTRICTS.find((d) => d.key === seller.district) || {}).name || ''}`,
    unread,
    lastAt: t.last_at,
    lastKind: last ? last.kind : 'text',
    lastBody: last ? last.body : '',
    rated: !!one('SELECT id FROM ratings WHERE thread_id = ? AND rater_id = ?', t.id, viewer.id),
  };

  if (withMessages) {
    out.messages = all(
      'SELECT id,sender_id,kind,body,meta,created_at FROM messages WHERE thread_id = ? ORDER BY id', t.id)
      .map((m) => ({
        id: m.id, kind: m.kind, body: m.body, at: m.created_at,
        meta: JSON.parse(m.meta || '{}'),
        me: m.sender_id === viewer.id,
      }));
  }
  return out;
}

export { districtZone };
