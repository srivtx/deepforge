#!/usr/bin/env bun
/**
 * KeyFuse wave-43 evidence harness — ground truth, strategy metrics, and the
 * five decisive experiments from blueprint §4.2–§4.3.
 *
 *   bun run scripts/keyfuse-evidence.ts [--verbose]
 *
 * Deterministic, offline, and portable: Bun/Node built-ins only (node:os,
 * node:fs, node:path); the KeyFuse engine is imported through its public
 * surface. The script brute-forces the full product of `slotValues` per slot
 * (n <= 12; the port task adds one sentinel), runs every strategy at strengths
 * 1/2/3 over the 24-task corpus, writes `keyfuse-evidence.json` under
 * `DF_KEYFUSE_SCRATCH ?? join(tmpdir(), "deepforge-keyfuse-evidence")` (in a
 * fresh `mkdtempSync` directory under that root), and prints a table plus the
 * experiment summaries. No timestamps, wall-clock values, network, servers, or
 * absolute paths enter the JSON; the artifact is byte-stable because the
 * digest is `keyfuseHash(canonicalJson(payload))` over the payload without
 * itself, and the file is written with `canonicalJson` too.
 *
 * Definitions used here (frozen names from §4.4):
 * - `relevantT(t)`: slots i that are a necessary coordinate of some
 *   <=t-support baseline effect: there is an assignment a with non-empty
 *   support supp(a - baseline), |supp| <= t, i in supp, output(a) differing
 *   from the baseline output, and resetting coordinate i back to baseline
 *   (every other coordinate kept at a's value, the C6/§2.3 necessity the
 *   exact arm checks) changing output(a). A merely co-toggling slot is not
 *   relevant.
 * - `relevantGlobal`: the same necessity existential over all assignments,
 *   with no Hamming cap.
 * - `exactArmEquality`: per task/strength, `cover-with-defaults` detections
 *   set-equal to `relevantT(t)`; every remaining mismatch is listed, not
 *   suppressed.
 * - `collision pairs`: unordered assignment pairs with equal declared-key
 *   inputs and different outputs, enumerated exactly over the product (with a
 *   safety cap far above the corpus sizes; the corpus never reaches it).
 * - `detected`: `audit.detections` slots, except `single-trace`, whose
 *   detected set is `audit.tracedReads` (it claims no dependence).
 * - `missedRelevant`: relevantT(strength) slots absent from `detected`
 *   (denominator = relevantT size).
 * - `falseImplicates`: detected slots absent from `relevantGlobal`.
 * - `collisionsRemaining`: enumerated collision pairs whose two repaired keys
 *   (over `declared ∪ implicated`) are still equal.
 * - `probes` / `runs`: `audit.probes.length` / `audit.runs`.
 * - `witnessesVerified`: detections whose recorded witness is a verified
 *   1-minimal minimized witness, or (exact/toggle arms) a context-necessary
 *   single-slot pair with differing outputs.
 * - `certificateMisses`: `audit.misses.length`.
 *
 * Anchor honesty for `threshold-3` (§4.1/C5) is reported three ways, none of
 * them suppressed: the exhaustive count of collision pairs that remain equal
 * under the repaired key, the same count restricted to Hamming-distance-1
 * (minimal) pairs, and the single pair the corpus documents, `(1100)` vs
 * `(1110)`, checked field by field. The blueprint's `residualCollisionPairs`
 * gate of 1 matches the documented pair, not the exhaustive pair count, so
 * both are printed and stored.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  auditTask,
  canonicalJson,
  createVirtualOracle,
  hammingBallSize,
  KEYFUSE_EXACT_MAX_ROWS,
  KEYFUSE_MARK,
  KEYFUSE_VERSION,
  keyfuseHash,
  keyfuseKey,
  slotName,
  slotValues,
  type Assignment,
  type AuditResult,
  type OracleRun,
  type ProbeStrategy,
  type VirtualTask,
} from "../src/lib/keyfuse";
import {
  KEYFUSE_TASKS,
  METRO_NODE_TASK,
  getKeyFuseTask,
} from "../src/lib/keyfuse/tasks";
import { createNodeOracle } from "../src/lib/keyfuse/nodeAdapter";

const STRATEGIES: readonly ProbeStrategy[] = [
  "baseline-toggle",
  "single-trace",
  "ca",
  "ca-ddmin",
  "cover-with-defaults",
];
const STRENGTHS: readonly number[] = [1, 2, 3];
const PLANTED_IDS: readonly string[] = ["and-2way", "xor-2way", "and-3way", "maj-3way"];
const FILE_TRACE_IDS: readonly string[] = ["undeclared-secret", "combo-with-file"];
const NEGATIVE_IDS: readonly string[] = ["nondeterministic-counter", "untrappable-ambient"];
const FAMILY_BY_TASK: Readonly<Record<string, string>> = {
  "metro-env-1": "combo-env",
  "metro-env-2": "combo-env",
  "metro-file-gate": "combo-env",
  "and-2way": "planted-2way",
  "xor-2way": "planted-2way",
  "and-3way": "planted-3way",
  "maj-3way": "planted-3way",
  "and-xor-c": "masking",
  "or-and-not": "masking",
  "or-threshold": "monotone",
  "max-threshold": "monotone",
  "and-chain": "monotone",
  "threshold-3": "anchor",
  "port-8080": "value-specific",
  "undeclared-secret": "env-only",
  "combo-with-file": "env-only",
  "cwd-dependent": "cwd",
  "locale-tz": "locale-tz",
  "epoch-gated": "clock",
  "seed-gated": "rng",
  "nondeterministic-counter": "negative",
  "untrappable-ambient": "negative",
  "no-dependence": "control",
  "all-declared": "control",
};

const MAX_PRODUCT_ROWS = 1 << 20;
const MAX_COLLISION_PAIRS = 1 << 22;
const SEP = "\u0001";
const VERBOSE = process.argv.includes("--verbose");

function familyOf(taskId: string): string {
  return FAMILY_BY_TASK[taskId] ?? "unknown";
}

function outcomeText(run: OracleRun): string {
  return run.outcome.ok ? run.outcome.output : `<error:${run.outcome.reason}>`;
}

function assignmentDistance(a: Assignment, b: Assignment, names: readonly string[]): number {
  let distance = 0;
  for (const name of names) {
    if ((a[name] ?? "") !== (b[name] ?? "")) distance += 1;
  }
  return distance;
}

function declaredEqual(a: Assignment, b: Assignment, declared: readonly string[]): boolean {
  for (const name of declared) {
    if ((a[name] ?? "") !== (b[name] ?? "")) return false;
  }
  return true;
}

function detectionSlots(audit: AuditResult): readonly string[] {
  return audit.strategy === "single-trace"
    ? [...audit.tracedReads]
    : audit.detections.map((detection) => detection.slot);
}

/* ─────────────────────────── ground truth ─────────────────────────── */

interface GroundRow {
  readonly assignment: Assignment;
  readonly output: string;
  readonly differing: readonly string[];
  readonly distance: number;
  readonly cacheKey: string;
}

