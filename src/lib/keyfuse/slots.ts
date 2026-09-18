/**
 * KeyFuse slot algebra — names, values, validation, and assignment helpers.
 *
 * A slot is one `kind:id` coordinate of the audited environment. `cwd`,
 * `locale`, and `timezone` are singletons: their id is empty and their name
 * is just the kind; every other kind names itself `${kind}:${id}`. A slot's
 * value set is `[baseline, top, ...sentinels]` deduplicated with first
 * occurrence kept. Every helper here is pure and returns fresh objects; no
 * argument is ever mutated, and no clock, randomness, storage, or import
 * outside this directory is used, so identical universes produce identical
 * assignments on every run.
 *
 * `validateUniverse` is total and advisory: it returns a deterministic list
 * of problem strings (empty means valid) instead of throwing, so a
 * hand-written universe renders with every defect visible at once. Ordered
 * slots follow one comparison rule throughout KeyFuse: two values compare
 * numerically when both are finite numbers under `Number()` with non-empty
 * trimmed text, and lexicographically by UTF-16 code unit otherwise. The
 * baseline of an ordered slot must be a minimum of its value set.
 */

import type { Assignment, SlotSpec, SlotUniverse } from "./types";

/**
 * Frozen slot cap from blueprint §3.2, defined here and re-exported by
 * `index.ts`.
 */
export const KEYFUSE_MAX_SLOTS = 12;

/** `kind` for empty-id singletons (cwd, locale, timezone), else `kind:id`. */
export function slotName(spec: SlotSpec): string {
  return spec.id === "" ? spec.kind : `${spec.kind}:${spec.id}`;
}

/**
 * The slot's value set: `[baseline, top, ...(sentinels ?? [])]` deduplicated
 * preserving first occurrence, so baseline is always index 0 and no value
 * repeats.
 */
export function slotValues(spec: SlotSpec): readonly string[] {
  const values: string[] = [];
  for (const value of [spec.baseline, spec.top, ...(spec.sentinels ?? [])]) {
    if (!values.includes(value)) values.push(value);
  }
  return values;
}

/**
 * Deterministic problem list for a universe; empty means valid. Checks, in
 * slot order: duplicate names, empty baseline, empty top, baseline === top,
 * `ordered` baseline non-minimum (natural order per the module docblock),
 * then the KEYFUSE_MAX_SLOTS cap.
 */
export function validateUniverse(universe: SlotUniverse): readonly string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const spec of universe.slots) {
    const name = slotName(spec);
    if (seen.has(name)) {
      problems.push(`duplicate slot name: ${name}`);
    }
    seen.add(name);
    if (spec.baseline.length === 0) {
      problems.push(`slot ${name}: baseline must be non-empty`);
    }
    if (spec.top.length === 0) {
      problems.push(`slot ${name}: top must be non-empty`);
    }
    if (spec.baseline === spec.top) {
      problems.push(`slot ${name}: baseline and top must differ`);
    }
    if (spec.ordered) {
      for (const other of [spec.top, ...(spec.sentinels ?? [])]) {
        if (compareNatural(other, spec.baseline) < 0) {
          problems.push(
            `slot ${name}: ordered baseline ${JSON.stringify(spec.baseline)} is not the minimum (${JSON.stringify(other)} is smaller)`,
          );
          break;
        }
      }
    }
  }
  if (universe.slots.length > KEYFUSE_MAX_SLOTS) {
    problems.push(
      `universe has ${universe.slots.length} slots; the maximum is ${KEYFUSE_MAX_SLOTS}`,
    );
  }
  return problems;
}

/**
 * Natural-order comparison: numeric when both strings parse as finite numbers
 * (non-empty after trimming, `Number()`), lexicographic by UTF-16 code unit
 * otherwise.
 */
function compareNatural(a: string, b: string): number {
  const numericA = finiteNumber(a);
  const numericB = finiteNumber(b);
  if (numericA !== null && numericB !== null) {
    if (numericA < numericB) return -1;
    if (numericA > numericB) return 1;
    return 0;
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function finiteNumber(text: string): number | null {
  if (text.trim() === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** The all-baseline assignment over the universe, keys in universe order. */
export function baselineAssignment(universe: SlotUniverse): Assignment {
  const baseline: Record<string, string> = {};
  for (const spec of universe.slots) {
    baseline[slotName(spec)] = spec.baseline;
  }
  return baseline;
}

/**
 * A fresh assignment with `changes` applied over `base`; coordinates absent
 * from `base` stay absent unless `changes` supplies them.
 */
export function assignmentWith(
  base: Assignment,
  changes: Readonly<Record<string, string>>,
): Assignment {
  return { ...base, ...changes };
}

/**
 * Slot names whose values differ between `a` and `b`, in universe order; a
 * coordinate absent from either side differs unless absent from both.
 */
export function differingSlots(
  a: Assignment,
  b: Assignment,
  universe: SlotUniverse,
): readonly string[] {
  const differing: string[] = [];
  for (const spec of universe.slots) {
    const name = slotName(spec);
    if (a[name] !== b[name]) differing.push(name);
  }
  return differing;
}

/**
 * The assignment that resets every universe coordinate to its baseline except
 * `slot`, whose value is carried over from `assignment`. Keys outside the
 * universe are dropped, and a `slot` not in the universe yields the baseline
 * assignment.
 */
export function collapse(
  assignment: Assignment,
  slot: string,
  universe: SlotUniverse,
): Assignment {
  const collapsed: Record<string, string> = {};
  for (const spec of universe.slots) {
    const name = slotName(spec);
    collapsed[name] =
      name === slot ? assignment[name] ?? spec.baseline : spec.baseline;
  }
  return collapsed;
}
