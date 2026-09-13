import type { Trait } from "../types";

/**
 * Pixel/voxel backgrounds: full-canvas layer.
 * Everything lands on the hidden 48x48 logical grid (2 SVG units = 1 pixel):
 * flat stepped bands, blocky clusters and checker dither — no curves.
 */
type Block = [x: number, y: number, w: number, h: number, c: string];

/** Blend two #rrggbb literals: precomputed flat tones for block shading. */
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

/** Checkerboard band between two flat tones (stepped gradient, no stop blending). */
function dither(
  x0: number,
  y0: number,
  w: number,
  h: number,
  a: string,
  b: string,
  step = 4,
): Block[] {
  const out: Block[] = [];
  for (let row = 0; row < h; row += step) {
    for (let col = 0; col < w; col += step) {
      out.push([x0 + col, y0 + row, step, step, (row + col) % (step * 2) === 0 ? a : b]);
    }
  }
  return out;
}

/** Five-pixel pixel-art sparkle: 2x2 core plus 2x2 arms. */
function spark(x: number, y: number, c: string): Block[] {
  return [
    [x, y, 2, 2, c],
    [x - 4, y, 2, 2, c],
    [x + 4, y, 2, 2, c],
    [x, y - 4, 2, 2, c],
    [x, y + 4, 2, 2, c],
  ];
}

