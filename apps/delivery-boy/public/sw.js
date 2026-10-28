// apps/delivery-boy/public/sw.js - Delivery-Boy PWA Service Worker
// Caches the shell for offline-resilient field use by delivery agents.
const CACHE_NAME = "ladwan-delivery-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Navigation requests: network-first with offline shell fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/"))
    );
    return;
  }

  // Static assets: cache-first
  if (
    e.request.url.includes("/icon.svg") ||
    e.request.url.includes("/manifest.json")
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  }
});

// Handle push notifications (for future Firebase Cloud Messaging)
self.addEventListener("push", (e) => {
  const data = e.data?.json() || {};
  const title = data.title || "लाडवां डिलीवरी • नया ऑर्डर";
  const options = {
    body: data.body || "एक नया डिलीवरी ऑर्डर आपकी प्रतीक्षा में है।",
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      const url = e.notification.data?.url || "/";
      for (const client of windowClients) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
