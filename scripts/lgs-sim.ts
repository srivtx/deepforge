import {
  LGS_DEFAULTS,
  gradeLadderReview,
  lgsRetrievability,
  lgsRetrievabilityAt,
  type LgsState,
} from "../src/lib/lgs";

type ArmName = "lgs" | "sm2" | "oracle";
type ReviewQuality = 0 | 3 | 4 | 5;

const COHORT_SEED = 20260918;
const SIM_SEED = 987654321;
const EDGE_SEED = 20260919;
const HORIZON = 365;
const RETAIN_THRESHOLD = 0.7;
const MATCH_TARGET = 0.5;
const OFFSETS = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5];
const CI_SEEDS = 30;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function clamp(a: number, b: number, x: number): number {
  return Math.min(b, Math.max(a, x));
}

const DAY_MS = 86_400_000;

function dayDate(day: number): Date {
  return new Date(2026, 0, 1 + day, 12, 0, 0);
}

function dayKey(day: number): string {
  const d = dayDate(day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function keyDiff(a: string, b: string): number {
  const pa = a.split("-").map(Number);
  const pb = b.split("-").map(Number);
  return Math.round(
    (Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / DAY_MS,
  );
}

/* ───────────────────────── exact SM-2 port ───────────────────────── */

function clampEase(ease: number): number {
  return Math.round(Math.min(2.8, Math.max(1.3, ease)) * 1000) / 1000;
}

function qualityFromRun(run: {
  passed: boolean;
  failedRuns?: number;
  resetBeforePass?: boolean;
}): ReviewQuality {
  if (!run.passed) return 0;
  if (run.resetBeforePass) return 3;
  if ((run.failedRuns ?? 0) > 0) return 4;
  return 5;
}

function hintPenalty(usedTiers: readonly number[]): number {
  let highest = 0;
  for (const tier of usedTiers) {
    if (!Number.isFinite(tier)) continue;
    highest = Math.max(highest, Math.min(3, Math.max(0, Math.floor(tier))));
  }
  return highest;
}

function applyHintPenalty(baseQuality: number, usedTiers: readonly number[]): number {
  const base = clamp(0, 5, Math.round(baseQuality));
  if (base < 3) return base;
  return Math.max(3, base - hintPenalty(usedTiers));
}

interface Sm2State {
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  dueDay: number;
  lastReviewedDay: number | null;
}

function seedSm2(): Sm2State {
  return { ease: 2.5, interval: 1, reps: 0, lapses: 0, dueDay: 1, lastReviewedDay: null };
}

function gradeSm2(prev: Sm2State, quality: ReviewQuality, day: number): Sm2State {
  if (quality < 3) {
    return {
      ease: clampEase(prev.ease - 0.2),
      interval: 1,
      reps: 0,
      lapses: prev.lapses + 1,
      dueDay: day + 1,
      lastReviewedDay: day,
    };
  }
  const interval =
    prev.reps === 0
      ? 1
      : prev.reps === 1
        ? 6
        : Math.max(1, Math.round(prev.interval * prev.ease));
  const delta = 0.1 - (5 - quality) * (0.08 + 0.02 * (5 - quality));
  return {
    ease: clampEase(prev.ease + delta),
    interval,
    reps: prev.reps + 1,
    lapses: prev.lapses,
    dueDay: day + interval,
    lastReviewedDay: day,
  };
}

/* ──────────────────────────── truth model ─────────────────────────── */

function truthSuccess(S: number, D: number, r: number): number {
  const p = LGS_DEFAULTS;
  const growth =
    1 + Math.exp(p.w8) * (11 - D) * Math.pow(S, -p.w9) * (Math.exp(p.w10 * (1 - r)) - 1);
  return S * growth;
}

function truthLapse(S: number, D: number, r: number): number {
  const p = LGS_DEFAULTS;
  return (
    p.w11 *
    Math.pow(D, -p.w12) *
    (Math.pow(S + 1, p.w13) - 1) *
    Math.exp(p.w14 * (1 - r))
  );
}

/* ──────────────────────────── cohort ──────────────────────────────── */

interface TrueItem {
  delta: number;
  S: number;
}

interface Learner {
  ability: number;
  items: TrueItem[];
}

interface CohortCfg {
  L: number;
  M: number;
  abilitySd: number;
  deltaSd: number;
  s0LogMean: number;
  s0LogSd: number;
  s0Min: number;
  s0Max: number;
}

const DEFAULT_COHORT: CohortCfg = {
  L: 100,
  M: 40,
  abilitySd: 0.7,
  deltaSd: 1.0,
  s0LogMean: 0.8,
  s0LogSd: 0.5,
  s0Min: 0.3,
  s0Max: 20,
};

function makeCohort(seed: number, cfg: CohortCfg = DEFAULT_COHORT): Learner[] {
  const rng = mulberry32(seed);
  const learners: Learner[] = [];
  for (let l = 0; l < cfg.L; l += 1) {
    const ability = cfg.abilitySd * gaussian(rng);
    const items: TrueItem[] = [];
    for (let m = 0; m < cfg.M; m += 1) {
      const delta = cfg.deltaSd * gaussian(rng);
      const s0 = clamp(
        cfg.s0Min,
        cfg.s0Max,
        Math.exp(cfg.s0LogMean + cfg.s0LogSd * gaussian(rng)),
      );
      items.push({ delta, S: s0 });
    }
    learners.push({ ability, items });
  }
  return learners;
}

/* ───────────────────────────── policies ───────────────────────────── */

interface Policy {
  forceFail?: boolean;
  forcePass?: boolean;
  tier3Always?: boolean;
  resetOnPass?: boolean;
}

type PolicyFn = (learner: number, item: number) => Policy;

const DEFAULT_POLICY: PolicyFn = () => ({});

const POLICIES: Record<string, PolicyFn> = {
  default: DEFAULT_POLICY,
  hintHeavy: () => ({ tier3Always: true }),
  resetHeavy: () => ({ resetOnPass: true }),
  oneLeech: (_learner, item) => (item === 0 ? { forceFail: true } : {}),
  allFail: () => ({ forceFail: true }),
  perfect: () => ({ forcePass: true }),
};

interface SessionResult {
  first: boolean;
  passed: boolean;
  failedRuns: number;
  hintTier: number;
  reset: boolean;
}

function runSession(p: number, rng: () => number, pol: Policy): SessionResult {
  let first = false;
  let passed = false;
  let failedRuns = 0;
  if (pol.forceFail) {
    failedRuns = 4;
  } else if (pol.forcePass) {
    first = true;
    passed = true;
  } else {
    first = rng() < p;
    if (first) {
      passed = true;
    } else {
      failedRuns = 1;
      while (failedRuns < 4) {
        if (rng() < p) {
          passed = true;
          break;
        }
        failedRuns += 1;
      }
    }
  }
  const hintTier = pol.tier3Always ? 3 : failedRuns >= 2 ? 3 : failedRuns >= 1 ? 2 : 0;
  const reset = pol.resetOnPass ? passed : false;
  return { first, passed, failedRuns, hintTier, reset };
}

/* ──────────────────────────── arm runner ──────────────────────────── */

interface SimOpts {
  arm: ArmName;
  gtPredictor: "p" | "Rmem";
  sigmaOffset: number;
  policy: PolicyFn;
  horizon: number;
  dailyCap: number;
}

function defaultOpts(overrides: Partial<SimOpts> = {}): SimOpts {
  return {
    arm: "lgs",
    gtPredictor: "p",
    sigmaOffset: 0,
    policy: DEFAULT_POLICY,
    horizon: HORIZON,
    dailyCap: Infinity,
    ...overrides,
  };
}

interface ArmResult {
  arm: ArmName;
  reviews: number;
  sessions: number;
  firstAttemptRecall: number;
  brier: number;
  retained: number;
  reviewsPerRetained: number;
  reviewsPerDay: number[];
}

function seedLgs(): LgsState {
  return {
    ease: 2.5,
    interval: 1,
    due: dayKey(1),
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    v: 2,
    S: 1,
    D: 5,
    effort: 0,
  };
}

function runArm(learner: Learner, learnerIndex: number, opts: SimOpts, seed: number): ArmResult {
  const rng = mulberry32(seed ^ (learnerIndex * 2654435761) ^ (opts.arm.length * 97));
  const H = opts.horizon;
  const M = learner.items.length;
  const cap = opts.dailyCap;
  const offset = opts.sigmaOffset;

  const truth: TrueItem[] = learner.items.map((item) => ({ delta: item.delta, S: item.S }));
  const trueD: number[] = learner.items.map((item) => clamp(1, 10, 5 + item.delta));
  const lastUpdate: number[] = learner.items.map(() => 0);

  const sm2States: Sm2State[] = learner.items.map(() => seedSm2());
  const lgsStates: LgsState[] = learner.items.map(() => seedLgs());
  const oracleLastUpdate: number[] = learner.items.map(() => 0);

  let sessions = 0;
  let firstSum = 0;
  let brierSum = 0;
  const reviewsPerDay = new Array<number>(H + 1).fill(0);

  for (let t = 1; t <= H; t += 1) {
    const now = dayDate(t);
    const due: number[] = [];
    for (let i = 0; i < M; i += 1) {
      let d = Infinity;
      if (opts.arm === "lgs") {
        d = keyDiff(dayKey(0), lgsStates[i].due);
      } else if (opts.arm === "sm2") {
        d = sm2States[i].dueDay;
      } else {
        d = oracleLastUpdate[i] + Math.max(1, Math.round(truth[i].S));
      }
      if (d <= t) due.push(i);
    }
    due.sort((a, b) => {
      const da =
        opts.arm === "sm2"
          ? sm2States[a].dueDay
          : opts.arm === "oracle"
            ? oracleLastUpdate[a] + Math.round(truth[a].S)
            : keyDiff(dayKey(0), lgsStates[a].due);
      const db =
        opts.arm === "sm2"
          ? sm2States[b].dueDay
          : opts.arm === "oracle"
            ? oracleLastUpdate[b] + Math.round(truth[b].S)
            : keyDiff(dayKey(0), lgsStates[b].due);
      return da - db || a - b;
    });
    const batch = Number.isFinite(cap) ? due.slice(0, Math.max(0, Math.round(cap))) : due;

    for (const i of batch) {
      const elapsed = t - lastUpdate[i];
      const rmem = lgsRetrievabilityAt(elapsed, truth[i].S);
      const sigma = sigmoid(learner.ability - truth[i].delta + offset);
      const pTrue = clamp(0, 1, rmem * sigma);
      const pol = opts.policy(learnerIndex, i);
      const session = runSession(pTrue, rng, pol);

      let rpred: number;
      if (opts.arm === "lgs") {
        rpred = lgsRetrievability(lgsStates[i], now);
      } else if (opts.arm === "sm2") {
        const st = sm2States[i];
        const el = st.lastReviewedDay === null ? elapsed : Math.max(0, t - st.lastReviewedDay);
        rpred = lgsRetrievabilityAt(el, Math.max(0.1, st.interval || 1));
      } else {
        rpred = lgsRetrievabilityAt(t - oracleLastUpdate[i], truth[i].S);
      }

      sessions += 1;
      if (session.first) firstSum += 1;
      brierSum += (rpred - (session.first ? 1 : 0)) ** 2;
      reviewsPerDay[t] += 1;

      if (opts.arm === "lgs") {
        lgsStates[i] = gradeLadderReview(
          lgsStates[i],
          {
            passed: session.passed,
            failedRuns: session.failedRuns,
            hintTier: session.hintTier,
            resetBeforePass: session.reset,
          },
          now,
        );
      } else if (opts.arm === "sm2") {
        const quality = qualityFromRun({
          passed: session.passed,
          failedRuns: session.failedRuns,
          resetBeforePass: session.reset,
        });
        const adjusted = applyHintPenalty(quality, session.hintTier > 0 ? [session.hintTier] : []);
        sm2States[i] = gradeSm2(sm2States[i], adjusted as ReviewQuality, t);
      }

      const rForTruth = opts.gtPredictor === "Rmem" ? rmem : pTrue;
      truth[i].S = clamp(
        0.1,
        36500,
        session.passed
          ? truthSuccess(truth[i].S, trueD[i], rForTruth)
          : truthLapse(truth[i].S, trueD[i], rForTruth),
      );
      if (opts.arm === "oracle") oracleLastUpdate[i] = t;
      lastUpdate[i] = t;
    }
  }

  let retained = 0;
  for (let i = 0; i < M; i += 1) {
    const rmem = lgsRetrievabilityAt(H - lastUpdate[i], truth[i].S);
    if (rmem >= RETAIN_THRESHOLD) retained += 1;
  }

  return {
    arm: opts.arm,
    reviews: sessions,
    sessions,
    firstAttemptRecall: sessions === 0 ? NaN : firstSum / sessions,
    brier: sessions === 0 ? NaN : brierSum / sessions,
    retained,
    reviewsPerRetained: retained === 0 ? Infinity : sessions / retained,
    reviewsPerDay,
  };
}

function runCohort(cohort: Learner[], opts: SimOpts, seed: number): ArmResult {
  const rows = cohort.map((learner, index) => runArm(learner, index, opts, seed));
  const sessions = rows.reduce((sum, row) => sum + row.sessions, 0);
  const firstSum = rows.reduce((sum, row) => sum + row.sessions * row.firstAttemptRecall, 0);
  const brierSum = rows.reduce((sum, row) => sum + row.sessions * row.brier, 0);
  const retained = rows.reduce((sum, row) => sum + row.retained, 0);
  const reviewsPerDay = new Array<number>(HORIZON + 1).fill(0);
  for (const row of rows) {
    for (let t = 0; t < reviewsPerDay.length; t += 1) reviewsPerDay[t] += row.reviewsPerDay[t];
  }
  return {
    arm: opts.arm,
    reviews: sessions,
    sessions,
    firstAttemptRecall: firstSum / sessions,
    brier: brierSum / sessions,
    retained,
    reviewsPerRetained: retained === 0 ? Infinity : sessions / retained,
    reviewsPerDay,
  };
}

function p95(values: number[]): number {
  const nonzero = values
    .slice(1)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
  if (nonzero.length === 0) return 0;
  return nonzero[Math.floor(0.95 * (nonzero.length - 1))];
}

interface Point {
  recall: number;
  rpr: number;
  brier: number;
}

function interpolate(points: Point[], target: number): Point | null {
  const sorted = [...points].sort((a, b) => a.recall - b.recall);
  for (let i = 0; i + 1 < sorted.length; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (target >= a.recall && target <= b.recall) {
      if (a.recall === b.recall) {
        return {
          recall: target,
          rpr: (a.rpr + b.rpr) / 2,
          brier: (a.brier + b.brier) / 2,
        };
      }
      const f = (target - a.recall) / (b.recall - a.recall);
      return {
        recall: target,
        rpr: a.rpr + f * (b.rpr - a.rpr),
        brier: a.brier + f * (b.brier - a.brier),
      };
    }
  }
  return null;
}

function percentFewer(lgsValue: number, sm2Value: number): number {
  return (1 - lgsValue / sm2Value) * 100;
}

function fmt(value: number, digits = 4): string {
  return Number.isFinite(value) ? value.toFixed(digits) : String(value);
}

function printArm(name: string, result: ArmResult): void {
  console.log(
    `${name.padEnd(7)} reviews=${String(result.reviews).padStart(7)} ` +
      `rpr=${fmt(result.reviewsPerRetained, 4).padStart(9)} ` +
      `recall=${fmt(result.firstAttemptRecall, 4)} ` +
      `brier=${fmt(result.brier, 4)} ` +
      `retained=${String(result.retained).padStart(5)} ` +
      `p95=${String(p95(result.reviewsPerDay)).padStart(4)}`,
  );
}

function seedCI(
  params: { reading: "p" | "Rmem" },
  gates: string[],
): {
  mean: number;
  lo: number;
  hi: number;
  seedsPass10: number;
  meanBrierDelta: number;
  brierLo: number;
  brierHi: number;
  meanRecallDelta: number;
  recallLo: number;
  recallHi: number;
  seedsBrierWorse: number;
} {
  const rows: {
    pctFewer: number;
    brierDelta: number;
    recallDelta: number;
  }[] = [];
  for (let s = 1; s <= CI_SEEDS; s += 1) {
    const cohort = makeCohort(s);
    const sm2 = runCohort(cohort, defaultOpts({ arm: "sm2", gtPredictor: params.reading }), SIM_SEED);
    const lgs = runCohort(cohort, defaultOpts({ arm: "lgs", gtPredictor: params.reading }), SIM_SEED);
    rows.push({
      pctFewer: percentFewer(lgs.reviewsPerRetained, sm2.reviewsPerRetained),
      brierDelta: lgs.brier - sm2.brier,
      recallDelta: lgs.firstAttemptRecall - sm2.firstAttemptRecall,
    });
  }
  const pcts = rows.map((row) => row.pctFewer).sort((a, b) => a - b);
  const mean = pcts.reduce((sum, value) => sum + value, 0) / pcts.length;
  const sd = Math.sqrt(
    pcts.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (pcts.length - 1),
  );
  const t = 2.045;
  const meanOf = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const tCI = (values: number[], valueMean: number): [number, number] => {
    const variance =
      values.reduce((sum, value) => sum + (value - valueMean) ** 2, 0) /
      (values.length - 1);
    const se = Math.sqrt(variance) / Math.sqrt(values.length);
    return [valueMean - t * se, valueMean + t * se];
  };
  const meanBrierDelta = meanOf(rows.map((row) => row.brierDelta));
  const meanRecallDelta = meanOf(rows.map((row) => row.recallDelta));
  const [brierLo, brierHi] = tCI(rows.map((row) => row.brierDelta), meanBrierDelta);
  const [recallLo, recallHi] = tCI(rows.map((row) => row.recallDelta), meanRecallDelta);
  const seedsPass10 = rows.filter((row) => row.pctFewer >= 10).length;
  const seedsBrierWorse = rows.filter((row) => row.brierDelta > 0).length;
  const lo = mean - (t * sd) / Math.sqrt(rows.length);
  const hi = mean + (t * sd) / Math.sqrt(rows.length);
  console.log(
    `reading ${params.reading.padEnd(4)}: mean=${fmt(mean, 4)}% ` +
      `tCI=[${fmt(lo, 4)}, ${fmt(hi, 4)}] ` +
      `seeds>=10%: ${seedsPass10}/${rows.length} ` +
      `meanBrierDelta=${fmt(meanBrierDelta, 4)} brierCI=[${fmt(brierLo, 4)}, ${fmt(brierHi, 4)}] ` +
      `seedsWorse=${seedsBrierWorse} meanRecallDelta=${fmt(meanRecallDelta, 4)} ` +
      `recallCI=[${fmt(recallLo, 4)}, ${fmt(recallHi, 4)}] minSeed=${fmt(pcts[0], 4)}`,
  );
  if (seedsPass10 < CI_SEEDS) gates.push(`seedCI ${params.reading}: only ${seedsPass10}/30 seeds >= 10%`);
  return {
    mean,
    lo,
    hi,
    seedsPass10,
    meanBrierDelta,
    brierLo,
    brierHi,
    meanRecallDelta,
    recallLo,
    recallHi,
    seedsBrierWorse,
  };
}

console.log("=== LGS wave-40 simulation (variant noE, corrected memory-based protocol) ===");
console.log(
  `cohort seed=${COHORT_SEED} sim seed=${SIM_SEED} edge seed=${EDGE_SEED} ` +
    `L=${DEFAULT_COHORT.L} M=${DEFAULT_COHORT.M} horizon=${HORIZON}`,
);
console.log("");

const gates: string[] = [];

const cohort = makeCohort(COHORT_SEED);

console.log("[literal protocol] gtPredictor=p (paper section 8 reading, retention degenerate)");
const literalSm2 = runCohort(cohort, defaultOpts({ arm: "sm2", gtPredictor: "p" }), SIM_SEED);
const literalLgs = runCohort(cohort, defaultOpts({ arm: "lgs", gtPredictor: "p" }), SIM_SEED);
const literalOracle = runCohort(cohort, defaultOpts({ arm: "oracle", gtPredictor: "p" }), SIM_SEED);
printArm("sm2", literalSm2);
printArm("lgs", literalLgs);
printArm("oracle", literalOracle);
console.log(
  `lgs vs sm2: pctFewerRpr=${fmt(percentFewer(literalLgs.reviewsPerRetained, literalSm2.reviewsPerRetained), 4)}% ` +
    `reviewsRatio=${fmt(literalLgs.reviews / literalSm2.reviews, 4)} ` +
    `recallDelta=${fmt(literalLgs.firstAttemptRecall - literalSm2.firstAttemptRecall, 4)} ` +
    `brierDelta=${fmt(literalLgs.brier - literalSm2.brier, 4)}`,
);
console.log("");

console.log("[memory protocol] gtPredictor=Rmem (memory-only truth)");
const memorySm2 = runCohort(cohort, defaultOpts({ arm: "sm2", gtPredictor: "Rmem" }), SIM_SEED);
const memoryLgs = runCohort(cohort, defaultOpts({ arm: "lgs", gtPredictor: "Rmem" }), SIM_SEED);
printArm("sm2", memorySm2);
printArm("lgs", memoryLgs);
console.log(
  `lgs vs sm2: pctFewerRpr=${fmt(percentFewer(memoryLgs.reviewsPerRetained, memorySm2.reviewsPerRetained), 4)}% ` +
    `reviewsRatio=${fmt(memoryLgs.reviews / memorySm2.reviews, 4)} ` +
    `recallDelta=${fmt(memoryLgs.firstAttemptRecall - memorySm2.firstAttemptRecall, 4)} ` +
    `brierDelta=${fmt(memoryLgs.brier - memorySm2.brier, 4)}`,
);
console.log("");

console.log(`[recall-matched at r=${MATCH_TARGET}] ability-offset interpolation, Rmem`);
const sm2Points: Point[] = [];
const lgsPoints: Point[] = [];
for (const offset of OFFSETS) {
  const sm2 = runCohort(
    cohort,
    defaultOpts({ arm: "sm2", gtPredictor: "Rmem", sigmaOffset: offset }),
    SIM_SEED,
  );
  const lgs = runCohort(
    cohort,
    defaultOpts({ arm: "lgs", gtPredictor: "Rmem", sigmaOffset: offset }),
    SIM_SEED,
  );
  sm2Points.push({
    recall: sm2.firstAttemptRecall,
    rpr: sm2.reviewsPerRetained,
    brier: sm2.brier,
  });
  lgsPoints.push({
    recall: lgs.firstAttemptRecall,
    rpr: lgs.reviewsPerRetained,
    brier: lgs.brier,
  });
  console.log(
    `offset ${String(offset).padStart(4)}: sm2 recall=${fmt(sm2.firstAttemptRecall, 4)} rpr=${fmt(sm2.reviewsPerRetained, 4)} | ` +
      `lgs recall=${fmt(lgs.firstAttemptRecall, 4)} rpr=${fmt(lgs.reviewsPerRetained, 4)}`,
  );
}
const sm2Matched = interpolate(sm2Points, MATCH_TARGET);
const lgsMatched = interpolate(lgsPoints, MATCH_TARGET);
let matchedFewer = NaN;
if (sm2Matched && lgsMatched) {
  matchedFewer = percentFewer(lgsMatched.rpr, sm2Matched.rpr);
  console.log(
    `matched@0.5: lgs rpr=${fmt(lgsMatched.rpr, 4)} brier=${fmt(lgsMatched.brier, 4)} | ` +
      `sm2 rpr=${fmt(sm2Matched.rpr, 4)} brier=${fmt(sm2Matched.brier, 4)}`,
  );
  console.log(
    `matched@0.5: pctFewer=${fmt(matchedFewer, 4)}% brierDelta=${fmt(lgsMatched.brier - sm2Matched.brier, 4)}`,
  );
  if (matchedFewer < 10) gates.push(`matched: only ${fmt(matchedFewer, 4)}% fewer (<10%)`);
  if (lgsMatched.brier > sm2Matched.brier + 0.01) {
    gates.push(`matched brier ${fmt(lgsMatched.brier, 4)} > sm2 + 0.01`);
  }
} else {
  gates.push("matched interpolation failed");
}
console.log("");

console.log(`[30-seed CI] paired cohorts, ${CI_SEEDS} fixed seeds 1..${CI_SEEDS}`);
const ciP = seedCI({ reading: "p" }, gates);
const ciR = seedCI({ reading: "Rmem" }, gates);

console.log("");
console.log("[edge learners] edge cohort, Rmem, reviews ratio lgs/sm2");
const edgeCohort = makeCohort(EDGE_SEED, { ...DEFAULT_COHORT, L: 50 });
for (const name of ["hintHeavy", "resetHeavy", "oneLeech", "allFail", "perfect"]) {
  const policy = POLICIES[name];
  const sm2 = runCohort(edgeCohort, defaultOpts({ arm: "sm2", gtPredictor: "Rmem", policy }), SIM_SEED);
  const lgs = runCohort(edgeCohort, defaultOpts({ arm: "lgs", gtPredictor: "Rmem", policy }), SIM_SEED);
  const ratio = lgs.reviews / sm2.reviews;
  console.log(
    `${name.padEnd(10)} sm2=${String(sm2.reviews).padStart(6)} lgs=${String(lgs.reviews).padStart(6)} ` +
      `ratio=${fmt(ratio, 4)} recallDelta=${fmt(lgs.firstAttemptRecall - sm2.firstAttemptRecall, 4)} ` +
      `brierDelta=${fmt(lgs.brier - sm2.brier, 4)}`,
  );
  if (ratio > 1.1) gates.push(`${name}: reviews ratio ${fmt(ratio, 4)} > 1.10`);
}

console.log("");
console.log(`[gates] matched>=10%: ${matchedFewer >= 10}; seedCI p: ${ciP.seedsPass10}/30; seedCI Rmem: ${ciR.seedsPass10}/30`);
if (gates.length === 0) {
  console.log("GATES: PASS");
} else {
  console.log("GATES: FAIL");
  for (const gate of gates) console.log(`- ${gate}`);
  process.exit(1);
}
