import { describe, expect, it } from "bun:test";
import {
  AdmissionError,
  D,
  GRADERS,
  admit,
  assertValue,
  canonicalJson,
  chainOf,
  deriveValue,
  emptyRegistry,
  emptyStore,
  getValue,
  headDigest,
  lambda,
  overlapRatio,
  registerRoot,
  registerVersion,
  replaySig,
  rootIdOf,
  rootOf,
  rootsByAuthor,
  scoreAll,
  submit,
  subsumedFamily,
  versionIdOf,
} from "../src/lib/warrant";
import * as warrant from "../src/lib/warrant";
import type {
  Attempt,
  Digest,
  Grader,
  GraderId,
  PendingAttempt,
  Registry,
  RootId,
  Store,
  Value,
  ValueId,
  VerifierId,
} from "../src/lib/warrant";

const AUTHOR = "warrant-admission-author";
const OTHER_AUTHOR = "warrant-admission-other-author";
const VERIFIER = "warrant-admission-verifier";
const SUBMITTER = "warrant-admission-submitter";
const CONTEXT = "warrant-admission:ctx";
const WITNESS = "0123456789abcdef";
const SPEC_REFUTER = "refuter:r0";
const SPEC_FAMILY = "family:f0";

function rootFor(spec: string, coverage: readonly string[] = []): RootId {
  return rootIdOf(AUTHOR, spec, [...new Set(coverage)].sort());
}

function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    refuter: overrides.refuter ?? rootFor(SPEC_REFUTER),
    family: overrides.family ?? rootFor(SPEC_FAMILY, ["f0"]),
    seed: overrides.seed ?? "0",
    outcome: overrides.outcome ?? "survived",
    cost: overrides.cost ?? 0,
    witness: overrides.witness ?? WITNESS,
    submittedBy: overrides.submittedBy ?? SUBMITTER,
  };
}

function attemptWith(overrides: Record<string, unknown>): Attempt {
  return { ...attempt(), ...overrides } as unknown as Attempt;
}

type RootSpec = readonly [spec: string, coverage: readonly string[]];

function registryWith(specs: readonly RootSpec[]): Registry {
  let registry = emptyRegistry();
  for (const [spec, coverage] of specs) {
    registry = registerRoot(registry, AUTHOR, spec, coverage);
  }
  return registry;
}

function baseRegistry(): Registry {
  return registryWith([
    [SPEC_REFUTER, []],
    ["refuter:r1", []],
    [SPEC_FAMILY, ["f0"]],
  ]);
}

function freshClaim(registry: Registry, label = "claim"): { store: Store; id: ValueId } {
  return assertValue(emptyStore(), registry, { label }, "claim", CONTEXT);
}

function admitRaw(
  store: Store,
  registry: Registry,
  id: ValueId,
  value: Attempt,
  admittedBy: VerifierId = VERIFIER,
): Store {
  const prev = headDigest(id, chainOf(store, id));
  return admit(store, registry, id, submit(value, replaySig(admittedBy, prev, value)), admittedBy);
}

function challenge(
  store: Store,
  registry: Registry,
  id: ValueId,
  refuter: RootId,
  family: RootId,
  seed: string,
  outcome: Attempt["outcome"] = "survived",
): Store {
  return admitRaw(store, registry, id, attempt({ refuter, family, seed, outcome }));
}

function wrongSig(admittedBy: VerifierId, store: Store, id: ValueId, value: Attempt): Digest {
  const correct = replaySig(admittedBy, headDigest(id, chainOf(store, id)), value);
  return (correct[0] === "0" ? "1" : "0") + correct.slice(1);
}

function admissionError(fn: () => unknown): AdmissionError {
  try {
    fn();
  } catch (error) {
    if (error instanceof AdmissionError) {
      return error;
    }
    throw error;
  }
  throw new Error("expected an AdmissionError");
}

function expectCode(fn: () => unknown, code: AdmissionError["code"]): void {
  expect(admissionError(fn).code).toBe(code);
}

function graderOf(id: GraderId): Grader {
  const found = GRADERS.find((candidate) => candidate.id === id);
  if (found === undefined) {
    throw new Error(`unknown grader ${id}`);
  }
  return found;
}

