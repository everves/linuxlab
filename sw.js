/* Offline-first, strictly same-origin local static assets. */
const CACHE_NAME = 'linuxlab-static-v1.2';
const ASSETS = ['./','./index.html','./app.js','./content.js','./styles.css','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok) { const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)); }
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
