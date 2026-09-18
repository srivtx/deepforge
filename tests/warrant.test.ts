import { describe, expect, it } from "bun:test";
import {
  AdmissionError,
  D,
  RefusedRemintError,
  WARRANT_MARK,
  WARRANT_MAX_CHAIN,
  WARRANT_MAX_GRADE,
  admit,
  ancestors,
  assertValue,
  audit,
  chainGenesis,
  chainOf,
  cone,
  contextGenesis,
  demotionSanity,
  deriveValue,
  emptyRegistry,
  emptyStore,
  getValue,
  headDigest,
  isDead,
  lambda,
  minGrade,
  overlapRatio,
  registerRoot,
  replaySig,
  rootIdOf,
  submit,
  valueIdOf,
  warrantHash,
} from "@/lib/warrant";
import type {
  Append,
  Attempt,
  ContextId,
  Digest,
  Grade,
  HeadAnchor,
  Outcome,
  Registry,
  RootId,
  Store,
  Value,
  ValueId,
} from "@/lib/warrant";

const AUTHOR = "warrant-test-author";
const VERIFIER = "warrant-test-verifier";
const SUBMITTER = "warrant-test-submitter";
const WITNESS = "0123456789abcdef";
const CONTEXT = "warrant-test:other";

function attemptFor(
  refuter: RootId,
  family: RootId,
  seed: string,
  outcome: Outcome,
): Attempt {
  return { refuter, family, seed, outcome, cost: 0, witness: WITNESS, submittedBy: SUBMITTER };
}

function signedAppend(prev: Digest, attempt: Attempt): Append {
  return { prev, attempt, admittedBy: VERIFIER, sig: replaySig(VERIFIER, prev, attempt) };
}

function chainOfLength(
  id: ValueId,
  length: number,
  attemptAt: (index: number) => Attempt,
): readonly Append[] {
  const chain: Append[] = [];
  for (let index = 0; index < length; index += 1) {
    chain.push(signedAppend(headDigest(id, chain), attemptAt(index)));
  }
  return chain;
}

function handClaim(label: string): {
  readonly id: ValueId;
  readonly start: Digest;
  readonly build: (chain: readonly Append[]) => Value;
} {
  const context = `warrant-test:hand:${label}`;
  const genesis = contextGenesis(context);
  const payload = { label };
  const id = valueIdOf("assert", "claim", payload, [], context, genesis);
  return {
    id,
    start: chainGenesis(id),
    build: (chain) => ({
      id,
      op: "assert",
      kind: "claim",
      payload,
      cites: [],
      context,
      genesis,
      chain,
    }),
  };
}

function rawStore(values: readonly Value[]): Store {
  const map = new Map<ValueId, Value>();
  for (const value of values) {
    map.set(value.id, value);
  }
  return { values: map };
}

function publishAll(store: Store, registry: Registry): Map<ValueId, Grade> {
  const published = new Map<ValueId, Grade>();
  for (const id of store.values.keys()) {
    published.set(id, lambda(store, registry, id));
  }
  return published;
}

function anchorFor(store: Store, registry: Registry, id: ValueId): HeadAnchor {
  const value = getValue(store, id);
  if (value === undefined) {
    throw new Error(`missing value ${id}`);
  }
  return {
    valueId: id,
    head: headDigest(id, value.chain),
    length: value.chain.length,
    published: lambda(store, registry, id),
  };
}

function capture(fn: () => unknown): unknown {
  try {
    fn();
    return null;
  } catch (error) {
    return error;
  }
}

interface MicroWorld {
  readonly root: (spec: string, coverage?: readonly string[]) => RootId;
  readonly claim: (label: string, context?: ContextId) => ValueId;
  readonly derived: (label: string, cites: readonly ValueId[], context?: ContextId) => ValueId;
  readonly challenge: (
    id: ValueId,
    refuter: RootId,
    family: RootId,
    seed: string,
    outcome: Outcome,
  ) => void;
  readonly value: (id: ValueId) => Value;
  readonly registry: () => Registry;
  readonly store: () => Store;
}

