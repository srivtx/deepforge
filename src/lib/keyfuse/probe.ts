/**
 * KeyFuse probe strategies — deterministic, budget-bounded oracle sampling.
 *
 * `runProbe` executes one of the five strategies from blueprint §2.3 against
 * an oracle and reports observations only: executed rows (assignment,
 * differing slots, output, changed flag), the union of slot names read across
 * those rows in first-seen order, the oracle-call count, truncation, and the
 * misses it saw. It never decides relevance, never minimizes, and never
 * claims that an effect exists or does not exist — the audit layer interprets
 * rows, and a probe miss is recorded, not explained away.
 *
 * Row 0 is always the baseline assignment (`changed:false`, `differing:[]`).
 * `single-trace` stops there; `baseline-toggle` adds one row per universe slot
 * with that slot at `top`; `ca` and `ca-ddmin` add the same greedy covering
 * array rows (minimization and necessity happen later in the audit);
 * `cover-with-defaults` adds the exact Hamming-ball rows, and is refused with
 * the baseline row only plus `truncated:true` when the ball exceeds
 * `KEYFUSE_EXACT_MAX_ROWS`. The size check goes through `hammingBallSize`,
 * which counts exactly the rows `buildCoverWithDefaults` would enumerate
 * without materializing them.
 *
 * Row semantics. `differing` is the slot names unlike the baseline in universe
 * order; `changed` is `output !== baseline output` for successful runs, and an
 * error outcome is recorded with `output:""`, `changed:false`, and the miss
 * `row <index> oracle error`. `tracedReads` unions the reads of every executed
 * row, so a read inside an erroring run still counts; a read whose slot is
 * not in the universe is recorded and flagged as `read of unknown slot
 * <name>` on first occurrence.
 *
 * Budget. The probe stops at a row boundary before exceeding
 * `options.budget ?? KEYFUSE_MAX_RUNS` oracle calls, sets `truncated:true`,
 * and adds `budget exhausted before coverage completed` once. Identical
 * inputs produce identical outcomes: no clock, no randomness, no storage, and
 * no import outside `./types`, `./slots`, `./cover`.
 */

import type {
  Assignment,
  KeyFuseTask,
  ProbeOptions,
  ProbeRow,
  SlotRead,
  TaskOracle,
} from "./types";
import { assignmentWith, differingSlots, slotName } from "./slots";
import { buildCoveringArray, buildCoverWithDefaults, hammingBallSize } from "./cover";

/**
 * Frozen constants from blueprint §3.2, defined here and re-exported by
 * `index.ts`.
 */
export const KEYFUSE_MAX_RUNS = 4_096;
export const KEYFUSE_EXACT_MAX_ROWS = 2_048;
export const KEYFUSE_DEFAULT_STRENGTH = 2;
export const KEYFUSE_MAX_STRENGTH = 3;

const BUDGET_MISS = "budget exhausted before coverage completed";
const EXACT_MISS = "cover-with-defaults row count exceeds KEYFUSE_EXACT_MAX_ROWS";

export interface ProbeOutcome {
  readonly rows: readonly ProbeRow[];
  readonly tracedReads: readonly string[];
  readonly runs: number;
  readonly truncated: boolean;
  readonly misses: readonly string[];
}

/** The additional rows each strategy schedules after the baseline, in order. */
function plannedRows(
  task: KeyFuseTask,
  strategy: ProbeOptions["strategy"],
  strength: number,
): { readonly rows: readonly Assignment[]; readonly exactRejected: boolean } {
  switch (strategy) {
    case "single-trace":
      return { rows: [], exactRejected: false };
    case "baseline-toggle":
      return {
        rows: task.universe.slots.map((spec) =>
          assignmentWith(task.baseline, { [slotName(spec)]: spec.top }),
        ),
        exactRejected: false,
      };
    case "ca":
    case "ca-ddmin":
      return { rows: buildCoveringArray(task.universe, strength), exactRejected: false };
    case "cover-with-defaults":
      if (hammingBallSize(task.universe, strength) > KEYFUSE_EXACT_MAX_ROWS) {
        return { rows: [], exactRejected: true };
      }
      return { rows: buildCoverWithDefaults(task.universe, strength), exactRejected: false };
    default:
      throw new TypeError(`runProbe: unknown strategy ${String(strategy)}`);
  }
}

/**
 * Run one probe strategy against `oracle`. Deterministic, budget-bounded, and
 * read-only: `task` and `oracle` are never mutated, and every returned object
 * is freshly built.
 */
export function runProbe(
  task: KeyFuseTask,
  oracle: TaskOracle,
  options: ProbeOptions,
): ProbeOutcome {
  const budget = options.budget ?? KEYFUSE_MAX_RUNS;
  const strength = options.strength ?? KEYFUSE_DEFAULT_STRENGTH;
  const { universe, baseline } = task;

  const universeNames = new Set<string>();
  for (const spec of universe.slots) universeNames.add(slotName(spec));

  const rows: ProbeRow[] = [];
  const misses: string[] = [];
  const missSeen = new Set<string>();
  const tracedReads: string[] = [];
  const tracedSeen = new Set<string>();
  let runs = 0;
  let truncated = false;

  const addMiss = (text: string): void => {
    if (!missSeen.has(text)) {
      missSeen.add(text);
      misses.push(text);
    }
  };

  const noteReads = (reads: readonly SlotRead[]): void => {
    for (const read of reads) {
      if (!tracedSeen.has(read.slot)) {
        tracedSeen.add(read.slot);
        tracedReads.push(read.slot);
      }
      if (!universeNames.has(read.slot)) {
        addMiss(`read of unknown slot ${read.slot}`);
      }
    }
  };

  const fits = (): boolean => runs + 1 <= budget;

  const plan = plannedRows(task, options.strategy, strength);
  if (plan.exactRejected) {
    truncated = true;
    addMiss(EXACT_MISS);
  }

  if (fits()) {
    const run = oracle(baseline);
    runs += 1;
    noteReads(run.reads);
    if (!run.outcome.ok) addMiss("row 0 oracle error");
    rows.push({
      index: 0,
      assignment: baseline,
      differing: [],
      output: run.outcome.ok ? run.outcome.output : "",
      changed: false,
    });
  } else {
    truncated = true;
    addMiss(BUDGET_MISS);
  }

  const baselineOutput = rows.length > 0 ? rows[0].output : "";

  for (const assignment of plan.rows) {
    if (!fits()) {
      truncated = true;
      addMiss(BUDGET_MISS);
      break;
    }
    const index = rows.length;
    const run = oracle(assignment);
    runs += 1;
    noteReads(run.reads);
    const output = run.outcome.ok ? run.outcome.output : "";
    if (!run.outcome.ok) addMiss(`row ${index} oracle error`);
    rows.push({
      index,
      assignment,
      differing: differingSlots(assignment, baseline, universe),
      output,
      changed: run.outcome.ok && output !== baselineOutput,
    });
  }

  return { rows, tracedReads, runs, truncated, misses };
}
