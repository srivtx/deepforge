import {
  AdmissionError,
  WARRANT_MAX_CHAIN,
  WARRANT_MAX_GRADE,
  WARRANT_MAX_INCONCLUSIVE_PER_PAIR,
  minGrade,
} from "./types";
import type {
  Append,
  Attempt,
  AuditIssue,
  Digest,
  Grade,
  HeadAnchor,
  PublishedGrades,
  Registry,
  Report,
  Store,
  Value,
  ValueId,
} from "./types";
import { canonicalJson, warrantHash } from "./hash";
import { attemptDigest, chainGenesis, replaySig, valueIdOf } from "./ids";
import { D } from "./grade";
import { ancestors } from "./graph";

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

function capGrade(classes: number): Grade {
  if (classes >= WARRANT_MAX_GRADE) return WARRANT_MAX_GRADE;
  if (classes === 2) return 2;
  if (classes === 1) return 1;
  return 0;
}

function pairKey(attempt: Attempt): string {
  return canonicalJson([attempt.refuter, attempt.family]);
}

function advanceHead(running: Digest, append: Append): Digest {
  try {
    return warrantHash(
      canonicalJson({
        admittedBy: append.admittedBy,
        attempt: attemptDigest(append.attempt),
        prev: running,
        sig: append.sig,
      }),
    );
  } catch {
    return running;
  }
}

interface ChainScan {
  readonly valid: readonly Append[];
  readonly head: Digest;
  readonly issues: readonly AuditIssue[];
}

function scanChain(id: ValueId, chain: readonly Append[]): ChainScan {
  const valid: Append[] = [];
  const issues: AuditIssue[] = [];
  const inconclusiveCounts = new Map<string, number>();
  let running = chainGenesis(id);
  let overflowReported = false;
  for (let index = 0; index < chain.length; index += 1) {
    const append = chain[index];
    const attempt = append.attempt;
    if (!isAttemptShape(attempt)) {
      issues.push({
        kind: "malformed-attempt",
        valueId: id,
        index,
        detail: `append ${index} fails the submit predicates`,
      });
    } else if (append.prev !== running) {
      issues.push({
        kind: "broken-prev",
        valueId: id,
        index,
        detail: `append ${index} prev does not match the running head`,
      });
    } else if (append.sig !== replaySig(append.admittedBy, append.prev, attempt)) {
      issues.push({
        kind: "bad-signature",
        valueId: id,
        index,
        detail: `append ${index} signature does not replay`,
      });
    } else if (index >= WARRANT_MAX_CHAIN) {
      if (!overflowReported) {
        overflowReported = true;
        issues.push({
          kind: "chain-overflow",
          valueId: id,
          index,
          detail: `chain length ${chain.length} exceeds ${WARRANT_MAX_CHAIN}`,
        });
      }
    } else {
      const key = pairKey(attempt);
      const count = inconclusiveCounts.get(key) ?? 0;
      if (attempt.outcome === "inconclusive" && count >= WARRANT_MAX_INCONCLUSIVE_PER_PAIR) {
        issues.push({
          kind: "duplicate-inconclusive",
          valueId: id,
          index,
          detail: `append ${index} repeats an inconclusive pair`,
        });
      } else {
        if (attempt.outcome === "inconclusive") {
          inconclusiveCounts.set(key, count + 1);
        }
        valid.push(append);
      }
    }
    running = advanceHead(running, append);
  }
  if (chain.length > WARRANT_MAX_CHAIN && !overflowReported) {
    issues.push({
      kind: "chain-overflow",
      valueId: id,
      index: WARRANT_MAX_CHAIN,
      detail: `chain length ${chain.length} exceeds ${WARRANT_MAX_CHAIN}`,
    });
  }
  return { valid, head: running, issues };
}

interface ClosureRecomputation {
  readonly grades: ReadonlyMap<ValueId, Grade>;
  readonly head: Digest;
}

function tolerantClosure(store: Store, id: ValueId): readonly ValueId[] {
  const order: ValueId[] = [];
  const visited = new Set<ValueId>([id]);
  const stack: { id: ValueId; next: number }[] = [{ id, next: 0 }];
  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    const value = store.values.get(frame.id);
    if (value === undefined) {
      stack.pop();
      order.push(frame.id);
      continue;
    }
    if (frame.next < value.cites.length) {
      const cite = value.cites[frame.next];
      frame.next += 1;
      if (!visited.has(cite)) {
        visited.add(cite);
        stack.push({ id: cite, next: 0 });
      }
      continue;
    }
    stack.pop();
    order.push(frame.id);
  }
  return order;
}

