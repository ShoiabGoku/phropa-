// App state plus the API client.
//
// The app runs in two modes and every screen is identical in both:
//   server — a Node process with SQLite behind it. A real marketplace.
//   local  — no server at all (GitHub Pages). Everything is answered from
//            browser storage by local-api.js. A demo, and it says so.
// Mode is detected once at boot by asking for the catalogue.
import { localApi, localPhoto } from './local-api.js';

export const state = {
  user: null,
  cat: null,
  unread: 0,
  online: navigator.onLine,
  local: false,      // true once we know there is no server
};

const LS = {
  get(k, fallback) {
    try { const v = localStorage.getItem('tsongra.' + k); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(k, v) { try { localStorage.setItem('tsongra.' + k, JSON.stringify(v)); } catch {} },
};

// Paths are relative so the app works from a sub-path (github.io/<repo>/)
// exactly as it does from a domain root.
const rel = (p) => p.replace(/^\//, '');

const toDataUrl = (blob) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.onerror = () => rej(new Error('Could not read that photo'));
  fr.readAsDataURL(blob);
});

export async function api(path, { method = 'GET', body, raw, type } = {}) {
  if (state.local) {
    // With no server there is nowhere to POST bytes, so a photo becomes a data
    // URL held in this browser.
    return localApi(path, { method, body, raw: raw instanceof Blob ? await toDataUrl(raw) : raw });
  }

  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (raw) { opts.body = raw; opts.headers['content-type'] = type || 'image/jpeg'; }
  else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers['content-type'] = 'application/json'; }
  const res = await fetch(rel(path), opts);
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

// Where a stored photo lives. On a server it is a URL; with no server it is the
// data URL itself, held in browser storage.
export function photoUrl(id) {
  if (!id) return null;
  return state.local ? localPhoto(id) : rel(`/photo/${id}`);
}

// One request decides the mode, and it is the request we needed anyway.
export async function boot() {
  try {
    const res = await fetch(rel('/api/catalogue'), { credentials: 'same-origin' });
    if (res.ok) {
      const c = await res.json();
      if (c && Array.isArray(c.CROPS)) {
        state.local = false;
        state.cat = c;
        LS.set('catalogue', c);
        return state.cat;
      }
    }
  } catch { /* offline, or no server — fall through */ }

  // No server answered. If we have a cached catalogue from a real server we are
  // simply offline; otherwise this is a static host and we run locally.
  const cached = LS.get('catalogue', null);
  if (cached && navigator.onLine === false) { state.cat = cached; return state.cat; }

  state.local = true;
  state.cat = await localApi('/api/catalogue');
  return state.cat;
}

export async function loadMe() {
  try {
    const { user } = await api('/api/me');
    state.user = user;
    if (user) LS.set('me', user);
  } catch {
    state.user = state.local ? null : LS.get('me', null);
  }
  return state.user;
}

// Cache the last listing page so opening the app with no signal still shows
// something useful rather than a spinner.
export function cacheListings(key, listings) { LS.set('list.' + key, { at: Date.now(), listings }); }
export function cachedListings(key) { return LS.get('list.' + key, null); }

export const crop = (key) => (state.cat.CROPS || []).find((c) => c.key === key) || { name: key, icon: '🧺', local: '' };
export const category = (key) => (state.cat.CATEGORIES || []).find((c) => c.key === key) || {};
export const district = (key) => (state.cat.DISTRICTS || []).find((d) => d.key === key) || { name: key, villages: [] };
export const zone = (key) => (state.cat.ZONES || []).find((z) => z.key === key) || {};

window.addEventListener('online', () => { state.online = true; document.dispatchEvent(new Event('net')); });
window.addEventListener('offline', () => { state.online = false; document.dispatchEvent(new Event('net')); });
