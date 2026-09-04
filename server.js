// Tsongra — Ladakh local market. Dependency-free Node server.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { routes, userFromToken } from './lib/api.js';
import { one } from './lib/db.js';

const PORT = Number(process.env.PORT) || 8787;
const PUBLIC = resolve(import.meta.dirname, 'public');
const MAX_BODY = 1024 * 1024; // 1 MB — photos are downscaled client-side

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Match "POST /api/threads/:id/messages" style patterns.
const TABLE = Object.entries(routes).map(([k, fn]) => {
  const [method, path] = k.split(' ');
  const names = [];
  const rx = new RegExp('^' + path.replace(/:(\w+)/g, (_, n) => {
    names.push(n);
    return '([^/]+)';
  }) + '$');
  return { method, rx, names, fn };
});

function readBody(req) {
  return new Promise((res, rej) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { rej(Object.assign(new Error('Too large'), { code: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => res(Buffer.concat(chunks)));
    req.on('error', rej);
  });
}

function cookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

const send = (res, status, obj, headers = {}) => {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
  res.end(body);
};

async function serveStatic(res, urlPath) {
  const rel = normalize(urlPath === '/' ? '/index.html' : urlPath).replace(/^([/\\])+/, '');
  const file = join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403).end(); return; }
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error('dir');
    const buf = await readFile(file);
    const ext = extname(file);
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      // The shell must always revalidate or an update never reaches a phone
      // that already has the app installed.
      'cache-control': ext === '.png' || ext === '.svg' ? 'public, max-age=604800' : 'no-cache',
    });
    res.end(buf);
  } catch {
    // Unknown path inside the SPA — hand back the shell and let the router decide.
    if (!extname(rel)) {
      const buf = await readFile(join(PUBLIC, 'index.html'));
      res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-cache' });
      res.end(buf);
    } else {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
    }
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;

    // Stored photos.
    if (path.startsWith('/photo/')) {
      const p = one('SELECT mime, bytes FROM photos WHERE id = ?', Number(path.slice(7)));
      if (!p) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'content-type': p.mime, 'cache-control': 'public, max-age=31536000, immutable' });
      res.end(Buffer.from(p.bytes));
      return;
    }

    if (!path.startsWith('/api/')) { await serveStatic(res, path); return; }

    const token = cookie(req, 'tsongra');
    const ctx = {
      token,
      user: userFromToken(token),
      query: Object.fromEntries(url.searchParams),
      params: {},
      body: null,
      raw: null,
      contentType: req.headers['content-type'] || '',
    };

    const hit = TABLE.find((r) => r.method === req.method && r.rx.test(path));
    if (!hit) { send(res, 404, { error: 'Unknown endpoint' }); return; }
    hit.names.forEach((n, i) => { ctx.params[n] = path.match(hit.rx)[i + 1]; });

    if (req.method !== 'GET') {
      const raw = await readBody(req);
      if (ctx.contentType.startsWith('image/')) ctx.raw = raw;
      else if (raw.length) {
        try { ctx.body = JSON.parse(raw.toString('utf8')); }
        catch { send(res, 400, { error: 'Bad JSON' }); return; }
      } else ctx.body = {};
    }

    const [status, payload] = hit.fn(ctx);
    const headers = {};
    if (ctx.setCookie) {
      headers['set-cookie'] =
        `tsongra=${ctx.setCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
    }
    if (ctx.clearCookie) headers['set-cookie'] = 'tsongra=; Path=/; HttpOnly; Max-Age=0';
    send(res, status, payload, headers);
  } catch (e) {
    const code = Number(e.code) >= 400 && Number(e.code) < 600 ? Number(e.code) : 500;
    if (code === 500) console.error(e);
    send(res, code, { error: e.message || 'Something went wrong' });
  }
});

server.listen(PORT, () => {
  console.log(`Tsongra running → http://localhost:${PORT}`);
});
