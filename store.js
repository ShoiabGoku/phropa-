// App state plus the API client. Everything the app knows lives here.
export const state = {
  user: null,
  cat: null,        // catalogue from the server
  unread: 0,
  online: navigator.onLine,
};

const LS = {
  get(k, fallback) {
    try { const v = localStorage.getItem('tsongra.' + k); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(k, v) { try { localStorage.setItem('tsongra.' + k, JSON.stringify(v)); } catch {} },
};

export async function api(path, { method = 'GET', body, raw, type } = {}) {
  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (raw) { opts.body = raw; opts.headers['content-type'] = type || 'image/jpeg'; }
  else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers['content-type'] = 'application/json'; }
  const res = await fetch(path, opts);
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

// The catalogue is static content and by far the most useful thing to have
// offline — the whole Seed Bank lives in it.
export async function loadCatalogue() {
  const cached = LS.get('catalogue', null);
  if (cached) state.cat = cached;
  try {
    const c = await api('/api/catalogue');
    state.cat = c;
    LS.set('catalogue', c);
  } catch {
    if (!state.cat) throw new Error('Could not load. Check your connection.');
  }
  return state.cat;
}

export async function loadMe() {
  try {
    const { user } = await api('/api/me');
    state.user = user;
    if (user) LS.set('me', user);
  } catch {
    state.user = LS.get('me', null);   // offline: trust the last known session
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
