"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Concept } from "@/data/concepts";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import {
  buildConceptGraph,
  clampMastery,
  layerConcepts,
  layoutConceptGraph,
  routeBetween,
} from "@/lib/conceptGraph";
import { cn } from "@/lib/utils";

const NODE_RADIUS = 16;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 1.2;
const VIEW_PADDING = 40;
const LABEL_MAX = 14;

const PENPAPER_BY_ID = new Map(
  PENPAPER_PROBLEMS.map((problem) => [problem.id, problem]),
);

type MasteryBand = "not-started" | "learning" | "familiar" | "mastered";

const BAND_ORDER: MasteryBand[] = [
  "not-started",
  "learning",
  "familiar",
  "mastered",
];

const BAND_CLASSES: Record<MasteryBand, string> = {
  "not-started": "text-mute",
  learning: "text-body-mid",
  familiar: "text-accent",
  mastered: "text-accent",
};

const BAND_FILL_OPACITY: Record<MasteryBand, number> = {
  "not-started": 0.25,
  learning: 0.45,
  familiar: 0.7,
  mastered: 1,
};

const BAND_LABELS: Record<MasteryBand, string> = {
  "not-started": "Not started",
  learning: "Learning",
  familiar: "Familiar 40%+",
  mastered: "Mastered 80%+",
};

function bandOf(value: number | undefined): MasteryBand {
  if (value === undefined) return "not-started";
  const normalized = clampMastery(value);
  if (normalized >= 0.8) return "mastered";
  if (normalized >= 0.4) return "familiar";
  return "learning";
}

function masteryPercent(value: number | undefined): number {
  return Math.round(clampMastery(value ?? 0) * 100);
}

function truncateLabel(label: string, max = LABEL_MAX): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

function compareConcepts(a: Concept, b: Concept): number {
  if (a.category !== b.category) return a.category < b.category ? -1 : 1;
  return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
}

