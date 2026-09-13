/**
 * localStorage-backed user playlists, plus URL share-code helpers.
 *
 * A playlist is a named, ordered list of problem ids. Share codes are
 * base64url-encoded JSON that stores catalogue *indexes* instead of full
 * problem ids, which keeps links short. Indexes come from a sorted view of
 * the catalogue so codes stay stable when new problems are appended to it.
 */

import { PROBLEM_META } from "@/data/problems/problem-meta";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
}

/** Payload carried by a share code, before it is forked into a playlist. */
export interface SharedPlaylist {
  name: string;
  description?: string;
  itemIds: string[];
}

const STORAGE_KEY = "deepforge:playlists:v1";

export const PLAYLISTS_CHANGE_EVENT = "deepforge:playlists-change";

const CODE_VERSION = 1;
const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;
const MAX_ITEMS = 500;
const MAX_CODE_LENGTH = 20_000;
const FALLBACK_NAME = "Untitled playlist";

/**
 * Stable, compact problem-id map: catalogue ids sorted lexicographically.
 * The position in this array is what gets serialized into share codes.
 */
const PROBLEM_IDS: string[] = PROBLEM_META.map((p) => p.id).sort();
const ID_TO_INDEX = new Map<string, number>(
  PROBLEM_IDS.map((id, index) => [id, index]),
);

interface StoredPlaylist {
  id: string;
  name: string;
  description?: string;
  itemIds: string[];
  createdAt: string;
  updatedAt?: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStoredPlaylist(value: unknown): value is StoredPlaylist {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    (v.description === undefined || typeof v.description === "string") &&
    isStringArray(v.itemIds) &&
    typeof v.createdAt === "string" &&
    (v.updatedAt === undefined || typeof v.updatedAt === "string")
  );
}

/** Drop unknown, duplicate, and over-cap ids while preserving order. */
function sanitizeIds(ids: readonly string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string" || seen.has(id) || !ID_TO_INDEX.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length >= MAX_ITEMS) break;
  }
  return result;
}

function normalize(stored: StoredPlaylist): Playlist {
  const name = stored.name.trim().slice(0, MAX_NAME_LENGTH) || FALLBACK_NAME;
  const description = stored.description
    ?.trim()
    .slice(0, MAX_DESCRIPTION_LENGTH);
  return {
    id: stored.id,
    name,
    description: description || undefined,
    itemIds: sanitizeIds(stored.itemIds),
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt ?? stored.createdAt,
  };
}

function read(): Playlist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredPlaylist).map(normalize);
  } catch {
    return [];
  }
}

