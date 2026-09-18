import {
  AdmissionError,
  RefusedRemintError,
  WARRANT_MARK,
  WARRANT_MAX_CHAIN,
  WARRANT_MAX_INCONCLUSIVE_PER_PAIR,
} from "./types";
import type {
  Append,
  Attempt,
  ContextId,
  Digest,
  PendingAttempt,
  Registry,
  Store,
  Value,
  ValueId,
  VerifierId,
} from "./types";
import { contextGenesis, headDigest, replaySig, valueIdOf } from "./ids";
import { subsumedFamily } from "./registry";

const SEED_PATTERN = /^(0|[1-9][0-9]{0,19})$/;
const SEED_MAX = "18446744073709551615";
const HEX16_PATTERN = /^[0-9a-f]{16}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isSeed(value: unknown): value is string {
  if (typeof value !== "string" || !SEED_PATTERN.test(value)) {
    return false;
  }
  return value.length < SEED_MAX.length || value <= SEED_MAX;
}

function isAttemptShape(value: unknown): value is Attempt {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<Attempt>;
  return (
    isNonEmptyString(candidate.refuter) &&
    isNonEmptyString(candidate.family) &&
    isSeed(candidate.seed) &&
    (candidate.outcome === "survived" ||
      candidate.outcome === "refuted" ||
      candidate.outcome === "inconclusive") &&
    typeof candidate.cost === "number" &&
    Number.isSafeInteger(candidate.cost) &&
    candidate.cost >= 0 &&
    typeof candidate.witness === "string" &&
    HEX16_PATTERN.test(candidate.witness) &&
    isNonEmptyString(candidate.submittedBy)
  );
}

function isPendingShape(value: unknown): value is PendingAttempt {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as { attempt?: unknown; sig?: unknown };
  return (
    isAttemptShape(candidate.attempt) &&
    typeof candidate.sig === "string" &&
    HEX16_PATTERN.test(candidate.sig)
  );
}

function deepFreeze<T>(value: T, seen: WeakSet<object> = new WeakSet()): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  const container = value as object;
  if (seen.has(container)) {
    return value;
  }
  seen.add(container);
  for (const key of Object.getOwnPropertyNames(container)) {
    deepFreeze((container as Record<string, unknown>)[key], seen);
  }
  Object.freeze(container);
  return value;
}

function refutedInChain(chain: readonly Append[]): boolean {
  return chain.some((append) => append.attempt.outcome === "refuted");
}

export function emptyStore(): Store {
  return { values: new Map() };
}

export function getValue(store: Store, id: ValueId): Value | undefined {
  return store.values.get(id);
}

export function assertValue(
  store: Store,
  registry: Registry,
  payload: unknown,
  kind: string,
  context: ContextId,
): { store: Store; id: ValueId } {
  if (
    payload !== null &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, WARRANT_MARK)
  ) {
    throw new AdmissionError(
      "reserved-payload",
      `payload must not carry the reserved key ${WARRANT_MARK}`,
    );
  }
  const genesis = contextGenesis(context);
  const id = valueIdOf("assert", kind, payload, [], context, genesis);
  const existing = store.values.get(id);
  if (existing !== undefined) {
    if (refutedInChain(existing.chain)) {
      throw new RefusedRemintError(id);
    }
    return { store, id };
  }
  const value: Value = Object.freeze({
    id,
    op: "assert",
    kind,
    payload,
    cites: Object.freeze([]) as readonly ValueId[],
    context,
    genesis,
    chain: Object.freeze([]) as readonly Append[],
  });
  const values = new Map(store.values);
  values.set(id, value);
  return { store: { values }, id };
}

