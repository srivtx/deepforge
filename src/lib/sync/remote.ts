/**
 * Remote sync engine for optional Supabase sync.
 *
 * The app is always fully local: this module only activates when both
 * Supabase env vars are set AND a session exists. Nothing at module scope
 * performs network I/O — supabase-js is imported lazily through
 * `backend.getSupabase()` and the client is created once per page.
 *
 * Contract: every public entry point resolves cleanly and reports failures
 * through the sync state (`deepforge:sync-change`), never by throwing.
 */

import { COLLECTIONS_SPEC } from "@/lib/collections";
import { CONTEST_SPEC } from "@/lib/contestStore";
import { DAILY_SPEC, getDailyState } from "@/lib/daily";
import {
  EXPLANATION_CHANGE_EVENT,
  EXPLANATION_STORAGE_KEY,
  type ExplanationMap,
} from "@/lib/explain";
import { INTERVIEW_SPEC } from "@/lib/interview";
import { LAB_SPEC } from "@/lib/labs";
import {
  getCachedSession,
  getSupabase,
  isSupabaseConfigured,
  notifyLocalWrite,
  registerSyncer,
  setCachedSession,
} from "@/lib/sync/backend";
import { readRaw, writeRaw } from "@/lib/sync/localAdapter";
import {
  mergeCollections,
  mergeContests,
  mergeDaily,
  mergeExplanations,
  mergeInterview,
  mergeLabs,
  mergePenPaper,
  mergeProgress,
  mergeResearch,
  mergeReviews,
  mergeUsername,
  sanitizeExplanationList,
} from "@/lib/sync/remoteMerge";
import type { StoreId, StoreSpec } from "@/lib/sync/types";
import { PENPAPER_SPEC } from "@/lib/penpaper";
import { REVIEWS_SPEC } from "@/lib/reviewQueue";
import {
  getFlameScore,
  getCurrentStreak,
  getLongestStreak,
  getSolvedCount,
  USERNAME_SPEC,
} from "@/lib/leaderboard";
import { PROGRESS_SPEC, getProgress, type ProgressMap } from "@/lib/progress";
import { RESEARCH_SPEC } from "@/lib/research";

/* ────────────────────────────── client types ────────────────────────────── */

export interface RemoteError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface RemoteResult<T = any> {
  data: T;
  error: RemoteError | null;
}

export interface RemoteSession {
  user: { id: string; email?: string | null };
}

export interface RemoteQuery<T = any> extends PromiseLike<RemoteResult<T>> {
  select(columns?: string): RemoteQuery<T>;
  eq(column: string, value: unknown): RemoteQuery<T>;
  maybeSingle(): Promise<RemoteResult<T>>;
  single(): Promise<RemoteResult<T>>;
  upsert(
    values: Record<string, unknown> | Record<string, unknown>[],
    options?: { onConflict?: string },
  ): RemoteQuery<T>;
  insert(values: Record<string, unknown> | Record<string, unknown>[]): RemoteQuery<T>;
  update(values: Record<string, unknown>): RemoteQuery<T>;
}

export interface RemoteClient {
  auth: {
    getSession(): Promise<RemoteResult<{ session: RemoteSession | null }>>;
    onAuthStateChange(
      callback: (event: string, session: RemoteSession | null) => void,
    ): { data?: { subscription?: { unsubscribe?: () => void } } };
    signInWithOtp(args: {
      email: string;
      options?: { emailRedirectTo?: string };
    }): Promise<RemoteResult<unknown>>;
    signOut(): Promise<RemoteResult<unknown>>;
  };
  from(table: string): RemoteQuery;
}

/* ──────────────────────────────── state ─────────────────────────────────── */

export type SyncStatus = "unconfigured" | "signed-out" | "idle" | "syncing" | "error";

export interface SyncState {
  status: SyncStatus;
  email: string | null;
  lastSyncedAt: string | null;
  error: string | null;
}

const SYNC_STATE_KEY = "deepforge:sync:v1";
const SYNC_CHANGE_EVENT = "deepforge:sync-change";

