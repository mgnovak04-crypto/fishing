const CACHE_NAME = 'norgefiske-v2';
const STATIC_CACHE = 'norgefiske-static-v2';
const DATA_CACHE = 'norgefiske-data-v2';

// App shell files to cache immediately
const STATIC_ASSETS = [
  '/fishing/',
  '/fishing/index.html',
  '/fishing/manifest.json',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DATA_CACHE && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls (weather data) — network first, fall back to cache
  if (url.hostname === 'api.open-meteo.com' || url.hostname === 'nominatim.openstreetmap.org') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache the response
          const clone = response.clone();
          caches.open(DATA_CACHE).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Offline — return cached data if available
          return caches.match(event.request);
        })
    );
    return;
  }

  // Map tiles — cache as you browse
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(DATA_CACHE).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        }).catch(() => {
          // Return a blank tile if offline and not cached
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // Static assets — cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache new static assets (JS, CSS bundles)
        if (response.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html'))) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/fishing/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
