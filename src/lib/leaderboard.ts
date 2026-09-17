import type { ProgressMap } from "@/lib/progress";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  solved: number;
  streak: number;
  isYou?: boolean;
}

const USERNAME_KEY = "deepforge:username:v1";
const USERNAME_CHANGE_EVENT = "deepforge:username-change";
const DEFAULT_USERNAME = "you";
const DAY_MS = 24 * 60 * 60 * 1000;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;

const RESERVED_USERNAMES = new Set([
  "anon",
  "anonymous",
  "admin",
  "deepforge",
  "zero",
]);

function normalizeUsername(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

const usernameStore = createStore<string>({
  id: "username",
  storageKey: USERNAME_KEY,
  event: USERNAME_CHANGE_EVENT,
  empty: () => DEFAULT_USERNAME,
  parse: (raw) => (raw && raw.trim() ? raw.trim() : DEFAULT_USERNAME),
  serialize: (v) => v,
});

function localDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

function collectSolvedDays(progress: ProgressMap): number[] {
  const days = new Set<number>();
  for (const entry of Object.values(progress)) {
    if (!entry.solved || !entry.solvedAt) continue;
    const date = new Date(entry.solvedAt);
    if (Number.isNaN(date.getTime())) continue;
    days.add(localDayNumber(date));
  }
  return [...days].sort((a, b) => b - a);
}

export function getCurrentStreak(progress: ProgressMap): number {
  const days = collectSolvedDays(progress);
  if (days.length === 0) return 0;
  const today = localDayNumber(new Date());
  if (days[0] !== today && days[0] !== today - 1) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i] !== days[i - 1] - 1) break;
    streak += 1;
  }
  return streak;
}

export function getLongestStreak(progress: ProgressMap): number {
  const days = collectSolvedDays(progress);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < days.length; i += 1) {
    run = i > 0 && days[i] === days[i - 1] - 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  return longest;
}

/**
 * Validate and normalize a display username.
 *
 * Rules: trimmed; 3–24 characters; letters, digits, `_`, `-`, and single
 * internal spaces only; no leading/trailing `_` or `-`; not a reserved name.
 * Returns the normalized value (repeated whitespace collapsed) or a friendly
 * error suitable for inline display.
 */
export function validateUsername(raw: string): {
  value: string | null;
  error: string | null;
} {
  const value = normalizeUsername(raw);
  if (!value) return { value: null, error: "Enter a username." };
  if (value.length < USERNAME_MIN_LENGTH || value.length > USERNAME_MAX_LENGTH) {
    return {
      value: null,
      error: `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters.`,
    };
  }
  if (!/^[A-Za-z0-9_ -]+$/.test(value)) {
    return { value: null, error: "Use only letters, numbers, spaces, _ and -." };
  }
  if (/^[_-]|[_-]$/.test(value)) {
    return { value: null, error: "Username can't start or end with _ or -." };
  }
  if (RESERVED_USERNAMES.has(value.toLowerCase())) {
    return { value: null, error: "That username is reserved." };
  }
  return { value, error: null };
}

export function getUserName(): string {
  return usernameStore.get();
}

export function setUserName(name: string): void {
  usernameStore.set(normalizeUsername(name) || DEFAULT_USERNAME);
}

export const USERNAME_SPEC: StoreSpec<string> = {
  id: "username",
  storageKey: USERNAME_KEY,
  event: USERNAME_CHANGE_EVENT,
  empty: () => "",
  parse: (raw) => (raw && raw.trim() ? raw.trim() : ""),
  serialize: (v) => v,
};
