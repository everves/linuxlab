const release = '__LINUXLAB_RELEASE__';
const precache = /* PRECACHE */ [];
const scope = new URL(self.registration.scope);
const cachePrefix = `linuxlab:${scope.pathname}:`;
const cacheName = cachePrefix + release;
const shellUrl = new URL('./index.html', scope);
const urls = new Set(precache.map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...urls].map(url => new Request(url, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const stale = keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName);
    const legacy = 'linuxlab-static-v1.2';
    if (keys.includes(legacy) && await (await caches.open(legacy)).match(shellUrl.href)) stale.push(legacy);
    await Promise.all(stale.map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;

  if (request.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === shellUrl.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      return await cache.match(shellUrl.href) ?? fetch(request);
    })());
  } else if (urls.has(url.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      return await cache.match(request) ?? fetch(request);
    })());
  }
});
