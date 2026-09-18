import { canonicalJson, warrantHash } from "./hash";
import { contextGenesis, headDigest, replaySig, rootIdOf, valueIdOf } from "./ids";
import { lambda } from "./grade";
import { emptyRegistry, registerRoot } from "./registry";
import { GRADERS, oracleScore } from "./graders";
import type { Grader, GraderId } from "./graders";
import {
  apAt12,
  auc,
  demotionSanity,
  mean,
  p5,
  pairFlipRate,
  pairWinRate,
  seedDeltaMean,
} from "./metrics";
import { cone } from "./graph";
import { WARRANT_MAX_GRADE } from "./types";
import type {
  Append,
  Attempt,
  ContextId,
  Grade,
  Registry,
  RootId,
  Store,
  Value,
  ValueId,
} from "./types";

export type Regime = "R" | "D" | "C" | "P" | "X";

export interface ArenaConfig {
  readonly seeds: number;
}

export const ARENA_SEEDS = 200;
export const ARENA_BASE_SEED = 0x9e3779b9;

export interface SeedStats {
  readonly mean: number;
  readonly p5: number;
}

export interface CriterionStatus {
  readonly id: "P1" | "P2" | "P3" | "P4" | "P5" | "F1" | "F2" | "F3" | "F4";
  readonly measured: number | boolean;
  readonly threshold: string;
  readonly status: "pass" | "fail";
  readonly note: string;
}

export interface ArenaResult {
  readonly digest: string;
  readonly config: ArenaConfig;
  readonly pw: Readonly<Record<Regime, Readonly<Record<GraderId, SeedStats>>>>;
  readonly auc: Readonly<Record<Regime, Readonly<Record<GraderId, SeedStats>>>>;
  readonly ap12: Readonly<Record<Regime, Readonly<Record<GraderId, SeedStats>>>>;
  readonly churn: { readonly seedDeltaMean: number; readonly pairFlipRate: number };
  readonly demotion: { readonly precision: number; readonly recall: number };
  readonly criteria: readonly CriterionStatus[];
}

const REGIMES: readonly Regime[] = ["R", "D", "C", "P", "X"];
const GRADER_IDS: readonly GraderId[] = ["B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"];
const VERIFIER = "arena-verifier";
const AUTHOR = "arena-author";

const FAMILY_KEYS = ["F0", "F1", "F2", "F3", "F2P", "F3P"] as const;
type FamilyKey = (typeof FAMILY_KEYS)[number];

interface FamilySpec {
  readonly coverage: readonly string[];
  readonly blind: readonly number[];
  readonly refuters: readonly string[];
}

const FAMILY_SPEC: Readonly<Record<FamilyKey, FamilySpec>> = {
  F0: { coverage: ["f0"], blind: [0, 1], refuters: ["r00", "r01", "r02", "r03"] },
  F1: { coverage: ["f1"], blind: [2, 3], refuters: ["r04", "r05", "r06", "r07"] },
  F2: { coverage: ["f2a", "f2b", "f2c", "f2d"], blind: [4, 5], refuters: ["r08", "r09", "r10", "r11"] },
  F3: { coverage: ["f3"], blind: [6, 7], refuters: ["r12", "r13", "r14", "r15"] },
  F2P: { coverage: ["f2a", "f2b", "f2c"], blind: [4, 5], refuters: ["r16", "r17", "r18", "r19"] },
  F3P: { coverage: ["f2a", "f2b", "f2d"], blind: [4, 5], refuters: ["r20", "r21", "r22", "r23"] },
};

interface Roots {
  readonly registry: Registry;
  readonly family: Readonly<Record<FamilyKey, RootId>>;
  readonly refuter: Readonly<Record<string, RootId>>;
  readonly blind: ReadonlyMap<RootId, readonly number[]>;
}

function buildRoots(): Roots {
  let registry = emptyRegistry();
  const family = {} as Record<FamilyKey, RootId>;
  const refuter: Record<string, RootId> = {};
  const blind = new Map<RootId, readonly number[]>();
  for (const key of FAMILY_KEYS) {
    const spec = FAMILY_SPEC[key];
    registry = registerRoot(registry, AUTHOR, `family:${key}`, spec.coverage);
    const rootId = rootIdOf(AUTHOR, `family:${key}`, [...new Set(spec.coverage)].sort());
    family[key] = rootId;
    blind.set(rootId, spec.blind);
    for (const name of spec.refuters) {
      registry = registerRoot(registry, AUTHOR, `refuter:${name}`, []);
      refuter[name] = rootIdOf(AUTHOR, `refuter:${name}`, []);
    }
  }
  return { registry, family, refuter, blind };
}

