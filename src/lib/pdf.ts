/**
 * Self-contained PDF 1.4 writer for the Inventions publishing surface.
 *
 * No dependencies, no clock, no randomness: every byte is derived from the
 * `PdfDoc` passed to `renderPaperPdf`.
 *
 * Page geometry: US Letter — 612 x 792 pt, 1-inch (72 pt) margins, single
 * column. Content flows top-down from y = 720 to y = 72; the per-page footer
 * lives in the bottom margin (rule at y = 54, baseline at y = 40).
 *
 * Layout is two-pass: `layoutDocument` produces finished draw-op lists for
 * every page, and only then are pages serialized, so "Page N of M" can be
 * printed correctly.
 *
 * Fonts are the base-14 Helvetica family plus Courier, declared as Type1
 * fonts with /WinAnsiEncoding. The width tables below are the Adobe AFM
 * glyph widths (per 1000 units) so measured line widths match rendered ones.
 */

export interface PdfPaperMeta {
  id: string; // url-safe slug
  title: string;
  authors: string[];
  date: string; // ISO date, printed human-readably
  abstract: string;
  keywords: string[];
}
export type PdfBlock =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "formula"; text: string }
  | { kind: "code"; language?: string; text: string }
  | { kind: "table"; caption?: string; head: string[]; rows: string[][] }
  | { kind: "figure"; title: string; caption: string; bars: { label: string; value: number }[] }
  | { kind: "callout"; text: string };
export interface PdfDoc {
  meta: PdfPaperMeta;
  blocks: PdfBlock[];
  references: string[];
}

/* ───────────────────────────── geometry ───────────────────────────── */

/** US Letter, portrait: 612 x 792 pt with 72 pt (1 inch) margins. */
export const PDF_PAGE = {
  width: 612,
  height: 792,
  margin: 72,
  contentWidth: 468,
} as const;

const PAGE_W = PDF_PAGE.width;
const PAGE_H = PDF_PAGE.height;
const MARGIN = PDF_PAGE.margin;
const CONTENT_W = PDF_PAGE.contentWidth;
const CONTENT_TOP = PAGE_H - MARGIN;
const CONTENT_BOTTOM = MARGIN;
const FOOTER_RULE_Y = 54;
const FOOTER_BASELINE = 40;
const BASELINE = 0.82; // baseline offset below a line's top, as a fraction of size

export type PdfFont = "regular" | "bold" | "oblique" | "courier";

const FONT_REF: Record<PdfFont, string> = {
  regular: "F1",
  bold: "F2",
  oblique: "F3",
  courier: "F4",
};

const FONT_BASE: Record<PdfFont, string> = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  oblique: "Helvetica-Oblique",
  courier: "Courier",
};

/* ─────────────────────── AFM width tables ─────────────────────── */
/* Codes 32..126, straight from the Adobe AFM files. */

const HELVETICA_ASCII: number[] = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, // 0-9
  278, 278, 584, 584, 584, 556, 1015,
  667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667,
  778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
  278, 278, 278, 469, 556, 333,
  556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556,
  556, 333, 500, 278, 556, 500, 722, 500, 500, 500,
  334, 260, 334, 584,
];

const HELVETICA_BOLD_ASCII: number[] = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, // 0-9
  333, 333, 584, 584, 584, 611, 975,
  722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667,
  778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
  333, 278, 333, 584, 556, 333,
  556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611,
  611, 389, 556, 333, 611, 556, 778, 556, 556, 500,
  389, 280, 389, 584,
];

/* WinAnsi codes 128..159 (the Windows Latin-1 block) + 160..255 (Latin-1). */

const HELVETICA_HIGH: Record<number, number> = {
  128: 556, 130: 222, 131: 556, 132: 333, 133: 1000, 134: 556, 135: 556,
  136: 333, 137: 1000, 138: 667, 139: 333, 140: 1000, 142: 611, 145: 222,
  146: 222, 147: 333, 148: 333, 149: 350, 150: 556, 151: 1000, 152: 333,
  153: 1000, 154: 500, 155: 333, 156: 944, 158: 500, 159: 667,
  160: 278, 161: 333, 162: 556, 163: 556, 164: 556, 165: 556, 166: 260,
  167: 556, 168: 333, 169: 737, 170: 370, 171: 556, 172: 584, 173: 333,
  174: 737, 175: 333, 176: 400, 177: 584, 178: 333, 179: 333, 180: 333,
  181: 556, 182: 537, 183: 278, 184: 333, 185: 333, 186: 365, 187: 556,
  188: 834, 189: 834, 190: 834, 191: 611, 192: 667, 193: 667, 194: 667,
  195: 667, 196: 667, 197: 667, 198: 1000, 199: 722, 200: 667, 201: 667,
  202: 667, 203: 667, 204: 278, 205: 278, 206: 278, 207: 278, 208: 722,
  209: 722, 210: 778, 211: 778, 212: 778, 213: 778, 214: 778, 215: 584,
  216: 778, 217: 722, 218: 722, 219: 722, 220: 722, 221: 667, 222: 667,
  223: 611, 224: 556, 225: 556, 226: 556, 227: 556, 228: 556, 229: 556,
  230: 889, 231: 500, 232: 556, 233: 556, 234: 556, 235: 556, 236: 278,
  237: 278, 238: 278, 239: 278, 240: 556, 241: 556, 242: 556, 243: 556,
  244: 556, 245: 556, 246: 556, 247: 584, 248: 611, 249: 556, 250: 556,
  251: 556, 252: 556, 253: 500, 254: 556, 255: 500,
};