function microWorld(): MicroWorld {
  let registry: Registry = emptyRegistry();
  let store: Store = emptyStore();

  const root = (spec: string, coverage: readonly string[] = []): RootId => {
    registry = registerRoot(registry, AUTHOR, spec, coverage);
    return rootIdOf(AUTHOR, spec, [...new Set(coverage)].sort());
  };

  const claim = (label: string, context: ContextId = `warrant-test:${label}`): ValueId => {
    const created = assertValue(store, registry, { label }, "claim", context);
    store = created.store;
    return created.id;
  };

  const derived = (
    label: string,
    cites: readonly ValueId[],
    context: ContextId = `warrant-test:derive:${label}`,
  ): ValueId => {
    const created = deriveValue(
      store,
      registry,
      warrantHash(`warrant-test:${label}`),
      cites,
      context,
    );
    store = created.store;
    return created.id;
  };

  const challenge = (
    id: ValueId,
    refuter: RootId,
    family: RootId,
    seed: string,
    outcome: Outcome,
  ): void => {
    const attempt = attemptFor(refuter, family, seed, outcome);
    const prev = headDigest(id, chainOf(store, id));
    store = admit(
      store,
      registry,
      id,
      submit(attempt, replaySig(VERIFIER, prev, attempt)),
      VERIFIER,
    );
  };

  const value = (id: ValueId): Value => {
    const found = getValue(store, id);
    if (found === undefined) {
      throw new Error(`missing value ${id}`);
    }
    return found;
  };

  return {
    root,
    claim,
    derived,
    challenge,
    value,
    registry: () => registry,
    store: () => store,
  };
}

describe("warrant grade domain", () => {
  it("keeps dead distinct from 0 and absorbing under minGrade", () => {
    const grades: readonly Grade[] = ["dead", 0, 1, 2, 3];
    const dead = grades[0];
    const live = grades[1];
    expect(dead === live).toBe(false);
    expect(isDead(live)).toBe(false);
    expect(isDead(dead)).toBe(true);
    expect(minGrade(dead, WARRANT_MAX_GRADE)).toBe("dead");
    expect(minGrade(WARRANT_MAX_GRADE, dead)).toBe("dead");
    expect(minGrade(dead, dead)).toBe("dead");
  });

  it("takes the numeric minimum among live grades", () => {
    expect(minGrade(0, 3)).toBe(0);
    expect(minGrade(3, 0)).toBe(0);
    expect(minGrade(3, 2)).toBe(2);
    expect(minGrade(2, 3)).toBe(2);
    expect(minGrade(1, 1)).toBe(1);
  });

  it("grades an unchallenged assert at 0", () => {
    const w = microWorld();
    const id = w.claim("unchallenged");
    expect(D(chainOf(w.store(), id), w.registry())).toBe(0);
    expect(lambda(w.store(), w.registry(), id)).toBe(0);
  });

  it("grades an assert at min(K, D) as dependency classes accumulate", () => {
    const w = microWorld();
    const one = w.claim("one-family");
    w.challenge(one, w.root("refuter:r0"), w.root("family:fa", ["a"]), "0", "survived");
    expect(D(chainOf(w.store(), one), w.registry())).toBe(1);
    expect(lambda(w.store(), w.registry(), one)).toBe(1);

    const two = w.claim("two-families");
    w.challenge(two, w.root("refuter:r1"), w.root("family:fb", ["b"]), "0", "survived");
    w.challenge(two, w.root("refuter:r2"), w.root("family:fc", ["c"]), "0", "survived");
    expect(D(chainOf(w.store(), two), w.registry())).toBe(2);
    expect(lambda(w.store(), w.registry(), two)).toBe(2);

    const three = w.claim("three-families");
    w.challenge(three, w.root("refuter:r3"), w.root("family:fd", ["d"]), "0", "survived");
    w.challenge(three, w.root("refuter:r4"), w.root("family:fe", ["e"]), "0", "survived");
    w.challenge(three, w.root("refuter:r5"), w.root("family:ff", ["f"]), "0", "survived");
    expect(D(chainOf(w.store(), three), w.registry())).toBe(3);
    expect(lambda(w.store(), w.registry(), three)).toBe(3);
  });

  it("caps the grade at K = 3 beyond three dependency classes", () => {
    const w = microWorld();
    const id = w.claim("capped");
    const keys = ["a", "b", "c", "d", "e"];
    for (const [index, key] of keys.entries()) {
      w.challenge(
        id,
        w.root(`refuter:cap-${key}`),
        w.root(`family:cap-${key}`, [key]),
        String(index),
        "survived",
      );
    }
    expect(WARRANT_MAX_GRADE).toBe(3);
    expect(D(chainOf(w.store(), id), w.registry())).toBe(5);
    expect(lambda(w.store(), w.registry(), id)).toBe(WARRANT_MAX_GRADE);
  });
});

