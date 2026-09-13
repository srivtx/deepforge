import type { Trait } from "../types";

/**
 * Pixel/voxel extras: the free top layer. Flat 48x48-grid rect clusters —
 * sparkle crosses, chunky hearts, XP orbs, block smoke, a stair-stepped bolt
 * and floating stars, each with a 2-unit ink silhouette and flat tones.
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

/** Four-point sparkle arms around a center (cx, cy). */
function sparkleCells(cx: number, cy: number): Cell[] {
  return [
    [cx - 2, cy - 8, 4, 6],
    [cx - 2, cy + 2, 4, 6],
    [cx - 8, cy - 2, 6, 4],
    [cx + 2, cy - 2, 6, 4],
  ];
}

/** Sparkle cores, kept separate so they read as the bright center. */
function sparkleCores(cx: number, cy: number): Cell[] {
  return [[cx - 2, cy - 2, 4, 4]];
}

/** Rounded 2-step puff of size 12 or 10. */
function puffCells(x: number, y: number, size: 10 | 12): Cell[] {
  if (size === 10) {
    return [
      [x + 2, y, 6, 2],
      [x, y + 2, 10, 6],
      [x + 2, y + 8, 6, 2],
    ];
  }
  return [
    [x + 2, y, 8, 2],
    [x, y + 2, 12, 8],
    [x + 2, y + 10, 8, 2],
  ];
}

/** Chunky 10x10 orb shell. */
function orbCells(x: number, y: number): Cell[] {
  return [
    [x + 2, y, 6, 2],
    [x, y + 2, 10, 6],
    [x + 2, y + 8, 6, 2],
  ];
}

/** 14x12 pixel heart: two lobes, stepped taper, single bottom point. */
function heartCells(x: number, y: number): Cell[] {
  return [
    [x + 2, y, 4, 2],
    [x + 8, y, 4, 2],
    [x, y + 2, 14, 2],
    [x, y + 4, 14, 2],
    [x + 2, y + 6, 10, 2],
    [x + 4, y + 8, 6, 2],
    [x + 6, y + 10, 2, 2],
  ];
}

/** 14x12 five-point star with split legs. */
function starCells(x: number, y: number): Cell[] {
  return [
    [x + 6, y, 2, 2],
    [x + 4, y + 2, 6, 2],
    [x, y + 4, 14, 2],
    [x + 2, y + 6, 10, 2],
    [x + 4, y + 8, 6, 2],
    [x + 2, y + 10, 2, 2],
    [x + 4, y + 10, 2, 2],
    [x + 8, y + 10, 2, 2],
    [x + 10, y + 10, 2, 2],
  ];
}

/** 10x10 companion star. */
function tinyStarCells(x: number, y: number): Cell[] {
  return [
    [x + 4, y, 2, 2],
    [x + 2, y + 2, 6, 2],
    [x, y + 4, 10, 2],
    [x + 2, y + 6, 6, 2],
    [x + 2, y + 8, 2, 2],
    [x + 6, y + 8, 2, 2],
  ];
}

