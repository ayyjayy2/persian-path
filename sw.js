// Offline support. Everything the app needs (shell, data, all audio) is precached on
// install from precache-manifest.js; fonts, article photos and map tiles are cached as used.
importScripts("/precache-manifest.js");

const CACHE = "pl-" + self.PRECACHE_VERSION;
const RUNTIME = "pl-runtime";
const RUNTIME_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "upload.wikimedia.org", "tile.openstreetmap.org"];
const MAX_TILES = 600;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(self.PRECACHE_FILES);
    // Article photos: nice to have, never block install on them
    const rt = await caches.open(RUNTIME);
    await Promise.all(self.PRECACHE_REMOTE.map(u => fetch(u, { mode: "no-cors" }).then(r => rt.put(u, r)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k !== RUNTIME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (req.mode === "navigate") return e.respondWith(networkFirst(new Request("/index.html")));
    if (url.pathname.startsWith("/audio/")) return e.respondWith(audio(req, url));
    return e.respondWith(networkFirst(req));
  }
  if (RUNTIME_HOSTS.includes(url.hostname)) e.respondWith(staleWhileRevalidate(req, url));
});

// App files: fresh when online so deploys show up at once, cached copy when offline.
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

// Audio never changes for a given file name, so serve it from cache. <audio> sends Range
// requests and Safari insists on a 206 reply, so slice the cached file to match.
async function audio(req, url) {
  const cache = await caches.open(CACHE);
  let res = await cache.match(url.pathname);
  if (!res) {
    try {
      res = await fetch(url.pathname);
      if (res.ok) cache.put(url.pathname, res.clone());
    } catch (err) {
      return new Response("", { status: 504 });
    }
  }
  const range = req.headers.get("range");
  if (!range || !res.ok) return res;
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  const start = m && m[1] ? +m[1] : 0;
  const end = m && m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "audio/wav",
      "Content-Range": `bytes ${start}-${end}/${buf.byteLength}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

async function staleWhileRevalidate(req, url) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req);
  const update = fetch(req).then(res => {
    if (res.ok || res.type === "opaque") {
      cache.put(req, res.clone());
      if (url.hostname === "tile.openstreetmap.org") trimTiles(cache);
    }
    return res;
  }).catch(() => hit || new Response("", { status: 504 }));
  return hit || update;
}

async function trimTiles(cache) {
  const tiles = (await cache.keys()).filter(r => r.url.includes("tile.openstreetmap.org"));
  for (const r of tiles.slice(0, Math.max(0, tiles.length - MAX_TILES))) await cache.delete(r);
}