interface CollisionPairSample {
  readonly left: Assignment;
  readonly right: Assignment;
  readonly outputLeft: string;
  readonly outputRight: string;
}

interface GroundTruthRecord {
  readonly task: string;
  readonly family: string;
  readonly slots: readonly string[];
  readonly productSize: number;
  readonly binaryProductSize: number;
  readonly deterministic: boolean;
  readonly baselineOutput: string;
  readonly relevantT1: readonly string[];
  readonly relevantT2: readonly string[];
  readonly relevantT3: readonly string[];
  readonly relevantGlobal: readonly string[];
  readonly collisionPairCount: number;
  readonly collisionPairsTruncated: boolean;
  readonly collisionPairSamples: readonly CollisionPairSample[];
  residual: ResidualAnchorRecord | null;
}

interface GroundTruthInternal {
  readonly record: GroundTruthRecord;
  readonly names: readonly string[];
  readonly rows: readonly GroundRow[];
  readonly pairs: readonly (readonly [number, number])[];
  readonly baselineOutput: string;
}

function relevantFor(gt: GroundTruthInternal, strength: number): readonly string[] {
  if (strength <= 1) return gt.record.relevantT1;
  if (strength === 2) return gt.record.relevantT2;
  return gt.record.relevantT3;
}

function buildGroundTruth(task: VirtualTask): GroundTruthInternal {
  const specs = task.universe.slots;
  const names = specs.map(slotName);
  const valuesPerSlot = specs.map((spec) => [...slotValues(spec)]);
  let productSize = 1;
  for (const values of valuesPerSlot) productSize *= values.length;
  const rowCount = Math.min(productSize, MAX_PRODUCT_ROWS);

  const oracle = createVirtualOracle(task);
  const baselineOutput = outcomeText(oracle(task.baseline));
  const deterministic = outcomeText(oracle(task.baseline)) === baselineOutput;

  const rows: GroundRow[] = [];
  const outputByCacheKey = new Map<string, string>();
  const indices = new Array<number>(specs.length).fill(0);

  for (let count = 0; count < rowCount; count += 1) {
    const values = new Array<string>(specs.length);
    for (let i = 0; i < specs.length; i += 1) values[i] = valuesPerSlot[i][indices[i]];
    const assignment: Record<string, string> = {};
    for (let i = 0; i < names.length; i += 1) assignment[names[i]] = values[i];
    const cacheKey = values.join(SEP);
    const output = count === 0 ? baselineOutput : outcomeText(oracle(assignment));
    const differing = names.filter((name, i) => values[i] !== (task.baseline[name] ?? ""));
    rows.push({ assignment, output, differing, distance: differing.length, cacheKey });
    outputByCacheKey.set(cacheKey, output);
    for (let i = specs.length - 1; i >= 0; i -= 1) {
      indices[i] += 1;
      if (indices[i] < valuesPerSlot[i].length) break;
      indices[i] = 0;
    }
  }

  const relevantGlobal = new Set<string>();
  const relevantTs: [Set<string>, Set<string>, Set<string>] = [new Set(), new Set(), new Set()];
  for (const row of rows) {
    if (row.output === baselineOutput) continue;
    for (const name of row.differing) {
      const removed: Record<string, string> = {
        ...row.assignment,
        [name]: task.baseline[name] ?? "",
      };
      const removedKey = names.map((slot) => removed[slot] ?? "").join(SEP);
      const removedOutput = outputByCacheKey.get(removedKey);
      if (removedOutput === undefined || removedOutput === row.output) continue;
      relevantGlobal.add(name);
      for (let t = row.distance; t <= 3; t += 1) relevantTs[t - 1].add(name);
    }
  }

  const pairs: [number, number][] = [];
  let collisionPairsTruncated = false;
  for (let i = 0; i < rows.length && !collisionPairsTruncated; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      if (pairs.length >= MAX_COLLISION_PAIRS) {
        collisionPairsTruncated = true;
        break;
      }
      const left = rows[i];
      const right = rows[j];
      if (left.output === right.output) continue;
      if (declaredEqual(left.assignment, right.assignment, task.declared)) pairs.push([i, j]);
    }
  }

  const samples: CollisionPairSample[] = pairs.slice(0, 3).map(([i, j]) => ({
    left: rows[i].assignment,
    right: rows[j].assignment,
    outputLeft: rows[i].output,
    outputRight: rows[j].output,
  }));

  const record: GroundTruthRecord = {
    task: task.id,
    family: familyOf(task.id),
    slots: names,
    productSize,
    binaryProductSize: 2 ** specs.length,
    deterministic,
    baselineOutput,
    relevantT1: [...relevantTs[0]].sort(),
    relevantT2: [...relevantTs[1]].sort(),
    relevantT3: [...relevantTs[2]].sort(),
    relevantGlobal: [...relevantGlobal].sort(),
    collisionPairCount: pairs.length,
    collisionPairsTruncated,
    collisionPairSamples: samples,
    residual: null,
  };

  return { record, names, rows, pairs, baselineOutput };
}

/* ─────────────────────────── metrics ─────────────────────────── */

interface TaskMetrics {
  readonly task: string;
  readonly family: string;
  readonly strategy: ProbeStrategy;
  readonly strength: number;
  readonly skipped: boolean;
  readonly detected: readonly string[];
  readonly detectedCount: number;
  readonly relevantT: readonly string[];
  readonly missedRelevant: readonly string[];
  readonly missedRelevantCount: number;
  readonly falseImplicates: readonly string[];
  readonly falseImplicatesCount: number;
  readonly collisionPairs: number;
  readonly collisionsRemaining: number;
  readonly probes: number;
  readonly runs: number;
  readonly witnessesVerified: number;
  readonly certificateMisses: number;
  readonly misses: readonly string[];
  readonly deterministic: boolean;
  readonly trapped: boolean;
  readonly truncated: boolean;
  readonly certificate: string;
  readonly repairedInputs: readonly string[];
  readonly digest: string | null;
}

function computeTaskMetrics(
  task: VirtualTask,
  gt: GroundTruthInternal,
  audit: AuditResult,
): TaskMetrics {
  const detected = detectionSlots(audit);
  const detectedSet = new Set(detected);
  const relevant = relevantFor(gt, audit.strength);
  const missedRelevant = relevant.filter((slot) => !detectedSet.has(slot));
  const globalSet = new Set(gt.record.relevantGlobal);
  const falseImplicates = detected.filter((slot) => !globalSet.has(slot));

  const keyCache = new Map<string, string>();
  const keyOf = (row: GroundRow): string => {
    const cached = keyCache.get(row.cacheKey);
    if (cached !== undefined) return cached;
    const key = keyfuseKey(task, audit.repair.repairedInputs, row.assignment);
    keyCache.set(row.cacheKey, key);
    return key;
  };
  let collisionsRemaining = 0;
  for (const [i, j] of gt.pairs) {
    if (keyOf(gt.rows[i]) === keyOf(gt.rows[j])) collisionsRemaining += 1;
  }

  let witnessesVerified = 0;
  for (const detection of audit.detections) {
    const single =
      detection.witness.differing.length === 1
      && detection.witness.outputLeft !== detection.witness.outputRight;
    const verified =
      detection.minimized !== null
        ? detection.minimized.oneMinimal
        : detection.necessary && single;
    if (verified) witnessesVerified += 1;
  }

  return {
    task: task.id,
    family: familyOf(task.id),
    strategy: audit.strategy,
    strength: audit.strength,
    skipped: false,
    detected,
    detectedCount: detected.length,
    relevantT: [...relevant],
    missedRelevant,
    missedRelevantCount: missedRelevant.length,
    falseImplicates,
    falseImplicatesCount: falseImplicates.length,
    collisionPairs: gt.pairs.length,
    collisionsRemaining,
    probes: audit.probes.length,
    runs: audit.runs,
    witnessesVerified,
    certificateMisses: audit.misses.length,
    misses: [...audit.misses],
    deterministic: audit.deterministic,
    trapped: audit.trapped,
    truncated: audit.truncated,
    certificate: audit.certificate,
    repairedInputs: [...audit.repair.repairedInputs],
    digest: audit.digest,
  };
}

