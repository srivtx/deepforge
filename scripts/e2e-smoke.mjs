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
  "/sims", "/discuss", "/submit", "/playground", "/about",   "/concepts",
  "/review",
  "/inventions",
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
console.log("[1/13] Top-level routes (200 + brand + single <h1>)");
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
console.log("\n[2/13] Home page markers");
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
console.log("\n[3/13] /problems practice browser");
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
console.log("\n[4/13] /paths catalog");
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

// --- 5. New advanced paths: checkpoint cards + prerequisite links -----------
console.log("\n[5/13] New advanced paths (checkpoints + prerequisites)");
const NEW_PATHS = [
  {
    slug: "computer-vision-deep-learning",
    marker: "Computer Vision Deep Learning",
    prerequisites: ["computer-vision-starter", "deep-learning-essentials"],
  },
  {
    slug: "production-ml-serving-quantization-monitoring",
    marker: "Production ML: Serving, Quantization and Monitoring",
    prerequisites: ["ml-engineer-track", "deep-learning-essentials"],
  },
  {
    slug: "data-pipelines-and-feature-engineering",
    marker: "Data Pipelines &amp; Feature Engineering",
    prerequisites: ["ml-from-scratch", "statistics-mastery"],
  },
  {
    slug: "build-a-transformer-from-scratch",
    marker: "Build a Transformer from Scratch",
    prerequisites: ["deep-learning-essentials"],
  },
  {
    slug: "causal-inference-and-uplift",
    marker: "Causal Inference &amp; Uplift",
    prerequisites: ["statistics-mastery"],
  },
];

const indexedPaths = NEW_PATHS.filter((path) => has(paths.body, `href="/paths/${path.slug}"`));
record("new paths: all slugs on index", indexedPaths.length === NEW_PATHS.length, paths.url,
  `expected ${NEW_PATHS.length} new path links on /paths, found ${indexedPaths.length}`);
line(indexedPaths.length === NEW_PATHS.length,
  `GET /paths  new-path-links=${indexedPaths.length}/${NEW_PATHS.length}`);

const newPathPages = await Promise.all(
  NEW_PATHS.map(async (path) => ({ path, ...(await get(`/paths/${path.slug}`)) })),
);

const linkedSlugs = new Set();
for (const { body } of newPathPages) {
  for (const match of body.matchAll(/href="\/paths\/([a-z0-9-]+)"/g)) linkedSlugs.add(match[1]);
}
const linkedPages = await Promise.all(
  [...linkedSlugs].map(async (slug) => ({ slug, ...(await get(`/paths/${slug}`)) })),
);
const linkedStatus = new Map(linkedPages.map(({ slug, status }) => [slug, status]));

for (const { path, status, body, url } of newPathPages) {
  const h1 = count(body, /<h1[\s>]/gi);
  const headline = h1 === 1 && has(body, path.marker);
  const checkpoint = has(body, "Stage checkpoint") && has(body, "to pass");
  const prereqLinked = path.prerequisites.every((slug) => has(body, `href="/paths/${slug}"`));
  const prereqResolved = path.prerequisites.every((slug) => linkedStatus.get(slug) === 200);
  record("new paths: status 200", status === 200, url, statusReason({ status }));
  record(`new paths: headline (${path.slug})`, headline, url,
    `expected single <h1> containing "${path.marker}", found h1=${h1}`);
  record(`new paths: checkpoint card (${path.slug})`, checkpoint, url,
    '"Stage checkpoint" card marker missing on path detail');
  record(`new paths: prerequisite links (${path.slug})`, prereqLinked, url,
    `missing href /paths/ for: ${path.prerequisites.filter((s) => !has(body, `href="/paths/${s}"`)).join(", ") || "none"}`);
  record(`new paths: prerequisites resolve (${path.slug})`, prereqResolved, url,
    `non-200 prerequisite pages: ${path.prerequisites.filter((s) => linkedStatus.get(s) !== 200).map((s) => `${s}=${linkedStatus.get(s) ?? "unfetched"}`).join(", ") || "none"}`);
  line(status === 200 && headline && checkpoint && prereqLinked && prereqResolved,
    `GET /paths/${path.slug}  status=${status} h1=${h1} checkpoint=${checkpoint ? "yes" : "NO"} prereq-links=${prereqLinked ? "yes" : "NO"} prereq-200=${prereqResolved ? "yes" : "NO"}`);
}

