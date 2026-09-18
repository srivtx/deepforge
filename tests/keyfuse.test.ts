import { describe, expect, it } from "bun:test";
import {
  KEYFUSE_CERTIFICATE,
  KEYFUSE_CERTIFICATE_TRUNCATED,
  KEYFUSE_MAX_SLOTS,
  assignmentWith,
  auditDigest,
  auditTask,
  baselineAssignment,
  buildCoverWithDefaults,
  buildCoveringArray,
  canonicalJson,
  collapse,
  createVirtualOracle,
  differingSlots,
  fnv1a32,
  hammingBallSize,
  keyfuseHash,
  keyfuseKey,
  minimizeRowSupport,
  slotName,
  slotValues,
  validateUniverse,
  verifyCoverage,
} from "@/lib/keyfuse";
import type {
  Assignment,
  Detection,
  ProbeRow,
  SlotSpec,
  SlotUniverse,
  TaskOracle,
  TracedEnv,
  VirtualTask,
} from "@/lib/keyfuse";

const STRENGTH = 2;

const bit = (value: string): number => (value === "1" ? 1 : 0);

function envUniverse(ids: readonly string[]): SlotUniverse {
  return {
    slots: ids.map(
      (id): SlotSpec => ({ kind: "env", id, baseline: "0", top: "1", ordered: true }),
    ),
  };
}

function baselineFromSpecs(universe: SlotUniverse): Assignment {
  const values: Record<string, string> = {};
  for (const spec of universe.slots) values[slotName(spec)] = spec.baseline;
  return values;
}

function makeTask(args: {
  readonly id: string;
  readonly universe: SlotUniverse;
  readonly declared?: readonly string[];
  readonly baseline?: Assignment;
  readonly run: (env: TracedEnv) => string;
}): VirtualTask {
  return {
    kind: "virtual",
    id: args.id,
    version: "1",
    declared: args.declared ?? [],
    universe: args.universe,
    baseline: args.baseline ?? baselineFromSpecs(args.universe),
    run: (env) => args.run(env),
  };
}

function andXorTask(universe: SlotUniverse, id = "inline-and-xor-c"): VirtualTask {
  return makeTask({
    id,
    universe,
    run: (env) => String((bit(env.env("A")) & bit(env.env("B"))) ^ bit(env.env("C"))),
  });
}

function maskUniverse(): SlotUniverse {
  return envUniverse(["A", "B", "C"]);
}

function sentinelMaskUniverse(): SlotUniverse {
  return {
    slots: [
      { kind: "env", id: "A", baseline: "0", top: "1", ordered: true },
      { kind: "env", id: "B", baseline: "0", top: "1", ordered: true },
      { kind: "env", id: "C", baseline: "0", top: "1", sentinels: ["2"], ordered: true },
    ],
  };
}

function monotoneOrAndTask(): VirtualTask {
  const ids = ["A", "B", "C", "D"];
  return makeTask({
    id: "inline-mono-or-and",
    universe: envUniverse(ids),
    declared: ids.map((id) => `env:${id}`),
    run: (env) => {
      const a = bit(env.env("A"));
      const b = bit(env.env("B"));
      const c = bit(env.env("C"));
      const d = bit(env.env("D"));
      return (a === 1 && b === 1) || (c === 1 && d === 1) ? "1" : "0";
    },
  });
}

function orAndTask(): VirtualTask {
  const ids = ["A", "B", "C"];
  return makeTask({
    id: "inline-or-and",
    universe: envUniverse(ids),
    declared: [],
    run: (env) => {
      const a = bit(env.env("A"));
      const b = bit(env.env("B"));
      const c = bit(env.env("C"));
      return a === 1 || (b === 1 && c === 1) ? "1" : "0";
    },
  });
}

function oracleOutput(oracle: TaskOracle, assignment: Assignment): string {
  const run = oracle(assignment);
  return run.outcome.ok ? run.outcome.output : "";
}

/**
 * Blueprint §4.2 `relevantT(t)` by brute force over the exact Hamming ball:
 * every non-baseline assignment within distance `t` of the baseline whose
 * output differs, and the slots differing in any of them.
 */
