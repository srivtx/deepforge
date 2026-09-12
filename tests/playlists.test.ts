import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  addToPlaylist,
  createPlaylist,
  decodePlaylist,
  deletePlaylist,
  duplicatePlaylist,
  encodePlaylist,
  forkPlaylist,
  getPlaylists,
  playlistProgress,
  removeFromPlaylist,
  renamePlaylist,
  reorderPlaylist,
} from "@/lib/playlists";
import { PROBLEMS } from "@/data/problems";

function createStorageStub(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

const globalScope = globalThis as unknown as { window?: unknown };
let originalWindow: unknown;
let hadWindow = false;
let stub: Storage;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

const allIds = PROBLEMS.map((problem) => problem.id);
const sortedIds = [...allIds].sort();

describe("playlist share codes", () => {
  test("round-trips unicode names, descriptions, and a long list", () => {
    const ids = allIds.slice(0, 400);
    const code = encodePlaylist({
      name: "Ünïcode — 日本語 🚀",
      description: "emoji ✅, accents é, math ∑, kanji 漢字",
      itemIds: ids,
    });

    expect(code.length).toBeGreaterThan(0);
    expect(code).not.toContain("=");
    expect(code).not.toContain("+");
    expect(code).not.toContain("/");

    const decoded = decodePlaylist(code);
    expect(decoded).not.toBeNull();
    expect(decoded!.name).toBe("Ünïcode — 日本語 🚀");
    expect(decoded!.description).toBe("emoji ✅, accents é, math ∑, kanji 漢字");
    expect(decoded!.itemIds).toEqual(ids);
  });

  test("drops unknown ids and caps long lists at 500", () => {
    const ids = allIds.slice(0, 520);
    const capped = decodePlaylist(encodePlaylist({ name: "Big", itemIds: ids }));
    expect(capped).not.toBeNull();
    expect(capped!.itemIds).toHaveLength(500);
    expect(capped!.itemIds).toEqual(ids.slice(0, 500));

    const mixed = encodePlaylist({
      name: "Mixed",
      itemIds: ["not-a-problem", ids[0], "ghost-999", ids[1], ids[0]],
    });
    const decoded = decodePlaylist(mixed);
    expect(decoded!.itemIds).toEqual([ids[0], ids[1]]);
  });

  test("rejects malformed codes and unknown index payloads", () => {
    expect(decodePlaylist("")).toBeNull();
    expect(decodePlaylist("!!!not-base64!!!")).toBeNull();
    expect(decodePlaylist("{invalid")).toBeNull();
    expect(decodePlaylist(btoa(JSON.stringify({ v: 2, n: "x", ids: [] })))).toBeNull();
    expect(decodePlaylist(btoa(JSON.stringify({ v: 1, n: "", ids: [] })))).toBeNull();
    expect(decodePlaylist(btoa(JSON.stringify({ v: 1, n: "x", ids: "nope" })))).toBeNull();

    const handmade = btoa(
      JSON.stringify({ v: 1, n: "Handmade", ids: [0, -3, 99999999, 1] }),
    );
    const decoded = decodePlaylist(handmade);
    expect(decoded).not.toBeNull();
    expect(decoded!.itemIds).toEqual([sortedIds[0], sortedIds[1]]);
  });
});

describe("playlist storage", () => {
  test("createPlaylist filters unknown and duplicate ids", () => {
    const created = createPlaylist("Focus", [
      allIds[0],
      "ghost-001",
      allIds[0],
      allIds[1],
    ]);
    expect(created.itemIds).toEqual([allIds[0], allIds[1]]);
    expect(created.description).toBeUndefined();
    expect(getPlaylists()).toHaveLength(1);
    expect(getPlaylists()[0].itemIds).toEqual([allIds[0], allIds[1]]);
  });

  test("reorderPlaylist moves items and ignores out-of-range moves", () => {
    const [a, b, c, d] = allIds;
    const playlist = createPlaylist("Order", [a, b, c, d]);

    const moved = reorderPlaylist(playlist.id, 0, 2);
    expect(moved).not.toBeNull();
    expect(moved!.itemIds).toEqual([b, c, a, d]);

    const back = reorderPlaylist(playlist.id, 3, 1);
    expect(back!.itemIds).toEqual([b, d, c, a]);

    const same = reorderPlaylist(playlist.id, 1, 1);
    expect(same!.itemIds).toEqual([b, d, c, a]);

    const negative = reorderPlaylist(playlist.id, -1, 0);
    expect(negative!.itemIds).toEqual([b, d, c, a]);

    const overflow = reorderPlaylist(playlist.id, 0, 99);
    expect(overflow!.itemIds).toEqual([b, d, c, a]);

    expect(reorderPlaylist("missing-id", 0, 1)).toBeNull();
    expect(getPlaylists()[0].itemIds).toEqual([b, d, c, a]);
  });

  test("duplicatePlaylist and forkPlaylist both suffix names with a fresh id", () => {
    const [a, b] = allIds;
    const original = createPlaylist("Arrays", [a, b]);

    const copy = duplicatePlaylist(original.id);
    expect(copy).not.toBeNull();
    expect(copy!.id).not.toBe(original.id);
    expect(copy!.name).toBe("Arrays (copy)");
    expect(copy!.itemIds).toEqual([a, b]);

    const forked = forkPlaylist(encodePlaylist({ name: "Fork me", itemIds: [a, b] }));
    expect(forked).not.toBeNull();
    expect(forked!.name).toBe("Fork me (fork)");
    expect(forked!.itemIds).toEqual([a, b]);
    expect(getPlaylists()).toHaveLength(3);

    expect(duplicatePlaylist("missing-id")).toBeNull();
    expect(forkPlaylist("!!!bad!!!")).toBeNull();
  });

  test("duplicate names are allowed and keep distinct records", () => {
    const first = createPlaylist("Same name", [allIds[0]]);
    const second = createPlaylist("Same name", [allIds[1]]);
    expect(first.id).not.toBe(second.id);
    const same = getPlaylists().filter((p) => p.name === "Same name");
    expect(same).toHaveLength(2);
    expect(same.map((p) => p.itemIds[0]).sort()).toEqual(
      [allIds[0], allIds[1]].sort(),
    );
  });

  test("add, remove, rename, delete, and progress behave as documented", () => {
    const [a, b, c] = allIds;
    const playlist = createPlaylist("Edit me", [a, b]);

    expect(addToPlaylist(playlist.id, "ghost-001")).toBeNull();

    const added = addToPlaylist(playlist.id, c);
    expect(added!.itemIds).toEqual([a, b, c]);
    const again = addToPlaylist(playlist.id, c);
    expect(again!.itemIds).toEqual([a, b, c]);

    const removed = removeFromPlaylist(playlist.id, b);
    expect(removed!.itemIds).toEqual([a, c]);

    expect(renamePlaylist(playlist.id, "   ")).toBeNull();
    const renamed = renamePlaylist(playlist.id, "  Renamed  ");
    expect(renamed!.name).toBe("Renamed");

    expect(playlistProgress({ itemIds: [a, b, c] }, new Set([a, c]))).toEqual({
      solved: 2,
      total: 3,
    });

    deletePlaylist(playlist.id);
    expect(getPlaylists()).toHaveLength(0);
  });

  test("unreadable storage falls back to an empty library", () => {
    stub.setItem("deepforge:playlists:v1", "{not json");
    expect(getPlaylists()).toEqual([]);

    stub.setItem("deepforge:playlists:v1", "42");
    expect(getPlaylists()).toEqual([]);

    stub.setItem("deepforge:playlists:v1", JSON.stringify([{ id: "x" }]));
    expect(getPlaylists()).toEqual([]);
  });
});
