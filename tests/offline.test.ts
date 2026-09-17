import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Static verification of public/sw.js against the real route inventory.
 *
 * Offline behavior must be deliberate for every user-facing route: static
 * pages get an exact precached copy, dynamic routes declare the index page
 * that stands in for them, and non-page routes are explicitly excluded.
 *
 * The tables below are the source of truth on the test side; the SW tables
 * are parsed from source text (the file is plain JS, no imports). Drift in
 * either direction — a new route dir or a stale SW entry — fails a test.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP_DIR = join(ROOT, "src", "app");
const SW_PATH = join(ROOT, "public", "sw.js");
const SW = readFileSync(SW_PATH, "utf8");

/** Static page routes: src/app/<dir>/page.tsx, plus the root page at "/". */
const STATIC_ROUTES: Record<string, string> = {
  about: "/about",
  articles: "/articles",
  backup: "/backup",
  badges: "/badges",
  blog: "/blog",
  certificates: "/certificates",
  collections: "/collections",
  concepts: "/concepts",
  contests: "/contests",
  daily: "/daily",
  discuss: "/discuss",
  interview: "/interview",
  inventions: "/inventions",
  labs: "/labs",
  leaderboard: "/leaderboard",
  math: "/math",
  papers: "/papers",
  paths: "/paths",
  playground: "/playground",
  playlists: "/playlists",
  problems: "/problems",
  projects: "/projects",
  research: "/research",
  review: "/review",
  sims: "/sims",
  speedrun: "/speedrun",
  start: "/start",
  stats: "/stats",
  submit: "/submit",
  today: "/today",
  verify: "/verify",
};

interface DynamicRoute {
  /** Directory under src/app. */
  dir: string;
  /** SW fallback prefix (longest-prefix match). */
  prefix: string;
  /** Cached index page served when the dynamic page cannot be fetched. */
  fallback: string;
  /** Why this fallback is the correct one. */
  reason: string;
}

/** Static pages nested under another route directory (not dynamic). */
const NESTED_STATIC_ROUTES: Record<string, string> = {
  "labs/trails": "/labs/trails",
};

const DYNAMIC_ROUTES: DynamicRoute[] = [
  {
    dir: "articles/[slug]",
    prefix: "/articles/",
    fallback: "/articles",
    reason: "article index lists every lesson",
  },
  {
    dir: "blog/[slug]",
    prefix: "/blog/",
    fallback: "/blog",
    reason: "post index; also covers the /blog/rss.xml route handler",
  },
  {
    dir: "categories/[slug]",
    prefix: "/categories/",
    fallback: "/problems",
    reason:
      "no /categories index exists; the page breadcrumb and All categories link point at /problems",
  },
  {
    dir: "collections/[slug]",
    prefix: "/collections/",
    fallback: "/collections",
    reason: "collection index lists all sets",
  },
  {
    dir: "interview/[slug]",
    prefix: "/interview/",
    fallback: "/interview",
    reason: "track index lists all company tracks",
  },
  {
    dir: "inventions/[slug]",
    prefix: "/inventions/",
    fallback: "/inventions",
    reason: "inventions index lists every published paper",
  },
  {
    dir: "labs/[id]",
    prefix: "/labs/",
    fallback: "/labs",
    reason: "lab index lists every hands-on challenge",
  },
  {
    dir: "papers/[slug]",
    prefix: "/papers/",
    fallback: "/papers",
    reason: "papers index lists the full curriculum in reading order",
  },
  {
    dir: "paths/[slug]",
    prefix: "/paths/",
    fallback: "/paths",
    reason: "path browser lists all learning paths",
  },
  {
    dir: "problems/[id]",
    prefix: "/problems/",
    fallback: "/problems",
    reason: "problem index lists all problems",
  },
  {
    dir: "projects/[id]",
    prefix: "/projects/",
    fallback: "/projects",
    reason: "project index lists all builds",
  },
  {
    dir: "research/[id]",
    prefix: "/research/",
    fallback: "/research",
    reason: "research index lists all challenges",
  },
  {
    dir: "verify/[code]",
    prefix: "/verify/",
    fallback: "/verify",
    reason: "verification landing explains how codes work",
  },
];

/** Top-level route directories that are not pages and must never be precached. */
const EXCLUDED_ROUTE_DIRS: Record<string, string> = {
  og: "route.tsx image endpoint (OpenGraph cards), not a navigation target",
};