export function ConceptMap({
  concepts,
  mastery,
}: {
  concepts: Concept[];
  mastery?: Record<string, number>;
}) {
  const graph = useMemo(() => buildConceptGraph(concepts), [concepts]);
  const layout = useMemo(() => layoutConceptGraph(graph), [graph]);
  const layered = useMemo(() => layerConcepts(graph), [graph]);
  const conceptById = useMemo(
    () => new Map(concepts.map((concept) => [concept.id, concept])),
    [concepts],
  );
  const positionById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout],
  );
  const orderedConcepts = useMemo(
    () => [...concepts].sort(compareConcepts),
    [concepts],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [route, setRoute] = useState<string[] | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const draggedRef = useRef(false);

  const viewWidth = layout.width + VIEW_PADDING * 2;
  const viewHeight = layout.height + VIEW_PADDING * 2;

  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      setZoom((value) => {
        const next = event.deltaY < 0 ? value * ZOOM_STEP : value / ZOOM_STEP;
        return Math.round(
          Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)) * 100,
        ) / 100;
      });
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  const routeSet = useMemo(
    () => (route ? new Set(route) : null),
    [route],
  );

  const selectedConcept = selectedId ? conceptById.get(selectedId) : undefined;
  const selectedMastery = selectedId ? mastery?.[selectedId] : undefined;
  const selectedPrerequisites = selectedConcept
    ? selectedConcept.prerequisites.map(
        (id) => conceptById.get(id)?.title ?? id,
      )
    : [];

  const selectNode = (id: string) => {
    if (draggedRef.current) return;
    setSelectedId((current) => (current === id ? null : id));
  };

  const showRoute = () => {
    if (!fromId || !toId) {
      setRoute(null);
      setAnnouncement("Choose both a from and a to concept.");
      return;
    }
    const ids = routeBetween(graph, fromId, toId);
    if (!ids) {
      setRoute(null);
      setAnnouncement("That route could not be computed.");
      return;
    }
    setRoute(ids);
    setAnnouncement(
      `Route with ${ids.length} ${
        ids.length === 1 ? "step" : "steps"
      }: ${ids.map((id) => conceptById.get(id)?.title ?? id).join(", ")}.`,
    );
  };

  const clearRoute = () => {
    setRoute(null);
    setAnnouncement("Route cleared.");
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    draggedRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!draggedRef.current) {
      if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) return;
      draggedRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const scale = Math.max(viewWidth / rect.width, viewHeight / rect.height);
    setPan({ x: drag.panX + dx * scale, y: drag.panY + dy * scale });
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex items-center gap-2 text-xs text-body-mid">
          <span className="shrink-0">From</span>
          <select
            value={fromId}
            onChange={(event) => setFromId(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-hairline bg-canvas px-2 text-xs text-body focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-9 sm:w-auto"
          >
            <option value="">Select a concept</option>
            {orderedConcepts.map((concept) => (
              <option key={concept.id} value={concept.id}>
                {concept.title} · {concept.category}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-body-mid">
          <span className="shrink-0">To</span>
          <select
            value={toId}
            onChange={(event) => setToId(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-hairline bg-canvas px-2 text-xs text-body focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-9 sm:w-auto"
          >
            <option value="">Select a concept</option>
            {orderedConcepts.map((concept) => (
              <option key={concept.id} value={concept.id}>
                {concept.title} · {concept.category}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={showRoute}
            className="min-h-11 rounded-lg border border-accent px-3 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-9"
          >
            Show route
          </button>
          <button
            type="button"
            onClick={clearRoute}
            className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-9"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-canvas-card p-2 sm:p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
          <p className="text-[11px] text-mute">
            Drag to pan · Ctrl + wheel to zoom
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.round(Math.max(MIN_ZOOM, value / ZOOM_STEP) * 100) / 100)
              }
              aria-label="Zoom out"
              className="min-h-9 min-w-9 rounded-lg border border-hairline text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              −
            </button>
            <span className="w-10 text-center font-mono text-[11px] text-mute">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.round(Math.min(MAX_ZOOM, value * ZOOM_STEP) * 100) / 100)
              }
              aria-label="Zoom in"
              className="min-h-9 min-w-9 rounded-lg border border-hairline text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="min-h-9 rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Reset
            </button>
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`${-VIEW_PADDING} ${-VIEW_PADDING} ${viewWidth} ${viewHeight}`}
          role="group"
          aria-label="Concept prerequisite map"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="block h-72 w-full cursor-grab touch-none select-none rounded-lg bg-canvas focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:h-96"
        >
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            <g aria-hidden="true">
              {graph.edges.map((edge) => {
                const from = positionById.get(edge.from);
                const to = positionById.get(edge.to);
                if (!from || !to) return null;
                const onRoute =
                  routeSet !== null &&
                  routeSet.has(edge.from) &&
                  routeSet.has(edge.to);
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={from.x}
                    y1={from.y + NODE_RADIUS}
                    x2={to.x}
                    y2={to.y - NODE_RADIUS}
                    className={cn(
                      onRoute ? "stroke-accent" : "stroke-hairline",
                      routeSet !== null && !onRoute && "opacity-40",
                    )}
                    strokeWidth={onRoute ? 1.5 : 1}
                  />
                );
              })}
            </g>

            {layout.nodes.map((node) => {
              const concept = conceptById.get(node.id);
              if (!concept) return null;
              const value = mastery?.[node.id];
              const band = bandOf(value);
              const isSelected = selectedId === node.id;
              const isFocused = focusedId === node.id;
              const inRoute = routeSet === null || routeSet.has(node.id);
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x} ${node.y})`}
                  className={cn(!inRoute && "opacity-40")}
                >
                  <g
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`${concept.title}, ${concept.category}, ${
                      value === undefined
                        ? "not started"
                        : `${masteryPercent(value)}% mastery`
                    }`}
                    onClick={() => selectNode(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId((current) =>
                          current === node.id ? null : node.id,
                        );
                      }
                    }}
                    onFocus={() => setFocusedId(node.id)}
                    onBlur={() =>
                      setFocusedId((current) =>
                        current === node.id ? null : current,
                      )
                    }
                    className={cn(
                      "cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent",
                      BAND_CLASSES[band],
                    )}
                  >
                    <title>
                      {`${concept.title} — ${concept.category}${
                        value === undefined
                          ? ""
                          : ` — ${masteryPercent(value)}% mastery`
                      }`}
                    </title>
                    {(isSelected || isFocused) && (
                      <circle
                        r={NODE_RADIUS + 4}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      />
                    )}
                    <circle
                      r={NODE_RADIUS}
                      fill="currentColor"
                      fillOpacity={BAND_FILL_OPACITY[band]}
                      stroke="currentColor"
                      strokeWidth={1}
                    />
                  </g>
                  <text
                    y={NODE_RADIUS + 14}
                    textAnchor="middle"
                    fill="currentColor"
                    className="pointer-events-none text-[10px] text-body-mid"
                  >
                    {truncateLabel(concept.title)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 pt-2">
          {BAND_ORDER.map((band) => (
            <li
              key={band}
              className="flex items-center gap-1.5 text-[11px] text-body-mid"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2.5 w-2.5 rounded-full bg-current",
                  BAND_CLASSES[band],
                )}
                style={{ opacity: BAND_FILL_OPACITY[band] }}
              />
              {BAND_LABELS[band]}
            </li>
          ))}
        </ul>
      </div>

      <p aria-live="polite" className="text-xs leading-relaxed text-body-mid">
        {announcement}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {selectedConcept ? (
          <section
            aria-label="Concept details"
            className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink">
                  {selectedConcept.title}
                </h3>
                <p className="mt-0.5 text-xs text-body-mid">
                  {selectedConcept.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="min-h-9 shrink-0 rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              {selectedConcept.blurb}
            </p>
            <p className="mt-2 font-mono text-[11px] text-body-mid">
              {selectedMastery === undefined
                ? "Not started"
                : `${masteryPercent(selectedMastery)}% mastery`}
            </p>
            {selectedPrerequisites.length > 0 && (
              <p className="mt-2 text-[11px] leading-relaxed text-body-mid">
                {selectedPrerequisites.length === 1
                  ? "prerequisite"
                  : "prerequisites"}
                : {selectedPrerequisites.join(", ")}
              </p>
            )}
            <h4 className="mt-4 text-xs font-medium text-body-mid">
              Practice in Pen &amp; Paper
            </h4>
            <ul className="mt-2 space-y-1.5">
              {selectedConcept.practiceIds.map((id) => (
                <li key={id}>
                  <Link
                    href="/math"
                    className="flex items-start gap-2 rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                  >
                    <span className="shrink-0 font-mono text-[11px] text-mute">
                      {id}
                    </span>
                    <span className="min-w-0 line-clamp-2">
                      {PENPAPER_BY_ID.get(id)?.question ?? id}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-xs leading-relaxed text-body-mid">
            Select a node to see its details, mastery, and practice links.
          </p>
        )}

        {route && (
          <section
            aria-label="Route steps"
            className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
          >
            <h3 className="text-sm font-semibold text-ink">Route</h3>
            <ol className="mt-3 space-y-1.5">
              {route.map((id, index) => {
                const layer = layered.layers.get(id);
                return (
                  <li
                    key={id}
                    className="flex items-baseline gap-3 text-sm text-body"
                  >
                    <span className="font-mono text-[11px] text-accent">
                      {index + 1}.
                    </span>
                    <span className="min-w-0">
                      {conceptById.get(id)?.title ?? id}
                    </span>
                    {layer !== undefined && (
                      <span className="ml-auto shrink-0 font-mono text-[11px] text-mute">
                        layer {layer}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