function score(id: GraderId, store: Store, registry: Registry, valueId: ValueId): number {
  const value = getValue(store, valueId);
  if (value === undefined) {
    throw new Error(`missing value ${valueId}`);
  }
  return graderOf(id).score(value, store, registry);
}

describe("warrant admission errors", () => {
  it("rejects an unknown value before anything else", () => {
    const registry = baseRegistry();
    const { store } = freshClaim(registry);
    const malformed = {
      attempt: attemptWith({ outcome: "maybe" }),
      sig: "zzzz",
    } as unknown as PendingAttempt;
    expectCode(
      () => admit(store, registry, "unknown-value-id", malformed, VERIFIER),
      "unknown-value",
    );
  });

  it("rejects malformed pending attempts field by field", () => {
    const registry = baseRegistry();
    const { store, id } = freshClaim(registry);
    const cases: readonly PendingAttempt[] = [
      { attempt: attemptWith({ outcome: "maybe" }), sig: WITNESS },
      { attempt: attemptWith({ seed: "01" }), sig: WITNESS },
      { attempt: attemptWith({ seed: "18446744073709551616" }), sig: WITNESS },
      { attempt: attemptWith({ witness: "not-a-witness" }), sig: WITNESS },
      { attempt: attemptWith({ cost: -1 }), sig: WITNESS },
      { attempt: attemptWith({ cost: 1.5 }), sig: WITNESS },
      { attempt: attempt(), sig: "not-a-signature" },
    ];
    for (const pending of cases) {
      expectCode(() => admit(store, registry, id, pending, VERIFIER), "malformed-attempt");
    }
    expect(chainOf(store, id)).toHaveLength(0);
  });

  it("checks the pending shape before root registration", () => {
    const registry = baseRegistry();
    const { store, id } = freshClaim(registry);
    const pending = {
      attempt: attemptWith({
        refuter: "root:never-registered",
        family: "root:also-never-registered",
        witness: "not-a-witness",
      }),
      sig: WITNESS,
    };
    expectCode(() => admit(store, registry, id, pending, VERIFIER), "malformed-attempt");
  });

  it("rejects an unregistered refuter or family with unknown-root", () => {
    const registry = baseRegistry();
    const { store, id } = freshClaim(registry);
    expectCode(
      () => admitRaw(store, registry, id, attempt({ refuter: rootFor("refuter:missing") })),
      "unknown-root",
    );
    expectCode(
      () => admitRaw(store, registry, id, attempt({ family: rootFor("family:missing", ["x"]) })),
      "unknown-root",
    );
  });

  it("rejects a version id used as refuter or family with version-not-root", () => {
    const registry = registerVersion(baseRegistry(), rootFor(SPEC_REFUTER), AUTHOR, "spec:r0:v1");
    const versionId = versionIdOf(rootFor(SPEC_REFUTER), "spec:r0:v1", 1);
    const { store, id } = freshClaim(registry);
    expectCode(
      () => admitRaw(store, registry, id, attempt({ refuter: versionId })),
      "version-not-root",
    );
    expectCode(
      () => admitRaw(store, registry, id, attempt({ family: versionId })),
      "version-not-root",
    );
  });

  it("admits exactly 64 attempts and rejects the 65th with chain-budget", () => {
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const { store, id } = freshClaim(registry);
    let current = store;
    for (let index = 0; index < 64; index += 1) {
      current = challenge(current, registry, id, refuter, family, String(index));
    }
    expect(chainOf(current, id)).toHaveLength(64);
    expectCode(() => challenge(current, registry, id, refuter, family, "64"), "chain-budget");
    expect(chainOf(current, id)).toHaveLength(64);
  });

  it("checks the chain budget before the inconclusive cap", () => {
    const registry = registryWith([
      [SPEC_REFUTER, []],
      ["refuter:r2", []],
      [SPEC_FAMILY, ["f0"]],
      ["family:g0", ["g0"]],
    ]);
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const refuter2 = rootFor("refuter:r2");
    const family2 = rootFor("family:g0", ["g0"]);
    const { store, id } = freshClaim(registry);
    let current = store;
    for (let index = 0; index < 63; index += 1) {
      current = challenge(current, registry, id, refuter, family, String(index));
    }
    current = challenge(current, registry, id, refuter2, family2, "0", "inconclusive");
    expect(chainOf(current, id)).toHaveLength(64);
    expectCode(
      () => challenge(current, registry, id, refuter2, family2, "1", "inconclusive"),
      "chain-budget",
    );
  });

  it("checks refuter and family registration before the chain budget", () => {
    const registry = registerVersion(baseRegistry(), rootFor(SPEC_REFUTER), AUTHOR, "spec:r0:v1");
    const versionId = versionIdOf(rootFor(SPEC_REFUTER), "spec:r0:v1", 1);
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const { store, id } = freshClaim(registry);
    let current = store;
    for (let index = 0; index < 64; index += 1) {
      current = challenge(current, registry, id, refuter, family, String(index));
    }
    expectCode(
      () => challenge(current, registry, id, versionId, family, "64"),
      "version-not-root",
    );
  });

  it("caps inconclusive attempts per refuter and family pair at one", () => {
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const other = rootFor("refuter:r1");
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const { store, id } = freshClaim(registry);
    let current = challenge(store, registry, id, refuter, family, "1", "inconclusive");
    expectCode(
      () => challenge(current, registry, id, refuter, family, "2", "inconclusive"),
      "duplicate-inconclusive",
    );
    current = challenge(current, registry, id, other, family, "3", "inconclusive");
    expect(chainOf(current, id).map((append) => append.attempt.seed)).toEqual(["1", "3"]);
  });

  it("checks the inconclusive cap before family subsumption", () => {
    const registry = registryWith([
      [SPEC_REFUTER, []],
      ["family:wide", ["a", "b"]],
      ["family:narrow", ["a"]],
    ]);
    const refuter = rootFor(SPEC_REFUTER);
    const wide = rootFor("family:wide", ["a", "b"]);
    const narrow = rootFor("family:narrow", ["a"]);
    const { store, id } = freshClaim(registry);
    let current = challenge(store, registry, id, refuter, narrow, "1", "inconclusive");
    current = challenge(current, registry, id, refuter, wide, "2");
    expectCode(
      () => challenge(current, registry, id, refuter, narrow, "3", "inconclusive"),
      "duplicate-inconclusive",
    );
  });

  it("rejects a narrow family after a surviving superset family", () => {
    const registry = registryWith([
      [SPEC_REFUTER, []],
      ["refuter:r1", []],
      ["family:wide", ["a", "b"]],
      ["family:narrow", ["a"]],
    ]);
    const refuter = rootFor(SPEC_REFUTER);
    const other = rootFor("refuter:r1");
    const wide = rootFor("family:wide", ["a", "b"]);
    const narrow = rootFor("family:narrow", ["a"]);
    const { store, id } = freshClaim(registry);
    let current = challenge(store, registry, id, refuter, narrow, "1");
    current = challenge(current, registry, id, refuter, wide, "2");
    expectCode(() => challenge(current, registry, id, refuter, narrow, "3"), "subsumed-family");
    current = challenge(current, registry, id, other, narrow, "4");
    expect(chainOf(current, id)).toHaveLength(3);
    expect(subsumedFamily(registry, refuter, narrow, chainOf(current, id).slice(0, 2))).toBe(true);
  });

  it("checks family subsumption before the replay signature", () => {
    const registry = registryWith([
      [SPEC_REFUTER, []],
      ["family:wide", ["a", "b"]],
      ["family:narrow", ["a"]],
    ]);
    const refuter = rootFor(SPEC_REFUTER);
    const wide = rootFor("family:wide", ["a", "b"]);
    const narrow = rootFor("family:narrow", ["a"]);
    const { store, id } = freshClaim(registry);
    const current = challenge(store, registry, id, refuter, wide, "1");
    const value = attempt({ refuter, family: narrow, seed: "2" });
    const pending = submit(value, "ffffffffffffffff");
    expectCode(() => admit(current, registry, id, pending, VERIFIER), "subsumed-family");
  });

  it("rejects a valid-shaped attempt with the wrong replay signature", () => {
    const registry = baseRegistry();
    const { store, id } = freshClaim(registry);
    const value = attempt();
    const pending = submit(value, wrongSig(VERIFIER, store, id, value));
    expectCode(() => admit(store, registry, id, pending, VERIFIER), "bad-signature");
    expect(chainOf(store, id)).toHaveLength(0);
  });
});

