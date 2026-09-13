// Offline support for الذاكرين:
// - navigations: network-first, fall back to cached page (or cached "/") when offline
// - fonts / images / audio: cache-first (rarely change, expensive to refetch)
// - build assets & styles: stale-while-revalidate
// Dev-only URLs (@vite, @fs, HMR) are never cached.

const VERSION = "azkar-v1";
const PAGE_CACHE = `${VERSION}-pages`;
const ASSET_CACHE = `${VERSION}-assets`;
const MEDIA_CACHE = `${VERSION}-media`;
const OFFLINE_URLS = ["/", "/azkar-sabah", "/azkar-massa"];

function isDevUrl(url) {
  return (
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/node_modules/") ||
    url.pathname.includes("__vite") ||
    url.searchParams.has("t")
  );
}

function isMedia(url) {
  return /\.(mp3|ogg|m4a|wav)$/i.test(url.pathname);
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/fonts/") ||
    /\.(woff2?|css|js|mjs|png|jpg|jpeg|webp|svg|ico|json)$/i.test(url.pathname)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      await Promise.allSettled(OFFLINE_URLS.map((u) => cache.add(new Request(u, { cache: "reload" }))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.allSettled(
        names.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = (await cache.match(request)) || (fallbackUrl ? await cache.match(fallbackUrl) : undefined);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Opaque responses (status 0) are still worth storing for offline audio.
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (isDevUrl(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGE_CACHE, "/"));
    return;
  }

  if (isMedia(url)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    if (url.pathname.startsWith("/fonts/")) {
      event.respondWith(cacheFirst(request, ASSET_CACHE));
    } else {
      event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    }
  }
});