function groundTruthRelevant(task: VirtualTask, strength: number): readonly string[] {
  const oracle = createVirtualOracle(task);
  const baselineOutput = oracleOutput(oracle, task.baseline);
  const slots = new Set<string>();
  for (const assignment of buildCoverWithDefaults(task.universe, strength)) {
    if (oracleOutput(oracle, assignment) === baselineOutput) continue;
    for (const slot of differingSlots(assignment, task.baseline, task.universe)) {
      slots.add(slot);
    }
  }
  return [...slots].sort();
}

function throws(fn: () => unknown): boolean {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
}

function probeRowsFrom(
  oracle: TaskOracle,
  universe: SlotUniverse,
  baseline: Assignment,
  assignments: readonly Assignment[],
): readonly ProbeRow[] {
  const baselineOutput = oracleOutput(oracle, baseline);
  const rows: ProbeRow[] = [
    { index: 0, assignment: baseline, differing: [], output: baselineOutput, changed: false },
  ];
  for (const assignment of assignments) {
    const output = oracleOutput(oracle, assignment);
    rows.push({
      index: rows.length,
      assignment,
      differing: differingSlots(assignment, baseline, universe),
      output,
      changed: output !== baselineOutput,
    });
  }
  return rows;
}

function changedRowSlots(rows: readonly ProbeRow[]): readonly string[] {
  const names = new Set<string>();
  for (const row of rows) {
    if (!row.changed) continue;
    for (const slot of row.differing) names.add(slot);
  }
  return [...names].sort();
}

function detectedSlots(detections: readonly Detection[]): readonly string[] {
  return [...new Set(detections.map((detection) => detection.slot))].sort();
}

function deepFreeze(value: unknown): unknown {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) return value;
  const record = value as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(record)) deepFreeze(record[key]);
  return Object.freeze(record);
}

function taskSnapshot(task: VirtualTask): string {
  return canonicalJson({
    id: task.id,
    version: task.version,
    declared: task.declared,
    baseline: task.baseline,
    universe: task.universe,
  });
}

describe("keyfuse hash", () => {
  it("pins the fnv1a32 and keyfuseHash vectors", () => {
    expect(fnv1a32("keyfuse")).toBe(3705953689);
    expect(keyfuseHash("keyfuse")).toBe("6111dba22559686f");
    expect(keyfuseHash("keyfuse")).toMatch(/^[0-9a-f]{16}$/);
  });

  it("canonicalJson sorts keys recursively and normalizes negative zero", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: [1, -0] } })).toBe(
      '{"a":{"c":[1,0],"d":2},"b":1}',
    );
    expect(canonicalJson([{ z: true, a: null }, "x"])).toBe('[{"a":null,"z":true},"x"]');
  });

  it("canonicalJson rejects non-finite numbers", () => {
    expect(throws(() => canonicalJson(Number.NaN))).toBe(true);
    expect(throws(() => canonicalJson(Number.POSITIVE_INFINITY))).toBe(true);
    expect(throws(() => canonicalJson([1, { x: Number.NEGATIVE_INFINITY }]))).toBe(true);
  });

  it("auditDigest is stable across calls", () => {
    const task = andXorTask(maskUniverse());
    const oracle = createVirtualOracle(task);
    const result = auditTask(task, oracle, { strategy: "ca-ddmin", strength: STRENGTH });
    const { digest, ...rest } = result;
    expect(auditDigest(rest)).toBe(digest);
    expect(auditDigest(rest)).toBe(auditDigest(rest));
  });
});

