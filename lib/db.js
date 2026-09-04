// SQLite storage. Node 24's built-in node:sqlite — no npm dependencies anywhere
// in this project, which matters when the thing has to be installed and kept
// running on a modest machine with a slow connection.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Resolve against this file, not the shell's cwd — the server is often
// launched from somewhere else entirely.
const DB_PATH = process.env.TSONGRA_DB || resolve(import.meta.dirname, '..', 'data', 'tsongra.db');
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA busy_timeout = 4000');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  phone          TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  pin_hash       TEXT NOT NULL,
  pin_salt       TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'both',
  district       TEXT NOT NULL DEFAULT 'leh',
  village        TEXT NOT NULL DEFAULT '',
  lang           TEXT NOT NULL DEFAULT 'en',
  bio            TEXT NOT NULL DEFAULT '',
  photo_id       INTEGER,
  delivers       INTEGER NOT NULL DEFAULT 0,
  delivery_areas TEXT NOT NULL DEFAULT '[]',
  delivery_fee   INTEGER NOT NULL DEFAULT 0,
  free_above     INTEGER NOT NULL DEFAULT 0,
  delivery_note  TEXT NOT NULL DEFAULT '',
  organic        INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL,
  last_seen      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  mime       TEXT NOT NULL,
  bytes      BLOB NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_key     TEXT NOT NULL,
  cat          TEXT NOT NULL,
  title        TEXT NOT NULL,
  note         TEXT NOT NULL DEFAULT '',
  price        INTEGER NOT NULL,
  unit         TEXT NOT NULL DEFAULT 'kg',
  qty          REAL NOT NULL DEFAULT 0,
  negotiable   INTEGER NOT NULL DEFAULT 1,
  organic      INTEGER NOT NULL DEFAULT 0,
  harvested    TEXT NOT NULL DEFAULT '',
  photo_id     INTEGER,
  district     TEXT NOT NULL,
  village      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'live',
  views        INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_listings_live ON listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);

CREATE TABLE IF NOT EXISTS threads (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id   INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_ok     INTEGER NOT NULL DEFAULT 0,
  seller_ok    INTEGER NOT NULL DEFAULT 0,
  deal_price   INTEGER,
  deal_qty     REAL,
  deal_delivery INTEGER NOT NULL DEFAULT 0,
  deal_at      INTEGER,
  created_at   INTEGER NOT NULL,
  last_at      INTEGER NOT NULL,
  UNIQUE(listing_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id  INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  kind       TEXT NOT NULL DEFAULT 'text',
  body       TEXT NOT NULL DEFAULT '',
  meta       TEXT NOT NULL DEFAULT '{}',
  seen_buyer INTEGER NOT NULL DEFAULT 0,
  seen_seller INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, id);

CREATE TABLE IF NOT EXISTS prices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_key   TEXT NOT NULL,
  market     TEXT NOT NULL,
  price      INTEGER NOT NULL,
  unit       TEXT NOT NULL DEFAULT 'kg',
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_prices_crop ON prices(crop_key, created_at DESC);

CREATE TABLE IF NOT EXISTS wanted (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_key   TEXT NOT NULL,
  qty        TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  district   TEXT NOT NULL,
  village    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ratings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id  INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  rater_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ratee_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stars      INTEGER NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  UNIQUE(thread_id, rater_id)
);

CREATE TABLE IF NOT EXISTS notices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  tag        TEXT NOT NULL DEFAULT 'info',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  listing_id INTEGER,
  reason     TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
`);

export const now = () => Date.now();

// Thin helpers so call sites stay readable.
export const one = (sql, ...a) => db.prepare(sql).get(...a);
export const all = (sql, ...a) => db.prepare(sql).all(...a);
export const run = (sql, ...a) => db.prepare(sql).run(...a);

export function seedNotices() {
  const n = one('SELECT COUNT(*) c FROM notices').c;
  if (n > 0) return;
  const rows = [
    ['Greenhouse subsidy — apply before winter',
     'The Agriculture Department runs a subsidy on trench and passive solar greenhouses. Applications usually open before the winter season. Ask at your block Agriculture office or the nearest KVK for this year\'s dates and the share you must pay.',
     'scheme'],
    ['Grade your Raktsey Karpo separately',
     'Raktsey Karpo apricot carries a Geographical Indication, so only fruit grown in Ladakh may be sold under that name. Keep it separate from ordinary apricot when you dry and pack it — mixing varieties is the fastest way to lose the price the GI name earns you.',
     'tip'],
    ['Tsongra never handles your money',
     'Every payment on Tsongra happens directly between the two people — cash, UPI or bank transfer, whatever you both agree. The app carries no wallet and takes no commission. If anyone asks you to pay through the app or to a "Tsongra account", it is a fraud. Report it.',
     'safety'],
    ['Free seed and soil advice at your KVK',
     'Krishi Vigyan Kendra Leh and Kargil, and DIHAR in Leh, give free advice on varieties, soil testing and sowing dates for your altitude. If you are trying something new from the Seed Bank, talk to them first — a short conversation can save a whole season.',
     'info'],
  ];
  const st = db.prepare('INSERT INTO notices (title, body, tag, created_at) VALUES (?,?,?,?)');
  const t = now();
  rows.forEach((r, i) => st.run(r[0], r[1], r[2], t - i * 86400000));
}

seedNotices();
