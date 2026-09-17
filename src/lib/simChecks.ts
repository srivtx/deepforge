/**
 * "Check your intuition" quizzes for the interactive sims.
 *
 * Every question and its answer are deterministic, pure functions of the
 * sim's own fixture parameters: the Dijkstra questions finalize and relax
 * nodes with the same loop as DijkstraStep.tsx, the optimizer questions step
 * the same update rules as OptimizerRace.tsx, and the network questions
 * train the same seeded 2 -> h -> 1 net as NeuralNetTrainer.tsx. No
 * randomness, no dates, no DOM.
 *
 * The sims keep their pure helpers module-private, so the exact algorithms
 * are mirrored here (same constants, same tie-breaks, same order of
 * operations). If a sim's math changes, the pinned answers in
 * tests/simChecks.test.ts flag the drift.
 */

/* ─────────────────────────────── shared shape ─────────────────────────────── */

export interface SimCheckQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explain: string;
}

/** True when `choiceIndex` is the question's correct choice. */
export function checkAnswer(question: SimCheckQuestion, choiceIndex: number): boolean {
  return choiceIndex === question.answerIndex;
}

/** Dedupe distractors, sort deterministically (numeric or lexicographic). */
function assembleChoices(
  answer: string,
  distractors: string[],
): { choices: string[]; answerIndex: number } {
  const pool = [answer];
  for (const d of distractors) {
    if (d !== answer && !pool.includes(d)) pool.push(d);
  }
  const allNumeric = pool.every((v) => Number.isFinite(Number(v)));
  pool.sort((a, b) =>
    allNumeric ? Number(a) - Number(b) : a < b ? -1 : a > b ? 1 : 0,
  );
  return { choices: pool, answerIndex: pool.indexOf(answer) };
}

/* ──────────────────────────── Dijkstra step-through ───────────────────────── */

const DJ_NODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const DJ_START = 0;

/** Same undirected weighted edges as DijkstraStep.tsx. */
const DJ_EDGES: [number, number, number][] = [
  [0, 1, 4], [0, 2, 2], [1, 2, 5], [1, 3, 10], [1, 4, 8], [2, 4, 6],
  [2, 5, 2], [3, 4, 3], [3, 6, 7], [4, 6, 4], [4, 5, 5], [5, 7, 6],
  [6, 7, 2], [6, 8, 9], [7, 8, 3], [7, 9, 8], [8, 9, 5],
];

/**
 * The sim's step loop in one pass: finalize the unvisited node with the
 * smallest tentative distance (scanning by index, so ties break low), then
 * relax every incident edge. Returns finalization order and final distances.
 */
function dijkstraFrom(start: number): { order: number[]; dist: number[] } {
  const n = DJ_NODES.length;
  const dist = new Array<number>(n).fill(Number.POSITIVE_INFINITY);
  const visited = new Array<boolean>(n).fill(false);
  const order: number[] = [];
  dist[start] = 0;
  for (;;) {
    let u = -1;
    let best = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < best) {
        best = dist[i];
        u = i;
      }
    }
    if (u === -1) break;
    visited[u] = true;
    order.push(u);
    for (const [a, b, w] of DJ_EDGES) {
      const v = a === u ? b : b === u ? a : -1;
      if (v === -1 || visited[v]) continue;
      const alt = dist[u] + w;
      if (alt < dist[v]) dist[v] = alt;
    }
  }
  return { order, dist };
}

