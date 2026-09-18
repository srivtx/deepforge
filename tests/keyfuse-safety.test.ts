import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auditDigest,
  auditTask,
  baselineAssignment,
  canonicalJson,
  createVirtualOracle,
  KEYFUSE_CERTIFICATE,
  KEYFUSE_CERTIFICATE_TRUNCATED,
  KEYFUSE_DEFAULT_STRENGTH,
  KEYFUSE_EXACT_MAX_ROWS,
  KEYFUSE_FIXPOINT_PASSES,
  KEYFUSE_MARK,
  KEYFUSE_MAX_RUNS,
  KEYFUSE_MAX_SLOTS,
  KEYFUSE_MAX_STRENGTH,
  KEYFUSE_VERSION,
} from "@/lib/keyfuse";
import type { SlotUniverse, TaskOracle, VirtualTask } from "@/lib/keyfuse";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEYFUSE_DIR = join(ROOT, "src", "lib", "keyfuse");

/* ─────────────────────────── pure-file inventory ────────────────────────── */

/**
 * The ten pure engine files from blueprint §3.1: no `node:` import, no app
 * import, no clock, no randomness, no DOM, no network, no storage. The Node
 * facade (`nodeAdapter.ts`) and the corpus (`tasks.ts`) are deliberately not
 * on this list; they must never be imported by the browser core.
 */
const PURE_FILES = [
  "types.ts",
  "hash.ts",
  "slots.ts",
  "cover.ts",
  "trace.ts",
  "probe.ts",
  "minimize.ts",
  "repair.ts",
  "audit.ts",
  "index.ts",
] as const;

const PURE_SOURCES = PURE_FILES.map((name) => ({
  name,
  path: join(KEYFUSE_DIR, name),
  source: readFileSync(join(KEYFUSE_DIR, name), "utf8"),
}));

const AUDIT_SOURCE = PURE_SOURCES.find((file) => file.name === "audit.ts")!.source;

const PURE_SOURCES_TEXT = PURE_SOURCES.map((file) => file.source).join(
  "\n/* ── next keyfuse file ── */\n",
);

/* ───────────────────────────── pattern scanners ─────────────────────────── */

const FORBIDDEN_CODE = [
  'from "node:',
  "from 'node:",
  "require(",
  'from "@/',
  "new Date(",
  "Date.now(",
  "Math.random(",
  "window.",
  "document.",
  "localStorage",
  "fetch(",
  "import(",
  "console.",
] as const;

/** One control string carrying every forbidden pattern, in code position. */
const IMPURE_SAMPLE = [
  'import { readFileSync } from "node:fs";',
  "import { join } from 'node:path';",
  "const fs = require('fs');",
  'import { readRaw } from "@/lib/sync/localAdapter";',
  "const now = new Date().getTime();",
  "const ms = Date.now();",
  "const roll = Math.random();",
  "window.localStorage.setItem('key', 'value');",
  "document.title = 'x';",
  "await fetch('/api');",
  "const mod = await import('./mod');",
  "console.log('x');",
].join("\n");

const PORTABLE_FORBIDDEN = [
  "/var/folders",
  "process.cwd",
  "/tmp/",
  "/Users/",
  "/home/",
  "~/",
] as const;

const PORTABLE_SAMPLE =
  '"/var/folders/x" process.cwd "/tmp/x" "/Users/zen/x" "/home/user/x" "~/x"';

const STORAGE_FORBIDDEN = ["localStorage.setItem", "deepforge:"] as const;

