/**
 * KeyFuse audit — the falsification-first facade over probing, witnesses, and
 * repair.
 *
 * `auditTask` is the shipped pipeline from blueprint §2. Determinism gate
 * first: the oracle runs at the baseline twice and at one perturbed row (the
 * first universe slot at `top`) twice; any outcome mismatch refuses the whole
 * audit with `deterministic:false`, zero probes, zero detections, a repair
 * over the declared inputs only, and the miss `oracle nondeterministic at
 * baseline`. Non-determinism is refused, not averaged away, and the gate is
 * two sampled pairs — a refusal is evidence, a pass is not a proof.
 *
 * The probe then runs the requested strategy through `runProbe`. For every
 * strategy except `single-trace` a trace fixpoint follows: read slot names
 * seen for the first time in a probe trace are added to the running
 * implicated-name set and the probe is re-run, up to KEYFUSE_FIXPOINT_PASSES
 * passes, while the budget allows. If fresh names still appear after the
 * final pass, or a re-run cannot complete, the audit records `trace fixpoint
 * not reached in 3 passes` and sets `truncated`. A `single-trace` audit has
 * no perturbed trace to converge, so it takes no fixpoint pass and never
 * reports the fixpoint miss. The implicated-name set drives convergence only;
 * the returned repair is built from detections, as the audit contract
 * specifies.
 *
 * Detections are the strategy's evidence, never a soundness claim.
 * `baseline-toggle` reports each changing single-slot row with the pair
 * (baseline, row) and `necessary:true` — the row itself is the witness.
 * `single-trace` reports no detections at all: the read set is the evidence
 * and no dependence is claimed. `ca` reports every differing slot of every
 * changing row with the observed per-slot necessity flag, including
 * `necessary:false` slots — that is the intentional false-implicate arm.
 * `ca-ddmin` minimizes each changing row first (honoring `verifyMinimal` and
 * the remaining budget) and then attributes from the MINIMIZED support `S`,
 * not from the row's original difference set: when `|S| <= strength` every
 * slot of `S` is emitted with its necessity check at the minimized context,
 * and when `|S| > strength` the row emits nothing and records `detected
 * effect requires >t support at row <index> (order exceeds strength)`, so an
 * effect a strength-`t` array can realize only through a masking superset is
 * a reported miss, never a silent drop. `cover-with-defaults` is the exact
 * arm: the necessity check at each row's own context, only `necessary:true`
 * detections, minimized witness `null`. Detections are deduplicated by slot
 * before repair (first occurrence in row order), so repeated row contexts for
 * one slot no longer inflate the repair's witness counts. A slot outside the
 * universe is never given a kind: it is skipped and recorded as a miss.
 *
 * Repair. `buildRepair` computes declared ∪ detected, then every returned
 * detection's witness keys are rebuilt over that final union, so
 * `repairedKeyLeft`, `repairedKeyRight`, and `separated` all reflect the
 * union the caller receives. The repaired key is a conservative
 * over-approximation of DETECTED dependence — it includes everything the
 * audit saw, never everything that exists.
 *
 * Anchor assumption (an assumption, not a theorem). The detection story, and
 * the exact-cover claim for `cover-with-defaults`, holds only if every output
 * difference is anchored to the baseline: some ≤t-support displacement of the
 * baseline that includes a differing slot witnesses it. A globally relevant
 * slot whose effects all start farther than `t` from the baseline (blueprint
 * C5) is invisible here, and the certificate must not be read as saying
 * otherwise.
 *
 * Not claimed. No soundness. No completeness. KeyFuse does not "find all
 * collisions". It does not "beat sandboxing on file reads": sandboxes see
 * file reads, and KeyFuse exists for the slots a sandbox or file tracer
 * cannot see (env, cwd, locale, timezone, clock, rng). Value-specific effects
 * the probe domains do not realize are missed. The hash is a 64-bit FNV
 * identifier, not a security boundary.
 *
 * Bookkeeping. `runs` counts every oracle call actually made (gate, probe,
 * fixpoint re-runs, minimization, necessity checks); the gate always spends
 * four calls, so a budget below four is honored only by the later phases.
 * `truncated` is true when the budget stopped a probe, a minimization, or a
 * necessity loop, or when the trace fixpoint did not complete, and it selects
 * the truncated certificate string. Untrapped-read suspicion is sampled by
 * the gate only: `ProbeOutcome` does not carry run-level `trapped` flags, so
 * the audit cannot propagate a probe-phase suspicion. `misses` is the
 * deterministic first-occurrence union of probe misses, minimizer misses, the
 * fixpoint miss, unknown-slot notes, and audit notes. `digest` is
 * `auditDigest` of the result without the digest field, so two identical
 * audits serialize byte-identically.
 *
 * Purity. No clock, no randomness, no storage, no DOM, no network, no import
 * outside this directory, and no argument mutated; the returned result is
 * freshly built, and the caller's `task`, `oracle`, and `options` are only
 * read.
 */