/**
 * Store inventory, audited against every `deepforge:` key in `src/lib/`.
 *
 * Synced through `user_stores`: progress, daily, collections, contests,
 * interview, penpaper, labs (`deepforge:labs`, unversioned), research,
 * reviews, explanations, username.
 *
 * Local-only on purpose (keys that never travel through this engine):
 *   deepforge:avatar:v1          avatars.ts — device-local choice; photos use avatarStorage
 *   deepforge:assistant:v1       assistant.ts — scratch chat (plus per-problem keys)
 *   deepforge:badge-dates:v1     badges.ts — first-seen cache derived from synced stores
 *   deepforge:xp:v1              badges.ts — recomputed XP cache
 *   deepforge:quests:v1          badges.ts — local quest-completion markers
 *   deepforge:certificates:v1    certificates.ts — shareable via credential codes instead
 *   deepforge:concepts:v1        concepts.ts — local concept schedule (no spec/merge yet)
 *   deepforge:notebook:v1        notebook.ts — local code scratch cells
 *   deepforge:playlists:v1       playlists.ts — portable via share codes instead
 *   deepforge:readiness-goal:v1  readiness.ts — device-level target-date plan
 *   deepforge:reminders:v1       reminders.ts — local-only by design (no account)
 *   deepforge:runs:v1            runs.ts — honor-system local speedrun history
 *   deepforge:submissions:v1     submissions.ts — browser-only authoring drafts
 *   deepforge:explain-prefs:v1   explain.ts — per-device gate opt-out
 *   deepforge:comments:v1        comments.ts / social.ts — social engine owns its own tables
 *   deepforge:forum              comments.ts — social engine owns its own tables
 *   deepforge:session:v1         backend.ts — cached auth session (per device)
 *   deepforge:sync:v1            remote.ts — last-synced stamp (per device)
 */
const ALL_STORE_IDS: StoreId[] = [
  "progress",
  "daily",
  "collections",
  "contests",
  "interview",
  "penpaper",
  "labs",
  "research",
  "reviews",
  "explanations",
  "username",
];

/**
 * Sync-side view of `explain.ts`. That module predates its registration and
 * persists through raw read/write instead of `createStore`, so it cannot
 * notify the backend on its own. `attachExplanationBridge` routes its change
 * event through `notifyLocalWrite` at init, giving explanation writes the
 * same debounced push as every other store; full cycles still push/pull.
 */
function parseExplanations(raw: string | null): ExplanationMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const map: ExplanationMap = {};
    for (const [problemId, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      const entries = sanitizeExplanationList(value);
      if (entries.length > 0) map[problemId] = entries;
    }
    return map;
  } catch {
    return {};
  }
}

const EXPLANATIONS_SPEC: StoreSpec<ExplanationMap> = {
  id: "explanations",
  storageKey: EXPLANATION_STORAGE_KEY,
  event: EXPLANATION_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseExplanations,
  serialize: (v) => JSON.stringify(v),
};

const STORE_SPECS: Record<StoreId, StoreSpec<any>> = {
  progress: PROGRESS_SPEC,
  daily: DAILY_SPEC,
  collections: COLLECTIONS_SPEC,
  contests: CONTEST_SPEC,
  interview: INTERVIEW_SPEC,
  penpaper: PENPAPER_SPEC,
  labs: LAB_SPEC,
  research: RESEARCH_SPEC,
  reviews: REVIEWS_SPEC,
  explanations: EXPLANATIONS_SPEC,
  username: USERNAME_SPEC,
};

let injectedClient: RemoteClient | null = null;
let clientPromise: Promise<RemoteClient | null> | null = null;
let initPromise: Promise<void> | null = null;
let authUnsubscribe: (() => void) | null = null;
let busy = false;
let lastError: string | null = null;
let signInTask: Promise<void> | null = null;
const stateListeners = new Set<(state: SyncState) => void>();

/* ─────────────────────────────── helpers ────────────────────────────────── */

function messageOf(error: unknown): string {
  if (!error) return "Sync failed.";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const value = error as { message?: unknown };
    if (typeof value.message === "string" && value.message) return value.message;
  }
  return String(error);
}

function readLastSyncedAt(): string | null {
  const raw = readRaw(SYNC_STATE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as { lastSyncedAt?: unknown }).lastSyncedAt === "string"
    ) {
      return (parsed as { lastSyncedAt: string }).lastSyncedAt;
    }
  } catch {
    return raw;
  }
  return null;
}

function writeLastSyncedAt(value: string): void {
  writeRaw(SYNC_STATE_KEY, value);
}

function currentState(): SyncState {
  const lastSyncedAt = readLastSyncedAt();
  if (!isSupabaseConfigured()) {
    return { status: "unconfigured", email: null, lastSyncedAt, error: null };
  }
  const session = getCachedSession();
  if (!session) {
    return { status: "signed-out", email: null, lastSyncedAt, error: null };
  }
  const status: SyncStatus = busy ? "syncing" : lastError ? "error" : "idle";
  return {
    status,
    email: session.email ?? null,
    lastSyncedAt,
    error: status === "error" ? lastError : null,
  };
}