describe("warrant auditable grade (I1')", () => {
  it("audits a clean store with matching published grades and anchor as ok", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const a = w.claim("clean-a");
    const b = w.derived("clean-b", [a]);
    const c = w.derived("clean-c", [b]);
    w.challenge(b, refuter, family, "0", "refuted");

    const store = w.store();
    const registry = w.registry();
    const published = publishAll(store, registry);

    const reportC = audit(c, store, registry, published, anchorFor(store, registry, c));
    expect(reportC.ok).toBe(true);
    expect(reportC.issues).toEqual([]);
    expect(reportC.recomputed).toBe("dead");
    expect(reportC.published).toBe("dead");

    const reportB = audit(b, store, registry, published, anchorFor(store, registry, b));
    expect(reportB.ok).toBe(true);
    expect(reportB.recomputed).toBe("dead");

    const reportA = audit(a, store, registry, published, anchorFor(store, registry, a));
    expect(reportA.ok).toBe(true);
    expect(reportA.recomputed).toBe(0);
    expect(reportA.published).toBe(0);
  });

  it("catches a forged grandchild grade transitively", () => {
    const w = microWorld();
    const a = w.claim("forge-a");
    const b = w.derived("forge-b", [a]);
    const c = w.derived("forge-c", [b]);
    const published = new Map<ValueId, Grade>([
      [a, 0],
      [c, 3],
    ]);
    const report = audit(c, w.store(), w.registry(), published, null);
    expect(report.recomputed).toBe(0);
    expect(report.published).toBe(3);
    expect(report.ok).toBe(false);
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0].kind).toBe("grade-mismatch");
    expect(report.issues[0].valueId).toBe(c);
  });

  it("flags an anchored head that disagrees with the recomputation", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("anchor-head");
    w.challenge(id, refuter, family, "0", "survived");
    const store = w.store();
    const registry = w.registry();
    const published = publishAll(store, registry);
    const good = anchorFor(store, registry, id);
    expect(audit(id, store, registry, published, good).ok).toBe(true);

    const forged: HeadAnchor = { ...good, head: "0000000000000000" };
    const report = audit(id, store, registry, published, forged);
    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.kind)).toEqual(["head-mismatch"]);
  });

  it("flags an anchor length or grade that disagrees with the recomputation", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("anchor-shape");
    w.challenge(id, refuter, family, "0", "survived");
    const store = w.store();
    const registry = w.registry();
    const published = publishAll(store, registry);
    const good = anchorFor(store, registry, id);

    const wrongLength = audit(id, store, registry, published, { ...good, length: good.length + 1 });
    expect(wrongLength.issues.map((issue) => issue.kind)).toEqual(["head-mismatch"]);

    const wrongGrade = audit(id, store, registry, published, { ...good, published: 0 });
    expect(wrongGrade.issues.map((issue) => issue.kind)).toEqual(["head-mismatch"]);
  });

  it("reports a hand-built malformed attempt at its index", () => {
    const { id, start, build } = handClaim("malformed");
    const malformed = {
      refuter: "root:refuter",
      family: "root:family",
      seed: "0",
      outcome: "survived",
    } as Attempt;
    const chain: readonly Append[] = [
      { prev: start, attempt: malformed, admittedBy: VERIFIER, sig: WITNESS },
    ];
    const report = audit(id, rawStore([build(chain)]), emptyRegistry(), new Map(), null);
    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.kind)).toEqual(["malformed-attempt"]);
    expect(report.issues[0].index).toBe(0);
  });

  it("reports a hand-built broken prev link at its index", () => {
    const { id, start, build } = handClaim("broken-prev");
    const attempt = attemptFor("root:refuter", "root:family", "0", "survived");
    const chain: readonly Append[] = [
      signedAppend(start, attempt),
      { prev: "0000000000000000", attempt, admittedBy: VERIFIER, sig: WITNESS },
    ];
    const report = audit(id, rawStore([build(chain)]), emptyRegistry(), new Map(), null);
    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.kind)).toEqual(["broken-prev"]);
    expect(report.issues[0].index).toBe(1);
  });

  it("reports a hand-built bad signature at its index", () => {
    const { id, start, build } = handClaim("bad-signature");
    const attempt = attemptFor("root:refuter", "root:family", "0", "survived");
    const other = attemptFor("root:refuter", "root:family", "1", "survived");
    const chain: readonly Append[] = [
      {
        prev: start,
        attempt,
        admittedBy: VERIFIER,
        sig: replaySig(VERIFIER, start, other),
      },
    ];
    const report = audit(id, rawStore([build(chain)]), emptyRegistry(), new Map(), null);
    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.kind)).toEqual(["bad-signature"]);
    expect(report.issues[0].index).toBe(0);
  });

  it("accepts a 64-append chain but flags a hand-built 65th append as overflow", () => {
    const { id, build } = handClaim("overflow");
    const attemptAt = (index: number): Attempt =>
      attemptFor("root:refuter", "root:family", String(index), "survived");
    const chain = chainOfLength(id, WARRANT_MAX_CHAIN + 1, attemptAt);
    expect(chain).toHaveLength(65);

    const withinBudget = audit(
      id,
      rawStore([build(chain.slice(0, WARRANT_MAX_CHAIN))]),
      emptyRegistry(),
      new Map(),
      null,
    );
    expect(withinBudget.ok).toBe(true);

    const overflow = audit(id, rawStore([build(chain)]), emptyRegistry(), new Map(), null);
    expect(overflow.ok).toBe(false);
    expect(overflow.issues.map((issue) => issue.kind)).toEqual(["chain-overflow"]);
    expect(overflow.issues[0].index).toBe(WARRANT_MAX_CHAIN);
  });

  it("reports a hand-built duplicate inconclusive pair", () => {
    const { id, build } = handClaim("duplicate-inconclusive");
    const attempt = attemptFor("root:refuter", "root:family", "0", "inconclusive");
    const chain = chainOfLength(id, 2, () => attempt);
    const report = audit(id, rawStore([build(chain)]), emptyRegistry(), new Map(), null);
    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.kind)).toEqual(["duplicate-inconclusive"]);
    expect(report.issues[0].index).toBe(1);
  });

  it("reports a dangling cite as unknown-cite and recomputes dead", () => {
    const w = microWorld();
    const phantom = warrantHash("hand:phantom");
    const created = deriveValue(
      w.store(),
      w.registry(),
      warrantHash("hand:dangling"),
      [phantom],
      "warrant-test:hand-dangling",
    );
    const report = audit(created.id, created.store, w.registry(), new Map(), null);
    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.kind)).toEqual(["unknown-cite"]);
    expect(report.issues[0].valueId).toBe(created.id);
    expect(report.recomputed).toBe("dead");
  });

  it("reports a severed cite record as identity-mismatch and recomputes dead", () => {
    const w = microWorld();
    const parent = w.claim("parent");
    const child = w.derived("child", [parent]);
    const values = new Map(w.store().values);
    const original = values.get(child);
    if (original === undefined) {
      throw new Error("missing derived child");
    }
    values.set(child, { ...original, cites: [] });
    const report = audit(child, { values }, w.registry(), new Map(), null);
    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.kind)).toEqual(["identity-mismatch"]);
    expect(report.recomputed).toBe("dead");
  });
});