export function dijkstraQuestions(): SimCheckQuestion[] {
  const { order, dist } = dijkstraFrom(DJ_START);
  const name = (i: number): string => DJ_NODES[i];
  const d = (i: number): string => String(dist[i]);

  const first = order[1];
  const second = order[2];
  const third = order[3];
  const last = order[order.length - 1];
  const secondLast = order[order.length - 2];
  const thirdLast = order[order.length - 3];
  const g = DJ_NODES.indexOf("G");
  const h = DJ_NODES.indexOf("H");
  const dNode = DJ_NODES.indexOf("D");
  const iNode = DJ_NODES.indexOf("I");

  return [
    {
      id: "dj-next-after-start",
      prompt: `After ${name(DJ_START)} is finalized, which node is finalized next?`,
      ...assembleChoices(name(first), [name(second), name(third)]),
      explain:
        `${name(first)} sits at distance ${d(first)} as soon as ${name(DJ_START)}'s edges are relaxed, ` +
        `ahead of ${name(second)} (${d(second)}).`,
    },
    {
      id: "dj-third-finalized",
      prompt: `Which node is the third to be finalized (after ${name(DJ_START)} and ${name(first)})?`,
      ...assembleChoices(name(second), [name(third), name(order[4])]),
      explain:
        `After ${name(DJ_START)} (0) and ${name(first)} (${d(first)}), ${name(second)} is next at ${d(second)}. ` +
        `${name(third)} ties on distance ${d(third)}, and the scan always takes the lower node index first.`,
    },
    {
      id: "dj-distance-g",
      prompt: `When the run finishes, what is the shortest distance from ${name(DJ_START)} to G?`,
      ...assembleChoices(d(g), [d(h), d(dNode), d(iNode)]),
      explain:
        `The winning route is ${name(DJ_START)}\u2192C\u2192E\u2192G for 2+6+4 = 12. ` +
        `The tempting ${name(DJ_START)}\u2192B\u2192D\u2192G costs 4+10+7 = 21.`,
    },
    {
      id: "dj-distance-d",
      prompt: `When the run finishes, what is the shortest distance from ${name(DJ_START)} to D?`,
      ...assembleChoices(d(dNode), [d(h), d(g), d(iNode)]),
      explain:
        `D is reached through E for 2+6+3 = 11, not through B, which would already cost 14. ` +
        "That is why D is finalized before G even though G looks farther right on the drawing.",
    },
    {
      id: "dj-last-finalized",
      prompt: "Which node is finalized last?",
      ...assembleChoices(name(last), [name(secondLast), name(thirdLast)]),
      explain:
        `${name(last)} is the far corner: its best routes cost 18 either way ` +
        `(${name(DJ_START)}\u2192C\u2192F\u2192H\u2192J or through I), so it waits for every other node to settle.`,
    },
  ];
}

/* ─────────────────────────────── optimizer race ───────────────────────────── */

type OptId = "sgd" | "momentum" | "nesterov" | "adagrad" | "rmsprop" | "adam";

const OPT_NAMES: Record<OptId, string> = {
  sgd: "SGD",
  momentum: "Momentum",
  nesterov: "Nesterov",
  adagrad: "AdaGrad",
  rmsprop: "RMSProp",
  adam: "Adam",
};

/** Mirrors OptimizerRace.tsx constants. */
const OPT_START = { x: -9, y: 1.8 };
const OPT_MAX_STEPS = 1500;
const OPT_CONVERGE_LOSS = 2e-4;
const OPT_EPS = 1e-8;

interface OptState {
  x: number; y: number; vx: number; vy: number; sx: number; sy: number;
  steps: number; done: boolean; diverged: boolean;
}

const optLoss = (x: number, y: number): number => (x * x) / 20 + y * y;

