import type { Trait } from "../types";
import { PIXEL_ACCESSORY_TRAITS } from "./accessories";
import { PIXEL_BACKGROUND_TRAITS } from "./backgrounds";
import { PIXEL_CLOTHING_TRAITS } from "./clothing";
import { PIXEL_EXTRA_TRAITS } from "./extras";
import { PIXEL_EYE_TRAITS } from "./eyes";
import { PIXEL_HEADWEAR_TRAITS } from "./headwear";
import { PIXEL_HEAD_TRAITS } from "./heads";
import { PIXEL_MOUTH_TRAITS } from "./mouths";

export const PIXEL_TRAIT_CATEGORIES: Record<string, Trait[]> = {
  backgrounds: PIXEL_BACKGROUND_TRAITS,
  clothing: PIXEL_CLOTHING_TRAITS,
  heads: PIXEL_HEAD_TRAITS,
  mouths: PIXEL_MOUTH_TRAITS,
  eyes: PIXEL_EYE_TRAITS,
  headwear: PIXEL_HEADWEAR_TRAITS,
  accessories: PIXEL_ACCESSORY_TRAITS,
  extras: PIXEL_EXTRA_TRAITS,
};
