import { describe, test, expect } from "bun:test";
import {
  renderPaperPdf,
  measureWidth,
  encodeWinAnsi,
  PDF_PAGE,
  type PdfBlock,
  type PdfDoc,
  type PdfFont,
} from "@/lib/pdf";

/* ─────────────────────────── helpers ─────────────────────────── */

function toLatin1(bytes: Uint8Array): string {
  let out = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return out;
}

const FONT_BY_REF: Record<string, PdfFont> = {
  F1: "regular",
  F2: "bold",
  F3: "oblique",
  F4: "courier",
};

interface TextOp {
  font: PdfFont;
  size: number;
  x: number;
  y: number;
  text: string;
}

function unescapePdfLiteral(literal: string): string {
  const inner = literal.slice(1, -1);
  let out = "";
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const next = inner[i + 1];
    if (next >= "0" && next <= "7") {
      let oct = "";
      let j = i + 1;
      while (j < inner.length && oct.length < 3 && inner[j] >= "0" && inner[j] <= "7") {
        oct += inner[j];
        j++;
      }
      out += String.fromCharCode(parseInt(oct, 8));
      i = j - 1;
    } else {
      out += next;
      i++;
    }
  }
  return out;
}

function textOps(stream: string): TextOp[] {
  const re =
    /BT\n\/(F[1-4]) ([\d.]+) Tf\n1 0 0 1 (-?[\d.]+) (-?[\d.]+) Tm\n(\((?:[^()\\]|\\.)*\)) Tj\nET/g;
  const out: TextOp[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(stream)) !== null) {
    out.push({
      font: FONT_BY_REF[m[1]],
      size: Number(m[2]),
      x: Number(m[3]),
      y: Number(m[4]),
      text: unescapePdfLiteral(m[5]),
    });
  }
  return out;
}

function parseObjects(pdf: string): Map<number, string> {
  const headers: { num: number; start: number }[] = [];
  const re = /\n?(\d+) 0 obj\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pdf)) !== null) {
    headers.push({ num: Number(m[1]), start: m.index + m[0].length });
  }
  const map = new Map<number, string>();
  headers.forEach((header, index) => {
    const end =
      index + 1 < headers.length
        ? headers[index + 1].start
        : pdf.indexOf("\nxref\n", header.start);
    map.set(header.num, pdf.slice(header.start, end));
  });
  return map;
}

function pageStreams(pdf: string): string[] {
  const objects = parseObjects(pdf);
  const refs: number[] = [];
  for (const body of objects.values()) {
    if (body.startsWith("<< /Type /Page /")) {
      const match = /\/Contents (\d+) 0 R/.exec(body);
      if (match) refs.push(Number(match[1]));
    }
  }
  return refs.map((num) => {
    const body = objects.get(num)!;
    const match = /^<< \/Length (\d+) >>\nstream\n/.exec(body)!;
    const length = Number(match[1]);
    return body.slice(match[0].length, match[0].length + length);
  });
}

interface StreamRecord {
  length: number;
  data: string;
  terminated: boolean;
}

function streamRecords(pdf: string): StreamRecord[] {
  const out: StreamRecord[] = [];
  const re = /<< \/Length (\d+) >>\nstream\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pdf)) !== null) {
    const length = Number(m[1]);
    const start = m.index + m[0].length;
    out.push({
      length,
      data: pdf.slice(start, start + length),
      terminated: pdf.startsWith("\nendstream", start + length),
    });
  }
  return out;
}

function pageCount(pdf: string): number {
  const objects = parseObjects(pdf);
  let count = 0;
  for (const body of objects.values()) {
    if (body.startsWith("<< /Type /Page /")) count++;
  }
  return count;
}

