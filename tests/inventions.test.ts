import { describe, expect, test } from "bun:test";
import {
  dynamicParams as pageDynamicParams,
  generateStaticParams as pageStaticParams,
} from "@/app/inventions/[slug]/page";
import {
  GET as pdfRoute,
  dynamic as pdfDynamic,
  dynamicParams as pdfDynamicParams,
  generateStaticParams as pdfStaticParams,
} from "@/app/inventions/[slug]/paper.pdf/route";
import {
  INVENTIONS as DATA_INVENTIONS,
  getInventionBySlug,
} from "@/data/inventions";
import {
  INVENTIONS,
  citeText,
  getInvention,
  paperFilename,
  toPdfDoc,
} from "@/lib/inventions";
import { renderPaperPdf } from "@/lib/pdf";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function firstBytes(bytes: Uint8Array, count: number): string {
  return String.fromCharCode(...bytes.slice(0, count));
}

describe("invention registry", () => {
  test("exports exactly the expected papers, and the lib re-export is the same list", () => {
    expect(DATA_INVENTIONS.map((paper) => paper.slug)).toEqual([
      "ladder-graded-spacing",
    ]);
    expect(INVENTIONS.map((paper) => paper.slug)).toEqual([
      "ladder-graded-spacing",
    ]);
    expect(INVENTIONS).toBe(DATA_INVENTIONS);
  });

  test("ids and slugs are unique and URL-safe", () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const paper of INVENTIONS) {
      expect(ids.has(paper.id), paper.id).toBe(false);
      ids.add(paper.id);
      expect(slugs.has(paper.slug), paper.slug).toBe(false);
      slugs.add(paper.slug);
      expect(paper.slug, paper.id).toMatch(SLUG_PATTERN);
    }
  });

  test("every paper is well-formed", () => {
    expect(INVENTIONS.length).toBeGreaterThan(0);
    for (const paper of INVENTIONS) {
      expect(paper.title.trim().length, paper.id).toBeGreaterThan(0);
      expect(paper.authors.length, paper.id).toBeGreaterThan(0);
      expect(paper.authors).toContain("DeepForge Research");
      expect(paper.date, paper.id).toMatch(DATE_PATTERN);
      expect(Number.isNaN(Date.parse(paper.date)), paper.id).toBe(false);
      expect(paper.abstract.trim().length, paper.id).toBeGreaterThan(200);
      expect(paper.sections.length, paper.id).toBeGreaterThanOrEqual(8);
      expect(paper.keywords.length, paper.id).toBeGreaterThanOrEqual(6);
      expect(new Set(paper.keywords).size, paper.id).toBe(paper.keywords.length);
      for (const keyword of paper.keywords) {
        expect(keyword.trim().length, paper.id).toBeGreaterThan(0);
      }
    }
  });

  test("section ids and headings are unique and non-empty", () => {
    for (const paper of INVENTIONS) {
      const ids = new Set<string>();
      for (const section of paper.sections) {
        expect(ids.has(section.id), `${paper.id}:${section.id}`).toBe(false);
        ids.add(section.id);
        expect(section.heading.trim().length, section.id).toBeGreaterThan(0);
        expect(section.blocks.length, section.id).toBeGreaterThan(0);
      }
    }
  });

  test("references are https, unique, and numerous enough", () => {
    for (const paper of INVENTIONS) {
      expect(paper.references.length, paper.id).toBeGreaterThanOrEqual(6);
      const ids = new Set<string>();
      for (const reference of paper.references) {
        expect(reference.id.trim().length, paper.id).toBeGreaterThan(0);
        expect(ids.has(reference.id), reference.id).toBe(false);
        ids.add(reference.id);
        expect(reference.citation.trim().length, reference.id).toBeGreaterThan(0);
        expect(reference.url.startsWith("https://"), reference.url).toBe(true);
      }
    }
  });

  test("getInvention returns the paper for a known slug and null otherwise", () => {
    for (const paper of INVENTIONS) {
      expect(getInvention(paper.slug)).toBe(paper);
      expect(getInventionBySlug(paper.slug)).toBe(paper);
    }
    expect(getInvention("definitely-not-a-paper")).toBeNull();
    expect(getInventionBySlug("definitely-not-a-paper")).toBeUndefined();
  });
});

