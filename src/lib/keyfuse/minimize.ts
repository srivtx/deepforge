/**
 * KeyFuse witness minimization and per-slot necessity.
 *
 * `minimizeRowSupport` delta-debugs one changing probe row. Its difference
 * set `D` is the universe slots whose value differs from the baseline, sorted
 * by slot name; the pass splits the current support into two contiguous
 * halves, collapses one half's coordinates back to the baseline, and adopts
 * the reduction only while the oracle output still differs from the baseline
 * output. When neither half can be collapsed the pass stops. Key equality
 * over a shrinking input set is monotone by construction, but output
 * difference is not: collapsing coordinates can restore an output or expose a
 * new one, so ddmin alone can stop early on a support that still contains a
 * redundant coordinate. The exhaustive verification that follows is the
 * contract (C9), not a formality: `oneMinimal` is true only after every
 * single coordinate of the final support has been removed in turn and every
 * removal restored the baseline output at the recorded witness context.
 * Minimality is per recorded witness and never global over the task, and it
 * is never claimed for a support the budget cut short.
 *
 * Budget honesty. Every oracle call is counted in `runs`, including the
 * exhaustive pass, and no call is made once `budget` is reached. When the
 * budget runs out the best support found so far is returned with
 * `oneMinimal:false` and a deterministic miss string; a support is never
 * silently widened or narrowed. `verifyMinimal:false` skips the exhaustive
 * pass and reports `oneMinimal:false` with a miss saying the support was not
 * verified. An oracle error during either phase cannot support a minimality
 * claim and is reported as a miss as well.
 *
 * `checkNecessity` implements C6 for one recorded row and one slot. The
 * right-hand side is the row with exactly that coordinate reset to its
 * baseline value and every other coordinate left at the row's value; the
 * left-hand side is the recorded row's output. The slot is necessary at that
 * witness context exactly when the two outputs differ. An erroring run
 * cannot establish necessity, so it yields `necessary:false` rather than a
 * guess. `slots.collapse` resets every coordinate except one (isolating a
 * slot), which is not the removal witness §2.3/C6 specifies, so the removal
 * side is built explicitly here. The returned pair carries the original
 * declared keys for both sides and PROVISIONAL repaired keys over
 * `declared ∪ {slot}`; audit.ts recomputes the repaired keys with the final
 * implicated union, so those two fields are a display snapshot, not the
 * authoritative repair.
 *
 * Scope and purity. Supports are built from `task.baseline` plus the row's
 * values for the kept coordinates, so coordinates outside the universe are
 * never part of a support and a value missing from the row counts as its
 * baseline. Nothing here reads a clock, randomness, storage, the DOM, or the
 * network, no import outside this directory is used, and no argument is
 * mutated.
 */

import type {
  Assignment,
  KeyFuseTask,
  MinimizedWitness,
  ProbeRow,
  TaskOracle,
  WitnessPair,
} from "./types";
import { differingSlots, slotName } from "./slots";
import { keyfuseKey } from "./repair";

const MINIMIZE_BUDGET_MISS = "budget exhausted during support minimization";
const VERIFY_BUDGET_MISS = "budget exhausted during 1-minimality verification";
const VERIFY_SKIPPED_MISS = "1-minimality verification skipped (verifyMinimal:false)";
const MINIMIZE_ERROR_MISS = "oracle error during support minimization";
const VERIFY_ERROR_MISS = "oracle error during 1-minimality verification";
const NOT_CHANGING_MISS = "row output equals the baseline output; support left empty";

type CallKind = "differs" | "restores" | "unknown" | "budget";

interface CallResult {
  readonly kind: CallKind;
  readonly output: string;
}

