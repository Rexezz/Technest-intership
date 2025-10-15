// Basic cache names
const CACHE_NAME = 'shopwave-cache-v1';
const RUNTIME = 'runtime';

// List of assets to precache (update as you add files)
const PRECACHE_ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  // icons if provided:
  'icons/icon-192.png',
  'icons/icon-512.png',
  // Tailwind is loaded via CDN; still cache our main JS by precaching index.html
];

// On install, pre-cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// On activate, cleanup old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => (currentCaches.includes(key) ? null : caches.delete(key)))
    )).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Serve precached assets first
// - For images and product data, try cache first then network (cache falling back to offline)
// - For others, network-first with cache fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Bypass non-GET
  if (event.request.method !== 'GET') return;

  // Prefer cache for same-origin precached files
  if (PRECACHE_ASSETS.includes(url.pathname) || url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(resp => {
          // update cache
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return resp;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Images: cache-first (so offline images show if previously cached)
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
        return caches.open(RUNTIME).then(cache => {
          cache.put(event.request, resp.clone());
          return resp;
        });
      }).catch(() => new Response('', { status: 404 })))
    );
    return;
  }

  // Default: network-first fallback to cache
  event.respondWith(
    fetch(event.request).then(response => {
      // put a copy in runtime cache
      return caches.open(RUNTIME).then(cache => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch(() => caches.match(event.request).then(resp => resp || caches.match('index.html')))
  );
});

// Optional: listen for message from page to skipWaiting (for updates)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