describe("toPdfDoc", () => {
  test("preserves the section count via heading blocks", () => {
    for (const paper of INVENTIONS) {
      const doc = toPdfDoc(paper);
      const headings = doc.blocks.filter((block) => block.kind === "heading");
      expect(headings.length, paper.id).toBe(paper.sections.length);
      for (const block of headings) {
        if (block.kind !== "heading") continue;
        expect(block.text.trim().length, paper.id).toBeGreaterThan(0);
        expect(block.level).toBeGreaterThan(0);
      }
    }
  });

  test("carries the full paper: tables, a figure, lists, formulas, code, and callouts", () => {
    for (const paper of INVENTIONS) {
      const doc = toPdfDoc(paper);
      const tables = doc.blocks.filter((block) => block.kind === "table");
      const figures = doc.blocks.filter((block) => block.kind === "figure");
      const formulas = doc.blocks.filter((block) => block.kind === "formula");
      const code = doc.blocks.filter((block) => block.kind === "code");
      const lists = doc.blocks.filter((block) => block.kind === "list");
      const callouts = doc.blocks.filter((block) => block.kind === "callout");
      expect(tables.length, paper.id).toBeGreaterThanOrEqual(1);
      expect(figures.length, paper.id).toBeGreaterThanOrEqual(1);
      expect(formulas.length, paper.id).toBeGreaterThanOrEqual(1);
      expect(code.length, paper.id).toBeGreaterThanOrEqual(1);
      expect(lists.length, paper.id).toBeGreaterThanOrEqual(1);
      expect(callouts.length, paper.id).toBeGreaterThanOrEqual(1);

      for (const table of tables) {
        if (table.kind !== "table") continue;
        expect(table.head.length, paper.id).toBeGreaterThan(0);
        expect(table.rows.length, paper.id).toBeGreaterThan(0);
      }
      for (const figure of figures) {
        if (figure.kind !== "figure") continue;
        expect(figure.title.trim().length, paper.id).toBeGreaterThan(0);
        expect(figure.bars.length, paper.id).toBeGreaterThan(0);
      }
      for (const formula of formulas) {
        if (formula.kind !== "formula") continue;
        expect(formula.text.trim().length, paper.id).toBeGreaterThan(0);
      }
      for (const snippet of code) {
        if (snippet.kind !== "code") continue;
        expect(snippet.text.trim().length, paper.id).toBeGreaterThan(0);
      }
    }
  });

  test("preserves metadata and the reference list", () => {
    for (const paper of INVENTIONS) {
      const doc = toPdfDoc(paper);
      expect(doc.meta.id).toBe(paper.id);
      expect(doc.meta.title).toBe(paper.title);
      expect(doc.meta.authors).toEqual([...paper.authors]);
      expect(doc.meta.date).toBe(paper.date);
      expect(doc.meta.abstract).toBe(paper.abstract);
      expect(doc.meta.keywords).toEqual([...paper.keywords]);
      expect(doc.references.length).toBe(paper.references.length);
      for (let i = 0; i < doc.references.length; i += 1) {
        expect(doc.references[i].includes(paper.references[i].url)).toBe(true);
      }
    }
  });
});

describe("citations and filenames", () => {
  test("citeText is stable and names the paper, year, authors, and location", () => {
    for (const paper of INVENTIONS) {
      const first = citeText(paper);
      const second = citeText(paper);
      expect(first).toBe(second);
      expect(first.includes(paper.title)).toBe(true);
      expect(first.includes(paper.authors[0])).toBe(true);
      expect(first.includes(paper.date.slice(0, 4))).toBe(true);
      expect(first.includes(`/inventions/${paper.slug}`)).toBe(true);
    }
  });

  test("paperFilename is stable and derived from the slug", () => {
    for (const paper of INVENTIONS) {
      expect(paperFilename(paper)).toBe(`${paper.slug}.pdf`);
      expect(paperFilename(paper)).toBe(paperFilename(paper));
    }
    expect(paperFilename(INVENTIONS[0])).toBe("ladder-graded-spacing.pdf");
  });
});

describe("PDF rendering", () => {
  test("renderPaperPdf emits a real PDF deterministically", () => {
    for (const paper of INVENTIONS) {
      const doc = toPdfDoc(paper);
      const first = renderPaperPdf(doc);
      const second = renderPaperPdf(toPdfDoc(paper));
      expect(first.length, paper.id).toBeGreaterThan(0);
      expect(firstBytes(first, 4), paper.id).toBe("%PDF");
      expect(first.length, paper.id).toBe(second.length);
      expect(Buffer.from(first).equals(Buffer.from(second))).toBe(true);
    }
  });
});

describe("static routes", () => {
  test("both routes pre-render exactly the registered slugs", () => {
    const slugs = INVENTIONS.map((paper) => paper.slug);
    expect(pageStaticParams().map((entry) => entry.slug)).toEqual(slugs);
    expect(pdfStaticParams().map((entry) => entry.slug)).toEqual(slugs);
    expect(pageDynamicParams).toBe(false);
    expect(pdfDynamicParams).toBe(false);
    expect(pdfDynamic).toBe("force-static");
  });

  test("the PDF endpoint serves the document and 404s unknown slugs", async () => {
    const paper = INVENTIONS[0];
    const response = await pdfRoute(
      new Request(`https://deepforge.app/inventions/${paper.slug}/paper.pdf`),
      { params: Promise.resolve({ slug: paper.slug }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain(
      "ladder-graded-spacing.pdf",
    );
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(firstBytes(bytes, 4)).toBe("%PDF");

    const missing = await pdfRoute(
      new Request("https://deepforge.app/inventions/nope/paper.pdf"),
      { params: Promise.resolve({ slug: "nope" }) },
    );
    expect(missing.status).toBe(404);
  });
});