const HELVETICA_BOLD_HIGH: Record<number, number> = {
  128: 556, 130: 278, 131: 556, 132: 500, 133: 1000, 134: 556, 135: 556,
  136: 333, 137: 1000, 138: 667, 139: 333, 140: 1000, 142: 611, 145: 278,
  146: 278, 147: 500, 148: 500, 149: 350, 150: 556, 151: 1000, 152: 333,
  153: 1000, 154: 556, 155: 333, 156: 944, 158: 500, 159: 667,
  160: 278, 161: 333, 162: 556, 163: 556, 164: 556, 165: 556, 166: 280,
  167: 556, 168: 333, 169: 737, 170: 370, 171: 556, 172: 584, 173: 333,
  174: 737, 175: 333, 176: 400, 177: 584, 178: 333, 179: 333, 180: 333,
  181: 611, 182: 556, 183: 278, 184: 333, 185: 333, 186: 365, 187: 556,
  188: 834, 189: 834, 190: 834, 191: 611, 192: 722, 193: 722, 194: 722,
  195: 722, 196: 722, 197: 722, 198: 1000, 199: 722, 200: 667, 201: 667,
  202: 667, 203: 667, 204: 278, 205: 278, 206: 278, 207: 278, 208: 722,
  209: 722, 210: 778, 211: 778, 212: 778, 213: 778, 214: 778, 215: 584,
  216: 778, 217: 722, 218: 722, 219: 722, 220: 722, 221: 667, 222: 667,
  223: 611, 224: 556, 225: 556, 226: 556, 227: 556, 228: 556, 229: 556,
  230: 889, 231: 556, 232: 556, 233: 556, 234: 556, 235: 556, 236: 278,
  237: 278, 238: 278, 239: 278, 240: 611, 241: 611, 242: 611, 243: 611,
  244: 611, 245: 611, 246: 611, 247: 584, 248: 611, 249: 611, 250: 611,
  251: 611, 252: 611, 253: 556, 254: 611, 255: 556,
};

function makeWidthTable(
  ascii: number[],
  high: Record<number, number>,
  fallback: number,
): number[] {
  const table = new Array<number>(256).fill(fallback);
  for (let i = 0; i < ascii.length; i++) table[32 + i] = ascii[i];
  for (const key of Object.keys(high)) table[Number(key)] = high[Number(key)];
  return table;
}

const WIDTHS: Record<PdfFont, number[]> = {
  regular: makeWidthTable(HELVETICA_ASCII, HELVETICA_HIGH, 556),
  // Helvetica-Oblique shares Helvetica's AFM widths exactly.
  oblique: makeWidthTable(HELVETICA_ASCII, HELVETICA_HIGH, 556),
  bold: makeWidthTable(HELVETICA_BOLD_ASCII, HELVETICA_BOLD_HIGH, 611),
  courier: new Array<number>(256).fill(600),
};

/* ─────────────────── Unicode -> WinAnsi encoding ─────────────────── */

/** Direct byte mappings (or ASCII fallbacks) for punctuation outside Latin-1. */
const WINANSI_SPECIAL: Record<string, number | string> = {
  "\u20AC": 128, // €
  "\u201A": 130, // ‚
  "\u0192": 131, // ƒ
  "\u201E": 132, // „
  "\u2026": 133, // …
  "\u2020": 134, // †
  "\u2021": 135, // ‡
  "\u02C6": 136, // ˆ
  "\u2030": 137, // ‰
  "\u0160": 138, // Š
  "\u2039": 139, // ‹
  "\u0152": 140, // Œ
  "\u017D": 142, // Ž
  "\u2018": 145, // ‘
  "\u2019": 146, // ’
  "\u201C": 147, // “
  "\u201D": 148, // ”
  "\u2022": 149, // •
  "\u2013": 150, // –
  "\u2014": 151, // —
  "\u02DC": 152, // ˜
  "\u2122": 153, // ™
  "\u0161": 154, // š
  "\u203A": 155, // ›
  "\u0153": 156, // œ
  "\u017E": 158, // ž
  "\u0178": 159, // Ÿ
  "\u00D7": 215, // ×
  "\u00F7": 247, // ÷
  "\u00B1": 177, // ±
  "\u00B0": 176, // °
  "\u00B7": 183, // ·
  "\u00A0": 160, // non-breaking space
  "\u00AB": 171,
  "\u00BB": 187,
  "\u2032": "'", // ′
  "\u2033": '"', // ″
  "\u201B": "'",
  "\u201F": '"',
  "\u2212": "-", // minus sign
  "\u2264": "<=", // ≤
  "\u2265": ">=", // ≥
  "\u2260": "!=", // ≠
  "\u2248": "~=", // ≈
  "\u2192": "->",
  "\u2190": "<-",
  "\u2194": "<->",
  "\u21D2": "=>",
  "\u221E": "inf",
  "\u2211": "sum",
  "\u220F": "prod",
  "\u221A": "sqrt",
  "\u222B": "int",
  "\u2202": "d",
  "\u0394": "Delta", // Δ
  "\u03B1": "alpha",
  "\u03B2": "beta",
  "\u03B3": "gamma",
  "\u03B8": "theta",
  "\u03BB": "lambda",
  "\u03BC": "mu",
  "\u03C0": "pi",
  "\u03C3": "sigma",
  "\u03C9": "omega",
  "\u03A9": "Omega",
  "\uFB01": "fi",
  "\uFB02": "fl",
  "\u2009": " ",
  "\u2002": " ",
  "\u2003": " ",
  "\u2028": " ",
  "\u2029": " ",
  "\u200B": "",
  "\u00AD": "", // soft hyphen: invisible
};

