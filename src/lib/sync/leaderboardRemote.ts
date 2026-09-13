/**
 * Read-only access to the Supabase `leaderboard` view.
 *
 * The view is `security_invoker` over publicly selectable `user_stats`, so it
 * is readable with just the publishable key — no session required. Every
 * function here fails soft: no I/O at import time and no call ever throws.
 *
 * View columns (supabase/migrations/20260913000000_init.sql):
 *   username, score, solved, current_streak, longest_streak, updated_at
 */

import type { LeaderboardEntry } from "@/lib/leaderboard";
import { isSupabaseConfigured } from "@/lib/sync/backend";
import { getRemoteClient } from "@/lib/sync/remote";
import type { RemoteResult } from "@/lib/sync/remote";

export const GLOBAL_LEADERBOARD_DEFAULT_LIMIT = 50;

export const GLOBAL_LEADERBOARD_COLUMNS =
  "username, score, solved, current_streak, longest_streak, updated_at";

/** A global row in the same shape the local leaderboard renders. */
export interface GlobalLeaderboardRow extends LeaderboardEntry {
  longestStreak: number;
  updatedAt: string | null;
}

export interface GlobalLeaderboardResult {
  rows: GlobalLeaderboardRow[];
  error: string | null;
}

/**
 * `remote.ts` predates the leaderboard and its frozen `RemoteQuery` type does
 * not declare `order`/`limit`; the real supabase-js builder has both. This
 * local view of the builder keeps the cast in one place.
 */
interface OrderedQuery extends PromiseLike<RemoteResult<any[]>> {
  order(column: string, options?: { ascending?: boolean }): OrderedQuery;
  limit(count: number): OrderedQuery;
}

function messageOf(error: unknown): string {
  if (!error) return "Failed to load the global leaderboard.";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const value = error as { message?: unknown };
    if (typeof value.message === "string" && value.message) return value.message;
  }
  return String(error);
}

function toCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toName(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "anon";
}

function toRow(raw: unknown, index: number): GlobalLeaderboardRow {
  const row =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const name = toName(row.username);
  return {
    id: `global:${index}:${name}`,
    name,
    score: toCount(row.score),
    solved: toCount(row.solved),
    streak: toCount(row.current_streak),
    longestStreak: toCount(row.longest_streak),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

/** True when both Supabase env vars are present (session not required). */
export function isGlobalLeaderboardAvailable(): boolean {
  return isSupabaseConfigured();
}

/**
 * Fetch the top `limit` rows, already ordered by the server (score desc).
 * Returns null when no client is available, `{ rows, error }` otherwise;
 * never throws.
 */
export async function fetchGlobalLeaderboard(
  limit: number = GLOBAL_LEADERBOARD_DEFAULT_LIMIT,
): Promise<GlobalLeaderboardResult | null> {
  const client = await getRemoteClient().catch(() => null);
  if (!client) return null;

  const safeLimit =
    typeof limit === "number" &&
    Number.isFinite(limit) &&
    Math.floor(limit) >= 1
      ? Math.floor(limit)
      : GLOBAL_LEADERBOARD_DEFAULT_LIMIT;

  try {
    const query = client
      .from("leaderboard")
      .select(GLOBAL_LEADERBOARD_COLUMNS) as unknown as OrderedQuery;
    const { data, error } = await query
      .order("score", { ascending: false })
      .limit(safeLimit);
    if (error) return { rows: [], error: messageOf(error) };
    const rows = Array.isArray(data)
      ? data.map((row, index) => toRow(row, index))
      : [];
    return { rows, error: null };
  } catch (error) {
    return { rows: [], error: messageOf(error) };
  }
}
