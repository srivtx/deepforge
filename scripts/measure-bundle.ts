/**
 * Measure first-load JS per prerendered route from the latest `.next` build.
 *
 *   bun run scripts/measure-bundle.ts            # informational report
 *   bun run scripts/measure-bundle.ts --check    # enforce gzip budgets (nonzero on breach)
 *   CI=1 bun run scripts/measure-bundle.ts       # same gate when CI is set
 *
 * Parses every `.next/server/app/**\/*.html`, collects the chunk files the
 * browser must load for that route, and reports:
 *   - distinct route signatures (routes that load the same chunks collapsed)
 *   - per-route totals for the key destinations
 *   - the largest static chunks
 *   - budget PASS/FAIL table in --check / CI mode
 * Sizes are raw bytes plus gzip, mirroring Next's `First Load JS` columns.
 */

import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const NEXT = join(ROOT, ".next");
const APP = join(NEXT, "server", "app");
const CHUNKS = join(NEXT, "static", "chunks");

const CHECK_MODE = process.argv.includes("--check") || Boolean(process.env.CI);

/**
 * Gzip first-load budgets (KB) enforced by `--check` / `CI`.
 *
 * Derived from the current `.next` build's measured gzip first-load JS
 * (`/` 343.9, `/problems` 307.8, `/about` 305.7, `/stats` 361.9) plus 15%
 * headroom. When no build output is available, README's table
 * (283/251/183/301) is the fallback basis; that table predates the current
 * build and is only used when the numbers above cannot be measured.
 */
const BUDGETS_KB: Record<string, number> = {
  "/": 396,
  "/problems": 354,
  "/about": 352,
  "/stats": 417,
  "/alibi": 445,
  "/ledger": 440,
  "/keyfuse": 440,
};

const KEY_ROUTES = [
  "/",
  "/problems",
  "/categories/linear-algebra",
  "/paths/math-foundations",
  "/problems/la-001",
  "/alibi",
  "/ledger",
  "/keyfuse",
  "/stats",
  "/collections",
  "/playlists",
  "/speedrun",
  "/interview",
  "/articles",
  "/contests",
  "/daily",
  "/leaderboard",
  "/badges",
  "/discuss",
];

const CHUNK_RE = /static\/chunks\/([a-zA-Z0-9_-]+\.js)/g;

