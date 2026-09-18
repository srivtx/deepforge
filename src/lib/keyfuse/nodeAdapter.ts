/**
 * KeyFuse Node facade adapter — the only file in this directory that touches
 * Node's filesystem.
 *
 * `createNodeOracle(task, {root, ambient})` turns a repo-authored `NodeTask`
 * fixture into a `TaskOracle` for scripts and tests. The fixture `source` is
 * evaluated as `new Function("fs", "process", "env", source)` and must return
 * its output (`task.entry` is corpus metadata, not an evaluated binding).
 * Repo-authored fixtures only: evaluating untrusted source is explicitly out
 * of scope by contract, and the fs facade exposes no writes, no subprocesses,
 * and no network. This module is Node-only and is never imported by the pure
 * engine or by browser code; `index.ts` deliberately does not re-export it.
 *
 * Recording resolver. One recorder per run implements the same read semantics
 * as `createVirtualOracle`'s recording facade: assignment value first, else
 * the universe baseline, else the empty string — or the exact NUL + "absent"
 * sentinel for env — and every read is appended to that run's `reads` list
 * with its slot name, in read order. The one difference is `file:`: instead of
 * resolving from the assignment, file reads are served from REAL files under
 * `root`, and the recorded slot is the path normalized relative to `root`
 * (`file:<rel>`; a directory listing is `file:<rel>/`; `root` itself is `.`).
 * The seeded `rng` draw is obtained through `createVirtualOracle`, so the
 * adapter cannot drift from the virtual generator without importing `./hash`,
 * which is not on this file's import list.
 *
 * fs facade. `readFileSync(path, encoding?)` returns the file content (UTF-8;
 * the encoding argument is accepted for signature compatibility and ignored),
 * `readdirSync(path)` returns the sorted names, `existsSync(path)` a boolean,
 * and `statSync(path)` a minimal `{isDirectory()}` object. Every path is
 * resolved under `root`; a path that normalizes outside `root` (`..` escape or
 * an absolute path elsewhere) throws a deterministic fixed-message error. The
 * containment check is lexical: a symlink inside `root` pointing outside is a
 * documented residual, out of scope for repo-authored fixtures.
 *
 * process facade. `{env: Proxy}` with a `get` trap that resolves through the
 * recorder's `env(name)`, so an absent variable is the same absence sentinel
 * the virtual adapter uses, never `undefined` and never confused with "".
 *
 * Ambient and trapping. With no `options.ambient` the oracle is `trapped:true`
 * by construction. With an ambient record, the fixture runs once normally and
 * once with every ambient value suffixed `~shift` (same keys) as the facade's
 * `ambient`; if the outputs differ while the normal run recorded no slot read,
 * the oracle sets `trapped:false` and notes it. This mirrors the virtual
 * adapter's one-sample check: evidence, not proof. A throwing fixture
 * (including a rejected path) yields `{ok:false, reason:"error"}` with the
 * reads recorded before the throw, and no shifted re-run is attempted; the
 * shifted re-run's reads are discarded.
 */

import {
  existsSync as realExistsSync,
  readdirSync as realReaddirSync,
  readFileSync as realReadFileSync,
  statSync as realStatSync,
} from "node:fs";
import { relative, resolve, sep } from "node:path";
import type {
  Assignment,
  NodeTask,
  OracleRun,
  SlotRead,
  SlotUniverse,
  TaskOracle,
  TracedEnv,
  VirtualTask,
} from "./types";
import { createVirtualOracle } from "./trace";

/** Fixed rejection message; the requested path is never echoed. */
const PATH_ESCAPE = "keyfuse node adapter: path escapes root";
const THREW_NOTE = "task source threw";
const SHIFT_THREW_NOTE = "shifted-ambient re-run threw";
const UNTRAPPED_NOTE = "output moved under a shifted ambient with no recorded slot read";

/** NUL-prefixed name no realistic assignment or universe declares. */
const ABSENT_PROBE = "\u0000keyfuse-node-absent-probe";

