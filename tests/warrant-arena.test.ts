import { describe, expect, it } from "bun:test";
import {
  ARENA_BASE_SEED,
  ARENA_SEEDS,
  D,
  GRADERS,
  admit,
  apAt12,
  assertValue,
  auc,
  canonicalJson,
  chainOf,
  cone,
  demotionSanity,
  deriveValue,
  emptyRegistry,
  emptyStore,
  getValue,
  headDigest,
  lcg,
  overlapRatio,
  p5,
  pairFlipRate,
  pairWinRate,
  registerRoot,
  replaySig,
  rootIdOf,
  runArena,
  seedDeltaMean,
  submit,
  warrantHash,
  lambda,
} from "@/lib/warrant";
import type {
  Attempt,
  CriterionStatus,
  Grade,
  Grader,
  GraderId,
  Registry,
  RootId,
  Store,
  Value,
  ValueId,
} from "@/lib/warrant";
import { oracleScore } from "@/lib/warrant/graders";

const AUTHOR = "warrant-test-author";
const VERIFIER = "warrant-test-verifier";
const WITNESS = "0123456789abcdef";
const SUBMITTER = "warrant-test-submitter";

function graderOf(id: GraderId): Grader {
  const found = GRADERS.find((candidate) => candidate.id === id);
  if (found === undefined) {
    throw new Error(`unknown grader ${id}`);
  }
  return found;
}

interface MicroWorld {
  readonly root: (spec: string, coverage?: readonly string[]) => RootId;
  readonly claim: (label: string) => ValueId;
  readonly derived: (label: string, cites: readonly ValueId[]) => ValueId;
  readonly challenge: (
    id: ValueId,
    refuter: RootId,
    family: RootId,
    seed: string,
    outcome: Attempt["outcome"],
  ) => void;
  readonly value: (id: ValueId) => Value;
  readonly score: (id: GraderId, valueId: ValueId) => number;
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

  const claim = (label: string): ValueId => {
    const created = assertValue(store, registry, { label }, "claim", `warrant-test:${label}`);
    store = created.store;
    return created.id;
  };

  const derived = (label: string, cites: readonly ValueId[]): ValueId => {
    const created = deriveValue(
      store,
      registry,
      warrantHash(`warrant-test:${label}`),
      cites,
      `warrant-test:derive:${label}`,
    );
    store = created.store;
    return created.id;
  };