function skippedMetrics(task: VirtualTask, strategy: ProbeStrategy, strength: number): TaskMetrics {
  return {
    task: task.id,
    family: familyOf(task.id),
    strategy,
    strength,
    skipped: true,
    detected: [],
    detectedCount: 0,
    relevantT: [],
    missedRelevant: [],
    missedRelevantCount: 0,
    falseImplicates: [],
    falseImplicatesCount: 0,
    collisionPairs: 0,
    collisionsRemaining: 0,
    probes: 0,
    runs: 0,
    witnessesVerified: 0,
    certificateMisses: 0,
    misses: [],
    deterministic: false,
    trapped: false,
    truncated: false,
    certificate: "",
    repairedInputs: [],
    digest: null,
  };
}

interface FamilyMetrics {
  readonly strategy: ProbeStrategy;
  readonly strength: number;
  readonly family: string;
  readonly tasks: number;
  readonly skipped: number;
  readonly relevantTotal: number;
  readonly missedRelevant: number;
  readonly falseImplicates: number;
  readonly collisionPairs: number;
  readonly collisionsRemaining: number;
  readonly probes: number;
  readonly runs: number;
  readonly witnessesVerified: number;
  readonly certificateMisses: number;
  readonly detectedTotal: number;
}

function aggregateFamilies(rows: readonly TaskMetrics[]): Record<string, FamilyMetrics> {
  const out: Record<string, FamilyMetrics> = {};
  for (const row of rows) {
    const key = `${row.family}|${row.strategy}|${row.strength}`;
    const current = out[key] ?? {
      strategy: row.strategy,
      strength: row.strength,
      family: row.family,
      tasks: 0,
      skipped: 0,
      relevantTotal: 0,
      missedRelevant: 0,
      falseImplicates: 0,
      collisionPairs: 0,
      collisionsRemaining: 0,
      probes: 0,
      runs: 0,
      witnessesVerified: 0,
      certificateMisses: 0,
      detectedTotal: 0,
    };
    const next: FamilyMetrics = {
      strategy: current.strategy,
      strength: current.strength,
      family: current.family,
      tasks: current.tasks + (row.skipped ? 0 : 1),
      skipped: current.skipped + (row.skipped ? 1 : 0),
      relevantTotal: current.relevantTotal + (row.skipped ? 0 : row.relevantT.length),
      missedRelevant: current.missedRelevant + row.missedRelevantCount,
      falseImplicates: current.falseImplicates + row.falseImplicatesCount,
      collisionPairs: current.collisionPairs + (row.skipped ? 0 : row.collisionPairs),
      collisionsRemaining: current.collisionsRemaining + row.collisionsRemaining,
      probes: current.probes + row.probes,
      runs: current.runs + row.runs,
      witnessesVerified: current.witnessesVerified + row.witnessesVerified,
      certificateMisses: current.certificateMisses + row.certificateMisses,
      detectedTotal: current.detectedTotal + row.detectedCount,
    };
    out[key] = next;
  }
  return out;
}

/* ─────────────────────────── experiments ─────────────────────────── */

interface ResidualAnchorRecord {
  readonly strategy: "cover-with-defaults";
  readonly strength: number;
  readonly detections: readonly string[];
  readonly certificate: string;
  readonly truncated: boolean;
  readonly enumeratedCollisionPairs: number;
  readonly residualCollisionPairs: number;
  readonly minimalResidualCollisionPairs: number;
  readonly documentedResidualPairCount: number;
  readonly documentedPair: {
    readonly left: Assignment;
    readonly right: Assignment;
    readonly outputLeft: string;
    readonly outputRight: string;
    readonly differing: readonly string[];
    readonly originalKeysEqual: boolean;
    readonly repairedKeysEqual: boolean;
    readonly residual: boolean;
  };
}

interface StrategyArm {
  readonly detected: readonly string[];
  readonly detectedCount: number;
  readonly apiUrlDetected: boolean;
  readonly runs: number;
}

interface MetroExperiment {
  readonly task: string;
  readonly strength: number;
  readonly assignments: { readonly P1: Assignment; readonly P2: Assignment };
  readonly outputs: { readonly P1: string; readonly P2: string };
  readonly originalKeys: { readonly P1: string; readonly P2: string; readonly equal: boolean };
  readonly repairedKeys: { readonly P1: string; readonly P2: string; readonly differ: boolean };
  readonly repairedInputs: readonly string[];
  readonly arms: Readonly<Record<string, StrategyArm>>;
  readonly exactWitness: {
    readonly slot: string;
    readonly differing: readonly string[];
    readonly outputLeft: string;
    readonly outputRight: string;
    readonly originalKeysEqual: boolean;
    readonly repairedKeysDiffer: boolean;
    readonly separated: boolean;
    readonly keyCollision: boolean;
    readonly oneMinimalByPair: boolean;
    readonly minimizedOneMinimal: boolean | null;
  };
  readonly nodeAdapter: {
    readonly detected: readonly string[];
    readonly apiUrlDetected: boolean;
    readonly outputs: { readonly P1: string; readonly P2: string };
    readonly originalKeysEqual: boolean;
    readonly repairedKeysDiffer: boolean;
    readonly detectedCount: number;
    readonly deterministic: boolean;
    readonly trapped: boolean;
    readonly runs: number;
    readonly fileSlotNote: string;
  };
  readonly qualitativeAgreement: boolean;
}

interface PlantedRow {
  readonly task: string;
  readonly strategy: ProbeStrategy;
  readonly strength: number;
  readonly detected: readonly string[];
  readonly relevantT: readonly string[];
  readonly missedRelevant: readonly string[];
  readonly explanations: Readonly<Record<string, readonly string[]>>;
  readonly unexplained: readonly string[];
  readonly allExplained: boolean;
}

interface WitnessDetail {
  readonly task: string;
  readonly strategy: ProbeStrategy;
  readonly strength: number;
  readonly slot: string;
  readonly support: readonly string[];
  readonly passes: number;
  readonly verifyRuns: number;
}

