"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/articles-demos";
import { checkAnswer, dijkstraQuestions } from "@/lib/simChecks";

const QUIZ = dijkstraQuestions();

interface GNode {
  name: string; x: number; y: number;
}

interface GEdge {
  a: number; b: number; w: number;
}

const NODES: GNode[] = [
  { name: "A", x: 70, y: 195 },
  { name: "B", x: 175, y: 75 },
  { name: "C", x: 155, y: 320 },
  { name: "D", x: 310, y: 55 },
  { name: "E", x: 320, y: 195 },
  { name: "F", x: 300, y: 335 },
  { name: "G", x: 470, y: 105 },
  { name: "H", x: 480, y: 285 },
  { name: "I", x: 580, y: 185 },
  { name: "J", x: 555, y: 340 },
];

const EDGES: GEdge[] = [
  { a: 0, b: 1, w: 4 }, { a: 0, b: 2, w: 2 }, { a: 1, b: 2, w: 5 },
  { a: 1, b: 3, w: 10 }, { a: 1, b: 4, w: 8 }, { a: 2, b: 4, w: 6 },
  { a: 2, b: 5, w: 2 }, { a: 3, b: 4, w: 3 }, { a: 3, b: 6, w: 7 },
  { a: 4, b: 6, w: 4 }, { a: 4, b: 5, w: 5 }, { a: 5, b: 7, w: 6 },
  { a: 6, b: 7, w: 2 }, { a: 6, b: 8, w: 9 }, { a: 7, b: 8, w: 3 },
  { a: 7, b: 9, w: 8 }, { a: 8, b: 9, w: 5 },
];

const N = NODES.length;
const INF = Number.POSITIVE_INFINITY;
const ADJ: number[][] = NODES.map(() => []);
EDGES.forEach((e, i) => {
  ADJ[e.a].push(i);
  ADJ[e.b].push(i);
});

interface SimState {
  dist: number[]; parent: number[]; via: number[]; visited: boolean[];
  current: number; relaxedEdge: number; status: string;
  done: boolean; stepCount: number;
}

function initState(start: number): SimState {
  const dist = new Array<number>(N).fill(INF);
  dist[start] = 0;
  return {
    dist,
    parent: new Array<number>(N).fill(-1),
    via: new Array<number>(N).fill(-1),
    visited: new Array<boolean>(N).fill(false),
    current: -1,
    relaxedEdge: -1,
    status:
      `Start at ${NODES[start].name}. Only the start has distance 0 \u2014 ` +
      "press Step to finalize it and relax its edges.",
    done: false,
    stepCount: 0,
  };
}

const fmt = (d: number): string => (d === INF ? "\u221E" : String(d));

function step(prev: SimState): SimState {
  if (prev.done) return prev;
  let u = -1;
  let best = INF;
  for (let i = 0; i < N; i++) {
    if (!prev.visited[i] && prev.dist[i] < best) {
      best = prev.dist[i];
      u = i;
    }
  }
  if (u === -1) {
    return {
      ...prev,
      done: true,
      status: "Every reachable node is finalized. The shortest-path tree is complete.",
    };
  }

  const dist = prev.dist.slice();
  const parent = prev.parent.slice();
  const via = prev.via.slice();
  const visited = prev.visited.slice();
  visited[u] = true;
  const msgs: string[] = [];
  let relaxed = -1;

  for (const ei of ADJ[u]) {
    const e = EDGES[ei];
    const v = e.a === u ? e.b : e.a;
    if (visited[v]) continue;
    const alt = dist[u] + e.w;
    if (alt < dist[v]) {
      dist[v] = alt;
      parent[v] = u;
      via[v] = ei;
      relaxed = ei;
      msgs.push(`${NODES[u].name}\u2192${NODES[v].name}, new distance ${alt}`);
    }
  }

  const allDone = visited.every(Boolean);
  const status =
    `Visited ${NODES[u].name} (distance ${fmt(prev.dist[u])}). ` +
    (msgs.length ? `Relaxed ${msgs.join("; ")}.` : "No shorter routes found.") +
    (allDone ? " All nodes finalized." : "");

  return {
    dist,
    parent,
    via,
    visited,
    current: u,
    relaxedEdge: relaxed,
    status,
    done: allDone,
    stepCount: prev.stepCount + 1,
  };
}