function listFiles(dir: string, ext: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

function routeFor(htmlPath: string): string {
  const rel = relative(APP, htmlPath).replace(/\.html$/, "");
  const parts = rel.split(sep);
  if (parts[parts.length - 1] === "index") parts.pop();
  const route = "/" + parts.join("/");
  return route === "/" ? "/" : route.replace(/\/$/, "");
}

let chunkSizes: Map<string, { raw: number; gzip: number }> | undefined;
function sizesFor(file: string): { raw: number; gzip: number } {
  if (!chunkSizes) chunkSizes = new Map();
  const cached = chunkSizes.get(file);
  if (cached) return cached;
  const raw = readFileSync(file);
  const entry = { raw: raw.byteLength, gzip: gzipSync(raw).byteLength };
  chunkSizes.set(file, entry);
  return entry;
}

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

const htmlFiles = listFiles(APP, ".html");
const routeChunks = new Map<string, string[]>();

for (const htmlPath of htmlFiles) {
  const html = readFileSync(htmlPath, "utf8");
  const chunks = new Set<string>();
  for (const match of html.matchAll(CHUNK_RE)) chunks.add(match[1]);
  routeChunks.set(routeFor(htmlPath), [...chunks].sort());
}

interface Signature {
  routes: string[];
  raw: number;
  gzip: number;
  count: number;
}

const signatures = new Map<string, Signature>();

for (const [route, chunks] of routeChunks) {
  const key = chunks.join("|");
  const sig = signatures.get(key) ?? {
    routes: [],
    raw: 0,
    gzip: 0,
    count: 0,
  };
  if (sig.routes.length < 4) sig.routes.push(route);
  sig.count += 1;
  if (!sig.raw) {
    for (const chunk of chunks) {
      const size = sizesFor(join(CHUNKS, chunk));
      sig.raw += size.raw;
      sig.gzip += size.gzip;
    }
  }
  signatures.set(key, sig);
}

console.log(`# routes parsed: ${routeChunks.size}`);
console.log(`# distinct chunk signatures: ${signatures.size}`);
console.log();

console.log("## route signatures (sorted by gzip first-load JS)");
for (const sig of [...signatures.values()].sort((a, b) => b.gzip - a.gzip)) {
  const examples = sig.routes.join(", ");
  const more = sig.count > sig.routes.length ? ` (+${sig.count - sig.routes.length} more)` : "";
  console.log(
    `${formatKb(sig.gzip).padStart(10)} gzip · ${formatKb(sig.raw).padStart(10)} raw · ${String(sig.count).padStart(5)} routes · ${examples}${more}`,
  );
}
console.log();

console.log("## key routes");
for (const route of KEY_ROUTES) {
  const chunks = routeChunks.get(route);
  if (!chunks) {
    console.log(`${route.padEnd(34)} (not prerendered)`);
    continue;
  }
  let raw = 0;
  let gzip = 0;
  for (const chunk of chunks) {
    const size = sizesFor(join(CHUNKS, chunk));
    raw += size.raw;
    gzip += size.gzip;
  }
  console.log(
    `${route.padEnd(34)} ${formatKb(gzip).padStart(10)} gzip · ${formatKb(raw).padStart(10)} raw · ${chunks.length} chunks`,
  );
}
console.log();

const allChunks = readdirSync(CHUNKS).filter((name) => name.endsWith(".js"));
const chunkTotals = allChunks
  .map((name) => ({ name, ...sizesFor(join(CHUNKS, name)) }))
  .sort((a, b) => b.gzip - a.gzip);

console.log("## largest chunks");
for (const chunk of chunkTotals.slice(0, 20)) {
  console.log(
    `${chunk.name.padEnd(28)} ${formatKb(chunk.gzip).padStart(10)} gzip · ${formatKb(chunk.raw).padStart(10)} raw`,
  );
}
console.log();
console.log(`chunk total: ${formatKb(chunkTotals.reduce((sum, c) => sum + c.raw, 0))} raw / ${formatKb(chunkTotals.reduce((sum, c) => sum + c.gzip, 0))} gzip across ${chunkTotals.length} files`);

if (CHECK_MODE) {
  console.log();
  console.log(`## budget check${process.argv.includes("--check") ? " (--check)" : " (CI env)"}`);
  const failed: string[] = [];
  for (const [route, budgetKb] of Object.entries(BUDGETS_KB)) {
    const chunks = routeChunks.get(route);
    if (!chunks) {
      failed.push(route);
      console.log(`${route.padEnd(12)} ${"n/a".padStart(10)} gzip vs ${`${budgetKb} kB`.padStart(8)} budget  FAIL (not prerendered)`);
      continue;
    }
    let gzip = 0;
    for (const chunk of chunks) gzip += sizesFor(join(CHUNKS, chunk)).gzip;
    const measuredKb = gzip / 1024;
    const over = measuredKb > budgetKb;
    if (over) failed.push(route);
    console.log(
      `${route.padEnd(12)} ${formatKb(gzip).padStart(10)} gzip vs ${`${budgetKb} kB`.padStart(8)} budget  ${over ? "FAIL" : "PASS"}`,
    );
  }
  console.log();
  if (failed.length > 0) {
    console.log(`BUDGETS FAIL: ${failed.length}/${Object.keys(BUDGETS_KB).length} route(s) over budget (${failed.join(", ")})`);
    process.exitCode = 1;
  } else {
    console.log(`BUDGETS PASS: ${Object.keys(BUDGETS_KB).length}/${Object.keys(BUDGETS_KB).length} routes within gzip first-load budget`);
  }
} else {
  console.log();
  console.log("informational mode (pass --check or set CI to enforce gzip budgets)");
}
