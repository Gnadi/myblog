// Minimal service worker for HelloDad.
// Chrome's PWA install criteria require a registered service worker with a
// fetch handler. This implements a small network-first strategy with an
// offline fallback so the app stays installable and usable offline.
const CACHE = "hellodad-v3";
const OFFLINE_URLS = ["/", "/favicons/site.webmanifest"];

// Cache-first is only safe for URLs whose content can never change under the
// same name. Astro fingerprints what it emits into /_astro/, so those are
// immutable; everything else on this origin is not. Favicons, the brand and
// image SVGs, the manifest, and the generated feeds (/rss.xml, /llms.txt,
// /sitemap-index.xml) all keep their URL when their content changes, and
// caching those forever meant a returning visitor kept the old copy until
// someone remembered to bump CACHE by hand.
const IMMUTABLE = /^\/_astro\//;

/** Feeds and site-level documents: always try the network first. */
const ALWAYS_REVALIDATE = /^\/(rss\.xml|llms\.txt|sitemap[^/]*\.xml|robots\.txt)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

/** Network first, falling back to whatever is cached. Refreshes the cache. */
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      // Only a usable response is worth storing; an error page is not.
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network first, cache as the offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request).then((response) => response || caches.match("/"))
    );
    return;
  }

  // Fingerprinted assets can never go stale under the same URL.
  if (IMMUTABLE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Feeds and documents change in place and are small — never serve a cached
  // copy while the network is reachable.
  if (ALWAYS_REVALIDATE.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else keeps its URL across changes (favicons, /images, /brands,
  // the manifest, the OG card), so it is served from cache for speed but
  // refreshed in the background — a change is picked up on the next visit
  // instead of never.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