interface MinimalWitnessReport {
  readonly audits: number;
  readonly detections: number;
  readonly minimizedDetections: number;
  readonly minimizedOneMinimal: number;
  readonly minimizedNotOneMinimal: number;
  readonly minimizedNotOneMinimalDetails: readonly WitnessDetail[];
  readonly exactArmNecessityVerified: number;
  readonly unverifiedDetections: number;
  readonly unverifiedDetails: readonly WitnessDetail[];
  readonly allMinimizedWitnessesOneMinimal: boolean;
  readonly verifyRunsMismatches: readonly WitnessDetail[];
}

interface ExactArmCell {
  readonly task: string;
  readonly strength: number;
  readonly skipped: boolean;
  readonly deterministic: boolean;
  readonly equal: boolean;
  readonly detected: readonly string[];
  readonly relevantT: readonly string[];
  readonly detectedNotRelevant: readonly string[];
  readonly relevantNotDetected: readonly string[];
}

interface ExactArmEquality {
  readonly cells: number;
  readonly compared: number;
  readonly equal: number;
  readonly mismatched: number;
  readonly skipped: number;
  readonly nondeterministicRefusals: number;
  readonly perTaskStrength: readonly ExactArmCell[];
  readonly mismatches: readonly ExactArmCell[];
  readonly skippedCells: readonly ExactArmCell[];
}

interface FileTraceTaskRecord {
  readonly singleTraceReads: readonly string[];
  readonly singleTraceFileReads: readonly string[];
  readonly singleTraceFileOnly: boolean;
  readonly exactDetected: readonly string[];
  readonly exactEnvDetected: readonly string[];
  readonly envDetectionsNotInSingleTraceReads: readonly string[];
  readonly envDetectionsNotInSingleTraceFileReads: readonly string[];
}

interface FileTraceReport {
  readonly perTask: Readonly<Record<string, FileTraceTaskRecord>>;
  readonly envDetectionsWithNoFileTrace: number;
  readonly envDetectionsInvisibleToFileOnlyTracing: number;
  readonly sufficientForGate: boolean;
}

interface NegativeControlReport {
  readonly nondeterministicCounter: {
    readonly audits: number;
    readonly allRefused: boolean;
    readonly detectionsAcrossMatrix: readonly string[];
    readonly implicatesAcrossMatrix: readonly string[];
    readonly exactArmMisses: readonly string[];
    readonly exactArmMissIsRefusalOnly: boolean;
    readonly clockImplicated: boolean;
  };
  readonly untrappableAmbient: {
    readonly audits: number;
    readonly allTrappedFalse: boolean;
    readonly detectionsAcrossMatrix: readonly string[];
    readonly implicatesAcrossMatrix: readonly string[];
    readonly untrappedMissRecorded: boolean;
  };
}

function buildMetroExperiment(getAudit: (id: string, strategy: ProbeStrategy, strength: number) => AuditResult, scratchRoot: string): MetroExperiment {
  const task = getKeyFuseTask("metro-env-1");
  if (task === undefined) throw new Error("keyfuse evidence: metro-env-1 missing");
  const P1: Assignment = { ...task.baseline, "env:BUILD_MODE": "prod", "env:API_URL": "staging" };
  const P2: Assignment = { ...task.baseline, "env:BUILD_MODE": "prod", "env:API_URL": "production" };
  const oracle = createVirtualOracle(task);
  const outputs = { P1: outcomeText(oracle(P1)), P2: outcomeText(oracle(P2)) };

  const arms: Record<string, StrategyArm> = {};
  for (const strategy of STRATEGIES) {
    const audit = getAudit(task.id, strategy, 2);
    const detected = detectionSlots(audit);
    arms[strategy] = {
      detected,
      detectedCount: detected.length,
      apiUrlDetected: detected.includes("env:API_URL"),
      runs: audit.runs,
    };
  }

  const exact = getAudit(task.id, "cover-with-defaults", 2);
  const apiDetection = exact.detections.find((detection) => detection.slot === "env:API_URL");
  if (apiDetection === undefined) {
    throw new Error("keyfuse evidence: exact arm did not detect env:API_URL on metro-env-1");
  }
  const originalKeyP1 = keyfuseKey(task, task.declared, P1);
  const originalKeyP2 = keyfuseKey(task, task.declared, P2);
  const repairedKeyP1 = keyfuseKey(task, exact.repair.repairedInputs, P1);
  const repairedKeyP2 = keyfuseKey(task, exact.repair.repairedInputs, P2);

  const nodeRoot = mkdtempSync(join(scratchRoot, "metro-node-"));
  let nodeDetected: readonly string[] = [];
  let nodeOutputs = { P1: "", P2: "" };
  let nodeOriginalKeysEqual = false;
  let nodeRepairedKeysDiffer = false;
  let nodeDeterministic = false;
  let nodeTrapped = false;
  let nodeRuns = 0;
  try {
    const fileContent = METRO_NODE_TASK.baseline["file:metro.config.js"] ?? "";
    writeFileSync(join(nodeRoot, "metro.config.js"), fileContent);
    const nodeOracle = createNodeOracle(METRO_NODE_TASK, { root: nodeRoot });
    const nodeAudit = auditTask(METRO_NODE_TASK, nodeOracle, {
      strategy: "cover-with-defaults",
      strength: 2,
    });
    nodeDetected = nodeAudit.detections.map((detection) => detection.slot);
    const nP1: Assignment = { ...METRO_NODE_TASK.baseline, "env:BUILD_MODE": "prod", "env:API_URL": "staging" };
    const nP2: Assignment = { ...METRO_NODE_TASK.baseline, "env:BUILD_MODE": "prod", "env:API_URL": "production" };
    nodeOutputs = { P1: outcomeText(nodeOracle(nP1)), P2: outcomeText(nodeOracle(nP2)) };
    nodeOriginalKeysEqual =
      keyfuseKey(METRO_NODE_TASK, METRO_NODE_TASK.declared, nP1)
      === keyfuseKey(METRO_NODE_TASK, METRO_NODE_TASK.declared, nP2);
    nodeRepairedKeysDiffer =
      keyfuseKey(METRO_NODE_TASK, nodeAudit.repair.repairedInputs, nP1)
      !== keyfuseKey(METRO_NODE_TASK, nodeAudit.repair.repairedInputs, nP2);
    nodeDeterministic = nodeAudit.deterministic;
    nodeTrapped = nodeAudit.trapped;
    nodeRuns = nodeAudit.runs;
  } finally {
    rmSync(nodeRoot, { recursive: true, force: true });
  }

  const nodeApiUrl = nodeDetected.includes("env:API_URL");
  const virtualApiUrl = arms["cover-with-defaults"].apiUrlDetected;
  return {
    task: task.id,
    strength: 2,
    assignments: { P1, P2 },
    outputs,
    originalKeys: { P1: originalKeyP1, P2: originalKeyP2, equal: originalKeyP1 === originalKeyP2 },
    repairedKeys: { P1: repairedKeyP1, P2: repairedKeyP2, differ: repairedKeyP1 !== repairedKeyP2 },
    repairedInputs: [...exact.repair.repairedInputs],
    arms,
    exactWitness: {
      slot: apiDetection.slot,
      differing: [...apiDetection.witness.differing],
      outputLeft: apiDetection.witness.outputLeft,
      outputRight: apiDetection.witness.outputRight,
      originalKeysEqual: apiDetection.witness.originalKeyLeft === apiDetection.witness.originalKeyRight,
      repairedKeysDiffer: apiDetection.witness.repairedKeyLeft !== apiDetection.witness.repairedKeyRight,
      separated: apiDetection.witness.separated,
      keyCollision: apiDetection.witness.keyCollision,
      oneMinimalByPair:
        apiDetection.witness.differing.length === 1
        && apiDetection.witness.outputLeft !== apiDetection.witness.outputRight,
      minimizedOneMinimal: apiDetection.minimized === null ? null : apiDetection.minimized.oneMinimal,
    },
    nodeAdapter: {
      detected: nodeDetected,
      apiUrlDetected: nodeApiUrl,
      outputs: nodeOutputs,
      originalKeysEqual: nodeOriginalKeysEqual,
      repairedKeysDiffer: nodeRepairedKeysDiffer,
      detectedCount: nodeDetected.length,
      deterministic: nodeDeterministic,
      trapped: nodeTrapped,
      runs: nodeRuns,
      fileSlotNote:
        "the node fixture reads file:metro.config.js from disk (facade interposition), so the assignment cannot vary that slot; file-slot detections are not comparable across adapters",
    },
    qualitativeAgreement:
      virtualApiUrl && nodeApiUrl && repairedKeyP1 !== repairedKeyP2 && nodeRepairedKeysDiffer,
  };
}