import type {
  Assignment,
  AuditResult,
  Detection,
  KeyFuseTask,
  OracleRun,
  ProbeOptions,
  SlotSpec,
  TaskDefinition,
  TaskOracle,
  WitnessPair,
} from "./types";
import { auditDigest } from "./hash";
import { assignmentWith, slotName } from "./slots";
import {
  KEYFUSE_DEFAULT_STRENGTH,
  KEYFUSE_MAX_RUNS,
  runProbe,
} from "./probe";
import { checkNecessity, minimizeRowSupport } from "./minimize";
import { buildRepair, keyfuseKey } from "./repair";

/** Trace→perturb→retrace passes before the audit admits it did not converge. */
export const KEYFUSE_FIXPOINT_PASSES = 3;
/** The default certificate: weak, scoped to what was covered, never "sound". */
export const KEYFUSE_CERTIFICATE = "no detected <=t-support effect at covered tuples";
/** Selected when the budget or the fixpoint stopped the audit early. */
export const KEYFUSE_CERTIFICATE_TRUNCATED = "budget exhausted before coverage completed";

const NONDETERMINISM_MISS = "oracle nondeterministic at baseline";
const FIXPOINT_MISS = `trace fixpoint not reached in ${KEYFUSE_FIXPOINT_PASSES} passes`;
const NECESSITY_BUDGET_MISS = "budget exhausted during per-slot necessity checks";
const UNTRAPPED_MISS = "untrapped read suspected: output moved with no recorded slot read";
const MINIMIZE_BUDGET_PREFIX = "budget exhausted";

/** The honest record for a support the requested strength cannot attribute. */
function overStrengthMiss(strength: number, rowIndex: number): string {
  return `detected effect requires >${strength} support at row ${rowIndex} (order exceeds strength)`;
}

/** Outcome fingerprint for the gate: same outcome means same string. */
function outcomeFingerprint(run: OracleRun): string {
  if (!run.outcome.ok) return `error\u0000${run.outcome.reason}`;
  return `ok\u0000${run.outcome.output}`;
}

/** First-occurrence union across groups, preserving group and item order. */
function mergeFirstOccurrence(groups: readonly (readonly string[])[]): readonly string[] {
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const group of groups) {
    for (const text of group) {
      if (!seen.has(text)) {
        seen.add(text);
        merged.push(text);
      }
    }
  }
  return merged;
}

/**
 * The `baseline-toggle` witness: the recorded pair is (baseline, row), which
 * differs in exactly one slot, and the outputs are the two recorded outputs.
 * Repaired keys here are provisional over declared ∪ {slot}; `auditTask`
 * rebuilds them over the final union.
 */
function toggleWitness(
  task: KeyFuseTask,
  slot: string,
  left: Assignment,
  right: Assignment,
  outputLeft: string,
  outputRight: string,
): WitnessPair {
  const originalKeyLeft = keyfuseKey(task, task.declared, left);
  const originalKeyRight = keyfuseKey(task, task.declared, right);
  const provisional = [...task.declared, slot];
  const repairedKeyLeft = keyfuseKey(task, provisional, left);
  const repairedKeyRight = keyfuseKey(task, provisional, right);
  return {
    left,
    right,
    differing: [slot],
    outputLeft,
    outputRight,
    originalKeyLeft,
    originalKeyRight,
    repairedKeyLeft,
    repairedKeyRight,
    keyCollision: originalKeyLeft === originalKeyRight && outputLeft !== outputRight,
    separated: repairedKeyLeft !== repairedKeyRight,
  };
}

/**
 * Audit one task through `oracle`. Deterministic, budget-bounded, read-only:
 * the default strategy is `cover-with-defaults` (exact per-slot ≤t attribution
 * whenever the ball fits `KEYFUSE_EXACT_MAX_ROWS`; the corpus always fits),
 * with strength `KEYFUSE_DEFAULT_STRENGTH`, budget `KEYFUSE_MAX_RUNS`, and
 * `verifyMinimal:true`. `ca-ddmin` remains the conservative fallback for
 * larger universes and can drop a slot that only matters in a multi-slot
 * context, so its misses are reported. See the module docblock for the
 * pipeline, the anchor assumption, and the not-claimed list.
 */
