import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { ARCHITECTURE_FIGURES } from "@/components/papers/figures/architecture";
import type { PaperVisual } from "@/data/papers/types";

const KINDS = [
  "moe-routing",
  "fine-grained-experts",
  "mla-latent",
  "fp8-range",
  "load-balance",
  "mtp-tokens",
  "sparse-attention",
  "hybrid-thinking",
  "vision-tower",
] as const satisfies readonly PaperVisual[];

function render(kind: PaperVisual): string {
  const Figure = ARCHITECTURE_FIGURES[kind];
  if (Figure === undefined) {
    throw new Error(`missing architecture figure: ${kind}`);
  }
  return renderToStaticMarkup(Figure());
}

function sha256(markup: string): string {
  return createHash("sha256").update(markup).digest("hex");
}

describe("architecture paper figures", () => {
  test("every kind renders one standalone 360x200 svg", () => {
    for (const kind of KINDS) {
      const markup = render(kind);
      expect(markup.startsWith("<svg"), kind).toBe(true);
      expect(markup.includes('viewBox="0 0 360 200"'), kind).toBe(true);
      expect(markup.includes('className="h-full w-full"') || markup.includes('class="h-full w-full"'), kind).toBe(true);
      expect(markup.includes('aria-hidden="true"'), kind).toBe(true);
    }
  });

  test("no NaN, Infinity, or undefined leaks into the markup", () => {
    for (const kind of KINDS) {
      const markup = render(kind);
      expect(markup.includes("NaN"), kind).toBe(false);
      expect(markup.includes("Infinity"), kind).toBe(false);
      expect(markup.includes("undefined"), kind).toBe(false);
    }
  });

  test("every figure is a real diagram, not a placeholder", () => {
    for (const kind of KINDS) {
      const count = render(kind).split("<").length - 1;
      expect(count, kind).toBeGreaterThan(12);
    }
  });

  test("two renders of the same kind are byte-equal", () => {
    for (const kind of KINDS) {
      expect(render(kind), kind).toBe(render(kind));
    }
  });

  test("the nine rendered hashes are all distinct", () => {
    const hashes = KINDS.map((kind) => sha256(render(kind)));
    expect(new Set(hashes).size).toBe(KINDS.length);
  });
});
