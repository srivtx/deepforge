import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  AVATAR_PALETTES,
  rarityScore,
  selectAvatarTraits,
  TRAIT_CATEGORIES,
} from "@/lib/nftAvatar";
import { getAvatar, parseAvatarState, setAvatar } from "@/lib/avatars";

const store = new Map<string, string>();
const windowStub = {
  localStorage: {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
};

const globalScope = globalThis as unknown as { window?: unknown };
let originalWindow: unknown;

beforeEach(() => {
  originalWindow = globalScope.window;
  globalScope.window = windowStub;
  store.clear();
});

afterEach(() => {
  globalScope.window = originalWindow;
});

describe("nft trait catalog", () => {
  test("every category is populated enough to feel collectible", () => {
    expect(TRAIT_CATEGORIES.backgrounds.length).toBeGreaterThanOrEqual(8);
    expect(TRAIT_CATEGORIES.heads.length).toBeGreaterThanOrEqual(8);
    expect(TRAIT_CATEGORIES.eyes.length).toBeGreaterThanOrEqual(8);
    expect(TRAIT_CATEGORIES.mouths.length).toBeGreaterThanOrEqual(8);
    expect(TRAIT_CATEGORIES.headwear.length).toBeGreaterThanOrEqual(8);
    expect(TRAIT_CATEGORIES.accessories.length).toBeGreaterThanOrEqual(8);
    expect(TRAIT_CATEGORIES.clothing.length).toBeGreaterThanOrEqual(6);
    expect(TRAIT_CATEGORIES.extras.length).toBeGreaterThanOrEqual(6);
  });

  test("trait ids are unique inside each category", () => {
    for (const traits of Object.values(TRAIT_CATEGORIES)) {
      const ids = traits.map((trait) => trait.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const trait of traits) {
        expect(trait.weight).toBeGreaterThan(0);
        expect(typeof trait.render).toBe("function");
      }
    }
  });
});

describe("selectAvatarTraits", () => {
  test("is deterministic for a seed", () => {
    const a = selectAvatarTraits("matrix_mo");
    const b = selectAvatarTraits("matrix_mo");
    expect(a.palette).toEqual(b.palette);
    expect(Object.entries(a.traits).map(([k, v]) => [k, v.id])).toEqual(
      Object.entries(b.traits).map(([k, v]) => [k, v.id]),
    );
  });

  test("different seeds can produce different trait stacks", () => {
    const stacks = new Set(
      ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta"].map(
        (seed) =>
          Object.values(selectAvatarTraits(seed).traits)
            .map((trait) => trait.id)
            .join("|"),
      ),
    );
    expect(stacks.size).toBeGreaterThan(1);
  });

  test("palette always comes from the catalog and rarity is bounded", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const selection = selectAvatarTraits(seed);
      expect(
        AVATAR_PALETTES.some(
          (palette) =>
            palette.accent === selection.palette.accent &&
            palette.bg[0] === selection.palette.bg[0],
        ),
      ).toBe(true);
      const score = rarityScore(selection);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(8);
    }
  });
});

describe("nft avatar state", () => {
  test("round-trips through the store", () => {
    setAvatar({ kind: "nft", seed: "reroll-123" });
    expect(getAvatar()).toEqual({ kind: "nft", seed: "reroll-123" });
    setAvatar(null);
    expect(getAvatar()).toBeNull();
  });

  test("parse rejects malformed seeds", () => {
    expect(parseAvatarState(JSON.stringify({ kind: "nft" }))).toBeNull();
    expect(parseAvatarState(JSON.stringify({ kind: "nft", seed: "" }))).toBeNull();
    expect(
      parseAvatarState(JSON.stringify({ kind: "nft", seed: "x".repeat(200) })),
    ).toBeNull();
  });
});
