#!/usr/bin/env node
/**
 * Prune Vercel deployments: keep the newest production deployment and the
 * newest preview, delete everything else (storage on Vercel is dominated by
 * retained deployments).
 *
 * Auth (either one):
 *   - VERCEL_TOKEN=... in the environment, or
 *   - VERCEL_TOKEN=... written to .env.local (gitignored)
 *   Create one at https://vercel.com/account/tokens
 *
 * Usage:
 *   node scripts/vercel-prune.mjs                 # dry run: prints the plan
 *   node scripts/vercel-prune.mjs --execute       # deletes
 *   PROJECT=deepforge TEAM=srivtx node scripts/vercel-prune.mjs
 */

import { readFileSync, existsSync } from "node:fs";

const API = "https://api.vercel.com";
const EXECUTE = process.argv.includes("--execute");

function loadToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN.trim();
  if (existsSync(".env.local")) {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^\s*VERCEL_TOKEN\s*=\s*(.+)\s*$/);
      if (match) return match[1].replace(/^["']|["']$/g, "").trim();
    }
  }
  for (const candidate of [
    `${process.env.HOME}/.local/share/com.vercel.cli/auth.json`,
    `${process.env.HOME}/Library/Application Support/com.vercel.cli/auth.json`,
  ]) {
    if (!existsSync(candidate)) continue;
    try {
      const auth = JSON.parse(readFileSync(candidate, "utf8"));
      if (auth?.token) return auth.token;
    } catch {
      // fall through
    }
  }
  console.error(
    "No VERCEL_TOKEN found. Either add VERCEL_TOKEN=... to .env.local " +
      "(create one at https://vercel.com/account/tokens) or run `vercel login` " +
      "so the CLI session can be reused.",
  );
  process.exit(1);
}

const TOKEN = loadToken();

async function api(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const code = body?.error?.code ?? res.status;
    throw new Error(`${init.method ?? "GET"} ${path} -> ${code}`);
  }
  return body;
}

async function findProject() {
  const wanted = (process.env.PROJECT ?? "deepforge").toLowerCase();
  const user = await api("/v2/user");
  const teams = (await api("/v2/teams")).teams ?? [];
  const scopes = [
    { id: user.user.id, slug: "personal" },
    ...teams.map((team) => ({ id: team.id, slug: team.slug })),
  ];
  for (const scope of scopes) {
    if (process.env.TEAM && scope.slug !== process.env.TEAM) continue;
    const query = new URLSearchParams({ limit: "100" });
    if (scope.slug !== "personal") query.set("teamId", scope.id);
    const projects = (await api(`/v9/projects?${query}`)).projects ?? [];
    const hit = projects.find((project) => project.name.toLowerCase() === wanted)
      ?? projects.find((project) => project.name.toLowerCase().includes(wanted));
    if (hit) return { project: hit, teamId: scope.slug === "personal" ? null : scope.id, teamSlug: scope.slug };
  }
  throw new Error(`Project "${wanted}" not found in any accessible scope.`);
}

async function listDeployments(projectId, teamId) {
  const all = [];
  let until = null;
  for (let page = 0; page < 10; page += 1) {
    const query = new URLSearchParams({ projectId, limit: "100" });
    if (teamId) query.set("teamId", teamId);
    if (until) query.set("until", String(until));
    const { deployments = [] } = await api(`/v6/deployments?${query}`);
    all.push(...deployments);
    if (deployments.length < 100) break;
    until = deployments[deployments.length - 1].created;
  }
  return all.sort((a, b) => b.created - a.created);
}

const isProduction = (deployment) => deployment.target === "production";

const { project, teamId, teamSlug } = await findProject();
console.log(`Project: ${project.name} (${teamSlug})`);

const deployments = await listDeployments(project.id, teamId);
if (deployments.length === 0) {
  console.log("No deployments found.");
  process.exit(0);
}

const newestProduction = deployments.find(isProduction) ?? null;
const newestPreview = deployments.find((d) => !isProduction(d)) ?? null;
const keep = new Set(
  [newestProduction?.uid, newestPreview?.uid].filter(Boolean),
);
const doomed = deployments.filter((d) => !keep.has(d.uid));

const stamp = (d) => new Date(d.created).toISOString().slice(0, 19).replace("T", " ");
console.log(`Total deployments: ${deployments.length}`);
if (newestProduction) console.log(`Keep production : ${stamp(newestProduction)}  ${newestProduction.url}`);
if (newestPreview) console.log(`Keep preview    : ${stamp(newestPreview)}  ${newestPreview.url}`);
console.log(`Delete          : ${doomed.length}`);
for (const d of doomed.slice(0, 10)) {
  console.log(`  - ${stamp(d)}  ${isProduction(d) ? "[prod]" : "[preview]"}  ${d.url}`);
}
if (doomed.length > 10) console.log(`  …and ${doomed.length - 10} more`);

if (!EXECUTE) {
  console.log("\nDry run. Re-run with --execute to delete.");
  process.exit(0);
}

let deleted = 0;
let failed = 0;
for (const deployment of doomed) {
  try {
    const query = teamId ? `?teamId=${teamId}` : "";
    await api(`/v13/deployments/${deployment.uid}${query}`, { method: "DELETE" });
    deleted += 1;
    if (deleted % 25 === 0) console.log(`  deleted ${deleted}/${doomed.length}…`);
  } catch (error) {
    failed += 1;
    console.error(`  failed ${deployment.url}: ${error.message}`);
  }
}
console.log(`\nDone. Deleted ${deleted}, failed ${failed}, kept ${keep.size}.`);
