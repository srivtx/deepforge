/**
 * Local-first avatars: hand-designed generative presets, deterministic
 * name-seeded art, and a downscaled photo upload — all in localStorage.
 *
 * No accounts, no server, no dependencies. `getAvatar` is synchronous and
 * SSR-safe; uploads are downscaled on an offscreen canvas and re-encoded so
 * the stored data URL always fits comfortably inside a browser quota.
 *
 * The avatar store deliberately bypasses `createStore` because the shared
 * `StoreId` union is sealed (adding one there would touch the sync seam);
 * it follows the same hygiene instead: `readRaw`/`writeRaw`, validated
 * parsing, and a same-tab `deepforge:avatar-change` CustomEvent.
 */

import { readRaw, removeRaw, writeRaw } from "@/lib/sync/localAdapter";

export const AVATAR_STORAGE_KEY = "deepforge:avatar:v1";
export const AVATAR_CHANGE_EVENT = "deepforge:avatar-change";

export const AVATAR_VIEWBOX = 96;
export const AVATAR_GRID = 5;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_STORED_AVATAR_BYTES = 200 * 1024;
export const AVATAR_UPLOAD_SIZE = 256;

/** Fired by the username store; the local identity seed. */
const USERNAME_FALLBACK = "anon";

export type AvatarStyle =
  | "cells"
  | "dots"
  | "diamonds"
  | "triangles"
  | "rings"
  | "plus"
  | "bars"
  | "wedges";

export interface AvatarPreset {
  id: string;
  name: string;
  /** [background base, primary, secondary, highlight] — accent-safe on dark. */
  palette: string[];
  /** Decorative concentric rings drawn behind the grid (0–3). */
  rings?: number;
  /** Shape family used by the generative renderer. */
  style?: AvatarStyle;
  /** Original character art id (see `CHARACTER_ART`); falls back to generative. */
  art?: string;
}

export interface AvatarUpload {
  kind: "upload";
  /** Downscaled JPEG data URL — the instant/offline preview. */
  dataUrl: string;
  /** Cache-busted public Storage URL once the photo is synced. */
  remoteUrl?: string;
}

export interface AvatarNft {
  kind: "nft";
  /** Deterministic seed for the trait-based generated avatar. */
  seed: string;
}

export type AvatarState =
  | { kind: "preset"; presetId: string }
  | AvatarNft
  | AvatarUpload
  | null;

