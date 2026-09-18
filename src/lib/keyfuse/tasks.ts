/**
 * KeyFuse built-in corpus — the 24-task virtual corpus plus the Metro Node
 * fixture.
 *
 * Pure data and pure closures: the only import is the type-only `./types`, so
 * this module has zero runtime dependencies — no clock, no randomness (task
 * #21 excepted by design), no storage, no DOM, no network, and no Node
 * builtin. `KEYFUSE_TASKS` holds the blueprint §4.1 tasks in table order; the
 * id, declared list, slot universe, and baseline are frozen there, and each
 * task's decisive property is restated in its block comment.
 *
 * Conventions. A task receives the recording `TracedEnv` facade and the
 * ambient record and returns a string; every environment read goes through
 * the facade, so the trace is exact by construction. Boolean slots use
 * `"0"`/`"1"`, mode slots use `"dev"`/`"prod"`. A file's value is its content
 * in the `file:<path>` slot named by the read (`project.json`,
 * `metro.config.js`, `cfg`, `extra`, `config.json`). `ordered` is set only
 * where the blueprint calls for ordered domains (task #11). Two negative
 * controls are intentionally impure in the audit's terms: #21 advances a
 * closure counter on every call, and #22 answers from the ambient record
 * alone, both reading no facade slot.
 */

import type {
  Assignment,
  NodeTask,
  SlotSpec,
  SlotUniverse,
  VirtualTask,
} from "./types";

/** `kind:id`, with singleton kinds (id `""`) named by kind alone. */
function slotNameOf(spec: SlotSpec): string {
  return spec.id === "" ? spec.kind : `${spec.kind}:${spec.id}`;
}

/** All-baseline assignment over `universe`, keys in universe order. */
function baselineOf(universe: SlotUniverse): Assignment {
  const baseline: Record<string, string> = {};
  for (const spec of universe.slots) {
    baseline[slotNameOf(spec)] = spec.baseline;
  }
  return baseline;
}

/** Shared constructor, so every corpus task carries the frozen field shape. */
function virtualTask(
  id: string,
  slots: readonly SlotSpec[],
  declared: readonly string[],
  run: VirtualTask["run"],
): VirtualTask {
  const universe: SlotUniverse = { slots };
  return {
    kind: "virtual",
    id,
    version: "1",
    declared,
    universe,
    baseline: baselineOf(universe),
    run,
  };
}

/* ─────────────── combo-env (#1–#3) ─────────────── */

const METRO_ENV_1: readonly SlotSpec[] = [
  { kind: "env", id: "BUILD_MODE", baseline: "dev", top: "prod" },
  {
    kind: "env",
    id: "API_URL",
    baseline: "http://localhost:3000",
    top: "https://api.example.com",
  },
  {
    kind: "file",
    id: "project.json",
    baseline: '{"target":"web"}',
    top: '{"target":"native"}',
  },
];

const METRO_ENV_2: readonly SlotSpec[] = [
  { kind: "env", id: "BUILD_MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "MINIFY", baseline: "0", top: "1" },
  { kind: "file", id: "project.json", baseline: '{"target":"web"}', top: '{"target":"native"}' },
  { kind: "env", id: "UNUSED", baseline: "0", top: "1" },
];

const METRO_FILE_GATE: readonly SlotSpec[] = [
  {
    kind: "file",
    id: "metro.config.js",
    baseline: "module.exports = { cache: false };",
    top: "module.exports = { cache: true, plugin: 'remote' };",
  },
  { kind: "env", id: "BUILD_MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "REMOTE_CACHE", baseline: "0", top: "1" },
];

/* ─────────────── planted-2way (#4–#5) ─────────────── */

const FLAGS_ABCD: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "0", top: "1" },
  { kind: "env", id: "D", baseline: "0", top: "1" },
];

const FLAGS_ABCDE: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "0", top: "1" },
  { kind: "env", id: "D", baseline: "0", top: "1" },
  { kind: "env", id: "E", baseline: "0", top: "1" },
];