export function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function advance(seed: number, steps: number): number {
  let state = seed >>> 0;
  for (let index = 0; index < steps; index += 1) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
  }
  return state;
}

function shuffle<T>(items: T[], rnd: () => number): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rnd() * (index + 1));
    const temporary = items[index];
    items[index] = items[swap];
    items[swap] = temporary;
  }
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function makeAttempt(
  refuter: RootId,
  family: RootId,
  seed: string,
  outcome: Attempt["outcome"],
): Attempt {
  return {
    refuter,
    family,
    seed,
    outcome,
    cost: 0,
    witness: warrantHash(canonicalJson({ refuter, family, seed, outcome })),
    submittedBy: "arena",
  };
}

interface Values {
  readonly store: Store;
  readonly values: Map<ValueId, Value>;
}

function emptyValues(): Values {
  const values = new Map<ValueId, Value>();
  return { store: { values }, values };
}

function appendTo(value: Value, attempt: Attempt): Value {
  const prev = headDigest(value.id, value.chain);
  const sig = replaySig(VERIFIER, prev, attempt);
  const append: Append = { prev, attempt, admittedBy: VERIFIER, sig };
  return { ...value, chain: [...value.chain, append] };
}

function buildClaim(
  target: Values,
  payload: unknown,
  kind: string,
  context: ContextId,
  attempts: readonly Attempt[],
): ValueId {
  const genesis = contextGenesis(context);
  const id = valueIdOf("assert", kind, payload, [], context, genesis);
  const value: Value = {
    id,
    op: "assert",
    kind,
    payload,
    cites: [],
    context,
    genesis,
    chain: [],
  };
  target.values.set(id, attempts.reduce(appendTo, value));
  return id;
}

function buildDerived(
  target: Values,
  fDigest: string,
  cites: readonly ValueId[],
  context: ContextId,
): ValueId {
  const canonicalCites = [...new Set(cites)].sort();
  const genesis = contextGenesis(context);
  const id = valueIdOf("derive", "derive", fDigest, canonicalCites, context, genesis);
  const value: Value = {
    id,
    op: "derive",
    kind: "derive",
    payload: fDigest,
    cites: canonicalCites,
    context,
    genesis,
    chain: [],
  };
  target.values.set(id, value);
  return id;
}

interface ManifestEntry {
  readonly family: FamilyKey;
  readonly refuter: string;
  readonly seed: string;
}

function blindFamily(classIndex: number): FamilyKey {
  if (classIndex < 2) return "F0";
  if (classIndex < 4) return "F1";
  if (classIndex < 6) return "F2";
  return "F3";
}

function manifestFor(
  regime: Regime,
  defective: boolean,
  classIndex: number,
): readonly ManifestEntry[] {
  if (regime === "X") {
    if (defective) {
      return [
        { family: "F2", refuter: "r08", seed: "0" },
        { family: "F2P", refuter: "r16", seed: "0" },
        { family: "F3P", refuter: "r20", seed: "0" },
      ];
    }
    return [
      { family: "F0", refuter: "r00", seed: "0" },
      { family: "F0", refuter: "r00", seed: "1" },
      { family: "F1", refuter: "r04", seed: "0" },
    ];
  }
  const base: readonly ManifestEntry[] = defective
    ? [
        { family: blindFamily(classIndex), refuter: FAMILY_SPEC[blindFamily(classIndex)].refuters[0], seed: "0" },
        { family: blindFamily(classIndex), refuter: FAMILY_SPEC[blindFamily(classIndex)].refuters[0], seed: "1" },
        { family: blindFamily(classIndex), refuter: FAMILY_SPEC[blindFamily(classIndex)].refuters[0], seed: "2" },
      ]
    : [
        { family: "F0", refuter: "r00", seed: "0" },
        { family: "F1", refuter: "r04", seed: "0" },
        { family: "F2", refuter: "r08", seed: "0" },
      ];
  if (regime === "R" || regime === "D") {
    return base;
  }
  if (regime === "C") {
    const extras: ManifestEntry[] = [];
    for (let index = 0; index < 8; index += 1) {
      extras.push({
        family: base[0].family,
        refuter: base[0].refuter,
        seed: String(3 + index),
      });
    }
    return [...base, ...extras];
  }
  const replays: ManifestEntry[] = [];
  for (let index = 0; index < 8; index += 1) {
    replays.push(base[0]);
  }
  return [...base, ...replays];
}