describe("keyfuse slots", () => {
  it("forms singleton, env, file, and directory-listing names", () => {
    expect(slotName({ kind: "cwd", id: "", baseline: "/a", top: "/b" })).toBe("cwd");
    expect(slotName({ kind: "env", id: "X", baseline: "0", top: "1" })).toBe("env:X");
    expect(slotName({ kind: "file", id: "src/a.ts", baseline: "", top: "x" })).toBe(
      "file:src/a.ts",
    );
    expect(slotName({ kind: "file", id: "dir/", baseline: "", top: "a.cfg" })).toBe("file:dir/");
  });

  it("dedupes slot values with first occurrence kept", () => {
    expect(
      slotValues({ kind: "env", id: "X", baseline: "a", top: "b", sentinels: ["a", "c", "b"] }),
    ).toEqual(["a", "b", "c"]);
    expect(slotValues({ kind: "cwd", id: "", baseline: "x", top: "y" })).toEqual(["x", "y"]);
  });

  it("accepts a valid universe", () => {
    expect(validateUniverse(envUniverse(["A", "B"]))).toEqual([]);
  });

  it("flags duplicate names, empty baseline/top, and equal baseline/top", () => {
    const problems = validateUniverse({
      slots: [
        { kind: "env", id: "X", baseline: "0", top: "1" },
        { kind: "env", id: "X", baseline: "0", top: "0" },
        { kind: "env", id: "Y", baseline: "", top: "1" },
        { kind: "env", id: "Z", baseline: "0", top: "" },
      ],
    });
    expect(problems).toContain("duplicate slot name: env:X");
    expect(problems).toContain("slot env:X: baseline and top must differ");
    expect(problems).toContain("slot env:Y: baseline must be non-empty");
    expect(problems).toContain("slot env:Z: top must be non-empty");
  });

  it("flags the slot cap and ordered non-minimum baselines", () => {
    const many: SlotUniverse = {
      slots: Array.from({ length: KEYFUSE_MAX_SLOTS + 1 }, (_, index) => ({
        kind: "env" as const,
        id: `S${index}`,
        baseline: "0",
        top: "1",
      })),
    };
    expect(validateUniverse(many)).toContain(
      `universe has 13 slots; the maximum is ${KEYFUSE_MAX_SLOTS}`,
    );
    const ordered = validateUniverse({
      slots: [{ kind: "env", id: "N", baseline: "5", top: "3", ordered: true }],
    });
    expect(ordered.some((problem) => problem.includes("is not the minimum"))).toBe(true);
    const numeric = validateUniverse({
      slots: [{ kind: "env", id: "N", baseline: "10", top: "9", ordered: true }],
    });
    expect(numeric.some((problem) => problem.includes("is not the minimum"))).toBe(true);
  });

  it("builds baselines in universe order and assignmentWith without mutation", () => {
    const universe = envUniverse(["B", "A"]);
    expect(Object.keys(baselineAssignment(universe))).toEqual(["env:B", "env:A"]);
    const base: Assignment = { "env:A": "0" };
    const next = assignmentWith(base, { "env:B": "1", "env:Z": "9" });
    expect(next).toEqual({ "env:A": "0", "env:B": "1", "env:Z": "9" });
    expect(base).toEqual({ "env:A": "0" });
    expect(next).not.toBe(base);
  });

  it("differingSlots follows universe order and treats absence as a difference", () => {
    const universe = envUniverse(["A", "B", "C"]);
    expect(
      differingSlots({ "env:A": "1", "env:B": "0", "env:C": "0" }, { "env:A": "1" }, universe),
    ).toEqual(["env:B", "env:C"]);
    expect(differingSlots({ "env:A": "1" }, { "env:B": "1" }, universe)).toEqual([
      "env:A",
      "env:B",
    ]);
  });

  it("collapse resets every other coordinate and drops unknown keys", () => {
    const universe = envUniverse(["A", "B", "C"]);
    const collapsed = collapse({ "env:A": "1", "env:B": "1", extra: "9" }, "env:B", universe);
    expect(collapsed).toEqual({ "env:A": "0", "env:B": "1", "env:C": "0" });
    expect(collapse({ "env:A": "1" }, "missing", universe)).toEqual({
      "env:A": "0",
      "env:B": "0",
      "env:C": "0",
    });
  });
});

describe("keyfuse cover", () => {
  it("builds a complete 5-row strength-2 array for four binary slots", () => {
    const universe = envUniverse(["A", "B", "C", "D"]);
    const rows = buildCoveringArray(universe, 2);
    expect(rows).toHaveLength(5);
    expect(verifyCoverage(universe, 2, rows)).toEqual({ complete: true, missing: [] });
  });

  it("builds a complete 7-row strength-2 array for six binary slots", () => {
    const universe = envUniverse(["A", "B", "C", "D", "E", "F"]);
    const rows = buildCoveringArray(universe, 2);
    expect(rows).toHaveLength(7);
    expect(verifyCoverage(universe, 2, rows).complete).toBe(true);
  });

  it("reports missing tuples when a covering-array row is removed", () => {
    const universe = envUniverse(["A", "B", "C", "D"]);
    const rows = buildCoveringArray(universe, 2);
    const pruned = rows.filter((_, index) => index !== 3);
    const report = verifyCoverage(universe, 2, pruned);
    expect(report.complete).toBe(false);
    expect(report.missing).toHaveLength(1);
    expect(report.missing[0]).toContain("env:B");
    expect(report.missing[0]).toContain("env:D");
  });

  it("matches hammingBallSize with the exact cover-with-defaults rows", () => {
    const universe = envUniverse(["A", "B", "C", "D"]);
    expect(hammingBallSize(universe, 2)).toBe(10);
    expect(hammingBallSize(universe, 3)).toBe(14);
    expect(buildCoverWithDefaults(universe, 2)).toHaveLength(10);
    expect(buildCoverWithDefaults(universe, 3)).toHaveLength(14);
  });
});

