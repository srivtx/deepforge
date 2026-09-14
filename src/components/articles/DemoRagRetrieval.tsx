"use client";

import { useMemo, useState } from "react";
import { clamp, type DemoProps } from "@/lib/articles-demos";

/* --------------------------------- corpus -------------------------------- */

export interface RagChunk {
  id: string;
  title: string;
  source: string;
  lexical: number[];
  dense: number[];
}

export const RAG_QUERIES = [
  {
    label: "KV memory",
    text: "Why does the KV cache dominate GPU memory at long context?",
  },
  {
    label: "hybrid search",
    text: "How do we combine keyword and vector search results?",
  },
  {
    label: "refusal",
    text: "When should a retrieval system refuse to answer?",
  },
  {
    label: "out of corpus",
    text: "What was the Q3 revenue for the widget division?",
  },
];

export const RAG_CHUNKS: RagChunk[] = [
  {
    id: "c1",
    title: "KV cache stores keys and values per layer",
    source: "inference guide §4",
    lexical: [0.86, 0.22, 0.1, 0.05],
    dense: [0.91, 0.28, 0.12, 0.07],
  },
  {
    id: "c2",
    title: "FlashAttention tiles scores inside SRAM",
    source: "attention notes §7",
    lexical: [0.62, 0.18, 0.08, 0.04],
    dense: [0.74, 0.22, 0.1, 0.05],
  },
  {
    id: "c3",
    title: "GQA shares one KV head across query heads",
    source: "serving handbook §3",
    lexical: [0.71, 0.16, 0.06, 0.03],
    dense: [0.66, 0.2, 0.09, 0.06],
  },
  {
    id: "c4",
    title: "BM25 scores exact term overlap",
    source: "retrieval guide §1",
    lexical: [0.35, 0.83, 0.14, 0.1],
    dense: [0.3, 0.58, 0.18, 0.09],
  },
  {
    id: "c5",
    title: "Dense retrieval embeds meaning into vectors",
    source: "retrieval guide §2",
    lexical: [0.28, 0.55, 0.12, 0.08],
    dense: [0.52, 0.81, 0.2, 0.11],
  },
  {
    id: "c6",
    title: "Reciprocal rank fusion merges ranked lists",
    source: "pipeline notes §5",
    lexical: [0.24, 0.79, 0.1, 0.06],
    dense: [0.34, 0.72, 0.16, 0.08],
  },
  {
    id: "c7",
    title: "A cross-encoder rescoring the top candidates",
    source: "reranking guide §6",
    lexical: [0.3, 0.61, 0.13, 0.05],
    dense: [0.41, 0.69, 0.19, 0.07],
  },
  {
    id: "c8",
    title: "Chunk overlap keeps boundary spans retrievable",
    source: "chunking guide §2",
    lexical: [0.2, 0.34, 0.16, 0.04],
    dense: [0.26, 0.31, 0.22, 0.05],
  },
  {
    id: "c9",
    title: "Citations need span ids in the context pack",
    source: "grounding notes §8",
    lexical: [0.18, 0.26, 0.21, 0.06],
    dense: [0.24, 0.29, 0.3, 0.08],
  },
  {
    id: "c10",
    title: "Refusal is a threshold on the top evidence score",
    source: "grounding notes §9",
    lexical: [0.16, 0.14, 0.77, 0.09],
    dense: [0.22, 0.17, 0.71, 0.1],
  },
];

export type RagMode = "lexical" | "dense" | "hybrid";

/* ---------------------------------- math --------------------------------- */

export function rankIndices(scores: number[]): number[] {
  return scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.index);
}

export function rrfScores(
  lexical: number[],
  dense: number[],
  k: number,
  mode: RagMode,
): number[] {
  const scores = new Array(lexical.length).fill(0) as number[];
  const add = (list: number[]) => {
    rankIndices(list).forEach((index, rank) => {
      scores[index] += 1 / (k + rank + 1);
    });
  };
  if (mode !== "dense") add(lexical);
  if (mode !== "lexical") add(dense);
  return scores;
}

export function rerankScore(lexical: number, dense: number): number {
  return 0.35 * lexical + 0.65 * dense;
}

export function boundaryRecall(overlap: number): number {
  return 70 + 30 * clamp(overlap / 30, 0, 1);
}

export function selectEvidence(
  scores: number[],
  order: number[],
  count: number,
  threshold: number,
): { kept: number[]; refused: boolean } {
  const best = order.length > 0 ? scores[order[0]] : 0;
  if (best < threshold) return { kept: [], refused: true };
  return { kept: order.slice(0, count), refused: false };
}

/* ---------------------------------- ui ----------------------------------- */