const FLAGS_ABC: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "0", top: "1" },
];

/* ─────────────── monotone (C2) (#10–#12) ─────────────── */

const OR_THRESHOLD: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "0", top: "1" },
  { kind: "env", id: "D", baseline: "0", top: "1" },
];

const MAX_THRESHOLD: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "2", sentinels: ["1"], ordered: true },
  { kind: "env", id: "B", baseline: "0", top: "2", sentinels: ["1"], ordered: true },
  { kind: "env", id: "C", baseline: "0", top: "2", sentinels: ["1"], ordered: true },
  { kind: "env", id: "D", baseline: "0", top: "2", sentinels: ["1"], ordered: true },
  { kind: "env", id: "E", baseline: "0", top: "2", sentinels: ["1"], ordered: true },
];

const AND_CHAIN: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "0", top: "1" },
  { kind: "env", id: "D", baseline: "0", top: "1" },
];

/* ─────────────── remaining families (#14–#24) ─────────────── */

const PORT_8080: readonly SlotSpec[] = [
  { kind: "env", id: "HOST", baseline: "localhost", top: "0.0.0.0" },
  { kind: "env", id: "PORT", baseline: "3000", top: "9090", sentinels: ["8080"] },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "REGION", baseline: "us-east-1", top: "eu-west-1" },
  { kind: "env", id: "TIMEOUT", baseline: "30", top: "60" },
  { kind: "env", id: "PROXY", baseline: "0", top: "1" },
];

const UNDECLARED_SECRET: readonly SlotSpec[] = [
  { kind: "env", id: "SECRET", baseline: "alpha", top: "omega" },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "REGION", baseline: "us-east-1", top: "eu-west-1" },
];

const COMBO_WITH_FILE: readonly SlotSpec[] = [
  { kind: "file", id: "cfg", baseline: "mode=loose", top: "mode=strict" },
  { kind: "file", id: "extra", baseline: "x", top: "y" },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "TAG", baseline: "none", top: "beta" },
];

const CWD_DEPENDENT: readonly SlotSpec[] = [
  { kind: "cwd", id: "", baseline: "/opt/acme/project", top: "/srv/acme/project" },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "REGION", baseline: "us-east-1", top: "eu-west-1" },
];

const LOCALE_TZ: readonly SlotSpec[] = [
  { kind: "locale", id: "", baseline: "C", top: "en_US.UTF-8" },
  { kind: "timezone", id: "", baseline: "UTC", top: "America/New_York" },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "REGION", baseline: "us-east-1", top: "eu-west-1" },
];

const EPOCH_GATED: readonly SlotSpec[] = [
  { kind: "clock", id: "", baseline: "1700000000000", top: "1800000000000" },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "REGION", baseline: "us-east-1", top: "eu-west-1" },
];

const SEED_GATED: readonly SlotSpec[] = [
  { kind: "rng", id: "", baseline: "seed-low", top: "seed-high" },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "REGION", baseline: "us-east-1", top: "eu-west-1" },
];

const NEGATIVE_FLAGS: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "0", top: "1" },
];

const AMBIENT_SLOTS: readonly SlotSpec[] = [
  { kind: "env", id: "SEED", baseline: "alpha", top: "beta" },
  { kind: "env", id: "MODE", baseline: "dev", top: "prod" },
  { kind: "env", id: "A", baseline: "0", top: "1" },
];

const CONTROL_FLAGS: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "0", top: "1" },
  { kind: "env", id: "D", baseline: "0", top: "1" },
];

const ALL_DECLARED: readonly SlotSpec[] = [
  { kind: "env", id: "A", baseline: "0", top: "1" },
  { kind: "env", id: "B", baseline: "0", top: "1" },
  { kind: "env", id: "C", baseline: "dev", top: "prod" },
  { kind: "file", id: "config.json", baseline: '{"mode":"a"}', top: '{"mode":"b"}' },
];