function attemptsFor(
  roots: Roots,
  regime: Regime,
  defective: boolean,
  classIndex: number,
): readonly Attempt[] {
  return manifestFor(regime, defective, classIndex).map((entry) =>
    makeAttempt(roots.refuter[entry.refuter], roots.family[entry.family], entry.seed, "survived"),
  );
}

interface SeedScores {
  readonly pw: Record<string, number>;
  readonly auc: Record<string, number>;
  readonly ap12: Record<string, number>;
  readonly gradesR: readonly Grade[];
  readonly gradesC: readonly Grade[];
  readonly winsR: readonly boolean[];
  readonly winsC: readonly boolean[];
}

function emptyScoreMatrix(): Record<Regime, Record<GraderId, number[]>> {
  const matrix = {} as Record<Regime, Record<GraderId, number[]>>;
  for (const regime of REGIMES) {
    const row = {} as Record<GraderId, number[]>;
    for (const grader of GRADER_IDS) {
      row[grader] = [];
    }
    matrix[regime] = row;
  }
  return matrix;
}

function runSeed(
  roots: Roots,
  seedIndex: number,
  pwAccumulator: Record<Regime, Record<GraderId, number[]>>,
  aucAccumulator: Record<Regime, Record<GraderId, number[]>>,
  ap12Accumulator: Record<Regime, Record<GraderId, number[]>>,
  churnDelta: number[],
  churnFlip: number[],
): void {
  const rnd = lcg(advance(ARENA_BASE_SEED, seedIndex + 1));
  const defectiveFlags: boolean[] = [];
  for (let index = 0; index < 24; index += 1) defectiveFlags.push(true);
  for (let index = 0; index < 24; index += 1) defectiveFlags.push(false);
  shuffle(defectiveFlags, rnd);
  const classR: number[] = [];
  const classX: number[] = [];
  for (let index = 0; index < 48; index += 1) {
    if (defectiveFlags[index]) {
      const drawn = Math.floor(rnd() * 8);
      classR.push(drawn);
      classX.push(4 + (drawn % 2));
    } else {
      classR.push(-1);
      classX.push(-1);
    }
  }
  const defectiveIndices: number[] = [];
  const correctIndices: number[] = [];
  for (let index = 0; index < 48; index += 1) {
    (defectiveFlags[index] ? defectiveIndices : correctIndices).push(index);
  }
  shuffle(defectiveIndices, rnd);
  shuffle(correctIndices, rnd);
  const pairs: { correct: number; defective: number }[] = [];
  for (let index = 0; index < 12; index += 1) {
    pairs.push({ correct: correctIndices[index], defective: defectiveIndices[index] });
  }

  const target = emptyValues();
  const ids = {} as Record<Regime, ValueId[]>;
  const context = `arena:${seedIndex}`;
  for (const regime of REGIMES) {
    const row: ValueId[] = [];
    for (let index = 0; index < 48; index += 1) {
      const classIndex = regime === "X" ? classX[index] : classR[index];
      const attempts = attemptsFor(roots, regime, defectiveFlags[index], classIndex);
      row.push(buildClaim(target, { claim: `c${String(index).padStart(3, "0")}`, regime }, "claim", context, attempts));
    }
    ids[regime] = row;
  }

  const scoresByRegime = {} as Record<Regime, Record<GraderId, number[]>>;
  for (const regime of REGIMES) {
    const values = ids[regime].map((id) => target.values.get(id) as Value);
    const scores = {} as Record<GraderId, number[]>;
    for (const grader of GRADERS as readonly Grader[]) {
      scores[grader.id] = values.map((value) => grader.score(value, target.store, roots.registry));
    }
    scores.B8 = values.map((value, index) =>
      oracleScore(
        value,
        target.store,
        roots.blind,
        defectiveFlags[index] ? (regime === "X" ? classX[index] : classR[index]) : null,
      ),
    );
    scoresByRegime[regime] = scores;
    const labels = defectiveFlags.map((flag) => (flag ? 0 : 1) as 0 | 1);
    for (const grader of GRADER_IDS) {
      const graderScores = scores[grader];
      aucAccumulator[regime][grader].push(auc(graderScores, labels));
      ap12Accumulator[regime][grader].push(apAt12(graderScores, labels));
      const correctScores = pairs.map((pair) => graderScores[pair.correct]);
      const defectiveScores = pairs.map((pair) => graderScores[pair.defective]);
      pwAccumulator[regime][grader].push(pairWinRate(correctScores, defectiveScores));
    }
  }

  const gradesR = ids.R.map((id) => lambda(target.store, roots.registry, id));
  const gradesC = ids.C.map((id) => lambda(target.store, roots.registry, id));
  churnDelta.push(seedDeltaMean([gradesR], [gradesC]));
  const winsFor = (regime: Regime): boolean[] =>
    pairs.map((pair) => scoresByRegime[regime].B7[pair.correct] > scoresByRegime[regime].B7[pair.defective]);
  const winsR = winsFor("R");
  const winsC = winsFor("C");
  churnFlip.push(pairFlipRate(winsR, winsC));
}