describe("keyfuse adversarial masking (C1)", () => {
  it("misses the (a,b) support when rows are compared to the baseline", () => {
    const universe = maskUniverse();
    const task = andXorTask(universe);
    const oracle = createVirtualOracle(task);
    const hand: readonly Assignment[] = [
      { "env:A": "1", "env:B": "1", "env:C": "1" },
      { "env:A": "1", "env:B": "0", "env:C": "0" },
      { "env:A": "0", "env:B": "1", "env:C": "0" },
      { "env:A": "0", "env:B": "0", "env:C": "1" },
    ];
    expect(verifyCoverage(universe, 2, hand)).toEqual({ complete: true, missing: [] });

    const rows = probeRowsFrom(oracle, universe, task.baseline, hand);
    expect(rows).toHaveLength(5);
    const pairRow = rows.find(
      (row) => row.assignment["env:A"] === "1" && row.assignment["env:B"] === "1",
    );
    expect(pairRow).not.toBeUndefined();
    expect(pairRow!.changed).toBe(false);
    expect(changedRowSlots(rows)).toEqual(["env:C"]);
    expect(changedRowSlots(rows)).not.toContain("env:A");
    expect(changedRowSlots(rows)).not.toContain("env:B");
  });

  it("detects env:A and env:B with cover-with-defaults at strength 2", () => {
    const universe = maskUniverse();
    const task = andXorTask(universe);
    const oracle = createVirtualOracle(task);
    const audit = auditTask(task, oracle, {
      strategy: "cover-with-defaults",
      strength: STRENGTH,
    });
    expect(detectedSlots(audit.detections)).toEqual(["env:A", "env:B", "env:C"]);
    expect(audit.detections.every((detection) => detection.necessary)).toBe(true);
    expect(audit.certificate).toBe(KEYFUSE_CERTIFICATE);
    expect(audit.truncated).toBe(false);
  });
});

describe("keyfuse detection dedupe", () => {
  it("keeps the first detection per slot and repairs over the deduped set", () => {
    const task = andXorTask(maskUniverse());
    const oracle = createVirtualOracle(task);
    const audit = auditTask(task, oracle, {
      strategy: "cover-with-defaults",
      strength: STRENGTH,
    });
    const slots = audit.detections.map((detection) => detection.slot);
    expect(new Set(slots).size).toBe(slots.length);
    expect(audit.repair.implicated).toEqual(detectedSlots(audit.detections));
    expect(audit.repair.collisionWitnesses).toBeLessThanOrEqual(audit.detections.length);
    expect(audit.repair.separateWitnesses).toBeLessThanOrEqual(
      audit.repair.collisionWitnesses,
    );
  });
});

