import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WARRANT_DIR = join(ROOT, "src", "lib", "warrant");
const LEDGER_PATH = join(ROOT, "src", "data", "inventions", "refutation-ledgers.ts");
const UI_DIRS = [
  join(ROOT, "src", "app", "warrant"),
  join(ROOT, "src", "components", "warrant"),
] as const;

const EXPECTED_ENGINE_FILES = [
  "arena.ts",
  "audit.ts",
  "grade.ts",
  "graders.ts",
  "graph.ts",
  "hash.ts",
  "ids.ts",
  "index.ts",
  "ledger.ts",
  "metrics.ts",
  "registry.ts",
  "types.ts",
] as const;

function uiFiles(): readonly string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.name.endsWith(".tsx")) {
        files.push(path);
      }
    }
  };
  for (const dir of UI_DIRS) walk(dir);
  return files.sort();
}

const ENGINE_FILES = readdirSync(WARRANT_DIR)
  .filter((name) => name.endsWith(".ts"))
  .sort();

const ENGINE_SOURCES = ENGINE_FILES.map((name) => ({
  name,
  path: join(WARRANT_DIR, name),
  source: readFileSync(join(WARRANT_DIR, name), "utf8"),
}));

const UI_FILES = uiFiles();

/* ─────────────────────────────── purity scan ────────────────────────────── */

const PURE_FORBIDDEN = [
  "Date",
  "Math.random",
  "fetch(",
  "XMLHttpRequest",
  "process.",
  "require(",
  'from "fs"',
  'from "node:',
  "crypto",
  "setTimeout",
  "setInterval",
  "JSON.stringify",
  "console.",
] as const;

const IMPURE_SAMPLE = [
  'const stampedAt = new Date().toISOString();',
  "const now = Date.now();",
  "const roll = Math.random();",
  'await fetch("/api/warrant");',
  "const request = new XMLHttpRequest();",
  "const pid = process.pid;",
  'const fs = require("fs");',
  'import { readFileSync } from "fs";',
  'import { join } from "node:path";',
  "const bytes = crypto.getRandomValues(new Uint8Array(4));",
  "const timer = setTimeout(() => {}, 0);",
  "const interval = setInterval(() => {}, 0);",
  "const encoded = JSON.stringify(payload);",
  "console.log(encoded);",
].join("\n");

const SERIALIZER = "hash.ts";

describe("warrant purity scan", () => {
  test("scans exactly the twelve engine files (the scan is not vacuous)", () => {
    expect(ENGINE_FILES).toEqual([...EXPECTED_ENGINE_FILES]);
    for (const file of ENGINE_SOURCES) {
      expect(file.source.length).toBeGreaterThan(200);
    }
    expect(ENGINE_SOURCES.map((file) => file.source).join("\n")).toContain("WARRANT");
  });

  test("positive control: every forbidden runtime pattern is detectable", () => {
    for (const pattern of PURE_FORBIDDEN) {
      expect(IMPURE_SAMPLE).toContain(pattern);
    }
  });

  test("no engine file uses a forbidden runtime facility", () => {
    for (const file of ENGINE_SOURCES) {
      for (const pattern of PURE_FORBIDDEN) {
        // hash.ts is the canonical serializer itself; JSON.stringify there is
        // the JSON string-escaping primitive canonicalJson is built on.
        if (file.name === SERIALIZER && pattern === "JSON.stringify") continue;
        expect(file.source).not.toContain(pattern);
      }
    }
  });

  test("routes serialization through canonicalJson (JSON.stringify is serializer-only)", () => {
    expect(IMPURE_SAMPLE).toContain("JSON.stringify");
    for (const file of ENGINE_SOURCES) {
      if (file.name === SERIALIZER) continue;
      expect(file.source).not.toContain("JSON.stringify");
    }
    const serializer = ENGINE_SOURCES.find((file) => file.name === SERIALIZER);
    if (serializer === undefined) {
      throw new Error(`missing canonical serializer ${SERIALIZER}`);
    }
    expect(serializer.source).toContain("JSON.stringify");
    expect(serializer.source).toContain("export function canonicalJson");
  });
});

/* ──────────────────────────── honest-claims scan ────────────────────────── */