export function auditTask(
  task: TaskDefinition,
  oracle: TaskOracle,
  options?: ProbeOptions,
): AuditResult {
  const strategy = options?.strategy ?? "cover-with-defaults";
  const strength = options?.strength ?? KEYFUSE_DEFAULT_STRENGTH;
  const budget = options?.budget ?? KEYFUSE_MAX_RUNS;
  const verifyMinimal = options?.verifyMinimal ?? true;

  const probeMisses: string[] = [];
  const minimizeMisses: string[] = [];
  const unknownSlotMisses: string[] = [];
  const auditNotes: string[] = [];

  const firstSpec = task.universe.slots[0];
  const perturbed =
    firstSpec === undefined
      ? task.baseline
      : assignmentWith(task.baseline, { [slotName(firstSpec)]: firstSpec.top });
  const baselineRunA = oracle(task.baseline);
  const baselineRunB = oracle(task.baseline);
  const perturbedRunA = oracle(perturbed);
  const perturbedRunB = oracle(perturbed);
  const gateRuns = 4;
  const trapped =
    baselineRunA.trapped &&
    baselineRunB.trapped &&
    perturbedRunA.trapped &&
    perturbedRunB.trapped;
  const deterministic =
    outcomeFingerprint(baselineRunA) === outcomeFingerprint(baselineRunB) &&
    outcomeFingerprint(perturbedRunA) === outcomeFingerprint(perturbedRunB);

  if (!deterministic) {
    const refused: Omit<AuditResult, "digest"> = {
      task: task.id,
      version: task.version,
      strategy,
      strength,
      deterministic: false,
      trapped,
      probes: [],
      tracedReads: [],
      detections: [],
      repair: buildRepair({ task, detections: [] }),
      certificate: KEYFUSE_CERTIFICATE,
      misses: [NONDETERMINISM_MISS],
      runs: gateRuns,
      truncated: false,
    };
    return { ...refused, digest: auditDigest(refused) };
  }

  if (!trapped) auditNotes.push(UNTRAPPED_MISS);

  let runs = gateRuns;
  let truncated = false;
  const probe = runProbe(task, oracle, {
    strategy,
    strength,
    budget: Math.max(0, budget - runs),
    verifyMinimal,
  });
  runs += probe.runs;
  if (probe.truncated) truncated = true;
  for (const miss of probe.misses) probeMisses.push(miss);
  let tracedReads: readonly string[] = probe.tracedReads;

  let fixpointReached = strategy === "single-trace";
  let fixpointApplicable = !probe.truncated;
  if (!fixpointReached && fixpointApplicable) {
    const knownReads = new Set<string>();
    let pass = 0;
    let currentReads: readonly string[] = probe.tracedReads;
    while (pass < KEYFUSE_FIXPOINT_PASSES) {
      pass += 1;
      let fresh = 0;
      for (const name of currentReads) {
        if (!knownReads.has(name)) {
          knownReads.add(name);
          fresh += 1;
        }
      }
      if (fresh === 0) {
        fixpointReached = true;
        break;
      }
      if (pass >= KEYFUSE_FIXPOINT_PASSES) break;
      const remaining = Math.max(0, budget - runs);
      if (remaining === 0) break;
      const rerun = runProbe(task, oracle, {
        strategy,
        strength,
        budget: remaining,
        verifyMinimal,
      });
      runs += rerun.runs;
      for (const miss of rerun.misses) probeMisses.push(miss);
      tracedReads = mergeFirstOccurrence([tracedReads, rerun.tracedReads]);
      if (rerun.truncated) {
        truncated = true;
        fixpointApplicable = false;
        break;
      }
      currentReads = rerun.tracedReads;
    }
  }
  const fixpointMissed = !fixpointReached && strategy !== "single-trace" && fixpointApplicable;
  if (fixpointMissed) truncated = true;

  const specs = new Map<string, SlotSpec>();
  for (const spec of task.universe.slots) specs.set(slotName(spec), spec);
  const noteUnknown = (name: string): void => {
    unknownSlotMisses.push(`unknown slot ${name} in detection (skipped)`);
  };

  const baselineRow = probe.rows[0];
  const baselineOutput = baselineRow === undefined ? "" : baselineRow.output;
  const changedRows = probe.rows.filter((row) => row.changed);
  const detections: Detection[] = [];

  if (strategy === "baseline-toggle") {
    for (const row of changedRows) {
      const slot = row.differing[0];
      if (slot === undefined) continue;
      const spec = specs.get(slot);
      if (spec === undefined) {
        noteUnknown(slot);
        continue;
      }
      detections.push({
        slot,
        kind: spec.kind,
        witness: toggleWitness(
          task,
          slot,
          task.baseline,
          row.assignment,
          baselineOutput,
          row.output,
        ),
        minimized: null,
        necessary: true,
      });
    }
  } else if (strategy === "single-trace") {
    // Intentionally empty: no dependence is claimed for a traced read set.
  } else if (strategy === "ca") {
    // The intentional false-implicate arm: every differing slot of every
    // changing row, with the necessity flag observed at the row's context.
    let budgetStopped = false;
    for (const row of changedRows) {
      for (const slot of row.differing) {
        const spec = specs.get(slot);
        if (spec === undefined) {
          noteUnknown(slot);
          continue;
        }
        if (runs >= budget) {
          auditNotes.push(NECESSITY_BUDGET_MISS);
          truncated = true;
          budgetStopped = true;
          break;
        }
        const check = checkNecessity({ task, oracle, row, slot });
        runs += check.runs;
        detections.push({
          slot,
          kind: spec.kind,
          witness: check.pair,
          minimized: null,
          necessary: check.necessary,
        });
      }
      if (budgetStopped) break;
    }
  } else if (strategy === "ca-ddmin") {
    let budgetStopped = false;
    for (const row of changedRows) {
      if (runs >= budget) {
        auditNotes.push(NECESSITY_BUDGET_MISS);
        truncated = true;
        budgetStopped = true;
        break;
      }
      const outcome = minimizeRowSupport({
        task,
        oracle,
        row,
        baselineOutput,
        verifyMinimal,
        budget: Math.max(0, budget - runs),
      });
      runs += outcome.runs;
      for (const miss of outcome.misses) minimizeMisses.push(miss);
      if (outcome.misses.some((miss) => miss.startsWith(MINIMIZE_BUDGET_PREFIX))) {
        truncated = true;
      }
      const minimized = outcome.minimized;
      if (minimized.support.length > strength) {
        minimizeMisses.push(overStrengthMiss(strength, row.index));
        continue;
      }
      for (const slot of minimized.support) {
        const spec = specs.get(slot);
        if (spec === undefined) {
          noteUnknown(slot);
          continue;
        }
        if (runs >= budget) {
          auditNotes.push(NECESSITY_BUDGET_MISS);
          truncated = true;
          budgetStopped = true;
          break;
        }
        const check = checkNecessity({ task, oracle, row: minimized.row, slot });
        runs += check.runs;
        if (!check.necessary) continue;
        detections.push({
          slot,
          kind: spec.kind,
          witness: check.pair,
          minimized,
          necessary: true,
        });
      }
      if (budgetStopped) break;
    }
  } else {
    // cover-with-defaults: the exact arm keeps necessary-only detections.
    let budgetStopped = false;
    for (const row of changedRows) {
      for (const slot of row.differing) {
        const spec = specs.get(slot);
        if (spec === undefined) {
          noteUnknown(slot);
          continue;
        }
        if (runs >= budget) {
          auditNotes.push(NECESSITY_BUDGET_MISS);
          truncated = true;
          budgetStopped = true;
          break;
        }
        const check = checkNecessity({ task, oracle, row, slot });
        runs += check.runs;
        if (!check.necessary) continue;
        detections.push({
          slot,
          kind: spec.kind,
          witness: check.pair,
          minimized: null,
          necessary: true,
        });
      }
      if (budgetStopped) break;
    }
  }

  const dedupedDetections: Detection[] = [];
  const seenDetectionSlots = new Set<string>();
  for (const detection of detections) {
    if (seenDetectionSlots.has(detection.slot)) continue;
    seenDetectionSlots.add(detection.slot);
    dedupedDetections.push(detection);
  }

  const repair = buildRepair({ task, detections: dedupedDetections });
  const finalDetections: readonly Detection[] = dedupedDetections.map((detection) => {
    const repairedKeyLeft = keyfuseKey(task, repair.repairedInputs, detection.witness.left);
    const repairedKeyRight = keyfuseKey(task, repair.repairedInputs, detection.witness.right);
    return {
      slot: detection.slot,
      kind: detection.kind,
      witness: {
        ...detection.witness,
        repairedKeyLeft,
        repairedKeyRight,
        separated: repairedKeyLeft !== repairedKeyRight,
      },
      minimized: detection.minimized,
      necessary: detection.necessary,
    };
  });

  const result: Omit<AuditResult, "digest"> = {
    task: task.id,
    version: task.version,
    strategy,
    strength,
    deterministic: true,
    trapped,
    probes: probe.rows,
    tracedReads,
    detections: finalDetections,
    repair,
    certificate: truncated ? KEYFUSE_CERTIFICATE_TRUNCATED : KEYFUSE_CERTIFICATE,
    misses: mergeFirstOccurrence([
      probeMisses,
      minimizeMisses,
      fixpointMissed ? [FIXPOINT_MISS] : [],
      unknownSlotMisses,
      auditNotes,
    ]),
    runs,
    truncated,
  };
  return { ...result, digest: auditDigest(result) };
}
