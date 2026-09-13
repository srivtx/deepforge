import type { ReactNode } from "react";

/**
 * NFT avatar trait system.
 *
 * Every avatar is composed from one trait per category, picked
 * deterministically from a seed (usually the username or a saved reroll
 * seed). Artists draw traits as SVG fragments on the shared 96x96 canvas.
 *
 * ANCHOR CONTRACT (viewBox 0 0 96 96) — every trait must respect these so
 * layers from different artists line up:
 *   head        centered circle at (48, 50), radius ~26
 *   eyes        centered (40, 46) and (56, 46)
 *   mouth       centered (48, 62)
 *   headwear    sits above the head, brim/edge around y = 30-38
 *   clothing    shoulders from y = 78 to 96, full width
 *   accessories neck/jaw area: chain y ~ 74; earrings x ~ 26 / 70, y ~ 52
 *   extras      free layer, drawn on top
 *
 * LAYER ORDER: background, clothing, head, mouth, eyes, headwear,
 * accessories, extras.
 */
export interface AvatarPalette {
  /** Background gradient stops. */
  bg: [string, string];
  /** Signature accent used across traits. */
  accent: string;
  /** Deep tone for outlines and shadows. */
  ink: string;
  /** Bright highlight tone. */
  light: string;
}

export interface Trait {
  id: string;
  name: string;
  /** Relative rarity weight within its category. */
  weight: number;
  /**
   * Draw this trait on the shared 96x96 canvas. `uid` is a per-seed,
   * URL-safe string — use it to suffix gradient/clip ids so multiple
   * avatars on one page never share a definition.
   */
  render: (palette: AvatarPalette, uid: string) => ReactNode;
}

export type AvatarStyle = "illustrated" | "pixel";

export interface NftAvatarSelection {
  seed: string;
  style: AvatarStyle;
  palette: AvatarPalette;
  traits: {
    background: Trait;
    clothing: Trait;
    head: Trait;
    mouth: Trait;
    eyes: Trait;
    headwear: Trait;
    accessories: Trait;
    extras: Trait;
  };
}
