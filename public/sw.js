/* DeepForge service worker — hand-rolled, no build step.
 *
 * VERSION bumps swap every versioned cache. The Pyodide runtime cache is
 * intentionally unversioned so the multi-megabyte CDN download survives app
 * deployments (see PYODIDE below).
 *
 * Strategies:
 *   /_next/static/** + font files ....... cache-first (immutable build output)
 *   cdn.jsdelivr.net/pyodide/** ......... cache-first (offline Python solving)
 *   navigations ......................... network-first; the exact page is
 *                                         cached per pathname, then the
 *                                         nearest NAVIGATION_FALLBACKS page,
 *                                         then the app shell, then a
 *                                         self-contained offline page
 *   other same-origin GETs .............. stale-while-revalidate
 *   everything else ..................... straight to the network
 *
 * Route coverage: PRECACHE_ROUTES lists every static user-facing page under
 * src/app so each gets an exact copy at install; NAVIGATION_FALLBACKS maps
 * dynamic routes (/problems/<id>, /paths/<slug>, ...) to the index page that
 * should stand in for them offline, with "/" as the explicit catch-all.
 * Adding a route without updating these tables fails tests/offline.test.ts.
 *
 * Updates: a new worker installs and waits instead of activating itself. The
 * page can post { type: "SKIP_WAITING" } to promote it; activate() deletes
 * stale caches and claims open clients, and the page reloads once.
 *
 * Non-GET requests are never cached. Browser-extension and non-http(s)
 * schemes are ignored entirely.
 */

const VERSION = "v7";

const IS_LOCAL = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
  self.location.hostname,
);

const PRECACHE = `deepforge-${VERSION}-precache`;
const STATIC = `deepforge-${VERSION}-static`;
const RUNTIME = `deepforge-${VERSION}-runtime`;
// Deliberately NOT versioned: Pyodide is ~30 MB of immutable JS/WASM fetched
// from the CDN, so a DeepForge deploy must never evict it. Legacy versioned
// Pyodide caches are migrated here before cleanup removes them.
const PYODIDE = "deepforge-pyodide";

const EXPECTED_CACHES = [PRECACHE, STATIC, RUNTIME, PYODIDE];

const OFFLINE_URL = "/";
const PYODIDE_ORIGIN = "https://cdn.jsdelivr.net";
const PYODIDE_PATH_PREFIX = "/pyodide/";
const FONT_PATTERN = /\.(?:woff2?|ttf|otf|eot)$/i;

// Every static page route under src/app, including the "/" app shell. These
// are fetched at install so each page has an exact offline copy without a
// prior visit. /og is deliberately absent: route.tsx is an image endpoint,
// not a navigation target.
const PRECACHE_ROUTES = [
  "/",
  "/about",
  "/articles",
  "/backup",
  "/badges",
  "/blog",
  "/certificates",
  "/collections",
  "/concepts",
  "/contests",
  "/daily",
  "/discuss",
  "/interview",
  "/labs",
  "/labs/trails",
  "/leaderboard",
  "/math",
  "/papers",
  "/paths",
  "/playground",
  "/playlists",
  "/problems",
  "/projects",
  "/research",
  "/review",
  "/sims",
  "/speedrun",
  "/start",
  "/stats",
  "/submit",
  "/today",
  "/verify",
];

// Offline stand-ins for dynamic routes. Longest matching prefix wins, so the
// order here is irrelevant; the "/" entry is the explicit catch-all and must
// stay last for readability. "/categories/<slug>" falls back to /problems
// because there is no /categories index page.
const NAVIGATION_FALLBACKS = [
  { prefix: "/articles/", fallback: "/articles" },
  { prefix: "/blog/", fallback: "/blog" },
  { prefix: "/categories/", fallback: "/problems" },
  { prefix: "/collections/", fallback: "/collections" },
  { prefix: "/interview/", fallback: "/interview" },
  { prefix: "/labs/", fallback: "/labs" },
  { prefix: "/papers/", fallback: "/papers" },
  { prefix: "/paths/", fallback: "/paths" },
  { prefix: "/problems/", fallback: "/problems" },
  { prefix: "/projects/", fallback: "/projects" },
  { prefix: "/research/", fallback: "/research" },
  { prefix: "/verify/", fallback: "/verify" },
  { prefix: "/", fallback: "/" },
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      if (IS_LOCAL) {
        await self.registration.unregister();
        return;
      }
      const cache = await caches.open(PRECACHE);
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      // Precaching the rest is best-effort: one failing page must not fail
      // the install, and any route can still be cached at runtime the first
      // time it is visited.
      await Promise.all(
        PRECACHE_ROUTES.filter((route) => route !== OFFLINE_URL).map(
          async (route) => {
            try {
              await cache.add(new Request(route, { cache: "reload" }));
            } catch {
              // Best-effort.
            }
          },
        ),
      );
      // No skipWaiting(): a worker that replaces a live one waits so the page
      // can surface the update and apply it through the message below.
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await migratePyodideCache(keys);
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

// Update-apply path: the page promotes the waiting worker once the user asks
// for the update. The resulting controllerchange triggers a single reload.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (IS_LOCAL || !data || data.type !== "SKIP_WAITING") return;
  self.skipWaiting();
});

// Reminder clicks: focus an open DeepForge window for the target route when
// one exists, otherwise open a new one. Locally installed workers unregister
// themselves, so this handler never runs in development.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (IS_LOCAL) return;
  const data = event.notification.data || {};
  const target =
    typeof data.url === "string" && data.url.length > 0 ? data.url : "/";
  event.waitUntil(handleNotificationClick(target));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Local development must never be cached: dev asset URLs are stable, so
  // cache-first would serve stale CSS/JS across edits and sessions. The SW
  // also unregisters itself on install, so this is a second line of defence.
  if (IS_LOCAL) return;

  // Never cache POST/PUT/... — only GET is safe.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore chrome-extension://, data:, blob: and other non-http schemes.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Requests that forbid the network must be answered from cache or not at
  // all — calling fetch() on them would reject.
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
    return;
  }

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

  // App navigations — network-first with an offline fallback chain.
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