describe("warrant admission store discipline", () => {
  it("leaves the input store untouched when an admission fails", () => {
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const { store, id } = freshClaim(registry);
    let current = challenge(store, registry, id, refuter, family, "0");
    current = challenge(current, registry, id, refuter, family, "1");
    const before = canonicalJson(chainOf(current, id));

    const rejected = attempt({ refuter, family, seed: "2" });
    expectCode(
      () =>
        admit(
          current,
          registry,
          id,
          submit(rejected, wrongSig(VERIFIER, current, id, rejected)),
          VERIFIER,
        ),
      "bad-signature",
    );
    expectCode(
      () => admitRaw(current, registry, id, attempt({ refuter: rootFor("refuter:never") })),
      "unknown-root",
    );
    expectCode(
      () => admit(current, registry, "missing-value", submit(attempt(), WITNESS), VERIFIER),
      "unknown-value",
    );

    expect(canonicalJson(chainOf(current, id))).toBe(before);
    expect(chainOf(current, id)).toHaveLength(2);
    expect(current.values.size).toBe(1);
    expect(chainOf(current, id).some((append) => append.attempt.seed === "2")).toBe(false);
  });

  it("returns a new store on success and preserves every other value", () => {
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const first = freshClaim(registry, "first");
    const second = assertValue(first.store, registry, { label: "second" }, "claim", CONTEXT);
    const before = canonicalJson(chainOf(second.store, first.id));
    const next = challenge(second.store, registry, first.id, refuter, family, "0");

    expect(next).not.toBe(second.store);
    expect(next.values).not.toBe(second.store.values);
    expect(chainOf(second.store, first.id)).toHaveLength(0);
    expect(canonicalJson(chainOf(second.store, first.id))).toBe(before);
    expect(chainOf(next, first.id)).toHaveLength(1);
    expect(getValue(next, second.id)).toBe(getValue(second.store, second.id));
    expect(canonicalJson(chainOf(next, second.id))).toBe("[]");
  });
});

