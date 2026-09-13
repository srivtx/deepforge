import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  AVATAR_CHANGE_EVENT,
  AVATAR_PRESETS,
  AVATAR_STORAGE_KEY,
  MAX_UPLOAD_BYTES,
  buildUploadedAvatar,
  generateAvatarSvg,
  getAvatar,
  onAvatarChange,
  parseAvatarState,
  readUpload,
  resolvePresetForSeed,
  setAvatar,
  validateAvatarUpload,
} from "@/lib/avatars";
import {
  AVATAR_BUCKET,
  avatarObjectPath,
  fetchAvatarUrl,
  removeAvatarImage,
  uploadAvatarImage,
} from "@/lib/avatarStorage";
import { CHARACTER_ART } from "@/components/avatars/characters";
import { setCachedSession } from "@/lib/sync/backend";
import { setRemoteClient, type RemoteClient } from "@/lib/sync/remote";

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
let savedSupabaseUrl: string | undefined;
let savedSupabaseKey: string | undefined;
let originalFetch: typeof fetch;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  globalScope.window = createWindowStub();
  savedSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  savedSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  originalFetch = globalThis.fetch;
  setCachedSession(null);
  setRemoteClient(null);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  setRemoteClient(null);
  setCachedSession(null);
  if (savedSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = savedSupabaseUrl;
  if (savedSupabaseKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = savedSupabaseKey;
  }
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

/* ─────────────────────────── fake storage client ────────────────────────── */

interface RecordedUpload {
  path: string;
  file: Blob;
  options?: { upsert?: boolean; contentType?: string };
}

class FakeBucket {
  uploads: RecordedUpload[] = [];
  removals: string[][] = [];
  uploadError: { message?: string } | null = null;
  removeError: { message?: string } | null = null;
  requested: string[] = [];

  async upload(
    path: string,
    file: Blob,
    options?: { upsert?: boolean; contentType?: string },
  ): Promise<{ error: { message?: string } | null }> {
    this.uploads.push({ path, file, options });
    return { error: this.uploadError };
  }

  async remove(paths: string[]): Promise<{ error: { message?: string } | null }> {
    this.removals.push(paths);
    return { error: this.removeError };
  }

  getPublicUrl(path: string): { data: { publicUrl: string } } {
    return {
      data: {
        publicUrl: `https://example.supabase.co/storage/v1/object/public/avatars/${path}`,
      },
    };
  }
}

function makeFakeStorageClient(bucket: FakeBucket): RemoteClient {
  return {
    auth: {},
    from: () => {
      throw new Error("database not used by avatar storage");
    },
    storage: {
      from: (name: string) => {
        bucket.requested.push(name);
        return bucket;
      },
    },
  } as unknown as RemoteClient;
}

function stubFetch(blob = new Blob(["jpeg-bytes"], { type: "image/jpeg" })): void {
  globalThis.fetch = (async () => ({
    blob: async () => blob,
  })) as unknown as typeof fetch;
}

const DATA_URL = "data:image/jpeg;base64,AAAA";
const USER_ID = "u-1";

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

  test("preset catalog is 10-40 unique, palette-rich entries", () => {
    expect(AVATAR_PRESETS.length).toBeGreaterThanOrEqual(10);
    expect(AVATAR_PRESETS.length).toBeLessThanOrEqual(40);
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

describe("character art presets", () => {
  const artPresets = AVATAR_PRESETS.filter((preset) => preset.art);

  test("twelve character presets carry unique art ids", () => {
    expect(artPresets).toHaveLength(12);
    expect(new Set(artPresets.map((preset) => preset.art)).size).toBe(12);
    for (const preset of artPresets) {
      expect(preset.palette.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("every art id resolves to a character renderer", () => {
    expect(Object.keys(CHARACTER_ART)).toHaveLength(12);
    for (const preset of artPresets) {
      expect(typeof CHARACTER_ART[preset.art as string]).toBe("function");
    }
  });

  test("art presets round-trip through the store and resolve for seeds", () => {
    for (const preset of artPresets) {
      setAvatar({ kind: "preset", presetId: preset.id });
      expect(getAvatar()).toEqual({ kind: "preset", presetId: preset.id });
      const svg = generateAvatarSvg("material_mia", preset);
      expect(svg).toContain('viewBox="0 0 96 96"');
      expect(svg).toContain(preset.palette[0]);
    }
    expect(resolvePresetForSeed("epoch_emma").id).toBeTruthy();
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

  test("round-trips an upload with a remote URL", () => {
    const remoteUrl =
      "https://example.supabase.co/storage/v1/object/public/avatars/u-1/avatar.jpg?v=2";
    const state = buildUploadedAvatar(DATA_URL, remoteUrl);
    setAvatar(state);
    expect(getAvatar()).toEqual(state);
  });

  test("buildUploadedAvatar omits an absent or empty remote URL", () => {
    expect(buildUploadedAvatar(DATA_URL)).toEqual({
      kind: "upload",
      dataUrl: DATA_URL,
    });
    expect(buildUploadedAvatar(DATA_URL, "")).toEqual({
      kind: "upload",
      dataUrl: DATA_URL,
    });
    expect(buildUploadedAvatar(DATA_URL, "https://x/avatar.jpg?v=2")).toEqual({
      kind: "upload",
      dataUrl: DATA_URL,
      remoteUrl: "https://x/avatar.jpg?v=2",
    });
  });

  test("parseAvatarState keeps valid remote URLs and drops malformed ones", () => {
    const remoteUrl =
      "https://example.supabase.co/storage/v1/object/public/avatars/u-1/avatar.jpg?v=2";
    expect(
      parseAvatarState(
        JSON.stringify({ kind: "upload", dataUrl: DATA_URL, remoteUrl }),
      ),
    ).toEqual({ kind: "upload", dataUrl: DATA_URL, remoteUrl });
    expect(
      parseAvatarState(
        JSON.stringify({
          kind: "upload",
          dataUrl: DATA_URL,
          remoteUrl: "javascript:alert(1)",
        }),
      ),
    ).toEqual({ kind: "upload", dataUrl: DATA_URL });
    expect(
      parseAvatarState(
        JSON.stringify({ kind: "upload", dataUrl: DATA_URL, remoteUrl: 42 }),
      ),
    ).toEqual({ kind: "upload", dataUrl: DATA_URL });
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

describe("avatar storage", () => {
  test("uses the avatars bucket at {userId}/avatar.jpg", () => {
    expect(AVATAR_BUCKET).toBe("avatars");
    expect(avatarObjectPath(USER_ID)).toBe("u-1/avatar.jpg");
  });

  test("upload is a silent no-op when signed out", async () => {
    const bucket = new FakeBucket();
    setRemoteClient(makeFakeStorageClient(bucket));
    const result = await uploadAvatarImage(DATA_URL, USER_ID);
    expect(result).toEqual({ url: null, error: null });
    expect(bucket.requested).toHaveLength(0);
    expect(bucket.uploads).toHaveLength(0);
  });

  test("upload is a silent no-op when no client is available", async () => {
    setCachedSession({ userId: USER_ID, email: null });
    const result = await uploadAvatarImage(DATA_URL, USER_ID);
    expect(result).toEqual({ url: null, error: null });
  });

  test("uploads with upsert + contentType and returns a cache-busted URL", async () => {
    setCachedSession({ userId: USER_ID, email: null });
    const bucket = new FakeBucket();
    setRemoteClient(makeFakeStorageClient(bucket));
    stubFetch();
    const result = await uploadAvatarImage(DATA_URL, USER_ID);
    expect(bucket.requested).toEqual(["avatars"]);
    expect(bucket.uploads).toHaveLength(1);
    expect(bucket.uploads[0].path).toBe("u-1/avatar.jpg");
    expect(bucket.uploads[0].options).toEqual({
      upsert: true,
      contentType: "image/jpeg",
    });
    expect(result.error).toBeNull();
    expect(result.url).toContain(
      "https://example.supabase.co/storage/v1/object/public/avatars/u-1/avatar.jpg",
    );
    expect(result.url).toMatch(/[?&]v=\d+/);
  });

  test("maps upload failures to an error and never throws", async () => {
    setCachedSession({ userId: USER_ID, email: null });
    const bucket = new FakeBucket();
    bucket.uploadError = { message: "row-level security policy violation" };
    setRemoteClient(makeFakeStorageClient(bucket));
    stubFetch();
    const result = await uploadAvatarImage(DATA_URL, USER_ID);
    expect(result.url).toBeNull();
    expect(result.error).toBe("row-level security policy violation");
  });

  test("remove deletes the user's object and maps failures", async () => {
    setCachedSession({ userId: USER_ID, email: null });
    const bucket = new FakeBucket();
    setRemoteClient(makeFakeStorageClient(bucket));
    expect(await removeAvatarImage(USER_ID)).toEqual({ error: null });
    expect(bucket.removals).toEqual([["u-1/avatar.jpg"]]);
    bucket.removeError = { message: "permission denied" };
    expect(await removeAvatarImage(USER_ID)).toEqual({
      error: "permission denied",
    });
  });

  test("remove is a silent no-op when signed out", async () => {
    const bucket = new FakeBucket();
    setRemoteClient(makeFakeStorageClient(bucket));
    expect(await removeAvatarImage(USER_ID)).toEqual({ error: null });
    expect(bucket.removals).toHaveLength(0);
  });

  test("fetchAvatarUrl builds a cache-busted URL without uploading", async () => {
    const bucket = new FakeBucket();
    setRemoteClient(makeFakeStorageClient(bucket));
    const url = await fetchAvatarUrl(USER_ID);
    expect(url).toContain(
      "https://example.supabase.co/storage/v1/object/public/avatars/u-1/avatar.jpg",
    );
    expect(url).toMatch(/[?&]v=\d+/);
    expect(bucket.uploads).toHaveLength(0);
    expect(bucket.requested).toEqual(["avatars"]);
  });

  test("fetchAvatarUrl returns null with no client or no userId", async () => {
    expect(await fetchAvatarUrl(USER_ID)).toBeNull();
    expect(await fetchAvatarUrl("")).toBeNull();
  });
});
