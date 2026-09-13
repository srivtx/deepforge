import type { Trait } from "../types";

/**
 * Pixel/voxel headwear: seats on the 48-wide block head (face plate top edge
 * y = 24) and drops its brim/band edge to y = 38, clearing the eye sockets at
 * y >= 40. Hidden 48x48 grid — every rect sits on even coordinates, each
 * cluster gets a 2-unit p.ink silhouette, and each material uses one flat
 * highlight, mid and shadow tone (max 5 literal palette tones per trait).
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

export const PIXEL_HEADWEAR_TRAITS: Trait[] = [
  {
    id: "two-bit-cap",
    name: "2-Bit Cap",
    weight: 14,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [
          [32, 16, 32, 4],
          [28, 20, 40, 12],
        ]),
        ...paint(p.accent, [[24, 32, 48, 4]]),
      ];
      return (
        <g id={`px-hw-cap-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [34, 16, 20, 2],
                [28, 20, 4, 12],
                [26, 32, 44, 2],
              ]),
              ...paint(p.bg[1], [
                [60, 20, 8, 12],
                [56, 22, 2, 2],
                [58, 26, 2, 2],
                [56, 30, 2, 2],
              ]),
              ...paint(p.bg[0], [[26, 34, 44, 2]]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "chunky-beanie",
    name: "Chunky Beanie",
    weight: 12,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [[44, 4, 8, 8]]),
        ...paint(p.accent, [
          [36, 10, 24, 4],
          [32, 14, 32, 6],
          [28, 20, 40, 6],
          [26, 26, 44, 4],
        ]),
        ...paint(p.accent, [[24, 30, 48, 6]]),
      ];
      return (
        <g id={`px-hw-beanie-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [44, 4, 4, 4],
                [38, 10, 20, 2],
                [32, 14, 4, 6],
                [26, 30, 44, 2],
              ]),
              ...paint(p.bg[1], [
                [48, 8, 4, 4],
                [60, 14, 4, 6],
                [64, 20, 4, 6],
                [56, 16, 2, 2],
                [58, 22, 2, 2],
                [54, 26, 2, 2],
                [32, 32, 2, 2],
                [40, 32, 2, 2],
                [48, 32, 2, 2],
                [56, 32, 2, 2],
                [64, 32, 2, 2],
              ]),
              ...paint(p.bg[0], [[26, 34, 44, 2]]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "block-crown",
    name: "Block Crown",
    weight: 3,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [
          [42, 14, 12, 16],
          [30, 22, 8, 8],
          [58, 22, 8, 8],
        ]),
        ...paint(p.accent, [[28, 30, 40, 6]]),
      ];
      const sockets = paint(p.ink, [
        [44, 22, 8, 8],
        [32, 28, 8, 8],
        [56, 28, 8, 8],
      ]);
      return (
        <g id={`px-hw-crown-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [42, 14, 12, 2],
                [42, 16, 2, 12],
                [30, 22, 8, 2],
                [30, 24, 2, 6],
                [58, 22, 8, 2],
                [58, 24, 2, 6],
                [30, 30, 36, 2],
              ]),
              ...paint(p.bg[0], [
                [52, 16, 2, 12],
                [36, 24, 2, 6],
                [64, 24, 2, 6],
                [30, 34, 36, 2],
              ]),
              ...sockets,
              ...paint(p.light, [
                [46, 24, 4, 4],
                [34, 30, 4, 4],
                [58, 30, 4, 4],
              ]),
              ...paint(p.bg[1], [
                [48, 26, 2, 2],
                [36, 32, 2, 2],
                [60, 32, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "bucket-helm",
    name: "Bucket Helm",
    weight: 10,
    render: (p, uid) => {
      const base = [
        ...paint(p.bg[1], [
          [34, 14, 28, 4],
          [30, 18, 36, 6],
          [28, 24, 40, 4],
        ]),
        ...paint(p.bg[1], [[20, 28, 56, 8]]),
      ];
      return (
        <g id={`px-hw-bucket-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [36, 14, 24, 2],
                [30, 18, 4, 10],
                [22, 28, 52, 2],
                [20, 30, 4, 4],
              ]),
              ...paint(p.bg[0], [
                [62, 18, 4, 10],
                [22, 34, 52, 2],
                [56, 16, 2, 2],
                [58, 22, 2, 2],
                [56, 26, 2, 2],
              ]),
              ...paint(p.accent, [
                [24, 30, 2, 2],
                [36, 30, 2, 2],
                [56, 30, 2, 2],
                [68, 30, 2, 2],
              ]),
              ...paint(p.ink, [[44, 26, 8, 12]]),
              ...paint(p.bg[1], [[46, 28, 4, 10]]),
              ...paint(p.light, [[46, 28, 2, 4]]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "tape-headband",
    name: "Tape Headband",
    weight: 14,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [[24, 30, 48, 6]]),
        ...paint(p.accent, [[68, 28, 8, 8]]),
        ...paint(p.accent, [
          [72, 36, 4, 4],
          [70, 40, 4, 4],
        ]),
      ];
      return (
        <g id={`px-hw-headband-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [26, 30, 44, 2],
                [68, 28, 8, 2],
                [72, 36, 4, 2],
                [70, 40, 4, 2],
              ]),
              ...paint(p.bg[1], [[26, 34, 44, 2]]),
              ...paint(p.bg[0], [
                [34, 32, 2, 2],
                [48, 32, 2, 2],
                [62, 32, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "propeller-cap",
    name: "Propeller Cap",
    weight: 5,
    render: (p, uid) => {
      const shell = [
        ...paint(p.accent, [
          [32, 16, 32, 4],
          [28, 20, 40, 10],
        ]),
        ...paint(p.accent, [[24, 32, 48, 4]]),
      ];
      const prop = [
        ...paint(p.accent, [[46, 12, 4, 8]]),
        ...paint(p.accent, [[30, 10, 14, 4]]),
        ...paint(p.accent, [[26, 12, 4, 4]]),
        ...paint(p.accent, [[52, 14, 14, 4]]),
        ...paint(p.accent, [[66, 16, 4, 4]]),
      ];
      return (
        <g id={`px-hw-propeller-${uid}`}>
          <Blocks
            blocks={[
              ...rim([...shell, ...prop], p.ink),
              ...shell,
              ...prop,
              ...paint(p.light, [
                [34, 16, 20, 2],
                [28, 20, 4, 10],
                [26, 32, 44, 2],
                [46, 12, 2, 8],
                [30, 10, 10, 2],
                [26, 12, 2, 4],
                [52, 14, 10, 2],
                [66, 16, 2, 4],
              ]),
              ...paint(p.bg[1], [
                [60, 20, 8, 10],
                [56, 22, 2, 2],
                [58, 26, 2, 2],
                [32, 12, 12, 2],
                [54, 16, 12, 2],
                [48, 12, 2, 8],
              ]),
              ...paint(p.bg[0], [[26, 34, 44, 2]]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "stepped-halo",
    name: "Stepped Halo",
    weight: 2,
    render: (p, uid) => {
      const base = paint(p.accent, [
        [42, 2, 12, 4],
        [36, 6, 6, 4],
        [54, 6, 6, 4],
        [32, 10, 4, 4],
        [60, 10, 4, 4],
        [36, 14, 6, 4],
        [54, 14, 6, 4],
        [42, 18, 12, 4],
      ]);
      return (
        <g id={`px-hw-halo-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [44, 2, 8, 2],
                [36, 6, 4, 2],
                [54, 6, 4, 2],
                [34, 10, 2, 2],
                [60, 12, 2, 2],
              ]),
              ...paint(p.bg[1], [
                [42, 20, 12, 2],
                [36, 16, 4, 2],
                [54, 16, 4, 2],
              ]),
              ...paint(p.bg[0], [
                [38, 8, 2, 2],
                [56, 8, 2, 2],
                [46, 18, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
  {
    id: "laurel-blocks",
    name: "Laurel Blocks",
    weight: 7,
    render: (p, uid) => {
      const base = [
        ...paint(p.accent, [[28, 30, 40, 6]]),
        ...paint(p.accent, [
          [26, 24, 6, 4],
          [22, 18, 6, 4],
          [26, 12, 6, 4],
          [32, 6, 6, 4],
          [64, 24, 6, 4],
          [68, 18, 6, 4],
          [64, 12, 6, 4],
          [58, 6, 6, 4],
          [44, 2, 8, 4],
        ]),
      ];
      return (
        <g id={`px-hw-laurel-${uid}`}>
          <Blocks
            blocks={[
              ...rim(base, p.ink),
              ...base,
              ...paint(p.light, [
                [30, 30, 36, 2],
                [26, 24, 2, 4],
                [22, 18, 2, 4],
                [26, 12, 2, 4],
                [32, 6, 2, 4],
                [68, 24, 2, 4],
                [72, 18, 2, 4],
                [68, 12, 2, 4],
                [62, 6, 2, 4],
                [44, 2, 8, 2],
                [36, 26, 2, 2],
                [58, 26, 2, 2],
              ]),
              ...paint(p.bg[0], [
                [30, 34, 36, 2],
                [36, 28, 2, 2],
                [58, 28, 2, 2],
              ]),
              ...paint(p.bg[1], [
                [38, 32, 2, 2],
                [48, 32, 2, 2],
                [58, 32, 2, 2],
              ]),
            ]}
          />
        </g>
      );
    },
  },
];