function buildPlantedRows(
  groundTruth: Readonly<Record<string, GroundTruthInternal>>,
  getAudit: (id: string, strategy: ProbeStrategy, strength: number) => AuditResult,
): readonly PlantedRow[] {
  const rows: PlantedRow[] = [];
  for (const id of PLANTED_IDS) {
    const gt = groundTruth[id];
    for (const strategy of STRATEGIES) {
      for (const strength of STRENGTHS) {
        const audit = getAudit(id, strategy, strength);
        const detected = detectionSlots(audit);
        const detectedSet = new Set(detected);
        const relevant = relevantFor(gt, strength);
        const missed = relevant.filter((slot) => !detectedSet.has(slot));
        const explanations: Record<string, string[]> = {};
        for (const slot of missed) {
          explanations[slot] = audit.misses.filter(
            (miss) => miss.includes(slot) || miss.includes("order exceeds strength"),
          );
        }
        const unexplained = missed.filter((slot) => (explanations[slot] ?? []).length === 0);
        rows.push({
          task: id,
          strategy,
          strength,
          detected,
          relevantT: [...relevant],
          missedRelevant: missed,
          explanations,
          unexplained,
          allExplained: unexplained.length === 0,
        });
      }
    }
  }
  return rows;
}

function buildMinimalWitnessReport(
  getAudit: (id: string, strategy: ProbeStrategy, strength: number) => AuditResult,
): MinimalWitnessReport {
  let audits = 0;
  let detections = 0;
  let minimizedDetections = 0;
  let minimizedOneMinimal = 0;
  let exactArmNecessityVerified = 0;
  let unverifiedDetections = 0;
  const minimizedNotOneMinimalDetails: WitnessDetail[] = [];
  const unverifiedDetails: WitnessDetail[] = [];
  const verifyRunsMismatches: WitnessDetail[] = [];

  for (const task of KEYFUSE_TASKS) {
    for (const strategy of STRATEGIES) {
      for (const strength of STRENGTHS) {
        if (
          strategy === "cover-with-defaults"
          && hammingBallSize(task.universe, strength) > KEYFUSE_EXACT_MAX_ROWS
        ) {
          continue;
        }
        const audit = getAudit(task.id, strategy, strength);
        audits += 1;
        for (const detection of audit.detections) {
          detections += 1;
          const single =
            detection.witness.differing.length === 1
            && detection.witness.outputLeft !== detection.witness.outputRight;
          const detail: WitnessDetail = {
            task: task.id,
            strategy,
            strength,
            slot: detection.slot,
            support: detection.minimized === null ? [] : [...detection.minimized.support],
            passes: detection.minimized === null ? 0 : detection.minimized.passes,
            verifyRuns: detection.minimized === null ? 0 : detection.minimized.verifyRuns,
          };
          if (detection.minimized !== null) {
            minimizedDetections += 1;
            if (detection.minimized.oneMinimal) {
              minimizedOneMinimal += 1;
              if (detection.minimized.verifyRuns !== detection.minimized.support.length) {
                verifyRunsMismatches.push(detail);
              }
            } else {
              minimizedNotOneMinimalDetails.push(detail);
            }
            if (!detection.minimized.oneMinimal) unverifiedDetections += 1;
          } else if (detection.necessary && single) {
            exactArmNecessityVerified += 1;
          } else {
            unverifiedDetections += 1;
            unverifiedDetails.push(detail);
          }
        }
      }
    }
  }

  return {
    audits,
    detections,
    minimizedDetections,
    minimizedOneMinimal,
    minimizedNotOneMinimal: minimizedNotOneMinimalDetails.length,
    minimizedNotOneMinimalDetails,
    exactArmNecessityVerified,
    unverifiedDetections,
    unverifiedDetails,
    allMinimizedWitnessesOneMinimal: minimizedNotOneMinimalDetails.length === 0,
    verifyRunsMismatches,
  };
}

function buildExactArmEquality(
  strategyMatrix: Record<string, Record<string, Record<string, TaskMetrics>>>,
): ExactArmEquality {
  const perTaskStrength: ExactArmCell[] = [];
  for (const task of KEYFUSE_TASKS) {
    for (const strength of STRENGTHS) {
      const metrics = strategyMatrix["cover-with-defaults"][String(strength)][task.id];
      const detectedSet = new Set(metrics.detected);
      const relevantSet = new Set(metrics.relevantT);
      const detectedNotRelevant = metrics.detected.filter((slot) => !relevantSet.has(slot));
      const relevantNotDetected = metrics.relevantT.filter((slot) => !detectedSet.has(slot));
      perTaskStrength.push({
        task: task.id,
        strength,
        skipped: metrics.skipped,
        deterministic: metrics.deterministic,
        equal:
          !metrics.skipped
          && detectedNotRelevant.length === 0
          && relevantNotDetected.length === 0,
        detected: [...metrics.detected],
        relevantT: [...metrics.relevantT],
        detectedNotRelevant,
        relevantNotDetected,
      });
    }
  }
  const mismatches = perTaskStrength.filter((cell) => !cell.skipped && !cell.equal);
  const skippedCells = perTaskStrength.filter((cell) => cell.skipped);
  const compared = perTaskStrength.length - skippedCells.length;
  return {
    cells: perTaskStrength.length,
    compared,
    equal: compared - mismatches.length,
    mismatched: mismatches.length,
    skipped: skippedCells.length,
    nondeterministicRefusals: perTaskStrength.filter(
      (cell) => !cell.skipped && !cell.deterministic,
    ).length,
    perTaskStrength,
    mismatches,
    skippedCells,
  };
}