function sampleDoc(): PdfDoc {
  return {
    meta: {
      id: "spark-gap-radio",
      title: "The Spark Gap: A Short History of Early Wireless",
      authors: ["Ada Lovelace", "Nikola Tesla"],
      date: "2026-03-18",
      abstract:
        "This paper surveys the spark-gap era of wireless telegraphy \u2014 from Hertz's 1887 experiments to the Marconi Company's transatlantic service \u2013 and asks why the technology plateaued (\u2265 40 years) before the vacuum tube.",
      keywords: ["wireless", "spark gap", "radio history"],
    },
    blocks: [
      { kind: "heading", level: 1, text: "Introduction" },
      {
        kind: "paragraph",
        text:
          'Parentheses (like this) and a backslash \\ must be escaped. The \u201Cspark\u201D \u2014 yes, that one \u2013 ran from \u20181889\u2019 onward, and \u201Cimprovements\u201D were limited: \u2264 10% per year, \u00D7 3 total. Unmappable: \u6F22\u5B57 and \u03C0 \u2248 3.14159.',
      },
      { kind: "heading", level: 2, text: "Apparatus" },
      {
        kind: "list",
        items: ["Induction coil", "Leyden jar", "Spark gap (adjustable)"],
      },
      {
        kind: "list",
        ordered: true,
        items: ["Charge the capacitor", "Break down the gap", "Radiate the pulse"],
      },
      { kind: "formula", text: "f = 1 / (2\u03C0\u221A(LC))" },
      {
        kind: "code",
        language: "python",
        text: [
          "def spark(gap_mm):",
          "    return gap_mm ** 1.5  # empirical breakdown scaling",
          `oversized_token_${"x".repeat(160)}_end`,
          "",
          "print(spark(3.5))",
        ].join("\n"),
      },
      {
        kind: "table",
        caption: "Deployment ranges by station.",
        head: ["Station", "Year", "Range (km)"],
        rows: [
          ["Clifden, Ireland (transatlantic receiving station)", "1907", "3400"],
          ["Poldhu", "1901", "3200"],
          ["Niton", "1900", "150"],
          ["Glace Bay", "1902", "3400"],
          ["Table Cape", "1906", "900"],
        ],
      },
      {
        kind: "figure",
        title: "Transmission range over time",
        caption: "Range grows super-linearly once tuned circuits arrive.",
        bars: [
          { label: "1897", value: 14 },
          { label: "1901", value: 320 },
          { label: "1912", value: 80 },
        ],
      },
      {
        kind: "callout",
        text:
          "Note \u2014 the spark gap was not replaced because it failed, but because continuous-wave transmission made it obsolete.",
      },
      { kind: "heading", level: 3, text: "Aftermath" },
      {
        kind: "paragraph",
        text:
          "The vacuum tube arrived, and with it a hundred years of continuous improvement that the spark gap could never sustain.",
      },
    ],
    references: [
      "Hertz, H. (1887). On very rapid electric oscillations. Annalen der Physik, 31, 421\u2013448.",
      "Marconi, G. (1901). Transatlantic telegraphy. Proceedings of the Royal Institution.",
      "A deliberately long reference title that must wrap across more than a single line in the printed output so the hanging indent of the numbered reference list can be exercised end to end.",
    ],
  };
}

function stressDoc(): PdfDoc {
  const blocks: PdfBlock[] = [];
  for (let i = 0; i < 200; i++) {
    blocks.push({
      kind: "paragraph",
      text: `Paragraph ${i + 1}. ${"The spark gap transmitter radiates a damped wave. ".repeat(3)}`,
    });
  }
  return { ...sampleDoc(), blocks };
}

function longWordDoc(): PdfDoc {
  return {
    meta: {
      id: "long-words",
      title: "Hard break",
      authors: [],
      date: "",
      abstract: "",
      keywords: [],
    },
    blocks: [
      { kind: "paragraph", text: "Supercalifragilistic" + "x".repeat(600) },
      { kind: "code", text: "token_" + "y".repeat(600) },
    ],
    references: [],
  };
}

function minimalDoc(): PdfDoc {
  return {
    meta: { id: "empty", title: "", authors: [], date: "", abstract: "", keywords: [] },
    blocks: [],
    references: [],
  };
}

const PRINT_LEFT = PDF_PAGE.margin;
const PRINT_RIGHT = PDF_PAGE.margin + PDF_PAGE.contentWidth;

