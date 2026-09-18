import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KERNEL_WGSL } from "@/lib/reprogpu/kernels";
import { wgslSha256 } from "@/lib/reprogpu/hashes";
import { EXPECTED_HASHES, EXPECTED_WGSL } from "@/lib/reprogpu/expected";
import type { KernelId } from "@/lib/reprogpu/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPROGPU_DIR = join(ROOT, "src", "lib", "reprogpu");
const PAGE_PATH = join(ROOT, "src", "app", "reprogpu", "page.tsx");

const INTEGER_IDS: readonly KernelId[] = ["K1", "K2", "K3", "K4"];
const ALL_IDS: readonly KernelId[] = ["K1", "K2", "K3", "K4", "K5"];

/** Canary/status strings copied from scripts/verify-reprogpu.ts. */
const CANARIES: Readonly<Record<string, string>> = {
  K1: "output[11] = wcounts[0];",
  K2: "output[0] = 65536u;",
  K3: "output[65536] = 65536u;",
  K4: "output[0] = 16385u;",
};

const FORBIDDEN = ["f32", "f16", "atomic", "discard", "bitcast<f32"] as const;

/* ────────────────────────── WGSL source integrity ───────────────────────── */

describe("reprogpu WGSL purity", () => {
  test("every KERNEL_WGSL entry is a non-empty source", () => {
    for (const id of ALL_IDS) {
      expect(typeof KERNEL_WGSL[id]).toBe("string");
      expect(KERNEL_WGSL[id].length).toBeGreaterThan(200);
    }
  });

  test("K1-K4 contain no float/atomic/discard/float-bitcast tokens", () => {
    for (const id of INTEGER_IDS) {
      for (const token of FORBIDDEN) {
        expect(KERNEL_WGSL[id]).not.toContain(token);
      }
    }
  });

  test("K5 is the positive control and does contain f32", () => {
    expect(KERNEL_WGSL.K5).toContain("f32");
  });

  test("K1-K4 each carry their status canary from the gate", () => {
    for (const id of INTEGER_IDS) {
      expect(KERNEL_WGSL[id]).toContain(CANARIES[id]);
    }
  });

  test("WGSL source hashes equal EXPECTED_WGSL for all five kernels", () => {
    for (const id of ALL_IDS) {
      expect(wgslSha256(KERNEL_WGSL[id])).toBe(EXPECTED_WGSL[id]);
    }
  });

  test("K1 uses a masked runtime shift count", () => {
    expect(KERNEL_WGSL.K1).toContain("& 31u");
  });
});

/* ───────────────────────────── purity scan ──────────────────────────────── */

const ENGINE_FILES = readdirSync(REPROGPU_DIR).filter((name) =>
  name.endsWith(".ts"),
);

const ENGINE_SOURCES = ENGINE_FILES.map((name) => ({
  name,
  source: readFileSync(join(REPROGPU_DIR, name), "utf8"),
}));

/**
 * The pure computational engine files: no `node:` import, no app import, no
 * clock and no randomness. `harness.ts` is the browser-only WebGPU facade and
 * is deliberately not on this list (it timestamps records with `Date`, per the
 * manifest spec, and reads `navigator`/`crypto.subtle`); it must never be
 * imported by a pure module. `sha256.ts` is included, with the additional
 * rule that it must use our own SHA-256 rather than `node:crypto`.
 */
const PURE_FILES = [
  "expected.ts",
  "gemm.ts",
  "hashes.ts",
  "kernels.ts",
  "philox.ts",
  "sha256.ts",
  "sum320.ts",
  "types.ts",
  "vectors.ts",
] as const;

const PURE_SOURCES = ENGINE_SOURCES.filter((file) =>
  (PURE_FILES as readonly string[]).includes(file.name),
);

describe("reprogpu engine purity scan", () => {
  test("scans exactly the pure engine files (the scan is not vacuous)", () => {
    expect(PURE_SOURCES.map((file) => file.name).sort()).toEqual(
      [...PURE_FILES].sort(),
    );
    for (const file of PURE_SOURCES) {
      expect(file.source.length).toBeGreaterThan(50);
    }
  });

  test("no pure engine file imports node: or uses clocks/randomness/network/process", () => {
    const forbidden = [
      'from "node:',
      "from 'node:",
      "require(",
      "Date.now(",
      "new Date(",
      "Math.random(",
      "fetch(",
      "process.",
    ] as const;
    expect(ENGINE_FILES.length).toBeGreaterThanOrEqual(8);
    for (const file of PURE_SOURCES) {
      for (const token of forbidden) {
        expect(file.source).not.toContain(token);
      }
    }
  });

  test("sha256.ts is self-contained and does not borrow node:crypto", () => {
    const sha = PURE_SOURCES.find((file) => file.name === "sha256.ts");
    expect(sha !== undefined).toBe(true);
    expect(sha!.source).not.toContain("node:crypto");
    expect(sha!.source).not.toContain("node:");
    expect(sha!.source).not.toContain("require(");
  });
});

/* ───────────────────────────── barrel discipline ────────────────────────── */

describe("reprogpu barrel discipline", () => {
  test("there is no index.ts barrel under src/lib/reprogpu", () => {
    expect(ENGINE_FILES).not.toContain("index.ts");
  });

  test("EXPECTED_HASHES.hashes.K5 is undefined (K5 has no pass criterion)", () => {
    expect(EXPECTED_HASHES.hashes.K5).toBeUndefined();
    for (const id of INTEGER_IDS) {
      expect(typeof EXPECTED_HASHES.hashes[id]).toBe("string");
    }
  });
});

/* ─────────────────────── harness must not be statically imported ────────── */

describe("reprogpu harness isolation", () => {
  test("page.tsx does not import the harness at top level", () => {
    const page = readFileSync(PAGE_PATH, "utf8");
    expect(page).not.toContain('from "@/lib/reprogpu/harness"');
    expect(page).not.toContain("from '@/lib/reprogpu/harness'");
  });

  test("the lab component imports the harness dynamically, not statically", () => {
    const lab = readFileSync(
      join(ROOT, "src", "components", "reprogpu", "ReproGpuLab.tsx"),
      "utf8",
    );
    expect(lab).toContain("await import(\"@/lib/reprogpu/harness\")");
  });
});