function write(playlists: Playlist[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    window.dispatchEvent(new CustomEvent(PLAYLISTS_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `pl-${crypto.randomUUID()}`;
  }
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getPlaylists(): Playlist[] {
  return read();
}

/** Create a playlist and persist it. Returns the saved record. */
export function createPlaylist(
  name: string,
  itemIds: string[] = [],
  description = "",
): Playlist {
  const now = new Date().toISOString();
  const cleanDescription = description.trim().slice(0, MAX_DESCRIPTION_LENGTH);
  const playlist: Playlist = {
    id: makeId(),
    name: name.trim().slice(0, MAX_NAME_LENGTH) || FALLBACK_NAME,
    description: cleanDescription || undefined,
    itemIds: sanitizeIds(itemIds),
    createdAt: now,
    updatedAt: now,
  };
  const all = read();
  all.push(playlist);
  write(all);
  return playlist;
}

/** Patch a playlist's name. Returns the updated record, or null. */
export function renamePlaylist(id: string, name: string): Playlist | null {
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!trimmed) return null;
  const all = read();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: Playlist = {
    ...all[index],
    name: trimmed,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  write(all);
  return updated;
}

export function deletePlaylist(id: string): void {
  const all = read();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return;
  write(next);
}

/** Append a problem to a playlist. No-op when it is unknown or already in. */
export function addToPlaylist(id: string, problemId: string): Playlist | null {
  if (!ID_TO_INDEX.has(problemId)) return null;
  const all = read();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const current = all[index];
  if (current.itemIds.includes(problemId)) return current;
  if (current.itemIds.length >= MAX_ITEMS) return current;
  const updated: Playlist = {
    ...current,
    itemIds: [...current.itemIds, problemId],
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  write(all);
  return updated;
}

/** Remove a problem from a playlist. No-op when it is not in the list. */
export function removeFromPlaylist(
  id: string,
  problemId: string,
): Playlist | null {
  const all = read();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const current = all[index];
  if (!current.itemIds.includes(problemId)) return current;
  const updated: Playlist = {
    ...current,
    itemIds: current.itemIds.filter((item) => item !== problemId),
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  write(all);
  return updated;
}

/** Move an item between two positions. Out-of-range moves are ignored. */
export function reorderPlaylist(
  id: string,
  fromIndex: number,
  toIndex: number,
): Playlist | null {
  const all = read();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const current = all[index];
  const items = [...current.itemIds];
  const valid =
    Number.isInteger(fromIndex) &&
    Number.isInteger(toIndex) &&
    fromIndex >= 0 &&
    fromIndex < items.length &&
    toIndex >= 0 &&
    toIndex < items.length;
  if (!valid || fromIndex === toIndex) return current;
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  const updated: Playlist = {
    ...current,
    itemIds: items,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  write(all);
  return updated;
}

/** Copy a playlist into a new record with a fresh id. */
export function duplicatePlaylist(id: string): Playlist | null {
  const all = read();
  const source = all.find((p) => p.id === id);
  if (!source) return null;
  const now = new Date().toISOString();
  const copy: Playlist = {
    ...source,
    id: makeId(),
    name: `${source.name.slice(0, MAX_NAME_LENGTH)} (copy)`,
    itemIds: [...source.itemIds],
    createdAt: now,
    updatedAt: now,
  };
  all.push(copy);
  write(all);
  return copy;
}

/* ── Base64url helpers (UTF-8 safe) ── */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string | null {
  try {
    const base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

interface SharePayload {
  v: number;
  n: string;
  d?: string;
  ids: number[];
}

/**
 * Encode a playlist into a URL-safe, padding-free share code. Uses index
 * positions into the stable problem map so a 10-item list stays well under
 * 200 characters.
 */
export function encodePlaylist(
  playlist: Pick<Playlist, "name" | "description" | "itemIds">,
): string {
  try {
    const ids: number[] = [];
    for (const itemId of playlist.itemIds) {
      const index = ID_TO_INDEX.get(itemId);
      if (index !== undefined) ids.push(index);
    }
    const description = playlist.description
      ?.trim()
      .slice(0, MAX_DESCRIPTION_LENGTH);
    const payload: SharePayload = {
      v: CODE_VERSION,
      n: playlist.name.trim().slice(0, MAX_NAME_LENGTH) || FALLBACK_NAME,
      ...(description ? { d: description } : {}),
      ids: [...new Set(ids)].slice(0, MAX_ITEMS),
    };
    return toBase64Url(JSON.stringify(payload));
  } catch {
    return "";
  }
}

/**
 * Decode a share code. Invalid ids are dropped, lengths are clamped, and
 * malformed input returns null instead of throwing.
 */
export function decodePlaylist(code: string): SharedPlaylist | null {
  if (typeof code !== "string") return null;
  const trimmed = code.trim();
  if (!trimmed || trimmed.length > MAX_CODE_LENGTH) return null;
  try {
    const json = fromBase64Url(trimmed);
    if (json === null) return null;
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return null;
    const payload = parsed as Record<string, unknown>;
    if (payload.v !== CODE_VERSION) return null;
    if (typeof payload.n !== "string") return null;
    const name = payload.n.trim().slice(0, MAX_NAME_LENGTH);
    if (!name) return null;
    const description =
      typeof payload.d === "string"
        ? payload.d.trim().slice(0, MAX_DESCRIPTION_LENGTH)
        : "";
    if (!Array.isArray(payload.ids)) return null;
    const itemIds: string[] = [];
    const seen = new Set<number>();
    for (const value of payload.ids) {
      if (typeof value !== "number" || !Number.isInteger(value)) continue;
      if (seen.has(value)) continue;
      if (value < 0 || value >= PROBLEM_IDS.length) continue;
      seen.add(value);
      itemIds.push(PROBLEM_IDS[value]);
      if (itemIds.length >= MAX_ITEMS) break;
    }
    return description ? { name, description, itemIds } : { name, itemIds };
  } catch {
    return null;
  }
}

/** Fork a share code into the user's library with a fresh id. */
export function forkPlaylist(code: string): Playlist | null {
  const decoded = decodePlaylist(code);
  if (!decoded) return null;
  return createPlaylist(
    `${decoded.name} (fork)`,
    decoded.itemIds,
    decoded.description ?? "",
  );
}

/** Solved/total counts for one playlist against the user's solved set. */
export function playlistProgress(
  playlist: Pick<Playlist, "itemIds">,
  solvedIds: Set<string>,
): { solved: number; total: number } {
  let solved = 0;
  for (const id of playlist.itemIds) {
    if (solvedIds.has(id)) solved += 1;
  }
  return { solved, total: playlist.itemIds.length };
}
