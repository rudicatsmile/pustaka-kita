const CACHE_NAME = "pustakakita-cache-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  "/",
  "/dashboard/kartu",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

// Install: Cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[SW] Pre-cache error:", err))
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST for server actions / login)
  if (request.method !== "GET") {
    return;
  }

  // Ignore browser extensions or external domains
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. HTML Navigation Requests (Pages) -> Network First with Cache Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // Try matching the exact requested URL from cache (e.g. /dashboard/kartu)
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache, fallback to the offline page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          return new Response("Koneksi Internet Terputus (Mode Offline).", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
