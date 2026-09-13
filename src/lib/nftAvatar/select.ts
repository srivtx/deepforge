import { fnv1a, pickPalette } from "./palette";
import { TRAIT_CATEGORIES } from "./traits";
import type { NftAvatarSelection, Trait } from "./types";

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

/** Deterministic trait selection for a seed. Same seed → same avatar. */
export function selectAvatarTraits(seed: string): NftAvatarSelection {
  const random = mulberry32(fnv1a(`${seed}:traits`));
  return {
    seed,
    palette: pickPalette(seed),
    traits: {
      background: pickWeighted(TRAIT_CATEGORIES.backgrounds, random),
      clothing: pickWeighted(TRAIT_CATEGORIES.clothing, random),
      head: pickWeighted(TRAIT_CATEGORIES.heads, random),
      mouth: pickWeighted(TRAIT_CATEGORIES.mouths, random),
      eyes: pickWeighted(TRAIT_CATEGORIES.eyes, random),
      headwear: pickWeighted(TRAIT_CATEGORIES.headwear, random),
      accessories: pickWeighted(TRAIT_CATEGORIES.accessories, random),
      extras: pickWeighted(TRAIT_CATEGORIES.extras, random),
    },
  };
}

/** Rare-trait count for display ("rare" badge in the picker). */
export function rarityScore(selection: NftAvatarSelection): number {
  return Object.values(selection.traits).filter((trait) => trait.weight <= 4)
    .length;
}
