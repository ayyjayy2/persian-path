// Offline support: the app shell is cached on install; everything else same-origin
// (audio, images) is cached the first time it is fetched.
const CACHE = 'pl-v2.0.0';
const SHELL = ['/', '/index.html', '/style.css', '/ds/classical.css', '/app.js', '/view.js', '/learn-data.js', '/culture.js',
  '/vendor/preact-htm.js', '/manifest.json', '/images/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Media range requests go straight to the network (cached full responses break Safari playback)
  if (e.request.headers.has('range')) return;
  const isShell = e.request.mode === 'navigate' || /\.(js|css|json|html)$/.test(url.pathname);
  if (isShell) {
    // Network first so deploys show up immediately; fall back to cache offline
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html'))));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    })));
  }
});
