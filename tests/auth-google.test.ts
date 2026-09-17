import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getAuthEmail,
  isGoogleEnabled,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth";
import { isSupabaseConfigured, setCachedSession } from "@/lib/sync/backend";
import {
  setRemoteClient,
  type RemoteClient,
  type RemoteError,
  type RemoteResult,
  type RemoteSession,
} from "@/lib/sync/remote";

/* ────────────────────────────── test window ─────────────────────────────── */

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
    location: {
      origin: "http://localhost:3001",
      pathname: "/",
      href: "http://localhost:3001/",
    },
    dispatchEvent: () => true,
  };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk_test";
  setCachedSession(null);
  setRemoteClient(null);
});

afterEach(() => {
  setRemoteClient(null);
  setCachedSession(null);
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

/* ─────────────────────────── fake supabase client ───────────────────────── */

class FakeAuth {
  calls: string[] = [];
  lastOtp: { email: string; options?: { emailRedirectTo?: string } } | null = null;
  lastOAuth: { provider: string; options?: { redirectTo?: string } } | null = null;
  oauthError: RemoteError | null = null;
  oauthThrows: unknown = null;

  async getSession(): Promise<RemoteResult<{ session: RemoteSession | null }>> {
    this.calls.push("getSession");
    return { data: { session: null }, error: null };
  }

  onAuthStateChange(
    _callback: (event: string, session: RemoteSession | null) => void,
  ): { data: { subscription: { unsubscribe: () => void } } } {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  async signInWithOtp(args: {
    email: string;
    options?: { emailRedirectTo?: string };
  }): Promise<RemoteResult<unknown>> {
    this.calls.push("signInWithOtp");
    this.lastOtp = args;
    return { data: {}, error: null };
  }

  async signInWithOAuth(args: {
    provider: string;
    options?: { redirectTo?: string };
  }): Promise<RemoteResult<unknown>> {
    this.calls.push("signInWithOAuth");
    this.lastOAuth = args;
    if (this.oauthThrows) throw this.oauthThrows;
    return { data: {}, error: this.oauthError };
  }

  async signOut(): Promise<RemoteResult<unknown>> {
    this.calls.push("signOut");
    return { data: {}, error: null };
  }
}

function makeFakeClient(): { client: RemoteClient; auth: FakeAuth } {
  const auth = new FakeAuth();
  const client = {
    auth,
    from: () => {
      throw new Error("database is not used by the auth tests");
    },
  } as unknown as RemoteClient;
  return { client, auth };
}

/* ──────────────────────────── signInWithGoogle ──────────────────────────── */

describe("signInWithGoogle", () => {
  test("returns a friendly error without throwing when unconfigured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const { client, auth } = makeFakeClient();
    setRemoteClient(client);

    const result = await signInWithGoogle();

    expect(result.error).toBe("Sync is not configured.");
    expect(auth.calls).not.toContain("signInWithOAuth");
    expect(isGoogleEnabled()).toBe(false);
  });

  test("starts the Google provider flow with the origin + path redirect", async () => {
    const { client, auth } = makeFakeClient();
    setRemoteClient(client);

    const result = await signInWithGoogle();

    expect(result.error).toBeNull();
    expect(auth.lastOAuth?.provider).toBe("google");
    expect(auth.lastOAuth?.options?.redirectTo).toBe("http://localhost:3001/");
    expect(isGoogleEnabled()).toBe(true);
  });

  test("maps a returned provider error to the { error } shape", async () => {
    const { client, auth } = makeFakeClient();
    auth.oauthError = { message: "Provider is not enabled." };
    setRemoteClient(client);

    const result = await signInWithGoogle();

    expect(result.error).toBe("Provider is not enabled.");
  });

  test("maps thrown errors instead of throwing", async () => {
    const { client, auth } = makeFakeClient();
    auth.oauthThrows = new Error("network unavailable");
    setRemoteClient(client);

    const result = await signInWithGoogle();

    expect(result.error).toBe("network unavailable");
  });
});

/* ───────────────────────── existing auth surface ────────────────────────── */

describe("existing auth surface", () => {
  test("signInWithEmail still sends an OTP with the origin + path redirect", async () => {
    const { client, auth } = makeFakeClient();
    setRemoteClient(client);

    const result = await signInWithEmail(" ada@example.com ");

    expect(result.error).toBeNull();
    expect(auth.calls).toContain("signInWithOtp");
    expect(auth.lastOtp?.email).toBe("ada@example.com");
    expect(auth.lastOtp?.options?.emailRedirectTo).toBe("http://localhost:3001/");
    expect(auth.lastOAuth).toBeNull();
  });

  test("signInWithEmail is unchanged when unconfigured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const result = await signInWithEmail("ada@example.com");

    expect(result.error).toBe("Sync is not configured.");
  });

  test("getAuthEmail reflects the cached session", () => {
    expect(getAuthEmail()).toBeNull();
    setCachedSession({ userId: "u-1", email: "ada@example.com" });
    expect(getAuthEmail()).toBe("ada@example.com");
  });

  test("isSupabaseConfigured tracks the env pair and isGoogleEnabled follows", () => {
    expect(isSupabaseConfigured()).toBe(true);
    expect(isGoogleEnabled()).toBe(true);

    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(isSupabaseConfigured()).toBe(false);
    expect(isGoogleEnabled()).toBe(false);
  });
});
