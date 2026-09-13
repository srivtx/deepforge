import type { AvatarPalette, Trait } from "../types";

/**
 * Pixel/voxel heads: blocky faces centered on (48, 50), ~52px wide.
 * Hidden 48x48 pixel grid (2 SVG units = 1 pixel). Each head paints a
 * 2-unit ink silhouette, a face plate, block shading and 12x12 eye
 * sockets at (40, 46) / (56, 46) so the pixel eye trait overlays cleanly.
 */
type Block = [x: number, y: number, w: number, h: number, c: string];

/** Blend two #rrggbb literals into the 5 flat tones each head uses. */
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

interface Tones {
  base: string;
  dark: string;
  deep: string;
  light: string;
  bright: string;
}

/** Five-step material ramp: mid, shadow, deep shadow, highlight, hot highlight. */
function tones(base: string, p: AvatarPalette): Tones {
  return {
    base,
    dark: mix(base, p.ink, 0.38),
    deep: mix(base, p.ink, 0.72),
    light: mix(base, p.light, 0.35),
    bright: mix(base, p.light, 0.7),
  };
}

/** 2-unit ink border around the 48x48 face plate; chamfer > 0 cuts corners. */
function silhouette(p: AvatarPalette, chamfer = 0): Block[] {
  const edge: Block[] = [
    [24, 22, 48, 2, p.ink],
    [24, 72, 48, 2, p.ink],
    [22, 24, 2, 48, p.ink],
    [72, 24, 2, 48, p.ink],
  ];
  if (!chamfer) {
    edge.push(
      [22, 22, 2, 2, p.ink],
      [72, 22, 2, 2, p.ink],
      [22, 72, 2, 2, p.ink],
      [72, 72, 2, 2, p.ink],
    );
  }
  return edge;
}

/** Voxel neck tucked behind the face, fading into the shoulders. */
function neck(p: AvatarPalette, tint: string): Block[] {
  return [
    [42, 64, 12, 24, p.ink],
    [44, 64, 8, 24, tint],
    [44, 82, 8, 6, mix(tint, p.ink, 0.35)],
  ];
}