describe("keyfuse monotone theorem (C2)", () => {
  it("matches ground-truth <=t relevance with the exact arm on monotone tasks", () => {
    for (const task of [monotoneOrAndTask(), orAndTask()]) {
      const oracle = createVirtualOracle(task);
      for (const strength of [1, 2]) {
        const exact = auditTask(task, oracle, { strategy: "cover-with-defaults", strength });
        expect(detectedSlots(exact.detections)).toEqual(groundTruthRelevant(task, strength));
      }
    }
    const task = monotoneOrAndTask();
    const exact2 = auditTask(task, createVirtualOracle(task), {
      strategy: "cover-with-defaults",
      strength: 2,
    });
    expect(detectedSlots(exact2.detections)).toEqual(["env:A", "env:B", "env:C", "env:D"]);
  });

  it("attributes only exact detections and reports every miss (no silent drops)", () => {
    for (const task of [monotoneOrAndTask(), orAndTask()]) {
      const oracle = createVirtualOracle(task);
      for (const strength of [1, 2]) {
        const exact = auditTask(task, oracle, { strategy: "cover-with-defaults", strength });
        const ddmin = auditTask(task, oracle, { strategy: "ca-ddmin", strength });
        const exactSlots = detectedSlots(exact.detections);
        const ddminSlots = detectedSlots(ddmin.detections);
        for (const slot of ddminSlots) expect(exactSlots).toContain(slot);
        const missing = exactSlots.filter((slot) => !ddminSlots.includes(slot));
        if (missing.length > 0) {
          expect(ddmin.misses.length).toBeGreaterThan(0);
          expect(ddmin.misses.some((miss) => miss.includes("order exceeds strength"))).toBe(true);
        }
      }
    }
  });

  it("caps ca-ddmin attribution at the strength on A OR (B AND C) at t=1", () => {
    const task = orAndTask();
    const oracle = createVirtualOracle(task);
    const ddmin = auditTask(task, oracle, { strategy: "ca-ddmin", strength: 1 });
    expect(ddmin.detections).toHaveLength(0);
    expect(ddmin.truncated).toBe(false);
    expect(ddmin.misses).toContain(
      "detected effect requires >1 support at row 1 (order exceeds strength)",
    );

    const exact = auditTask(task, oracle, { strategy: "cover-with-defaults", strength: 1 });
    expect(detectedSlots(exact.detections)).toEqual(["env:A"]);

    const ca = auditTask(task, oracle, { strategy: "ca", strength: 1 });
    expect(detectedSlots(ca.detections)).toEqual(["env:A", "env:B", "env:C"]);
    expect(ca.detections.every((detection) => !detection.necessary)).toBe(true);
    expect(ca.detections.every((detection) => detection.minimized === null)).toBe(true);

    const ddmin2 = auditTask(task, oracle, { strategy: "ca-ddmin", strength: 2 });
    expect(detectedSlots(ddmin2.detections)).toEqual(["env:A", "env:B", "env:C"]);
    expect(ddmin2.detections.every((detection) => detection.necessary)).toBe(true);
    expect(
      ddmin2.detections.every(
        (detection) => detection.minimized !== null && detection.minimized.support.length <= 2,
      ),
    ).toBe(true);
  });

  it("differs from cover-with-defaults on a non-monotone XOR at t=2", () => {
    const ids = ["A", "B", "C"];
    const task = makeTask({
      id: "inline-xor-3way",
      universe: envUniverse(ids),
      run: (env) => {
        let ones = 0;
        for (const id of ids) ones += bit(env.env(id));
        return String(ones % 2);
      },
    });
    const oracle = createVirtualOracle(task);
    const exact = auditTask(task, oracle, { strategy: "cover-with-defaults", strength: 2 });
    const ca = auditTask(task, oracle, { strategy: "ca", strength: 2 });
    const ddmin = auditTask(task, oracle, { strategy: "ca-ddmin", strength: 2 });
    expect(detectedSlots(exact.detections)).toEqual(["env:A", "env:B", "env:C"]);
    expect(detectedSlots(ca.detections)).toEqual([]);
    expect(detectedSlots(ddmin.detections)).toEqual([]);
    expect(detectedSlots(ca.detections)).not.toEqual(detectedSlots(exact.detections));
  });
});

describe("keyfuse anchor counterexample (C5)", () => {
  const thresholdTask = (): VirtualTask => {
    const ids = ["A", "B", "C", "D"];
    return makeTask({
      id: "inline-threshold-3",
      universe: envUniverse(ids),
      run: (env) => {
        let nonBaseline = 0;
        for (const id of ids) if (env.env(id) !== "0") nonBaseline += 1;
        return nonBaseline >= 3 ? "1" : "0";
      },
    });
  };

  it("yields zero detections and the weak certificate", () => {
    const task = thresholdTask();
    const oracle = createVirtualOracle(task);
    const audit = auditTask(task, oracle, {
      strategy: "cover-with-defaults",
      strength: STRENGTH,
    });
    expect(audit.detections).toHaveLength(0);
    expect(audit.certificate).toBe(KEYFUSE_CERTIFICATE);
    expect(audit.truncated).toBe(false);
    expect(audit.repair.implicated).toEqual([]);
  });

  it("leaves the documented residual collision equal under the declared key", () => {
    const task = thresholdTask();
    const oracle = createVirtualOracle(task);
    const left: Assignment = { "env:A": "1", "env:B": "1", "env:C": "0", "env:D": "0" };
    const right: Assignment = { "env:A": "1", "env:B": "1", "env:C": "1", "env:D": "0" };
    expect(oracleOutput(oracle, left)).toBe("0");
    expect(oracleOutput(oracle, right)).toBe("1");
    expect(keyfuseKey(task, [], left)).toBe(keyfuseKey(task, [], right));
    expect(differingSlots(left, right, task.universe)).toEqual(["env:C"]);
  });
});