const COMBINING_MARKS = /[\u0300-\u036f]/g;
const ASCII_ONLY = /^[\x20-\x7E]*$/;
const charBytesCache = new Map<string, number[]>();

function asciiBytes(text: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    out.push(code >= 32 && code <= 126 ? code : 63);
  }
  return out;
}

/** WinAnsi bytes for one Unicode code point (fallback ASCII when unmappable). */
function charBytes(ch: string): number[] {
  const cached = charBytesCache.get(ch);
  if (cached) return cached;
  let out: number[];
  const special = WINANSI_SPECIAL[ch];
  if (typeof special === "number") {
    out = [special];
  } else if (typeof special === "string") {
    out = asciiBytes(special);
  } else {
    const cp = ch.codePointAt(0) ?? 63;
    // WinAnsi ranges are identity-mapped, including already-encoded bytes 128-159,
    // so the encoder is idempotent on its own output.
    if (cp >= 32 && cp <= 255) {
      out = [cp];
    } else if (cp === 9) {
      out = [32, 32, 32, 32];
    } else if (cp === 10 || cp === 13) {
      out = [32];
    } else {
      const stripped = ch.normalize("NFD").replace(COMBINING_MARKS, "");
      out = stripped.length > 0 && ASCII_ONLY.test(stripped) ? asciiBytes(stripped) : [63];
    }
  }
  charBytesCache.set(ch, out);
  return out;
}

/** Encode text to WinAnsi bytes (unmappable characters become ASCII fallbacks). */
export function encodeWinAnsi(text: string): Uint8Array {
  const out: number[] = [];
  for (const ch of text) {
    const bytes = charBytes(ch);
    for (const b of bytes) out.push(b);
  }
  return Uint8Array.from(out);
}

function encodeToLatin1(text: string): string {
  let out = "";
  for (const ch of text) {
    const bytes = charBytes(ch);
    for (const b of bytes) out += String.fromCharCode(b);
  }
  return out;
}

/** Measure a string with the same width table used for layout. */
export function measureWidth(text: string, font: PdfFont, size: number): number {
  const table = WIDTHS[font];
  let width = 0;
  for (const ch of text) {
    const bytes = charBytes(ch);
    for (const b of bytes) width += table[b];
  }
  return (width * size) / 1000;
}

/** Escape a PDF literal string: \ ( ) plus octal for control bytes. */
function escapePdfLiteral(latin1: string): string {
  let out = "";
  for (let i = 0; i < latin1.length; i++) {
    const code = latin1.charCodeAt(i);
    if (code === 40) out += "\\(";
    else if (code === 41) out += "\\)";
    else if (code === 92) out += "\\\\";
    else if (code < 32 || code === 127) out += `\\${code.toString(8).padStart(3, "0")}`;
    else out += latin1[i];
  }
  return out;
}

function pdfString(text: string): string {
  return `(${escapePdfLiteral(encodeToLatin1(text))})`;
}

/* ───────────────────────── layout primitives ───────────────────────── */

interface TextDraw {
  op: "text";
  x: number;
  y: number;
  font: PdfFont;
  size: number;
  text: string;
  gray?: number;
}
interface RectDraw {
  op: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  gray: number;
}
interface LineDraw {
  op: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  gray: number;
}
type Draw = TextDraw | RectDraw | LineDraw;

class Pager {
  pages: Draw[][] = [[]];
  y = CONTENT_TOP;

  private get page(): Draw[] {
    return this.pages[this.pages.length - 1];
  }

  add(draw: Draw): void {
    this.page.push(draw);
  }

  newPage(): void {
    this.pages.push([]);
    this.y = CONTENT_TOP;
  }