export const PIXEL_HEAD_TRAITS: Trait[] = [
  {
    id: "block-hero",
    name: "Block Hero",
    weight: 13,
    render: (p) => {
      const t = tones(mix(p.accent, p.bg[1], 0.4), p);
      const hair = tones(mix(p.ink, p.accent, 0.3), p);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            ...silhouette(p),
            [24, 24, 48, 48, t.base],
            [24, 28, 4, 34, t.light],
            [68, 28, 4, 38, t.dark],
            [24, 66, 48, 6, t.dark],
            [24, 24, 48, 10, hair.base],
            [24, 24, 48, 2, hair.light],
            [26, 30, 6, 4, hair.dark],
            [24, 34, 6, 8, hair.base],
            [36, 34, 4, 6, hair.base],
            [46, 34, 4, 4, hair.base],
            [54, 34, 4, 6, hair.base],
            [64, 34, 6, 8, hair.base],
            [34, 40, 12, 12, t.dark],
            [50, 40, 12, 12, t.dark],
            [46, 52, 4, 6, t.dark],
            [46, 56, 4, 2, t.deep],
          ]}
        />
      );
    },
  },
  {
    id: "rotting-drift",
    name: "Rotting Drift",
    weight: 12,
    render: (p) => {
      const t = tones(mix(p.accent, p.bg[0], 0.55), p);
      const hair = tones(mix(p.accent, p.ink, 0.62), p);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            ...silhouette(p),
            [24, 24, 48, 48, t.base],
            [24, 28, 4, 36, t.light],
            [68, 28, 4, 38, t.dark],
            [24, 66, 48, 6, t.dark],
            [28, 30, 6, 4, t.dark],
            [58, 44, 6, 6, t.light],
            [30, 50, 4, 4, t.light],
            [62, 30, 4, 4, t.dark],
            [54, 36, 4, 2, t.dark],
            [24, 24, 48, 6, hair.base],
            [24, 24, 48, 2, hair.light],
            [24, 30, 8, 6, hair.base],
            [44, 30, 6, 4, hair.base],
            [62, 30, 10, 4, hair.base],
            [34, 40, 12, 12, t.deep],
            [36, 42, 8, 8, p.ink],
            [50, 40, 12, 12, t.deep],
            [52, 42, 8, 8, p.ink],
            [58, 48, 2, 2, t.light],
            [60, 50, 2, 2, t.light],
            [28, 64, 4, 2, t.deep],
            [36, 64, 4, 2, t.deep],
            [44, 64, 4, 2, t.deep],
            [60, 64, 4, 2, t.deep],
          ]}
        />
      );
    },
  },
  {
    id: "bone-block",
    name: "Bone Block",
    weight: 11,
    render: (p) => {
      const t = tones(mix(p.light, p.accent, 0.3), p);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            ...silhouette(p, 2),
            [24, 24, 48, 48, t.base],
            [24, 24, 48, 2, t.light],
            [24, 26, 4, 28, t.light],
            [68, 30, 4, 36, t.dark],
            [24, 58, 48, 2, t.dark],
            [24, 66, 48, 6, t.deep],
            [26, 54, 6, 4, t.dark],
            [64, 54, 6, 4, t.dark],
            [34, 38, 12, 14, t.deep],
            [36, 40, 8, 10, p.ink],
            [50, 38, 12, 14, t.deep],
            [52, 40, 8, 10, p.ink],
            [46, 50, 4, 8, p.ink],
            [28, 60, 4, 4, t.light],
            [36, 60, 4, 4, t.light],
            [56, 60, 4, 4, t.light],
            [64, 60, 4, 4, t.light],
            [30, 28, 2, 8, t.dark],
            [32, 36, 2, 2, t.dark],
          ]}
        />
      );
    },
  },
  {
    id: "moss-cube",
    name: "Moss Cube",
    weight: 10,
    render: (p) => {
      const t = tones(mix(p.bg[1], p.accent, 0.55), p);
      const socket = mix(t.base, p.ink, 0.2);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            [42, 14, 12, 10, p.ink],
            [44, 16, 8, 6, t.light],
            [44, 22, 8, 2, t.dark],
            ...silhouette(p, 2),
            [24, 24, 48, 48, t.base],
            [24, 24, 48, 6, t.light],
            [26, 26, 4, 2, t.bright],
            [38, 30, 4, 2, t.bright],
            [56, 26, 6, 2, t.bright],
            [68, 26, 2, 2, t.bright],
            [68, 30, 4, 36, t.dark],
            [24, 66, 48, 6, t.dark],
            [28, 34, 6, 4, t.dark],
            [60, 36, 6, 6, t.light],
            [30, 48, 4, 6, t.dark],
            [58, 52, 6, 4, t.light],
            [36, 58, 4, 4, t.dark],
            [52, 60, 6, 4, t.light],
            [40, 42, 4, 4, t.dark],
            [50, 44, 4, 4, t.light],
            [34, 40, 12, 12, socket],
            [50, 40, 12, 12, socket],
            [46, 52, 4, 10, t.dark],
          ]}
        />
      );
    },
  },
  {
    id: "pink-snout",
    name: "Pink Snout",
    weight: 6,
    render: (p) => {
      const t = tones(mix(p.accent, p.light, 0.5), p);
      const socket = mix(t.base, p.ink, 0.16);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            [20, 12, 12, 12, p.ink],
            [22, 14, 8, 8, t.dark],
            [64, 12, 12, 12, p.ink],
            [66, 14, 8, 8, t.dark],
            ...silhouette(p),
            [24, 24, 48, 48, t.base],
            [24, 24, 48, 2, t.light],
            [24, 26, 4, 30, t.light],
            [68, 26, 4, 40, t.dark],
            [24, 66, 48, 6, t.dark],
            [34, 40, 12, 12, socket],
            [50, 40, 12, 12, socket],
            [38, 48, 20, 12, p.ink],
            [40, 50, 16, 8, t.light],
            [42, 52, 4, 4, t.deep],
            [50, 52, 4, 4, t.deep],
            [40, 58, 16, 2, t.dark],
          ]}
        />
      );
    },
  },
  {
    id: "grey-fang",
    name: "Grey Fang",
    weight: 6,
    render: (p) => {
      const t = tones(mix(p.bg[1], p.light, 0.4), p);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            [18, 8, 12, 16, p.ink],
            [20, 10, 8, 10, t.dark],
            [22, 10, 6, 4, t.deep],
            [66, 8, 12, 16, p.ink],
            [68, 10, 8, 10, t.dark],
            [68, 10, 6, 4, t.deep],
            ...silhouette(p),
            [24, 24, 48, 48, t.base],
            [24, 24, 48, 2, t.light],
            [24, 26, 4, 46, t.light],
            [68, 26, 4, 46, t.dark],
            [24, 66, 48, 6, t.dark],
            [34, 40, 12, 12, t.dark],
            [50, 40, 12, 12, t.dark],
            [32, 34, 16, 2, t.deep],
            [48, 34, 16, 2, t.deep],
            [34, 48, 28, 2, t.deep],
            [36, 50, 24, 14, t.light],
            [36, 62, 24, 2, t.dark],
            [44, 50, 8, 6, p.ink],
            [44, 50, 4, 2, t.dark],
            [48, 50, 4, 2, t.dark],
            [24, 52, 6, 2, t.light],
            [24, 58, 4, 2, t.light],
            [66, 52, 6, 2, t.dark],
          ]}
        />
      );
    },
  },
  {
    id: "market-trader",
    name: "Market Trader",
    weight: 5,
    render: (p) => {
      const t = tones(mix(p.accent, p.light, 0.3), p);
      const brow = mix(t.deep, p.ink, 0.4);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            ...silhouette(p),
            [24, 24, 48, 48, t.base],
            [24, 24, 48, 4, t.light],
            [24, 28, 4, 34, t.light],
            [68, 28, 4, 40, t.dark],
            [24, 66, 48, 6, t.dark],
            [34, 40, 12, 12, t.dark],
            [50, 40, 12, 12, t.dark],
            [26, 34, 44, 4, brow],
            [46, 42, 4, 18, t.dark],
            [46, 58, 4, 2, t.deep],
          ]}
        />
      );
    },
  },
  {
    id: "jelly-cube",
    name: "Jelly Cube",
    weight: 2,
    render: (p) => {
      const t = tones(mix(p.accent, p.light, 0.45), p);
      return (
        <Blocks
          blocks={[
            ...neck(p, t.dark),
            [20, 72, 8, 10, p.ink],
            [22, 74, 4, 6, t.light],
            [34, 72, 6, 8, p.ink],
            [36, 74, 2, 4, t.light],
            [66, 72, 10, 8, p.ink],
            [68, 74, 6, 4, t.light],
            ...silhouette(p, 2),
            [24, 24, 48, 48, t.base],
            [24, 24, 48, 4, t.light],
            [26, 26, 4, 4, t.bright],
            [34, 26, 2, 2, t.bright],
            [68, 28, 4, 40, t.dark],
            [24, 66, 48, 6, t.dark],
            [34, 40, 28, 22, t.deep],
            [36, 42, 24, 18, mix(t.deep, p.ink, 0.25)],
            [38, 44, 8, 4, mix(t.deep, p.light, 0.25)],
            [50, 52, 8, 4, mix(t.deep, p.light, 0.2)],
            [30, 50, 2, 2, t.bright],
            [60, 34, 2, 2, t.bright],
            [28, 60, 2, 2, t.light],
          ]}
        />
      );
    },
  },
];