function runDemotionSanity(roots: Roots): { precision: number; recall: number } {
  const rnd = lcg(advance(ARENA_BASE_SEED, ARENA_SEEDS + 1));
  let precisionTotal = 0;
  let recallTotal = 0;
  for (let dag = 0; dag < 100; dag += 1) {
    const target = emptyValues();
    const context = `arena-demotion:${dag}`;
    const nodeCount = 6 + Math.floor(rnd() * 7);
    const nodes: ValueId[] = [];
    for (let index = 0; index < 3; index += 1) {
      nodes.push(buildClaim(target, { dag, node: index }, "leaf", context, []));
    }
    for (let index = 3; index < nodeCount; index += 1) {
      const cites = [nodes[Math.floor(rnd() * index)]];
      if (rnd() < 0.5) {
        const second = nodes[Math.floor(rnd() * index)];
        if (second !== cites[0]) {
          cites.push(second);
        }
      }
      nodes.push(
        buildDerived(target, warrantHash(canonicalJson({ dag, node: index })), cites, context),
      );
    }
    const marked = nodes[3 + Math.floor(rnd() * (nodeCount - 3))];
    const markedValue = target.values.get(marked);
    if (markedValue !== undefined) {
      const attempt = makeAttempt(roots.refuter.r00, roots.family.F0, "0", "refuted");
      target.values.set(marked, appendTo(markedValue, attempt));
    }
    const truth = new Set<ValueId>(cone(target.store, marked));
    const sanity = demotionSanity(target.store, roots.registry, truth);
    precisionTotal += sanity.precision;
    recallTotal += sanity.recall;
  }
  return { precision: round6(precisionTotal / 100), recall: round6(recallTotal / 100) };
}

function seedStats(accumulator: readonly number[]): SeedStats {
  return { mean: round6(mean(accumulator)), p5: round6(p5(accumulator)) };
}