  /** Start a new page when `height` would not fit above the bottom margin. */
  ensure(height: number): void {
    if (this.y - height < CONTENT_BOTTOM) this.newPage();
  }
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const s = (Math.round(n * 100) / 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return s === "-0" ? "0" : s;
}

function putLine(
  p: Pager,
  text: string,
  font: PdfFont,
  size: number,
  x: number,
  leading: number,
  gray?: number,
): void {
  if (text !== "") {
    p.add({ op: "text", x, y: p.y - size * BASELINE, font, size, text, gray });
  }
  p.y -= leading;
}

function putCentered(
  p: Pager,
  text: string,
  font: PdfFont,
  size: number,
  maxWidth: number,
  leading: number,
  gray?: number,
): void {
  const width = measureWidth(text, font, size);
  const x = MARGIN + Math.max(0, (maxWidth - width) / 2);
  putLine(p, text, font, size, x, leading, gray);
}

/* ───────────────────────── text wrapping ───────────────────────── */

function stripControl(text: string): string {
  return text.replace(/\t/g, "    ").replace(/\r\n|\r/g, "\n");
}

/** Greedy word wrap with hard breaks for words wider than `maxWidth`. */
function wrapLine(text: string, font: PdfFont, size: number, maxWidth: number): string[] {
  const width = Math.max(4, maxWidth);
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (word === "") {
      if (line !== "") line += " ";
      continue;
    }
    const candidate = line === "" ? word : `${line} ${word}`;
    if (measureWidth(candidate, font, size) <= width) {
      line = candidate;
      continue;
    }
    if (line !== "") {
      lines.push(line);
      line = "";
    }
    if (measureWidth(word, font, size) <= width) {
      line = word;
      continue;
    }
    let chunk = "";
    for (const ch of word) {
      if (chunk !== "" && measureWidth(chunk + ch, font, size) > width) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    line = chunk;
  }
  if (line !== "") lines.push(line);
  if (lines.length === 0) lines.push("");
  return lines;
}

/** Wrap prose (whitespace collapsed, explicit newlines honored). */
function wrapParagraph(text: string, font: PdfFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const raw of stripControl(text).split("\n")) {
    const clean = raw.replace(/\s+/g, " ").trim();
    if (clean === "") continue;
    out.push(...wrapLine(clean, font, size, maxWidth));
  }
  return out;
}

/** Wrap code, preserving indentation but breaking over-long tokens. */
function wrapCode(text: string, font: PdfFont, size: number, maxWidth: number): string[] {
  const width = Math.max(4, maxWidth);
  const out: string[] = [];
  for (const raw of stripControl(text).split("\n")) {
    if (raw.trim() === "") {
      out.push("");
      continue;
    }
    let line = "";
    let i = 0;
    while (i < raw.length) {
      let wordEnd = i;
      while (wordEnd < raw.length && raw[wordEnd] !== " ") wordEnd++;
      let gapEnd = wordEnd;
      while (gapEnd < raw.length && raw[gapEnd] === " ") gapEnd++;
      const word = raw.slice(i, gapEnd);
      if (line !== "" && measureWidth(line + word, font, size) > width) {
        out.push(line);
        line = word.trimStart();
      } else {
        line += word;
      }
      while (measureWidth(line, font, size) > width) {
        let cut = "";
        for (const ch of line) {
          if (cut !== "" && measureWidth(cut + ch, font, size) > width) break;
          cut += ch;
        }
        if (cut === "" || cut === line) break;
        out.push(cut);
        line = line.slice(cut.length);
      }
      i = gapEnd;
    }
    if (line !== "") out.push(line);
  }
  if (out.length === 0) out.push("");
  return out;
}

function fitText(text: string, font: PdfFont, size: number, maxWidth: number): string {
  if (measureWidth(text, font, size) <= maxWidth) return text;
  let out = "";
  for (const ch of text) {
    if (measureWidth(out + ch + "…", font, size) > maxWidth) break;
    out += ch;
  }
  return out === "" ? "…" : `${out}…`;
}

/* ───────────────────────── block renderers ───────────────────────── */

const BODY_SIZE = 10.5;
const BODY_LEADING = 15;

const HEADING_SPEC: Record<1 | 2 | 3, { size: number; before: number; after: number; leading: number }> = {
  1: { size: 15, before: 17, after: 7, leading: 19 },
  2: { size: 12.5, before: 14, after: 6, leading: 16 },
  3: { size: 11, before: 12, after: 5, leading: 14 },
};

function addHeading(p: Pager, text: string, level: 1 | 2 | 3): void {
  const clean = String(text ?? "").trim();
  if (clean === "") return;
  const spec = HEADING_SPEC[level];
  const lines = wrapParagraph(clean, "bold", spec.size, CONTENT_W);
  // Keep the heading with at least one body line (never orphan a heading).
  if (p.y - (spec.before + spec.leading + BODY_LEADING) < CONTENT_BOTTOM) p.newPage();
  else p.y -= spec.before;
  for (const line of lines) {
    p.ensure(spec.leading);
    putLine(p, line, "bold", spec.size, MARGIN, spec.leading);
  }
  p.y -= spec.after;
}

function addParagraph(p: Pager, text: string): void {
  for (const line of wrapParagraph(String(text ?? ""), "regular", BODY_SIZE, CONTENT_W)) {
    p.ensure(BODY_LEADING);
    putLine(p, line, "regular", BODY_SIZE, MARGIN, BODY_LEADING);
  }
  p.y -= 3;
}

