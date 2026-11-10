const CACHE = "thoi-quen-v1";   // đổi v2, v3... khi bạn sửa index.html

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html"])));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Chỉ xử lý file của app và các module Firebase (gstatic)
  if (url.origin !== location.origin && url.hostname !== "www.gstatic.com") return;

  e.respondWith(
    caches.match(req).then(cu => {
      const moi = fetch(req).then(res => {
        if (res.ok) {
          const b = res.clone();
          caches.open(CACHE).then(c => c.put(req, b));
        }
        return res;
      }).catch(() => cu || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
      return cu || moi;
    })
  );
});
