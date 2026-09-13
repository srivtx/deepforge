/**
 * Backend selection for the local-first sync seam.
 *
 * The app is always fully functional against localStorage. A "remote"
 * backend is selected only when both Supabase env vars are present AND a
 * cached session exists. This file performs no network calls and no
 * top-level awaits: it only caches a session marker and schedules debounced
 * flushes that a future remote engine registers a syncer for.
 *
 * Session caching stores user id + email only (mirrored to
 * `deepforge:session:v1`) — tokens never touch our keys; supabase-js keeps
 * its own session under `sb-<ref>-auth-token`.
 */

import type { StoreId } from "@/lib/sync/types";

export interface UserSession {
  userId: string;
  email: string | null;
}

const SESSION_STORAGE_KEY = "deepforge:session:v1";
const DEBOUNCE_MS = 1500;

type Syncer = (id: StoreId) => Promise<void>;

let cachedSession: UserSession | null | undefined;
const sessionListeners = new Set<(s: UserSession | null) => void>();
const backendListeners = new Set<() => void>();
let syncer: Syncer | null = null;
let supabaseModule: Promise<any | null> | null = null;
const pendingFlushes = new Map<StoreId, ReturnType<typeof setTimeout>>();
let pageListenersAttached = false;

/** Both public Supabase env vars must be present. */
export function isSupabaseConfigured(): boolean {
  try {
    if (typeof process === "undefined" || !process.env) return false;
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  } catch {
    return false;
  }
}

function readStoredSession(): UserSession | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const value = parsed as Record<string, unknown>;
    if (typeof value.userId !== "string" || value.userId.length === 0) {
      return null;
    }
    return {
      userId: value.userId,
      email: typeof value.email === "string" ? value.email : null,
    };
  } catch {
    return null;
  }
}

/** The cached session, lazily hydrated from localStorage. */
export function getCachedSession(): UserSession | null {
  if (cachedSession === undefined) cachedSession = readStoredSession();
  return cachedSession;
}

/** Cache a session (or clear it). Mirrors id/email to localStorage only. */
export function setCachedSession(s: UserSession | null): void {
  cachedSession = s;
  try {
    if (typeof window !== "undefined") {
      if (s === null) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        window.localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ userId: s.userId, email: s.email }),
        );
      }
    }
  } catch {
    /* storage unavailable — in-memory cache still works */
  }
  for (const cb of [...sessionListeners]) {
    try {
      cb(s);
    } catch {
      /* listener errors must not break the write path */
    }
  }
  for (const cb of [...backendListeners]) {
    try {
      cb();
    } catch {
      /* ignore */
    }
  }
}

/** "remote" only when configured AND a session exists. */
export function selectBackend(): "local" | "remote" {
  return isSupabaseConfigured() && getCachedSession() !== null
    ? "remote"
    : "local";
}

export function onSessionChange(
  cb: (s: UserSession | null) => void,
): () => void {
  sessionListeners.add(cb);
  return () => {
    sessionListeners.delete(cb);
  };
}

/** Fires whenever the session (and therefore the selected backend) changes. */
export function onBackendChange(cb: () => void): () => void {
  backendListeners.add(cb);
  return () => {
    backendListeners.delete(cb);
  };
}

const SUPABASE_PACKAGE = "@supabase/supabase-js";

function loadSupabase(): Promise<any | null> {
  const specifier = SUPABASE_PACKAGE;
  return import(specifier).catch(() => null);
}

/**
 * Cached dynamic import of supabase-js. Returns null when Supabase is not
 * configured or the package is not installed, so callers silently stay local.
 */
export function getSupabase(): Promise<any | null> {
  if (!isSupabaseConfigured()) return Promise.resolve(null);
  if (supabaseModule === null) supabaseModule = loadSupabase();
  return supabaseModule;
}

async function runSyncer(id: StoreId): Promise<void> {
  if (selectBackend() !== "remote") return;
  const fn = syncer;
  if (fn === null) return;
  try {
    await fn(id);
  } catch {
    /* remote failures never block the local write */
  }
}

function flushPending(): void {
  for (const [id, timer] of [...pendingFlushes]) {
    clearTimeout(timer);
    pendingFlushes.delete(id);
    void runSyncer(id);
  }
}

function attachPageListeners(): void {
  if (pageListenersAttached || typeof window === "undefined") return;
  if (typeof window.addEventListener !== "function") return;
  pageListenersAttached = true;
  window.addEventListener("pagehide", flushPending);
  window.addEventListener("visibilitychange", () => {
    try {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        flushPending();
      }
    } catch {
      /* ignore */
    }
  });
}

/**
 * Called by every store after a local write. When a remote session is
 * active, schedules a debounced flush (~1.5s per store id); otherwise it is
 * a no-op and the app stays purely local.
 */
export function notifyLocalWrite(id: StoreId): void {
  if (selectBackend() !== "remote") return;
  const existing = pendingFlushes.get(id);
  if (existing !== undefined) clearTimeout(existing);
  attachPageListeners();
  pendingFlushes.set(
    id,
    setTimeout(() => {
      pendingFlushes.delete(id);
      void runSyncer(id);
    }, DEBOUNCE_MS),
  );
}

/** The remote engine (Phase 2) registers its per-store push function here. */
export function registerSyncer(fn: (id: StoreId) => Promise<void>): void {
  syncer = fn;
}
