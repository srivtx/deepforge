/**
 * localStorage-backed user collections, plus URL share-code helpers.
 *
 * A collection is just a named list of problem ids. Nothing here validates
 * that the ids exist — callers should filter against the problem catalog.
 *
 * Persistence routes through the local-first sync seam (`createStore`).
 */

import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

export interface UserCollection {
  id: string;
  name: string;
  description: string;
  problemIds: string[];
  createdAt: string;
  updatedAt: string;
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

type StoredCollection = Omit<UserCollection, "updatedAt"> & {
  updatedAt?: string;
};

function isStoredCollection(value: unknown): value is StoredCollection {
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

function parseCollections(raw: string | null): UserCollection[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredCollection).map((collection) => ({
      ...collection,
      updatedAt:
        typeof collection.updatedAt === "string" && collection.updatedAt
          ? collection.updatedAt
          : collection.createdAt,
    }));
  } catch {
    return [];
  }
}

const collectionsStore = createStore<UserCollection[]>({
  id: "collections",
  storageKey: STORAGE_KEY,
  event: COLLECTIONS_CHANGE_EVENT,
  empty: () => [],
  parse: parseCollections,
  serialize: (v) => JSON.stringify(v),
});

export function getUserCollections(): UserCollection[] {
  return collectionsStore.get();
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
  const now = new Date().toISOString();
  const collection: UserCollection = {
    id: makeId(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    problemIds: [...new Set(draft.problemIds)],
    createdAt: now,
    updatedAt: now,
  };
  const all = collectionsStore.get();
  all.push(collection);
  collectionsStore.set(all);
  return collection;
}

/** Patch an existing collection. Returns the updated record, or null. */
export function updateUserCollection(
  id: string,
  patch: Partial<UserCollectionDraft>,
): UserCollection | null {
  const all = collectionsStore.get();
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
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  collectionsStore.set(all);
  return updated;
}

export function deleteUserCollection(id: string): void {
  const all = collectionsStore.get();
  const next = all.filter((c) => c.id !== id);
  if (next.length === all.length) return;
  collectionsStore.set(next);
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

export const COLLECTIONS_SPEC: StoreSpec<UserCollection[]> = {
  id: "collections",
  storageKey: STORAGE_KEY,
  event: COLLECTIONS_CHANGE_EVENT,
  empty: () => [],
  parse: parseCollections,
  serialize: (v) => JSON.stringify(v),
};