export function getSyncState(): SyncState {
  return currentState();
}

function emitSyncState(): void {
  const state = currentState();
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(SYNC_CHANGE_EVENT));
    }
  } catch {
    /* events unavailable — listeners below still fire */
  }
  for (const callback of [...stateListeners]) {
    try {
      callback(state);
    } catch {
      /* listener errors must not break the sync path */
    }
  }
}

export function onSyncStateChange(
  callback: (state: SyncState) => void,
): () => void {
  stateListeners.add(callback);
  return () => {
    stateListeners.delete(callback);
  };
}

function dispatchStoreEvent(spec: StoreSpec<any>): void {
  try {
    if (typeof window === "undefined") return;
    if (typeof CustomEvent !== "function") return;
    window.dispatchEvent(new CustomEvent(spec.event));
  } catch {
    /* ignore */
  }
}

let explanationBridgeTarget: unknown = null;

/**
 * `explain.ts` writes through raw storage instead of `createStore`, so it
 * cannot call `notifyLocalWrite` itself. Bridging its change event gives
 * explanation writes the same debounced push as every other synced store.
 * Re-attaches per window object (tests and HMR may swap `window`).
 */
function attachExplanationBridge(): void {
  if (typeof window === "undefined") return;
  if (typeof window.addEventListener !== "function") return;
  if (explanationBridgeTarget === window) return;
  explanationBridgeTarget = window;
  window.addEventListener(EXPLANATION_CHANGE_EVENT, () => {
    notifyLocalWrite("explanations");
  });
}

function applySignedOut(): void {
  setCachedSession(null);
  busy = false;
  lastError = null;
  signInTask = null;
  emitSyncState();
}

/* ────────────────────────────── client ──────────────────────────────────── */

async function createClient(): Promise<RemoteClient | null> {
  try {
    const mod = await getSupabase();
    if (!mod || typeof mod.createClient !== "function") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    const client = mod.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return (client ?? null) as RemoteClient | null;
  } catch {
    return null;
  }
}

/** Cached client: injected one wins, otherwise lazy-create from supabase-js. */
export async function getRemoteClient(): Promise<RemoteClient | null> {
  if (injectedClient) return injectedClient;
  if (!isSupabaseConfigured()) return null;
  if (!clientPromise) clientPromise = createClient();
  return clientPromise;
}

/**
 * Inject a client (tests / embedding). Swapping clients resets engine state;
 * production never needs to call this.
 */
export function setRemoteClient(client: RemoteClient | null): void {
  injectedClient = client;
  if (authUnsubscribe) {
    try {
      authUnsubscribe();
    } catch {
      /* ignore */
    }
    authUnsubscribe = null;
  }
  initPromise = null;
  busy = false;
  lastError = null;
  signInTask = null;
}

export function isRemoteActive(): boolean {
  return isSupabaseConfigured() && getCachedSession() !== null;
}

/* ─────────────────────────── store push / pull ──────────────────────────── */

function mergeStoreValue(id: StoreId, local: any, remote: any): any {
  switch (id) {
    case "progress":
      return mergeProgress(local ?? {}, remote ?? {});
    case "daily":
      return mergeDaily(local ?? {}, remote ?? {});
    case "collections":
      return mergeCollections(local, remote);
    case "contests":
      return mergeContests(local, remote);
    case "interview":
      return mergeInterview(local, remote);
    case "penpaper":
      return mergePenPaper(local ?? {}, remote ?? {});
    case "labs":
      return mergeLabs(local ?? {}, remote ?? {});
    case "research":
      return mergeResearch(local ?? {}, remote ?? {});
    case "reviews":
      return mergeReviews(local ?? {}, remote ?? {});
    case "explanations":
      return mergeExplanations(local ?? {}, remote ?? {});
    case "username":
      return mergeUsername(local, remote);
  }
}

function withDailyDays(progress: ProgressMap, solvedDates: string[]): ProgressMap {
  const merged: ProgressMap = { ...progress };
  for (const date of solvedDates) {
    const key = `daily:${date}`;
    if (!merged[key]) merged[key] = { solved: true, solvedAt: `${date}T12:00:00` };
  }
  return merged;
}