// --- 6. New articles ---------------------------------------------------------
console.log("\n[6/13] New articles");
const NEW_ARTICLES = [
  { slug: "kv-cache-and-flashattention", marker: "FlashAttention" },
  { slug: "rag-from-chunks-to-citations", marker: "From Chunks to Citations" },
  { slug: "post-training-rlhf-dpo-grpo", marker: "RLHF" },
];
const articlesIndex = await get("/articles");
const indexedArticles = NEW_ARTICLES.filter((article) =>
  has(articlesIndex.body, `href="/articles/${article.slug}"`),
);
record("articles: all new slugs on index", indexedArticles.length === NEW_ARTICLES.length, articlesIndex.url,
  `expected ${NEW_ARTICLES.length} new article links on /articles, found ${indexedArticles.length}`);
line(indexedArticles.length === NEW_ARTICLES.length,
  `GET /articles  new-article-links=${indexedArticles.length}/${NEW_ARTICLES.length}`);

const articlePages = await Promise.all(
  NEW_ARTICLES.map(async (article) => ({ article, ...(await get(`/articles/${article.slug}`)) })),
);
for (const { article, status, body, url } of articlePages) {
  const h1 = count(body, /<h1[\s>]/gi);
  const headline = h1 === 1 && has(body, article.marker);
  const branded = /<title[^>]*>[^<]*—\s*Article/i.test(body);
  record(`article: status 200 (${article.slug})`, status === 200, url, statusReason({ status }));
  record(`article: single <h1> + headline (${article.slug})`, headline, url,
    `expected single <h1> containing "${article.marker}", found h1=${h1}`);
  record(`article: article title (${article.slug})`, branded, url, 'title should contain "— Article"');
  line(status === 200 && headline && branded,
    `GET /articles/${article.slug}  status=${status} h1=${h1} headline=${headline ? "yes" : "NO"} article-title=${branded ? "yes" : "NO"}`);
}

// --- 7. Problem workspace via sitemap ---------------------------------------
console.log("\n[7/13] Problem workspace (first /problems/<id> in sitemap)");
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