function optStep(id: OptId, o: OptState, lr: number): OptState {
  const gx = o.x / 10;
  const gy = 2 * o.y;
  const t = o.steps + 1;
  let { x, y, vx, vy, sx, sy } = o;

  if (id === "sgd") {
    x -= lr * gx;
    y -= lr * gy;
  } else if (id === "momentum") {
    vx = 0.9 * vx + gx; vy = 0.9 * vy + gy;
    x -= lr * vx; y -= lr * vy;
  } else if (id === "nesterov") {
    vx = 0.9 * o.vx + (o.x - lr * 0.9 * o.vx) / 10;
    vy = 0.9 * o.vy + 2 * (o.y - lr * 0.9 * o.vy);
    x -= lr * vx; y -= lr * vy;
  } else if (id === "adagrad") {
    sx += gx * gx; sy += gy * gy;
    x -= (lr * gx) / (Math.sqrt(sx) + OPT_EPS);
    y -= (lr * gy) / (Math.sqrt(sy) + OPT_EPS);
  } else if (id === "rmsprop") {
    sx = 0.9 * sx + 0.1 * gx * gx; sy = 0.9 * sy + 0.1 * gy * gy;
    x -= (lr * gx) / (Math.sqrt(sx) + OPT_EPS);
    y -= (lr * gy) / (Math.sqrt(sy) + OPT_EPS);
  } else {
    const c1 = 1 - Math.pow(0.9, t);
    const c2 = 1 - Math.pow(0.999, t);
    vx = 0.9 * vx + 0.1 * gx; vy = 0.9 * vy + 0.1 * gy;
    sx = 0.999 * sx + 0.001 * gx * gx; sy = 0.999 * sy + 0.001 * gy * gy;
    x -= (lr * (vx / c1)) / (Math.sqrt(sx / c2) + OPT_EPS);
    y -= (lr * (vy / c1)) / (Math.sqrt(sy / c2) + OPT_EPS);
  }

  const diverged =
    !Number.isFinite(x) || !Number.isFinite(y) ||
    Math.abs(x) > 1e5 || Math.abs(y) > 1e5;
  return {
    x, y, vx, vy, sx, sy, steps: t, diverged,
    done: diverged || t >= OPT_MAX_STEPS || optLoss(x, y) < OPT_CONVERGE_LOSS,
  };
}

function freshOpt(): OptState {
  return {
    ...OPT_START, vx: 0, vy: 0, sx: 0, sy: 0, steps: 0, done: false, diverged: false,
  };
}

function optSimulate(id: OptId, lr: number, steps: number): OptState {
  let s = freshOpt();
  for (let k = 0; k < steps && !s.done; k++) s = optStep(id, s, lr);
  return s;
}

/** Steps until loss < threshold (the sim's stop rule), null if it never gets there. */
function optConvergeSteps(id: OptId, lr: number): number | null {
  let s = freshOpt();
  for (let k = 0; k < OPT_MAX_STEPS; k++) {
    s = optStep(id, s, lr);
    if (s.diverged) return null;
    if (optLoss(s.x, s.y) < OPT_CONVERGE_LOSS) return s.steps;
  }
  return null;
}

const optFormat = (v: number): string =>
  !Number.isFinite(v) ? "\u2014" : v < 0.001 ? v.toExponential(1) : v.toFixed(4);

const optStepsLabel = (steps: number | null): string =>
  steps === null ? `more than ${OPT_MAX_STEPS} steps` : `${steps} steps`;