/* ─────────────────────────────── presets ────────────────────────────────── */

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "phosphor",
    name: "Phosphor",
    palette: ["#07130c", "#7fff9f", "#2f8a58", "#c9ffe0"],
    style: "cells",
    rings: 1,
  },
  {
    id: "ember",
    name: "Ember",
    palette: ["#160805", "#ff9a5c", "#a83f1f", "#ffd8b4"],
    style: "dots",
    rings: 2,
  },
  {
    id: "nebula",
    name: "Nebula",
    palette: ["#0b0716", "#b491ff", "#5a3ba8", "#e7dbff"],
    style: "diamonds",
    rings: 1,
  },
  {
    id: "lagoon",
    name: "Lagoon",
    palette: ["#04110f", "#4fd9c3", "#1e6f63", "#c6fff4"],
    style: "triangles",
  },
  {
    id: "sunset",
    name: "Sunset",
    palette: ["#170913", "#ff7fae", "#a13a68", "#ffd3e4"],
    style: "rings",
    rings: 3,
  },
  {
    id: "glacier",
    name: "Glacier",
    palette: ["#060d15", "#7cc2ff", "#2b5c91", "#d8ecff"],
    style: "bars",
    rings: 1,
  },
  {
    id: "volt",
    name: "Volt",
    palette: ["#0e1004", "#d8f24f", "#7d8a18", "#f4ffb8"],
    style: "plus",
  },
  {
    id: "orchid",
    name: "Orchid",
    palette: ["#150817", "#db8dff", "#7c37a4", "#f1d6ff"],
    style: "cells",
    rings: 2,
  },
  {
    id: "copper",
    name: "Copper",
    palette: ["#130d07", "#e0a76c", "#8a5a26", "#ffe4bf"],
    style: "diamonds",
  },
  {
    id: "mint",
    name: "Mint",
    palette: ["#05110b", "#54e2a2", "#206f4d", "#c8ffe4"],
    style: "dots",
    rings: 1,
  },
  {
    id: "crimson",
    name: "Crimson",
    palette: ["#150708", "#ff7070", "#9d3030", "#ffcccc"],
    style: "wedges",
    rings: 2,
  },
  {
    id: "cobalt",
    name: "Cobalt",
    palette: ["#050a16", "#6f8dff", "#324aa6", "#d0dbff"],
    style: "triangles",
    rings: 1,
  },
  {
    id: "sand",
    name: "Sand",
    palette: ["#15110a", "#e7ca90", "#917644", "#fff0d0"],
    style: "bars",
  },
  {
    id: "void",
    name: "Void",
    palette: ["#070707", "#cfcfcf", "#737373", "#ffffff"],
    style: "plus",
    rings: 2,
  },
  {
    id: "neon-ape",
    name: "Neon Ape",
    palette: ["#04120d", "#5effb0", "#17b98a", "#eafff5"],
    art: "neon-ape",
  },
  {
    id: "cyber-fox",
    name: "Cyber Fox",
    palette: ["#070d1c", "#ff8a2b", "#41e3ff", "#ffe9d2"],
    art: "cyber-fox",
  },
  {
    id: "ninja-cat",
    name: "Ninja Cat",
    palette: ["#0c0520", "#ff3b52", "#8b5cf6", "#f5f2ff"],
    art: "ninja-cat",
  },
  {
    id: "space-bot",
    name: "Space Bot",
    palette: ["#040a16", "#5ce1ff", "#93a9c4", "#e8f6ff"],
    art: "space-bot",
  },
  {
    id: "alien-drip",
    name: "Alien Drip",
    palette: ["#0b0420", "#b6ff5c", "#8a5cff", "#ffd24a"],
    art: "alien-drip",
  },
  {
    id: "agent-owl",
    name: "Agent Owl",
    palette: ["#090a1e", "#ffb03a", "#5b5ec4", "#e9edff"],
    art: "agent-owl",
  },
  {
    id: "wizard-toad",
    name: "Wizard Toad",
    palette: ["#07140c", "#7be36a", "#d9a83a", "#f2ffe8"],
    art: "wizard-toad",
  },
  {
    id: "panda-punk",
    name: "Panda Punk",
    palette: ["#0d0d0f", "#ff5fa2", "#e8e8e8", "#ffe1ee"],
    art: "panda-punk",
  },
  {
    id: "shark-hoodie",
    name: "Shark Hoodie",
    palette: ["#060f18", "#41c7ff", "#6b7f96", "#e6f6ff"],
    art: "shark-hoodie",
  },
  {
    id: "dragon-hatchling",
    name: "Dragon Hatchling",
    palette: ["#180706", "#ff5a3c", "#ffb347", "#ffe6d6"],
    art: "dragon-hatchling",
  },
  {
    id: "astro-penguin",
    name: "Astro Penguin",
    palette: ["#060b18", "#59d8ff", "#ffffff", "#cfeaff"],
    art: "astro-penguin",
  },
  {
    id: "skull-kid",
    name: "Skull Kid",
    palette: ["#0a0f10", "#39e0c8", "#e9e6dd", "#d6fff8"],
    art: "skull-kid",
  },
];

/* ───────────────────────────── deterministic ────────────────────────────── */