describe("warrant no inflation (I2')", () => {
  it("counts five seeds on one (refuter, family) pair as one class", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("five-seeds");
    for (const seed of ["0", "1", "2", "3", "4"]) {
      w.challenge(id, refuter, family, seed, "survived");
    }
    expect(chainOf(w.store(), id)).toHaveLength(5);
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
    expect(lambda(w.store(), w.registry(), id)).toBe(1);
  });

  it("collapses an exact replay to one class", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("exact-replay");
    w.challenge(id, refuter, family, "7", "survived");
    w.challenge(id, refuter, family, "7", "survived");
    expect(chainOf(w.store(), id)).toHaveLength(2);
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
    expect(lambda(w.store(), w.registry(), id)).toBe(1);
  });

  it("keeps siblings with disjoint coverage as two classes", () => {
    const w = microWorld();
    const id = w.claim("disjoint-siblings");
    w.challenge(id, w.root("refuter:left"), w.root("family:disjoint-left", ["left"]), "0", "survived");
    w.challenge(id, w.root("refuter:right"), w.root("family:disjoint-right", ["right"]), "0", "survived");
    expect(overlapRatio(["left"], ["right"])).toBe(0);
    expect(D(chainOf(w.store(), id), w.registry())).toBe(2);
    expect(lambda(w.store(), w.registry(), id)).toBe(2);
  });

  it("merges families whose coverage overlaps at exactly one half", () => {
    const w = microWorld();
    const left = w.root("family:half-left", ["p", "q"]);
    const right = w.root("family:half-right", ["q", "r"]);
    const id = w.claim("half-overlap");
    w.challenge(id, w.root("refuter:half-left"), left, "0", "survived");
    w.challenge(id, w.root("refuter:half-right"), right, "0", "survived");
    expect(overlapRatio(["p", "q"], ["q", "r"])).toBe(0.5);
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
    expect(lambda(w.store(), w.registry(), id)).toBe(1);
  });

  it("merges families with three-quarter coverage overlap", () => {
    const w = microWorld();
    const four = w.root("family:overlap-four", ["a", "b", "c", "d"]);
    const three = w.root("family:overlap-three", ["a", "b", "c"]);
    const id = w.claim("three-quarter-overlap");
    w.challenge(id, w.root("refuter:overlap-four"), four, "0", "survived");
    w.challenge(id, w.root("refuter:overlap-three"), three, "0", "survived");
    expect(overlapRatio(["a", "b", "c", "d"], ["a", "b", "c"])).toBe(0.75);
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
  });

  it("keeps distinct refuters on one family in a single class", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const id = w.claim("two-refuters");
    w.challenge(id, w.root("refuter:r0"), family, "0", "survived");
    w.challenge(id, w.root("refuter:r1"), family, "1", "survived");
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
  });
});