function addList(p: Pager, block: Extract<PdfBlock, { kind: "list" }>): void {
  const items = (block.items ?? []).map((item) => String(item ?? ""));
  if (items.length === 0) return;
  const size = BODY_SIZE;
  const leading = 14;
  items.forEach((item, index) => {
    const prefix = block.ordered ? `${index + 1}.` : "\u2022";
    const indent = measureWidth(`${prefix} `, "regular", size);
    const lines = wrapParagraph(item, "regular", size, CONTENT_W - indent);
    if (lines.length === 0) lines.push("");
    lines.forEach((line, lineIndex) => {
      p.ensure(leading);
      const baseline = p.y - size * BASELINE;
      if (lineIndex === 0) {
        p.add({ op: "text", x: MARGIN, y: baseline, font: "regular", size, text: prefix });
      }
      if (line !== "") {
        p.add({ op: "text", x: MARGIN + indent, y: baseline, font: "regular", size, text: line });
      }
      p.y -= leading;
    });
    p.y -= 2;
  });
  p.y -= 3;
}

function addFormula(p: Pager, text: string): void {
  const clean = String(text ?? "").trim();
  if (clean === "") return;
  const size = 10;
  const leading = 13.5;
  const lines = wrapCode(clean, "courier", size, CONTENT_W - 36);
  p.y -= 5;
  p.ensure(leading);
  for (const line of lines) {
    p.ensure(leading);
    putCentered(p, line, "courier", size, CONTENT_W - 24, leading);
  }
  p.y -= 7;
}

function addCode(p: Pager, block: Extract<PdfBlock, { kind: "code" }>): void {
  const text = String(block.text ?? "");
  if (text.trim() === "") return;
  const size = 9;
  const leading = 12;
  const padX = 6;
  const lines = wrapCode(text, "courier", size, CONTENT_W - padX * 2);
  p.y -= 3;
  p.ensure(leading);
  for (const line of lines) {
    p.ensure(leading);
    p.add({ op: "rect", x: MARGIN, y: p.y - leading + 2, w: CONTENT_W, h: leading, gray: 0.94 });
    if (line !== "") {
      p.add({
        op: "text",
        x: MARGIN + padX,
        y: p.y - size * BASELINE,
        font: "courier",
        size,
        text: line,
      });
    }
    p.y -= leading;
  }
  p.y -= 6;
}

interface TableRow {
  lines: string[][];
}

function addTable(p: Pager, block: Extract<PdfBlock, { kind: "table" }>): void {
  const head = (block.head ?? []).map((cell) => String(cell ?? ""));
  const rows = (block.rows ?? []).map((row) => (row ?? []).map((cell) => String(cell ?? "")));
  const columns = Math.max(head.length, ...rows.map((row) => row.length), 0);
  if (columns === 0) {
    if (block.caption) addCaption(p, String(block.caption));
    return;
  }

  const size = 9.5;
  const leading = 12;
  const padX = 5;
  const padY = 3;
  const minimum = 34;

  const header = Array.from({ length: columns }, (_, c) => head[c] ?? "");
  const body = rows.map((row) => Array.from({ length: columns }, (_, c) => row[c] ?? ""));

  const natural = Array.from({ length: columns }, (_, c) => {
    let width = measureWidth(header[c], "bold", size);
    for (const row of body) width = Math.max(width, measureWidth(row[c], "regular", size));
    return width + padX * 2;
  });
  const naturalTotal = natural.reduce((a, b) => a + b, 0);
  let widths: number[];
  if (naturalTotal <= CONTENT_W) {
    const extra = (CONTENT_W - naturalTotal) / columns;
    widths = natural.map((w) => w + extra);
  } else {
    widths = natural.map((w) => Math.max(minimum, (w / naturalTotal) * CONTENT_W));
    const total = widths.reduce((a, b) => a + b, 0);
    if (total > CONTENT_W) {
      const scale = CONTENT_W / total;
      widths = widths.map((w) => w * scale);
    }
  }
  const xs: number[] = [];
  let cursor = MARGIN;
  for (const width of widths) {
    xs.push(cursor);
    cursor += width;
  }

  const wrapCell = (value: string, c: number, font: PdfFont) =>
    wrapParagraph(value, font, size, Math.max(8, widths[c] - padX * 2));

  const headerLines = header.map((value, c) => wrapCell(value, c, "bold"));
  const rowData: TableRow[] = body.map((row) => ({
    lines: row.map((value, c) => wrapCell(value, c, "regular")),
  }));

  const headerHeight =
    Math.max(1, ...headerLines.map((lines) => lines.length)) * leading + padY * 2;
  const fullPage = CONTENT_TOP - CONTENT_BOTTOM;
  let needHeader = true;

  const drawRow = (lines: string[][], start: number, take: number, font: PdfFont) => {
    for (let c = 0; c < lines.length; c++) {
      for (let k = start; k < Math.min(start + take, lines[c].length); k++) {
        const text = lines[c][k];
        if (text === "") continue;
        p.add({
          op: "text",
          x: xs[c] + padX,
          y: p.y - padY - size * BASELINE - (k - start) * leading,
          font,
          size,
          text,
        });
      }
    }
    p.y -= take * leading + padY * 2;
    p.add({
      op: "line",
      x1: MARGIN,
      y1: p.y,
      x2: MARGIN + CONTENT_W,
      y2: p.y,
      width: 0.4,
      gray: 0.85,
    });
  };

  const drawHeader = () => {
    drawRow(headerLines, 0, Math.max(1, ...headerLines.map((lines) => lines.length)), "bold");
    p.add({
      op: "line",
      x1: MARGIN,
      y1: p.y,
      x2: MARGIN + CONTENT_W,
      y2: p.y,
      width: 0.9,
      gray: 0.2,
    });
    needHeader = false;
  };

  for (const row of rowData) {
    const lineCount = Math.max(1, ...row.lines.map((lines) => lines.length));
    const rowHeight = lineCount * leading + padY * 2;
    let index = 0;
    while (index < lineCount) {
      if (needHeader) {
        p.ensure(headerHeight + leading);
        drawHeader();
      }
      const available = p.y - CONTENT_BOTTOM;
      if (index === 0 && available < rowHeight && rowHeight <= fullPage) {
        p.newPage();
        needHeader = true;
        continue;
      }
      const take = Math.min(lineCount - index, Math.floor((available - padY * 2) / leading));
      if (take < 1) {
        p.newPage();
        needHeader = true;
        continue;
      }
      drawRow(row.lines, index, take, "regular");
      index += take;
      if (index < lineCount) {
        p.newPage();
        needHeader = true;
      }
    }
  }
  if (needHeader) {
    p.ensure(headerHeight);
    drawHeader();
  }
  p.y -= 5;
  if (block.caption) addCaption(p, String(block.caption));
}

