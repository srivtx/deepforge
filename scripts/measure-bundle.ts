/**
 * Measure first-load JS per prerendered route from the latest `.next` build.
 *
 *   bun run scripts/measure-bundle.ts
 *
 * Parses every `.next/server/app/**\/*.html`, collects the chunk files the
 * browser must load for that route, and reports:
 *   - distinct route signatures (routes that load the same chunks collapsed)
 *   - per-route totals for the key destinations
 *   - the largest static chunks
 * Sizes are raw bytes plus gzip, mirroring Next's `First Load JS` columns.
 */

import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const NEXT = join(ROOT, ".next");
const APP = join(NEXT, "server", "app");
const CHUNKS = join(NEXT, "static", "chunks");

const KEY_ROUTES = [
  "/",
  "/problems",
  "/categories/linear-algebra",
  "/paths/math-foundations",
  "/problems/la-001",
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
