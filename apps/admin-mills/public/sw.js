// Ladwan Chakki Admin - Offline & PWA Service Worker (v1.0)
const CACHE_NAME = "ladwan-admin-cache-v1";

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon.svg",
];

// Install Event: Pre-cache core app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Offline-first resilience
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Avoid caching browser extensions or unsupported protocols
  if (!url.protocol.startsWith("http")) return;

  // 1. Navigation Requests (HTML Pages) -> Network First with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network is offline, return cached page or fallback to cached '/'
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const rootCached = await caches.match("/");
          if (rootCached) return rootCached;

          return new Response(
            `<!DOCTYPE html>
            <html lang="hi">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>लाडवां चक्की | ऑफलाइन</title>
                <style>
                  body { background: #0c0a09; color: #f5f5f4; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
                  .card { background: #1c1917; border: 1px solid #78350f; border-radius: 20px; padding: 30px; max-width: 400px; }
                  h1 { color: #f59e0b; font-size: 20px; margin-bottom: 10px; }
                  p { color: #a8a29e; font-size: 14px; line-height: 1.5; }
                  button { margin-top: 20px; background: #d97706; color: #000; border: none; font-weight: bold; padding: 10px 20px; border-radius: 12px; cursor: pointer; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>📡 आप ऑफलाइन हैं (Offline Mode)</h1>
                  <p>इंटरनेट कनेक्शन नहीं मिला। कृपया इंटरनेट चालू करें या पुनः लोड करें। लाडवां ऐप पर आपका पुराना डेटा सुरक्षित है।</p>
                  <button onclick="window.location.reload()">दोबारा कोशिश करें</button>
                </div>
              </body>
            </html>`,
            {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
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
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Ignore network errors for background fetch
        });

      return cachedResponse || fetchPromise;
    })
  );
});
