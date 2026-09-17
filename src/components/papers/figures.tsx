import type { PaperVisual } from "@/data/papers/types";
import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { ARCHITECTURE_FIGURES } from "./figures/architecture";
import { TRAINING_FIGURES } from "./figures/training";

const FIGURES: Partial<Record<PaperVisual, () => ReactElement>> = {
  ...ARCHITECTURE_FIGURES,
  ...TRAINING_FIGURES,
};

/**
 * Deterministic SVG figures for the papers curriculum. Every visual is pure
 * markup (no hooks, no randomness, no clocks) so the curriculum renders fully
 * server-side. Architecture internals live in figures/architecture.tsx and
 * training/lineage diagrams in figures/training.tsx.
 */
export function PaperFigure({
  visual,
  caption,
  className,
}: {
  visual: PaperVisual;
  caption: string;
  className?: string;
}) {
  const render = FIGURES[visual];
  return (
    <figure className={cn("m-0", className)}>
      <div className="h-[200px] w-full rounded-md border border-hairline bg-canvas p-2">
        {render ? (
          render()
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-[10px] text-mute">{visual}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-[11px] leading-relaxed text-mute">
        {caption}
      </figcaption>
    </figure>
  );
}