function buildFileTraceReport(
  getAudit: (id: string, strategy: ProbeStrategy, strength: number) => AuditResult,
): FileTraceReport {
  const perTask: Record<string, FileTraceTaskRecord> = {};
  let envDetectionsWithNoFileTrace = 0;
  let envDetectionsInvisibleToFileOnlyTracing = 0;
  for (const id of FILE_TRACE_IDS) {
    const single = getAudit(id, "single-trace", 2);
    const exact = getAudit(id, "cover-with-defaults", 2);
    const reads = [...single.tracedReads];
    const fileReads = reads.filter((name) => name.startsWith("file:"));
    const exactDetected = exact.detections.map((detection) => detection.slot);
    const envDetected = exactDetected.filter((slot) => slot.startsWith("env:"));
    const notTraced = envDetected.filter((slot) => !reads.includes(slot));
    const fileOnlyNotTraced = envDetected.filter((slot) => !fileReads.includes(slot));
    envDetectionsWithNoFileTrace += notTraced.length;
    envDetectionsInvisibleToFileOnlyTracing += fileOnlyNotTraced.length;
    perTask[id] = {
      singleTraceReads: reads,
      singleTraceFileReads: fileReads,
      singleTraceFileOnly: reads.length > 0 && reads.every((name) => name.startsWith("file:")),
      exactDetected,
      exactEnvDetected: envDetected,
      envDetectionsNotInSingleTraceReads: notTraced,
      envDetectionsNotInSingleTraceFileReads: fileOnlyNotTraced,
    };
  }
  return {
    perTask,
    envDetectionsWithNoFileTrace,
    envDetectionsInvisibleToFileOnlyTracing,
    sufficientForGate:
      envDetectionsWithNoFileTrace >= 1 || envDetectionsInvisibleToFileOnlyTracing >= 1,
  };
}

function buildNegativeControlReport(
  getAudit: (id: string, strategy: ProbeStrategy, strength: number) => AuditResult,
): NegativeControlReport {
  const collect = (id: string) => {
    const detections: string[] = [];
    const implicates: string[] = [];
    let allRefused = true;
    let allTrappedFalse = true;
    let audits = 0;
    const exactMisses: string[] = [];
    for (const strategy of STRATEGIES) {
      for (const strength of STRENGTHS) {
        const audit = getAudit(id, strategy, strength);
        audits += 1;
        detections.push(...detectionSlots(audit));
        implicates.push(...audit.repair.implicated);
        if (audit.deterministic) allRefused = false;
        if (audit.trapped) allTrappedFalse = false;
        if (strategy === "cover-with-defaults" && strength === 2) exactMisses.push(...audit.misses);
      }
    }
    return { audits, detections, implicates, allRefused, allTrappedFalse, exactMisses };
  };

  const nondeterministic = collect("nondeterministic-counter");
  const untrappable = collect("untrappable-ambient");
  return {
    nondeterministicCounter: {
      audits: nondeterministic.audits,
      allRefused: nondeterministic.allRefused,
      detectionsAcrossMatrix: nondeterministic.detections,
      implicatesAcrossMatrix: nondeterministic.implicates,
      exactArmMisses: nondeterministic.exactMisses,
      exactArmMissIsRefusalOnly:
        nondeterministic.exactMisses.length === 1
        && nondeterministic.exactMisses[0] === "oracle nondeterministic at baseline",
      clockImplicated: nondeterministic.implicates.includes("clock"),
    },
    untrappableAmbient: {
      audits: untrappable.audits,
      allTrappedFalse: untrappable.allTrappedFalse,
      detectionsAcrossMatrix: untrappable.detections,
      implicatesAcrossMatrix: untrappable.implicates,
      untrappedMissRecorded: getAudit("untrappable-ambient", "cover-with-defaults", 2).misses.some(
        (miss) => miss.includes("untrapped read suspected"),
      ),
    },
  };
}

/* ─────────────────────────── printing ─────────────────────────── */

function pad(value: string, width: number, right = false): string {
  return right ? value.padStart(width) : value.padEnd(width);
}

function printTable(rows: readonly TaskMetrics[]): void {
  const header = [
    pad("task", 26),
    pad("family", 14),
    pad("strategy", 18),
    pad("t", 2, true),
    pad("det", 4, true),
    pad("missed", 7, true),
    pad("false", 6, true),
    pad("runs", 5, true),
  ].join(" ");
  console.log(header);
  console.log("-".repeat(header.length));
  let lastTask = "";
  for (const row of rows) {
    if (row.task !== lastTask) {
      if (lastTask !== "") console.log("");
      lastTask = row.task;
    }
    console.log(
      [
        pad(row.task, 26),
        pad(row.family, 14),
        pad(row.strategy, 18),
        pad(String(row.strength), 2, true),
        pad(row.skipped ? "skip" : String(row.detectedCount), 4, true),
        pad(row.skipped ? "-" : String(row.missedRelevantCount), 7, true),
        pad(row.skipped ? "-" : String(row.falseImplicatesCount), 6, true),
        pad(row.skipped ? "-" : String(row.runs), 5, true),
      ].join(" "),
    );
  }
}

function printMetro(experiment: MetroExperiment): void {
  console.log("\n(a) Metro end to end — metro-env-1, strength 2");
  console.log(`    P1 output: ${experiment.outputs.P1}`);
  console.log(`    P2 output: ${experiment.outputs.P2}`);
  console.log(
    `    declared keys equal: ${experiment.originalKeys.equal}; repaired keys differ: ${experiment.repairedKeys.differ}; repairedInputs=[${experiment.repairedInputs.join(", ")}]`,
  );
  for (const strategy of STRATEGIES) {
    const arm = experiment.arms[strategy];
    console.log(
      `    ${pad(strategy, 18)} detected=[${arm.detected.join(",")}] API_URL=${arm.apiUrlDetected} runs=${arm.runs}`,
    );
  }
  console.log(
    `    exact API_URL witness: differing=[${experiment.exactWitness.differing.join(",")}] outputsDiffer=${experiment.exactWitness.outputLeft !== experiment.exactWitness.outputRight} originalKeysEqual=${experiment.exactWitness.originalKeysEqual} repairedKeysDiffer=${experiment.exactWitness.repairedKeysDiffer} separated=${experiment.exactWitness.separated} keyCollision=${experiment.exactWitness.keyCollision} oneMinimal=${experiment.exactWitness.oneMinimalByPair}`,
  );
  console.log(
    `    node adapter: detected=[${experiment.nodeAdapter.detected.join(",")}] API_URL=${experiment.nodeAdapter.apiUrlDetected} originalKeysEqual=${experiment.nodeAdapter.originalKeysEqual} repairedKeysDiffer=${experiment.nodeAdapter.repairedKeysDiffer} deterministic=${experiment.nodeAdapter.deterministic} trapped=${experiment.nodeAdapter.trapped} runs=${experiment.nodeAdapter.runs}`,
  );
  console.log(`    qualitative agreement (virtual/node): ${experiment.qualitativeAgreement}`);
}

