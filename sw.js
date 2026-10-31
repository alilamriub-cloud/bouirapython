/* Bouira Python Studio service worker.
 * 1. Offline: every file listed in precache.json is cached; requests are answered cache-first.
 * 2. Isolation: adds COOP/COEP headers to every response so SharedArrayBuffer is available (blocking input() in the worker)
 *    even when the page is hosted by a server that cannot set these headers (GitHub Pages, school intranet, ...).
 */
const BUILD = 'cbaf0ec9a5';
const CACHE = 'bsp-' + BUILD;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function isolate(res) {
  if (!res || res.status === 0 || res.type === 'opaque' || res.type === 'opaqueredirect') return res;
  const h = new Headers(res.headers);
  h.set('Cross-Origin-Opener-Policy', 'same-origin'); h.set('Cross-Origin-Embedder-Policy', 'require-corp'); h.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

async function lookup(req) {
  const cache = await caches.open(CACHE);
  let r = await cache.match(req, { ignoreSearch: true });
  if (!r) r = await caches.match(req, { ignoreSearch: true });          // older build still on disk while the new one downloads
  return r;
}

async function handle(req) {
  let res = await lookup(req);
  if (!res) {
    try {
      res = await fetch(req);
      if (res.ok && res.type === 'basic' && !req.headers.has('range')) (await caches.open(CACHE)).put(req, res.clone());
    } catch (err) {
      if (req.mode === 'navigate') res = (await lookup(new Request(new URL('index.html', self.registration.scope)))) || null;
      if (!res) return new Response('Offline and not cached yet. Open the app once while online.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    }
  }
  return isolate(res);
}

self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(handle(req));
});

async function broadcast(msg) { for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage(msg); }

async function precacheAll() {
  const list = await (await fetch(new URL('precache.json', self.registration.scope), { cache: 'no-store' })).json();
  const cache = await caches.open(CACHE); const files = list.files; let done = 0;
  const queue = files.slice();
  async function worker() {
    while (queue.length) {
      const f = queue.shift(); const url = new URL(f, self.registration.scope);
      try { if (!(await cache.match(url))) { const r = await fetch(url, { cache: 'reload' }); if (!r.ok) throw new Error(r.status); await cache.put(url, r); } }
      catch (err) { /* offline or file missing: the progress counter simply stays below total */ continue; }
      done++; if (done % 5 === 0 || done === files.length) broadcast({ type: 'precache-progress', done, total: files.length });
    }
  }
  await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
  if (done >= files.length || (await cache.keys()).length >= files.length) {
    for (const k of await caches.keys()) if (k.startsWith('bsp-') && k !== CACHE) await caches.delete(k);
    broadcast({ type: 'precache-done', total: files.length });
  }
}
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'precache') e.waitUntil(precacheAll().catch(() => {})); });