describe("warrant submit syntax", () => {
  it("returns a deep-frozen copy and never freezes the caller's attempt", () => {
    const source = attempt();
    const pending = submit(source, WITNESS);
    expect(pending.attempt).not.toBe(source);
    expect(pending.attempt).toEqual(source);
    expect(Object.isFrozen(pending)).toBe(true);
    expect(Object.isFrozen(pending.attempt)).toBe(true);
    expect(Object.isFrozen(source)).toBe(false);
    (source as unknown as { seed: string }).seed = "mutated";
    expect(pending.attempt.seed).toBe("0");
  });

  it("checks syntax only, not registry membership", () => {
    const pending = submit(
      attempt({
        refuter: "root:not-registered",
        family: "family:not-registered",
        seed: "18446744073709551615",
      }),
      "f".repeat(16),
    );
    expect(pending.attempt.refuter).toBe("root:not-registered");
    expect(pending.attempt.seed).toBe("18446744073709551615");
    expect(pending.sig).toBe("ffffffffffffffff");
  });

  it("rejects malformed attempts across every field", () => {
    const bad: readonly Attempt[] = [
      attemptWith({ outcome: "maybe" }),
      attemptWith({ seed: "01" }),
      attemptWith({ seed: "" }),
      attemptWith({ witness: "0123456789abcde" }),
      attemptWith({ witness: "0123456789ABCDEF" }),
      attemptWith({ witness: "zzzzzzzzzzzzzzzz" }),
      attemptWith({ cost: -1 }),
      attemptWith({ cost: 1.5 }),
      attemptWith({ cost: Number.MAX_SAFE_INTEGER + 1 }),
      attemptWith({ refuter: "" }),
      attemptWith({ family: "" }),
      attemptWith({ submittedBy: "" }),
    ];
    for (const value of bad) {
      expectCode(() => submit(value, WITNESS), "malformed-attempt");
    }
    const good = attempt();
    expect(submit(good, WITNESS).attempt).toEqual(good);
  });

  it("rejects malformed signatures", () => {
    for (const sig of ["", "xyz", "0123456789abcde", "0123456789ABCDEF", "0123456789abcdef0"]) {
      expectCode(() => submit(attempt(), sig), "malformed-attempt");
    }
  });

  it("accepts valid decimal seeds at the u64 boundary", () => {
    expect(submit(attempt({ seed: "0" }), WITNESS).attempt.seed).toBe("0");
    expect(submit(attempt({ seed: "18446744073709551615" }), WITNESS).attempt.seed).toBe(
      "18446744073709551615",
    );
    expectCode(
      () => submit(attempt({ seed: "18446744073709551616" }), WITNESS),
      "malformed-attempt",
    );
    expectCode(() => submit(attempt({ seed: "00" }), WITNESS), "malformed-attempt");
    expectCode(() => submit(attempt({ seed: "1e3" }), WITNESS), "malformed-attempt");
  });
});