function closureOf(store: Store, id: ValueId): readonly ValueId[] {
  try {
    return ancestors(store, id);
  } catch {
    return tolerantClosure(store, id);
  }
}

function cycleIssues(store: Store, closure: readonly ValueId[]): readonly AuditIssue[] {
  const issues: AuditIssue[] = [];
  const state = new Map<ValueId, 1 | 2>();
  const visit = (id: ValueId): void => {
    const value = store.values.get(id);
    if (value === undefined) {
      return;
    }
    state.set(id, 1);
    for (const cite of value.cites) {
      const citeState = state.get(cite);
      if (citeState === 1) {
        issues.push({
          kind: "cycle",
          valueId: id,
          index: null,
          detail: `cite ${cite} closes a cycle`,
        });
      } else if (citeState === undefined && store.values.has(cite)) {
        visit(cite);
      }
    }
    state.set(id, 2);
  };
  for (const id of closure) {
    if (!state.has(id)) {
      visit(id);
    }
  }
  return issues;
}

function recomputeClosure(
  id: ValueId,
  store: Store,
  registry: Registry,
  published: PublishedGrades | null,
  issues: AuditIssue[] | null,
): ClosureRecomputation {
  const closure = closureOf(store, id);
  if (issues !== null) {
    for (const issue of cycleIssues(store, closure)) {
      issues.push(issue);
    }
  }
  const grades = new Map<ValueId, Grade>();
  const citedUnknown = new Set<string>();
  let head = chainGenesis(id);
  for (const x of closure) {
    const value = store.values.get(x);
    if (value === undefined) {
      continue;
    }
    const identityBroken =
      valueIdOf(value.op, value.kind, value.payload, value.cites, value.context, value.genesis) !== x;
    if (issues !== null && identityBroken) {
      issues.push({
        kind: "identity-mismatch",
        valueId: x,
        index: null,
        detail: "stored id does not commit to the stored fields (tampered cite record or payload)",
      });
    }
    const scan = scanChain(x, value.chain);
    if (x === id) {
      head = scan.head;
    }
    if (issues !== null) {
      for (const issue of scan.issues) {
        issues.push(issue);
      }
    }
    let grade: Grade;
    if (scan.valid.some((append) => append.attempt.outcome === "refuted")) {
      grade = "dead";
    } else {
      grade = capGrade(D(scan.valid, registry));
      for (const cite of value.cites) {
        if (!store.values.has(cite)) {
          const key = canonicalJson([x, cite]);
          if (issues !== null && !citedUnknown.has(key)) {
            citedUnknown.add(key);
            issues.push({
              kind: "unknown-cite",
              valueId: x,
              index: null,
              detail: `cite ${cite} is not in the store`,
            });
          }
          grade = "dead";
          continue;
        }
        const citeGrade = grades.get(cite);
        grade = minGrade(grade, citeGrade === undefined ? "dead" : citeGrade);
      }
    }
    if (identityBroken) {
      grade = "dead";
    }
    grades.set(x, grade);
    if (issues !== null && published !== null) {
      const advert = published.get(x);
      if (advert !== undefined && advert !== grade) {
        issues.push({
          kind: "grade-mismatch",
          valueId: x,
          index: null,
          detail: `published ${advert} differs from recomputed ${grade}`,
        });
      }
    }
  }
  return { grades, head };
}

function requireValue(id: ValueId, store: Store): Value {
  const value = store.values.get(id);
  if (value === undefined) {
    throw new AdmissionError("unknown-value", `unknown value ${id}`);
  }
  return value;
}

export function audit(
  id: ValueId,
  store: Store,
  registry: Registry,
  published: PublishedGrades,
  anchor: HeadAnchor | null,
): Report {
  const value = requireValue(id, store);
  const issues: AuditIssue[] = [];
  const { grades, head } = recomputeClosure(id, store, registry, published, issues);
  const recomputed = grades.get(id) ?? "dead";
  if (anchor !== null) {
    if (
      anchor.valueId !== id ||
      anchor.length !== value.chain.length ||
      anchor.head !== head ||
      anchor.published !== recomputed
    ) {
      issues.push({
        kind: "head-mismatch",
        valueId: id,
        index: null,
        detail: "anchor does not match the recomputed chain",
      });
    }
  }
  return {
    valueId: id,
    recomputed,
    published: published.get(id) ?? null,
    ok: issues.length === 0,
    issues,
  };
}

export function recomputeGrades(
  id: ValueId,
  store: Store,
  registry: Registry,
): ReadonlyMap<ValueId, Grade> {
  requireValue(id, store);
  return recomputeClosure(id, store, registry, null, null).grades;
}