/**
 * The counter run for the negative control #21: every call advances module
 * state and returns a fresh string, so two audits of the same assignment
 * disagree and the determinism gate must refuse them. No facade slot is read.
 */
function counterRun(): VirtualTask["run"] {
  let calls = 0;
  return () => {
    calls += 1;
    return `tick:${calls}`;
  };
}

/**
 * The 24-task toy corpus from blueprint §4.1, in table order. Each block
 * names the family and the decisive property the evidence and gate rely on.
 */
export const KEYFUSE_TASKS: readonly VirtualTask[] = [
  // #1 combo-env — prod mode prefixes `prod:<API_URL>:<project.json>`, dev is
  // constant; API_URL is undeclared, so two prod assignments can share the
  // declared key while their outputs differ.
  virtualTask("metro-env-1", METRO_ENV_1, ["env:BUILD_MODE", "file:project.json"], (env) => {
    if (env.env("BUILD_MODE") !== "prod") return "dev";
    return `prod:${env.env("API_URL")}:${env.readFile("project.json")}`;
  }),

  // #2 combo-env — a 2-way gate (BUILD_MODE and MINIFY must both be top
  // before project.json is read) plus an unrelated no-dependence slot.
  virtualTask("metro-env-2", METRO_ENV_2, ["env:BUILD_MODE"], (env) => {
    const mode = env.env("BUILD_MODE");
    const minify = env.env("MINIFY");
    if (mode === "prod" && minify === "1") return `min:${env.readFile("project.json")}`;
    return "default";
  }),

  // #3 combo-env — the declared config file gates the undeclared
  // REMOTE_CACHE env read, so the baseline trace never sees that env slot.
  virtualTask(
    "metro-file-gate",
    METRO_FILE_GATE,
    ["file:metro.config.js"],
    (env) => {
      const cfg = env.readFile("metro.config.js");
      if (cfg.includes("plugin: 'remote'")) return `remote:${env.env("REMOTE_CACHE")}`;
      return `local:${env.env("BUILD_MODE")}`;
    },
  ),

  // #4 planted-2way — f = A AND B; a strength-1 probe cannot see B, a
  // strength-2 probe can.
  virtualTask("and-2way", FLAGS_ABCD, ["env:A"], (env) => {
    return env.env("A") === "1" && env.env("B") === "1" ? "1" : "0";
  }),

  // #5 planted-2way — f = A XOR B; both slots flip the output from baseline.
  virtualTask("xor-2way", FLAGS_ABCD, ["env:A"], (env) => {
    return (env.env("A") === "1") !== (env.env("B") === "1") ? "1" : "0";
  }),

  // #6 planted-3way — f = A AND B AND C; strength 2 must miss C, strength 3
  // must find it.
  virtualTask("and-3way", FLAGS_ABCDE, ["env:A"], (env) => {
    const a = env.env("A") === "1";
    const b = env.env("B") === "1";
    const c = env.env("C") === "1";
    return a && b && c ? "1" : "0";
  }),

  // #7 planted-3way — f = majority(A,B,C); any two top slots flip the
  // output, C is only necessary in a one-of-two context.
  virtualTask("maj-3way", FLAGS_ABCDE, ["env:A"], (env) => {
    const a = env.env("A") === "1";
    const b = env.env("B") === "1";
    const c = env.env("C") === "1";
    const ones = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    return ones >= 2 ? "1" : "0";
  }),

  // #8 masking (C1) — f = (a AND b) XOR c; a strength-2 array that realizes
  // (a=1,b=1) only with c=1 misses the masked pair.
  virtualTask("and-xor-c", FLAGS_ABC, [], (env) => {
    const a = env.env("A") === "1";
    const b = env.env("B") === "1";
    const c = env.env("C") === "1";
    return (a && b) !== c ? "1" : "0";
  }),

  // #9 masking (C1) — f = (a OR b) AND NOT c; c neutralizes the pair's
  // effect, so an array realizing the pair only alongside c=1 misses it.
  virtualTask("or-and-not", FLAGS_ABCD, [], (env) => {
    const a = env.env("A") === "1";
    const b = env.env("B") === "1";
    const c = env.env("C") === "1";
    return (a || b) && !c ? "1" : "0";
  }),

  // #10 monotone (C2) — OR threshold over four flags; a strength-t covering
  // array is exact here.
  virtualTask("or-threshold", OR_THRESHOLD, ["env:A", "env:B", "env:C", "env:D"], (env) => {
    const a = env.env("A") === "1";
    const b = env.env("B") === "1";
    const c = env.env("C") === "1";
    const d = env.env("D") === "1";
    return a || b || c || d ? "1" : "0";
  }),

  // #11 monotone (C2) — maximum of five ordered levels reaches the top
  // threshold 2; baseline is the minimum, sentinel level 1 alone does not
  // change the output.
  virtualTask("max-threshold", MAX_THRESHOLD, [
    "env:A",
    "env:B",
    "env:C",
    "env:D",
    "env:E",
  ], (env) => {
    const level = Math.max(
      Number(env.env("A")),
      Number(env.env("B")),
      Number(env.env("C")),
      Number(env.env("D")),
      Number(env.env("E")),
    );
    return level >= 2 ? "1" : "0";
  }),

  // #12 monotone (C2) — conjunction chain over four flags.
  virtualTask("and-chain", AND_CHAIN, ["env:A", "env:B", "env:C", "env:D"], (env) => {
    const a = env.env("A") === "1";
    const b = env.env("B") === "1";
    const c = env.env("C") === "1";
    const d = env.env("D") === "1";
    return a && b && c && d ? "1" : "0";
  }),

  // #13 anchor (C5) — f = 1 iff at least 3 of 4 slots are non-baseline; every
  // slot is globally relevant but no <=2-support displacement changes the
  // output, so (1100) and (1110) remain a documented collision.
  virtualTask("threshold-3", CONTROL_FLAGS, [], (env) => {
    const ones =
      (env.env("A") === "1" ? 1 : 0) +
      (env.env("B") === "1" ? 1 : 0) +
      (env.env("C") === "1" ? 1 : 0) +
      (env.env("D") === "1" ? 1 : 0);
    return ones >= 3 ? "1" : "0";
  }),

  // #14 value-specific (C8) — f = 1 iff PORT equals the sentinel "8080";
  // baseline/top alone never change the output, so a binary probe misses it.
  virtualTask("port-8080", PORT_8080, ["env:HOST"], (env) => {
    return env.env("PORT") === "8080" ? "1" : "0";
  }),

  // #15 env-only — one undeclared env var decides the output and no file is
  // read, so a file tracer sees nothing.
  virtualTask("undeclared-secret", UNDECLARED_SECRET, [], (env) => {
    return env.env("SECRET") === "omega" ? "exposed" : "sealed";
  }),

  // #16 env-only — the declared file gates the undeclared MODE env read; the
  // baseline trace contains only file: names, yet the audit detects the env.
  virtualTask("combo-with-file", COMBO_WITH_FILE, ["file:cfg"], (env) => {
    const cfg = env.readFile("cfg");
    const extra = env.readFile("extra");
    if (cfg.includes("strict")) return `strict:${env.env("MODE")}:${extra}`;
    return `loose:${extra}`;
  }),

  // #17 cwd — the cwd path selects the branch and MODE is declared.
  virtualTask("cwd-dependent", CWD_DEPENDENT, ["env:MODE"], (env) => {
    const dir = env.cwd();
    const mode = env.env("MODE");
    if (dir.startsWith("/srv/")) return `server:${mode}`;
    return `local:${mode}`;
  }),

  // #18 locale-tz — locale and timezone shape the output and no file tracing
  // can see either slot.
  virtualTask("locale-tz", LOCALE_TZ, ["env:MODE"], (env) => {
    return `${env.env("MODE")}|${env.locale()}|${env.timezone()}`;
  }),

  // #19 clock — the clock slot gates the output branch and is a pure
  // function of the assignment.
  virtualTask("epoch-gated", EPOCH_GATED, ["env:MODE"], (env) => {
    const epoch = env.now();
    const mode = env.env("MODE");
    if (epoch >= 1800000000000) return `fresh:${mode}`;
    return `stale:${mode}`;
  }),

  // #20 rng — the seeded draw gates the output branch; both seeds are pure
  // functions of the assignment value.
  virtualTask("seed-gated", SEED_GATED, ["env:MODE"], (env) => {
    const draw = env.rng();
    const mode = env.env("MODE");
    if (draw >= 0.5) return `hi:${mode}`;
    return `lo:${mode}`;
  }),

  // #21 negative — intentionally nondeterministic via a closure counter; the
  // determinism gate must refuse before probing and read no facade slot.
  virtualTask("nondeterministic-counter", NEGATIVE_FLAGS, [], counterRun()),

  // #22 negative — answers from the ambient record only. The output is
  // invariant over every in-universe value but moves when the adapter
  // suffixes ambient values for its shifted re-run, so the audit records an
  // untrapped-read miss and no implicate.
  virtualTask("untrappable-ambient", AMBIENT_SLOTS, [], (_env, ambient) => {
    const seed = ambient["env:SEED"] ?? "";
    return seed.endsWith("~shift") ? "moved" : "steady";
  }),

  // #23 control — constant output with every slot declared; zero detections,
  // zero false implicates.
  virtualTask("no-dependence", CONTROL_FLAGS, ["env:A", "env:B", "env:C", "env:D"], () => {
    return "stable";
  }),

  // #24 control — every real dependence is declared, so the repaired key
  // input set equals the declared set.
  virtualTask("all-declared", ALL_DECLARED, [
    "env:A",
    "env:B",
    "env:C",
    "file:config.json",
  ], (env) => {
    return `${env.env("A")}|${env.env("B")}|${env.env("C")}|${env.readFile("config.json")}`;
  }),
];