const CLAIM_TOKENS = [
  "verified",
  "validated",
  "hallucination-free",
  "certified",
  "safe",
  "trusted",
  "max independent",
  "independence number",
  "probability",
  "star rating",
] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const CLAIM_PATTERN = new RegExp(
  `\\b(?:${CLAIM_TOKENS.map(escapeRegExp).join("|")})\\b`,
  "gi",
);

const PERCENT_PATTERN = /%/;

function claimViolations(text: string, includePercent: boolean): readonly string[] {
  const found: string[] = [];
  for (const match of text.matchAll(CLAIM_PATTERN)) {
    found.push(match[0].toLowerCase());
  }
  if (includePercent && PERCENT_PATTERN.test(text)) {
    found.push("%");
  }
  return found;
}

/**
 * Comments plus string literals: the places engine copy can live. Code
 * identifiers (`Number.isSafeInteger`) and the modulo operator are not claims,
 * so word tokens are matched with word boundaries and `%` is checked in prose.
 */
function commentsAndStrings(source: string): string {
  const parts: string[] = [];
  for (const match of source.matchAll(/\/\*[\s\S]*?\*\//g)) parts.push(match[0]);
  for (const match of source.matchAll(/\/\/[^\n]*/g)) parts.push(match[0]);
  for (const match of source.matchAll(
    /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g,
  )) {
    parts.push(match[0]);
  }
  return parts.join("\n");
}

interface CopyFile {
  readonly label: string;
  readonly source: string;
}

function copyFiles(): readonly CopyFile[] {
  const files: CopyFile[] = [];
  if (existsSync(LEDGER_PATH)) {
    files.push({
      label: relative(ROOT, LEDGER_PATH),
      source: readFileSync(LEDGER_PATH, "utf8"),
    });
  }
  for (const path of UI_FILES) {
    files.push({ label: relative(ROOT, path), source: readFileSync(path, "utf8") });
  }
  return files;
}

const COPY_FILES = copyFiles();

describe("warrant honest-claims scan", () => {
  test("positive control: every banned claim token is detectable", () => {
    const sample =
      "verified validated hallucination-free certified safe trusted " +
      "max independent independence number probability 95% star rating";
    for (const token of CLAIM_TOKENS) {
      expect(sample).toContain(token);
    }
    expect(claimViolations(sample, true)).toHaveLength(CLAIM_TOKENS.length + 1);
  });

  test("engine code and prose never carry a banned claim token", () => {
    for (const file of ENGINE_SOURCES) {
      expect(claimViolations(file.source, false)).toEqual([]);
      expect(claimViolations(commentsAndStrings(file.source), true)).toEqual([]);
    }
  });

  test("paper and UI copy files, when present, stay inside the same deny-list", () => {
    for (const file of COPY_FILES) {
      expect(claimViolations(file.source, true)).toEqual([]);
    }
  });
});

/* ───────────────────────────── design-token scan ────────────────────────── */

const DESIGN_TOKENS = ["shadow", "gradient", "uppercase"] as const;

const DESIGN_SAMPLE = 'className="shadow-md bg-gradient-to-r uppercase"';

describe("warrant design-token scan", () => {
  test("positive control: the design deny-list is detectable", () => {
    for (const token of DESIGN_TOKENS) {
      expect(DESIGN_SAMPLE).toContain(token);
    }
  });

  test("UI files, when present, avoid shadow, gradient, and uppercase", () => {
    for (const path of UI_FILES) {
      const source = readFileSync(path, "utf8");
      for (const token of DESIGN_TOKENS) {
        expect(source).not.toContain(token);
      }
    }
  });
});

/* ──────────────────────────── export discipline ─────────────────────────── */

describe("warrant export discipline", () => {
  test("the barrel hides oracleScore and never mentions ORACLE_GRADER", () => {
    const barrel = readFileSync(join(WARRANT_DIR, "index.ts"), "utf8");
    const graders = readFileSync(join(WARRANT_DIR, "graders.ts"), "utf8");
    expect(barrel).not.toMatch(/\boracleScore\b/i);
    expect(barrel).not.toMatch(/ORACLE_GRADER/);
    expect(graders).toMatch(/export function oracleScore/);
  });

  test("no engine file launders a type through as unknown as", () => {
    expect("const x = value as unknown as Value;").toContain("as unknown as");
    for (const file of ENGINE_SOURCES) {
      expect(file.source).not.toContain("as unknown as");
    }
  });
});