const APP_IMPORT_PATTERN = /(?:from|import\s*\()\s*["']@\/lib\//;

/** Prose may mention `@/lib/keyfuse`; an import statement may not. */
const STORAGE_SAMPLE =
  'localStorage.setItem("deepforge:x", "1"); import { x } from "@/lib/store";';

const CLAIM_PATTERN = /finds? all collisions|beats? sandboxing/gi;
const DENIAL_PATTERN = /\b(no|not|never)\b/i;

/**
 * Comment blocks joined into logical docblock lines: JSDoc lines are wrapped
 * by the formatter, so the not-claimed sentence spans several source lines and
 * only one block-level string carries the whole denial.
 */
function commentBlocks(source: string): readonly string[] {
  const blocks: string[] = [];
  let current: string[] | null = null;
  for (const line of source.split("\n")) {
    const match = /^\s*(?:\/\*\*?|\*+\/?|\/\/\/?)\s?(.*)$/.exec(line);
    if (match) {
      if (current === null) current = [];
      const text = match[1].trim();
      if (text.length > 0) current.push(text);
      continue;
    }
    if (current !== null) {
      blocks.push(current.join(" "));
      current = null;
    }
  }
  if (current !== null) blocks.push(current.join(" "));
  return blocks;
}

/**
 * Claim-string occurrences that are NOT inside a negated comment block. Comment
 * occurrences are judged per docblock line, code occurrences are never allowed.
 */
function claimViolations(source: string): readonly string[] {
  const violations: string[] = [];
  for (const block of commentBlocks(source)) {
    for (const match of block.matchAll(CLAIM_PATTERN)) {
      if (!DENIAL_PATTERN.test(block)) violations.push(match[0]);
    }
  }
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .replace(/^\s*\*.*$/gm, " ");
  for (const match of code.matchAll(CLAIM_PATTERN)) {
    violations.push(match[0]);
  }
  return violations;
}

/* ────────────────────────────── inline tasks ────────────────────────────── */

const THREE_SLOT_UNIVERSE: SlotUniverse = {
  slots: [
    { kind: "env", id: "BUILD_MODE", baseline: "dev", top: "prod" },
    {
      kind: "env",
      id: "API_URL",
      baseline: "http://localhost:3000",
      top: "https://api.example.com",
    },
    { kind: "file", id: "project.json", baseline: '{"target":"web"}', top: '{"target":"native"}' },
  ],
};

const THREE_SLOT_TASK: VirtualTask = {
  kind: "virtual",
  id: "safety-metro-three-slot",
  version: "1",
  declared: ["env:BUILD_MODE"],
  universe: THREE_SLOT_UNIVERSE,
  baseline: baselineAssignment(THREE_SLOT_UNIVERSE),
  run: (env) => {
    if (env.env("BUILD_MODE") !== "prod") return "dev";
    return `prod:${env.env("API_URL")}:${env.readFile("project.json")}`;
  },
};

const AND_UNIVERSE: SlotUniverse = {
  slots: [
    { kind: "env", id: "A", baseline: "0", top: "1" },
    { kind: "env", id: "B", baseline: "0", top: "1" },
    { kind: "env", id: "C", baseline: "0", top: "1" },
    { kind: "env", id: "D", baseline: "0", top: "1" },
  ],
};

const AND_TASK: VirtualTask = {
  kind: "virtual",
  id: "safety-and-2way",
  version: "1",
  declared: ["env:A"],
  universe: AND_UNIVERSE,
  baseline: baselineAssignment(AND_UNIVERSE),
  run: (env) => (env.env("A") === "1" && env.env("B") === "1" ? "hit" : "miss"),
};

/* ─────────────────────────────── purity scan ────────────────────────────── */

describe("keyfuse purity scan", () => {
  test("scans exactly the ten pure engine files (the scan is not vacuous)", () => {
    expect(PURE_SOURCES.map((file) => file.name)).toEqual([...PURE_FILES]);
    for (const file of PURE_SOURCES) {
      expect(file.source.length).toBeGreaterThan(500);
    }
    expect(PURE_SOURCES_TEXT).toContain("KEYFUSE");
    expect(PURE_SOURCES_TEXT).toContain("export");
  });

  test("positive control: every forbidden pattern is detectable in impure code", () => {
    for (const pattern of FORBIDDEN_CODE) {
      expect(IMPURE_SAMPLE).toContain(pattern);
    }
  });

  test("no pure file contains a forbidden code pattern", () => {
    for (const file of PURE_SOURCES) {
      for (const pattern of FORBIDDEN_CODE) {
        expect(file.source).not.toContain(pattern);
      }
    }
  });
});

/* ──────────────────────────── honest semantics ──────────────────────────── */

describe("keyfuse honest-semantics scan", () => {
  test("audit.ts states the anchor assumption and the not-claimed ceiling", () => {
    const prose = commentBlocks(AUDIT_SOURCE).join(" \u2014 ");
    expect(prose).toMatch(/anchor assumption/i);
    expect(prose).toMatch(/not a theorem/i);
    expect(prose).toMatch(/no soundness/i);
    expect(prose).toMatch(/no completeness/i);
    expect(prose).toMatch(/not\s+"?finds? all collisions"?/i);
    expect(prose).toMatch(/not\s+"?beats? sandboxing on file reads"?/i);
  });

  test("claim strings only appear under negation, never in code or bare prose", () => {
    // Positive controls: the scanner flags a bare claim and a code literal,
    // and accepts a denied claim.
    expect(claimViolations("/** It finds all collisions. */")).toEqual(["finds all collisions"]);
    expect(claimViolations('const claim = "beats sandboxing";')).toEqual(["beats sandboxing"]);
    expect(claimViolations("/** It does not find all collisions. */")).toEqual([]);
    expect(claimViolations("/** Never beats sandboxing on file reads. */")).toEqual([]);
    for (const file of PURE_SOURCES) {
      expect(claimViolations(file.source)).toEqual([]);
    }
  });
});

/* ──────────────────────────── frozen constants ──────────────────────────── */

describe("keyfuse frozen constants", () => {
  test("exposes the exact blueprint values", () => {
    expect(KEYFUSE_VERSION).toBe(1);
    expect(KEYFUSE_MARK).toBe("__DF_KEYFUSE__");
    expect(KEYFUSE_MAX_SLOTS).toBe(12);
    expect(KEYFUSE_MAX_STRENGTH).toBe(3);
    expect(KEYFUSE_DEFAULT_STRENGTH).toBe(2);
    expect(KEYFUSE_MAX_RUNS).toBe(4096);
    expect(KEYFUSE_EXACT_MAX_ROWS).toBe(2048);
    expect(KEYFUSE_FIXPOINT_PASSES).toBe(3);
    expect(KEYFUSE_CERTIFICATE).toBe("no detected <=t-support effect at covered tuples");
    expect(KEYFUSE_CERTIFICATE_TRUNCATED).toBe("budget exhausted before coverage completed");
  });

  test("certificate copy is the string defined in the pure core", () => {
    expect(AUDIT_SOURCE).toContain(KEYFUSE_CERTIFICATE);
    expect(AUDIT_SOURCE).toContain(KEYFUSE_CERTIFICATE_TRUNCATED);
  });
});

/* ─────────────────────────────── determinism ────────────────────────────── */

describe("keyfuse determinism contract", () => {
  test("two audits of one inline 3-slot task are byte-identical and self-digesting", () => {
    const oracle = createVirtualOracle(THREE_SLOT_TASK);
    const first = auditTask(THREE_SLOT_TASK, oracle);
    const second = auditTask(THREE_SLOT_TASK, oracle);

    expect(first.deterministic).toBe(true);
    expect(canonicalJson(first)).toBe(canonicalJson(second));

    const { digest, ...rest } = first;
    expect(digest).toMatch(/^[0-9a-f]{16}$/);
    expect(digest).toBe(auditDigest(rest));
  });

  test("a fixed corpus-like task keeps its run count and every probe row stable", () => {
    const first = auditTask(AND_TASK, createVirtualOracle(AND_TASK));
    const second = auditTask(AND_TASK, createVirtualOracle(AND_TASK));

    expect(first.deterministic).toBe(true);
    expect(first.runs).toBeGreaterThan(4);
    expect(second.runs).toBe(first.runs);
    expect(second.probes.length).toBe(first.probes.length);
    for (const row of first.probes) {
      const other = second.probes[row.index];
      expect(other.index).toBe(row.index);
      expect(other.output).toBe(row.output);
      expect(other.changed).toBe(row.changed);
      expect(canonicalJson(other.differing)).toBe(canonicalJson(row.differing));
      expect(canonicalJson(other.assignment)).toBe(canonicalJson(row.assignment));
    }
    expect(second.detections.map((detection) => detection.slot)).toEqual(
      first.detections.map((detection) => detection.slot),
    );
    // The shipped default is the exact arm: both A and B participate in the
    // ≤t-support effect, so both are attributed with witnesses.
    expect(first.detections.map((detection) => detection.slot)).toEqual(["env:A", "env:B"]);
    expect(first.misses.some((miss) => miss.includes("order exceeds strength"))).toBe(false);
    // The conservative fallback minimizes first and reports the >t-support
    // context instead of a silent drop.
    const fallback = auditTask(AND_TASK, createVirtualOracle(AND_TASK), { strategy: "ca-ddmin" });
    expect(fallback.detections).toEqual([]);
    expect(fallback.misses.some((miss) => miss.includes("order exceeds strength"))).toBe(true);
  });

  test("a deliberately impure oracle is refused with the exact miss string", () => {
    let calls = 0;
    const impure: TaskOracle = () => {
      calls += 1;
      return {
        outcome: { ok: true, output: calls % 2 === 0 ? "even" : "odd" },
        reads: [],
        trapped: true,
        notes: [],
      };
    };

    const result = auditTask(AND_TASK, impure);
    expect(result.deterministic).toBe(false);
    expect(result.detections).toEqual([]);
    expect(result.probes).toEqual([]);
    expect(result.runs).toBe(4);
    expect(result.misses).toEqual(["oracle nondeterministic at baseline"]);
    expect(AUDIT_SOURCE).toContain('"oracle nondeterministic at baseline"');
  });
});

/* ────────────────────── portability and isolation scan ──────────────────── */

describe("keyfuse portability and isolation", () => {
  test("no source under src/lib/keyfuse carries a machine-local path literal", () => {
    for (const pattern of PORTABLE_FORBIDDEN) {
      expect(PORTABLE_SAMPLE).toContain(pattern);
    }
    const files = readdirSync(KEYFUSE_DIR).filter((name) => name.endsWith(".ts"));
    expect(files.length).toBeGreaterThanOrEqual(PURE_FILES.length);
    for (const name of PURE_FILES) {
      expect(files).toContain(name);
    }
    for (const name of files) {
      const source = readFileSync(join(KEYFUSE_DIR, name), "utf8");
      for (const pattern of PORTABLE_FORBIDDEN) {
        expect(source).not.toContain(pattern);
      }
    }
  });

  test("the pure core touches no storage key, storage write, or app import", () => {
    for (const pattern of STORAGE_FORBIDDEN) {
      expect(STORAGE_SAMPLE).toContain(pattern);
    }
    expect(APP_IMPORT_PATTERN.test(STORAGE_SAMPLE)).toBe(true);
    for (const file of PURE_SOURCES) {
      for (const pattern of STORAGE_FORBIDDEN) {
        expect(file.source).not.toContain(pattern);
      }
      expect(APP_IMPORT_PATTERN.test(file.source)).toBe(false);
    }
  });
});
