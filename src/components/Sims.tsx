"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { OptimizerRace } from "./sims/OptimizerRace";
import { NeuralNetTrainer } from "./sims/NeuralNetTrainer";
import { DijkstraStep } from "./sims/DijkstraStep";

const TABS = [
  {
    id: "optimizer-race",
    label: "Optimizer Race",
    blurb:
      "Six gradient-descent variants race down the same elongated valley. Tune the learning rate and watch momentum and adaptive methods pull ahead — or diverge.",
    Panel: OptimizerRace,
  },
  {
    id: "neural-net-trainer",
    label: "Neural Net Trainer",
    blurb:
      "Train a tiny 2 \u2192 h \u2192 1 sigmoid network in your browser. Switch datasets, add hidden units, and watch the decision boundary bend epoch by epoch.",
    Panel: NeuralNetTrainer,
  },
  {
    id: "dijkstra",
    label: "Dijkstra Step-Through",
    blurb:
      "Step through Dijkstra's algorithm on a fixed weighted graph. The frontier ring shows which nodes are still competing; the distance table updates as edges relax.",
    Panel: DijkstraStep,
  },
] as const;

export function Sims() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = TABS.length - 1;
    let next = -1;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="sims"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Interactive Sims
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-body-mid">
          Three live simulations that run entirely in this page — no libraries,
          no server, just math on the main thread. Play, pause, and step
          through each one; break them on purpose with the controls.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Interactive simulations"
        onKeyDown={onTabKeyDown}
        className="flex flex-wrap gap-1.5 border-b border-hairline pb-2"
      >
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`sim-tab-${tab.id}`}
            aria-selected={active === i}
            aria-controls={`sim-panel-${tab.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active === i
                ? "bg-accent text-canvas"
                : "border border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-body-mid">
        {TABS[active].blurb}
      </p>

      <div className="mt-4">
        {TABS.map((tab, i) => {
          const Panel = tab.Panel;
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`sim-panel-${tab.id}`}
              aria-labelledby={`sim-tab-${tab.id}`}
              hidden={active !== i}
              className="focus:outline-none"
            >
              <Panel active={active === i} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