export function optimizerQuestions(lr = 0.08): SimCheckQuestion[] {
  const lossAfter = (id: OptId, steps: number): number => {
    const s = optSimulate(id, lr, steps);
    return optLoss(s.x, s.y);
  };

  const lossPair = (
    id: string,
    steps: number,
    a: OptId,
    b: OptId,
    mechanism: string,
  ): SimCheckQuestion => {
    const aLoss = lossAfter(a, steps);
    const bLoss = lossAfter(b, steps);
    const winner: OptId = aLoss <= bLoss ? a : b;
    const loser: OptId = winner === a ? b : a;
    const wLoss = winner === a ? aLoss : bLoss;
    const lLoss = winner === a ? bLoss : aLoss;
    return {
      id,
      prompt: `At lr ${lr.toFixed(2)}, after ${steps} steps, which optimizer has the lower loss?`,
      ...assembleChoices(OPT_NAMES[winner], [OPT_NAMES[loser]]),
      explain:
        `${OPT_NAMES[winner]} is at ${optFormat(wLoss)} versus ${OPT_NAMES[loser]}'s ${optFormat(lLoss)}. ` +
        mechanism,
    };
  };

  const convergePair = (
    id: string,
    a: OptId,
    b: OptId,
    mechanism: string,
  ): SimCheckQuestion => {
    const aSteps = optConvergeSteps(a, lr);
    const bSteps = optConvergeSteps(b, lr);
    const winner: OptId =
      (aSteps ?? Number.POSITIVE_INFINITY) <= (bSteps ?? Number.POSITIVE_INFINITY) ? a : b;
    const loser: OptId = winner === a ? b : a;
    const wSteps = winner === a ? aSteps : bSteps;
    const lSteps = winner === a ? bSteps : aSteps;
    return {
      id,
      prompt:
        `At lr ${lr.toFixed(2)}, which optimizer pushes the loss below ` +
        `${optFormat(OPT_CONVERGE_LOSS)} in fewer steps: ${OPT_NAMES[a]} or ${OPT_NAMES[b]}?`,
      ...assembleChoices(OPT_NAMES[winner], [OPT_NAMES[loser]]),
      explain:
        `${OPT_NAMES[winner]} needs ${optStepsLabel(wSteps)}; ` +
        `${OPT_NAMES[loser]} needs ${optStepsLabel(lSteps)}. ` +
        mechanism,
    };
  };

  const threeWay: OptId[] = ["nesterov", "momentum", "rmsprop", "sgd"];
  const losses50 = threeWay.map((id) => ({ id, loss: lossAfter(id, 50) }));
  const lowest = losses50.reduce((best, cur) => (cur.loss < best.loss ? cur : best));
  const rest = losses50.filter((entry) => entry.id !== lowest.id);
  const spread = losses50
    .map((entry) => `${OPT_NAMES[entry.id]} ${optFormat(entry.loss)}`)
    .join(", ");

  return [
    lossPair(
      "opt-momentum-vs-sgd-20",
      20,
      "momentum",
      "sgd",
      "Momentum's velocity accumulates the strong y gradient (2y), so it sprints down the valley while a raw gradient step crawls.",
    ),
    lossPair(
      "opt-adagrad-vs-rmsprop-200",
      200,
      "adagrad",
      "rmsprop",
      "AdaGrad keeps accumulating squared gradients, so its effective step size shrinks toward zero and it stalls, while RMSProp's decayed average lets it recover.",
    ),
    convergePair(
      "opt-converge-sgd-vs-adam",
      "sgd",
      "adam",
      "Adam's per-parameter moment estimates move faster in the flat x direction without overshooting y.",
    ),
    convergePair(
      "opt-converge-momentum-vs-nesterov",
      "momentum",
      "nesterov",
      "The two are close, but the lookahead gradient trims the overshoot in y at every update.",
    ),
    {
      id: "opt-lowest-after-50",
      prompt: `At lr ${lr.toFixed(2)}, after 50 steps, which of these four has the lowest loss?`,
      ...assembleChoices(OPT_NAMES[lowest.id], rest.map((entry) => OPT_NAMES[entry.id])),
      explain:
        `At step 50 the losses are ${spread} \u2014 the accelerated ` +
        "velocity methods stay ahead of raw SGD on this elongated valley.",
    },
  ];
}

/* ───────────────────────────── neural net trainer ─────────────────────────── */

const NET_SEED = 1337;

interface NetPt { x: number; y: number; label: 0 | 1 }

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function xorPoints(): NetPt[] {
  const rand = mulberry32(7);
  const quads: [number, number, 0 | 1][] = [
    [-0.55, -0.55, 0], [-0.55, 0.55, 1], [0.55, -0.55, 1], [0.55, 0.55, 0],
  ];
  const pts: NetPt[] = [];
  for (const [qx, qy, label] of quads)
    for (let i = 0; i < 10; i++)
      pts.push({ x: qx + (rand() * 2 - 1) * 0.18, y: qy + (rand() * 2 - 1) * 0.18, label });
  return pts;
}

function circlePoints(): NetPt[] {
  const rand = mulberry32(21);
  const pts: NetPt[] = [];
  const ring = (n: number, r0: number, r1: number, label: 0 | 1) => {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = r0 + rand() * (r1 - r0);
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, label });
    }
  };
  ring(30, 0.22, 0.42, 0);
  ring(30, 0.68, 0.93, 1);
  return pts;
}