interface NodeFsFacade {
  readFileSync(path: string, encoding?: string): string;
  readdirSync(path: string): string[];
  existsSync(path: string): boolean;
  statSync(path: string): { isDirectory(): boolean };
}

interface NodeProcessFacade {
  readonly env: Record<string, string | undefined>;
}

type NodeEnvFacade = TracedEnv & { readonly ambient: Readonly<Record<string, string>> };

/** UTF-16 code-unit comparison; locale-independent by construction. */
function compareCodeUnit(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Same keys as `ambient`, every value suffixed; nothing added or dropped. */
function shiftEveryValue(
  ambient: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const shifted: Record<string, string> = {};
  for (const key of Object.keys(ambient)) {
    shifted[key] = `${ambient[key]}~shift`;
  }
  return shifted;
}

/**
 * The one nontrivial virtual resolution is the seeded rng draw; capture a
 * recording facade from `createVirtualOracle` so `rng()` here returns exactly
 * the virtual adapter's first mulberry32(fnv1a32("rng:" + value)) draw, and
 * reuse the same facade to read the exact env-absence sentinel.
 */
function captureVirtualEnv(universe: SlotUniverse, assignment: Assignment): TracedEnv {
  const captured: (TracedEnv | undefined)[] = [];
  const probe: VirtualTask = {
    kind: "virtual",
    id: "keyfuse-node-adapter-capture",
    version: "1",
    declared: [],
    universe,
    baseline: {},
    run: (env) => {
      captured.push(env);
      return "";
    },
  };
  createVirtualOracle(probe)(assignment);
  const env = captured[0];
  if (env === undefined) {
    throw new Error("keyfuse node adapter: virtual recorder capture failed");
  }
  return env;
}

interface NodeRecorder {
  readonly env: NodeEnvFacade;
  readonly fs: NodeFsFacade;
  readonly process: NodeProcessFacade;
}

/**
 * Build the single recording resolver for one run: file operations touch real
 * files under `root` and record normalized `file:` slots; env, cwd, locale,
 * timezone, rng, and clock resolve from the assignment with the virtual
 * adapter's precedence and record their slot names. The fs and process facades
 * are thin views over this one recorder, so `reads` is the complete read list.
 */
function createNodeRecorder(args: {
  readonly task: NodeTask;
  readonly assignment: Assignment;
  readonly root: string;
  readonly ambient: Readonly<Record<string, string>>;
  readonly reads: SlotRead[];
}): NodeRecorder {
  const { task, assignment, root, ambient, reads } = args;

  const baselines = new Map<string, string>();
  for (const spec of task.universe.slots) {
    baselines.set(spec.id === "" ? spec.kind : `${spec.kind}:${spec.id}`, spec.baseline);
  }

  const virtual = captureVirtualEnv(task.universe, assignment);
  const envAbsent = virtual.env(ABSENT_PROBE);

  const resolveSlot = (slot: string): string => {
    if (Object.prototype.hasOwnProperty.call(assignment, slot)) return assignment[slot];
    const baseline = baselines.get(slot);
    if (baseline !== undefined) return baseline;
    return slot.startsWith("env:") ? envAbsent : "";
  };

  const record = (slot: string, value: string): void => {
    reads.push({ slot, value });
  };

  const contained = (path: string): { absolute: string; relativePath: string } => {
    const absolute = resolve(root, path);
    if (absolute !== root && !absolute.startsWith(`${root}${sep}`)) {
      throw new Error(PATH_ESCAPE);
    }
    const rel = relative(root, absolute).split(sep).join("/");
    return { absolute, relativePath: rel === "" ? "." : rel };
  };

  const readFile = (path: string): string => {
    const { absolute, relativePath } = contained(path);
    const content = realReadFileSync(absolute, "utf8");
    record(`file:${relativePath}`, content);
    return content;
  };

  const listDir = (dir: string): readonly string[] => {
    const { absolute, relativePath } = contained(dir);
    const names = realReaddirSync(absolute);
    names.sort(compareCodeUnit);
    record(`file:${relativePath}/`, names.join("\n"));
    return names;
  };

  const exists = (path: string): boolean => {
    const { absolute, relativePath } = contained(path);
    const present = realExistsSync(absolute);
    record(`file:${relativePath}`, present ? "1" : "0");
    return present;
  };

  const stat = (path: string): { isDirectory(): boolean } => {
    const { absolute, relativePath } = contained(path);
    const present = realExistsSync(absolute);
    record(`file:${relativePath}`, present ? "1" : "0");
    const directory = present ? realStatSync(absolute).isDirectory() : false;
    return { isDirectory: () => directory };
  };

  const env: NodeEnvFacade = {
    readFile,
    listDir,
    exists,
    env(name: string): string {
      const slot = `env:${name}`;
      const value = resolveSlot(slot);
      record(slot, value);
      return value;
    },
    cwd(): string {
      const value = resolveSlot("cwd");
      record("cwd", value);
      return value;
    },
    locale(): string {
      const value = resolveSlot("locale");
      record("locale", value);
      return value;
    },
    timezone(): string {
      const value = resolveSlot("timezone");
      record("timezone", value);
      return value;
    },
    rng(): number {
      const value = resolveSlot("rng");
      record("rng", value);
      return virtual.rng();
    },
    now(): number {
      const value = resolveSlot("clock");
      record("clock", value);
      return Number(value);
    },
    ambient,
  };

  const fs: NodeFsFacade = {
    readFileSync: (path) => readFile(path),
    readdirSync: (path) => [...listDir(path)],
    existsSync: (path) => exists(path),
    statSync: (path) => stat(path),
  };

  const process: NodeProcessFacade = {
    env: new Proxy({} as Record<string, string | undefined>, {
      get: (_target, name) => (typeof name === "string" ? env.env(name) : undefined),
    }),
  };

  return { env, fs, process };
}

/**
 * The Node adapter: `new Function`-evaluated fixture in, `TaskOracle` out.
 * One oracle call is the normal run plus, when `options.ambient` is provided
 * and the normal run succeeded, one shifted-ambient re-run for the
 * untrapped-read check. See the module docblock for semantics and residuals.
 */
export function createNodeOracle(
  task: NodeTask,
  options: { readonly root: string; readonly ambient?: Readonly<Record<string, string>> },
): TaskOracle {
  const root = resolve(options.root);
  const ambient = options.ambient;

  type Fixture = (fs: NodeFsFacade, process: NodeProcessFacade, env: NodeEnvFacade) => unknown;

  let compiled: Fixture | null = null;

  const execute = (
    assignment: Assignment,
    runAmbient: Readonly<Record<string, string>>,
    reads: SlotRead[],
  ): { readonly ok: true; readonly output: string } | { readonly ok: false } => {
    try {
      if (compiled === null) {
        compiled = new Function("fs", "process", "env", task.source) as Fixture;
      }
      const fixture: Fixture = compiled;
      const recorder = createNodeRecorder({ task, assignment, root, ambient: runAmbient, reads });
      return { ok: true, output: String(fixture(recorder.fs, recorder.process, recorder.env)) };
    } catch {
      return { ok: false };
    }
  };

  return (assignment: Assignment): OracleRun => {
    const reads: SlotRead[] = [];
    const normal = execute(assignment, ambient ?? {}, reads);
    if (!normal.ok) {
      return {
        outcome: { ok: false, reason: "error" },
        reads,
        trapped: true,
        notes: [THREW_NOTE],
      };
    }

    const notes: string[] = [];
    let trapped = true;
    if (ambient !== undefined) {
      const shifted = execute(assignment, shiftEveryValue(ambient), []);
      if (!shifted.ok) {
        notes.push(SHIFT_THREW_NOTE);
      } else if (shifted.output !== normal.output && reads.length === 0) {
        trapped = false;
        notes.push(UNTRAPPED_NOTE);
      }
    }

    return { outcome: { ok: true, output: normal.output }, reads, trapped, notes };
  };
}
