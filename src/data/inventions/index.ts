/**
 * The DeepForge Inventions registry: every house research paper in
 * publication order (newest first when there is more than one). Content
 * files export a single `InventionPaper`; this module merges them and
 * exposes the list the routes, the PDF endpoint, and the tests share.
 */

import { LADDER_GRADED_SPACING } from "./ladder-graded-spacing";
import type { InventionPaper } from "./types";

export type {
  InventionPaper,
  InventionSection,
  InventionBlock,
  InventionFigure,
  InventionFigureBar,
  InventionFigureSeries,
  InventionReference,
} from "./types";

/** Every DeepForge invention paper, newest first. */
export const INVENTIONS: InventionPaper[] = [LADDER_GRADED_SPACING];

/** Deterministic slug lookup; undefined for unknown slugs. */
export function getInventionBySlug(slug: string): InventionPaper | undefined {
  return INVENTIONS.find((paper) => paper.slug === slug);
}