/** Nested route directories that are not pages (e.g. route handlers). */
const EXCLUDED_NESTED_DIRS: Record<string, string> = {
  "blog/rss.xml": "RSS route handler at /blog/rss.xml, not an HTML page",
  "inventions/[slug]/paper.pdf":
    "PDF route handler at /inventions/<slug>/paper.pdf, not an HTML page",
};

function topLevelRouteDirs(): string[] {
  return readdirSync(APP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function nestedRouteDirs(): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(APP_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const parent = join(APP_DIR, entry.name);
    for (const child of readdirSync(parent, { withFileTypes: true })) {
      if (child.isDirectory()) found.push(`${entry.name}/${child.name}`);
    }
  }
  return found.sort();
}

function unclassifiedRouteDirs(dirs: string[]): string[] {
  const classified = new Set<string>([
    ...Object.keys(STATIC_ROUTES),
    ...DYNAMIC_ROUTES.map((route) => route.dir.split("/")[0]),
    ...Object.keys(EXCLUDED_ROUTE_DIRS),
  ]);
  return dirs.filter((dir) => !classified.has(dir)).sort();
}

function unclassifiedNestedDirs(dirs: string[]): string[] {
  const classified = new Set<string>([
    ...DYNAMIC_ROUTES.map((route) => route.dir),
    ...Object.keys(NESTED_STATIC_ROUTES),
    ...Object.keys(EXCLUDED_NESTED_DIRS),
  ]);
  return dirs.filter((dir) => !classified.has(dir)).sort();
}

function swConst(name: string): string {
  const match = SW.match(new RegExp(`const ${name}\\s*=\\s*"([^"]+)";`));
  if (!match) throw new Error(`sw.js: ${name} not found`);
  return match[1];
}

function swStringArray(name: string): string[] {
  const match = SW.match(
    new RegExp(`const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`),
  );
  if (!match) throw new Error(`sw.js: ${name} not found`);
  return [...match[1].matchAll(/"([^"]*)"/g)].map((entry) => entry[1]);
}

function swFallbackTable(): { prefix: string; fallback: string }[] {
  const match = SW.match(/const NAVIGATION_FALLBACKS\s*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error("sw.js: NAVIGATION_FALLBACKS not found");
  return [
    ...match[1].matchAll(
      /prefix:\s*"([^"]+)"\s*,\s*fallback:\s*"([^"]+)"/g,
    ),
  ].map((entry) => ({ prefix: entry[1], fallback: entry[2] }));
}

describe("sw.js versioning", () => {
  test("declares a well-formed version string", () => {
    expect(swConst("VERSION")).toMatch(/^v\d+$/);
  });

  test("derives every versioned cache from VERSION", () => {
    expect(SW).toContain("deepforge-${VERSION}-precache");
    expect(SW).toContain("deepforge-${VERSION}-static");
    expect(SW).toContain("deepforge-${VERSION}-runtime");
    expect(SW).toMatch(
      /const EXPECTED_CACHES\s*=\s*\[PRECACHE,\s*STATIC,\s*RUNTIME,\s*PYODIDE\]/,
    );
  });

  test("does not hardcode a versioned cache name anywhere", () => {
    expect(SW).not.toMatch(/deepforge-v\d/);
  });
});

describe("route classification", () => {
  test("every top-level route directory under src/app is classified", () => {
    const dirs = topLevelRouteDirs();
    expect(dirs.length).toBeGreaterThan(0);
    expect(unclassifiedRouteDirs(dirs)).toEqual([]);
  });

  test("every nested route directory under src/app is classified", () => {
    const dirs = nestedRouteDirs();
    expect(dirs.length).toBeGreaterThan(0);
    expect(unclassifiedNestedDirs(dirs)).toEqual([]);
  });

  test("classification entries all exist on disk", () => {
    const dirs = new Set(topLevelRouteDirs());
    for (const dir of Object.keys(STATIC_ROUTES)) {
      expect(dirs.has(dir)).toBe(true);
    }
    for (const route of DYNAMIC_ROUTES) {
      expect(dirs.has(route.dir.split("/")[0])).toBe(true);
      expect(statSync(join(APP_DIR, route.dir)).isDirectory()).toBe(true);
    }
    for (const dir of Object.keys(NESTED_STATIC_ROUTES)) {
      expect(statSync(join(APP_DIR, dir, "page.tsx")).isFile()).toBe(true);
    }
    for (const dir of Object.keys(EXCLUDED_ROUTE_DIRS)) {
      expect(dirs.has(dir)).toBe(true);
    }
    for (const dir of Object.keys(EXCLUDED_NESTED_DIRS)) {
      expect(statSync(join(APP_DIR, dir)).isDirectory()).toBe(true);
    }
    expect(statSync(join(APP_DIR, "page.tsx")).isFile()).toBe(true);
  });

  test("static routes render a real page.tsx and dynamic segments match disk", () => {
    for (const dir of Object.keys(STATIC_ROUTES)) {
      expect(statSync(join(APP_DIR, dir, "page.tsx")).isFile()).toBe(true);
    }
    const dynamicOnDisk = nestedRouteDirs().filter((dir) =>
      /\/\[.+\]$/.test(dir),
    );
    expect(dynamicOnDisk).toEqual(
      DYNAMIC_ROUTES.map((route) => route.dir).sort(),
    );
  });

  test("dynamic entries declare a sane prefix, fallback, and reason", () => {
    for (const route of DYNAMIC_ROUTES) {
      const parent = route.dir.split("/")[0];
      expect(route.prefix).toBe(`/${parent}/`);
      expect(route.fallback).toMatch(/^\/[a-z0-9-]*$/);
      expect(route.fallback).not.toContain("[");
      expect(route.reason.length).toBeGreaterThan(0);
    }
  });

  test("a brand-new unclassified route directory is detected", () => {
    const dirs = topLevelRouteDirs();
    expect(unclassifiedRouteDirs([...dirs, "brand-new-route"])).toEqual([
      "brand-new-route",
    ]);
    expect(
      unclassifiedRouteDirs([...dirs, "another-route", "zed-route"]),
    ).toEqual(["another-route", "zed-route"]);
  });

  test("a brand-new unclassified nested directory is detected", () => {
    const dirs = nestedRouteDirs();
    expect(unclassifiedNestedDirs([...dirs, "blog/feed"])).toEqual([
      "blog/feed",
    ]);
  });
});

describe("service worker fallback tables", () => {
  test("the offline shell is precached", () => {
    const offline = swConst("OFFLINE_URL");
    expect(offline).toBe("/");
    expect(swStringArray("PRECACHE_ROUTES")).toContain(offline);
  });

  test("precache list is exactly the static route inventory", () => {
    const precache = swStringArray("PRECACHE_ROUTES");
    const expected = [
      ...new Set([
        "/",
        ...Object.values(STATIC_ROUTES),
        ...Object.values(NESTED_STATIC_ROUTES),
      ]),
    ].sort();
    expect(precache).toHaveLength(expected.length);
    expect([...precache].sort()).toEqual(expected);
  });

  test("every dynamic route has one matching fallback entry", () => {
    const table = swFallbackTable();
    for (const route of DYNAMIC_ROUTES) {
      const matches = table.filter((entry) => entry.prefix === route.prefix);
      expect(matches).toHaveLength(1);
      expect(matches[0].fallback).toBe(route.fallback);
    }
    expect(table).toHaveLength(DYNAMIC_ROUTES.length + 1);
  });

  test("fallback prefixes only cover dynamic parents, plus one catch-all", () => {
    const table = swFallbackTable();
    const dynamicParents = new Set(
      DYNAMIC_ROUTES.map((route) => `/${route.dir.split("/")[0]}/`),
    );
    for (const entry of table.filter((entry) => entry.prefix !== "/")) {
      expect(dynamicParents.has(entry.prefix)).toBe(true);
    }
    const catchAll = table.filter((entry) => entry.prefix === "/");
    expect(catchAll).toHaveLength(1);
    expect(catchAll[0].fallback).toBe(swConst("OFFLINE_URL"));
  });

  test("every fallback target is a real precached page route", () => {
    const precache = swStringArray("PRECACHE_ROUTES");
    for (const entry of swFallbackTable()) {
      expect(precache).toContain(entry.fallback);
    }
  });

  test("the navigation handler consults the fallback table before the shell", () => {
    expect(SW).toContain("function fallbackFor(");
    expect(SW).toContain("caches.match(fallbackKey(url.pathname))");
    expect(SW).toContain("await caches.match(OFFLINE_URL)");
  });
});