function moonPoints(): NetPt[] {
  const rand = mulberry32(99);
  const pts: NetPt[] = [];
  const moon = (fx: (t: number) => number, fy: (t: number) => number, label: 0 | 1) => {
    for (let i = 0; i < 30; i++) {
      const t = (i / 29) * Math.PI;
      pts.push({ x: fx(t) + (rand() * 2 - 1) * 0.07, y: fy(t) + (rand() * 2 - 1) * 0.07, label });
    }
  };
  moon((t) => Math.cos(t) * 0.6 - 0.3, (t) => Math.sin(t) * 0.6 - 0.15, 0);
  moon((t) => (1 - Math.cos(t)) * 0.6 - 0.3, (t) => (0.5 - Math.sin(t)) * 0.6 - 0.15, 1);
  return pts;
}

type DatasetId = "xor" | "circles" | "moons";

const NET_DATASETS: Record<DatasetId, { name: string; points: NetPt[] }> = {
  xor: { name: "XOR quadrants", points: xorPoints() },
  circles: { name: "Two circles", points: circlePoints() },
  moons: { name: "Two moons", points: moonPoints() },
};

interface Net { h: number; w1: Float64Array; b1: Float64Array; w2: Float64Array; b2: number }

function makeNet(h: number, seed: number): Net {
  const rand = mulberry32(seed);
  const vec = (n: number, s: number) =>
    Float64Array.from({ length: n }, () => (rand() * 2 - 1) * s);
  return { h, w1: vec(h * 2, 1.5), b1: vec(h, 0.5), w2: vec(h, 1.5), b2: (rand() * 2 - 1) * 0.5 };
}

const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));

function forward(net: Net, x: number, y: number): [Float64Array, number] {
  const hs = new Float64Array(net.h);
  let z = net.b2;
  for (let j = 0; j < net.h; j++) {
    const h = sigmoid(net.w1[2 * j] * x + net.w1[2 * j + 1] * y + net.b1[j]);
    hs[j] = h;
    z += net.w2[j] * h;
  }
  return [hs, sigmoid(z)];
}

function logLoss(out: number, label: 0 | 1): number {
  const c = Math.min(1 - 1e-7, Math.max(1e-7, out));
  return -(label * Math.log(c) + (1 - label) * Math.log(1 - c));
}

function evaluate(net: Net, pts: NetPt[]): { loss: number; acc: number } {
  let loss = 0, ok = 0;
  for (const p of pts) {
    const out = forward(net, p.x, p.y)[1];
    loss += logLoss(out, p.label);
    if ((out >= 0.5 ? 1 : 0) === p.label) ok += 1;
  }
  return { loss: loss / pts.length, acc: ok / pts.length };
}

function trainEpoch(net: Net, pts: NetPt[], lr: number): number {
  let total = 0;
  const dh = new Float64Array(net.h);
  for (const p of pts) {
    const [hs, out] = forward(net, p.x, p.y);
    total += logLoss(out, p.label);
    const delta = out - p.label;
    for (let j = 0; j < net.h; j++) dh[j] = delta * net.w2[j] * hs[j] * (1 - hs[j]);
    for (let j = 0; j < net.h; j++) {
      net.w2[j] -= lr * delta * hs[j];
      net.w1[2 * j] -= lr * dh[j] * p.x;
      net.w1[2 * j + 1] -= lr * dh[j] * p.y;
      net.b1[j] -= lr * dh[j];
    }
    net.b2 -= lr * delta;
  }
  return total / pts.length;
}

/** Fresh seeded net trained for `epochs` full-batch steps, as pressing Step would. */
function trainedNet(
  datasetId: DatasetId,
  hidden: number,
  lr: number,
  epochs: number,
): { acc: number; loss: number } {
  const net = makeNet(hidden, NET_SEED);
  const pts = NET_DATASETS[datasetId].points;
  for (let e = 0; e < epochs; e++) trainEpoch(net, pts, lr);
  const stats = evaluate(net, pts);
  return { acc: stats.acc, loss: stats.loss };
}