function assertWithinColumn(streams: string[]): void {
  for (const stream of streams) {
    for (const op of textOps(stream)) {
      expect(op.x).toBeGreaterThanOrEqual(PRINT_LEFT - 0.51);
      expect(op.x + measureWidth(op.text, op.font, op.size)).toBeLessThanOrEqual(
        PRINT_RIGHT + 0.51,
      );
    }
  }
}

/* ─────────────────────────── tests ─────────────────────────── */

describe("pdf file structure", () => {
  test("starts with %PDF-1.4 and ends with %%EOF", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
  });

  test("contains exactly one startxref whose offset lands on xref", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    expect(pdf.split("startxref").length - 1).toBe(1);
    const match = /startxref\n(\d+)\n%%EOF\n$/.exec(pdf);
    expect(match).not.toBeNull();
    const offset = Number(match![1]);
    expect(offset).toBeGreaterThan(0);
    expect(pdf.slice(offset, offset + 4)).toBe("xref");
  });

  test("xref entries point at their object headers", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    const match = /startxref\n(\d+)\n%%EOF\n$/.exec(pdf)!;
    const xref = pdf.slice(Number(match[1]));
    const entries = Array.from(xref.matchAll(/^(\d{10}) 00000 n $/gm)).map((m) =>
      Number(m[1]),
    );
    expect(entries.length).toBeGreaterThan(0);
    expect(xref.startsWith("xref\n0 ")).toBe(true);
    entries.forEach((entryOffset, index) => {
      expect(pdf.startsWith(`${index + 1} 0 obj`, entryOffset)).toBe(true);
    });
  });

  test("trailer has /Root and page count matches /Type /Page objects", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    expect(pdf).toContain("/Root 1 0 R");
    const count = Number(/\/Count (\d+)/.exec(pdf)![1]);
    const pages = pageCount(pdf);
    expect(count).toBe(pages);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("every content stream /Length equals its byte length", () => {
    const pdf = toLatin1(renderPaperPdf(stressDoc()));
    const records = streamRecords(pdf);
    expect(records.length).toBe(pageCount(pdf));
    records.forEach((record) => {
      expect(record.data.length).toBe(record.length);
      expect(record.terminated).toBe(true);
    });
  });

  test("declares the four base-14 fonts with WinAnsiEncoding", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    expect(pdf).toContain("/BaseFont /Helvetica ");
    expect(pdf).toContain("/BaseFont /Helvetica-Bold ");
    expect(pdf).toContain("/BaseFont /Helvetica-Oblique ");
    expect(pdf).toContain("/BaseFont /Courier ");
    expect(pdf.split("/Encoding /WinAnsiEncoding").length - 1).toBe(4);
  });

  test("uses US Letter MediaBox", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    expect(pdf).toContain(`/MediaBox [0 0 ${PDF_PAGE.width} ${PDF_PAGE.height}]`);
    expect(PDF_PAGE.width).toBe(612);
    expect(PDF_PAGE.height).toBe(792);
    expect(PDF_PAGE.margin).toBe(72);
  });

  test("footer with id and Page N of M appears on every page", () => {
    const pdf = toLatin1(renderPaperPdf(stressDoc()));
    const streams = pageStreams(pdf);
    expect(streams.length).toBeGreaterThan(1);
    streams.forEach((stream, index) => {
      expect(stream).toContain(`Page ${index + 1} of ${streams.length}`);
      expect(stream).toContain("spark-gap-radio");
    });
  });
});

