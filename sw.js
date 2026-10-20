/* Work Schedule service worker: keeps the app working offline. Bump V when you change any file. */
const V = 'work-schedule-v5';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === self.location.origin;
  const font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !font) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then((hit) => {
      const net = fetch(r)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(V).then((c) => c.put(r, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit || (r.mode === 'navigate' ? caches.match('index.html') : undefined));
      return hit || net;
    })
  );
});
