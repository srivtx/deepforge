import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TRAINING_FIGURES } from "@/components/papers/figures/training";
import type { PaperVisual } from "@/data/papers/types";

const KINDS = [
  "grpo-loop",
  "rl-reward-curve",
  "distillation-flow",
  "prover-tree",
  "code-pipeline",
  "scaling-curve",
  "cost-bars",
  "timeline",
  "janus-decouple",
] as const satisfies readonly PaperVisual[];

function render(kind: PaperVisual): string {
  const Figure = TRAINING_FIGURES[kind];
  if (!Figure) throw new Error(`missing training figure: ${kind}`);
  return renderToStaticMarkup(createElement(Figure));
}

describe("training paper figures", () => {
  for (const kind of KINDS) {
    test(`${kind} renders finite, deterministic, non-trivial markup`, () => {
      const markup = render(kind);

      expect(markup).toContain("<svg");
      expect(markup).toContain('viewBox="0 0 360 200"');
      expect(markup).toContain('class="h-full w-full"');
      expect(markup).toContain('aria-hidden="true"');

      expect(markup).not.toContain("NaN");
      expect(markup).not.toContain("Infinity");
      expect(markup).not.toContain("undefined");

      expect(markup.split("<").length - 1).toBeGreaterThan(12);

      expect(render(kind)).toBe(markup);
    });
  }

  test("all nine figures hash differently", () => {
    const hashes = KINDS.map((kind) =>
      createHash("sha256").update(render(kind)).digest("hex"),
    );
    expect(hashes).toHaveLength(9);
    expect(new Set(hashes).size).toBe(9);
  });
});
