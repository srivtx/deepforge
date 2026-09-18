/**
 * KeyFuse probe generators — the covering array and the exact Hamming ball.
 *
 * Both builders are deterministic: slots are ordered by slot name (ties by
 * universe position), subsets are enumerated lexicographically, and values
 * are enumerated baseline-before-top, so the same universe and strength
 * produce byte-identical rows on every run. No RNG, no clock, no storage, and
 * no import outside this directory.
 *
 * `buildCoveringArray` is the cheap approximation from blueprint §2.3: an
 * AETG-style greedy over the binary domain {baseline, top}. It repeatedly
 * takes the first uncovered non-trivial t-way tuple, seeds a row with it,
 * extends the remaining slots in slot-name order choosing the value that
 * covers the most still-uncovered tuples (ties to baseline), and marks every
 * tuple the finished row covers. The all-baseline tuple is skipped because
 * the baseline run covers it, and `t` is clamped to the slot count. The size
 * is reported, never claimed minimal.
 *
 * `buildCoverWithDefaults` is the exact method (C3): every non-baseline
 * assignment within Hamming distance `t` of the baseline, enumerated by
 * nonempty slot subset and then by value combination over each slot's full
 * value set, including sentinels. It is the ground truth the array is
 * compared against; the array is an approximation whose misses must be
 * reported, never a claim of soundness.
 *
 * `verifyCoverage` checks the array against every non-trivial t-way tuple
 * over each slot's full value set, so a binary array on a sentinel-carrying
 * universe honestly reports the tuples it cannot realize. `hammingBallSize`
 * counts the exact set without materializing it: the C3
 * `sum over nonempty S with |S| <= t of prod (v_i - 1)` cost.
 */

import type { Assignment, SlotSpec, SlotUniverse } from "./types";
import { slotName, slotValues } from "./slots";

interface TupleChoice {
  readonly slot: number;
  readonly top: boolean;
}

/** Fractional strengths floor; non-positive strengths mean no tuples; infinity clamps. */
function effectiveStrength(slotCount: number, strength: number): number {
  if (Number.isNaN(strength)) return 0;
  if (strength === Infinity) return slotCount;
  const floored = Math.floor(strength);
  if (floored <= 0) return 0;
  return floored > slotCount ? slotCount : floored;
}

/** Universe positions ordered by slot name, ties by position; the "slot order". */
function slotOrder(universe: SlotUniverse): readonly number[] {
  const entries = universe.slots.map((spec, index) => ({
    name: slotName(spec),
    index,
  }));
  entries.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return a.index - b.index;
  });
  return entries.map((entry) => entry.index);
}

/** Visits every `size`-subset of `0..count-1` in lexicographic order. */
function forEachCombination(
  count: number,
  size: number,
  visit: (positions: readonly number[]) => void,
): void {
  if (size < 0 || size > count) return;
  const positions: number[] = [];
  const walk = (start: number, remaining: number): void => {
    if (remaining === 0) {
      visit(positions.slice());
      return;
    }
    for (let index = start; index <= count - remaining; index += 1) {
      positions.push(index);
      walk(index + 1, remaining - 1);
      positions.pop();
    }
  };
  walk(0, size);
}

function tupleKey(tuple: readonly TupleChoice[]): string {
  return tuple.map((choice) => `${choice.slot}:${choice.top ? "T" : "B"}`).join(",");
}

function tupleMatches(tuple: readonly TupleChoice[], top: readonly boolean[]): boolean {
  for (const choice of tuple) {
    if (top[choice.slot] !== choice.top) return false;
  }
  return true;
}

function countMatching(
  uncovered: ReadonlyMap<string, readonly TupleChoice[]>,
  top: readonly boolean[],
  assigned: readonly boolean[],
): number {
  let count = 0;
  for (const tuple of uncovered.values()) {
    let matched = true;
    for (const choice of tuple) {
      if (!assigned[choice.slot] || top[choice.slot] !== choice.top) {
        matched = false;
        break;
      }
    }
    if (matched) count += 1;
  }
  return count;
}

/** Non-trivial t-way tuples over {baseline, top}, in slot-name / baseline-first order. */
function binaryTuples(order: readonly number[], strength: number): readonly (readonly TupleChoice[])[] {
  const tuples: TupleChoice[][] = [];
  forEachCombination(order.length, strength, (positions) => {
    const slots = positions.map((position) => order[position]);
    const patternCount = 2 ** strength;
    for (let mask = 1; mask < patternCount; mask += 1) {
      const tuple: TupleChoice[] = [];
      for (let index = 0; index < strength; index += 1) {
        const bit = Math.floor(mask / 2 ** (strength - 1 - index)) % 2 === 1;
        tuple.push({ slot: slots[index], top: bit });
      }
      tuples.push(tuple);
    }
  });
  return tuples;
}

function rowFromTop(universe: SlotUniverse, top: readonly boolean[]): Assignment {
  const row: Record<string, string> = {};
  universe.slots.forEach((spec, index) => {
    row[slotName(spec)] = top[index] ? spec.top : spec.baseline;
  });
  return row;
}

/**
 * Deterministic AETG-style strength-`t` covering array over {baseline, top}.
 * Coverage is verified by `verifyCoverage`, never assumed.
 */
