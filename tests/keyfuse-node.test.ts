/**
 * Node adapter tests — real filesystem reads under a `mkdtemp` root.
 *
 * These tests exercise `createNodeOracle` on inline fixtures only (nothing is
 * imported from `tasks.ts`): a real file read becomes `file:cfg.json` with the
 * content; `process.env` reads become `env:<NAME>` and return the assignment
 * value; directory listings become `file:<dir>/` with sorted newline-joined
 * names; paths escaping `root` are rejected deterministically; repeated runs
 * are byte-identical; the Metro-style collision shape (same declared inputs,
 * different env) produces different outputs; and every temp project is removed
 * in `finally`. The suite registers itself only when `node:fs` is genuinely
 * available, so a non-Node environment skips instead of crashing.
 */

import { describe, expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import type { Assignment, NodeTask, OracleRun } from "@/lib/keyfuse";
import { createNodeOracle } from "@/lib/keyfuse/nodeAdapter";

type NodeFs = typeof import("node:fs");

const nodeFs: NodeFs | null = await import("node:fs").catch(() => null);

const CFG_CONTENT = '{"target":"web"}';

const BASELINE: Assignment = {
  "env:MODE": "dev",
  "env:API_URL": "http://localhost:3000",
  "file:cfg.json": CFG_CONTENT,
};

const FULL_SOURCE = `
const cfg = fs.readFileSync("cfg.json", "utf8");
const mode = process.env.MODE;
const names = fs.readdirSync("assets").join(",");
return "mode=" + mode + ";cfg=" + cfg + ";names=" + names;
`;

const METRO_SOURCE = `
if (process.env.MODE !== "prod") return "dev";
return "prod:" + process.env.API_URL + ":" + fs.readFileSync("cfg.json", "utf8");
`;

const STAT_SOURCE = `
const hasCfg = fs.existsSync("cfg.json");
const hasMissing = fs.existsSync("missing.txt");
const isDir = fs.statSync("assets").isDirectory();
return [hasCfg, hasMissing, isDir].join(",");
`;

const AMBIENT_SOURCE = 'return "tick=" + env.ambient.TICK;';

if (nodeFs === null) {
  test("keyfuse node adapter: skipped because node:fs is unavailable", () => {
    expect(nodeFs).toBeNull();
  });
} else {
  const fs = nodeFs;

  function nodeTask(source: string): NodeTask {
    return {
      kind: "node",
      id: "inline-node-fixture",
      version: "1",
      declared: ["env:MODE", "file:cfg.json"],
      universe: {
        slots: [
          { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
          {
            kind: "env",
            id: "API_URL",
            baseline: "http://localhost:3000",
            top: "https://api.example.com",
          },
          { kind: "file", id: "cfg.json", baseline: CFG_CONTENT, top: '{"target":"native"}' },
        ],
      },
      baseline: BASELINE,
      source,
      entry: "main",
    };
  }

  function withProject<T>(body: (dir: string) => T): T {
    const dir = fs.mkdtempSync(join(tmpdir(), "keyfuse-"));
    try {
      fs.mkdirSync(join(dir, "assets"), { recursive: true });
      fs.writeFileSync(join(dir, "cfg.json"), CFG_CONTENT, "utf8");
      fs.writeFileSync(join(dir, "assets", "b.txt"), "b", "utf8");
      fs.writeFileSync(join(dir, "assets", "a.txt"), "a", "utf8");
      return body(dir);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  function outputOf(run: OracleRun): string {
    if (!run.outcome.ok) throw new Error(`fixture failed: ${run.outcome.reason}`);
    return run.outcome.output;
  }

  function readValue(run: OracleRun, slot: string): string | undefined {
    const read = run.reads.find((entry) => entry.slot === slot);
    return read?.value;
  }

  describe("keyfuse node adapter", () => {
    test("reads a real file and records it as file:cfg.json with the content", () => {
      withProject((dir) => {
        const oracle = createNodeOracle(nodeTask(FULL_SOURCE), { root: dir });
        const run = oracle(BASELINE);
        expect(run.outcome.ok).toBe(true);
        expect(readValue(run, "file:cfg.json")).toBe(CFG_CONTENT);
        expect(outputOf(run)).toContain(`cfg=${CFG_CONTENT}`);
      });
    });

    test("records env reads as env:MODE and the Proxy returns assignment values", () => {
      withProject((dir) => {
        const oracle = createNodeOracle(nodeTask(FULL_SOURCE), { root: dir });
        const run = oracle({ ...BASELINE, "env:MODE": "prod" });
        expect(readValue(run, "env:MODE")).toBe("prod");
        expect(outputOf(run)).toContain("mode=prod");
      });
    });

    test("records a directory listing as file:assets/ with sorted newline-joined names", () => {
      withProject((dir) => {
        const oracle = createNodeOracle(nodeTask(FULL_SOURCE), { root: dir });
        const run = oracle(BASELINE);
        expect(readValue(run, "file:assets/")).toBe("a.txt\nb.txt");
        expect(outputOf(run)).toContain("names=a.txt,b.txt");
      });
    });

    test("rejects a path escaping root deterministically", () => {
      withProject((dir) => {
        const outside = join(dirname(dir), `keyfuse-outside-${basename(dir)}.txt`);
        fs.writeFileSync(outside, "secret", "utf8");
        try {
          const oracle = createNodeOracle(
            nodeTask('return fs.readFileSync("../escape.txt", "utf8");'),
            { root: dir },
          );
          const first = oracle(BASELINE);
          const second = oracle(BASELINE);
          expect(first.outcome.ok).toBe(false);
          if (first.outcome.ok) throw new Error("escape was not rejected");
          expect(first.outcome.reason).toBe("error");
          expect(first.reads).toHaveLength(0);
          expect(first).toEqual(second);

          const absolute = nodeTask(
            `return fs.readFileSync(${JSON.stringify(outside)}, "utf8");`,
          );
          const absoluteOracle = createNodeOracle(absolute, { root: dir });
          expect(absoluteOracle(BASELINE).outcome.ok).toBe(false);

          const catcher = nodeTask(
            'try { fs.readFileSync("../escape.txt", "utf8"); return "no-throw"; }' +
              ' catch (error) { return "caught:" + error.message; }',
          );
          const caught = createNodeOracle(catcher, { root: dir })(BASELINE);
          expect(outputOf(caught)).toBe("caught:keyfuse node adapter: path escapes root");
        } finally {
          fs.rmSync(outside, { force: true });
        }
      });
    });

    test("two runs with the same assignment are byte-identical (determinism)", () => {
      withProject((dir) => {
        const oracle = createNodeOracle(nodeTask(FULL_SOURCE), { root: dir });
        const assignment: Assignment = { ...BASELINE, "env:MODE": "prod" };
        const first = oracle(assignment);
        const second = oracle(assignment);
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
        expect(first.reads.length).toBeGreaterThan(0);
      });
    });

    test("same declared inputs with a different env:API_URL produce different outputs", () => {
      withProject((dir) => {
        const task = nodeTask(METRO_SOURCE);
        const oracle = createNodeOracle(task, { root: dir });
        const staging = oracle({
          "env:MODE": "prod",
          "env:API_URL": "https://staging.example.com",
        });
        const production = oracle({
          "env:MODE": "prod",
          "env:API_URL": "https://api.example.com",
        });
        expect(outputOf(staging)).not.toBe(outputOf(production));
        expect(readValue(staging, "file:cfg.json")).toBe(CFG_CONTENT);
        expect(readValue(production, "file:cfg.json")).toBe(CFG_CONTENT);
        expect(readValue(staging, "env:API_URL")).toBe("https://staging.example.com");
        expect(task.declared).toEqual(["env:MODE", "file:cfg.json"]);
      });
    });

    test("flags an untrapped ambient read and keeps recorded reads trapped", () => {
      withProject((dir) => {
        const ambient = { TICK: "1" };

        const noAmbient = createNodeOracle(nodeTask(AMBIENT_SOURCE), { root: dir });
        expect(noAmbient(BASELINE).trapped).toBe(true);

        const untrappedOracle = createNodeOracle(nodeTask(AMBIENT_SOURCE), {
          root: dir,
          ambient,
        });
        const untrapped = untrappedOracle(BASELINE);
        expect(untrapped.trapped).toBe(false);
        expect(untrapped.reads).toHaveLength(0);
        expect(untrapped.notes).toContain(
          "output moved under a shifted ambient with no recorded slot read",
        );

        const mixedSource = 'const mode = process.env.MODE; return mode + "|" + env.ambient.TICK;';
        const mixed = createNodeOracle(nodeTask(mixedSource), { root: dir, ambient });
        const mixedRun = mixed(BASELINE);
        expect(outputOf(mixedRun)).toBe("dev|1");
        expect(mixedRun.trapped).toBe(true);
      });
    });

    test("records existsSync and statSync like exists (1/0) from real files", () => {
      withProject((dir) => {
        const oracle = createNodeOracle(nodeTask(STAT_SOURCE), { root: dir });
        const run = oracle(BASELINE);
        expect(outputOf(run)).toBe("true,false,true");
        expect(readValue(run, "file:cfg.json")).toBe("1");
        expect(readValue(run, "file:missing.txt")).toBe("0");
        expect(readValue(run, "file:assets")).toBe("1");
      });
    });

    test("removes the mkdtemp project directory in finally", () => {
      let dir = "";
      try {
        dir = fs.mkdtempSync(join(tmpdir(), "keyfuse-"));
        fs.writeFileSync(join(dir, "cfg.json"), CFG_CONTENT, "utf8");
        expect(fs.existsSync(dir)).toBe(true);
      } finally {
        if (dir !== "") fs.rmSync(dir, { recursive: true, force: true });
      }
      expect(dir).not.toBe("");
      expect(fs.existsSync(dir)).toBe(false);
    });
  });
}
