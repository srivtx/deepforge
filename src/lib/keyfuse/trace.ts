/**
 * KeyFuse virtual tracer — the recording facade behind `createVirtualOracle`.
 *
 * `createVirtualOracle(task)` turns a pure `VirtualTask` into a `TaskOracle`.
 * Each call builds a fresh `TracedEnv` that resolves every read through the
 * assignment (falling back to the universe baseline) and appends a
 * `{slot, value}` record for the read, in read order. Recording happens in
 * the facade, so for a task that only touches the facade the read list is
 * exact by construction. This is not OS tracing: a task that reaches around
 * the facade (a native read, a subprocess, the network) is unobserved, and
 * that residual is reported through `trapped`, never hidden.
 *
 * Slot names. `readFile` and `exists` record `file:<path>`; `listDir` records
 * `file:<dir>/` with the sorted names joined by newline; `env` records
 * `env:<NAME>`; `cwd`, `locale`, `timezone`, `rng`, and `clock` are singleton
 * slots named by kind. A read of a slot absent from the universe is still
 * recorded so the audit can flag an unknown-slot miss; an unknown env
 * variable resolves to the exact absence sentinel NUL + "absent" so absence
 * is never confused with an empty value, and every other unknown slot
 * resolves to the empty string. `exists` is a model query, not a filesystem
 * call: a path exists when its slot is declared by the assignment or the
 * universe, and the recorded value is "1" or "0".
 *
 * Values. The assignment value wins when present; otherwise the universe
 * baseline for that slot; otherwise the unknown-slot value above. `rng()`
 * returns the first draw of `mulberry32(fnv1a32("rng:" + value))` and `now()`
 * returns `Number(value)`, so both are pure functions of the resolved value.
 * Nothing here reads an ambient clock or randomness, storage, or the network,
 * and no input is mutated: the ambient record handed to the task is a copy.
 *
 * Untrapped-read check. After the normal run, the oracle runs the task once
 * more with every ambient value shifted (append "~shift", same keys) and sets
 * `trapped:false` only when the output moves while the normal run recorded no
 * slot read. A task stable under that one shift but unstable elsewhere is not
 * caught: this is one sample, not a proof. The re-run is internal to the
 * oracle call and counts as one run. A throwing `run` is reported as
 * `{ok:false, reason:"error"}` with `trapped:true` — an error is not evidence
 * of an untrapped read, and no second run is attempted.
 */

import type {
  Assignment,
  OracleRun,
  SlotRead,
  TaskOracle,
  TracedEnv,
  VirtualTask,
} from "./types";
import { fnv1a32 } from "./hash";
import { slotName } from "./slots";

/** Exact absence marker for env reads; distinct from the empty string. */
const ENV_ABSENT = "\u0000absent";

const THREW_NOTE = "task.run threw";
const SHIFT_THREW_NOTE = "shifted-ambient re-run threw";
const UNTRAPPED_NOTE = "output moved under a shifted ambient with no recorded slot read";

/** UTF-16 code-unit comparison; locale-independent by construction. */
function compareCodeUnit(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Pure mulberry32 generator: the standard 32-bit state construction with
 * explicit int32 coercions so every engine produces the same sequence. The
 * returned closure is the only state; `seed` is not retained otherwise.
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)) | 0;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** First draw of the seeded generator: pure in the seed string. */
function firstRngDraw(seed: string): number {
  return mulberry32(fnv1a32(`rng:${seed}`))();
}

/** Same keys as `ambient`, every value suffixed; nothing added or dropped. */
function shiftEveryValue(ambient: Assignment): Assignment {
  const shifted: Record<string, string> = {};
  for (const key of Object.keys(ambient)) {
    shifted[key] = `${ambient[key]}~shift`;
  }
  return shifted;
}

/**
 * Build one recording facade over `assignment`. `reads` receives every read
 * (including repeats, because `exists` and `readFile` can observe the same
 * slot name with different values); `baselines` is the universe lookup used
 * when the assignment omits a declared slot.
 */
function recordingEnv(
  assignment: Assignment,
  baselines: ReadonlyMap<string, string>,
  reads: SlotRead[],
): TracedEnv {
  const hasOwn = (slot: string): boolean =>
    Object.prototype.hasOwnProperty.call(assignment, slot);

  const resolve = (slot: string): string => {
    if (hasOwn(slot)) return assignment[slot];
    const baseline = baselines.get(slot);
    if (baseline !== undefined) return baseline;
    return slot.startsWith("env:") ? ENV_ABSENT : "";
  };

  const record = (slot: string, value: string): void => {
    reads.push({ slot, value });
  };

  return {
    readFile(path: string): string {
      const slot = `file:${path}`;
      const value = resolve(slot);
      record(slot, value);
      return value;
    },
    listDir(dir: string): readonly string[] {
      const slot = `file:${dir}/`;
      const raw = resolve(slot);
      const names: string[] = raw === "" ? [] : raw.split("\n");
      names.sort(compareCodeUnit);
      record(slot, names.join("\n"));
      return names;
    },
    exists(path: string): boolean {
      const slot = `file:${path}`;
      const present = hasOwn(slot) || baselines.has(slot);
      record(slot, present ? "1" : "0");
      return present;
    },
    env(name: string): string {
      const slot = `env:${name}`;
      const value = resolve(slot);
      record(slot, value);
      return value;
    },
    cwd(): string {
      const value = resolve("cwd");
      record("cwd", value);
      return value;
    },
    locale(): string {
      const value = resolve("locale");
      record("locale", value);
      return value;
    },
    timezone(): string {
      const value = resolve("timezone");
      record("timezone", value);
      return value;
    },
    rng(): number {
      const value = resolve("rng");
      record("rng", value);
      return firstRngDraw(value);
    },
    now(): number {
      const value = resolve("clock");
      record("clock", value);
      return Number(value);
    },
  };
}

/**
 * The virtual adapter: a deterministic oracle over `task.run`. One oracle
 * call is one normal run plus, when the normal run succeeds, one shifted-
 * ambient re-run for the untrapped-read check; the shifted run's reads are
 * discarded so the returned read list belongs to the assignment alone.
 */
export function createVirtualOracle(task: VirtualTask): TaskOracle {
  const baselines = new Map<string, string>();
  for (const spec of task.universe.slots) {
    baselines.set(slotName(spec), spec.baseline);
  }

  return (assignment: Assignment): OracleRun => {
    const reads: SlotRead[] = [];
    let output: string;
    try {
      output = task.run(recordingEnv(assignment, baselines, reads), { ...assignment });
    } catch {
      return {
        outcome: { ok: false, reason: "error" },
        reads,
        trapped: true,
        notes: [THREW_NOTE],
      };
    }

    const notes: string[] = [];
    let trapped = true;
    try {
      const shiftedOutput = task.run(
        recordingEnv(assignment, baselines, []),
        shiftEveryValue(assignment),
      );
      if (shiftedOutput !== output && reads.length === 0) {
        trapped = false;
        notes.push(UNTRAPPED_NOTE);
      }
    } catch {
      notes.push(SHIFT_THREW_NOTE);
    }

    return { outcome: { ok: true, output }, reads, trapped, notes };
  };
}

/**
 * Unique slot names in a run's read list, first-seen order. A read list may
 * repeat a name (`exists` then `readFile` on one path), so this is the
 * projection used by audits and fixpoint passes.
 */
export function readSlotNames(run: OracleRun): readonly string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const read of run.reads) {
    if (!seen.has(read.slot)) {
      seen.add(read.slot);
      names.push(read.slot);
    }
  }
  return names;
}
