import type { Trait } from "../types";

/**
 * Pixel/voxel accessories: neck and jaw band. Chains hang at y ~ 74, hoop
 * earrings ring the x ~ 26 / 70 anchors at y ~ 52, and every piece keeps the
 * hidden 48x48 grid (even rects, 2-unit ink silhouettes, flat palette tones).
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

export const PIXEL_ACCESSORY_TRAITS: Trait[] = [
  {
    id: "pixel-chain",
    name: "Pixel Chain",
    weight: 12,
    render: (p, uid) => {
      const links = [
        ...paint(p.accent, [
          [28, 66, 4, 4],
          [34, 70, 4, 4],
          [40, 74, 4, 4],
          [52, 74, 4, 4],
          [58, 70, 4, 4],
          [64, 66, 4, 4],
        ]),
        ...paint(p.accent, [[44, 78, 8, 8]]),
      ];
      return (
        <g id={`px-acc-chain-${uid}`}>
          <Blocks
            blocks={[
              ...rim(links, p.ink),
              ...links,
              ...paint(p.light, [
                [28, 66, 2, 2],
                [40, 74, 2, 2],
                [64, 66, 2, 2],
                [52, 74, 2, 2],
                [46, 80, 4, 4],
              ]),
              ...paint(p.bg[1], [
                [36, 72, 2, 2],
                [56, 72, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [34, 70, 2, 2],
                [58, 70, 2, 2],
                [44, 84, 8, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "chunky-hoops",
    name: "Chunky Hoops",
    weight: 12,
    render: (p, uid) => {
      const base = paint(p.accent, [
        [18, 44, 16, 4],
        [18, 48, 4, 8],
        [30, 48, 4, 8],
        [18, 56, 16, 4],
        [62, 44, 16, 4],
        [62, 48, 4, 8],
        [74, 48, 4, 8],
        [62, 56, 16, 4],
      ]);
      return (
        <g id={`px-acc-hoops-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [18, 44, 10, 2],
                [18, 46, 2, 6],
                [62, 44, 10, 2],
                [62, 46, 2, 6],
              ]),
              ...paint(p.bg[0], [
                [22, 58, 10, 2],
                [30, 54, 2, 4],
                [66, 58, 10, 2],
                [74, 54, 2, 4],
              ]),
              ...paint(p.bg[1], [
                [30, 50, 2, 2],
                [18, 52, 2, 2],
                [74, 50, 2, 2],
                [76, 52, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "wrap-scarf",
    name: "Wrap Scarf",
    weight: 10,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [
          [30, 70, 36, 4],
          [26, 74, 44, 4],
        ]),
        ...paint(p.accent, [
          [26, 76, 12, 8],
          [30, 84, 12, 8],
        ]),
      ];
      return (
        <g id={`px-acc-scarf-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [28, 70, 40, 2],
                [26, 76, 2, 8],
                [30, 84, 2, 8],
                [30, 90, 12, 2],
              ]),
              ...paint(p.bg[1], [
                [36, 72, 2, 2],
                [44, 72, 2, 2],
                [52, 72, 2, 2],
                [60, 72, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [28, 76, 40, 2],
                [36, 78, 2, 2],
                [40, 86, 2, 2],
                [34, 90, 2, 2],
                [38, 90, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "block-bowtie",
    name: "Block Bowtie",
    weight: 7,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [[44, 72, 8, 8]]),
        ...paint(p.accent, [
          [32, 70, 12, 4],
          [28, 74, 16, 6],
          [52, 70, 12, 4],
          [52, 74, 16, 6],
        ]),
      ];
      return (
        <g id={`px-acc-bowtie-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [46, 74, 4, 4],
                [32, 70, 12, 2],
                [52, 70, 12, 2],
                [28, 74, 4, 2],
                [64, 74, 4, 2],
              ]),
              ...paint(p.bg[1], [
                [28, 76, 16, 2],
                [52, 76, 16, 2],
              ]),
              ...paint(p.bg[0], [
                [28, 78, 16, 2],
                [52, 78, 16, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "mask-straps",
    name: "Mask Straps",
    weight: 5,
    render: (p, uid) => {
      const base = paint(p.bg[1], [
        [20, 42, 8, 4],
        [24, 48, 6, 4],
        [28, 54, 6, 4],
        [68, 42, 8, 4],
        [66, 48, 6, 4],
        [62, 54, 6, 4],
      ]);
      return (
        <g id={`px-acc-mask-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [20, 42, 8, 2],
                [24, 48, 6, 2],
                [28, 54, 6, 2],
                [68, 42, 8, 2],
                [66, 48, 6, 2],
                [62, 54, 6, 2],
              ]),
              ...paint(p.bg[0], [
                [24, 44, 2, 2],
                [28, 50, 2, 2],
                [32, 56, 2, 2],
                [70, 44, 2, 2],
                [66, 50, 2, 2],
                [62, 56, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "sharp-collar",
    name: "Sharp Collar",
    weight: 10,
    render: (p, uid) => {
      const base = paint(p.light, [
        [34, 74, 12, 4],
        [30, 78, 14, 4],
        [26, 82, 14, 4],
        [50, 74, 12, 4],
        [52, 78, 14, 4],
        [56, 82, 14, 4],
      ]);
      return (
        <g id={`px-acc-collar-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.accent, [
                [34, 74, 12, 2],
                [30, 78, 14, 2],
                [26, 82, 14, 2],
                [50, 74, 12, 2],
                [52, 78, 14, 2],
                [56, 82, 14, 2],
              ]),
              ...paint(p.bg[1], [
                [26, 84, 14, 2],
                [56, 84, 14, 2],
                [34, 80, 2, 2],
                [60, 80, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "gem-studs",
    name: "Gem Studs",
    weight: 5,
    render: (p, uid) => {
      const studs = paint(p.accent, [
        [24, 46, 4, 4],
        [68, 46, 4, 4],
        [28, 54, 4, 4],
        [64, 54, 4, 4],
      ]);
      return (
        <g id={`px-acc-studs-${uid}`}>
          <Blocks
            blocks={[
              ...rim(studs, p.ink),
              ...studs,
              ...paint(p.light, [
                [24, 46, 2, 2],
                [68, 46, 2, 2],
                [28, 54, 2, 2],
                [64, 54, 2, 2],
                [24, 38, 6, 2],
                [26, 36, 2, 6],
                [68, 38, 6, 2],
                [70, 36, 2, 6],
              ]),
              ...paint(p.bg[1], [
                [26, 48, 2, 2],
                [70, 48, 2, 2],
                [30, 56, 2, 2],
                [66, 56, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "cape-clasp",
    name: "Cape Clasp",
    weight: 2,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [[44, 70, 8, 8]]),
        ...paint(p.light, [
          [30, 70, 12, 6],
          [54, 70, 12, 6],
        ]),
        ...paint(p.accent, [
          [28, 66, 4, 4],
          [64, 66, 4, 4],
        ]),
      ];
      return (
        <g id={`px-acc-clasp-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [[46, 70, 4, 4]]),
              ...paint(p.bg[1], [
                [30, 74, 12, 2],
                [54, 74, 12, 2],
                [34, 68, 2, 2],
                [58, 68, 2, 2],
              ]),
              ...paint(p.bg[0], [[44, 76, 8, 2]]),
            ]}
          />
        </g>
      );
    },
  },
];
