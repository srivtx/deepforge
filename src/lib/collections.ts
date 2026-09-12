/**
 * localStorage-backed user collections, plus URL share-code helpers.
 *
 * A collection is just a named list of problem ids. Nothing here validates
 * that the ids exist — callers should filter against the problem catalog.
 */

export interface UserCollection {
  id: string;
  name: string;
  description: string;
  problemIds: string[];
  createdAt: string;
}

export interface UserCollectionDraft {
  name: string;
  description: string;
  problemIds: string[];
}

const STORAGE_KEY = "deepforge:collections:v1";

export const COLLECTIONS_CHANGE_EVENT = "deepforge:collections-change";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isUserCollection(value: unknown): value is UserCollection {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.description === "string" &&
    isStringArray(v.problemIds) &&
    typeof v.createdAt === "string"
  );
}

function read(): UserCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isUserCollection);
  } catch {
    return [];
  }
}

function write(collections: UserCollection[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    window.dispatchEvent(new CustomEvent(COLLECTIONS_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function getUserCollections(): UserCollection[] {
  return read();
}

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `col-${crypto.randomUUID()}`;
  }
  return `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Create a collection and persist it. Returns the saved record. */
export function saveUserCollection(draft: UserCollectionDraft): UserCollection {
  const collection: UserCollection = {
    id: makeId(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    problemIds: [...new Set(draft.problemIds)],
    createdAt: new Date().toISOString(),
  };
  const all = read();
  all.push(collection);
  write(all);
  return collection;
}

/** Patch an existing collection. Returns the updated record, or null. */
export function updateUserCollection(
  id: string,
  patch: Partial<UserCollectionDraft>,
): UserCollection | null {
  const all = read();
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const current = all[index];
  const updated: UserCollection = {
    ...current,
    name: patch.name !== undefined ? patch.name.trim() : current.name,
    description:
      patch.description !== undefined
        ? patch.description.trim()
        : current.description,
    problemIds:
      patch.problemIds !== undefined
        ? [...new Set(patch.problemIds)]
        : current.problemIds,
  };
  all[index] = updated;
  write(all);
  return updated;
}

export function deleteUserCollection(id: string): void {
  const all = read();
  const next = all.filter((c) => c.id !== id);
  if (next.length === all.length) return;
  write(next);
}

/* ── Share codes: base64url-encoded JSON arrays of problem ids ── */

/** Encode a list of problem ids into a URL-safe, padding-free share code. */
export function encodeCollection(problemIds: string[]): string {
  try {
    const json = JSON.stringify(problemIds);
    const base64 = btoa(json);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

/** Decode a share code. Returns a string array, or null if malformed. */
export function decodeCollection(code: string): string[] | null {
  try {
    const base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const parsed: unknown = JSON.parse(json);
    if (!isStringArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