export function buildCoveringArray(
  universe: SlotUniverse,
  t: number,
): readonly Assignment[] {
  const order = slotOrder(universe);
  const strength = effectiveStrength(order.length, t);
  if (strength <= 0) return [];
  const uncovered = new Map<string, readonly TupleChoice[]>();
  for (const tuple of binaryTuples(order, strength)) {
    uncovered.set(tupleKey(tuple), tuple);
  }
  const rows: Assignment[] = [];
  while (uncovered.size > 0) {
    const seed = uncovered.values().next().value;
    if (seed === undefined) break;
    const top = new Array<boolean>(universe.slots.length).fill(false);
    const assigned = new Array<boolean>(universe.slots.length).fill(false);
    for (const choice of seed) {
      top[choice.slot] = choice.top;
      assigned[choice.slot] = true;
    }
    for (const slot of order) {
      if (assigned[slot]) continue;
      let bestTop = false;
      let bestCount = -1;
      for (const candidate of [false, true]) {
        top[slot] = candidate;
        assigned[slot] = true;
        const count = countMatching(uncovered, top, assigned);
        if (count > bestCount) {
          bestCount = count;
          bestTop = candidate;
        }
      }
      top[slot] = bestTop;
    }
    rows.push(rowFromTop(universe, top));
    const covered: string[] = [];
    uncovered.forEach((tuple, key) => {
      if (tupleMatches(tuple, top)) covered.push(key);
    });
    for (const key of covered) uncovered.delete(key);
  }
  return rows;
}

function nonBaselineValues(spec: SlotSpec): readonly string[] {
  return slotValues(spec).slice(1);
}

/**
 * Exact cover of the Hamming ball: every non-baseline assignment within
 * distance `t` of the baseline, ordered by subset size, subset, then value
 * combination. Completeness is the point; `hammingBallSize` predicts its
 * length.
 */
export function buildCoverWithDefaults(
  universe: SlotUniverse,
  t: number,
): readonly Assignment[] {
  const order = slotOrder(universe);
  const strength = effectiveStrength(order.length, t);
  if (strength <= 0) return [];
  const rows: Assignment[] = [];
  for (let size = 1; size <= strength; size += 1) {
    forEachCombination(order.length, size, (positions) => {
      const slots = positions.map((position) => order[position]);
      const values = slots.map((slot) => nonBaselineValues(universe.slots[slot]));
      const chosen: string[] = new Array(slots.length);
      const emit = (depth: number): void => {
        if (depth === slots.length) {
          const row: Record<string, string> = {};
          universe.slots.forEach((spec) => {
            row[slotName(spec)] = spec.baseline;
          });
          slots.forEach((slot, index) => {
            row[slotName(universe.slots[slot])] = chosen[index];
          });
          rows.push(row);
          return;
        }
        for (const value of values[depth]) {
          chosen[depth] = value;
          emit(depth + 1);
        }
      };
      emit(0);
    });
  }
  return rows;
}

function tupleLabel(
  universe: SlotUniverse,
  slots: readonly number[],
  chosen: readonly string[],
): string {
  const parts = slots.map(
    (slot, index) =>
      `${slotName(universe.slots[slot])}=${JSON.stringify(chosen[index])}`,
  );
  return `(${parts.join(", ")})`;
}

/**
 * Coverage of every non-trivial t-way tuple over each slot's full value set
 * (sentinels included) by some row; missing tuples are listed in enumeration
 * order and labelled by slot name.
 */
export function verifyCoverage(
  universe: SlotUniverse,
  t: number,
  rows: readonly Assignment[],
): { readonly complete: boolean; readonly missing: readonly string[] } {
  const order = slotOrder(universe);
  const strength = effectiveStrength(order.length, t);
  const missing: string[] = [];
  if (strength <= 0) return { complete: true, missing };
  forEachCombination(order.length, strength, (positions) => {
    const slots = positions.map((position) => order[position]);
    const values = slots.map((slot) => slotValues(universe.slots[slot]));
    const chosen: string[] = new Array(slots.length);
    const check = (depth: number): void => {
      if (depth === slots.length) {
        let allBaseline = true;
        for (let index = 0; index < slots.length; index += 1) {
          if (chosen[index] !== universe.slots[slots[index]].baseline) {
            allBaseline = false;
            break;
          }
        }
        if (!allBaseline) {
          const names = slots.map((slot) => slotName(universe.slots[slot]));
          const found = rows.some((row) =>
            names.every((name, index) => row[name] === chosen[index]),
          );
          if (!found) missing.push(tupleLabel(universe, slots, chosen));
        }
        return;
      }
      for (const value of values[depth]) {
        chosen[depth] = value;
        check(depth + 1);
      }
    };
    check(0);
  });
  return { complete: missing.length === 0, missing };
}

/**
 * Size of the exact Hamming ball around the baseline:
 * `sum over nonempty S with |S| <= t of prod over i in S of (v_i - 1)`,
 * where `v_i` counts the slot's deduplicated values. Zero when `t <= 0`.
 */
export function hammingBallSize(universe: SlotUniverse, t: number): number {
  const order = slotOrder(universe);
  const strength = effectiveStrength(order.length, t);
  if (strength <= 0) return 0;
  let total = 0;
  for (let size = 1; size <= strength; size += 1) {
    forEachCombination(order.length, size, (positions) => {
      let product = 1;
      for (const position of positions) {
        product *= Math.max(0, slotValues(universe.slots[order[position]]).length - 1);
      }
      total += product;
    });
  }
  return total;
}
