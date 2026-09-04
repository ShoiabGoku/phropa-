// Demo data, so a fresh install has something to look at.
// Phone numbers are deliberately fake (9000000xxx) and the PIN for every demo
// account is 1234. Run: node seed-demo.js
import { randomBytes, scryptSync } from 'node:crypto';
import { db, one, run, now } from './lib/db.js';

if (one('SELECT COUNT(*) c FROM listings').c > 0) {
  console.log('Data already present — nothing seeded. Delete data/tsongra.db to start over.');
  process.exit(0);
}

const t = now();
const day = 86400000;

const mkUser = (u) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync('1234', salt, 32).toString('hex');
  const r = run(
    `INSERT INTO users (phone,name,pin_hash,pin_salt,role,district,village,lang,bio,
       delivers,delivery_areas,delivery_fee,free_above,delivery_note,organic,created_at,last_seen)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    u.phone, u.name, hash, salt, u.role || 'both', u.district, u.village, u.lang || 'en',
    u.bio || '', u.delivers ? 1 : 0, JSON.stringify(u.areas || []), u.fee || 0,
    u.freeAbove || 0, u.deliveryNote || '', u.organic ? 1 : 0, t - 40 * day, t);
  return Number(r.lastInsertRowid);
};

const users = [
  { phone: '9000000001', name: 'Tsering Dolma', district: 'leh', village: 'Choglamsar', lang: 'lbj',
    bio: 'Two greenhouses at Choglamsar. Greens all through winter.',
    delivers: true, areas: ['leh'], fee: 50, freeAbove: 800,
    deliveryNote: 'I come into Leh market every Tuesday and Friday morning.', organic: true },
  { phone: '9000000002', name: 'Stanzin Norboo', district: 'nubra', village: 'Turtuk', lang: 'lbj',
    bio: 'Apricot orchard in Turtuk. Fourth generation.',
    delivers: true, areas: ['nubra', 'leh'], fee: 150, freeAbove: 3000,
    deliveryNote: 'Truck goes to Leh twice a month. Ask me for dates.' },
  { phone: '9000000003', name: 'Mohammad Ali', district: 'kargil', village: 'Sankoo', lang: 'ur',
    bio: 'Apricot, walnut and barley from Sankoo valley.',
    delivers: true, areas: ['kargil', 'drass'], fee: 80, deliveryNote: 'Kargil town and Drass side only.' },
  { phone: '9000000004', name: 'Rigzin Angmo', district: 'sham', village: 'Skurbuchan', lang: 'lbj',
    bio: 'Raktsey Karpo apricot, dried on clean racks. GI variety kept separate.', organic: true },
  { phone: '9000000005', name: 'Sonam Wangchuk', district: 'changthang', village: 'Nyoma', lang: 'lbj',
    bio: 'Barley, peas and turnip from Nyoma. Also butter and churpe.' },
  { phone: '9000000006', name: 'Padma Deachen', district: 'zanskar', village: 'Padum', lang: 'lbj',
    bio: 'Zanskar naked barley and ngamphey, ground at home.' },
  { phone: '9000000007', name: 'Fatima Bano', district: 'drass', village: 'Drass town', lang: 'ur',
    bio: 'Potato and turnip. Drass grows the hardiest ones.' },
  { phone: '9000000008', name: 'Jigmet Tundup', district: 'leh', village: 'Saboo', lang: 'en',
    role: 'buyer', bio: 'I run a small guest house in Leh. I buy vegetables all summer.' },
];
const id = users.map(mkUser);

const mkListing = (l) => run(
  `INSERT INTO listings (seller_id,crop_key,cat,title,note,price,unit,qty,negotiable,organic,
     harvested,district,village,status,views,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'live',?,?,?)`,
  l.by, l.crop, l.cat, l.title, l.note || '', l.price, l.unit || 'kg', l.qty || 0,
  l.neg === false ? 0 : 1, l.organic ? 1 : 0, l.harvested || '',
  users[l.byIdx].district, users[l.byIdx].village, l.views || Math.floor(Math.random() * 40),
  t - (l.age || 1) * day, t - (l.age || 1) * day);

const listings = [
  { byIdx: 0, crop: 'spinach', cat: 'veg', title: 'Greenhouse spinach, cut this morning', price: 90, qty: 25,
    note: 'Grown in my trench greenhouse at Choglamsar. No spray at all. I cut it the same morning you collect.', organic: true, harvested: 'Today', age: 0 },
  { byIdx: 0, crop: 'chard', cat: 'veg', title: 'Swiss chard — winter cutting', price: 110, qty: 12,
    note: 'One sowing in September, I have been cutting leaves since November. Very tender.', organic: true, age: 1 },
  { byIdx: 0, crop: 'pakchoi', cat: 'veg', title: 'Pak choi, small heads', price: 160, qty: 8,
    note: 'Hotels take most of this. A few kilos spare this week.', organic: true, age: 2 },
  { byIdx: 1, crop: 'apricot', cat: 'fruit', title: 'Turtuk apricot, fresh', price: 140, qty: 80,
    note: 'Picked from our own trees in Turtuk. Sweet, thin skin. Best eaten within three days.', harvested: 'Yesterday', age: 1, views: 96 },
  { byIdx: 1, crop: 'phating', cat: 'dry', title: 'Sun-dried apricot (phating)', price: 420, qty: 40,
    note: 'Dried on racks, never on the ground. No sulphur, no sugar. Keeps a full year.', age: 3, views: 61 },
  { byIdx: 1, crop: 'kernel', cat: 'dry', title: 'Apricot kernels, sweet variety', price: 520, qty: 15, age: 5 },
  { byIdx: 2, crop: 'walnut', cat: 'fruit', title: 'Sankoo walnut, thin shell', price: 380, qty: 60,
    note: 'Breaks in your hand, no hammer needed. This year\'s crop.', age: 2, views: 44 },
  { byIdx: 2, crop: 'apricotoil', cat: 'dry', title: 'Cold-pressed apricot kernel oil', price: 900, unit: 'litre', qty: 9,
    note: 'Pressed at Sankoo. Good for cooking and for skin in winter.', age: 6 },
  { byIdx: 3, crop: 'apricot_rk', cat: 'fruit', title: 'Raktsey Karpo apricot (GI) — graded', price: 260, qty: 35,
    note: 'The GI variety with the white kernel. Kept completely separate from ordinary apricot and graded by size.', organic: true, age: 1, views: 132 },
  { byIdx: 4, crop: 'barley', cat: 'grain', title: 'Naked barley (nas), cleaned', price: 55, qty: 400,
    note: 'Our own village seed, grown at Nyoma. Cleaned and winnowed.', neg: false, age: 4 },
  { byIdx: 4, crop: 'butter', cat: 'dairy', title: 'Dzo butter', price: 700, qty: 12, age: 2 },
  { byIdx: 4, crop: 'churpe', cat: 'dairy', title: 'Hard churpe, dried', price: 480, qty: 7, age: 8 },
  { byIdx: 5, crop: 'tsampa', cat: 'grain', title: 'Ngamphey (roasted barley flour)', price: 95, qty: 120,
    note: 'Roasted and ground at home in Padum. Nothing added.', age: 3, views: 58 },
  { byIdx: 5, crop: 'peas_dry', cat: 'grain', title: 'Zanskar dry peas', price: 85, qty: 90, age: 7 },
  { byIdx: 6, crop: 'potato', cat: 'veg', title: 'Drass potato', price: 35, qty: 500,
    note: 'Stored cool and dark since October. Good for seed as well as eating.', age: 2 },
  { byIdx: 6, crop: 'turnip', cat: 'veg', title: 'Turnip (nyungma), storage crop', price: 30, qty: 250, age: 5 },
  { byIdx: 0, crop: 'seed_veg', cat: 'seed', title: 'Siberian kale seed — winter greens', price: 60, unit: 'packet', qty: 30,
    note: 'Saved from my own plants, three winters running. Sow in the trench by early October.', age: 4 },
  { byIdx: 3, crop: 'sapling_fruit', cat: 'seed', title: 'Raktsey Karpo saplings, 2 year', price: 250, unit: 'sapling', qty: 40,
    note: 'Grafted from our registered mother trees. Plant March–April or October.', age: 9 },
  { byIdx: 4, crop: 'seabuckthorn', cat: 'fruit', title: 'Sea buckthorn berry (tsestalulu)', price: 120, qty: 45,
    note: 'Cut branches, frozen berries. Best for juice.', age: 6 },
  { byIdx: 6, crop: 'fodder', cat: 'other', title: 'Alfalfa (ol), dried bundles', price: 25, unit: 'bundle', qty: 200, age: 10 },
];
listings.forEach((l) => mkListing({ ...l, by: id[l.byIdx] }));

// Rate board reports across a fortnight so the trend arrows have something real.
const priceRows = [
  ['apricot', 'leh_main', [130, 145, 150, 140, 155]],
  ['apricot', 'diskit', [110, 120, 115]],
  ['potato', 'leh_main', [40, 38, 42, 35]],
  ['turnip', 'leh_main', [30, 28, 32]],
  ['barley', 'padum', [52, 55, 58]],
  ['walnut', 'kargil_main', [360, 380, 400]],
  ['spinach', 'leh_main', [80, 95, 100, 90]],
  ['phating', 'leh_main', [400, 430, 450]],
  ['tsampa', 'leh_main', [90, 95, 92]],
];
priceRows.forEach(([crp, mkt, ps]) => ps.forEach((p, i) =>
  run('INSERT INTO prices (crop_key,market,price,unit,user_id,created_at) VALUES (?,?,?,?,?,?)',
    crp, mkt, p, 'kg', id[i % id.length], t - (ps.length - i) * 2 * day)));

const wants = [
  [7, 'tomato', '30 kg a week', 'For my guest house kitchen through the season. Regular order, June to September.'],
  [7, 'lettuce', '10 kg a week', 'Salad greens for guests. I will pay well for a steady supply.'],
  [0, 'compost', '20 bags', 'Well-rotted manure for the greenhouses before spring sowing.'],
  [5, 'seed_potato', '2 quintal', 'Looking for clean seed potato for Padum, ideally certified.'],
];
wants.forEach(([i, crp, qty, note]) =>
  run('INSERT INTO wanted (user_id,crop_key,qty,note,district,village,created_at) VALUES (?,?,?,?,?,?,?)',
    id[i], crp, qty, note, users[i].district, users[i].village, t - Math.floor(Math.random() * 5) * day));

console.log(`Seeded ${users.length} demo accounts, ${listings.length} listings, price reports and wanted posts.`);
console.log('Every demo account uses PIN 1234. Try logging in as 9000000001 (Tsering Dolma, a merchant who delivers).');