/** FNV-1a (32-bit) hash of a string. */
function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — tiny deterministic PRNG for stable generative output. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mix(a: string, b: string, t: number): string {
  const left = parseHex(a);
  const right = parseHex(b);
  if (!left || !right) return a;
  const channel = (index: number) =>
    Math.round(left[index] + (right[index] - left[index]) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/** Deterministic preset for seeds that have no saved avatar (bots, rows). */
export function resolvePresetForSeed(seed: string): AvatarPreset {
  const index = fnv1a(seed.trim() || USERNAME_FALLBACK) % AVATAR_PRESETS.length;
  return AVATAR_PRESETS[index];
}

function cellShape(
  style: AvatarStyle,
  x: number,
  y: number,
  size: number,
  color: string,
): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  switch (style) {
    case "dots":
      return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(size * 0.3)}" fill="${color}"/>`;
    case "diamonds":
      return `<rect x="${round(x + 2)}" y="${round(y + 2)}" width="${round(size - 4)}" height="${round(size - 4)}" rx="2" fill="${color}" transform="rotate(45 ${round(cx)} ${round(cy)})"/>`;
    case "triangles":
      return `<polygon points="${round(cx)},${round(y + 1.6)} ${round(x + size - 1.6)},${round(y + size - 1.6)} ${round(x + 1.6)},${round(y + size - 1.6)}" fill="${color}"/>`;
    case "rings":
      return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(size * 0.28)}" fill="none" stroke="${color}" stroke-width="${round(size * 0.16)}"/>`;
    case "plus":
      return `<rect x="${round(cx - size * 0.14)}" y="${round(y + 1.8)}" width="${round(size * 0.28)}" height="${round(size - 3.6)}" rx="1.5" fill="${color}"/><rect x="${round(x + 1.8)}" y="${round(cy - size * 0.14)}" width="${round(size - 3.6)}" height="${round(size * 0.28)}" rx="1.5" fill="${color}"/>`;
    case "bars":
      return `<rect x="${round(x + 1.6)}" y="${round(y + size * 0.28)}" width="${round(size - 3.2)}" height="${round(size * 0.44)}" rx="1.6" fill="${color}"/>`;
    case "wedges": {
      const quarter = Math.round((x + y) / size) % 4;
      const start = ((quarter * 90 - 90) * Math.PI) / 180;
      const end = start + Math.PI / 2;
      const radius = size * 0.46;
      const p1 = `${round(cx + radius * Math.cos(start))},${round(cy + radius * Math.sin(start))}`;
      const p2 = `${round(cx + radius * Math.cos(end))},${round(cy + radius * Math.sin(end))}`;
      return `<path d="M ${round(cx)} ${round(cy)} L ${p1} A ${round(radius)} ${round(radius)} 0 0 1 ${p2} Z" fill="${color}"/>`;
    }
    default:
      return `<rect x="${round(x + 1.8)}" y="${round(y + 1.8)}" width="${round(size - 3.6)}" height="${round(size - 3.6)}" rx="3" fill="${color}"/>`;
  }
}

/**
 * Deterministic symmetric generative art for a seed + preset: a mirrored 5x5
 * bit grid over a palette-driven gradient. Same inputs always produce the
 * exact same SVG string; the seed itself never enters the markup.
 */