// --- 8. Sitemap + robots ----------------------------------------------------
console.log("\n[8/13] Sitemap and robots");
const pathEntries = count(sitemap.body, /\/paths\//g);
const noUndefined = !has(sitemap.body, "undefined");
record("sitemap: /paths/ entries", pathEntries >= 28, sitemap.url, `expected >= 28 /paths/ entries, found ${pathEntries}`);
record("sitemap: no undefined", noUndefined, sitemap.url, 'literal "undefined" found');
line(pathEntries >= 28 && noUndefined, `GET /sitemap.xml  path-entries=${pathEntries} undefined=${noUndefined ? "no" : "YES"}`);
const robots = await get("/robots.txt");
record("robots: status 200", robots.status === 200, robots.url, statusReason(robots));
line(robots.status === 200, `GET /robots.txt  status=${robots.status}`);
const sitemapArticles = NEW_ARTICLES.filter((article) => has(sitemap.body, `/articles/${article.slug}`));
record("sitemap: new article entries", sitemapArticles.length === NEW_ARTICLES.length, sitemap.url,
  `expected ${NEW_ARTICLES.length} new article URLs, found ${sitemapArticles.length}`);
line(sitemapArticles.length === NEW_ARTICLES.length,
  `GET /sitemap.xml  new-article-entries=${sitemapArticles.length}/${NEW_ARTICLES.length}`);
const sitemapPaths = NEW_PATHS.filter((path) => has(sitemap.body, `/paths/${path.slug}`));
record("sitemap: new path entries", sitemapPaths.length === NEW_PATHS.length, sitemap.url,
  `expected ${NEW_PATHS.length} new path URLs, found ${sitemapPaths.length}`);
line(sitemapPaths.length === NEW_PATHS.length,
  `GET /sitemap.xml  new-path-entries=${sitemapPaths.length}/${NEW_PATHS.length}`);

// --- 9. Legacy deep links (client-side redirects) ---------------------------
console.log("\n[9/13] Legacy deep links");
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

// --- 10. /discuss threads ---------------------------------------------------
console.log("\n[10/13] /discuss threads");
const discuss = await get("/discuss");
const discussForum = has(discuss.body, 'aria-label="Discuss forum"');
const discussThreads = has(discuss.body, '>Threads</h2>') && /aria-label="\d+ threads"/.test(discuss.body);
record("discuss: status 200", discuss.status === 200, discuss.url, statusReason(discuss));
record("discuss: forum section", discussForum, discuss.url, 'section aria-label="Discuss forum" missing');
record("discuss: threads list", discussThreads, discuss.url,
  "Threads heading or thread-count badge missing");
const discussHasLoadMore = has(discuss.body, "Load more");
if (discussHasLoadMore) {
  const loadMore = has(discuss.body, 'aria-label="Load more threads"');
  record("discuss: load more affordance", loadMore, discuss.url,
    'Load more text without aria-label="Load more threads"');
  line(loadMore, `GET /discuss  Load more threads  aria=${loadMore ? "yes" : "NO"}`);
} else {
  const emptyState = has(discuss.body, "No threads yet") || has(discuss.body, "Start a thread");
  record("discuss: signed-out thread state", emptyState, discuss.url,
    'signed-out /discuss should render "No threads yet" or thread articles');
  line(emptyState,
    "GET /discuss  load-more not rendered signed-out (0 local threads); threads list asserted");
}
line(discuss.status === 200 && discussForum && discussThreads,
  `GET /discuss  status=${discuss.status} forum=${discussForum ? "yes" : "NO"} threads-list=${discussThreads ? "yes" : "NO"}`);

// --- 11. New routes: /today, /start, /verify --------------------------------
console.log("\n[11/13] New routes (today + start + verify)");
const today = await get("/today");
const todayTitle = (today.body.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [])[1] ?? "";
const todayOk = today.status === 200 && !isErrorPage(today.body) && todayTitle.includes("Today");
record("today: status 200 + title", todayOk, today.url,
  `expected 200 with a Today title, got ${today.status} title=${JSON.stringify(todayTitle)}`);
line(todayOk, `GET /today  status=${today.status} title=${JSON.stringify(todayTitle)}`);
const start = await get("/start");
const startTitle = (start.body.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [])[1] ?? "";
const startOk = start.status === 200 && !isErrorPage(start.body) && startTitle.includes("starting point");
record("start: status 200 + title", startOk, start.url,
  `expected 200 with the placement title, got ${start.status} title=${JSON.stringify(startTitle)}`);
line(startOk, `GET /start  status=${start.status} title=${JSON.stringify(startTitle)}`);
const startCopy = has(start.body, "starting level");
record("start: plan copy", startCopy, start.url, '"starting level" copy missing');
line(startCopy, `GET /start  plan-copy=${startCopy ? "yes" : "NO"}`);
const verify = await get("/verify");
const verifyOk = verify.status === 200 && !isErrorPage(verify.body) && has(verify.body, "Certificate code");
record("verify: landing 200 + code input", verifyOk, verify.url,
  `expected 200 with the code input, got ${verify.status}`);
line(verifyOk, `GET /verify  status=${verify.status} code-input=${has(verify.body, "Certificate code") ? "yes" : "NO"}`);
const verifySitemap = has(sitemap.body, "/verify");
record("sitemap: /verify entry", verifySitemap, sitemap.url, '"/verify" missing from sitemap');
line(verifySitemap, `GET /sitemap.xml  verify-entry=${verifySitemap ? "yes" : "NO"}`);
const todaySitemap = has(sitemap.body, "/today");
record("sitemap: /today entry", todaySitemap, sitemap.url, '"/today" missing from sitemap');
line(todaySitemap, `GET /sitemap.xml  today-entry=${todaySitemap ? "yes" : "NO"}`);

// --- 12. Wave-32 surfaces (projects, weekly board, siblings, kernels) --------
console.log("\n[12/13] Wave-32 surfaces");
const projectPage = await get("/projects/gpt");
const projectOk = projectPage.status === 200 && !isErrorPage(projectPage.body);
record("projects: detail 200", projectOk, projectPage.url,
  `expected 200, got ${projectPage.status}`);
line(projectOk, `GET /projects/gpt  status=${projectPage.status}`);
const projectSteps = count(projectPage.body, /href="\/problems\/[a-z0-9-]+/g);
record("projects: step links", projectSteps >= 3, projectPage.url,
  `expected >= 3 step links, found ${projectSteps}`);
line(projectSteps >= 3, `GET /projects/gpt  step-links=${projectSteps}`);
const projectSitemap = has(sitemap.body, "/projects/gpt");
record("sitemap: /projects/<id> entries", projectSitemap, sitemap.url,
  '"/projects/gpt" missing from sitemap');
line(projectSitemap, `GET /sitemap.xml  project-entry=${projectSitemap ? "yes" : "NO"}`);
const weeklyBoard = await get("/leaderboard");
const weeklyToggle = has(weeklyBoard.body, "This week");
record("leaderboard: weekly toggle", weeklyToggle, weeklyBoard.url,
  '"This week" toggle missing');
line(weeklyToggle, `GET /leaderboard  weekly-toggle=${weeklyToggle ? "yes" : "NO"}`);
if (problemMatch) {
  const siblingPage = await get(`/problems/${problemMatch[1]}`);
  const siblings = has(siblingPage.body, "More like this");
  record("problem: sibling challenges", siblings, siblingPage.url,
    '"More like this" section missing');
  line(siblings, `GET /problems/${problemMatch[1]}  siblings=${siblings ? "yes" : "NO"}`);
}
const softmaxArticle = await get("/articles/why-softmax-needs-temperature");
const kernelQuestion = has(softmaxArticle.body, "Predict the readout");
record("article: kernel question", kernelQuestion, softmaxArticle.url,
  '"Predict the readout" block missing');
line(kernelQuestion, `GET /articles/why-softmax-needs-temperature  kernel=${kernelQuestion ? "yes" : "NO"}`);

// --- 13. Wave-33 surfaces (research + labs detail, trails, concepts) --------
console.log("\n[13/14] Wave-33 surfaces");
const researchIndex = await get("/research");
const researchLinks = count(researchIndex.body, /href="\/research\/[a-z0-9-]+"/g);
record("research: index links to detail pages", researchLinks >= 5, researchIndex.url,
  `expected >= 5 detail links, found ${researchLinks}`);
line(researchLinks >= 5, `GET /research  detail-links=${researchLinks}`);
const researchDetail = await get("/research/tabular-classification-showdown");
const researchOk = researchDetail.status === 200 && !isErrorPage(researchDetail.body);
const researchTheory = has(researchDetail.body, "Method &amp; theory") || has(researchDetail.body, "Research notes");
const researchSolution = has(researchDetail.body, "Show solution");
record("research: detail 200 + theory", researchOk && researchTheory, researchDetail.url,
  `status=${researchDetail.status} theory=${researchTheory}`);
line(researchOk && researchTheory, `GET /research/tabular-classification-showdown  status=${researchDetail.status} theory=${researchTheory ? "yes" : "NO"}`);
record("research: solution reveal", researchSolution, researchDetail.url,
  '"Show solution" reveal missing');
line(researchSolution, `GET /research/tabular-classification-showdown  solution-reveal=${researchSolution ? "yes" : "NO"}`);
const labsIndex = await get("/labs");
const labLinks = count(labsIndex.body, /href="\/labs\/lab-\d+"/g);
record("labs: index links to detail pages", labLinks >= 8, labsIndex.url,
  `expected >= 8 lab links, found ${labLinks}`);
line(labLinks >= 8, `GET /labs  lab-links=${labLinks}`);
const labDetail = await get("/labs/lab-01");
const labDetailOk = labDetail.status === 200 && !isErrorPage(labDetail.body);
const labRules = has(labDetail.body, "Rules of the run");
record("labs: detail 200 + rules", labDetailOk && labRules, labDetail.url,
  `status=${labDetail.status} rules=${labRules}`);
line(labDetailOk && labRules, `GET /labs/lab-01  status=${labDetail.status} rules=${labRules ? "yes" : "NO"}`);
const labSolution = has(labDetail.body, "Show solution");
record("labs: solution reveal", labSolution, labDetail.url,
  '"Show solution" reveal missing');
line(labSolution, `GET /labs/lab-01  solution-reveal=${labSolution ? "yes" : "NO"}`);
const trails = await get("/labs/trails");
const trailsOk = trails.status === 200 && has(trails.body, "labs passed");
record("labs: trails page", trailsOk, trails.url,
  `status=${trails.status}`);
line(trailsOk, `GET /labs/trails  status=${trails.status}`);
const certificates = await get("/certificates");
const certTracks = has(certificates.body, "Certification tracks");
const certCatalog = has(certificates.body, "Certificate catalog");
record("certificates: tracks + catalog", certificates.status === 200 && certTracks && certCatalog, certificates.url,
  `status=${certificates.status} tracks=${certTracks} catalog=${certCatalog}`);
line(certificates.status === 200 && certTracks && certCatalog,
  `GET /certificates  tracks=${certTracks ? "yes" : "NO"} catalog=${certCatalog ? "yes" : "NO"}`);
const papersIndex = await get("/papers");
const paperLinks = count(papersIndex.body, /href="\/papers\/[a-z0-9-]+"/g);
record("papers: index links to papers", paperLinks >= 30, papersIndex.url,
  `expected >= 30 paper links, found ${paperLinks}`);
line(paperLinks >= 30, `GET /papers  paper-links=${paperLinks}`);
const paperDetail = await get("/papers/deepseek-r1");
const paperDetailOk = paperDetail.status === 200 && !isErrorPage(paperDetail.body);
const paperTheory = has(paperDetail.body, "Theory from first principles");
const paperCheck = has(paperDetail.body, "Implementation check");
record("papers: detail 200 + theory + check", paperDetailOk && paperTheory && paperCheck, paperDetail.url,
  `status=${paperDetail.status} theory=${paperTheory} check=${paperCheck}`);
line(paperDetailOk && paperTheory && paperCheck,
  `GET /papers/deepseek-r1  status=${paperDetail.status} theory=${paperTheory ? "yes" : "NO"} check=${paperCheck ? "yes" : "NO"}`);
const sitemapPapers = has(sitemap.body, "/papers/deepseek-r1");
record("sitemap: papers detail urls", sitemapPapers, sitemap.url,
  '"/papers/deepseek-r1" missing from sitemap');
line(sitemapPapers, `GET /sitemap.xml  papers=${sitemapPapers ? "yes" : "NO"}`);
const concepts = await get("/concepts");
const conceptsOk =
  concepts.status === 200 &&
  has(concepts.body, "Linear Algebra") &&
  has(concepts.body, 'id="concepts"');
record("concepts: browse page", conceptsOk, concepts.url,
  `status=${concepts.status} catalogue=${has(concepts.body, "Linear Algebra")}`);
line(conceptsOk, `GET /concepts  status=${concepts.status}`);
const sitemapWave33 =
  has(sitemap.body, "/research/tabular-classification-showdown") &&
  has(sitemap.body, "/labs/lab-01") &&
  has(sitemap.body, "/labs/trails") &&
  has(sitemap.body, "/concepts");
record("sitemap: wave-33 routes", sitemapWave33, sitemap.url,
  "missing one of /research/<id>, /labs/<id>, /labs/trails, /concepts");
line(sitemapWave33, `GET /sitemap.xml  wave-33=${sitemapWave33 ? "yes" : "NO"}`);
const labOg = await fetch(`${BASE_URL}/og?title=Lab&kind=lab&difficulty=Easy`, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
const labOgOk =
  Boolean(labOg) &&
  labOg.status === 200 &&
  (labOg.headers.get("content-type") ?? "").includes("image/png");
record("og: lab kind renders", labOgOk, `${BASE_URL}/og?kind=lab`,
  `status=${labOg?.status ?? 0} type=${labOg?.headers.get("content-type") ?? "none"}`);
line(labOgOk, `GET /og?kind=lab  status=${labOg?.status ?? 0}`);

// --- 14. Wave-39 surfaces (review hub, concept map, runnable projects) -------
console.log("\n[14/15] Wave-39 surfaces");
const reviewHub = await get("/review");
const reviewHubOk =
  reviewHub.status === 200 &&
  has(reviewHub.body, "Reading your review schedule") &&
  has(reviewHub.body, 'href="/review"');
record("review: hub", reviewHubOk, reviewHub.url,
  `status=${reviewHub.status} shell=${has(reviewHub.body, "Reading your review schedule")}`);
line(reviewHubOk, `GET /review  status=${reviewHub.status}`);
const conceptsMap = has(concepts.body, ">Map<");
record("concepts: map toggle", conceptsMap, concepts.url,
  "Map view toggle missing from /concepts");
line(conceptsMap, `GET /concepts  map-toggle=${conceptsMap ? "yes" : "NO"}`);
const paperRunner = has(paperDetail.body, "<textarea") && has(paperDetail.body, "Run</button>");
record("papers: runnable starter", paperRunner, paperDetail.url,
  `textarea=${has(paperDetail.body, "<textarea")} run=${has(paperDetail.body, "Run</button>")}`);
line(paperRunner, `GET /papers/deepseek-r1  runner=${paperRunner ? "yes" : "NO"}`);
const sitemapReview = has(sitemap.body, "/review");
record("sitemap: review route", sitemapReview, sitemap.url, '"/review" missing from sitemap');
line(sitemapReview, `GET /sitemap.xml  review=${sitemapReview ? "yes" : "NO"}`);

// --- 15. Wave-40 surfaces (inventions: page + PDF) ---------------------------
console.log("\n[15/16] Wave-40 surfaces");
const inventions = await get("/inventions");
const inventionsOk =
  inventions.status === 200 &&
  has(inventions.body, "/inventions/ladder-graded-spacing");
record("inventions: index", inventionsOk, inventions.url, `status=${inventions.status}`);
line(inventionsOk, `GET /inventions  status=${inventions.status}`);
const inventionPage = await get("/inventions/ladder-graded-spacing");
const inventionPageOk =
  inventionPage.status === 200 && has(inventionPage.body, "Abstract");
record("inventions: paper page", inventionPageOk, inventionPage.url,
  `status=${inventionPage.status} abstract=${has(inventionPage.body, "Abstract")}`);
line(inventionPageOk, `GET /inventions/ladder-graded-spacing  status=${inventionPage.status}`);
const pdfRes = await fetch(`${BASE_URL}/inventions/ladder-graded-spacing/paper.pdf`, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
const pdfType = pdfRes?.headers.get("content-type") ?? "";
const pdfBody = pdfRes ? Buffer.from(await pdfRes.arrayBuffer()) : Buffer.alloc(0);
const pdfMagic = pdfBody.subarray(0, 5).toString();
const pdfOk =
  Boolean(pdfRes) &&
  pdfRes.status === 200 &&
  pdfType.includes("application/pdf") &&
  pdfMagic === "%PDF-";
record("inventions: pdf", pdfOk, `${BASE_URL}/inventions/ladder-graded-spacing/paper.pdf`,
  `status=${pdfRes?.status ?? 0} type=${pdfType} magic=${pdfMagic}`);
line(pdfOk, `GET /inventions/ladder-graded-spacing/paper.pdf  status=${pdfRes?.status ?? 0} type=${pdfType.split(";")[0]}`);
const sitemapInventions = has(sitemap.body, "/inventions/ladder-graded-spacing");
record("sitemap: inventions", sitemapInventions, sitemap.url,
  "missing /inventions/<slug>");
line(sitemapInventions, `GET /sitemap.xml  inventions=${sitemapInventions ? "yes" : "NO"}`);

// --- 16. Wave-41 surfaces (silent bug hunt + paper #2) -----------------------
console.log("\n[16/18] Wave-41 surfaces");
const alibiPage = await get("/alibi");
const alibiOk = alibiPage.status === 200 && has(alibiPage.body, "Silent Bug Hunt");
record("alibi: hunt page", alibiOk, alibiPage.url, `status=${alibiPage.status}`);
line(alibiOk, `GET /alibi  status=${alibiPage.status}`);
const alibiPaper = await get("/inventions/alibi-distance");
const alibiPaperOk = alibiPaper.status === 200 && has(alibiPaper.body, "Abstract");
record("inventions: alibi paper", alibiPaperOk, alibiPaper.url, `status=${alibiPaper.status}`);
line(alibiPaperOk, `GET /inventions/alibi-distance  status=${alibiPaper.status}`);
const alibiPdf = await fetch(`${BASE_URL}/inventions/alibi-distance/paper.pdf`, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
const alibiPdfType = alibiPdf?.headers.get("content-type") ?? "";
const alibiPdfBody = alibiPdf ? Buffer.from(await alibiPdf.arrayBuffer()) : Buffer.alloc(0);
const alibiPdfMagic = alibiPdfBody.subarray(0, 5).toString();
const alibiPdfOk =
  Boolean(alibiPdf) &&
  alibiPdf.status === 200 &&
  alibiPdfType.includes("application/pdf") &&
  alibiPdfMagic === "%PDF-";
record("inventions: alibi pdf", alibiPdfOk, `${BASE_URL}/inventions/alibi-distance/paper.pdf`,
  `status=${alibiPdf?.status ?? 0} type=${alibiPdfType} magic=${alibiPdfMagic}`);
line(alibiPdfOk, `GET /inventions/alibi-distance/paper.pdf  status=${alibiPdf?.status ?? 0}`);
const sitemapAlibi = has(sitemap.body, "/alibi");
record("sitemap: alibi route", sitemapAlibi, sitemap.url, '"/alibi" missing from sitemap');
const keyfusePage = await get("/keyfuse");
const keyfuseOk = keyfusePage.status === 200 && has(keyfusePage.body, "KeyFuse");
record("keyfuse: auditor page", keyfuseOk, keyfusePage.url, `status=${keyfusePage.status}`);
line(keyfuseOk, `GET /keyfuse  status=${keyfusePage.status}`);
const sitemapKeyfuse = has(sitemap.body, "/keyfuse");
record("sitemap: keyfuse route", sitemapKeyfuse, sitemap.url, '"/keyfuse" missing from sitemap');
const keyfusePaper = await get("/inventions/keyfuse");
const keyfusePaperOk = keyfusePaper.status === 200 && has(keyfusePaper.body, "Abstract");
record("inventions: keyfuse paper", keyfusePaperOk, keyfusePaper.url, `status=${keyfusePaper.status}`);
line(keyfusePaperOk, `GET /inventions/keyfuse  status=${keyfusePaper.status}`);
const keyfusePdf = await fetch(`${BASE_URL}/inventions/keyfuse/paper.pdf`, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
const keyfusePdfType = keyfusePdf?.headers.get("content-type") ?? "";
const keyfusePdfBody = keyfusePdf ? Buffer.from(await keyfusePdf.arrayBuffer()) : Buffer.alloc(0);
const keyfusePdfMagic = keyfusePdfBody.subarray(0, 5).toString();
const keyfusePdfOk =
  Boolean(keyfusePdf) &&
  keyfusePdf.status === 200 &&
  keyfusePdfType.includes("application/pdf") &&
  keyfusePdfMagic === "%PDF-";
record("inventions: keyfuse pdf", keyfusePdfOk, `${BASE_URL}/inventions/keyfuse/paper.pdf`,
  `status=${keyfusePdf?.status ?? 0} type=${keyfusePdfType} magic=${keyfusePdfMagic}`);
line(keyfusePdfOk, `GET /inventions/keyfuse/paper.pdf  status=${keyfusePdf?.status ?? 0}`);
line(sitemapAlibi, `GET /sitemap.xml  alibi=${sitemapAlibi ? "yes" : "NO"}`);

// --- 17. Wave-42 surfaces (behavior ledger + paper #3) ------------------------
console.log("\n[17/18] Wave-42 surfaces");
const ledgerPage = await get("/ledger");
const ledgerOk = ledgerPage.status === 200 && has(ledgerPage.body, "Behavioral Delta Ledger");
record("ledger: picker", ledgerOk, ledgerPage.url, `status=${ledgerPage.status}`);
line(ledgerOk, `GET /ledger  status=${ledgerPage.status}`);
const ledgerPaper = await get("/inventions/behavioral-delta-ledger");
const ledgerPaperOk = ledgerPaper.status === 200 && has(ledgerPaper.body, "Abstract");
record("inventions: ledger paper", ledgerPaperOk, ledgerPaper.url, `status=${ledgerPaper.status}`);
line(ledgerPaperOk, `GET /inventions/behavioral-delta-ledger  status=${ledgerPaper.status}`);
const ledgerPdf = await fetch(`${BASE_URL}/inventions/behavioral-delta-ledger/paper.pdf`, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
const ledgerPdfType = ledgerPdf?.headers.get("content-type") ?? "";
const ledgerPdfBody = ledgerPdf ? Buffer.from(await ledgerPdf.arrayBuffer()) : Buffer.alloc(0);
const ledgerPdfMagic = ledgerPdfBody.subarray(0, 5).toString();
const ledgerPdfOk =
  Boolean(ledgerPdf) &&
  ledgerPdf.status === 200 &&
  ledgerPdfType.includes("application/pdf") &&
  ledgerPdfMagic === "%PDF-";
record("inventions: ledger pdf", ledgerPdfOk, `${BASE_URL}/inventions/behavioral-delta-ledger/paper.pdf`,
  `status=${ledgerPdf?.status ?? 0} type=${ledgerPdfType} magic=${ledgerPdfMagic}`);
line(ledgerPdfOk, `GET /inventions/behavioral-delta-ledger/paper.pdf  status=${ledgerPdf?.status ?? 0}`);
const sitemapLedger = has(sitemap.body, "/ledger");
record("sitemap: ledger route", sitemapLedger, sitemap.url, '"/ledger" missing from sitemap');
line(sitemapLedger, `GET /sitemap.xml  ledger=${sitemapLedger ? "yes" : "NO"}`);

// --- 18. Wave-44 surfaces (warrant lab + paper #5) ----------------------------
console.log("\n[18/19] Wave-44 surfaces");
const warrantPage = await get("/warrant");
const warrantOk = warrantPage.status === 200 && has(warrantPage.body, "Warrant Lab");
record("warrant: lab", warrantOk, warrantPage.url, `status=${warrantPage.status}`);
line(warrantOk, `GET /warrant  status=${warrantPage.status}`);
const warrantPaper = await get("/inventions/refutation-ledgers");
const warrantPaperOk =
  warrantPaper.status === 200 &&
  has(warrantPaper.body, "Abstract") &&
  has(warrantPaper.body, "Refutation-Ledger Values");
record("inventions: warrant paper", warrantPaperOk, warrantPaper.url, `status=${warrantPaper.status}`);
line(warrantPaperOk, `GET /inventions/refutation-ledgers  status=${warrantPaper.status}`);
const warrantPdf = await fetch(`${BASE_URL}/inventions/refutation-ledgers/paper.pdf`, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
const warrantPdfType = warrantPdf?.headers.get("content-type") ?? "";
const warrantPdfBody = warrantPdf ? Buffer.from(await warrantPdf.arrayBuffer()) : Buffer.alloc(0);
const warrantPdfMagic = warrantPdfBody.subarray(0, 5).toString();
const warrantPdfOk =
  Boolean(warrantPdf) &&
  warrantPdf.status === 200 &&
  warrantPdfType.includes("application/pdf") &&
  warrantPdfMagic === "%PDF-";
record("inventions: warrant pdf", warrantPdfOk, `${BASE_URL}/inventions/refutation-ledgers/paper.pdf`,
  `status=${warrantPdf?.status ?? 0} type=${warrantPdfType} magic=${warrantPdfMagic}`);
line(warrantPdfOk, `GET /inventions/refutation-ledgers/paper.pdf  status=${warrantPdf?.status ?? 0}`);
const sitemapWarrant = has(sitemap.body, "/warrant");
record("sitemap: warrant route", sitemapWarrant, sitemap.url, '"/warrant" missing from sitemap');
line(sitemapWarrant, `GET /sitemap.xml  warrant=${sitemapWarrant ? "yes" : "NO"}`);

// --- 19. Wave-48 surfaces (REPROGPU lab + paper #6) ---------------------------
console.log("\n[19/20] Wave-48 surfaces");
const reprogpuPage = await get("/reprogpu");
const reprogpuOk = reprogpuPage.status === 200 && has(reprogpuPage.body, "REPROGPU");
record("reprogpu: lab", reprogpuOk, reprogpuPage.url, `status=${reprogpuPage.status}`);
line(reprogpuOk, `GET /reprogpu  status=${reprogpuPage.status}`);
const reprogpuPaper = await get("/inventions/reprogpu");
const reprogpuPaperOk =
  reprogpuPaper.status === 200 &&
  has(reprogpuPaper.body, "Abstract") &&
  has(reprogpuPaper.body, "REPROGPU");
record("inventions: reprogpu paper", reprogpuPaperOk, reprogpuPaper.url, `status=${reprogpuPaper.status}`);
line(reprogpuPaperOk, `GET /inventions/reprogpu  status=${reprogpuPaper.status}`);
const reprogpuPdf = await fetch(`${BASE_URL}/inventions/reprogpu/paper.pdf`, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
const reprogpuPdfType = reprogpuPdf?.headers.get("content-type") ?? "";
const reprogpuPdfBody = reprogpuPdf ? Buffer.from(await reprogpuPdf.arrayBuffer()) : Buffer.alloc(0);
const reprogpuPdfMagic = reprogpuPdfBody.subarray(0, 5).toString();
const reprogpuPdfOk =
  Boolean(reprogpuPdf) &&
  reprogpuPdf.status === 200 &&
  reprogpuPdfType.includes("application/pdf") &&
  reprogpuPdfMagic === "%PDF-";
record("inventions: reprogpu pdf", reprogpuPdfOk, `${BASE_URL}/inventions/reprogpu/paper.pdf`,
  `status=${reprogpuPdf?.status ?? 0} type=${reprogpuPdfType} magic=${reprogpuPdfMagic}`);
line(reprogpuPdfOk, `GET /inventions/reprogpu/paper.pdf  status=${reprogpuPdf?.status ?? 0}`);
const sitemapReprogpu = has(sitemap.body, "/reprogpu");
record("sitemap: reprogpu route", sitemapReprogpu, sitemap.url, '"/reprogpu" missing from sitemap');
line(sitemapReprogpu, `GET /sitemap.xml  reprogpu=${sitemapReprogpu ? "yes" : "NO"}`);

// --- 20. Summary -------------------------------------------------------------
console.log("\n[20/20] Summary");
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