function printPlanted(rows: readonly PlantedRow[]): void {
  console.log("\n(b) planted interactions — detected vs relevantT and absence explanations");
  for (const row of rows) {
    console.log(
      `    ${pad(row.task, 10)} ${pad(row.strategy, 18)} t=${row.strength} detected=[${row.detected.join(",")}] relevant=[${row.relevantT.join(",")}] missed=[${row.missedRelevant.join(",")}]${row.unexplained.length > 0 ? ` unexplained=[${row.unexplained.join(",")}]` : " explained"}`,
    );
  }
}

function printMinimalWitness(report: MinimalWitnessReport): void {
  console.log("\n(c) minimal witness verification");
  console.log(
    `    audits=${report.audits} detections=${report.detections} minimized=${report.minimizedDetections} oneMinimal=${report.minimizedOneMinimal} notOneMinimal=${report.minimizedNotOneMinimal} exactArmNecessityVerified=${report.exactArmNecessityVerified}`,
  );
  console.log(`    all minimized witnesses 1-minimal: ${report.allMinimizedWitnessesOneMinimal}`);
  console.log(`    verifyRuns mismatches: ${report.verifyRunsMismatches.length}`);
  for (const detail of report.minimizedNotOneMinimalDetails) {
    console.log(
      `    flagged: ${detail.task} ${detail.strategy} t=${detail.strength} slot=${detail.slot} support=[${detail.support.join(",")}] passes=${detail.passes} verifyRuns=${detail.verifyRuns}`,
    );
  }
}

function printFileTrace(report: FileTraceReport): void {
  console.log("\n(d) env invisible to file tracing");
  for (const id of FILE_TRACE_IDS) {
    const record = report.perTask[id];
    console.log(
      `    ${pad(id, 18)} single-trace reads=[${record.singleTraceReads.join(",")}] fileOnly=${record.singleTraceFileOnly} exact env=[${record.exactEnvDetected.join(",")}] notTraced=[${record.envDetectionsNotInSingleTraceReads.join(",")}] fileOnlyNotTraced=[${record.envDetectionsNotInSingleTraceFileReads.join(",")}]`,
    );
  }
  console.log(
    `    envDetectionsWithNoFileTrace=${report.envDetectionsWithNoFileTrace} invisibleToFileOnlyTracing=${report.envDetectionsInvisibleToFileOnlyTracing} sufficientForGate=${report.sufficientForGate}`,
  );
}

function printNegativeControls(report: NegativeControlReport): void {
  const nondet = report.nondeterministicCounter;
  const ambient = report.untrappableAmbient;
  console.log("\n(e) negative controls");
  console.log(
    `    nondeterministic-counter: audits=${nondet.audits} allRefused=${nondet.allRefused} detections=${nondet.detectionsAcrossMatrix.length} implicates=${nondet.implicatesAcrossMatrix.length} refusalMissOnly=${nondet.exactArmMissIsRefusalOnly} clockImplicated=${nondet.clockImplicated} misses=[${nondet.exactArmMisses.join(",")}]`,
  );
  console.log(
    `    untrappable-ambient: audits=${ambient.audits} allTrappedFalse=${ambient.allTrappedFalse} detections=${ambient.detectionsAcrossMatrix.length} implicates=${ambient.implicatesAcrossMatrix.length} untrappedMissRecorded=${ambient.untrappedMissRecorded}`,
  );
}

function printExactArmEquality(report: ExactArmEquality): void {
  console.log(
    "\n(f) exact-arm criterion-2 equality — cover-with-defaults detections vs relevantT(t)",
  );
  console.log(
    `    cells=${report.cells} compared=${report.compared} equal=${report.equal} mismatched=${report.mismatched} skipped=${report.skipped} nondeterministicRefusals=${report.nondeterministicRefusals}`,
  );
  for (const cell of report.perTaskStrength) {
    const status = cell.skipped
      ? "skipped"
      : cell.equal
        ? "equal"
        : cell.deterministic
          ? "MISMATCH"
          : "MISMATCH-refused";
    console.log(
      `    ${pad(cell.task, 26)} t=${cell.strength} ${status} detected=[${cell.detected.join(",")}] relevantT=[${cell.relevantT.join(",")}]${cell.skipped || cell.equal ? "" : ` detectedNotRelevant=[${cell.detectedNotRelevant.join(",")}] relevantNotDetected=[${cell.relevantNotDetected.join(",")}]`}`,
    );
  }
  if (report.nondeterministicRefusals > 0) {
    console.log(
      "    note: MISMATCH-refused cells are the negative control the determinism gate refuses before probing; their ground truth is computed over a nondeterministic oracle and is not a meaningful equality target",
    );
  }
  console.log(
    `    mismatched cells: ${report.mismatches.map((cell) => `${cell.task}@t${cell.strength}`).join(", ") || "none"}`,
  );
  for (const cell of report.skippedCells) {
    console.log(`    skipped (exact arm refused): ${cell.task} t=${cell.strength}`);
  }
}

function printResidualAnchor(record: ResidualAnchorRecord): void {
  console.log("\n(anchor) threshold-3 residual collision honesty (C5)");
  console.log(
    `    exact arm t=${record.strength} detections=[${record.detections.join(",")}] certificate="${record.certificate}" truncated=${record.truncated}`,
  );
  console.log(
    `    enumerated collision pairs=${record.enumeratedCollisionPairs} residualCollisionPairs=${record.residualCollisionPairs} minimalResidualCollisionPairs=${record.minimalResidualCollisionPairs} documentedResidualPairCount=${record.documentedResidualPairCount}`,
  );
  console.log(
    `    documented pair: differing=[${record.documentedPair.differing.join(",")}] outputs=${record.documentedPair.outputLeft}/${record.documentedPair.outputRight} originalKeysEqual=${record.documentedPair.originalKeysEqual} repairedKeysEqual=${record.documentedPair.repairedKeysEqual} residual=${record.documentedPair.residual}`,
  );
}

/* ─────────────────────────── main ─────────────────────────── */

