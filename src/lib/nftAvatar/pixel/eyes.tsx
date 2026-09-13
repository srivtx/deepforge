import type { Trait } from "../types";

/**
 * Pixel/voxel eyes: 2x2-unit clusters anchored at (40, 46) and (56, 46).
 * All shapes are axis-aligned rect steps on the hidden 48x48 grid; the
 * cyclops variant collapses to the face center (48, 46).
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

/** Mirror one eye recipe across both anchors. */
function pair(fn: (x: number) => Block[]): Block[] {
  return [40, 56].flatMap(fn);
}

export const PIXEL_EYE_TRAITS: Trait[] = [
  {
    id: "steady-gaze",
    name: "Steady Gaze",
    weight: 13,
    render: (p) => (
      <Blocks
        blocks={pair((x) => [
          [x - 5, 41, 10, 10, p.ink],
          [x - 3, 43, 6, 6, mix(p.light, p.ink, 0.15)],
          [x - 1, 45, 2, 2, p.ink],
          [x - 3, 43, 2, 2, p.light],
        ])}
      />
    ),
  },
  {
    id: "tired-lines",
    name: "Tired Lines",
    weight: 11,
    render: (p) => (
      <Blocks
        blocks={pair((x) => [
          [x - 5, 43, 10, 2, p.ink],
          [x - 5, 49, 10, 2, p.ink],
          [x - 3, 45, 6, 4, mix(p.light, p.ink, 0.2)],
          [x - 1, 46, 2, 2, p.ink],
          [x - 5, 51, 10, 2, mix(p.accent, p.ink, 0.55)],
        ])}
      />
    ),
  },
  {
    id: "angry-v",
    name: "Angry V",
    weight: 10,
    render: (p) => (
      <Blocks
        blocks={pair((x) => {
          const dir = x < 48 ? 1 : -1;
          const brow = x < 48 ? x - 5 : x + 1;
          return [
            [x - 4, 45, 8, 4, mix(p.light, p.ink, 0.2)],
            [x - 1, 46, 2, 2, p.ink],
            [brow, 40, 4, 2, p.ink],
            [brow + 4 * dir, 42, 4, 2, p.ink],
            [brow + 6 * dir, 44, 2, 2, p.ink],
            [x - 1, 49, 2, 2, mix(p.accent, p.ink, 0.6)],
          ];
        })}
      />
    ),
  },
  {
    id: "pixel-sades",
    name: "Pixel Shades",
    weight: 7,
    render: (p) => (
      <Blocks
        blocks={[
          [26, 43, 8, 2, p.ink],
          [62, 43, 8, 2, p.ink],
          ...pair((x) => [
            [x - 4, 43, 8, 4, p.ink],
            [x - 3, 43, 2, 2, mix(p.light, p.ink, 0.3)],
          ]),
          [44, 43, 8, 4, p.ink],
        ]}
      />
    ),
  },
  {
    id: "lantern-glow",
    name: "Lantern Glow",
    weight: 6,
    render: (p) => (
      <Blocks
        blocks={pair((x) => [
          [x - 5, 39, 10, 2, mix(p.accent, p.ink, 0.6)],
          [x - 5, 41, 10, 10, p.ink],
          [x - 3, 43, 6, 6, p.accent],
          [x - 1, 45, 2, 2, p.light],
          [x - 5, 51, 10, 2, mix(p.accent, p.ink, 0.6)],
          [x - 7, 43, 2, 2, mix(p.accent, p.ink, 0.75)],
          [x + 5, 45, 2, 2, mix(p.accent, p.ink, 0.75)],
        ])}
      />
    ),
  },
  {
    id: "lone-cyclops",
    name: "Lone Cyclops",
    weight: 5,
    render: (p) => (
      <Blocks
        blocks={[
          [36, 34, 24, 2, mix(p.ink, p.accent, 0.25)],
          [38, 38, 20, 16, p.ink],
          [40, 40, 16, 12, mix(p.light, p.ink, 0.12)],
          [44, 42, 8, 8, p.accent],
          [46, 44, 4, 4, p.ink],
          [44, 42, 2, 2, p.light],
          [38, 52, 20, 2, mix(p.ink, p.accent, 0.25)],
          [38, 36, 4, 2, p.ink],
          [54, 36, 4, 2, p.ink],
        ]}
      />
    ),
  },
  {
    id: "heart-eyes",
    name: "Heart Eyes",
    weight: 3,
    render: (p) => (
      <Blocks
        blocks={pair((x) => [
          [x - 3, 40, 2, 2, p.accent],
          [x + 1, 40, 2, 2, p.accent],
          [x - 4, 42, 8, 2, p.accent],
          [x - 2, 44, 4, 2, p.accent],
          [x - 1, 46, 2, 2, p.accent],
          [x - 3, 40, 2, 2, p.light],
          [x - 2, 44, 2, 2, mix(p.accent, p.ink, 0.5)],
        ])}
      />
    ),
  },
  {
    id: "knocked-out",
    name: "Knocked Out",
    weight: 2,
    render: (p) => (
      <Blocks
        blocks={pair((x) => [
          [x - 4, 42, 2, 2, p.ink],
          [x - 2, 44, 2, 2, p.ink],
          [x, 46, 2, 2, p.ink],
          [x + 2, 48, 2, 2, p.ink],
          [x + 2, 42, 2, 2, p.ink],
          [x, 44, 2, 2, p.ink],
          [x - 2, 46, 2, 2, p.ink],
          [x - 4, 48, 2, 2, p.ink],
        ])}
      />
    ),
  },
];
