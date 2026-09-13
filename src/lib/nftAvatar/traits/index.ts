import { ACCESSORY_TRAITS } from "./accessories";
import { BACKGROUND_TRAITS } from "./backgrounds";
import { CLOTHING_TRAITS } from "./clothing";
import { EXTRA_TRAITS } from "./extras";
import { EYE_TRAITS } from "./eyes";
import { HEADWEAR_TRAITS } from "./headwear";
import { HEAD_TRAITS } from "./heads";
import { MOUTH_TRAITS } from "./mouths";

export const TRAIT_CATEGORIES = {
  backgrounds: BACKGROUND_TRAITS,
  clothing: CLOTHING_TRAITS,
  heads: HEAD_TRAITS,
  mouths: MOUTH_TRAITS,
  eyes: EYE_TRAITS,
  headwear: HEADWEAR_TRAITS,
  accessories: ACCESSORY_TRAITS,
  extras: EXTRA_TRAITS,
} as const;

export {
  ACCESSORY_TRAITS,
  BACKGROUND_TRAITS,
  CLOTHING_TRAITS,
  EXTRA_TRAITS,
  EYE_TRAITS,
  HEADWEAR_TRAITS,
  HEAD_TRAITS,
  MOUTH_TRAITS,
};
