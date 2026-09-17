import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS = readFileSync(join(ROOT, "src", "app", "globals.css"), "utf8");
const MOTION_DIR = join(ROOT, "src", "components", "motion");

type Rgb = [number, number, number];

function extractBlocks(marker: string): string[] {
  const blocks: string[] = [];
  let searchFrom = 0;
  while (searchFrom < CSS.length) {
    const start = CSS.indexOf(marker, searchFrom);
    if (start === -1) break;
    const open = CSS.indexOf("{", start);
    let depth = 0;
    let end = -1;
    for (let i = open; i < CSS.length; i += 1) {
      if (CSS[i] === "{") depth += 1;
      else if (CSS[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (open === -1 || end === -1) throw new Error(`unbalanced CSS block after ${marker}`);
    blocks.push(CSS.slice(open + 1, end));
    searchFrom = end + 1;
  }
  return blocks;
}

function oneBlock(marker: string): string {
  const blocks = extractBlocks(marker);
  if (blocks.length !== 1) {
    throw new Error(`expected exactly one CSS block for ${marker}, found ${blocks.length}`);
  }
  return blocks[0];
}

function parseVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const pattern = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match = pattern.exec(block);
  while (match) {
    vars[match[1]] = match[2].trim();
    match = pattern.exec(block);
  }
  return vars;
}

function hexToRgb(hex: string): Rgb {
  const raw = hex.trim().replace("#", "");
  const full = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`unsupported colour value: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const [hi, lo] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  );
  return (hi + 0.05) / (lo + 0.05);
}

const THEMES = [
  ["dark", parseVars(oneBlock(":root.dark"))],
  ["light", parseVars(oneBlock(":root.light"))],
] as const;

const CANONICAL_PAIRS: Array<[string, string]> = [
  ["ink", "canvas"],
  ["body", "canvas"],
  ["body-mid", "canvas"],
  ["accent", "canvas"],
  ["ink", "canvas-card"],
  ["body-mid", "canvas-card"],
];

const TEXT_TOKENS = ["ink", "body", "body-mid", "mute", "accent", "warning", "error", "info"];
const LARGE_TEXT_TOKENS = ["success"];
const SURFACES = ["canvas", "canvas-card", "canvas-soft"];

const MOTION_API = /requestAnimationFrame|IntersectionObserver|setInterval|animation|transition/;
const MOTION_HANDLING = /prefers-reduced-motion|useReducedMotion/;

describe("a11y: globals.css theme tokens", () => {
  test("parses both theme blocks", () => {
    for (const [theme, vars] of THEMES) {
      expect(vars["canvas"], `${theme} --canvas`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(vars["canvas-card"], `${theme} --canvas-card`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(vars["ink"], `${theme} --ink`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(vars["accent"], `${theme} --accent`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test("anchors the documented canvas colours", () => {
    expect(THEMES[0][1]["canvas"].toLowerCase()).toBe("#0a0a0a");
    expect(THEMES[1][1]["canvas"].toLowerCase()).toBe("#ffffff");
    expect(THEMES[1][1]["canvas-card"].toLowerCase()).toBe("#f8f8f8");
  });
});

describe("a11y: WCAG 2.1 contrast", () => {
  for (const [theme, vars] of THEMES) {
    test(`${theme}: canonical text pairs reach AA (>= 4.5:1)`, () => {
      for (const [foreground, background] of CANONICAL_PAIRS) {
        const ratio = contrastRatio(vars[foreground], vars[background]);
        expect(
          ratio,
          `${theme} --${foreground} on --${background} = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });

    test(`${theme}: every text token reaches AA on every surface`, () => {
      for (const token of TEXT_TOKENS) {
        for (const surface of SURFACES) {
          const ratio = contrastRatio(vars[token], vars[surface]);
          expect(
            ratio,
            `${theme} --${token} on --${surface} = ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    test(`${theme}: large-text-only tokens reach 3:1`, () => {
      for (const token of LARGE_TEXT_TOKENS) {
        for (const surface of SURFACES) {
          const ratio = contrastRatio(vars[token], vars[surface]);
          expect(
            ratio,
            `${theme} --${token} on --${surface} = ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(3);
        }
      }
    });
  }
});

describe("a11y: reduced motion", () => {
  const motionFiles = readdirSync(MOTION_DIR).filter(
    (name) => name.endsWith(".ts") || name.endsWith(".tsx"),
  );

  test("motion directory is present", () => {
    expect(motionFiles.length).toBeGreaterThan(0);
  });

  for (const file of motionFiles) {
    test(`${file} handles reduced motion when it animates`, () => {
      const source = readFileSync(join(MOTION_DIR, file), "utf8");
      if (!MOTION_API.test(source)) return;
      expect(MOTION_HANDLING.test(source), `${file} animates without a reduced-motion guard`).toBe(
        true,
      );
    });
  }

  test("globals.css neutralizes CSS-driven motion under reduced motion", () => {
    const blocks = extractBlocks("@media (prefers-reduced-motion: reduce)");
    expect(blocks.length).toBeGreaterThan(0);
    const combined = blocks.join("\n");
    expect(combined).toContain("*::after");
    expect(combined).toContain("animation-duration");
    expect(combined).toContain("transition-duration");
  });
});
