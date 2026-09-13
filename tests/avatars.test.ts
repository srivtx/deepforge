import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  AVATAR_CHANGE_EVENT,
  AVATAR_PRESETS,
  AVATAR_STORAGE_KEY,
  MAX_UPLOAD_BYTES,
  generateAvatarSvg,
  getAvatar,
  onAvatarChange,
  parseAvatarState,
  readUpload,
  resolvePresetForSeed,
  setAvatar,
  validateAvatarUpload,
} from "@/lib/avatars";

type Listener = (event: Event) => void;

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

function createWindowStub() {
  const listeners = new Map<string, Set<Listener>>();
  return {
    localStorage: createStorageStub(),
    addEventListener(type: string, listener: Listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: Listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent(event: Event) {
      for (const listener of [...(listeners.get(event.type) ?? [])]) {
        listener(event);
      }
      return true;
    },
  };
}

const globalScope = globalThis as unknown as { window?: unknown };
let originalWindow: unknown;
let hadWindow = false;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  globalScope.window = createWindowStub();
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

describe("generateAvatarSvg", () => {
  test("same seed and preset produce identical SVG", () => {
    const preset = AVATAR_PRESETS[0];
    const first = generateAvatarSvg("tensor_tina", preset);
    const second = generateAvatarSvg("tensor_tina", preset);
    expect(first).toBe(second);
  });

  test("different seeds produce different art", () => {
    const preset = AVATAR_PRESETS[2];
    const a = generateAvatarSvg("backprop_bella", preset);
    const b = generateAvatarSvg("dropout_dan", preset);
    expect(a === b).toBe(false);
  });

  test("different presets produce different art for the same seed", () => {
    const first = generateAvatarSvg("matrix_mo", AVATAR_PRESETS[2]);
    const second = generateAvatarSvg("matrix_mo", AVATAR_PRESETS[5]);
    expect(first === second).toBe(false);
  });

  test("every preset renders a closed 96x96 svg with its base colour", () => {
    for (const preset of AVATAR_PRESETS) {
      const svg = generateAvatarSvg("you", preset);
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      expect(svg).toContain('viewBox="0 0 96 96"');
      expect(svg).toContain(preset.palette[0]);
    }
  });

  test("preset catalog is 10-14 unique, palette-rich entries", () => {
    expect(AVATAR_PRESETS.length).toBeGreaterThanOrEqual(10);
    expect(AVATAR_PRESETS.length).toBeLessThanOrEqual(14);
    const ids = new Set(AVATAR_PRESETS.map((preset) => preset.id));
    expect(ids.size).toBe(AVATAR_PRESETS.length);
    for (const preset of AVATAR_PRESETS) {
      expect(preset.palette.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("blank seeds fall back to the anon seed", () => {
    const preset = AVATAR_PRESETS[1];
    expect(generateAvatarSvg("", preset)).toBe(generateAvatarSvg("anon", preset));
    expect(generateAvatarSvg("   ", preset)).toBe(generateAvatarSvg("anon", preset));
  });
});

describe("resolvePresetForSeed", () => {
  test("is stable for the same seed", () => {
    const first = resolvePresetForSeed("epoch_emma");
    const second = resolvePresetForSeed("epoch_emma");
    expect(first.id).toBe(second.id);
  });

  test("always returns a catalog preset", () => {
    const ids = new Set(AVATAR_PRESETS.map((preset) => preset.id));
    for (const seed of ["", "a", "you", "relu_raj", "vanishing_vic", "🤖"]) {
      expect(ids.has(resolvePresetForSeed(seed).id)).toBe(true);
    }
  });

  test("blank seeds resolve like anon", () => {
    expect(resolvePresetForSeed("  ").id).toBe(resolvePresetForSeed("anon").id);
  });
});

describe("avatar store", () => {
  test("starts empty and round-trips a preset", () => {
    expect(getAvatar()).toBeNull();
    setAvatar({ kind: "preset", presetId: "nebula" });
    expect(getAvatar()).toEqual({ kind: "preset", presetId: "nebula" });
  });

  test("round-trips an upload data URL", () => {
    const dataUrl = "data:image/jpeg;base64,AAAA";
    setAvatar({ kind: "upload", dataUrl });
    expect(getAvatar()).toEqual({ kind: "upload", dataUrl });
  });

  test("null clears the stored entry", () => {
    setAvatar({ kind: "preset", presetId: "mint" });
    setAvatar(null);
    expect(getAvatar()).toBeNull();
    const storage = (globalScope.window as { localStorage: Storage })
      .localStorage;
    expect(storage.getItem(AVATAR_STORAGE_KEY)).toBeNull();
  });

  test("fires the change event and unsubscribes cleanly", () => {
    let calls = 0;
    const off = onAvatarChange(() => {
      calls += 1;
    });
    setAvatar({ kind: "preset", presetId: "volt" });
    expect(calls).toBe(1);
    off();
    setAvatar({ kind: "preset", presetId: "sand" });
    expect(calls).toBe(1);
  });

  test("dispatches the documented event name", () => {
    let calls = 0;
    const listener = () => {
      calls += 1;
    };
    window.addEventListener(AVATAR_CHANGE_EVENT, listener);
    setAvatar(null);
    expect(calls).toBe(1);
    window.removeEventListener(AVATAR_CHANGE_EVENT, listener);
  });

  test("malformed stored values parse as no choice", () => {
    expect(parseAvatarState(null)).toBeNull();
    expect(parseAvatarState("{not json")).toBeNull();
    expect(parseAvatarState("[]")).toBeNull();
    expect(
      parseAvatarState(JSON.stringify({ kind: "preset", presetId: "nope" })),
    ).toBeNull();
    expect(
      parseAvatarState(JSON.stringify({ kind: "upload", dataUrl: "https://x" })),
    ).toBeNull();
  });
});

describe("upload validation", () => {
  test("accepts a small image", () => {
    validateAvatarUpload({ type: "image/png", size: 1024 });
  });

  test("rejects files over 8 MB with a friendly error", () => {
    let message = "";
    try {
      validateAvatarUpload({ type: "image/jpeg", size: MAX_UPLOAD_BYTES + 1 });
    } catch (error) {
      message = error instanceof Error ? error.message : "";
    }
    expect(message).toContain("8 MB");
  });

  test("rejects non-images with a friendly error", () => {
    let message = "";
    try {
      validateAvatarUpload({ type: "application/pdf", size: 1024 });
    } catch (error) {
      message = error instanceof Error ? error.message : "";
    }
    expect(message).toContain("isn't an image");
  });

  test("readUpload rejects oversize and non-image files before any decode", async () => {
    let rejected = false;
    try {
      await readUpload({
        type: "text/plain",
        size: 10,
      } as unknown as File);
    } catch {
      rejected = true;
    }
    expect(rejected).toBe(true);

    rejected = false;
    try {
      await readUpload({
        type: "image/png",
        size: MAX_UPLOAD_BYTES + 1,
      } as unknown as File);
    } catch {
      rejected = true;
    }
    expect(rejected).toBe(true);

    rejected = false;
    try {
      await readUpload({ type: "image/png", size: 0 } as unknown as File);
    } catch {
      rejected = true;
    }
    expect(rejected).toBe(true);
  });
});
