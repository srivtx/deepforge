/**
 * Inventions library: the deterministic helpers the index, the paper page,
 * and the static PDF endpoint share.
 *
 * `INVENTIONS` is re-exported from the data registry, `getInvention` gives a
 * null-safe slug lookup, `citeText` renders one stable citation line,
 * `paperFilename` names the download, and `toPdfDoc` projects a paper into
 * the frozen `PdfDoc` shape consumed by `renderPaperPdf`.
 *
 * Everything here is pure: no clocks, no randomness, no network.
 */

import {
  INVENTIONS,
  type InventionPaper,
} from "@/data/inventions";
import type { PdfBlock, PdfDoc } from "./pdf";

export { INVENTIONS };
export type { InventionPaper };

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

/** The paper for a slug, or null when the slug is unknown. */
export function getInvention(slug: string): InventionPaper | null {
  return INVENTIONS.find((paper) => paper.slug === slug) ?? null;
}

/** Stable download name, e.g. `ladder-graded-spacing.pdf`. */
export function paperFilename(paper: InventionPaper): string {
  return `${paper.slug}.pdf`;
}

/** One-line citation, stable for a given paper and site origin. */
export function citeText(paper: InventionPaper): string {
  const year = paper.date.slice(0, 4);
  return `${paper.authors.join(", ")} (${year}). ${paper.title}. DeepForge. ${SITE_URL}/inventions/${paper.slug}`;
}

/**
 * Project a paper into the PDF document shape. Section headings become
 * level-2 heading blocks, so the block stream preserves the section count
 * exactly; table, figure, formula, code, list, and callout blocks pass
 * through with their content intact.
 */
export function toPdfDoc(paper: InventionPaper): PdfDoc {
  const blocks: PdfBlock[] = [];

  for (const section of paper.sections) {
    blocks.push({ kind: "heading", level: 2, text: section.heading });
    for (const block of section.blocks) {
      switch (block.kind) {
        case "paragraph":
          blocks.push({ kind: "paragraph", text: block.text });
          break;
        case "list":
          blocks.push({
            kind: "list",
            items: [...block.items],
            ordered: block.ordered === true,
          });
          break;
        case "formula":
          blocks.push({
            kind: "formula",
            text: block.label
              ? `${block.label}\n${block.expression}`
              : block.expression,
          });
          if (block.note) {
            blocks.push({ kind: "paragraph", text: block.note });
          }
          break;
        case "code":
          if (block.title) {
            blocks.push({ kind: "paragraph", text: block.title });
          }
          blocks.push({
            kind: "code",
            language: block.language,
            text: block.code,
          });
          break;
        case "table":
          blocks.push({
            kind: "table",
            head: [...block.columns],
            rows: block.rows.map((row) => [...row]),
            caption: [block.title, block.caption].filter(Boolean).join(". "),
          });
          break;
        case "figure":
          blocks.push({
            kind: "figure",
            title: block.figure.title,
            caption: block.figure.caption,
            bars: block.figure.series.flatMap((series) =>
              series.bars.map((bar) => ({
                label: `${series.label}: ${bar.label}`,
                value: bar.value,
              })),
            ),
          });
          break;
        case "callout":
          blocks.push({
            kind: "callout",
            text: block.title ? `${block.title} — ${block.text}` : block.text,
          });
          break;
      }
    }
  }

  return {
    meta: {
      id: paper.id,
      title: paper.title,
      authors: [...paper.authors],
      date: paper.date,
      abstract: paper.abstract,
      keywords: [...paper.keywords],
    },
    blocks,
    references: paper.references.map(
      (reference) => `${reference.citation}. ${reference.url}`,
    ),
  };
}
