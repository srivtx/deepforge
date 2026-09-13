#!/usr/bin/env node
/**
 * DeepForge end-to-end smoke suite.
 *
 * Runs against a running production server with plain `fetch` (Node 18+ / Bun):
 *   bunx next start -p 3099 &
 *   BASE_URL=http://localhost:3099 bun run scripts/e2e-smoke.mjs
 *
 * Exits non-zero if any check fails. Dependency-free by design.
 */

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3099").replace(/\/+$/, "");

const ROUTES = [
  "/", "/problems", "/paths", "/daily", "/projects", "/labs", "/contests",
  "/speedrun", "/research", "/leaderboard", "/badges", "/stats", "/certificates",
  "/backup", "/collections", "/playlists", "/interview", "/math", "/articles",
  "/sims", "/discuss", "/submit", "/playground", "/about",
];

const ERROR_TITLE_RE = /^(404|500|403)\b|internal server error|application error/i;

const checks = [];
const failures = [];

function record(group, ok, url, reason) {
  checks.push({ group, ok });
  if (!ok) failures.push({ url, reason });
}

function line(ok, text) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${text}`);
}

async function get(path) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    return { url, status: res.status, body: await res.text() };
  } catch (error) {
    return { url, status: 0, body: "", error: error?.message ?? String(error) };
  }
}

const count = (body, re) => (body.match(re) ?? []).length;
const has = (body, s) => body.includes(s);
const statusReason = (res, expected = 200) =>
  `expected ${expected}, got ${res.status}${res.error ? ` (${res.error})` : ""}`;

/** True when the HTML is a Next.js error document (the RSC payload always
 *  embeds the 404-boundary template, so only the rendered <title> is reliable). */
function isErrorPage(body) {
  const title = (body.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [])[1] ?? "";
  return ERROR_TITLE_RE.test(title) || has(body, "__next_error__");
}

console.log(`\nDeepForge e2e smoke -> ${BASE_URL}\n`);

// --- 1. Top-level routes: 200 + brand + exactly one <h1> -------------------
console.log("[1/8] Top-level routes (200 + brand + single <h1>)");
const routeResults = await Promise.all(
  ROUTES.map(async (route) => ({ route, ...(await get(route)) })),
);
for (const { route, url, status, body, error } of routeResults) {
  const brand = has(body, "DeepForge");
  const h1 = count(body, /<h1[\s>]/gi);
  record("routes: status 200", status === 200, url, statusReason({ status, error }));
  record("routes: brand", brand, url, 'brand string "DeepForge" missing');
  record("routes: one <h1>", h1 === 1, url, `expected exactly 1 <h1>, found ${h1}`);
  line(status === 200 && brand && h1 === 1,
    `GET ${route}  status=${status} brand=${brand ? "yes" : "NO"} h1=${h1}`);
}

// --- 2. Home page markers ---------------------------------------------------
console.log("\n[2/8] Home page markers");
const home = await get("/");
const homeChecks = [
  ["df-aurora marker", has(home.body, "df-aurora")],
  ['link href="/problems"', has(home.body, 'href="/problems"')],
  ['link href="/paths"', has(home.body, 'href="/paths"')],
  ["no problem dialog", !has(home.body, 'role="dialog"')],
];
for (const [label, ok] of homeChecks) {
  record(`home: ${label}`, ok, home.url, `${label} ${ok ? "" : "missing/unexpected"}`);
  line(ok, `GET /  ${label}`);
}

// --- 3. /problems practice browser -----------------------------------------
console.log("\n[3/8] /problems practice browser");
const problems = await get("/problems");
const wrapperOk = /id="problems"/.test(problems.body);
record("problems: wrapper id", wrapperOk, problems.url, 'PracticeBrowser section id="problems" missing');
line(wrapperOk, `GET /problems  section id="problems"`);
const categoryLinks = count(problems.body, /href="\/categories\//g);
record("problems: category links", categoryLinks >= 10, problems.url,
  `expected >= 10 category links, found ${categoryLinks}`);
line(categoryLinks >= 10, `GET /problems  category links=${categoryLinks}`);
const laLink = has(problems.body, 'href="/categories/linear-algebra"');
record("problems: linear-algebra link", laLink, problems.url, 'href="/categories/linear-algebra" missing');
line(laLink, `GET /problems  linear-algebra category link`);
const problemsFiltered = await get("/problems?category=linear-algebra");
record("problems: filtered", problemsFiltered.status === 200, problemsFiltered.url,
  statusReason(problemsFiltered));
line(problemsFiltered.status === 200, `GET /problems?category=linear-algebra  status=${problemsFiltered.status}`);

// --- 4. /paths catalog + detail ---------------------------------------------
console.log("\n[4/8] /paths catalog");
const paths = await get("/paths");
const pathLinks = count(paths.body, /href="\/paths\//g);
record("paths: link count", pathLinks >= 28, paths.url, `expected >= 28 path links, found ${pathLinks}`);
const maybeSlug = paths.body.match(/href="\/paths\/([a-z0-9-]+)"/);
const slug = maybeSlug ? maybeSlug[1] : null;
record("paths: first slug", slug !== null, paths.url, 'no href="/paths/<slug>" link found');
line(pathLinks >= 28 && slug !== null, `GET /paths  path-links=${pathLinks} first=${slug ?? "none"}`);
if (slug) {
  const detail = await get(`/paths/${slug}`);
  const back = has(detail.body, 'href="/paths"');
  const problemLinks = count(detail.body, /href="\/problems\//g);
  record("paths: detail 200", detail.status === 200, detail.url, statusReason(detail));
  record("paths: detail back link", back, detail.url, 'back link href="/paths" missing');
  record("paths: detail problem links", problemLinks >= 1, detail.url,
    `expected >= 1 /problems/ link, found ${problemLinks}`);
  line(detail.status === 200 && back && problemLinks >= 1,
    `GET /paths/${slug}  status=${detail.status} back-link=${back ? "yes" : "NO"} problem-links=${problemLinks}`);
}

// --- 5. Problem workspace via sitemap ---------------------------------------
console.log("\n[5/8] Problem workspace (first /problems/<id> in sitemap)");
const sitemap = await get("/sitemap.xml");
const problemMatch = sitemap.body.match(/\/problems\/([a-z0-9-]+)/i);
if (!problemMatch) {
  record("problem: sitemap id", false, sitemap.url, "no /problems/<id> URL in sitemap");
  line(false, "GET /sitemap.xml  no problem URL found");
} else {
  const problemUrl = `/problems/${problemMatch[1]}`;
  const problem = await get(problemUrl);
  const starter = has(problem.body, "Starter code") && has(problem.body, "<pre");
  const back = has(problem.body, 'href="/problems"');
  const h1 = count(problem.body, /<h1[\s>]/gi);
  record("problem: status 200", problem.status === 200, problem.url, statusReason(problem));
  record("problem: starter code", starter, problem.url, "starter code block missing");
  record("problem: back link", back, problem.url, 'back link href="/problems" missing');
  record("problem: one <h1>", h1 === 1, problem.url, `expected exactly 1 <h1>, found ${h1}`);
  line(problem.status === 200 && starter && back && h1 === 1,
    `GET ${problemUrl}  status=${problem.status} starter=${starter ? "yes" : "NO"} back-link=${back ? "yes" : "NO"} h1=${h1}`);
}

// --- 6. Sitemap + robots ----------------------------------------------------
console.log("\n[6/8] Sitemap and robots");
const pathEntries = count(sitemap.body, /\/paths\//g);
const noUndefined = !has(sitemap.body, "undefined");
record("sitemap: /paths/ entries", pathEntries >= 28, sitemap.url, `expected >= 28 /paths/ entries, found ${pathEntries}`);
record("sitemap: no undefined", noUndefined, sitemap.url, 'literal "undefined" found');
line(pathEntries >= 28 && noUndefined, `GET /sitemap.xml  path-entries=${pathEntries} undefined=${noUndefined ? "no" : "YES"}`);
const robots = await get("/robots.txt");
record("robots: status 200", robots.status === 200, robots.url, statusReason(robots));
line(robots.status === 200, `GET /robots.txt  status=${robots.status}`);

// --- 7. Legacy deep links (client-side redirects) ---------------------------
console.log("\n[7/8] Legacy deep links");
if (problemMatch) {
  const legacy = await get(`/?p=${problemMatch[1]}`);
  const legacyError = isErrorPage(legacy.body);
  const ok = legacy.status === 200 && !legacyError;
  record("legacy: /?p=<id>", ok, legacy.url,
    `expected 200 without an error page, got ${legacy.status}${legacyError ? " (error page)" : ""}`);
  line(ok, `GET /?p=${problemMatch[1]}  status=${legacy.status} error-page=${legacyError ? "YES" : "no"}`);
} else {
  record("legacy: /?p=<id>", false, sitemap.url, "skipped: no problem id available");
  line(false, "GET /?p=<id>  skipped (no problem id)");
}
const legacyCategory = await get("/?category=linear-algebra");
const catError = isErrorPage(legacyCategory.body);
const catOk = legacyCategory.status === 200 && !catError;
record("legacy: /?category=", catOk, legacyCategory.url,
  `expected 200 without an error page, got ${legacyCategory.status}${catError ? " (error page)" : ""}`);
line(catOk, `GET /?category=linear-algebra  status=${legacyCategory.status} error-page=${catError ? "YES" : "no"}`);

// --- 8. Summary -------------------------------------------------------------
console.log("\n[8/8] Summary");
const groupNames = [...new Set(checks.map((c) => c.group))];
console.table(
  groupNames.map((group) => {
    const groupChecks = checks.filter((c) => c.group === group);
    return { group, pass: groupChecks.filter((c) => c.ok).length, total: groupChecks.length };
  }),
);
const passed = checks.filter((c) => c.ok).length;
console.log(`TOTAL ${passed}/${checks.length} checks passed`);
if (failures.length > 0) {
  console.log(`\n${failures.length} FAILURE(S):`);
  for (const failure of failures) console.log(`  FAIL ${failure.url} - ${failure.reason}`);
}
process.exit(failures.length > 0 ? 1 : 0);
