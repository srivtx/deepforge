import type { ComponentType } from "react";
import { AgentOwlArt } from "./agent-owl";
import { AlienDripArt } from "./alien-drip";
import { AstroPenguinArt } from "./astro-penguin";
import { CyberFoxArt } from "./cyber-fox";
import { DragonHatchlingArt } from "./dragon-hatchling";
import { NeonApeArt } from "./neon-ape";
import { NinjaCatArt } from "./ninja-cat";
import { PandaPunkArt } from "./panda-punk";
import { SharkHoodieArt } from "./shark-hoodie";
import { SkullKidArt } from "./skull-kid";
import { SpaceBotArt } from "./space-bot";
import { WizardToadArt } from "./wizard-toad";

/** Original character art, keyed by `AvatarPreset.art`. */
export const CHARACTER_ART: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  "neon-ape": NeonApeArt,
  "cyber-fox": CyberFoxArt,
  "ninja-cat": NinjaCatArt,
  "space-bot": SpaceBotArt,
  "alien-drip": AlienDripArt,
  "agent-owl": AgentOwlArt,
  "wizard-toad": WizardToadArt,
  "panda-punk": PandaPunkArt,
  "shark-hoodie": SharkHoodieArt,
  "dragon-hatchling": DragonHatchlingArt,
  "astro-penguin": AstroPenguinArt,
  "skull-kid": SkullKidArt,
};
