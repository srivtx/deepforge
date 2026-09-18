/**
 * KeyFuse key repair — the conservative key and per-witness separation.
 *
 * `keyfuseKey` is the deterministic cache-key identifier used for both the
 * declared key and the repaired key: 16 lowercase hex characters from
 * `keyfuseHash(canonicalJson(payload))`, where the payload is the stable
 * object `{task, version, inputs}` — the task id, the task version, and every
 * input name paired with the value it has in the assignment. Inputs are
 * sorted by name and deduplicated before the payload is built, and a value
 * missing from the assignment counts as the empty string, so the same task,
 * inputs, and assignment always produce the same key on every engine. It is
 * an identifier, not a cryptographic digest — the 64-bit FNV construction is
 * not a security boundary.
 *
 * `buildRepair` implements §2.4. `declared` is the sorted, deduplicated
 * declared set. `implicated` is the sorted, deduplicated slot of every
 * detection, including `ca` detections whose `necessary` flag is false, so
 * the repaired set is a conservative over-approximation of detected
 * dependence rather than a claim about real dependence. `repairedInputs` is
 * `declared ∪ implicated`. Every witness's repaired keys are recomputed in
 * this function with the final `repairedInputs`, never with the provisional
 * union snapshot stored on the pair. A witness is a collision when its
 * recorded `keyCollision` is true (the original declared keys were equal and
 * the outputs differed) and is separated when its two repaired keys differ. A
 * collision whose repaired keys still match is a residual collision: it is
 * reported by the id `<task>::<slot>` and never hidden. The function returns
 * only the `RepairResult`; oracle runs and misses belong to the audit layer.
 *
 * Both functions are pure: no ambient state, no storage, no clock or
 * randomness, no import outside this directory, and no argument mutated.
 */

import type { Assignment, Detection, KeyFuseTask, RepairResult } from "./types";
import { canonicalJson, keyfuseHash } from "./hash";

/** UTF-16 code-unit comparison; locale-independent by construction. */
function compareNames(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Deduplicated names in name order; the input array is not mutated. */
function sortedUnique(names: readonly string[]): readonly string[] {
  const unique = new Set<string>();
  for (const name of names) unique.add(name);
  return [...unique].sort(compareNames);
}

/**
 * 16 lowercase hex characters over the task id, the task version, and the
 * sorted, deduplicated inputs with their assignment values (missing value
 * `""`). Deterministic; not cryptographic.
 */
export function keyfuseKey(
  task: { readonly id: string; readonly version: string },
  inputs: readonly string[],
  assignment: Assignment,
): string {
  const names = sortedUnique(inputs);
  const pairs = names.map(
    (name): [string, string] => [name, assignment[name] ?? ""],
  );
  return keyfuseHash(
    canonicalJson({ task: task.id, version: task.version, inputs: pairs }),
  );
}

/**
 * Declared ∪ implicated with every witness's repaired keys recomputed over
 * the final union, plus the collision and separation counts and every
 * residual collision. Conservative by construction; see the module docblock.
 */
export function buildRepair(args: {
  readonly task: KeyFuseTask;
  readonly detections: readonly Detection[];
}): RepairResult {
  const { task, detections } = args;

  const declared = sortedUnique(task.declared);
  const implicated = sortedUnique(detections.map((detection) => detection.slot));
  const repairedInputs = sortedUnique([...declared, ...implicated]);

  const ordered = [...detections].sort((a, b) => compareNames(a.slot, b.slot));
  let separateWitnesses = 0;
  let collisionWitnesses = 0;
  const residualCollisions: string[] = [];
  const residualSeen = new Set<string>();

  for (const detection of ordered) {
    const { witness } = detection;
    const repairedKeyLeft = keyfuseKey(task, repairedInputs, witness.left);
    const repairedKeyRight = keyfuseKey(task, repairedInputs, witness.right);
    if (!witness.keyCollision) continue;
    collisionWitnesses += 1;
    if (repairedKeyLeft !== repairedKeyRight) {
      separateWitnesses += 1;
      continue;
    }
    const witnessId = `${task.id}::${detection.slot}`;
    if (!residualSeen.has(witnessId)) {
      residualSeen.add(witnessId);
      residualCollisions.push(witnessId);
    }
  }

  return {
    declared,
    implicated,
    repairedInputs,
    separateWitnesses,
    collisionWitnesses,
    residualCollisions,
  };
}