export function generateAvatarSvg(seed: string, preset: AvatarPreset): string {
  const normalized = seed.trim() || USERNAME_FALLBACK;
  const root = fnv1a(`${normalized}:${preset.id}`);
  const random = mulberry32(root);

  const palette =
    preset.palette.length >= 2 ? preset.palette : ["#111111", "#7fff9f"];
  const base = palette[0];
  const primary = palette[1];
  const secondary = palette[2] ?? primary;
  const tertiary = palette[3] ?? secondary;

  const grid = AVATAR_GRID;
  const half = Math.ceil(grid / 2);
  const center = Math.floor(grid / 2);
  const pad = 4;
  const cell = (AVATAR_VIEWBOX - pad * 2) / grid;
  const colorPool = palette.slice(1);
  const style = preset.style ?? "cells";

  // Mirrored bit grid: columns 0..center, mirrored to the right edge.
  const bits: boolean[][] = [];
  let lit = 0;
  for (let r = 0; r < grid; r += 1) {
    bits[r] = [];
    for (let c = 0; c < half; c += 1) {
      const on = random() < 0.42;
      bits[r][c] = on;
      if (on) lit += 1;
    }
  }
  // Guarantee a readable mark even for unlucky seeds.
  for (let r = 0; r < grid && lit < 6; r += 1) {
    for (let c = 0; c < half && lit < 6; c += 1) {
      if (!bits[r][c]) {
        bits[r][c] = true;
        lit += 1;
      }
    }
  }

  const shapes: string[] = [];
  for (let r = 0; r < grid; r += 1) {
    for (let c = 0; c < half; c += 1) {
      if (!bits[r][c]) continue;
      const color =
        colorPool[Math.floor(random() * colorPool.length) % colorPool.length];
      const x = pad + c * cell;
      const y = pad + r * cell;
      shapes.push(cellShape(style, x, y, cell, color));
      if (c !== center) {
        shapes.push(cellShape(style, pad + (grid - 1 - c) * cell, y, cell, color));
      }
    }
  }

  const angles = [
    { x1: "0", y1: "0", x2: "1", y2: "1" },
    { x1: "1", y1: "0", x2: "0", y2: "1" },
    { x1: "0", y1: "1", x2: "1", y2: "0" },
    { x1: "0.5", y1: "0", x2: "0.5", y2: "1" },
  ];
  const angle = angles[root % angles.length];
  const bgDeep = mix(base, "#000000", 0.45);
  const bgTint = mix(base, secondary, 0.4);
  const uid = `dfa-${root.toString(36)}`;

  const ringCount = Math.max(0, Math.min(3, preset.rings ?? 0));
  const rings: string[] = [];
  for (let i = 0; i < ringCount; i += 1) {
    rings.push(
      `<circle cx="48" cy="48" r="${round(44 - i * 8)}" fill="none" stroke="${tertiary}" stroke-opacity="0.14" stroke-width="1"/>`,
    );
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${AVATAR_VIEWBOX} ${AVATAR_VIEWBOX}" width="${AVATAR_VIEWBOX}" height="${AVATAR_VIEWBOX}" aria-hidden="true">`,
    "<defs>",
    `<linearGradient id="${uid}" x1="${angle.x1}" y1="${angle.y1}" x2="${angle.x2}" y2="${angle.y2}">`,
    `<stop offset="0" stop-color="${bgDeep}"/>`,
    `<stop offset="1" stop-color="${bgTint}"/>`,
    "</linearGradient>",
    `<radialGradient id="${uid}-glow" cx="0.5" cy="0.38" r="0.8">`,
    `<stop offset="0" stop-color="${primary}" stop-opacity="0.16"/>`,
    `<stop offset="0.55" stop-color="${secondary}" stop-opacity="0.06"/>`,
    `<stop offset="1" stop-color="${base}" stop-opacity="0"/>`,
    "</radialGradient>",
    "</defs>",
    `<rect width="${AVATAR_VIEWBOX}" height="${AVATAR_VIEWBOX}" fill="url(#${uid})"/>`,
    `<rect width="${AVATAR_VIEWBOX}" height="${AVATAR_VIEWBOX}" fill="url(#${uid}-glow)"/>`,
    ...rings,
    ...shapes,
    "</svg>",
  ].join("");
}

/* ──────────────────────────────── store ─────────────────────────────────── */

function isPresetId(value: string): boolean {
  return AVATAR_PRESETS.some((preset) => preset.id === value);
}

/** Public Storage URLs written by `avatarStorage` (http(s), modest length). */
function isRemoteAvatarUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith("https://") || value.startsWith("http://")) &&
    value.length <= 2048
  );
}

/** Build an upload state; `remoteUrl` is kept only when present. */
export function buildUploadedAvatar(
  dataUrl: string,
  remoteUrl?: string,
): AvatarUpload {
  const state: AvatarUpload = { kind: "upload", dataUrl };
  if (typeof remoteUrl === "string" && remoteUrl) state.remoteUrl = remoteUrl;
  return state;
}