function addCaption(p: Pager, caption: string): void {
  const clean = String(caption ?? "").trim();
  if (clean === "") return;
  for (const line of wrapParagraph(clean, "oblique", 9, CONTENT_W)) {
    p.ensure(12);
    putLine(p, line, "oblique", 9, MARGIN, 12, 0.35);
  }
  p.y -= 2;
}

function formatValue(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function addFigure(p: Pager, block: Extract<PdfBlock, { kind: "figure" }>): void {
  const titleSize = 10.5;
  const labelSize = 9;
  const valueSize = 9;
  const leading = 12.5;
  const barHeight = 9;
  const barGap = 4.5;

  const bars = (block.bars ?? []).map((bar) => {
    const value = typeof bar?.value === "number" && Number.isFinite(bar.value) ? bar.value : 0;
    return { label: String(bar?.label ?? ""), value: Math.max(0, value) };
  });

  const title = String(block.title ?? "").trim();
  if (title !== "") {
    for (const line of wrapParagraph(title, "bold", titleSize, CONTENT_W)) {
      p.ensure(leading);
      putLine(p, line, "bold", titleSize, MARGIN, leading);
    }
    p.y -= 3;
  }

  if (bars.length > 0) {
    const maxValue = bars.reduce((max, bar) => Math.max(max, bar.value), 0) || 1;
    const labelNatural = bars.reduce(
      (max, bar) => Math.max(max, measureWidth(bar.label, "regular", labelSize)),
      0,
    );
    const labelWidth = Math.min(Math.max(56, labelNatural + 8), CONTENT_W * 0.42);
    const valueStrings = bars.map((bar) => formatValue(bar.value));
    const valueWidth =
      valueStrings.reduce((max, value) => Math.max(max, measureWidth(value, "regular", valueSize)), 0) +
      8;
    const maxBarWidth = Math.max(24, CONTENT_W - labelWidth - valueWidth - 8);
    const barX = MARGIN + labelWidth;

    bars.forEach((bar, index) => {
      p.ensure(barHeight + barGap);
      const baseline = p.y - barHeight / 2 + labelSize * 0.35;
      const label = fitText(bar.label, "regular", labelSize, labelWidth - 6);
      if (label !== "") {
        p.add({ op: "text", x: MARGIN, y: baseline, font: "regular", size: labelSize, text: label });
      }
      const width = (bar.value / maxValue) * maxBarWidth;
      if (width > 0.3) {
        p.add({
          op: "rect",
          x: barX,
          y: p.y - barHeight,
          w: width,
          h: barHeight,
          gray: 0.62,
        });
      }
      p.add({
        op: "text",
        x: barX + width + 6,
        y: baseline,
        font: "regular",
        size: valueSize,
        text: valueStrings[index],
        gray: 0.2,
      });
      p.y -= barHeight + barGap;
    });
    p.y -= 2;
  }

  addCaption(p, String(block.caption ?? ""));
  p.y -= 3;
}

function addCallout(p: Pager, text: string): void {
  const size = 10;
  const leading = 13.5;
  const x = MARGIN + 16;
  const width = CONTENT_W - 16;
  const lines = wrapParagraph(String(text ?? ""), "oblique", size, width);
  if (lines.length === 0) return;

  p.y -= 4;
  let segmentTop = p.y;
  let segmentPage = p.pages.length - 1;
  const closeSegment = () => {
    p.pages[segmentPage].push({
      op: "line",
      x1: MARGIN + 6,
      y1: segmentTop,
      x2: MARGIN + 6,
      y2: p.y + 2,
      width: 2.2,
      gray: 0.3,
    });
  };

  for (const line of lines) {
    if (p.y - leading < CONTENT_BOTTOM) {
      closeSegment();
      p.newPage();
      segmentTop = p.y;
      segmentPage = p.pages.length - 1;
    }
    putLine(p, line, "oblique", size, x, leading);
  }
  closeSegment();
  p.y -= 6;
}

function addReferences(p: Pager, references: string[]): void {
  const refs = (references ?? []).map((ref) => String(ref ?? "")).filter((ref) => ref.trim() !== "");
  if (refs.length === 0) return;
  addHeading(p, "References", 2);
  const size = 9.5;
  const leading = 12.5;
  refs.forEach((ref, index) => {
    const prefix = `${index + 1}.`;
    const indent = measureWidth(`${prefix} `, "regular", size);
    const lines = wrapParagraph(ref, "regular", size, CONTENT_W - indent);
    if (lines.length === 0) lines.push("");
    lines.forEach((line, lineIndex) => {
      p.ensure(leading);
      const baseline = p.y - size * BASELINE;
      if (lineIndex === 0) {
        p.add({ op: "text", x: MARGIN, y: baseline, font: "regular", size, text: prefix });
      }
      if (line !== "") {
        p.add({
          op: "text",
          x: MARGIN + indent,
          y: baseline,
          font: "regular",
          size,
          text: line,
        });
      }
      p.y -= leading;
    });
    p.y -= 3;
  });
}

/* ───────────────────────── title block ───────────────────────── */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMetaDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!match) return iso ?? "";
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return iso ?? "";
  return `${MONTHS[month - 1]} ${day}, ${match[1]}`;
}