describe("warrant exact demotion (I3')", () => {
  it("demotes a refuted node and its dependents but not its cite or an independent node", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const a = w.claim("dag-a");
    const b = w.derived("dag-b", [a]);
    const c = w.derived("dag-c", [b]);
    const d = w.claim("dag-d");
    w.challenge(b, refuter, family, "0", "refuted");

    const store = w.store();
    const registry = w.registry();
    expect(lambda(store, registry, a)).toBe(0);
    expect(lambda(store, registry, b)).toBe("dead");
    expect(lambda(store, registry, c)).toBe("dead");
    expect(lambda(store, registry, d)).toBe(0);
  });

  it("takes the cone as exactly the refuted node and its transitive dependents", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const a = w.claim("cone-a");
    const b = w.derived("cone-b", [a]);
    const c = w.derived("cone-c", [b]);
    const d = w.claim("cone-d");
    w.challenge(b, refuter, family, "0", "refuted");

    const store = w.store();
    expect([...cone(store, b)].sort()).toEqual([b, c].sort());
    expect([...cone(store, a)].sort()).toEqual([a, b, c].sort());
    expect([...cone(store, d)].sort()).toEqual([d]);
    expect(ancestors(store, c)).toEqual([a, b, c]);
  });

  it("reproduces the cone with demotionSanity precision and recall one", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const a = w.claim("sanity-a");
    const b = w.derived("sanity-b", [a]);
    const c = w.derived("sanity-c", [b]);
    const d = w.claim("sanity-d");
    w.challenge(b, refuter, family, "0", "refuted");

    const store = w.store();
    const registry = w.registry();
    const truth = new Set(cone(store, b));
    expect(demotionSanity(store, registry, truth)).toEqual({ precision: 1, recall: 1 });
    expect(demotionSanity(store, registry, new Set())).toEqual({ precision: 0, recall: 0 });
    expect(lambda(store, registry, d)).toBe(0);
  });
});

