import type { ComponentType } from "react";
import type { DemoKind } from "@/data/articles";
import { SoftmaxTemperatureDemo } from "@/components/articles/DemoSoftmaxTemperature";
import { EigenvectorDemo } from "@/components/articles/DemoEigenvector";
import { GradientDescentDemo } from "@/components/articles/DemoGradientDescent";
import { KMeansDemo } from "@/components/articles/DemoKMeans";
import { AttentionDemo } from "@/components/articles/DemoAttention";
import { BpeMergeDemo } from "@/components/articles/DemoBpeMerge";
import { EmbeddingCosineDemo } from "@/components/articles/DemoEmbeddingCosine";
import { QuantizationScaleDemo } from "@/components/articles/DemoQuantizationScale";

export interface DemoProps {
  params?: Record<string, number>;
}

/** True when the visitor asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface DemoPalette {
  accent: string;
  info: string;
  warning: string;
  error: string;
  ink: string;
  body: string;
  mute: string;
  hairline: string;
  card: string;
  canvas: string;
}

const FALLBACK_PALETTE: DemoPalette = {
  accent: "#7FFF9F",
  info: "#A0C3EC",
  warning: "#FFB347",
  error: "#FF6B6B",
  ink: "#ffffff",
  body: "#d4d4d4",
  mute: "#5a5a5a",
  hairline: "#1f1f1f",
  card: "#111111",
  canvas: "#0a0a0a",
};

/** Read the current theme tokens off the document so canvas drawing follows light/dark mode. */
export function getCanvasPalette(el: Element | null): DemoPalette {
  if (typeof window === "undefined" || !el) return FALLBACK_PALETTE;
  const style = window.getComputedStyle(el);
  const read = (token: string, fallback: string): string => {
    const value = style.getPropertyValue(token).trim();
    return value.length > 0 ? value : fallback;
  };
  return {
    accent: read("--accent", FALLBACK_PALETTE.accent),
    info: read("--info", FALLBACK_PALETTE.info),
    warning: read("--warning", FALLBACK_PALETTE.warning),
    error: read("--error", FALLBACK_PALETTE.error),
    ink: read("--ink", FALLBACK_PALETTE.ink),
    body: read("--body", FALLBACK_PALETTE.body),
    mute: read("--mute", FALLBACK_PALETTE.mute),
    hairline: read("--hairline", FALLBACK_PALETTE.hairline),
    card: read("--canvas-card", FALLBACK_PALETTE.card),
    canvas: read("--canvas", FALLBACK_PALETTE.canvas),
  };
}

export function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

export const DEMOS: Record<DemoKind, ComponentType<DemoProps>> = {
  "softmax-temperature": SoftmaxTemperatureDemo,
  eigenvector: EigenvectorDemo,
  "gradient-descent": GradientDescentDemo,
  kmeans: KMeansDemo,
  attention: AttentionDemo,
  "bpe-merge": BpeMergeDemo,
  "embedding-cosine": EmbeddingCosineDemo,
  "quantization-scale": QuantizationScaleDemo,
};