function addTitleBlock(p: Pager, meta: PdfPaperMeta): void {
  p.y -= 16;

  const title = String(meta?.title ?? "").trim() || "Untitled";
  for (const line of wrapParagraph(title, "bold", 19, CONTENT_W)) {
    p.ensure(23);
    putCentered(p, line, "bold", 19, CONTENT_W, 23);
  }

  const authors = (meta?.authors ?? []).map((author) => String(author ?? "")).filter(Boolean);
  if (authors.length > 0) {
    p.y -= 4;
    for (const line of wrapParagraph(authors.join(", "), "regular", 11, CONTENT_W)) {
      p.ensure(15);
      putCentered(p, line, "regular", 11, CONTENT_W, 15);
    }
  }

  const date = formatMetaDate(String(meta?.date ?? ""));
  const id = String(meta?.id ?? "").trim();
  const metaLine = [date, id].filter(Boolean).join("  \u00B7  ");
  if (metaLine !== "") {
    p.y -= 2;
    p.ensure(13);
    putCentered(p, metaLine, "regular", 9, CONTENT_W, 13, 0.35);
  }

  p.y -= 10;
  const abstract = String(meta?.abstract ?? "").trim();
  if (abstract !== "") {
    const size = 9.5;
    const leading = 13;
    const x = MARGIN + 12;
    const width = CONTENT_W - 24;
    p.ensure(leading + BODY_LEADING);
    putLine(p, "Abstract", "bold", size, x, leading);
    for (const line of wrapParagraph(abstract, "regular", size, width)) {
      p.ensure(leading);
      putLine(p, line, "regular", size, x, leading);
    }
    p.y -= 8;
  }

  const keywords = (meta?.keywords ?? []).map((keyword) => String(keyword ?? "")).filter(Boolean);
  if (keywords.length > 0) {
    const size = 9.5;
    const leading = 13;
    const prefix = "Keywords: ";
    const prefixWidth = measureWidth(prefix, "bold", size);
    const lines = wrapParagraph(keywords.join(", "), "regular", size, CONTENT_W - prefixWidth);
    lines.forEach((line, index) => {
      p.ensure(leading);
      const baseline = p.y - size * BASELINE;
      if (index === 0) {
        p.add({ op: "text", x: MARGIN, y: baseline, font: "bold", size, text: prefix.trimEnd() });
      }
      p.add({ op: "text", x: MARGIN + prefixWidth, y: baseline, font: "regular", size, text: line });
      p.y -= leading;
    });
  }

  p.y -= 8;
  p.ensure(10);
  p.add({
    op: "line",
    x1: MARGIN,
    y1: p.y,
    x2: MARGIN + CONTENT_W,
    y2: p.y,
    width: 0.6,
    gray: 0.7,
  });
  p.y -= 12;
}

/* ───────────────────────── document layout ───────────────────────── */

function layoutDocument(doc: PdfDoc): Draw[][] {
  const p = new Pager();
  const meta = doc?.meta ?? ({} as PdfPaperMeta);
  addTitleBlock(p, meta);
  for (const block of doc?.blocks ?? []) {
    if (!block || typeof block !== "object") continue;
    switch (block.kind) {
      case "heading":
        addHeading(p, block.text, block.level === 2 ? 2 : block.level === 3 ? 3 : 1);
        break;
      case "paragraph":
        addParagraph(p, block.text);
        break;
      case "list":
        addList(p, block);
        break;
      case "formula":
        addFormula(p, block.text);
        break;
      case "code":
        addCode(p, block);
        break;
      case "table":
        addTable(p, block);
        break;
      case "figure":
        addFigure(p, block);
        break;
      case "callout":
        addCallout(p, block.text);
        break;
      default:
        break;
    }
  }
  addReferences(p, doc?.references ?? []);
  return p.pages;
}

