function Stage({
  x,
  y,
  width,
  title,
  sub,
  accent,
  danger,
}: {
  x: number;
  y: number;
  width: number;
  title: string;
  sub: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const fill = accent
    ? "fill-accent/5 stroke-accent/40"
    : danger
      ? "fill-error/5 stroke-error/40"
      : "fill-canvas stroke-hairline";
  const titleClass = accent
    ? "fill-accent text-[12px] font-medium"
    : danger
      ? "fill-error text-[12px] font-medium"
      : "fill-ink text-[12px] font-medium";
  return (
    <g>
      <rect x={x} y={y} width={width} height={54} rx={8} strokeWidth={1.5} className={fill} />
      <text x={x + 14} y={y + 23} className={titleClass}>
        {title}
      </text>
      <text x={x + 14} y={y + 41} className="fill-body-mid text-[9px] font-mono">
        {sub}
      </text>
    </g>
  );
}

const ARROW = "stroke-body-mid";

export function RagPipeline() {
  return (
    <svg
      viewBox="0 0 760 390"
      role="img"
      aria-labelledby="ragpipe-title ragpipe-desc"
      className="h-auto w-full"
    >
      <title id="ragpipe-title">
        The retrieval-augmented generation pipeline, from documents to citations
      </title>
      <desc id="ragpipe-desc">
        Documents flow through parse, chunk with overlap, contextualize, and
        indexing into two stores: BM25 keywords and dense vectors. A query
        hits both, the two ranked lists fuse with reciprocal rank fusion, a
        cross-encoder reranks the fused candidates, and the top chunks are
        packed into a context window with citation ids. The generator answers
        with bracketed citations, or refuses when no chunk scores above the
        evidence threshold. Annotations note that contextual retrieval plus
        reranking cuts retrieval failures by 49 to 67 percent, that skipping
        the reranker costs 10 to 30 recall points, and that chunk-boundary
        spans are lost without overlap.
      </desc>
      <defs>
        <marker
          id="ragpipe-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-body-mid" />
        </marker>
      </defs>

      <text x={30} y={28} className="fill-ink text-[12.5px] font-medium">
        most RAG failures happen before the model reads a token
      </text>
      <text x={30} y={44} className="fill-mute text-[9.5px] font-mono">
        documents &rarr; parse &rarr; chunk &rarr; contextualize &rarr; index &rarr; retrieve &rarr; fuse &rarr; rerank &rarr; cite
      </text>

      <Stage x={30} y={64} width={160} title="parse" sub="pdf · html · tables" />
      <Stage x={210} y={64} width={160} title="chunk" sub="boundaries + overlap" />
      <Stage x={390} y={64} width={160} title="contextualize" sub="prepend chunk context" />
      <Stage x={570} y={64} width={160} title="index" sub="BM25 + dense vectors" />

      <path d="M190 91H202" fill="none" strokeWidth={1.5} markerEnd="url(#ragpipe-arrow)" className={ARROW} />
      <path d="M370 91H382" fill="none" strokeWidth={1.5} markerEnd="url(#ragpipe-arrow)" className={ARROW} />
      <path d="M550 91H562" fill="none" strokeWidth={1.5} markerEnd="url(#ragpipe-arrow)" className={ARROW} />

      <text x={210} y={136} className="fill-warning text-[9px] font-mono">
        a span straddling a boundary stays split
      </text>
      <text x={390} y={150} className="fill-body-mid text-[9px] font-mono">
        low-overlap chunking hides recall
      </text>

      <path
        d="M650 118V164Q650 172 642 172H118Q110 172 110 180V196"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#ragpipe-arrow)"
        className={ARROW}
      />

      <Stage x={30} y={196} width={160} title="hybrid retrieve" sub="BM25 top-k + dense top-k" />
      <Stage x={210} y={196} width={160} title="RRF" sub="1/(k + rank), k = 60" />
      <Stage x={390} y={196} width={160} title="rerank" sub="cross-encoder on pairs" accent />
      <Stage x={570} y={196} width={160} title="context pack" sub="dedupe · budget · ids" />

      <path d="M190 223H202" fill="none" strokeWidth={1.5} markerEnd="url(#ragpipe-arrow)" className={ARROW} />
      <path d="M370 223H382" fill="none" strokeWidth={1.5} markerEnd="url(#ragpipe-arrow)" className={ARROW} />
      <path d="M550 223H562" fill="none" strokeWidth={1.5} markerEnd="url(#ragpipe-arrow)" className={ARROW} />

      <text x={30} y={270} className="fill-warning text-[9px] font-mono">
        reranker skipped: 10&ndash;30 recall@5 lost
      </text>
      <text x={255} y={270} className="fill-body-mid text-[9px] font-mono">
        RRF needs no calibration
      </text>
      <text x={30} y={286} className="fill-body-mid text-[9px] font-mono">
        reranking recovers 10&ndash;30 recall@5
      </text>
      <text x={255} y={286} className="fill-accent text-[9px] font-mono">
        contextual + rerank: 49&ndash;67% fewer failures
      </text>

      <path d="M580 250V312" fill="none" strokeWidth={1.5} markerEnd="url(#ragpipe-arrow)" className={ARROW} />
      <path
        d="M650 250V308H170V312"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#ragpipe-arrow)"
        className="stroke-error/70"
      />

      <Stage
        x={30}
        y={312}
        width={280}
        title="no evidence above threshold"
        sub="refuse — do not answer from weights"
        danger
      />
      <Stage
        x={430}
        y={312}
        width={300}
        title="generate with citations"
        sub="answer grounded in [1] [2] [3]"
        accent
      />

      <text x={30} y={382} className="fill-mute text-[9.5px] font-mono">
        every kept chunk carries a source id, so the answer can point back to the passage that supports it
      </text>
    </svg>
  );
}