async function pushUserStats(
  client: RemoteClient,
  userId: string,
): Promise<void> {
  const progress = getProgress();
  const daily = getDailyState();
  const streakProgress = withDailyDays(
    progress,
    Array.isArray(daily.solvedDates) ? daily.solvedDates : [],
  );
  const now = new Date().toISOString();
  const { error } = await client.from("user_stats").upsert(
    {
      user_id: userId,
      score: getFlameScore(progress),
      solved: getSolvedCount(progress),
      current_streak: getCurrentStreak(streakProgress),
      longest_streak: getLongestStreak(streakProgress),
      updated_at: now,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message || "Failed to push user stats.");
}

function toJsonValue(value: unknown): unknown {
  try {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? null : JSON.parse(encoded);
  } catch {
    return null;
  }
}

async function pushStore(
  client: RemoteClient,
  userId: string,
  id: StoreId,
): Promise<void> {
  const spec = STORE_SPECS[id];
  const value = spec.parse(readRaw(spec.storageKey));
  if (id === "username" && !value) return;
  const data = toJsonValue(value);
  const { error } = await client.from("user_stores").upsert(
    {
      user_id: userId,
      store_id: id,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,store_id" },
  );
  if (error) throw new Error(error.message || `Failed to push ${id}.`);
  if (id === "progress") await pushUserStats(client, userId);
}

async function pullStore(
  client: RemoteClient,
  userId: string,
  id: StoreId,
): Promise<void> {
  const spec = STORE_SPECS[id];
  const { data, error } = await client
    .from("user_stores")
    .select("data")
    .eq("user_id", userId)
    .eq("store_id", id)
    .maybeSingle();
  if (error) throw new Error(error.message || `Failed to pull ${id}.`);
  if (!data) {
    await pushStore(client, userId, id);
    return;
  }
  const local = spec.parse(readRaw(spec.storageKey));
  const merged = mergeStoreValue(id, local, data.data);
  if (id === "username" && !merged) return;
  writeRaw(spec.storageKey, spec.serialize(merged));
  dispatchStoreEvent(spec);
}

/* ──────────────────────────── public sync API ───────────────────────────── */

/** Push one store from local state. Never throws. */
export async function remotePush(id: StoreId): Promise<void> {
  const client = await getRemoteClient();
  const session = getCachedSession();
  if (!client || !session) return;
  try {
    await pushStore(client, session.userId, id);
    if (lastError) {
      lastError = null;
      emitSyncState();
    }
  } catch (error) {
    lastError = messageOf(error);
    emitSyncState();
  }
}

/** Pull one store, merge with local, and write the result locally. Never throws. */
export async function remotePull(id: StoreId): Promise<void> {
  const client = await getRemoteClient();
  const session = getCachedSession();
  if (!client || !session) return;
  try {
    await pullStore(client, session.userId, id);
    if (lastError) {
      lastError = null;
      emitSyncState();
    }
  } catch (error) {
    lastError = messageOf(error);
    emitSyncState();
  }
}

/** Push every store, pull every store, then stamp `synced_at`. Never throws. */
export async function syncNow(): Promise<void> {
  const client = await getRemoteClient();
  const session = getCachedSession();
  if (!client || !session) return;
  busy = true;
  emitSyncState();
  const errors: string[] = [];
  try {
    for (const id of ALL_STORE_IDS) {
      try {
        await pushStore(client, session.userId, id);
      } catch (error) {
        errors.push(messageOf(error));
      }
    }
    for (const id of ALL_STORE_IDS) {
      try {
        await pullStore(client, session.userId, id);
      } catch (error) {
        errors.push(messageOf(error));
      }
    }
    if (errors.length === 0) {
      const now = new Date().toISOString();
      lastError = null;
      writeLastSyncedAt(now);
      try {
        await client
          .from("profiles")
          .update({ synced_at: now, updated_at: now })
          .eq("id", session.userId);
      } catch {
        /* local lastSyncedAt already recorded */
      }
    } else {
      lastError = errors[0];
    }
  } finally {
    busy = false;
    emitSyncState();
  }
}

/* ─────────────────────────── sign-in / sign-out ─────────────────────────── */

function usernameCandidates(base: string): string[] {
  const clean = base.trim().replace(/\s+/g, " ").slice(0, 40) || "forger";
  const candidates = [clean];
  for (let i = 2; i <= 5; i += 1) candidates.push(`${clean}-${i}`);
  candidates.push(`${clean}-${Date.now().toString(36).slice(-5)}`);
  return candidates;
}

function deriveUsername(email: string | null): string {
  if (!email) return "";
  const local = email.split("@")[0]?.trim();
  return local ?? "";
}

async function upsertProfile(
  client: RemoteClient,
  userId: string,
  base: string,
): Promise<string> {
  let last: RemoteError | null = null;
  for (const username of usernameCandidates(base)) {
    const { error } = await client.from("profiles").upsert(
      { id: userId, username, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
    if (!error) return username;
    last = error;
    if (error.code !== "23505") break;
  }
  throw new Error(last?.message || "Could not claim a username.");
}

async function firstTimeMigration(
  client: RemoteClient,
  userId: string,
): Promise<void> {
  const { data, error } = await client
    .from("user_stores")
    .select("store_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message || "Failed to read remote stores.");
  const hasRemote = Array.isArray(data) && data.length > 0;
  if (hasRemote) {
    for (const id of ALL_STORE_IDS) await pullStore(client, userId, id);
  }
  for (const id of ALL_STORE_IDS) await pushStore(client, userId, id);
}

/**
 * Establish the account after a session appears: claim a username, run the
 * one-time migration (or pull+merge+push on later devices), and record
 * `profiles.synced_at`. Never throws.
 */
export async function afterSignIn(session: RemoteSession): Promise<void> {
  const client = await getRemoteClient();
  const userId = session?.user?.id;
  if (!client || !userId) return;
  try {
    const { data: profile, error } = await client
      .from("profiles")
      .select("username, synced_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message || "Failed to read profile.");

    const localName = USERNAME_SPEC.parse(readRaw(USERNAME_SPEC.storageKey));
    let username = localName;
    if (!username) {
      const remoteName =
        profile && typeof profile.username === "string" ? profile.username.trim() : "";
      username = remoteName || deriveUsername(session.user.email ?? null);
    }
    username = await upsertProfile(client, userId, username);
    if (!localName && username) {
      writeRaw(USERNAME_SPEC.storageKey, username);
      dispatchStoreEvent(USERNAME_SPEC);
    }

    const firstTime = !profile?.synced_at;
    if (firstTime) {
      await firstTimeMigration(client, userId);
      const { error: stampError } = await client
        .from("profiles")
        .update({ synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (stampError) throw new Error(stampError.message || "Failed to stamp synced_at.");
    } else {
      for (const id of ALL_STORE_IDS) await pullStore(client, userId, id);
      for (const id of ALL_STORE_IDS) await pushStore(client, userId, id);
    }
    lastError = null;
    emitSyncState();
  } catch (error) {
    lastError = messageOf(error);
    emitSyncState();
  }
}

function runAfterSignIn(session: RemoteSession): Promise<void> {
  if (signInTask) return signInTask;
  signInTask = afterSignIn(session).finally(() => {
    signInTask = null;
  });
  return signInTask;
}

/** Sign out remotely (best effort) and flip to the signed-out state. */
export async function remoteSignOut(): Promise<void> {
  try {
    const client = await getRemoteClient();
    if (client) await client.auth.signOut();
  } catch {
    /* clearing the cached session below is enough */
  }
  applySignedOut();
}

/* ──────────────────────────────── init ──────────────────────────────────── */

async function initialize(): Promise<void> {
  try {
    const client = await getRemoteClient();
    if (!client) return;
    registerSyncer(remotePush);
    attachExplanationBridge();
    const subscription = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        applySignedOut();
        return;
      }
      if (event === "SIGNED_IN" && session?.user?.id) {
        setCachedSession({
          userId: session.user.id,
          email: session.user.email ?? null,
        });
        void runAfterSignIn(session);
      }
    });
    authUnsubscribe = subscription?.data?.subscription?.unsubscribe ?? null;

    const result = await client.auth.getSession();
    if (result.error) {
      lastError = messageOf(result.error);
      emitSyncState();
    }
    const session = result.data?.session ?? null;
    if (session?.user?.id) {
      setCachedSession({
        userId: session.user.id,
        email: session.user.email ?? null,
      });
      await runAfterSignIn(session);
    }
    emitSyncState();
  } catch (error) {
    lastError = messageOf(error);
    emitSyncState();
  }
}

/**
 * Boot the remote engine. Idempotent; a no-op when Supabase is not
 * configured. Safe to call from a client effect on every mount.
 */
export async function initRemoteSync(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (initPromise) return initPromise;
  initPromise = initialize();
  return initPromise;
}