describe("text encoding", () => {
  test("maps curly quotes, dashes, ellipsis and bullet to WinAnsi bytes", () => {
    expect(Array.from(encodeWinAnsi("\u2013"))).toEqual([150]);
    expect(Array.from(encodeWinAnsi("\u2014"))).toEqual([151]);
    expect(Array.from(encodeWinAnsi("\u2018"))).toEqual([145]);
    expect(Array.from(encodeWinAnsi("\u2019"))).toEqual([146]);
    expect(Array.from(encodeWinAnsi("\u201C"))).toEqual([147]);
    expect(Array.from(encodeWinAnsi("\u201D"))).toEqual([148]);
    expect(Array.from(encodeWinAnsi("\u2026"))).toEqual([133]);
    expect(Array.from(encodeWinAnsi("\u2022"))).toEqual([149]);
  });

  test("maps multiplication sign and falls back for >=, <= and CJK", () => {
    expect(Array.from(encodeWinAnsi("\u00D7"))).toEqual([215]);
    expect(Array.from(encodeWinAnsi("\u2265"))).toEqual([62, 61]);
    expect(Array.from(encodeWinAnsi("\u2264"))).toEqual([60, 61]);
    expect(Array.from(encodeWinAnsi("\u6F22"))).toEqual([63]);
    expect(Array.from(encodeWinAnsi("\u03C0"))).toEqual([112, 105]);
  });

  test("passes Latin-1 accents through unchanged", () => {
    expect(Array.from(encodeWinAnsi("\u00E9"))).toEqual([233]);
    expect(Array.from(encodeWinAnsi("\u00FC"))).toEqual([252]);
    expect(Array.from(encodeWinAnsi("ASCII"))).toEqual([65, 83, 67, 73, 73]);
  });

  test("WinAnsi bytes reach the content stream", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    expect(pdf).toContain("\u0097"); // em dash
    expect(pdf).toContain("\u0093"); // left double quote
    expect(pdf).toContain("\u0095"); // bullet (list marker)
  });

  test("escapes parentheses and backslashes in literal strings", () => {
    const pdf = toLatin1(renderPaperPdf(sampleDoc()));
    expect(pdf).toContain("Parentheses \\(like this\\)");
    expect(pdf).toContain("a backslash \\\\ must be escaped");
  });

  test("text ops round-trip escaped literals to the original text", () => {
    const streams = pageStreams(toLatin1(renderPaperPdf(sampleDoc())));
    const all = streams.flatMap(textOps).map((op) => op.text);
    expect(all.some((text) => text.includes("Parentheses (like this) and a backslash \\"))).toBe(
      true,
    );
  });

  test("measureWidth uses real AFM widths", () => {
    expect(measureWidth("A", "regular", 1000)).toBe(667);
    expect(measureWidth("i", "regular", 1000)).toBe(222);
    expect(measureWidth("m", "regular", 1000)).toBe(833);
    expect(measureWidth("A", "bold", 1000)).toBe(722);
    expect(measureWidth("i", "courier", 1000)).toBe(600);
    expect(measureWidth("W", "courier", 1000)).toBe(600);
    expect(Math.abs(measureWidth("A", "regular", 10) - 6.67) < 1e-9).toBe(true);
  });
});