export const PIXEL_EXTRA_TRAITS: Trait[] = [
  {
    id: "pixel-sparkles",
    name: "Pixel Sparkles",
    weight: 12,
    render: (p, uid) => {
      const base = paint(p.accent, [
        ...sparkleCells(14, 20),
        ...sparkleCells(82, 30),
        ...sparkleCells(70, 8),
      ]);
      return (
        <g id={`px-ex-sparkles-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                ...sparkleCores(14, 20),
                ...sparkleCores(82, 30),
                ...sparkleCores(70, 8),
                [28, 34, 2, 2],
                [86, 14, 2, 2],
              ]),
              ...paint(p.bg[1], [
                [12, 14, 2, 2],
                [82, 36, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "pixel-hearts",
    name: "Pixel Hearts",
    weight: 10,
    render: (p, uid) => {
      const base = paint(p.accent, [
        ...heartCells(8, 14),
        ...heartCells(78, 62),
      ]);
      return (
        <g id={`px-ex-hearts-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [10, 14, 4, 2],
                [8, 16, 2, 2],
                [80, 62, 4, 2],
                [78, 64, 2, 2],
                [28, 10, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [18, 18, 4, 2],
                [16, 20, 4, 2],
                [14, 22, 4, 2],
                [88, 66, 4, 2],
                [86, 68, 4, 2],
                [84, 70, 4, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "xp-orbs",
    name: "XP Orbs",
    weight: 10,
    render: (p, uid) => {
      const base = paint(p.accent, [
        ...orbCells(4, 38),
        ...orbCells(84, 6),
        ...orbCells(76, 80),
      ]);
      return (
        <g id={`px-ex-orbs-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [6, 40, 4, 4],
                [86, 8, 4, 4],
                [78, 82, 4, 4],
                [18, 34, 2, 2],
                [20, 30, 2, 2],
              ]),
              ...paint(p.bg[1], [
                [10, 46, 2, 2],
                [90, 12, 2, 2],
                [82, 86, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [4, 44, 2, 2],
                [12, 40, 2, 2],
                [92, 8, 2, 2],
                [86, 14, 2, 2],
                [84, 84, 2, 2],
                [78, 88, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "block-smoke",
    name: "Block Smoke",
    weight: 7,
    render: (p, uid) => {
      const base = paint(p.bg[1], [
        ...puffCells(6, 84, 12),
        ...puffCells(18, 72, 12),
        ...puffCells(4, 60, 10),
      ]);
      return (
        <g id={`px-ex-smoke-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [8, 84, 8, 2],
                [6, 86, 2, 6],
                [20, 72, 8, 2],
                [18, 74, 2, 6],
                [6, 60, 6, 2],
                [4, 62, 2, 4],
              ]),
              ...paint(p.bg[0], [
                [8, 94, 8, 2],
                [20, 82, 8, 2],
                [6, 68, 6, 2],
                [14, 88, 2, 2],
                [28, 78, 2, 2],
                [12, 64, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "pixel-bolt",
    name: "Pixel Bolt",
    weight: 3,
    render: (p, uid) => {
      const base = paint(p.accent, [
        [76, 6, 16, 8],
        [68, 14, 16, 8],
        [74, 22, 14, 8],
        [64, 30, 14, 8],
        [70, 38, 12, 6],
      ]);
      return (
        <g id={`px-ex-bolt-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [76, 6, 16, 2],
                [68, 14, 16, 2],
                [74, 22, 14, 2],
                [64, 30, 14, 2],
                [70, 38, 12, 2],
              ]),
              ...paint(p.bg[0], [
                [76, 12, 16, 2],
                [68, 20, 16, 2],
                [74, 28, 14, 2],
                [64, 36, 14, 2],
                [70, 42, 12, 2],
              ]),
              ...paint(p.bg[1], [
                [74, 12, 2, 2],
                [70, 28, 2, 2],
                [76, 20, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "floating-stars",
    name: "Floating Stars",
    weight: 5,
    render: (p, uid) => {
      const base = paint(p.accent, [
        ...starCells(10, 28),
        ...starCells(80, 50),
        ...tinyStarCells(14, 66),
      ]);
      return (
        <g id={`px-ex-stars-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [16, 28, 2, 2],
                [14, 30, 2, 2],
                [12, 32, 2, 2],
                [16, 32, 4, 2],
                [86, 50, 2, 2],
                [84, 52, 2, 2],
                [82, 54, 2, 2],
                [86, 54, 4, 2],
                [18, 66, 2, 2],
                [16, 68, 2, 2],
                [14, 70, 2, 2],
                [18, 70, 4, 2],
              ]),
              ...paint(p.bg[0], [
                [20, 32, 2, 2],
                [18, 34, 2, 2],
                [16, 36, 2, 2],
                [90, 54, 2, 2],
                [88, 56, 2, 2],
                [86, 58, 2, 2],
                [20, 70, 2, 2],
                [18, 72, 2, 2],
                [16, 74, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
];
