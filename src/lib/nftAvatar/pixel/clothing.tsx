import type { Trait } from "../types";

/**
 * Pixel/voxel clothing: blocky shoulders rise to y = 78 and fill the full
 * canvas width by the bottom edge. Hidden 48x48 grid — even rects only,
 * 2-unit ink silhouettes, flat highlight/mid/shadow tones per material.
 */
type Block = [x: number, y: number, w: number, h: number, c: string];
type Cell = readonly [x: number, y: number, w: number, h: number];

/** Paint one flat tone across a list of 2-unit-aligned cells. */
function paint(color: string, cells: readonly Cell[]): Block[] {
  return cells.map<Block>(([x, y, w, h]) => [x, y, w, h, color]);
}

/** Expand a cluster by 2 units per side so the fills keep an ink outline. */
function rim(blocks: Block[], ink: string): Block[] {
  return blocks.map<Block>(([x, y, w, h]) => [x - 2, y - 2, w + 4, h + 4, ink]);
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

/** Shared stepped shoulder silhouette: y = 78 down to the bottom edge. */
const SHOULDERS: Cell[] = [
  [30, 78, 36, 6],
  [20, 84, 56, 4],
  [8, 88, 80, 4],
  [0, 92, 96, 4],
];

export const PIXEL_CLOTHING_TRAITS: Trait[] = [
  {
    id: "block-tee",
    name: "Block Tee",
    weight: 14,
    render: (p, uid) => {
      const base = paint(p.accent, SHOULDERS);
      return (
        <g id={`px-cl-block-tee-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [30, 78, 36, 4],
                [8, 88, 12, 4],
                [0, 92, 96, 4],
              ]),
              ...paint(p.bg[1], [
                [30, 82, 36, 2],
                [76, 88, 12, 4],
                [56, 84, 2, 2],
                [60, 86, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [28, 84, 4, 8],
                [64, 84, 4, 8],
                [16, 94, 2, 2],
                [48, 94, 2, 2],
                [80, 94, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "pixel-hoodie",
    name: "Pixel Hoodie",
    weight: 12,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, SHOULDERS),
        ...paint(p.accent, [
          [22, 18, 52, 8],
          [14, 26, 12, 58],
          [70, 26, 12, 58],
        ]),
      ];
      return (
        <g id={`px-cl-hoodie-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.bg[1], [
                [20, 28, 4, 52],
                [72, 28, 4, 52],
                [58, 84, 2, 2],
                [62, 86, 2, 2],
                [8, 90, 12, 2],
                [76, 90, 12, 2],
                [0, 92, 96, 4],
              ]),
              ...paint(p.ink, [
                [0, 90, 96, 2],
                [34, 88, 28, 2],
                [34, 88, 2, 8],
                [60, 88, 2, 8],
                [36, 78, 6, 12],
                [54, 78, 6, 12],
              ]),
              ...paint(p.light, [
                [24, 18, 48, 2],
                [30, 78, 36, 4],
                [8, 88, 12, 2],
                [76, 88, 12, 2],
                [12, 94, 2, 2],
                [28, 94, 2, 2],
                [44, 94, 2, 2],
                [60, 94, 2, 2],
                [76, 94, 2, 2],
                [38, 80, 2, 8],
                [56, 80, 2, 8],
              ]),
              ...paint(p.bg[0], [
                [30, 82, 36, 2],
                [38, 86, 2, 2],
                [56, 86, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "steel-cuirass",
    name: "Steel Cuirass",
    weight: 7,
    render: (p, uid) => {
      const base = paint(p.bg[1], [
        [24, 76, 48, 8],
        [16, 84, 64, 4],
        [6, 88, 84, 4],
        [0, 92, 96, 4],
        [2, 72, 22, 12],
        [72, 72, 22, 12],
      ]);
      return (
        <g id={`px-cl-cuirass-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.bg[0], [
                [90, 74, 4, 8],
                [58, 78, 2, 2],
                [62, 80, 2, 2],
                [66, 84, 2, 2],
                [70, 88, 2, 2],
                [16, 86, 64, 2],
                [0, 90, 96, 2],
              ]),
              ...paint(p.ink, [
                [24, 82, 48, 2],
                [46, 84, 4, 12],
              ]),
              ...paint(p.light, [
                [2, 72, 20, 2],
                [72, 72, 20, 2],
                [24, 76, 16, 2],
                [56, 76, 16, 2],
                [2, 74, 4, 8],
                [16, 84, 60, 2],
                [6, 88, 76, 2],
                [42, 88, 12, 6],
              ]),
              ...paint(p.bg[0], [[46, 90, 4, 2]]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "dark-plating",
    name: "Dark Plating",
    weight: 3,
    render: (p, uid) => {
      const base = paint(p.bg[1], [
        [30, 72, 36, 8],
        [24, 80, 48, 8],
        [16, 88, 64, 4],
        [0, 92, 96, 4],
        [2, 74, 22, 12],
        [72, 74, 22, 12],
      ]);
      return (
        <g id={`px-cl-dark-plate-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [30, 72, 36, 2],
                [2, 74, 20, 2],
                [72, 74, 20, 2],
                [4, 80, 2, 6],
                [90, 80, 2, 6],
              ]),
              ...paint(p.accent, [
                [24, 80, 48, 2],
                [32, 74, 2, 2],
                [62, 74, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [90, 76, 4, 8],
                [28, 84, 2, 2],
                [52, 84, 2, 2],
                [56, 86, 2, 2],
                [64, 84, 2, 2],
                [16, 90, 64, 2],
              ]),
              ...paint(p.ink, [[38, 86, 20, 10]]),
              ...paint(p.accent, [[40, 88, 16, 6]]),
              ...paint(p.bg[0], [[40, 94, 16, 2]]),
              ...paint(p.light, [[44, 90, 8, 2]]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "runed-robe",
    name: "Runed Robe",
    weight: 5,
    render: (p, uid) => {
      const base = paint(p.bg[1], [
        [28, 74, 40, 10],
        [20, 84, 56, 4],
        [10, 88, 76, 4],
        [0, 92, 96, 4],
      ]);
      return (
        <g id={`px-cl-robe-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.accent, [
                [28, 74, 40, 4],
                [0, 92, 96, 4],
                [40, 88, 6, 8],
                [50, 88, 6, 8],
              ]),
              ...paint(p.bg[0], [
                [28, 78, 40, 2],
                [20, 86, 2, 2],
                [74, 86, 2, 2],
              ]),
              ...paint(p.light, [
                [28, 74, 40, 2],
                [0, 92, 96, 2],
                [24, 86, 2, 2],
                [28, 90, 2, 2],
                [66, 86, 2, 2],
                [70, 90, 2, 2],
                [16, 90, 2, 2],
                [78, 90, 2, 2],
              ]),
              ...paint(p.ink, [[46, 88, 4, 8]]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "diamond-jersey",
    name: "Diamond Jersey",
    weight: 10,
    render: (p, uid) => {
      const base = paint(p.light, SHOULDERS);
      return (
        <g id={`px-cl-jersey-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.accent, [
                [30, 78, 36, 4],
                [8, 88, 12, 4],
                [76, 88, 12, 4],
                [0, 92, 96, 2],
                [24, 86, 2, 2],
                [40, 86, 2, 2],
                [56, 86, 2, 2],
                [72, 86, 2, 2],
                [24, 90, 2, 2],
                [32, 90, 2, 2],
                [64, 90, 2, 2],
                [72, 90, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [30, 82, 36, 2],
                [0, 94, 96, 2],
                [38, 88, 20, 4],
                [52, 92, 4, 4],
              ]),
              ...paint(p.accent, [
                [16, 94, 2, 2],
                [32, 94, 2, 2],
                [64, 94, 2, 2],
                [80, 94, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
];