describe("warrant append-only ledger (I4')", () => {
  it("returns a fresh store from admit and leaves the input untouched", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("append-only");
    const before = w.store();
    const beforeValue = w.value(id);
    const attempt = attemptFor(refuter, family, "0", "survived");
    const pending = submit(attempt, replaySig(VERIFIER, headDigest(id, beforeValue.chain), attempt));

    const next = admit(before, w.registry(), id, pending, VERIFIER);
    expect(next).not.toBe(before);
    expect(next.values).not.toBe(before.values);
    expect(chainOf(next, id)).toHaveLength(1);
    expect(chainOf(before, id)).toHaveLength(0);
    expect(beforeValue.chain).toHaveLength(0);
    expect(getValue(before, id)).toBe(beforeValue);
    expect(w.store()).toBe(before);
    expect(lambda(next, w.registry(), id)).toBe(1);
  });

  it("refuses to re-mint a refuted value in the same context", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("remint");
    w.challenge(id, refuter, family, "0", "refuted");
    expect(lambda(w.store(), w.registry(), id)).toBe("dead");

    const error = capture(() =>
      assertValue(w.store(), w.registry(), { label: "remint" }, "claim", "warrant-test:remint"),
    );
    expect(error instanceof RefusedRemintError).toBe(true);
    if (error instanceof RefusedRemintError) {
      expect(error.valueId).toBe(id);
    }
  });

  it("treats the same payload in another context as a different value", () => {
    const w = microWorld();
    const defaultId = w.claim("context");
    const otherId = w.claim("context", CONTEXT);
    expect(otherId).not.toBe(defaultId);
    expect(getValue(w.store(), defaultId)).not.toBeUndefined();
    expect(getValue(w.store(), otherId)).not.toBeUndefined();
    expect(w.store().values.size).toBe(2);
  });

  it("lets a derive cite a dead value and grades the result dead", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const parent = w.claim("dead-parent");
    const child = w.derived("dead-child", [parent]);
    w.challenge(parent, refuter, family, "0", "refuted");

    const store = w.store();
    const registry = w.registry();
    expect(lambda(store, registry, parent)).toBe("dead");
    expect(lambda(store, registry, child)).toBe("dead");
    expect(chainOf(store, child)).toHaveLength(0);
  });
});