/** Cache key for page documents: origin + pathname, query-independent. */
function navigationKey(url) {
  return new Request(`${url.origin}${url.pathname}`);
}

async function networkFirstNavigation(request) {
  const url = new URL(request.url);
  const runtime = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      // Keep every visited route available offline, keyed by pathname so
      // ?from=... style query strings still resolve to the same document.
      const key = navigationKey(url);
      try {
        await runtime.put(key, response.clone());
        if (PRECACHE_ROUTES.includes(url.pathname)) {
          // Keep install-time precached pages fresh with the latest HTML.
          const precache = await caches.open(PRECACHE);
          await precache.put(url.pathname, response.clone());
        }
      } catch {
        // Best-effort refresh.
      }
    }
    return response;
  } catch {
    // Offline (or network failure) fallback chain: the exact visited page,
    // then the nearest index page from NAVIGATION_FALLBACKS, then the cached
    // app shell, then a self-contained offline page so any route gets a
    // usable response instead of a browser error.
    const cached =
      (await caches.match(navigationKey(url))) ||
      (await caches.match(fallbackKey(url.pathname))) ||
      (await caches.match(OFFLINE_URL));
    if (cached) return cached;
    return offlinePage();
  }
}

/**
 * Offline stand-in for a pathname: the longest matching prefix in
 * NAVIGATION_FALLBACKS wins, and its "/" entry guarantees a catch-all.
 */
function fallbackFor(pathname) {
  let bestLength = -1;
  let target = OFFLINE_URL;
  for (const entry of NAVIGATION_FALLBACKS) {
    if (pathname.startsWith(entry.prefix) && entry.prefix.length > bestLength) {
      bestLength = entry.prefix.length;
      target = entry.fallback;
    }
  }
  return target;
}

function fallbackKey(pathname) {
  return new Request(new URL(fallbackFor(pathname), self.location.origin).href);
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

/**
 * Focus an existing window on the reminder's route (any query string), or
 * open a fresh one. Best-effort: a failed click must never reject.
 */
async function handleNotificationClick(targetUrl) {
  try {
    const target = new URL(targetUrl, self.location.origin);
    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    for (const client of windows) {
      let clientUrl;
      try {
        clientUrl = new URL(client.url);
      } catch {
        continue;
      }
      if (clientUrl.origin !== target.origin) continue;
      if (clientUrl.pathname === target.pathname) {
        if ("focus" in client) await client.focus();
        return;
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(target.href);
    }
  } catch {
    // Best-effort only.
  }
}

/**
 * Copy legacy versioned Pyodide caches into the stable cache before the
 * activate cleanup deletes them, so bumping VERSION never forces a re-download
 * of the Python runtime. Best-effort only.
 */
async function migratePyodideCache(keys) {
  const legacy = keys.filter(
    (key) =>
      key.startsWith("deepforge-") &&
      key.endsWith("-pyodide") &&
      key !== PYODIDE,
  );
  if (legacy.length === 0) return;

  try {
    const target = await caches.open(PYODIDE);
    for (const name of legacy) {
      try {
        const source = await caches.open(name);
        for (const request of await source.keys()) {
          try {
            if (await target.match(request)) continue;
            const response = await source.match(request);
            if (response) await target.put(request, response);
          } catch {
            // Individual entries are best-effort.
          }
        }
      } catch {
        // A cache that cannot be opened is skipped.
      }
    }
  } catch {
    // Caching is best-effort; cleanup still runs.
  }
}

function isCacheable(response) {
  if (!response) return false;
  if (response.status === 206) return false;
  const cacheControl = response.headers.get("cache-control");
  if (cacheControl && cacheControl.includes("no-store")) return false;
  return response.ok || response.type === "opaque";
}

/** Self-contained offline document — no network, no fonts, dark-first. */
function offlinePage() {
  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Offline — DeepForge</title>",
    "<style>",
    ":root{color-scheme:dark}",
    "*,*::before,*::after{box-sizing:border-box}",
    "body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;",
    "background:#0a0a0a;color:#d4d4d4;",
    "font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif}",
    "main{width:100%;max-width:420px;background:#111;border:1px solid #1f1f1f;",
    "border-radius:12px;padding:28px}",
    "h1{margin:0;font-size:20px;line-height:1.3;color:#fff}",
    "p{margin:12px 0 0;font-size:14px;line-height:1.6}",
    ".actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}",
    "button,a{font:inherit;font-size:13px;border-radius:8px;padding:9px 14px;cursor:pointer;",
    "text-decoration:none}",
    "button{background:#7fff9f;color:#0a0a0a;border:0}",
    "a{color:#fff;border:1px solid #1f1f1f}",
    "button:focus-visible,a:focus-visible{outline:2px solid #7fff9f;outline-offset:2px}",
    "</style>",
    "</head>",
    "<body>",
    "<main>",
    "<h1>You're offline</h1>",
    "<p>DeepForge can't reach the network right now. Pages you've already opened stay available on this device.</p>",
    '<div class="actions">',
    '<button type="button" id="retry">Try again</button>',
    '<a href="/">Go to home page</a>',
    "</div>",
    "</main>",
    "<script>",
    'document.getElementById("retry").addEventListener("click", function () {',
    "window.location.reload();",
    "});",
    "</script>",
    "</body></html>",
  ].join("");

  return new Response(html, {
    status: 503,
    statusText: "Offline",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
