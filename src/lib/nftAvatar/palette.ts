import type { AvatarPalette } from "./types";

export const AVATAR_PALETTES: AvatarPalette[] = [
  { bg: ["#07130c", "#0f2a1d"], accent: "#7fff9f", ink: "#03130a", light: "#eafff5" },
  { bg: ["#120716", "#2a1038"], accent: "#c08bff", ink: "#0d0413", light: "#f3e8ff" },
  { bg: ["#160805", "#3a1409"], accent: "#ff9a5c", ink: "#120402", light: "#ffe4d1" },
  { bg: ["#04101c", "#0b2740"], accent: "#41c7ff", ink: "#020a12", light: "#d9f2ff" },
  { bg: ["#150510", "#3a0f2b"], accent: "#ff5fa2", ink: "#11040c", light: "#ffe1ef" },
  { bg: ["#0d0d08", "#26260f"], accent: "#ffe066", ink: "#0a0a05", light: "#fff8dc" },
  { bg: ["#061414", "#0f3230"], accent: "#2fe6c8", ink: "#041010", light: "#d6fff8" },
  { bg: ["#101018", "#23233a"], accent: "#8ea2ff", ink: "#08080f", light: "#e7ebff" },
  { bg: ["#170909", "#3a1111"], accent: "#ff6b6b", ink: "#120505", light: "#ffe0e0" },
  { bg: ["#0a0f04", "#1e2e0b"], accent: "#b6ff5c", ink: "#070b03", light: "#efffd6" },
];

function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickPalette(seed: string): AvatarPalette {
  return AVATAR_PALETTES[fnv1a(`${seed}:palette`) % AVATAR_PALETTES.length];
}

export { fnv1a };