describe("warrant identity", () => {
  it("makes assertValue idempotent within one context", () => {
    const w = microWorld();
    const first = w.claim("idempotent");
    const snapshot = w.store();
    const second = w.claim("idempotent");
    expect(second).toBe(first);
    expect(w.store()).toBe(snapshot);
    expect(w.store().values.size).toBe(1);
  });

  it("canonicalizes cite order and duplicates in deriveValue", () => {
    const w = microWorld();
    const a = w.claim("canon-a");
    const b = w.claim("canon-b");
    const fDigest = warrantHash("warrant-test:canonical");
    const first = deriveValue(w.store(), w.registry(), fDigest, [b, a, b], "warrant-test:canon");
    const second = deriveValue(first.store, w.registry(), fDigest, [a, b], "warrant-test:canon");
    expect(second.id).toBe(first.id);
    expect(second.store).toBe(first.store);
    expect([...getValue(first.store, first.id)!.cites]).toEqual([a, b].sort());
  });

  it("refuses a payload carrying the reserved warrant mark", () => {
    const w = microWorld();
    const error = capture(() =>
      assertValue(w.store(), w.registry(), { [WARRANT_MARK]: true }, "claim", CONTEXT),
    );
    expect(error instanceof AdmissionError).toBe(true);
    if (error instanceof AdmissionError) {
      expect(error.code).toBe("reserved-payload");
    }
  });
});

describe("warrant admission guards", () => {
  it("rejects a malformed attempt before it reaches the ledger", () => {
    const attempt = attemptFor("root:refuter", "root:family", "0", "survived");
    const error = capture(() =>
      submit({ ...attempt, cost: -1 }, replaySig(VERIFIER, "0000000000000000", attempt)),
    );
    expect(error instanceof AdmissionError).toBe(true);
    if (error instanceof AdmissionError) {
      expect(error.code).toBe("malformed-attempt");
    }
  });

  it("rejects a replay signature computed against the wrong head", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("bad-signature");
    const attempt = attemptFor(refuter, family, "0", "survived");
    const pending = submit(attempt, replaySig(VERIFIER, "0000000000000000", attempt));
    const error = capture(() => admit(w.store(), w.registry(), id, pending, VERIFIER));
    expect(error instanceof AdmissionError).toBe(true);
    if (error instanceof AdmissionError) {
      expect(error.code).toBe("bad-signature");
    }
  });

  it("rejects a second inconclusive attempt for the same pair", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("duplicate-inconclusive");
    w.challenge(id, refuter, family, "0", "inconclusive");
    const attempt = attemptFor(refuter, family, "1", "inconclusive");
    const prev = headDigest(id, chainOf(w.store(), id));
    const error = capture(() =>
      admit(w.store(), w.registry(), id, submit(attempt, replaySig(VERIFIER, prev, attempt)), VERIFIER),
    );
    expect(error instanceof AdmissionError).toBe(true);
    if (error instanceof AdmissionError) {
      expect(error.code).toBe("duplicate-inconclusive");
    }
  });

  it("refuses a chain at the admission budget", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("chain-budget");
    for (let index = 0; index < WARRANT_MAX_CHAIN; index += 1) {
      w.challenge(id, refuter, family, String(index), "survived");
    }
    expect(chainOf(w.store(), id)).toHaveLength(WARRANT_MAX_CHAIN);

    const attempt = attemptFor(refuter, family, String(WARRANT_MAX_CHAIN), "survived");
    const prev = headDigest(id, chainOf(w.store(), id));
    const error = capture(() =>
      admit(w.store(), w.registry(), id, submit(attempt, replaySig(VERIFIER, prev, attempt)), VERIFIER),
    );
    expect(error instanceof AdmissionError).toBe(true);
    if (error instanceof AdmissionError) {
      expect(error.code).toBe("chain-budget");
    }
  });
});