function RankList({
  label,
  scores,
  order,
  active,
  note,
}: {
  label: string;
  scores: number[];
  order: number[];
  active: boolean;
  note: string;
}) {
  return (
    <div
      className={
        active
          ? "rounded-lg border border-hairline bg-canvas px-2.5 py-2"
          : "rounded-lg border border-hairline bg-canvas px-2.5 py-2 opacity-40"
      }
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className={active ? "text-[11px] font-medium text-ink" : "text-[11px] font-medium text-body-mid"}>
          {label}
        </span>
        <span className="font-mono text-[9px] text-mute">{active ? note : "off"}</span>
      </div>
      <ol className="mt-1.5 space-y-1">
        {order.slice(0, 5).map((index, rank) => (
          <li key={index} className="flex items-center gap-2">
            <span className="w-4 shrink-0 font-mono text-[9.5px] text-mute">
              {rank + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-[10.5px] text-body">
              {RAG_CHUNKS[index].title}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-ink">
              {scores[index].toFixed(2)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RagRetrievalDemo(_props: DemoProps) {
  const [queryIndex, setQueryIndex] = useState(0);
  const [mode, setMode] = useState<RagMode>("hybrid");
  const [rrfK, setRrfK] = useState(60);
  const [topK, setTopK] = useState(3);
  const [overlap, setOverlap] = useState(0);
  const [threshold, setThreshold] = useState(0.45);

  const query = RAG_QUERIES[queryIndex];

  const result = useMemo(() => {
    const lexical = RAG_CHUNKS.map((chunk) => chunk.lexical[queryIndex]);
    const dense = RAG_CHUNKS.map((chunk) => chunk.dense[queryIndex]);
    const fused = rrfScores(lexical, dense, rrfK, mode);
    const rerank = RAG_CHUNKS.map((chunk) =>
      rerankScore(chunk.lexical[queryIndex], chunk.dense[queryIndex]),
    );
    const fusedOrder = rankIndices(fused);
    const candidates = fusedOrder.slice(0, Math.min(5, fusedOrder.length));
    const finalOrder = [...candidates].sort(
      (a, b) => rerank[b] - rerank[a] || fused[b] - fused[a],
    );
    const evidence = selectEvidence(rerank, finalOrder, topK, threshold);
    return {
      lexical,
      dense,
      fused,
      rerank,
      lexicalOrder: rankIndices(lexical),
      denseOrder: rankIndices(dense),
      fusedOrder,
      finalOrder,
      evidence,
    };
  }, [queryIndex, mode, rrfK, topK, threshold]);

  const bestRerank = result.rerank[result.finalOrder[0]];
  const recall = boundaryRecall(overlap);

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  const status = result.evidence.refused
    ? `Top reranked score ${bestRerank.toFixed(2)} is below the ${threshold.toFixed(2)} evidence threshold: refuse instead of answering from memory. ` +
      `Boundary recall at ${overlap}% overlap is ${recall.toFixed(0)}%.`
    : `Answered from ${result.evidence.kept.length} cited chunk${result.evidence.kept.length === 1 ? "" : "s"}; ` +
      `top reranked score ${bestRerank.toFixed(2)} clears the ${threshold.toFixed(2)} threshold. ` +
      `RRF k = ${rrfK}, mode ${mode}, boundary recall ${recall.toFixed(0)}%.`;

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Retrieve, fuse, rerank, cite — or refuse
        </span>
        <span className="flex flex-wrap gap-1" role="group" aria-label="Retrieval mode">
          {(["lexical", "dense", "hybrid"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={toggleClasses(mode === m)}
            >
              {m === "lexical" ? "BM25" : m === "dense" ? "Dense" : "Hybrid"}
            </button>
          ))}
        </span>
      </figcaption>

      <div className="flex flex-wrap gap-1">
        {RAG_QUERIES.map((entry, index) => (
          <button
            key={entry.label}
            type="button"
            aria-pressed={queryIndex === index}
            onClick={() => setQueryIndex(index)}
            className={toggleClasses(queryIndex === index)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <p className="mt-2 rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-[11px] text-body">
        <span className="text-mute">query: </span>
        {query.text}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
        <RankList
          label="BM25 lexical"
          scores={result.lexical}
          order={result.lexicalOrder}
          active={mode !== "dense"}
          note={`k1=1.2 · b=0.75`}
        />
        <RankList
          label="Dense cosine"
          scores={result.dense}
          order={result.denseOrder}
          active={mode !== "lexical"}
          note="unit vectors"
        />
        <div className="rounded-lg border border-accent/40 bg-accent/5 px-2.5 py-2">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-[11px] font-medium text-accent">
              Fused &rarr; reranked
            </span>
            <span className="font-mono text-[9px] text-mute">
              cut {topK} · t {threshold.toFixed(2)}
            </span>
          </div>
          <ol className="mt-1.5 space-y-1">
            {result.finalOrder.slice(0, 5).map((index, rank) => {
              const kept = result.evidence.kept.includes(index);
              return (
                <li key={index} className="flex items-center gap-2">
                  <span
                    className={
                      kept
                        ? "w-4 shrink-0 font-mono text-[9.5px] text-accent"
                        : "w-4 shrink-0 font-mono text-[9.5px] text-mute"
                    }
                  >
                    {rank + 1}
                  </span>
                  <span
                    className={
                      kept
                        ? "min-w-0 flex-1 truncate text-[10.5px] text-ink"
                        : "min-w-0 flex-1 truncate text-[10.5px] text-body-mid"
                    }
                  >
                    {RAG_CHUNKS[index].title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-ink">
                    {result.rerank[index].toFixed(2)}
                  </span>
                  <span className="w-6 shrink-0 font-mono text-[9px] text-mute">
                    {result.fused[index].toFixed(3)}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-1.5 font-mono text-[8.5px] text-mute">
            cross-encoder: 0.35 &middot; lex + 0.65 &middot; dense
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <label className="flex items-center gap-2 text-xs text-body-mid">
          RRF k
          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={rrfK}
            onChange={(e) => setRrfK(Number(e.target.value))}
            aria-label="Reciprocal rank fusion k"
            aria-valuetext={`k equals ${rrfK}`}
            className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-canvas-soft"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="w-7 font-mono text-[11px] text-ink">{rrfK}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-body-mid">
          Rerank cut
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            aria-label="Rerank cut"
            aria-valuetext={`top ${topK} kept`}
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-canvas-soft"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="w-7 font-mono text-[11px] text-ink">{topK}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-body-mid">
          Overlap
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
            aria-label="Chunk overlap"
            aria-valuetext={`${overlap} percent overlap`}
            className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-canvas-soft"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="w-9 font-mono text-[11px] text-ink">{overlap}%</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-body-mid">
          Threshold
          <input
            type="range"
            min={0.2}
            max={0.8}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            aria-label="Evidence threshold"
            aria-valuetext={`threshold ${threshold.toFixed(2)}`}
            className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-canvas-soft"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="w-9 font-mono text-[11px] text-ink">
            {threshold.toFixed(2)}
          </span>
        </label>
      </div>

      <svg
        role="img"
        aria-label={`Chunk boundary diagram. Two chunks meet at a boundary; a key span straddles it. With ${overlap}% overlap the boundary recall is ${recall.toFixed(0)} percent.`}
        viewBox="0 0 700 74"
        className="mt-4 w-full"
      >
        <text x={4} y={12} className="fill-mute text-[9px] font-mono">
          chunk A
        </text>
        <text x={696} y={12} textAnchor="end" className="fill-mute text-[9px] font-mono">
          chunk B
        </text>
        <rect x={4} y={20} width={346} height={22} rx={4} className="fill-info/15 stroke-info/50" strokeWidth="1.5" />
        <rect
          x={350 - overlap * 2}
          y={20}
          width={346 - (350 - overlap * 2) + 0}
          height={22}
          rx={4}
          className="fill-accent/15 stroke-accent/50"
          strokeWidth="1.5"
        />
        <rect x={320} y={26} width={60} height={10} rx={2} className="fill-warning/70" />
        <text x={350} y={60} textAnchor="middle" className="fill-warning text-[9px] font-mono">
          {overlap >= 30 ? "span preserved by overlap" : "span split across the boundary"}
        </text>
        <text x={4} y={60} className="fill-body-mid text-[9px] font-mono">
          boundary recall {recall.toFixed(0)}%
        </text>
        <text x={696} y={60} textAnchor="end" className="fill-body-mid text-[9px] font-mono">
          overlap {overlap}% ({overlap * 2} px shared)
        </text>
      </svg>

      <div className="mt-3 rounded-lg border border-hairline bg-canvas px-3 py-2.5">
        <span className="text-[10px] uppercase tracking-wide text-mute">
          context pack
        </span>
        {result.evidence.refused ? (
          <p className="mt-1 text-xs leading-relaxed text-error">
            No evidence above the threshold. The system refuses: &ldquo;I
            don&rsquo;t have a grounded source for that in this corpus.&rdquo;
          </p>
        ) : (
          <>
            <ol className="mt-1 space-y-1">
              {result.evidence.kept.map((index, rank) => (
                <li key={index} className="flex items-baseline gap-2 text-xs">
                  <span className="font-mono text-[10px] text-accent">
                    [{rank + 1}]
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body">
                    {RAG_CHUNKS[index].title}
                  </span>
                  <span className="shrink-0 font-mono text-[9.5px] text-mute">
                    {RAG_CHUNKS[index].source}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              Answer grounded in{" "}
              {result.evidence.kept
                .map((_, rank) => `[${rank + 1}]`)
                .join(", ")}
              . Every claim points at the passage that supports it.
            </p>
          </>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {status}
      </p>
    </figure>
  );
}