describe("keyfuse motivating counterexamples (C7)", () => {
  it("detects nothing for a AND b under baseline-toggle", () => {
    const ids = ["A", "B"];
    const task = makeTask({
      id: "inline-and-2way",
      universe: envUniverse(ids),
      run: (env) => ((bit(env.env("A")) & bit(env.env("B"))) === 1 ? "1" : "0"),
    });
    const oracle = createVirtualOracle(task);
    const toggle = auditTask(task, oracle, { strategy: "baseline-toggle" });
    expect(toggle.detections).toHaveLength(0);
    expect(toggle.probes.every((row) => !row.changed)).toBe(true);
    const exact = auditTask(task, oracle, { strategy: "cover-with-defaults", strength: 2 });
    expect(detectedSlots(exact.detections)).toEqual(["env:A", "env:B"]);
  });

  it("limits single-trace reads when only a.cfg exists", () => {
    const universe: SlotUniverse = {
      slots: [
        { kind: "file", id: "dir/", baseline: "a.cfg", top: "a.cfg\nb.cfg" },
        { kind: "file", id: "dir/a.cfg", baseline: "A", top: "A2" },
        { kind: "file", id: "dir/b.cfg", baseline: "", top: "B" },
      ],
    };
    const task = makeTask({
      id: "inline-dir-listing",
      universe,
      baseline: { "file:dir/": "a.cfg", "file:dir/a.cfg": "A", "file:dir/b.cfg": "" },
      run: (env) => {
        const names = env.listDir("dir");
        const parts: string[] = [];
        for (const name of names) parts.push(name + "=" + env.readFile("dir/" + name));
        return parts.join(";");
      },
    });
    const oracle = createVirtualOracle(task);
    const single = auditTask(task, oracle, { strategy: "single-trace" });
    expect(single.detections).toHaveLength(0);
    expect(single.tracedReads).toContain("file:dir/");
    expect(single.tracedReads).toContain("file:dir/a.cfg");
    expect(single.tracedReads).not.toContain("file:dir/b.cfg");

    const perturbed = assignmentWith(task.baseline, { "file:dir/": "a.cfg\nb.cfg" });
    expect(oracleOutput(oracle, perturbed)).toBe("a.cfg=A;b.cfg=");
    expect(oracle(perturbed).reads.map((read) => read.slot)).toContain("file:dir/b.cfg");
  });
});

describe("keyfuse minimizer (C9)", () => {
  it("stops early on a sentinel row and the exhaustive verifier catches it", () => {
    const task = andXorTask(sentinelMaskUniverse(), "inline-and-xor-sentinel");
    const oracle = createVirtualOracle(task);
    const assignment: Assignment = { "env:A": "1", "env:B": "1", "env:C": "2" };
    const output = oracleOutput(oracle, assignment);
    expect(output).toBe("1");
    const row: ProbeRow = {
      index: 1,
      assignment,
      differing: ["env:A", "env:B", "env:C"],
      output,
      changed: true,
    };
    const result = minimizeRowSupport({
      task,
      oracle,
      row,
      baselineOutput: "0",
      verifyMinimal: true,
      budget: 1_000,
    });
    expect(result.minimized.oneMinimal).toBe(false);
    expect(result.minimized.support).toEqual(["env:A", "env:B", "env:C"]);
    expect(result.minimized.passes).toBe(0);
    expect(result.minimized.verifyRuns).toBe(3);
    const withoutC = oracle({ "env:A": "1", "env:B": "1", "env:C": "0" });
    expect(withoutC.outcome.ok).toBe(true);
    if (withoutC.outcome.ok) expect(withoutC.outcome.output).toBe("1");
  });

  it("verifies a true 1-minimal support with verifyRuns equal to its size", () => {
    const task = andXorTask(sentinelMaskUniverse(), "inline-and-xor-sentinel");
    const oracle = createVirtualOracle(task);
    const assignment: Assignment = { "env:A": "1", "env:B": "1", "env:C": "0" };
    const output = oracleOutput(oracle, assignment);
    expect(output).toBe("1");
    const row: ProbeRow = {
      index: 1,
      assignment,
      differing: ["env:A", "env:B"],
      output,
      changed: true,
    };
    const result = minimizeRowSupport({
      task,
      oracle,
      row,
      baselineOutput: "0",
      verifyMinimal: true,
      budget: 1_000,
    });
    expect(result.minimized.oneMinimal).toBe(true);
    expect(result.minimized.support).toEqual(["env:A", "env:B"]);
    expect(result.minimized.verifyRuns).toBe(result.minimized.support.length);
  });
});