function main(): void {
  const started = performance.now();
  const scratchRoot = process.env.DF_KEYFUSE_SCRATCH ?? join(tmpdir(), "deepforge-keyfuse-evidence");
  mkdirSync(scratchRoot, { recursive: true });
  const scratchDir = mkdtempSync(join(scratchRoot, "run-"));

  const groundTruth: Record<string, GroundTruthInternal> = {};
  for (const task of KEYFUSE_TASKS) groundTruth[task.id] = buildGroundTruth(task);

  const auditCache = new Map<string, AuditResult>();
  const oracles = new Map<string, ReturnType<typeof createVirtualOracle>>();
  const getAudit = (id: string, strategy: ProbeStrategy, strength: number): AuditResult => {
    const cacheKey = `${id}|${strategy}|${strength}`;
    const cached = auditCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const task = getKeyFuseTask(id);
    if (task === undefined) throw new Error(`keyfuse evidence: unknown task ${id}`);
    let oracle = oracles.get(id);
    if (oracle === undefined) {
      oracle = createVirtualOracle(task);
      oracles.set(id, oracle);
    }
    const audit = auditTask(task, oracle, { strategy, strength });
    auditCache.set(cacheKey, audit);
    return audit;
  };

  const taskRows: TaskMetrics[] = [];
  const strategyMatrix: Record<string, Record<string, Record<string, TaskMetrics>>> = {};
  for (const strategy of STRATEGIES) {
    strategyMatrix[strategy] = {};
    for (const strength of STRENGTHS) {
      strategyMatrix[strategy][String(strength)] = {};
      for (const task of KEYFUSE_TASKS) {
        const skipped =
          strategy === "cover-with-defaults"
          && hammingBallSize(task.universe, strength) > KEYFUSE_EXACT_MAX_ROWS;
        const metrics = skipped
          ? skippedMetrics(task, strategy, strength)
          : computeTaskMetrics(task, groundTruth[task.id], getAudit(task.id, strategy, strength));
        taskRows.push(metrics);
        strategyMatrix[strategy][String(strength)][task.id] = metrics;
      }
    }
  }

  const anchorTaskId = "threshold-3";
  const anchorTask = getKeyFuseTask(anchorTaskId);
  if (anchorTask === undefined) throw new Error("keyfuse evidence: threshold-3 missing");
  const anchorGt = groundTruth[anchorTaskId];
  const anchorAudit = getAudit(anchorTaskId, "cover-with-defaults", 2);
  const anchorMetrics = strategyMatrix["cover-with-defaults"]["2"][anchorTaskId];
  const anchorKeyCache = new Map<string, string>();
  const anchorKeyOf = (row: GroundRow): string => {
    const cached = anchorKeyCache.get(row.cacheKey);
    if (cached !== undefined) return cached;
    const key = keyfuseKey(anchorTask, anchorAudit.repair.repairedInputs, row.assignment);
    anchorKeyCache.set(row.cacheKey, key);
    return key;
  };
  let minimalResidual = 0;
  for (const [i, j] of anchorGt.pairs) {
    if (assignmentDistance(anchorGt.rows[i].assignment, anchorGt.rows[j].assignment, anchorGt.names) === 1) {
      if (anchorKeyOf(anchorGt.rows[i]) === anchorKeyOf(anchorGt.rows[j])) minimalResidual += 1;
    }
  }
  const documentedLeft: Assignment = {
    ...anchorTask.baseline,
    "env:A": "1",
    "env:B": "1",
    "env:C": "0",
    "env:D": "0",
  };
  const documentedRight: Assignment = { ...documentedLeft, "env:C": "1" };
  const anchorOracle = createVirtualOracle(anchorTask);
  const residualRecord: ResidualAnchorRecord = {
    strategy: "cover-with-defaults",
    strength: 2,
    detections: [...anchorMetrics.detected],
    certificate: anchorMetrics.certificate,
    truncated: anchorMetrics.truncated,
    enumeratedCollisionPairs: anchorGt.pairs.length,
    residualCollisionPairs: anchorMetrics.collisionsRemaining,
    minimalResidualCollisionPairs: minimalResidual,
    documentedResidualPairCount: 1,
    documentedPair: {
      left: documentedLeft,
      right: documentedRight,
      outputLeft: outcomeText(anchorOracle(documentedLeft)),
      outputRight: outcomeText(anchorOracle(documentedRight)),
      differing: anchorGt.names.filter(
        (name) => (documentedLeft[name] ?? "") !== (documentedRight[name] ?? ""),
      ),
      originalKeysEqual:
        keyfuseKey(anchorTask, anchorTask.declared, documentedLeft)
        === keyfuseKey(anchorTask, anchorTask.declared, documentedRight),
      repairedKeysEqual:
        keyfuseKey(anchorTask, anchorAudit.repair.repairedInputs, documentedLeft)
        === keyfuseKey(anchorTask, anchorAudit.repair.repairedInputs, documentedRight),
      residual: true,
    },
  };
  groundTruth[anchorTaskId].record.residual = residualRecord;

  const metro = buildMetroExperiment(getAudit, scratchDir);
  const planted = buildPlantedRows(groundTruth, getAudit);
  const minimalWitness = buildMinimalWitnessReport(getAudit);
  const fileTrace = buildFileTraceReport(getAudit);
  const negativeControls = buildNegativeControlReport(getAudit);
  const exactArmEquality = buildExactArmEquality(strategyMatrix);
  const familyMetrics = aggregateFamilies(taskRows);

  const groundTruthRecord: Record<string, GroundTruthRecord> = {};
  for (const task of KEYFUSE_TASKS) groundTruthRecord[task.id] = groundTruth[task.id].record;

  let productAssignments = 0;
  let binaryAssignments = 0;
  for (const task of KEYFUSE_TASKS) {
    productAssignments += groundTruth[task.id].record.productSize;
    binaryAssignments += groundTruth[task.id].record.binaryProductSize;
  }

  const payload = {
    KEYFUSE_MARK,
    version: KEYFUSE_VERSION,
    corpus: {
      tasks: KEYFUSE_TASKS.length,
      families: [...new Set(KEYFUSE_TASKS.map((task) => familyOf(task.id)))],
      productAssignments,
      binaryAssignments,
      strategies: STRATEGIES,
      strengths: STRENGTHS,
    },
    groundTruth: groundTruthRecord,
    strategyMatrix,
    familyMetrics,
    experiments: {
      metro,
      planted,
      exactArmEquality,
      minimalWitness,
      fileTrace,
      negativeControls,
      anchorResidual: residualRecord,
    },
  };
  const digest = keyfuseHash(canonicalJson(payload));
  const artifact = { ...payload, digest };
  const jsonPath = join(scratchDir, "keyfuse-evidence.json");
  writeFileSync(jsonPath, `${canonicalJson(artifact)}\n`);

  const taskOrder = new Map(KEYFUSE_TASKS.map((task, index) => [task.id, index]));
  const strategyOrder = new Map(STRATEGIES.map((strategy, index) => [strategy, index]));
  const sortedRows = [...taskRows].sort((a, b) => {
    const taskDelta = (taskOrder.get(a.task) ?? 0) - (taskOrder.get(b.task) ?? 0);
    if (taskDelta !== 0) return taskDelta;
    const strategyDelta = (strategyOrder.get(a.strategy) ?? 0) - (strategyOrder.get(b.strategy) ?? 0);
    if (strategyDelta !== 0) return strategyDelta;
    return a.strength - b.strength;
  });

  printTable(sortedRows);
  printMetro(metro);
  printPlanted(planted);
  printMinimalWitness(minimalWitness);
  printFileTrace(fileTrace);
  printNegativeControls(negativeControls);
  printExactArmEquality(exactArmEquality);
  printResidualAnchor(residualRecord);
  if (VERBOSE) {
    console.log("\nverbose: per-audit detections and misses");
    for (const row of sortedRows) {
      if (row.skipped) continue;
      console.log(
        `    ${row.task} ${row.strategy} t=${row.strength} det=[${row.detected.join(",")}] repair=[${row.repairedInputs.join(",")}] misses=[${row.misses.join(" | ")}] digest=${row.digest}`,
      );
    }
  }
  const seconds = (performance.now() - started) / 1000;
  console.log(`\nmode: ${VERBOSE ? "verbose" : "compact"}; digest ${digest}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`runtime: ${seconds.toFixed(2)}s (hard budget 60s)`);
}

main();