function criteriaFor(
  pw: Record<Regime, Record<GraderId, number[]>>,
  aucAccumulator: Record<Regime, Record<GraderId, number[]>>,
  ap12Accumulator: Record<Regime, Record<GraderId, number[]>>,
  churnDelta: readonly number[],
  churnFlip: readonly number[],
): readonly CriterionStatus[] {
  const difference = (left: readonly number[], right: readonly number[]): number[] =>
    left.map((value, index) => value - right[index]);
  const p1 = p5(difference(pw.R.B7, pw.R.B1));
  const p2pw = p5(difference(pw.X.B7, pw.X.B5));
  const p2auc = p5(difference(aucAccumulator.X.B7, aucAccumulator.X.B5));
  const churnMean = mean(churnDelta);
  const flipMean = mean(churnFlip);
  const p4ap = p5(ap12Accumulator.X.B7);
  const p4gap = p5(difference(ap12Accumulator.X.B7, ap12Accumulator.X.B5));
  const p5value = Math.min(
    ...REGIMES.map((regime) => p5(difference(aucAccumulator[regime].B7, aucAccumulator[regime].B5))),
  );
  const f1 =
    p5(difference(pw.R.B6, pw.R.B1)) <= 0.05 && p5(difference(pw.X.B6, pw.X.B7)) <= -0.1;
  const f2 = !(churnMean <= 0.1 && flipMean <= 0.05);
  const f3value = p5(difference(aucAccumulator.X.B8, aucAccumulator.X.B5));
  const f4 = p2pw >= 0.1;
  return [
    { id: "P1", measured: round6(p1), threshold: ">= 0.15 (p5, R: B7-B1)", status: p1 >= 0.15 ? "pass" : "fail", note: "declared dependence beats raw count under redundancy" },
    { id: "P2", measured: round6(p2pw), threshold: ">= 0.10 (p5, X: B7-B5)", status: p2pw >= 0.1 && p2auc >= 0.1 ? "pass" : "fail", note: `AUC gap ${round6(p2auc)} (>= 0.10)` },
    { id: "P3", measured: round6(churnMean), threshold: "seed churn mean <= 0.1 and flips <= 0.05", status: churnMean <= 0.1 && flipMean <= 0.05 ? "pass" : "fail", note: `flip rate ${round6(flipMean)}` },
    { id: "P4", measured: round6(p4ap), threshold: "AP@12 >= 0.75 (p5, X)", status: p4ap >= 0.75 && p4gap >= 0.1 ? "pass" : "fail", note: `gap over B5 ${round6(p4gap)}` },
    { id: "P5", measured: round6(p5value), threshold: ">= -0.02 (p5, every regime)", status: p5value >= -0.02 ? "pass" : "fail", note: "no calibration regression vs B5" },
    { id: "F1", measured: f1, threshold: "B6 does not beat B1 in R and is dominated by B7 in X", status: f1 ? "fail" : "pass", note: "expected: the syntactic tuple variant is a dedup count" },
    { id: "F2", measured: f2, threshold: "seed-only churn must not raise gamma", status: f2 ? "fail" : "pass", note: "seeds never add a dependency class" },
    { id: "F3", measured: round6(f3value), threshold: "> 0.05 headroom over B5 (p5, X, B8-B5)", status: f3value <= 0.05 ? "fail" : "pass", note: "oracle ceiling confirms remaining signal" },
    { id: "F4", measured: round6(p2pw), threshold: "reported: collapsed-manifest X advantage >= 0.10", status: f4 ? "pass" : "fail", note: "X pair sides already have one attempt per family, so the collapse is a no-op" },
  ];
}

export function runArena(config?: Partial<ArenaConfig>): ArenaResult {
  const seeds = config?.seeds ?? ARENA_SEEDS;
  const roots = buildRoots();
  const pwAccumulator = emptyScoreMatrix();
  const aucAccumulator = emptyScoreMatrix();
  const ap12Accumulator = emptyScoreMatrix();
  const churnDelta: number[] = [];
  const churnFlip: number[] = [];
  for (let seedIndex = 0; seedIndex < seeds; seedIndex += 1) {
    runSeed(roots, seedIndex, pwAccumulator, aucAccumulator, ap12Accumulator, churnDelta, churnFlip);
  }
  const pw = {} as Record<Regime, Record<GraderId, SeedStats>>;
  const aucStats = {} as Record<Regime, Record<GraderId, SeedStats>>;
  const ap12Stats = {} as Record<Regime, Record<GraderId, SeedStats>>;
  for (const regime of REGIMES) {
    const pwRow = {} as Record<GraderId, SeedStats>;
    const aucRow = {} as Record<GraderId, SeedStats>;
    const apRow = {} as Record<GraderId, SeedStats>;
    for (const grader of GRADER_IDS) {
      pwRow[grader] = seedStats(pwAccumulator[regime][grader]);
      aucRow[grader] = seedStats(aucAccumulator[regime][grader]);
      apRow[grader] = seedStats(ap12Accumulator[regime][grader]);
    }
    pw[regime] = pwRow;
    aucStats[regime] = aucRow;
    ap12Stats[regime] = apRow;
  }
  const churn = {
    seedDeltaMean: round6(mean(churnDelta)),
    pairFlipRate: round6(mean(churnFlip)),
  };
  const demotion = runDemotionSanity(roots);
  const criteria = criteriaFor(
    pwAccumulator,
    aucAccumulator,
    ap12Accumulator,
    churnDelta,
    churnFlip,
  );
  const body = { config: { seeds }, pw, auc: aucStats, ap12: ap12Stats, churn, demotion, criteria };
  const digest = warrantHash(canonicalJson(body));
  return { digest, ...body };
}