function nodeState(sim: SimState, i: number): string {
  if (sim.visited[i]) return sim.current === i ? "Current" : "Finalized";
  return Number.isFinite(sim.dist[i]) ? "Frontier" : "Unreached";
}

export function DijkstraStep({ active = true }: { active?: boolean }) {
  const [start, setStart] = useState(0);
  const [sim, setSim] = useState<SimState>(() => initState(0));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizPick, setQuizPick] = useState<number | null>(null);
  const question = QUIZ[quizIndex];
  const intervalMs = Math.round(1100 / speed);
  const playing = running && !sim.done;

  useEffect(() => {
    if (!playing || !active) return;
    const id = window.setTimeout(() => setSim((prev) => step(prev)), intervalMs);
    return () => window.clearTimeout(id);
  }, [playing, active, sim, intervalMs]);

  const finishNow = () => {
    setRunning(false);
    setSim((prev) => {
      let s = prev;
      for (let i = 0; i < N + 1 && !s.done; i++) s = step(s);
      return s;
    });
  };

  const reset = (s: number) => {
    setRunning(false);
    setSim(initState(s));
  };

  const visitedCount = sim.visited.filter(Boolean).length;
  const frontierCount = NODES.filter(
    (_, i) => !sim.visited[i] && Number.isFinite(sim.dist[i]),
  ).length;
  const ariaLabel =
    `Dijkstra shortest-path graph on ${N} nodes. Start node ${NODES[start].name}. ` +
    `${visitedCount} of ${N} nodes finalized, ${frontierCount} in the frontier. ` +
    `Distances: ${NODES.map((n, i) => `${n.name} ${fmt(sim.dist[i])}`).join(", ")}.`;

  const cell = "px-2.5 py-1.5 sm:px-3";
  const secondary =
    "min-h-11 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-1 text-sm font-semibold text-ink">
        Dijkstra Step-Through
      </figcaption>
      <p className="mb-3 text-xs leading-relaxed text-body-mid">
        A fixed weighted graph, ten nodes. Each step finalizes the closest
        frontier node and relaxes its edges. Watch the ringed frontier nodes
        compete and the accent shortest-path tree settle in.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <svg
            role="img"
            aria-label={ariaLabel}
            viewBox="0 0 640 380"
            className="h-auto w-full rounded-lg border border-hairline bg-canvas"
          >
            {EDGES.map((e, i) => {
              const a = NODES[e.a];
              const b = NODES[e.b];
              const inTree = sim.via.includes(i);
              const isRelaxed = sim.relaxedEdge === i;
              const color = inTree
                ? "var(--accent)"
                : isRelaxed
                  ? "var(--warning)"
                  : "var(--hairline)";
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color}
                    strokeWidth={inTree || isRelaxed ? 3 : 1.75}
                    strokeLinecap="round" />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5}
                    textAnchor="middle" fontSize="11" className="font-mono"
                    fill={color} stroke="var(--canvas)" strokeWidth="3"
                    paintOrder="stroke">
                    {e.w}
                  </text>
                </g>
              );
            })}

            {NODES.map((n, i) => {
              const visited = sim.visited[i];
              const frontier = !visited && Number.isFinite(sim.dist[i]);
              return (
                <g key={n.name}>
                  {sim.current === i && (
                    <circle cx={n.x} cy={n.y} r={22} fill="none"
                      stroke="var(--warning)" strokeWidth="2"
                      strokeDasharray="4 3" />
                  )}
                  <circle cx={n.x} cy={n.y} r={16}
                    fill={visited ? "var(--accent)" : frontier ? "var(--canvas-soft)" : "var(--canvas)"}
                    stroke={visited || frontier ? "var(--accent)" : "var(--hairline)"}
                    strokeWidth={frontier ? 2 : 1.5} />
                  <text x={n.x} y={n.y + 4.5} textAnchor="middle" fontSize="13"
                    fontWeight="600" className="font-mono"
                    fill={visited ? "var(--canvas)" : "var(--ink)"}>
                    {n.name}
                  </text>
                  <text x={n.x} y={n.y + 34} textAnchor="middle" fontSize="10"
                    className="font-mono"
                    fill={frontier ? "var(--accent)" : "var(--body-mid)"}>
                    d={fmt(sim.dist[i])}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-body-mid">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-accent" aria-hidden />
              finalized
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-accent" aria-hidden />
              frontier
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-dashed border-warning" aria-hidden />
              current
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-accent" aria-hidden />
              tree edge
            </span>
          </div>
        </div>

        <div className="df-scroll max-h-[420px] overflow-auto rounded-lg border border-hairline">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              Dijkstra distances, parents, and states for every node
            </caption>
            <thead className="sticky top-0 bg-canvas-card">
              <tr className="border-b border-hairline text-[10px] uppercase tracking-wide text-mute">
                <th className="px-2.5 py-2 font-medium sm:px-3">Node</th>
                <th className="px-2.5 py-2 font-medium sm:px-3">Distance</th>
                <th className="px-2.5 py-2 font-medium sm:px-3">Parent</th>
                <th className="px-2.5 py-2 font-medium sm:px-3">State</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {NODES.map((n, i) => {
                const state = nodeState(sim, i);
                return (
                  <tr key={n.name} className="border-b border-hairline last:border-b-0">
                    <td className={`${cell} text-ink`}>{n.name}</td>
                    <td className={`${cell} ${state === "Unreached" ? "text-mute" : "text-body"}`}>
                      {fmt(sim.dist[i])}
                    </td>
                    <td className={`${cell} text-body`}>
                      {sim.parent[i] >= 0 ? NODES[sim.parent[i]].name : "\u2014"}
                    </td>
                    <td className={`${cell} text-body-mid`}>{state}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (playing) setRunning(false);
            else if (sim.done) return;
            else if (prefersReducedMotion()) finishNow();
            else setRunning(true);
          }}
          disabled={sim.done}
          className="min-h-11 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:min-h-0"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => setSim((prev) => step(prev))}
          disabled={sim.done}
          className={secondary}
        >
          Step
        </button>
        <button type="button" onClick={() => reset(start)} className={secondary}>
          Reset
        </button>

        <label htmlFor="dj-start" className="ml-2 text-xs text-body-mid">
          Start
        </label>
        <select
          id="dj-start"
          value={start}
          onChange={(e) => {
            const s = Number(e.target.value);
            setStart(s);
            reset(s);
          }}
          className="min-h-11 rounded-lg border border-hairline bg-canvas px-2 py-1 text-xs text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
        >
          {NODES.map((n, i) => (
            <option key={n.name} value={i}>
              {n.name}
            </option>
          ))}
        </select>

        <label htmlFor="dj-speed" className="ml-2 shrink-0 text-xs text-body-mid">
          Speed
        </label>
        <input
          id="dj-speed"
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Playback speed"
          aria-valuetext={`${speed.toFixed(1)} times`}
          className="box-content h-1.5 w-full min-w-0 max-w-[120px] cursor-pointer appearance-none rounded-full bg-canvas-soft bg-clip-content py-[19px] sm:py-0"
          style={{ accentColor: "var(--accent)" }}
        />
        <span className="w-8 shrink-0 font-mono text-xs text-ink">
          {speed.toFixed(1)}x
        </span>

        <span className="ml-auto font-mono text-[11px] text-body-mid">
          {visitedCount}/{N} finalized · step {sim.stepCount}
        </span>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {sim.status}
      </p>

      <div className="mt-4 border-t border-hairline pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold text-ink">Check your intuition</p>
          <span className="font-mono text-[10px] text-mute">
            {quizIndex + 1} / {QUIZ.length}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-body">{question.prompt}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {question.choices.map((choice, i) => {
            const answered = quizPick !== null;
            const tone = !answered
              ? "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink"
              : i === question.answerIndex
                ? "border-accent text-accent"
                : quizPick === i
                  ? "border-error text-error"
                  : "border-hairline text-mute";
            return (
              <button
                key={choice}
                type="button"
                disabled={answered}
                onClick={() => setQuizPick(i)}
                className={`min-h-11 rounded-lg border px-3 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-default sm:min-h-0 ${tone}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
        <div role="status" aria-live="polite" className="mt-2 text-xs leading-relaxed">
          {quizPick === null ? (
            <span className="text-mute">Pick an answer to see why.</span>
          ) : (
            <span className={checkAnswer(question, quizPick) ? "text-accent" : "text-error"}>
              {checkAnswer(question, quizPick) ? "Correct. " : "Not quite. "}
              <span className="text-body-mid">{question.explain}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setQuizIndex((quizIndex + 1) % QUIZ.length);
            setQuizPick(null);
          }}
          className="mt-2 min-h-11 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
        >
          Next question
        </button>
      </div>
    </figure>
  );
}