const FIT_ACCURACY = 0.95;
const NN_LR = 0.5;
const NN_EPOCHS = 200;

const percent = (v: number): string => `${Math.round(v * 100)}%`;

export function neuralNetQuestions(): SimCheckQuestion[] {
  const hidden = 8;
  const xor8 = trainedNet("xor", hidden, NN_LR, NN_EPOCHS);
  const xor2 = trainedNet("xor", 2, NN_LR, NN_EPOCHS);
  const circles2 = trainedNet("circles", 2, NN_LR, NN_EPOCHS);
  const xor8Fits = xor8.acc >= FIT_ACCURACY;
  const xor2Fits = xor2.acc >= FIT_ACCURACY;
  const circles2Fits = circles2.acc >= FIT_ACCURACY;

  const params = hidden * 3 + 1;
  const pointCounts = (Object.keys(NET_DATASETS) as DatasetId[]).map((id) => ({
    id,
    name: NET_DATASETS[id].name,
    count: NET_DATASETS[id].points.length,
  }));
  const fewest = pointCounts.reduce((best, d) => (d.count < best.count ? d : best), pointCounts[0]);
  const others = pointCounts.filter((d) => d.id !== fewest.id).map((d) => d.name);

  return [
    {
      id: "nn-xor-8-hidden",
      prompt:
        `With ${hidden} hidden units at lr ${NN_LR.toFixed(2)}, does the XOR net reach ` +
        `${percent(FIT_ACCURACY)} train accuracy within ${NN_EPOCHS} epochs?`,
      ...assembleChoices(xor8Fits ? "Yes" : "No", [xor8Fits ? "No" : "Yes"]),
      explain:
        `It finishes at ${percent(xor8.acc)} accuracy (loss ${xor8.loss.toFixed(4)}). ` +
        `${hidden} hidden units can bend the boundary into the XOR diagonals that one linear layer cannot express.`,
    },
    {
      id: "nn-xor-2-hidden",
      prompt:
        `With 2 hidden units at lr ${NN_LR.toFixed(2)}, does the XOR net reach ` +
        `${percent(FIT_ACCURACY)} train accuracy within ${NN_EPOCHS} epochs?`,
      ...assembleChoices(xor2Fits ? "Yes" : "No", [xor2Fits ? "No" : "Yes"]),
      explain:
        `This run stalls at ${percent(xor2.acc)} accuracy (loss ${xor2.loss.toFixed(4)}). ` +
        "Two hidden units give too little capacity to carve both XOR diagonals from this initialization.",
    },
    {
      id: "nn-circles-2-hidden",
      prompt:
        `With 2 hidden units at lr ${NN_LR.toFixed(2)}, does the two-circles net reach ` +
        `${percent(FIT_ACCURACY)} train accuracy within ${NN_EPOCHS} epochs?`,
      ...assembleChoices(circles2Fits ? "Yes" : "No", [circles2Fits ? "No" : "Yes"]),
      explain:
        `It stays at ${percent(circles2.acc)} accuracy (loss ${circles2.loss.toFixed(4)}). ` +
        "Enclosing a ring needs more than two sigmoid ridges; this net can only split the plane roughly in half.",
    },
    {
      id: "nn-parameter-count",
      prompt: `How many trainable weights and biases does the 2 \u2192 ${hidden} \u2192 1 network have?`,
      ...assembleChoices(String(params), ["7", "10", "49"]),
      explain:
        `Each hidden unit carries 2 input weights, 1 bias, and 1 output weight (4 per unit), ` +
        `plus the output bias: 3h + 1 = ${params}.`,
    },
    {
      id: "nn-fewest-points",
      prompt: "Which dataset has the fewest points to fit?",
      ...assembleChoices(fewest.name, others),
      explain:
        `${fewest.name} has ${fewest.count} points (4 quadrants \u00D7 10), while ` +
        `${others.join(" and ")} each have 60 \u2014 so the XOR net is also the easiest to memorize.`,
    },
  ];
}