  const challenge = (
    id: ValueId,
    refuter: RootId,
    family: RootId,
    seed: string,
    outcome: Attempt["outcome"],
  ): void => {
    const attempt: Attempt = {
      refuter,
      family,
      seed,
      outcome,
      cost: 0,
      witness: WITNESS,
      submittedBy: SUBMITTER,
    };
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

  const score = (id: GraderId, valueId: ValueId): number =>
    graderOf(id).score(value(valueId), store, registry);

  return {
    root,
    claim,
    derived,
    challenge,
    value,
    score,
    registry: () => registry,
    store: () => store,
  };
}

describe("warrant arena determinism", () => {
  it("reproduces seeds:8 byte for byte and separates the seeds:9 corpus", () => {
    const first = runArena({ seeds: 8 });
    const second = runArena({ seeds: 8 });
    const shifted = runArena({ seeds: 9 });
    expect(canonicalJson(second)).toBe(canonicalJson(first));
    expect(second.digest).toBe(first.digest);
    expect(shifted.digest).not.toBe(first.digest);
    expect(first.config).toEqual({ seeds: 8 });
  });

  it("pins the frozen seed config and the raw LCG sequence", () => {
    expect(ARENA_SEEDS).toBe(200);
    expect(ARENA_BASE_SEED).toBe(0x9e3779b9);
    const fromZero = lcg(0);
    expect(fromZero()).toBe(0.23606797284446657);
    expect(fromZero()).toBe(0.278566908556968);
    expect(fromZero()).toBe(0.8195337599609047);
    const fromBase = lcg(ARENA_BASE_SEED);
    expect(fromBase()).toBe(0.26099918875843287);
    expect(fromBase()).toBe(0.9107361033093184);
    expect(fromBase()).toBe(0.24842891609296203);
  });

  it("keeps lcg deterministic per seed and local to each instance", () => {
    const left = lcg(7);
    const right = lcg(7);
    const leftValues = [left(), left(), left(), left()];
    const rightValues = [right(), right(), right(), right()];
    expect(rightValues).toEqual(leftValues);
    const fresh = lcg(7);
    for (const value of leftValues) {
      expect(fresh()).toBe(value);
    }
    expect(lcg(8)()).not.toBe(leftValues[0]);
  });
});

describe("warrant grader formulas", () => {
  it("scores a four-seed same-family manifest at the documented arms", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("same-family");
    for (const seed of ["0", "1", "2", "3"]) {
      w.challenge(id, refuter, family, seed, "survived");
    }
    expect(w.score("B0", id)).toBe(1);
    expect(w.score("B1", id)).toBe(4);
    expect(w.score("B2", id)).toBe(100);
    expect(w.score("B3", id)).toBe(4);
    expect(w.score("B4", id)).toBe(1);
    expect(w.score("B5", id)).toBe(1);
    expect(w.score("B6", id)).toBe(3);
    expect(w.score("B7", id)).toBe(1);
  });

  it("separates tuple counting from family counting below the cap", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const twoSeeds = w.claim("two-seeds");
    w.challenge(twoSeeds, refuter, family, "0", "survived");
    w.challenge(twoSeeds, refuter, family, "1", "survived");
    expect(w.score("B1", twoSeeds)).toBe(2);
    expect(w.score("B5", twoSeeds)).toBe(1);
    expect(w.score("B6", twoSeeds)).toBe(2);
    expect(w.score("B7", twoSeeds)).toBe(1);

    const replay = w.claim("replay");
    w.challenge(replay, refuter, family, "0", "survived");
    w.challenge(replay, refuter, family, "0", "survived");
    expect(w.score("B1", replay)).toBe(2);
    expect(w.score("B3", replay)).toBe(2);
    expect(w.score("B5", replay)).toBe(1);
    expect(w.score("B6", replay)).toBe(1);
    expect(w.score("B7", replay)).toBe(1);
  });

  it("caps B5, B6, and B7 at K=3 for four disjoint families", () => {
    const w = microWorld();
    const id = w.claim("four-families");
    for (const [index, key] of ["a", "b", "c", "d"].entries()) {
      const family = w.root(`family:${key}`, [`cov-${key}`]);
      const refuter = w.root(`refuter:${key}`);
      w.challenge(id, refuter, family, String(index), "survived");
    }
    expect(w.score("B0", id)).toBe(1);
    expect(w.score("B1", id)).toBe(4);
    expect(w.score("B2", id)).toBe(100);
    expect(w.score("B3", id)).toBe(4);
    expect(w.score("B5", id)).toBe(3);
    expect(w.score("B6", id)).toBe(3);
    expect(w.score("B7", id)).toBe(3);
  });

  it("keeps B4 alive/dead and lets dead propagate through frozen cites", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const alive = w.claim("alive");
    w.challenge(alive, refuter, family, "0", "survived");
    const dead = w.claim("dead");
    w.challenge(dead, refuter, family, "0", "survived");
    w.challenge(dead, refuter, family, "1", "refuted");
    const child = w.derived("child-of-dead", [dead]);

    expect(w.score("B4", alive)).toBe(1);
    expect(w.score("B4", dead)).toBe(0);
    expect(w.score("B4", child)).toBe(0);
    expect(lambda(w.store(), w.registry(), alive)).toBe(1);
    expect(lambda(w.store(), w.registry(), dead)).toBe("dead");
    expect(lambda(w.store(), w.registry(), child)).toBe("dead");
  });
});