/** Validate a stored value; anything malformed reads as "no choice". */
export function parseAvatarState(raw: string | null): AvatarState {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    if (record.kind === "preset") {
      return typeof record.presetId === "string" &&
        isPresetId(record.presetId)
        ? { kind: "preset", presetId: record.presetId }
        : null;
    }
    if (record.kind === "nft") {
      return typeof record.seed === "string" &&
        record.seed.length > 0 &&
        record.seed.length <= 120
        ? { kind: "nft", seed: record.seed }
        : null;
    }
    if (record.kind === "upload") {
      if (
        typeof record.dataUrl !== "string" ||
        !record.dataUrl.startsWith("data:image/") ||
        record.dataUrl.length > MAX_STORED_AVATAR_BYTES * 2
      ) {
        return null;
      }
      const state: AvatarUpload = { kind: "upload", dataUrl: record.dataUrl };
      if (isRemoteAvatarUrl(record.remoteUrl)) {
        state.remoteUrl = record.remoteUrl;
      }
      return state;
    }
    return null;
  } catch {
    return null;
  }
}

export function getAvatar(): AvatarState {
  return parseAvatarState(readRaw(AVATAR_STORAGE_KEY));
}

function dispatchAvatarChange(): void {
  try {
    if (typeof window === "undefined") return;
    if (typeof CustomEvent !== "function") return;
    window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT));
  } catch {
    /* events unavailable — ignore */
  }
}

export function setAvatar(state: AvatarState): void {
  if (state === null) {
    removeRaw(AVATAR_STORAGE_KEY);
  } else {
    writeRaw(AVATAR_STORAGE_KEY, JSON.stringify(state));
  }
  dispatchAvatarChange();
}

export function clearAvatar(): void {
  setAvatar(null);
}

/** Subscribe to avatar writes — same tab (CustomEvent) and other tabs. */
export function onAvatarChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStoreEvent = () => callback();
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === AVATAR_STORAGE_KEY) callback();
  };
  window.addEventListener(AVATAR_CHANGE_EVENT, onStoreEvent);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(AVATAR_CHANGE_EVENT, onStoreEvent);
    window.removeEventListener("storage", onStorage);
  };
}

/* ──────────────────────────────── upload ────────────────────────────────── */

const JPEG_QUALITIES = [0.86, 0.74, 0.62, 0.5];

export interface UploadLike {
  type?: string;
  size?: number;
}

/** Pure size/type guard — unit-testable without canvas or FileReader. */
export function validateAvatarUpload(file: UploadLike): void {
  if (typeof file.size !== "number" || file.size <= 0) {
    throw new Error("That file looks empty — pick an image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That image is over 8 MB — pick a smaller one.");
  }
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("That file isn't an image — pick a JPG, PNG, or WebP.");
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Couldn't read that image — try another file."));
    };
    reader.onerror = () =>
      reject(new Error("Couldn't read that image — try another file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Couldn't decode that image — try a JPG or PNG."));
    image.src = source;
  });
}

/**
 * Read a photo and return a 256x256 cover-cropped JPEG data URL. Rejects
 * files over 8 MB or non-images, and steps quality down until the stored
 * result fits under ~200 KB.
 */
export async function readUpload(file: File): Promise<string> {
  validateAvatarUpload(file);
  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  if (!image.width || !image.height) {
    throw new Error("Couldn't decode that image — try a JPG or PNG.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_UPLOAD_SIZE;
  canvas.height = AVATAR_UPLOAD_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Couldn't process that image — try another file.");
  }

  const scale = Math.max(
    AVATAR_UPLOAD_SIZE / image.width,
    AVATAR_UPLOAD_SIZE / image.height,
  );
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(
    image,
    (AVATAR_UPLOAD_SIZE - width) / 2,
    (AVATAR_UPLOAD_SIZE - height) / 2,
    width,
    height,
  );

  for (const quality of JPEG_QUALITIES) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_STORED_AVATAR_BYTES) return dataUrl;
  }
  throw new Error("That photo won't compress well — try a simpler image.");
}