export const PIXEL_BACKGROUND_TRAITS: Trait[] = [
  {
    id: "starry-night",
    name: "Starry Night",
    weight: 14,
    render: (p) => {
      const skyTop = mix(p.bg[0], p.ink, 0.3);
      const skyLow = mix(p.bg[1], p.bg[0], 0.35);
      const hill = mix(p.bg[1], p.ink, 0.55);
      const ground = mix(p.ink, p.bg[0], 0.4);
      return (
        <Blocks
          blocks={[
            [0, 0, 96, 40, skyTop],
            [0, 34, 96, 32, skyLow],
            ...dither(0, 30, 96, 10, skyTop, skyLow),
            [0, 52, 22, 12, hill],
            [74, 48, 22, 16, hill],
            [0, 64, 96, 32, ground],
            [0, 64, 96, 2, mix(ground, p.accent, 0.3)],
            [64, 10, 20, 4, p.light],
            [60, 14, 28, 12, p.light],
            [64, 26, 20, 4, p.light],
            [62, 16, 6, 6, mix(p.light, p.bg[0], 0.3)],
            [74, 22, 4, 4, mix(p.light, p.bg[0], 0.3)],
            [10, 8, 4, 4, p.light],
            [22, 18, 2, 2, p.accent],
            [36, 6, 2, 2, p.light],
            [50, 14, 2, 2, p.light],
            [82, 34, 2, 2, p.accent],
            [14, 40, 2, 2, p.light],
            [44, 40, 2, 2, p.light],
            [30, 46, 2, 2, p.accent],
            [8, 58, 2, 2, p.light],
            [70, 42, 2, 2, p.light],
            ...spark(52, 20, p.light),
          ]}
        />
      );
    },
  },
  {
    id: "dusk-bands",
    name: "Dusk Bands",
    weight: 12,
    render: (p) => {
      const bands = [
        mix(p.bg[0], p.ink, 0.2),
        mix(p.bg[0], p.accent, 0.2),
        mix(p.bg[0], p.accent, 0.5),
        mix(p.accent, p.ink, 0.15),
        mix(p.accent, p.bg[1], 0.5),
      ];
      const ground = mix(p.bg[1], p.ink, 0.5);
      const sun = mix(p.light, p.accent, 0.35);
      const blocks: Block[] = [
        [0, 0, 96, 16, bands[0]],
        [0, 16, 96, 10, bands[1]],
        [0, 26, 96, 10, bands[2]],
        [0, 36, 96, 10, bands[3]],
        [0, 46, 96, 10, bands[4]],
        [0, 56, 96, 40, ground],
        [0, 56, 96, 2, mix(ground, p.accent, 0.35)],
      ];
      [16, 26, 36, 46].forEach((y, i) => {
        blocks.push(...dither(0, y - 4, 96, 8, bands[i], bands[i + 1]));
      });
      blocks.push(
        [38, 30, 20, 6, sun],
        [34, 36, 28, 10, sun],
        [36, 46, 24, 4, mix(sun, p.light, 0.5)],
      );
      return <Blocks blocks={blocks} />;
    },
  },
  {
    id: "deep-cave",
    name: "Deep Cave",
    weight: 11,
    render: (p) => {
      const stone = mix(mix(p.bg[1], p.accent, 0.12), p.ink, 0.12);
      const dark = mix(stone, p.ink, 0.45);
      const pale = mix(stone, p.light, 0.32);
      const crack = mix(stone, p.ink, 0.65);
      return (
        <Blocks
          blocks={[
            [0, 0, 96, 96, stone],
            [0, 0, 96, 2, pale],
            [4, 0, 22, 8, pale],
            [6, 0, 16, 14, dark],
            [8, 12, 10, 8, dark],
            [10, 20, 4, 4, dark],
            [42, 0, 14, 6, pale],
            [44, 0, 10, 12, dark],
            [46, 12, 6, 6, dark],
            [70, 0, 22, 10, pale],
            [72, 0, 16, 16, dark],
            [74, 16, 10, 8, dark],
            [78, 24, 4, 4, dark],
            [8, 78, 18, 18, pale],
            [10, 82, 14, 14, dark],
            [52, 80, 16, 16, pale],
            [54, 84, 12, 12, dark],
            [74, 76, 18, 20, pale],
            [76, 80, 14, 16, dark],
            [22, 30, 10, 6, pale],
            [58, 28, 12, 4, dark],
            [24, 56, 14, 8, dark],
            [64, 54, 10, 8, pale],
            [34, 40, 6, 4, pale],
            [40, 68, 10, 4, dark],
            [62, 40, 4, 4, dark],
            [16, 44, 6, 4, dark],
            [48, 32, 2, 12, crack],
            [46, 44, 4, 2, crack],
            [50, 46, 2, 6, crack],
            [30, 50, 2, 10, crack],
            [32, 60, 4, 2, crack],
            [72, 36, 2, 8, crack],
            [38, 24, 2, 2, p.accent],
            [54, 48, 2, 2, p.accent],
            [24, 72, 4, 4, p.accent],
            [24, 72, 2, 2, p.light],
            [82, 58, 2, 2, p.light],
          ]}
        />
      );
    },
  },
  {
    id: "low-tide",
    name: "Low Tide",
    weight: 10,
    render: (p) => {
      const skyTop = mix(p.bg[0], p.bg[1], 0.4);
      const skyLow = mix(p.bg[1], p.bg[0], 0.2);
      const sea = mix(p.bg[1], p.accent, 0.28);
      const deep = mix(sea, p.ink, 0.45);
      const crest = mix(sea, p.light, 0.5);
      const ripple = mix(deep, p.light, 0.35);
      const blocks: Block[] = [
        [0, 0, 96, 20, skyTop],
        [0, 14, 96, 22, skyLow],
        ...dither(0, 12, 96, 8, skyTop, skyLow),
        [0, 36, 96, 60, sea],
        [0, 36, 96, 2, mix(p.bg[1], p.light, 0.25)],
        [0, 58, 96, 38, deep],
        ...dither(0, 54, 96, 8, sea, deep),
      ];
      for (let y = 42; y < 82; y += 8) {
        const off = ((y - 42) / 8) % 2 === 0 ? 2 : 10;
        for (let x = off; x < 88; x += 20) {
          blocks.push([x, y, 8, 2, y < 58 ? crest : ripple]);
        }
      }
      return <Blocks blocks={blocks} />;
    },
  },
  {
    id: "open-field",
    name: "Open Field",
    weight: 10,
    render: (p) => {
      const high = p.bg[0];
      const sky = mix(p.bg[0], p.bg[1], 0.5);
      const cloud = mix(sky, p.light, 0.55);
      const hill = mix(sky, p.accent, 0.28);
      const grass = mix(p.bg[1], p.accent, 0.5);
      const lip = mix(grass, p.light, 0.4);
      const dirt = mix(grass, p.ink, 0.5);
      return (
        <Blocks
          blocks={[
            [0, 0, 96, 24, high],
            [0, 18, 96, 28, sky],
            ...dither(0, 16, 96, 8, high, sky),
            [10, 6, 22, 8, cloud],
            [36, 2, 14, 6, cloud],
            [68, 12, 20, 6, cloud],
            [10, 10, 22, 4, mix(cloud, p.ink, 0.18)],
            [68, 14, 20, 4, mix(cloud, p.ink, 0.18)],
            [0, 38, 30, 10, hill],
            [20, 34, 26, 10, hill],
            [46, 38, 50, 10, hill],
            [0, 44, 96, 52, grass],
            [0, 44, 96, 2, lip],
            [8, 60, 16, 8, dirt],
            [58, 68, 24, 10, dirt],
            [36, 82, 18, 6, dirt],
            [24, 52, 8, 4, dirt],
            [4, 50, 2, 4, lip],
            [14, 56, 2, 4, lip],
            [30, 62, 2, 4, lip],
            [48, 52, 2, 4, lip],
            [64, 58, 2, 4, lip],
            [78, 50, 2, 4, lip],
            [88, 64, 2, 4, lip],
            [20, 72, 2, 4, lip],
            [70, 78, 2, 4, lip],
            [12, 46, 2, 6, mix(dirt, p.ink, 0.2)],
            [10, 42, 6, 4, p.accent],
            [84, 56, 2, 6, mix(dirt, p.ink, 0.2)],
            [82, 52, 6, 4, mix(p.accent, p.light, 0.3)],
          ]}
        />
      );
    },
  },
  {
    id: "crimson-reach",
    name: "Crimson Reach",
    weight: 6,
    render: (p) => {
      const deep = mix(p.ink, p.bg[0], 0.45);
      const ceiling = mix(deep, p.accent, 0.25);
      const lava = mix(p.accent, p.ink, 0.3);
      const hot = mix(p.accent, p.light, 0.4);
      const floor = mix(deep, p.accent, 0.12);
      return (
        <Blocks
          blocks={[
            [0, 0, 96, 96, deep],
            [0, 0, 96, 18, ceiling],
            ...dither(0, 14, 96, 8, ceiling, deep),
            [0, 70, 96, 26, floor],
            [0, 70, 96, 2, mix(floor, p.accent, 0.3)],
            [0, 42, 96, 22, lava],
            [0, 48, 96, 10, p.accent],
            [0, 50, 96, 4, hot],
            ...dither(0, 38, 96, 8, deep, lava),
            ...dither(0, 60, 96, 8, lava, deep),
            [12, 30, 2, 2, p.accent],
            [80, 26, 4, 4, lava],
            [24, 76, 2, 2, hot],
            [68, 78, 4, 4, p.accent],
            [44, 24, 2, 2, p.accent],
            [88, 52, 4, 4, hot],
            [6, 54, 2, 2, p.light],
          ]}
        />
      );
    },
  },
  {
    id: "first-light",
    name: "First Light",
    weight: 5,
    render: (p) => {
      const night = mix(p.bg[0], p.ink, 0.25);
      const rose = mix(p.bg[0], p.accent, 0.3);
      const warm = mix(p.accent, p.bg[1], 0.35);
      const ground = mix(p.bg[1], p.ink, 0.5);
      const glow = mix(p.light, p.accent, 0.35);
      return (
        <Blocks
          blocks={[
            [0, 0, 96, 32, night],
            [0, 28, 96, 24, rose],
            ...dither(0, 26, 96, 8, night, rose),
            [0, 48, 96, 48, warm],
            ...dither(0, 46, 96, 8, rose, warm),
            [40, 52, 16, 4, glow],
            [34, 56, 28, 8, glow],
            [0, 68, 30, 8, ground],
            [70, 64, 26, 12, ground],
            [0, 72, 96, 24, ground],
            [0, 72, 96, 2, mix(ground, p.accent, 0.3)],
            [24, 18, 2, 6, p.light],
            [72, 16, 2, 6, p.light],
            [12, 38, 2, 6, glow],
            [84, 36, 2, 6, glow],
            [46, 12, 4, 6, glow],
          ]}
        />
      );
    },
  },
  {
    id: "null-void",
    name: "Null Void",
    weight: 2,
    render: (p) => {
      const space = mix(p.ink, p.bg[0], 0.4);
      const shade = mix(space, p.ink, 0.35);
      const dust = mix(space, p.accent, 0.18);
      const orb = mix(p.accent, p.ink, 0.25);
      const orbDark = mix(orb, p.ink, 0.45);
      const ring = mix(orbDark, p.light, 0.3);
      return (
        <Blocks
          blocks={[
            [0, 0, 96, 48, shade],
            [0, 0, 96, 96, space],
            ...dither(0, 44, 96, 8, shade, space),
            [50, 62, 36, 4, ring],
            [62, 54, 14, 14, orb],
            [68, 60, 8, 8, orbDark],
            [64, 56, 4, 4, p.light],
            [54, 72, 28, 4, ring],
            [16, 20, 2, 2, p.light],
            [36, 50, 2, 2, p.accent],
            [80, 22, 2, 2, p.accent],
            [12, 72, 2, 2, p.light],
            [76, 84, 2, 2, p.accent],
            ...spark(28, 34, p.accent),
            ...spark(72, 38, p.light),
            ...dither(0, 86, 32, 8, space, dust),
          ]}
        />
      );
    },
  },
];