/** The Metro Node fixture: same shape as `metro-env-1`, read through `fs`. */
const METRO_NODE_UNIVERSE: SlotUniverse = {
  slots: [
    { kind: "env", id: "BUILD_MODE", baseline: "dev", top: "prod" },
    {
      kind: "env",
      id: "API_URL",
      baseline: "http://localhost:3000",
      top: "https://api.example.com",
    },
    {
      kind: "file",
      id: "metro.config.js",
      baseline: "module.exports = { cache: false };",
      top: "module.exports = { cache: true };",
    },
  ],
};

/**
 * The Node facade counterpart to `metro-env-1`: its `source` is a function
 * body evaluated by the Node adapter as `new Function("fs", "process", "env",
 * source)`, reading the real config file under the adapter root through the
 * injected `fs` facade and env values through the `process.env` proxy. The
 * file slot is `metro.config.js` because that is the path the fixture reads;
 * `env:API_URL` stays undeclared, as in the virtual task.
 */
export const METRO_NODE_TASK: NodeTask = {
  kind: "node",
  id: "metro-node-1",
  version: "1",
  declared: ["env:BUILD_MODE", "file:metro.config.js"],
  universe: METRO_NODE_UNIVERSE,
  baseline: baselineOf(METRO_NODE_UNIVERSE),
  entry: "main",
  source: [
    'const cfg = fs.readFileSync("metro.config.js", "utf8");',
    'const mode = process.env.BUILD_MODE ?? "";',
    'const api = process.env.API_URL ?? "";',
    'return mode === "prod" ? "prod:" + api + ":" + cfg.trim() : "dev:" + cfg.trim();',
  ].join("\n"),
};

/** First virtual task with `id`, or `undefined` when the id is unknown. */
export function getKeyFuseTask(id: string): VirtualTask | undefined {
  for (const task of KEYFUSE_TASKS) {
    if (task.id === id) return task;
  }
  return undefined;
}
