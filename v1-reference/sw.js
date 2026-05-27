// Cache name — bump whenever any cached asset changes.
const VERSION = 179;
const CACHE = `storyteller-v${VERSION}`;

// All assets required for offline-first operation.
// Fonts and static data files are separate; add new ones here when added.
const SHELL = [
  './',
  'icons.js',
  'fonts/press-start-2p.woff2',
  'fonts/share-tech-mono.woff2',
  'fonts/vt323.woff2',
  'fonts/dotgothic16.woff2',
  'fonts/uncial-antiqua.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({type:'window'}))
      .then(clients => clients.forEach(c => c.postMessage({type:'SW_UPDATED', version:VERSION})))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle GET requests to our own origin
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      // Not in cache — try network, cache the response if successful
      // Audio files are already stored in IndexedDB; don't double-cache them in Cache Storage.
      return fetch(e.request).then(response => {
        if (response.ok) {
          const ct = response.headers.get('Content-Type') || '';
          const isAudio = ct.startsWith('audio/') || ct.startsWith('video/');
          if (!isAudio) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
        }
        return response;
      }).catch(() => {
        // Offline and not in cache — serve the app shell as fallback
        // so navigation requests always return something
        return caches.match('./');
      });
    })
  );
});