describe("warrant dependency classes (B7/D)", () => {
  it("collapses same-family replays onto one dependency class", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const id = w.claim("replay-collapse");
    w.challenge(id, refuter, family, "0", "survived");
    w.challenge(id, refuter, family, "1", "survived");
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
    expect(w.score("B7", id)).toBe(1);
  });

  it("merges declared coverage at or above 1/2 and keeps disjoint families apart", () => {
    const w = microWorld();
    const four = w.root("family:overlap-four", ["a", "b", "c", "d"]);
    const three = w.root("family:overlap-three", ["a", "b", "c"]);
    const disjoint = w.root("family:disjoint", ["z"]);
    const rFour = w.root("refuter:overlap-four");
    const rThree = w.root("refuter:overlap-three");
    const rDisjoint = w.root("refuter:disjoint");
    const id = w.claim("overlap");
    w.challenge(id, rFour, four, "0", "survived");
    w.challenge(id, rFour, four, "1", "survived");
    expect(overlapRatio(["a", "b", "c", "d"], ["a", "b", "c"])).toBe(0.75);
    w.challenge(id, rThree, three, "0", "survived");
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
    expect(w.score("B7", id)).toBe(1);
    w.challenge(id, rDisjoint, disjoint, "0", "survived");
    expect(D(chainOf(w.store(), id), w.registry())).toBe(2);
    expect(w.score("B7", id)).toBe(2);
  });

  it("treats an exact 1/2 coverage overlap as one class", () => {
    const w = microWorld();
    const left = w.root("family:left", ["p", "q"]);
    const right = w.root("family:right", ["q", "r"]);
    const rLeft = w.root("refuter:left");
    const rRight = w.root("refuter:right");
    const id = w.claim("half-overlap");
    w.challenge(id, rLeft, left, "0", "survived");
    expect(overlapRatio(["p", "q"], ["q", "r"])).toBe(0.5);
    w.challenge(id, rRight, right, "0", "survived");
    expect(D(chainOf(w.store(), id), w.registry())).toBe(1);
    expect(w.score("B7", id)).toBe(1);
  });
});

describe("warrant oracle score", () => {
  it("collapses defective blind spots and counts correct families up to K", () => {
    const w = microWorld();
    const f0 = w.root("family:f0", ["f0"]);
    const f1 = w.root("family:f1", ["f1"]);
    const f2 = w.root("family:f2", ["f2"]);
    const r0 = w.root("refuter:r0");
    const r1 = w.root("refuter:r1");
    const r2 = w.root("refuter:r2");
    const id = w.claim("oracle");
    w.challenge(id, r0, f0, "0", "survived");
    w.challenge(id, r1, f1, "0", "survived");
    w.challenge(id, r2, f2, "0", "survived");

    const sameBlind = new Map<RootId, readonly number[]>([
      [f0, [4, 5]],
      [f1, [4, 5]],
      [f2, [4, 5]],
    ]);
    expect(oracleScore(w.value(id), w.store(), sameBlind, 4)).toBe(1);

    const mixedBlind = new Map<RootId, readonly number[]>([
      [f0, [4, 5]],
      [f1, [4, 6]],
      [f2, [7]],
    ]);
    expect(oracleScore(w.value(id), w.store(), mixedBlind, 4)).toBe(2);
    expect(oracleScore(w.value(id), w.store(), mixedBlind, 0)).toBe(0);
    expect(oracleScore(w.value(id), w.store(), mixedBlind, null)).toBe(3);

    const f3 = w.root("family:f3", ["f3"]);
    const r3 = w.root("refuter:r3");
    w.challenge(id, r3, f3, "0", "survived");
    expect(oracleScore(w.value(id), w.store(), mixedBlind, null)).toBe(3);
  });
});