describe("warrant registry", () => {
  it("registerRoot is idempotent for the same author, spec, and coverage", () => {
    const first = registerRoot(emptyRegistry(), AUTHOR, "spec:root", ["b", "a", "a"]);
    const second = registerRoot(first, AUTHOR, "spec:root", ["a", "b"]);
    expect(second).toBe(first);
    expect(first.roots.size).toBe(1);
    const record = first.roots.get(rootFor("spec:root", ["a", "b"]));
    expect(record?.coverage).toEqual(["a", "b"]);
  });

  it("normalizes coverage to unique sorted atoms before deriving the root id", () => {
    const registry = registerRoot(emptyRegistry(), AUTHOR, "spec:cover", ["b", "a", "b", "c"]);
    const record = registry.roots.get(rootFor("spec:cover", ["c", "b", "a"]));
    expect(record).not.toBeUndefined();
    expect(record?.coverage).toEqual(["a", "b", "c"]);
    expect(record?.rootId).toBe(rootFor("spec:cover", ["a", "b", "c"]));
  });

  it("registerVersion rejects a non-owner author with author-mismatch", () => {
    const registry = registerRoot(emptyRegistry(), AUTHOR, "spec:v", []);
    const root = rootFor("spec:v");
    expectCode(
      () => registerVersion(registry, root, OTHER_AUTHOR, "spec:v:1"),
      "author-mismatch",
    );
    expectCode(
      () => registerVersion(registry, rootFor("spec:missing"), AUTHOR, "spec:v:1"),
      "unknown-root",
    );
  });

  it("rootOf maps both roots and versions and rejects unknown ids", () => {
    const base = registerRoot(emptyRegistry(), AUTHOR, "spec:v", []);
    const root = rootFor("spec:v");
    const registry = registerVersion(base, root, AUTHOR, "spec:v:1");
    const versionId = versionIdOf(root, "spec:v:1", 1);
    expect(rootOf(registry, root)).toBe(root);
    expect(rootOf(registry, versionId)).toBe(root);
    expect(registry.versions.get(versionId)?.seq).toBe(1);
    expectCode(() => rootOf(registry, "missing-id"), "unknown-root");
    const second = registerVersion(registry, root, AUTHOR, "spec:v:2");
    expect(second.versions.get(versionIdOf(root, "spec:v:2", 2))?.seq).toBe(2);
  });

  it("rootsByAuthor returns that author's roots sorted and nobody else's", () => {
    let registry = emptyRegistry();
    for (const spec of ["spec:c", "spec:a", "spec:b"]) {
      registry = registerRoot(registry, AUTHOR, spec, []);
    }
    registry = registerRoot(registry, OTHER_AUTHOR, "spec:other", []);
    const expected = [rootFor("spec:a"), rootFor("spec:b"), rootFor("spec:c")].sort();
    expect(rootsByAuthor(registry, AUTHOR)).toEqual(expected);
    expect(rootsByAuthor(registry, OTHER_AUTHOR)).toEqual([
      rootIdOf(OTHER_AUTHOR, "spec:other", []),
    ]);
    expect(rootsByAuthor(registry, "nobody")).toEqual([]);
  });

  it("overlapRatio declares zero overlap for empty coverage", () => {
    expect(overlapRatio([], [])).toBe(0);
    expect(overlapRatio([], ["a"])).toBe(0);
    expect(overlapRatio(["a"], [])).toBe(0);
    expect(overlapRatio(["a", "b"], ["b", "c"])).toBe(0.5);
    expect(overlapRatio(["a", "a"], ["a"])).toBe(1);
  });

  it("subsumedFamily treats empty declared coverage as the declared residual", () => {
    const registry = registryWith([
      [SPEC_REFUTER, []],
      ["family:wide", ["a", "b"]],
      ["family:empty", []],
    ]);
    const refuter = rootFor(SPEC_REFUTER);
    const wide = rootFor("family:wide", ["a", "b"]);
    const empty = rootFor("family:empty", []);
    const { store, id } = freshClaim(registry);
    const populated = challenge(store, registry, id, refuter, wide, "1");
    expect(subsumedFamily(registry, refuter, empty, chainOf(populated, id))).toBe(false);
    expect(
      subsumedFamily(registry, refuter, rootFor("family:absent", ["a"]), chainOf(populated, id)),
    ).toBe(false);
  });
});

