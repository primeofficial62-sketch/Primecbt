// ---- Version: bump this on every deploy so old caches get cleared ----
const VERSION = 'v1';
const STATIC_CACHE = `static-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const IMAGE_CACHE = `images-${VERSION}`;

const MAX_IMAGES = 80;
const MAX_PAGES = 20;
const NAV_TIMEOUT_MS = 4000;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(PAGES_CACHE)
      .then((c) => c.add('/').catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = [STATIC_CACHE, PAGES_CACHE, IMAGE_CACHE];
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    await self.clients.claim();
  })());
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) {
    await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
  }
}

// Serve cached copy instantly, refresh it in the background
async function staleWhileRevalidate(req, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        cache.put(req, res.clone()).then(() => maxItems && trimCache(cacheName, maxItems));
      }
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

// Try network first, but fall back to cache if it's slow or offline
async function networkFirstNav(e) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const preload = e.preloadResponse ? await e.preloadResponse : null;
    const res = preload || await Promise.race([
      fetch(e.request),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), NAV_TIMEOUT_MS)),
    ]);
    if (res && res.ok) {
      cache.put(e.request, res.clone()).then(() => trimCache(PAGES_CACHE, MAX_PAGES));
    }
    return res;
  } catch (_) {
    return (await cache.match(e.request)) || (await cache.match('/')) || Response.error();
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol)) return;

  const isSupabase = url.hostname.endsWith('supabase.co');

  // Supabase: only cache public images; never cache API/auth/realtime/data
  if (isSupabase) {
    const isPublicImage =
      url.pathname.includes('/storage/v1/object/public/') ||
      url.pathname.includes('/storage/v1/render/image/');
    if (isPublicImage) e.respondWith(staleWhileRevalidate(req, IMAGE_CACHE, MAX_IMAGES));
    return;
  }

  // Never touch API routes
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  // Pages
  if (req.mode === 'navigate') {
    e.respondWith(networkFirstNav(e));
    return;
  }

  // Images (any origin)
  if (req.destination === 'image') {
    e.respondWith(staleWhileRevalidate(req, IMAGE_CACHE, MAX_IMAGES));
    return;
  }

  // Scripts, styles, fonts (same origin or common font/CDN hosts)
  if (['script', 'style', 'font', 'worker'].includes(req.destination)) {
    e.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }
});

// ---- Your original push / notification code (unchanged) ----
self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || 'Notification', {
    body: d.body || '',
    tag: d.tag,
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});