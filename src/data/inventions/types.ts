/**
 * Schema for DeepForge Inventions: the house research surface where the
 * platform publishes its own techniques as full papers with a real,
 * downloadable PDF.
 *
 * Content files live beside this one (ladder-graded-spacing.ts) and export an
 * `InventionPaper`; index.ts exposes the registry. The PDF projection lives in
 * src/lib/inventions.ts so the data stays renderer-agnostic and every block
 * maps to a `PdfBlock` kind one-to-one.
 */

export interface InventionReference {
  id: string;
  citation: string;
  url: string;
}

export interface InventionFigureBar {
  label: string;
  value: number;
}

export interface InventionFigureSeries {
  label: string;
  bars: InventionFigureBar[];
}

/** A deterministic bar figure; no randomness, no clocks, no scaling surprises. */
export interface InventionFigure {
  id: string;
  title: string;
  caption: string;
  /** Unit of the bar values, shown under the plot. */
  unit: string;
  /** Fixed scale ceiling so the same data always renders the same SVG. */
  max: number;
  /** Optional acceptance threshold drawn as a dashed line. */
  gate?: number;
  series: InventionFigureSeries[];
}

/** One content block inside a section. `kind` mirrors the PDF block union. */
export type InventionBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "formula"; expression: string; label?: string; note?: string }
  | { kind: "code"; language: string; code: string; title?: string }
  | {
      kind: "table";
      columns: string[];
      rows: string[][];
      title?: string;
      caption?: string;
    }
  | { kind: "figure"; figure: InventionFigure }
  | { kind: "callout"; title: string; text: string };

export interface InventionSection {
  id: string;
  heading: string;
  blocks: InventionBlock[];
}

export interface InventionPaper {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  abstract: string;
  keywords: string[];
  sections: InventionSection[];
  references: InventionReference[];
}