describe("warrant grader formulas", () => {
  it("scores B0, B1, B2, and B3 on a mixed hand-built chain", () => {
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const { store, id } = freshClaim(registry);
    let current = challenge(store, registry, id, refuter, family, "0");
    current = challenge(current, registry, id, refuter, family, "1");
    current = challenge(current, registry, id, refuter, family, "2");
    current = challenge(current, registry, id, refuter, family, "3", "refuted");
    expect(score("B0", current, registry, id)).toBe(1);
    expect(score("B1", current, registry, id)).toBe(3);
    expect(score("B2", current, registry, id)).toBe(75);
    expect(score("B3", current, registry, id)).toBe(3);
  });

  it("scores zeros on an untouched value", () => {
    const registry = baseRegistry();
    const { store, id } = freshClaim(registry);
    expect(score("B0", store, registry, id)).toBe(0);
    expect(score("B1", store, registry, id)).toBe(0);
    expect(score("B2", store, registry, id)).toBe(0);
    expect(score("B5", store, registry, id)).toBe(0);
    expect(score("B6", store, registry, id)).toBe(0);
    expect(score("B7", store, registry, id)).toBe(0);
  });

  it("scores B5 by distinct surviving families capped at three", () => {
    const registry = registryWith([
      [SPEC_REFUTER, []],
      ["family:a", ["a"]],
      ["family:b", ["b"]],
      ["family:c", ["c"]],
      ["family:d", ["d"]],
    ]);
    const refuter = rootFor(SPEC_REFUTER);
    const { store, id } = freshClaim(registry);
    let current = challenge(store, registry, id, refuter, rootFor("family:a", ["a"]), "0");
    current = challenge(current, registry, id, refuter, rootFor("family:b", ["b"]), "1");
    expect(score("B5", current, registry, id)).toBe(2);
    current = challenge(current, registry, id, refuter, rootFor("family:c", ["c"]), "2");
    current = challenge(current, registry, id, refuter, rootFor("family:d", ["d"]), "3");
    expect(score("B1", current, registry, id)).toBe(4);
    expect(score("B5", current, registry, id)).toBe(3);
  });

  it("scores B6 by distinct surviving tuples capped at three", () => {
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const { store, id } = freshClaim(registry);
    let current = store;
    for (const seed of ["0", "1", "2", "3"]) {
      current = challenge(current, registry, id, refuter, family, seed);
    }
    expect(score("B1", current, registry, id)).toBe(4);
    expect(score("B5", current, registry, id)).toBe(1);
    expect(score("B6", current, registry, id)).toBe(3);

    const replay = assertValue(current, registry, { label: "replay" }, "claim", CONTEXT);
    let replayed = challenge(replay.store, registry, replay.id, refuter, family, "0");
    replayed = challenge(replayed, registry, replay.id, refuter, family, "0");
    expect(score("B1", replayed, registry, replay.id)).toBe(2);
    expect(score("B6", replayed, registry, replay.id)).toBe(1);
  });

  it("scores B7 by declared dependency classes capped at three", () => {
    const registry = registryWith([
      ["refuter:r1", []],
      ["refuter:r2", []],
      ["refuter:r3", []],
      ["refuter:r4", []],
      ["refuter:r5", []],
      ["family:f1", ["a", "b"]],
      ["family:f2", ["b", "c"]],
      ["family:f3", ["z"]],
      ["family:f4", ["y"]],
      ["family:f5", ["x"]],
    ]);
    const { store, id } = freshClaim(registry);
    let current = challenge(
      store,
      registry,
      id,
      rootFor("refuter:r1"),
      rootFor("family:f1", ["a", "b"]),
      "0",
    );
    current = challenge(
      current,
      registry,
      id,
      rootFor("refuter:r2"),
      rootFor("family:f2", ["b", "c"]),
      "1",
    );
    expect(D(chainOf(current, id), registry)).toBe(1);
    current = challenge(
      current,
      registry,
      id,
      rootFor("refuter:r3"),
      rootFor("family:f3", ["z"]),
      "2",
    );
    expect(D(chainOf(current, id), registry)).toBe(2);
    current = challenge(
      current,
      registry,
      id,
      rootFor("refuter:r4"),
      rootFor("family:f4", ["y"]),
      "3",
    );
    expect(D(chainOf(current, id), registry)).toBe(3);
    expect(score("B7", current, registry, id)).toBe(3);
    current = challenge(
      current,
      registry,
      id,
      rootFor("refuter:r5"),
      rootFor("family:f5", ["x"]),
      "4",
    );
    expect(D(chainOf(current, id), registry)).toBe(4);
    expect(score("B7", current, registry, id)).toBe(3);
  });

  it("scores B4 alive/dead through lambda and cite propagation", () => {
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const alive = freshClaim(registry, "alive");
    const dead = assertValue(alive.store, registry, { label: "dead" }, "claim", CONTEXT);
    let store = challenge(dead.store, registry, alive.id, refuter, family, "0");
    store = challenge(store, registry, dead.id, refuter, family, "0", "refuted");
    const child = deriveValue(store, registry, "digest:child", [dead.id], CONTEXT);
    store = child.store;
    expect(score("B4", store, registry, alive.id)).toBe(1);
    expect(score("B4", store, registry, dead.id)).toBe(0);
    expect(score("B4", store, registry, child.id)).toBe(0);
    expect(lambda(store, registry, alive.id)).toBe(1);
    expect(lambda(store, registry, dead.id)).toBe("dead");
    expect(lambda(store, registry, child.id)).toBe("dead");
  });

  it("scoreAll preserves input order and GRADERS declares B0 through B7", () => {
    expect(GRADERS.map((grader) => grader.id)).toEqual([
      "B0",
      "B1",
      "B2",
      "B3",
      "B4",
      "B5",
      "B6",
      "B7",
    ]);
    const registry = baseRegistry();
    const refuter = rootFor(SPEC_REFUTER);
    const family = rootFor(SPEC_FAMILY, ["f0"]);
    const a = freshClaim(registry, "a");
    const b = assertValue(a.store, registry, { label: "b" }, "claim", CONTEXT);
    const c = assertValue(b.store, registry, { label: "c" }, "claim", CONTEXT);
    let store = c.store;
    store = challenge(store, registry, a.id, refuter, family, "0");
    store = challenge(store, registry, a.id, refuter, family, "1");
    store = challenge(store, registry, b.id, refuter, family, "0");
    const values = [getValue(store, a.id), getValue(store, b.id), getValue(store, c.id)].filter(
      (value): value is Value => value !== undefined,
    );
    expect(values).toHaveLength(3);
    expect(scoreAll(graderOf("B1"), values, store, registry)).toEqual([2, 1, 0]);
  });
});

describe("warrant barrel discipline", () => {
  it("exposes runArena and GRADERS while hiding oracleScore and ORACLE_GRADER", () => {
    expect("oracleScore" in warrant).toBe(false);
    expect("ORACLE_GRADER" in warrant).toBe(false);
    expect("runArena" in warrant).toBe(true);
    expect("GRADERS" in warrant).toBe(true);
  });
});