/* ───────────────────────── serialization ───────────────────────── */

function textOp(draw: TextDraw): string {
  let out = "";
  if (draw.gray !== undefined && draw.gray > 0) out += `${fmt(draw.gray)} g\n`;
  out += `BT\n/${FONT_REF[draw.font]} ${fmt(draw.size)} Tf\n`;
  out += `1 0 0 1 ${fmt(draw.x)} ${fmt(draw.y)} Tm\n`;
  out += `(${escapePdfLiteral(encodeToLatin1(draw.text))}) Tj\nET\n`;
  if (draw.gray !== undefined && draw.gray > 0) out += "0 g\n";
  return out;
}

function drawOps(draws: Draw[]): string {
  let out = "";
  for (const draw of draws) {
    switch (draw.op) {
      case "text":
        out += textOp(draw);
        break;
      case "rect":
        out += `${fmt(draw.gray)} g\n${fmt(draw.x)} ${fmt(draw.y)} ${fmt(draw.w)} ${fmt(draw.h)} re\nf\n0 g\n`;
        break;
      case "line":
        out += `${fmt(draw.gray)} G\n${fmt(draw.width)} w\n${fmt(draw.x1)} ${fmt(draw.y1)} m ${fmt(draw.x2)} ${fmt(draw.y2)} l\nS\n0 G\n`;
        break;
    }
  }
  return out;
}

function contentStream(draws: Draw[], pageIndex: number, pageCount: number, meta: PdfPaperMeta): string {
  const footer: Draw[] = [
    {
      op: "line",
      x1: MARGIN,
      y1: FOOTER_RULE_Y,
      x2: MARGIN + CONTENT_W,
      y2: FOOTER_RULE_Y,
      width: 0.5,
      gray: 0.82,
    },
  ];
  const id = String(meta?.id ?? "").trim();
  if (id !== "") {
    footer.push({
      op: "text",
      x: MARGIN,
      y: FOOTER_BASELINE,
      font: "regular",
      size: 8,
      text: id,
      gray: 0.45,
    });
  }
  const label = `Page ${pageIndex + 1} of ${pageCount}`;
  footer.push({
    op: "text",
    x: MARGIN + CONTENT_W - measureWidth(label, "regular", 8),
    y: FOOTER_BASELINE,
    font: "regular",
    size: 8,
    text: label,
    gray: 0.45,
  });
  return drawOps([...draws, ...footer]);
}

function buildInfo(meta: PdfPaperMeta): string {
  const parts: string[] = [];
  const title = String(meta?.title ?? "").trim();
  if (title !== "") parts.push(`/Title ${pdfString(title)}`);
  const authors = (meta?.authors ?? []).map((author) => String(author ?? "")).filter(Boolean);
  if (authors.length > 0) parts.push(`/Author ${pdfString(authors.join(", "))}`);
  const keywords = (meta?.keywords ?? []).map((keyword) => String(keyword ?? "")).filter(Boolean);
  if (keywords.length > 0) parts.push(`/Subject ${pdfString(keywords.join(", "))}`);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(meta?.date ?? ""));
  if (match) parts.push(`/CreationDate (D:${match[1]}${match[2]}${match[3]})`);
  parts.push("/Creator (deepforge)");
  parts.push("/Producer (deepforge Inventions PDF engine)");
  return `<< ${parts.join(" ")} >>`;
}

function buildPdf(streams: string[], meta: PdfPaperMeta): Uint8Array {
  const pageCount = streams.length;
  const pageObjectNumbers = streams.map((_, index) => 8 + index * 2);
  const kids = pageObjectNumbers.map((num) => `${num} 0 R`).join(" ");

  const objects: string[] = [
    // 1: catalog
    "<< /Type /Catalog /Pages 2 0 R >>",
    // 2: page tree
    `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> >>`,
  ];
  for (const font of ["regular", "bold", "oblique", "courier"] as PdfFont[]) {
    objects.push(
      `<< /Type /Font /Subtype /Type1 /BaseFont /${FONT_BASE[font]} /Encoding /WinAnsiEncoding >>`,
    );
  }
  // 7: document info
  objects.push(buildInfo(meta));

  streams.forEach((stream, index) => {
    const contentNumber = pageObjectNumbers[index] + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentNumber} 0 R >>`,
    );
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let out = "%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(out.length);
    out += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = out.length;
  out += `xref\n0 ${objects.length + 1}\n`;
  out += "0000000000 65535 f \n";
  for (const offset of offsets) {
    out += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\n`;
  out += `startxref\n${xrefOffset}\n%%EOF\n`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}

export function renderPaperPdf(doc: PdfDoc): Uint8Array {
  const meta = doc?.meta ?? ({} as PdfPaperMeta);
  const pages = layoutDocument(doc ?? { meta, blocks: [], references: [] });
  const streams = pages.map((draws, index) => contentStream(draws, index, pages.length, meta));
  return buildPdf(streams, meta);
}
