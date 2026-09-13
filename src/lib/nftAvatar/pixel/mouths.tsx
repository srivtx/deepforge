import type { Trait } from "../types";

/**
 * Pixel/voxel mouths: centered on (48, 62). Flat 2-unit rect steps only —
 * single lines, stair-stepped curves, 2x2-block fangs and pixel masks.
 */
type Block = [x: number, y: number, w: number, h: number, c: string];

/** Blend two #rrggbb literals into flat pixel tones. */
function mix(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((x >> shift) & 255) * (1 - t) + ((y >> shift) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
    </>
  );
}

export const PIXEL_MOUTH_TRAITS: Trait[] = [
  {
    id: "flat-line",
    name: "Flat Line",
    weight: 14,
    render: (p) => (
      <Blocks
        blocks={[
          [44, 61, 8, 2, p.ink],
          [44, 63, 8, 2, mix(p.ink, p.accent, 0.18)],
          [40, 61, 2, 2, p.ink],
          [54, 61, 2, 2, p.ink],
        ]}
      />
    ),
  },
  {
    id: "step-smile",
    name: "Step Smile",
    weight: 13,
    render: (p) => (
      <Blocks
        blocks={[
          [40, 61, 4, 2, p.ink],
          [44, 63, 8, 2, p.ink],
          [52, 61, 4, 2, p.ink],
          [38, 59, 2, 2, p.ink],
          [56, 59, 2, 2, p.ink],
          [44, 65, 8, 2, mix(p.ink, p.accent, 0.25)],
        ]}
      />
    ),
  },
  {
    id: "step-frown",
    name: "Step Frown",
    weight: 12,
    render: (p) => (
      <Blocks
        blocks={[
          [40, 63, 4, 2, p.ink],
          [44, 61, 8, 2, p.ink],
          [52, 63, 4, 2, p.ink],
          [38, 65, 2, 2, p.ink],
          [56, 65, 2, 2, p.ink],
          [44, 59, 8, 2, mix(p.ink, p.accent, 0.25)],
        ]}
      />
    ),
  },
  {
    id: "single-fang",
    name: "Single Fang",
    weight: 10,
    render: (p) => (
      <Blocks
        blocks={[
          [44, 61, 8, 8, p.ink],
          [46, 63, 4, 4, mix(p.light, p.accent, 0.15)],
          [46, 63, 2, 2, p.light],
          [42, 61, 12, 2, p.ink],
          [46, 67, 4, 2, mix(p.ink, p.accent, 0.2)],
        ]}
      />
    ),
  },
  {
    id: "open-square",
    name: "Open Square",
    weight: 6,
    render: (p) => (
      <Blocks
        blocks={[
          [42, 58, 12, 12, p.ink],
          [44, 60, 8, 8, mix(p.ink, p.accent, 0.22)],
          [44, 60, 2, 2, mix(p.light, p.ink, 0.2)],
          [50, 60, 2, 2, mix(p.light, p.ink, 0.2)],
          [46, 66, 4, 2, mix(p.accent, p.ink, 0.35)],
        ]}
      />
    ),
  },
  {
    id: "beard-row",
    name: "Beard Row",
    weight: 5,
    render: (p) => {
      const deep = mix(p.ink, p.accent, 0.3);
      const dark = mix(p.ink, p.accent, 0.14);
      return (
        <Blocks
          blocks={[
            [36, 58, 24, 2, deep],
            [44, 60, 8, 2, p.ink],
            [36, 62, 4, 6, deep],
            [40, 62, 4, 4, dark],
            [44, 62, 4, 8, deep],
            [48, 62, 4, 4, dark],
            [52, 62, 4, 8, deep],
            [56, 62, 4, 4, dark],
            [60, 62, 4, 6, deep],
            [32, 64, 4, 2, dark],
            [60, 68, 4, 2, dark],
          ]}
        />
      );
    },
  },
  {
    id: "tongue-out",
    name: "Tongue Out",
    weight: 3,
    render: (p) => (
      <Blocks
        blocks={[
          [42, 59, 12, 8, p.ink],
          [44, 61, 8, 4, mix(p.ink, p.accent, 0.25)],
          [46, 61, 4, 4, p.accent],
          [46, 61, 2, 2, mix(p.accent, p.light, 0.5)],
          [46, 65, 4, 2, mix(p.accent, p.ink, 0.35)],
        ]}
      />
    ),
  },
  {
    id: "mask-band",
    name: "Mask Band",
    weight: 2,
    render: (p) => {
      const cloth = mix(p.ink, p.accent, 0.32);
      const fold = mix(p.ink, p.accent, 0.18);
      return (
        <Blocks
          blocks={[
            [28, 42, 4, 16, p.ink],
            [64, 42, 4, 16, p.ink],
            [28, 44, 4, 2, cloth],
            [64, 44, 4, 2, cloth],
            [26, 56, 44, 8, p.ink],
            [28, 58, 40, 4, cloth],
            [32, 58, 2, 4, fold],
            [44, 58, 2, 4, fold],
            [56, 58, 2, 4, fold],
            [28, 62, 40, 2, fold],
          ]}
        />
      );
    },
  },
];