/** UTF-16 code-unit comparison; locale-independent by construction. */
function compareSlotNames(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Deduplicated names in slot-name order; the input array is not mutated. */
function sortedUnique(names: readonly string[]): readonly string[] {
  const unique = new Set<string>();
  for (const name of names) unique.add(name);
  return [...unique].sort(compareSlotNames);
}

/**
 * The all-baseline assignment with the row's values restored for `support`.
 * A coordinate missing from the row keeps its baseline value, so a support
 * never invents a value.
 */
function assignmentForSupport(
  task: KeyFuseTask,
  row: ProbeRow,
  support: readonly string[],
): Assignment {
  const assignment: Record<string, string> = { ...task.baseline };
  for (const name of support) {
    const value = row.assignment[name];
    if (value !== undefined) assignment[name] = value;
  }
  return assignment;
}

/** Baseline value for a slot: the task baseline when present, else the spec. */
function baselineValue(task: KeyFuseTask, slot: string): string {
  for (const spec of task.universe.slots) {
    if (slotName(spec) === slot) return task.baseline[slot] ?? spec.baseline;
  }
  return task.baseline[slot] ?? "";
}

/**
 * Greedy half-split delta debugging plus exhaustive 1-minimality verification
 * for one changing row. Deterministic, budget-bounded, and read-only; see the
 * module docblock for the contract and the honesty rules.
 */
export function minimizeRowSupport(args: {
  readonly task: KeyFuseTask;
  readonly oracle: TaskOracle;
  readonly row: ProbeRow;
  readonly baselineOutput: string;
  readonly verifyMinimal: boolean;
  readonly budget: number;
}): { readonly minimized: MinimizedWitness; readonly runs: number; readonly misses: readonly string[] } {
  const { task, oracle, row, baselineOutput, verifyMinimal, budget } = args;

  let runs = 0;
  const misses: string[] = [];
  const missSeen = new Set<string>();
  const addMiss = (text: string): void => {
    if (!missSeen.has(text)) {
      missSeen.add(text);
      misses.push(text);
    }
  };

  const call = (assignment: Assignment): CallResult => {
    if (runs >= budget) return { kind: "budget", output: "" };
    const run = oracle(assignment);
    runs += 1;
    if (!run.outcome.ok) return { kind: "unknown", output: "" };
    return {
      kind: run.outcome.output !== baselineOutput ? "differs" : "restores",
      output: run.outcome.output,
    };
  };

  const differenceSet = [...differingSlots(row.assignment, task.baseline, task.universe)]
    .sort(compareSlotNames);

  if (row.output === baselineOutput || differenceSet.length === 0) {
    addMiss(NOT_CHANGING_MISS);
    return {
      minimized: {
        row: {
          index: row.index,
          assignment: row.assignment,
          differing: [],
          output: row.output,
          changed: false,
        },
        support: [],
        oneMinimal: false,
        passes: 0,
        verifyRuns: 0,
      },
      runs,
      misses,
    };
  }

  let support = differenceSet;
  let bestAssignment: Assignment = row.assignment;
  let bestOutput = row.output;
  let passes = 0;
  let budgetHit = false;

  while (support.length > 1) {
    const middle = Math.floor(support.length / 2);
    const first = support.slice(0, middle);
    const second = support.slice(middle);

    const keepSecondCandidate = assignmentForSupport(task, row, second);
    const keepSecond = call(keepSecondCandidate);
    if (keepSecond.kind === "budget") {
      addMiss(MINIMIZE_BUDGET_MISS);
      budgetHit = true;
      break;
    }
    if (keepSecond.kind === "unknown") addMiss(MINIMIZE_ERROR_MISS);
    if (keepSecond.kind === "differs") {
      support = second;
      bestAssignment = keepSecondCandidate;
      bestOutput = keepSecond.output;
      passes += 1;
      continue;
    }

    const keepFirstCandidate = assignmentForSupport(task, row, first);
    const keepFirst = call(keepFirstCandidate);
    if (keepFirst.kind === "budget") {
      addMiss(MINIMIZE_BUDGET_MISS);
      budgetHit = true;
      break;
    }
    if (keepFirst.kind === "unknown") addMiss(MINIMIZE_ERROR_MISS);
    if (keepFirst.kind === "differs") {
      support = first;
      bestAssignment = keepFirstCandidate;
      bestOutput = keepFirst.output;
      passes += 1;
      continue;
    }

    break;
  }

  let oneMinimal = false;
  let verifyRuns = 0;

  if (!verifyMinimal) {
    addMiss(VERIFY_SKIPPED_MISS);
  } else if (budgetHit) {
    addMiss(VERIFY_BUDGET_MISS);
  } else {
    oneMinimal = true;
    for (const removal of support) {
      const withoutRemoval = support.filter((name) => name !== removal);
      const outcome = call(assignmentForSupport(task, row, withoutRemoval));
      if (outcome.kind === "budget") {
        addMiss(VERIFY_BUDGET_MISS);
        oneMinimal = false;
        break;
      }
      verifyRuns += 1;
      if (outcome.kind === "unknown") {
        addMiss(VERIFY_ERROR_MISS);
        oneMinimal = false;
      } else if (outcome.kind === "differs") {
        oneMinimal = false;
      }
    }
  }

  return {
    minimized: {
      row: {
        index: row.index,
        assignment: bestAssignment,
        differing: support,
        output: bestOutput,
        changed: bestOutput !== baselineOutput,
      },
      support,
      oneMinimal,
      passes,
      verifyRuns,
    },
    runs,
    misses,
  };
}

/**
 * Per-slot necessity at one recorded row's witness context (C6): exactly one
 * oracle call, the row with `slot` reset to its baseline value, compared to
 * the row's recorded output. The returned pair is the minimal collision
 * witness; its repaired keys are provisional (see the module docblock).
 */
export function checkNecessity(args: {
  readonly task: KeyFuseTask;
  readonly oracle: TaskOracle;
  readonly row: ProbeRow;
  readonly slot: string;
}): { readonly necessary: boolean; readonly pair: WitnessPair; readonly runs: number } {
  const { task, oracle, row, slot } = args;

  const right: Assignment = { ...row.assignment, [slot]: baselineValue(task, slot) };
  const run = oracle(right);
  const outputRight = run.outcome.ok ? run.outcome.output : "";
  const outputLeft = row.output;
  const necessary = run.outcome.ok && outputLeft !== outputRight;

  const provisional = sortedUnique([...task.declared, slot]);
  const originalKeyLeft = keyfuseKey(task, task.declared, row.assignment);
  const originalKeyRight = keyfuseKey(task, task.declared, right);
  const repairedKeyLeft = keyfuseKey(task, provisional, row.assignment);
  const repairedKeyRight = keyfuseKey(task, provisional, right);

  return {
    necessary,
    pair: {
      left: row.assignment,
      right,
      differing: [slot],
      outputLeft,
      outputRight,
      originalKeyLeft,
      originalKeyRight,
      repairedKeyLeft,
      repairedKeyRight,
      keyCollision: necessary && originalKeyLeft === originalKeyRight,
      separated: repairedKeyLeft !== repairedKeyRight,
    },
    runs: 1,
  };
}