describe("keyfuse necessity", () => {
  it("emits non-necessary slots under ca but not under ca-ddmin", () => {
    const task = monotoneOrAndTask();
    const oracle = createVirtualOracle(task);
    const ca = auditTask(task, oracle, { strategy: "ca", strength: 1 });
    const ddmin = auditTask(task, oracle, { strategy: "ca-ddmin", strength: 1 });
    const falseImplicate = ca.detections.find(
      (detection) => detection.slot === "env:A" && !detection.necessary,
    );
    expect(falseImplicate).not.toBeUndefined();
    expect(falseImplicate!.witness.differing).toEqual(["env:A"]);
    expect(falseImplicate!.witness.outputLeft).toBe(falseImplicate!.witness.outputRight);
    expect(ca.detections).toHaveLength(4);
    expect(ca.detections.every((detection) => !detection.necessary)).toBe(true);
    expect(ddmin.detections).toHaveLength(0);
  });
});

describe("keyfuse determinism and digest", () => {
  it("produces identical digests for identical audit runs", () => {
    const task = andXorTask(maskUniverse());
    const first = auditTask(task, createVirtualOracle(task), {
      strategy: "ca-ddmin",
      strength: STRENGTH,
    });
    const second = auditTask(task, createVirtualOracle(task), {
      strategy: "ca-ddmin",
      strength: STRENGTH,
    });
    expect(second.digest).toBe(first.digest);
    expect(canonicalJson(second)).toBe(canonicalJson(first));
  });

  it("refuses a deliberately impure oracle", () => {
    const task = andXorTask(maskUniverse());
    let calls = 0;
    const impure: TaskOracle = () => {
      calls += 1;
      return {
        outcome: { ok: true, output: String(calls % 2) },
        reads: [],
        trapped: true,
        notes: [],
      };
    };
    const audit = auditTask(task, impure, { strategy: "ca-ddmin", strength: STRENGTH });
    expect(audit.deterministic).toBe(false);
    expect(audit.detections).toHaveLength(0);
    expect(audit.probes).toHaveLength(0);
    expect(audit.runs).toBe(4);
    expect(audit.misses).toEqual(["oracle nondeterministic at baseline"]);
    expect(audit.certificate).toBe(KEYFUSE_CERTIFICATE);
    expect(audit.repair.repairedInputs).toEqual([]);
  });
});

describe("keyfuse budget", () => {
  it("truncates, flips the certificate, and reports the budget miss", () => {
    const task = andXorTask(maskUniverse());
    const oracle = createVirtualOracle(task);
    const audit = auditTask(task, oracle, {
      strategy: "ca-ddmin",
      strength: STRENGTH,
      budget: 6,
    });
    expect(audit.runs).toBe(6);
    expect(audit.probes).toHaveLength(2);
    expect(audit.truncated).toBe(true);
    expect(audit.certificate).toBe(KEYFUSE_CERTIFICATE_TRUNCATED);
    expect(audit.misses).toContain("budget exhausted before coverage completed");
  });
});

describe("keyfuse input immutability", () => {
  it("audits a deep-frozen task without throwing or mutating it", () => {
    const task = deepFreeze(andXorTask(sentinelMaskUniverse(), "inline-frozen")) as VirtualTask;
    const before = taskSnapshot(task);
    const strategies = ["baseline-toggle", "single-trace", "ca", "ca-ddmin", "cover-with-defaults"] as const;
    for (const strategy of strategies) {
      expect(
        throws(() =>
          auditTask(task, createVirtualOracle(task), { strategy, strength: STRENGTH }),
        ),
      ).toBe(false);
    }
    expect(throws(() => buildCoveringArray(task.universe, 2))).toBe(false);
    expect(throws(() => buildCoverWithDefaults(task.universe, 2))).toBe(false);
    expect(throws(() => validateUniverse(task.universe))).toBe(false);
    expect(taskSnapshot(task)).toBe(before);
  });
});