export function deriveValue(
  store: Store,
  registry: Registry,
  fDigest: Digest,
  cites: readonly ValueId[],
  context: ContextId,
): { store: Store; id: ValueId } {
  const canonicalCites = [...new Set(cites)].sort();
  const genesis = contextGenesis(context);
  const id = valueIdOf("derive", "derive", fDigest, canonicalCites, context, genesis);
  if (store.values.has(id)) {
    return { store, id };
  }
  const value: Value = Object.freeze({
    id,
    op: "derive",
    kind: "derive",
    payload: fDigest,
    cites: Object.freeze(canonicalCites) as readonly ValueId[],
    context,
    genesis,
    chain: Object.freeze([]) as readonly Append[],
  });
  const values = new Map(store.values);
  values.set(id, value);
  return { store: { values }, id };
}

export function submit(attempt: Attempt, sig: Digest): PendingAttempt {
  if (!isAttemptShape(attempt) || typeof sig !== "string" || !HEX16_PATTERN.test(sig)) {
    throw new AdmissionError("malformed-attempt", "submit: attempt or signature failed syntax checks");
  }
  return deepFreeze({
    attempt: {
      refuter: attempt.refuter,
      family: attempt.family,
      seed: attempt.seed,
      outcome: attempt.outcome,
      cost: attempt.cost,
      witness: attempt.witness,
      submittedBy: attempt.submittedBy,
    },
    sig,
  });
}

export function admit(
  store: Store,
  registry: Registry,
  valueId: ValueId,
  pending: PendingAttempt,
  admittedBy: VerifierId,
): Store {
  const value = store.values.get(valueId);
  if (value === undefined) {
    throw new AdmissionError("unknown-value", `admit: unknown value ${valueId}`);
  }
  if (!isPendingShape(pending)) {
    throw new AdmissionError("malformed-attempt", "admit: pending attempt failed syntax checks");
  }
  const attempt = pending.attempt;
  for (const root of [attempt.refuter, attempt.family]) {
    if (registry.roots.has(root)) {
      continue;
    }
    if (registry.versions.has(root)) {
      throw new AdmissionError("version-not-root", `admit: ${root} is a version, not a root`);
    }
    throw new AdmissionError("unknown-root", `admit: unregistered root ${root}`);
  }
  if (value.chain.length >= WARRANT_MAX_CHAIN) {
    throw new AdmissionError("chain-budget", `admit: chain of ${valueId} is at budget`);
  }
  let inconclusive = 0;
  for (const append of value.chain) {
    if (
      append.attempt.outcome === "inconclusive" &&
      append.attempt.refuter === attempt.refuter &&
      append.attempt.family === attempt.family
    ) {
      inconclusive += 1;
    }
  }
  if (attempt.outcome === "inconclusive" && inconclusive >= WARRANT_MAX_INCONCLUSIVE_PER_PAIR) {
    throw new AdmissionError(
      "duplicate-inconclusive",
      `admit: pair (${attempt.refuter},${attempt.family}) already has an inconclusive attempt`,
    );
  }
  if (subsumedFamily(registry, attempt.refuter, attempt.family, value.chain)) {
    throw new AdmissionError("subsumed-family", `admit: family ${attempt.family} is subsumed`);
  }
  const prev = headDigest(valueId, value.chain);
  if (pending.sig !== replaySig(admittedBy, prev, attempt)) {
    throw new AdmissionError("bad-signature", "admit: replay signature mismatch");
  }
  const append: Append = Object.freeze({ prev, attempt, admittedBy, sig: pending.sig });
  const values = new Map(store.values);
  values.set(
    valueId,
    Object.freeze({ ...value, chain: Object.freeze([...value.chain, append]) as readonly Append[] }),
  );
  return { values };
}

export function chainOf(store: Store, id: ValueId): readonly Append[] {
  const value = store.values.get(id);
  if (value === undefined) {
    throw new AdmissionError("unknown-value", `chainOf: unknown value ${id}`);
  }
  return value.chain;
}

export function why(
  store: Store,
  id: ValueId,
): { readonly chain: readonly Append[]; readonly cites: readonly ValueId[] } {
  const value = store.values.get(id);
  if (value === undefined) {
    throw new AdmissionError("unknown-value", `why: unknown value ${id}`);
  }
  return { chain: value.chain, cites: value.cites };
}