describe("layout", () => {
  test("no emitted text line exceeds the printable width", () => {
    assertWithinColumn(pageStreams(toLatin1(renderPaperPdf(sampleDoc()))));
    assertWithinColumn(pageStreams(toLatin1(renderPaperPdf(stressDoc()))));
  });

  test("hard-breaks very long single words", () => {
    const streams = pageStreams(toLatin1(renderPaperPdf(longWordDoc())));
    assertWithinColumn(streams);
    const joined = streams.map(textOps).flat();
    expect(joined.some((op) => op.text.includes("Supercalifragilistic"))).toBe(true);
    expect(joined.some((op) => op.text.startsWith("xxxx"))).toBe(true);
  });

  test("wraps long code lines at the cell width", () => {
    const streams = pageStreams(toLatin1(renderPaperPdf(sampleDoc())));
    assertWithinColumn(streams);
    const courier = streams.map(textOps).flat().filter((op) => op.font === "courier");
    expect(courier.length).toBeGreaterThan(2);
    expect(courier.some((op) => op.text.includes("oversized_token_"))).toBe(true);
  });

  test("keeps every heading on a page with following content", () => {
    const doc = sampleDoc();
    const blocks: PdfBlock[] = [];
    for (let i = 0; i < 60; i++) {
      if (i === 20) blocks.push({ kind: "heading", level: 2, text: "Midway Section" });
      if (i === 40) blocks.push({ kind: "heading", level: 3, text: "Later Section" });
      blocks.push({
        kind: "paragraph",
        text: `Filler ${i + 1}. ${"A damped wave decays quickly. ".repeat(4)}`,
      });
    }
    blocks.push({ kind: "paragraph", text: "Closing paragraph after the final heading." });
    const streams = pageStreams(toLatin1(renderPaperPdf({ ...doc, blocks })));
    expect(streams.length).toBeGreaterThan(1);
    let headingCount = 0;
    streams.forEach((stream) => {
      const ops = textOps(stream);
      ops.forEach((op, index) => {
        if (op.font !== "bold") return;
        if (op.size !== 15 && op.size !== 12.5 && op.size !== 11) return;
        headingCount++;
        const after = ops.slice(index + 1).filter((next) => next.y > 60);
        expect(after.length).toBeGreaterThan(0);
      });
    });
    expect(headingCount).toBeGreaterThan(2);
  });

  test("centers formula lines in monospace", () => {
    const streams = pageStreams(toLatin1(renderPaperPdf(sampleDoc())));
    const ops = streams.map(textOps).flat();
    const formula = ops.find((op) => op.font === "courier" && op.text.startsWith("f = 1 / (2"));
    expect(formula).not.toBeUndefined();
    const width = measureWidth(formula!.text, "courier", formula!.size);
    const expected = PDF_PAGE.margin + (PDF_PAGE.contentWidth - 24 - width) / 2;
    expect(Math.abs(formula!.x - expected) < 0.6).toBe(true);
  });

  test("draws figure bars normalized to the maximum value", () => {
    const streams = pageStreams(toLatin1(renderPaperPdf(sampleDoc())));
    const rects: { gray: number; w: number }[] = [];
    const re = /([0-9.]+) g\n(-?[0-9.]+) (-?[0-9.]+) ([-0-9.]+) ([-0-9.]+) re\nf/g;
    for (const stream of streams) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(stream)) !== null) {
        rects.push({ gray: Number(m[1]), w: Number(m[4]) });
      }
    }
    const bars = rects.filter((rect) => Math.abs(rect.gray - 0.62) < 1e-9);
    expect(bars.length).toBe(3);
    const widths = bars.map((bar) => bar.w);
    const max = Math.max(...widths);
    expect(Math.abs(widths[1] - max) < 1e-9).toBe(true); // 320 is the max value
    expect(Math.abs(widths[0] / widths[1] - 14 / 320) < 0.02).toBe(true);
    expect(Math.abs(widths[2] / widths[1] - 80 / 320) < 0.02).toBe(true);
  });

  test("splits multi-page tables and repeats the header row", () => {
    const rows = Array.from({ length: 80 }, (_, i) => [
      `Station ${i + 1}`,
      String(1890 + (i % 30)),
      String(100 + i * 7),
    ]);
    const doc: PdfDoc = {
      ...sampleDoc(),
      blocks: [
        {
          kind: "table",
          caption: "Eighty stations.",
          head: ["Station", "Year", "Range (km)"],
          rows,
        },
      ],
    };
    const streams = pageStreams(toLatin1(renderPaperPdf(doc)));
    expect(streams.length).toBeGreaterThan(1);
    const pagesWithHeader = streams.filter((stream) =>
      textOps(stream).some((op) => op.font === "bold" && op.text === "Station"),
    );
    expect(pagesWithHeader.length).toBeGreaterThanOrEqual(2);
    const all = streams.map(textOps).flat().map((op) => op.text);
    expect(all).toContain("Station 80");
  });

  test("splits multi-page code blocks at line boundaries", () => {
    const code = Array.from({ length: 160 }, (_, i) => `line_${i} = compute(${i})`).join("\n");
    const doc: PdfDoc = {
      ...sampleDoc(),
      blocks: [{ kind: "code", text: code }],
    };
    const streams = pageStreams(toLatin1(renderPaperPdf(doc)));
    expect(streams.length).toBeGreaterThan(1);
    const all = streams.map(textOps).flat().map((op) => op.text);
    expect(all).toContain("line_0 = compute(0)");
    expect(all).toContain("line_159 = compute(159)");
    assertWithinColumn(streams);
  });

  test("renders every block kind into the content streams", () => {
    const streams = pageStreams(toLatin1(renderPaperPdf(sampleDoc())));
    const all = streams.map(textOps).flat();
    const texts = all.map((op) => op.text);
    const joined = texts.join("\n");
    expect(texts).toContain("Introduction");
    expect(texts).toContain("Apparatus");
    expect(texts).toContain("Aftermath");
    expect(joined).toContain("Parentheses (like this)");
    expect(texts).toContain("Induction coil");
    expect(texts).toContain("1.");
    expect(joined).toContain("Charge the capacitor");
    expect(joined).toContain("f = 1 / (2pi");
    expect(joined).toContain("def spark(gap_mm):");
    expect(joined).toContain("Station");
    expect(joined).toContain("Deployment ranges by station.");
    expect(joined).toContain("Transmission range over time");
    expect(joined).toContain("Range grows super-linearly");
    expect(joined).toContain("Note");
    expect(joined).toContain("Hertz, H. (1887)");
    expect(texts).toContain("References");
  });

  test("uses all four fonts", () => {
    const streams = pageStreams(toLatin1(renderPaperPdf(sampleDoc())));
    const fonts = new Set(streams.map(textOps).flat().map((op) => op.font));
    expect(fonts.has("regular")).toBe(true);
    expect(fonts.has("bold")).toBe(true);
    expect(fonts.has("oblique")).toBe(true);
    expect(fonts.has("courier")).toBe(true);
  });

  test("empty document renders a single valid page", () => {
    const bytes = renderPaperPdf(minimalDoc());
    const pdf = toLatin1(bytes);
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(pageCount(pdf)).toBe(1);
    const streams = pageStreams(pdf);
    expect(streams).toHaveLength(1);
    expect(streams[0]).toContain("Page 1 of 1");
  });

  test("zero references omits the References heading", () => {
    const doc: PdfDoc = { ...sampleDoc(), references: [] };
    const pdf = toLatin1(renderPaperPdf(doc));
    expect(pdf).not.toContain("References");
    expect(pageCount(pdf)).toBeGreaterThanOrEqual(1);
  });

  test("renders empty and malformed blocks without crashing", () => {
    const blocks: PdfBlock[] = [
      { kind: "heading", level: 1, text: "" },
      { kind: "paragraph", text: "" },
      { kind: "list", items: [] },
      { kind: "formula", text: "" },
      { kind: "code", text: "" },
      { kind: "table", head: [], rows: [] },
      { kind: "figure", title: "", caption: "", bars: [] },
      { kind: "callout", text: "" },
    ];
    const pdf = toLatin1(renderPaperPdf({ ...minimalDoc(), blocks }));
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(pageCount(pdf)).toBeGreaterThanOrEqual(1);
  });

  test("200 paragraphs paginate with sequential footers", () => {
    const pdf = toLatin1(renderPaperPdf(stressDoc()));
    const streams = pageStreams(pdf);
    expect(streams.length).toBeGreaterThan(1);
    expect(pageCount(pdf)).toBe(streams.length);
    streams.forEach((stream, index) => {
      expect(stream).toContain(`Page ${index + 1} of ${streams.length}`);
    });
    expect(textOps(streams[0]).some((op) => op.text.startsWith("Paragraph 1."))).toBe(true);
    const last = textOps(streams[streams.length - 1]).map((op) => op.text).join(" ");
    expect(last).toContain("Paragraph 200.");
  });
});

describe("determinism", () => {
  test("two renders of the same doc are byte-identical", () => {
    const first = renderPaperPdf(sampleDoc());
    const second = renderPaperPdf(sampleDoc());
    expect(first.length).toBe(second.length);
    expect(toLatin1(first)).toBe(toLatin1(second));
    const third = renderPaperPdf(stressDoc());
    const fourth = renderPaperPdf(stressDoc());
    expect(toLatin1(third)).toBe(toLatin1(fourth));
  });
});