describe("warrant metrics", () => {
  it("counts a tie as half a pair win", () => {
    expect(pairWinRate([2, 2, 3], [2, 1, 3])).toBe(2 / 3);
    expect(pairWinRate([4], [4])).toBe(0.5);
    expect(pairWinRate([0], [3])).toBe(0);
    expect(pairWinRate([], [])).toBe(0);
  });

  it("computes a tie-aware AUC", () => {
    expect(auc([1, 1, 1, 1], [1, 1, 0, 0])).toBe(0.5);
    expect(auc([2, 2, 3, 3], [0, 1, 0, 1])).toBe(0.5);
    expect(auc([0, 0, 5, 6], [0, 0, 1, 1])).toBe(1);
    expect(auc([], [])).toBe(0.5);
  });

  it("ranks suspicion with score zero first and precisions the top 12", () => {
    expect(apAt12([0, 3, 1, 2], [0, 1, 0, 0])).toBe(0.75);
    const thirteen = Array.from({ length: 13 }, (_, index) => index);
    const labels: (0 | 1)[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0];
    expect(apAt12(thirteen, labels)).toBe(0);
    expect(apAt12([1, 1], [0, 0])).toBe(1);
  });

  it("takes the nearest-rank 5th percentile", () => {
    expect(p5([])).toBe(0);
    expect(p5([9])).toBe(9);
    expect(p5([5, 1, 4, 3, 2])).toBe(1);
    expect(p5(Array.from({ length: 20 }, (_, index) => index + 1))).toBe(1);
    expect(p5(Array.from({ length: 100 }, (_, index) => index + 1))).toBe(5);
  });

  it("maps dead to -1 in the seed-delta mean", () => {
    const baseline: readonly (readonly Grade[])[] = [["dead", 3, 2]];
    const candidate: readonly (readonly Grade[])[] = [[0, 0, 0]];
    expect(seedDeltaMean(baseline, candidate)).toBe(2);
    const deadOnly: readonly (readonly Grade[])[] = [["dead"]];
    expect(seedDeltaMean(deadOnly, deadOnly)).toBe(0);
    expect(seedDeltaMean([], [])).toBe(0);
  });

  it("counts only candidate wins as pair flips", () => {
    expect(pairFlipRate([false, true, false, false], [true, false, true, false])).toBe(0.5);
    expect(pairFlipRate([], [])).toBe(0);
  });

  it("matches demotion precision and recall to the cone truth", () => {
    const w = microWorld();
    const family = w.root("family:f0", ["f0"]);
    const refuter = w.root("refuter:r0");
    const a = w.claim("cone-a");
    const b = w.claim("cone-b");
    const c = w.derived("cone-c", [a]);
    const d = w.derived("cone-d", [b, c]);
    w.challenge(c, refuter, family, "0", "refuted");

    const truth = new Set(cone(w.store(), c));
    expect([...truth].sort()).toEqual([c, d].sort());
    expect(demotionSanity(w.store(), w.registry(), truth)).toEqual({ precision: 1, recall: 1 });
    expect(lambda(w.store(), w.registry(), a)).toBe(0);
    expect(demotionSanity(emptyStore(), emptyRegistry(), new Set())).toEqual({
      precision: 1,
      recall: 1,
    });
  });
});

const SEEDS_8 = runArena({ seeds: 8 });

function criterion(id: CriterionStatus["id"]): CriterionStatus {
  const found = SEEDS_8.criteria.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new Error(`missing criterion ${id}`);
  }
  return found;
}

describe("warrant arena criteria (seeds:8)", () => {
  it("orders the nine criteria and passes P1-P5 with F1 the expected kill", () => {
    expect(SEEDS_8.criteria.map((entry) => entry.id)).toEqual([
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "F1",
      "F2",
      "F3",
      "F4",
    ]);
    for (const id of ["P1", "P2", "P3", "P4", "P5", "F2", "F3", "F4"] as const) {
      expect(criterion(id).status).toBe("pass");
    }
    expect(criterion("F1").status).toBe("fail");
    expect(criterion("F1").measured).toBe(true);
  });

  it("shows B7 beating the baselines with seed-stable grades and exact demotion", () => {
    expect(SEEDS_8.pw.R.B7.mean).toBeGreaterThan(SEEDS_8.pw.R.B1.mean);
    expect(SEEDS_8.pw.X.B7.mean).toBeGreaterThan(SEEDS_8.pw.X.B5.mean);
    expect(SEEDS_8.auc.X.B7.mean).toBeGreaterThan(SEEDS_8.auc.X.B5.mean);
    expect(SEEDS_8.churn.seedDeltaMean).toBe(0);
    expect(SEEDS_8.demotion).toEqual({ precision: 1, recall: 1 });
  });

  it("ties raw counts on every matched pair (exactly 0.5)", () => {
    expect(SEEDS_8.pw.R.B1.mean).toBe(0.5);
    expect(SEEDS_8.pw.R.B1.p5).toBe(0.5);
    expect(SEEDS_8.pw.X.B1.mean).toBe(0.5);
    expect(SEEDS_8.pw.X.B1.p5).toBe(0.5);
  });

  it("pins the seeds:8 digest", () => {
    expect(SEEDS_8.digest).toBe("053138bfbca949ec");
    expect(runArena({ seeds: 8 }).digest).toBe("053138bfbca949ec");
  });
});
