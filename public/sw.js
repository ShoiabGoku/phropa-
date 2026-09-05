// Offline shell. Connectivity in Ladakh drops for hours at a time, so the app
// and the entire Seed Bank must open without a network.
const V = 'tsongra-v1';
// Relative to the service-worker scope, so this works from a domain root and
// from github.io/<repo>/ alike.
const SHELL = [
  './', 'index.html', 'styles.css', 'app.js', 'views.js', 'ui.js', 'store.js',
  'i18n.js', 'catalogue.js', 'names.js', 'local-api.js', 'icon.svg',
  'icon-maskable.svg', 'manifest.webmanifest',
].map((p) => new URL(p, self.registration.scope).toString());

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // Photos never change once written, so cache them permanently.
  if (url.pathname.includes('/photo/')) {
    e.respondWith(caches.open(V + '-img').then(async (c) => {
      const hit = await c.match(request);
      if (hit) return hit;
      try { const r = await fetch(request); if (r.ok) c.put(request, r.clone()); return r; }
      catch { return new Response('', { status: 504 }); }
    }));
    return;
  }

  // The catalogue is the Seed Bank. Serve fresh when possible, fall back to the
  // last copy so the growing advice is readable with no signal at all.
  if (url.pathname.endsWith('/api/catalogue')) {
    e.respondWith((async () => {
      const c = await caches.open(V);
      try { const r = await fetch(request); if (r.ok) c.put(request, r.clone()); return r; }
      catch { return (await c.match(request)) || new Response('{}', { status: 504 }); }
    })());
    return;
  }

  // Everything else under /api is live data — never serve it stale.
  if (url.pathname.includes('/api/')) return;

  e.respondWith((async () => {
    const c = await caches.open(V);
    try {
      const r = await fetch(request);
      if (r.ok) c.put(request, r.clone());
      return r;
    } catch {
      return (await c.match(request))
        || (await c.match(new URL('index.html', self.registration.scope).toString()))
        || new Response('', { status: 504 });
    }
  })());
});
