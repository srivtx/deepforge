import { fnv1a, pickPalette } from "./palette";
import { PIXEL_TRAIT_CATEGORIES } from "./pixel";
import { TRAIT_CATEGORIES } from "./traits";
import type { AvatarStyle, NftAvatarSelection, Trait } from "./types";

/** mulberry32 — tiny deterministic PRNG for stable trait picks. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FALLBACK_TRAIT: Trait = {
  id: "none",
  name: "None",
  weight: 1,
  render: () => null,
};

export function traitCategoriesFor(style: AvatarStyle): Record<string, Trait[]> {
  return style === "pixel"
    ? PIXEL_TRAIT_CATEGORIES
    : (TRAIT_CATEGORIES as unknown as Record<string, Trait[]>);
}

function pickWeighted(
  traits: Trait[],
  random: () => number,
): Trait {
  if (traits.length === 0) return FALLBACK_TRAIT;
  const total = traits.reduce((sum, trait) => sum + Math.max(0, trait.weight), 0);
  if (total <= 0) return traits[0];
  let roll = random() * total;
  for (const trait of traits) {
    roll -= Math.max(0, trait.weight);
    if (roll <= 0) return trait;
  }
  return traits[traits.length - 1];
}

/** Deterministic trait selection for a seed and style. Same input → same avatar. */
export function selectAvatarTraits(
  seed: string,
  style: AvatarStyle = "illustrated",
): NftAvatarSelection {
  const random = mulberry32(fnv1a(`${seed}:${style}:traits`));
  const categories = traitCategoriesFor(style);
  return {
    seed,
    style,
    palette: pickPalette(`${seed}:${style}`),
    traits: {
      background: pickWeighted(categories.backgrounds ?? [], random),
      clothing: pickWeighted(categories.clothing ?? [], random),
      head: pickWeighted(categories.heads ?? [], random),
      mouth: pickWeighted(categories.mouths ?? [], random),
      eyes: pickWeighted(categories.eyes ?? [], random),
      headwear: pickWeighted(categories.headwear ?? [], random),
      accessories: pickWeighted(categories.accessories ?? [], random),
      extras: pickWeighted(categories.extras ?? [], random),
    },
  };
}

/** Rare-trait count for display ("rare" badge in the picker). */
export function rarityScore(selection: NftAvatarSelection): number {
  return Object.values(selection.traits).filter((trait) => trait.weight <= 4)
    .length;
}
