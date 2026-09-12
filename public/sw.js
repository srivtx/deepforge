/* DeepForge service worker — hand-rolled, no build step.
 *
 * Versioned cache names: bump VERSION to invalidate everything.
 * Strategies:
 *   /_next/static/** + font files ....... cache-first (immutable build output)
 *   cdn.jsdelivr.net/pyodide/** ......... cache-first (offline Python solving)
 *   navigations ......................... network-first, offline fallback "/"
 *   other same-origin GETs .............. stale-while-revalidate
 *   everything else ..................... straight to the network
 *
 * Non-GET requests are never cached. Browser-extension and non-http(s)
 * schemes are ignored entirely.
 */

const VERSION = "v1";

const PRECACHE = `deepforge-${VERSION}-precache`;
const STATIC = `deepforge-${VERSION}-static`;
const PYODIDE = `deepforge-${VERSION}-pyodide`;
const RUNTIME = `deepforge-${VERSION}-runtime`;

const EXPECTED_CACHES = [PRECACHE, STATIC, PYODIDE, RUNTIME];

const OFFLINE_URL = "/";
const PYODIDE_ORIGIN = "https://cdn.jsdelivr.net";
const PYODIDE_PATH_PREFIX = "/pyodide/";
const FONT_PATTERN = /\.(?:woff2?|ttf|otf|eot)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("deepforge-") && !EXPECTED_CACHES.includes(key),
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never cache POST/PUT/... — only GET is safe.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore chrome-extension://, data:, blob: and other non-http schemes.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Pyodide runtime — cache-first so solving keeps working offline.
  if (
    url.origin === PYODIDE_ORIGIN &&
    url.pathname.startsWith(PYODIDE_PATH_PREFIX)
  ) {
    event.respondWith(cacheFirst(request, PYODIDE));
    return;
  }

  // Any other cross-origin request goes straight to the network.
  if (url.origin !== self.location.origin) return;

  // App navigations — network-first with the cached shell as fallback.
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Immutable Next.js build output and font files — cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    FONT_PATTERN.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // All other same-origin GETs — serve cache, refresh in the background.
  event.respondWith(staleWhileRevalidate(event, RUNTIME));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response)) {
    try {
      await cache.put(request, response.clone());
    } catch {
      // Opaque/partial responses can be rejected — caching is best-effort.
    }
  }
  return response;
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response && response.ok && new URL(request.url).pathname === OFFLINE_URL) {
      // Keep the offline shell fresh with the latest successful "/" HTML.
      try {
        await cache.put(OFFLINE_URL, response.clone());
      } catch {
        // Best-effort refresh.
      }
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request)) || (await caches.match(OFFLINE_URL));
    if (cached) return cached;
    return new Response(
      "<!doctype html><title>Offline</title><h1>Offline</h1><p>DeepForge is unavailable without a network connection right now.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

async function staleWhileRevalidate(event, cacheName) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const revalidate = fetch(request)
    .then(async (response) => {
      if (isCacheable(response)) {
        try {
          await cache.put(request, response.clone());
        } catch {
          // Best-effort.
        }
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(revalidate);
    return cached;
  }

  const response = await revalidate;
  return response || Response.error();
}

function isCacheable(response) {
  if (!response) return false;
  if (response.status === 206) return false;
  return response.ok || response.type === "opaque";
}
