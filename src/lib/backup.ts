/**
 * Local backup: export, import, and clear every "deepforge:" localStorage
 * key. All app data lives in the browser under that prefix, so one JSON
 * file is enough to move progress between devices.
 *
 * Export is generic: every `deepforge:` key is included except the
 * device-bound keys in `BACKUP_EXCLUDED_KEYS`, so stores added later are
 * never silently dropped. `BACKUP_INCLUDED_KEYS` is the audited inventory
 * that the source-scan test in `tests/backup.test.ts` checks every
 * `deepforge:` literal in `src/lib` against.
 */

const STORAGE_PREFIX = "deepforge:";
const BACKUP_APP = "deepforge";
const BACKUP_VERSION = 1;

export interface ProgressBackupFile {
  app: "deepforge";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

export interface ImportResult {
  imported: number;
  error: string | null;
}

/**
 * Every storage key a backup is expected to carry, audited against the
 * `deepforge:` literals in `src/lib`. Kept explicit so the inventory test
 * fails when a store is added without being classified. Export and import
 * do NOT read this list: they iterate the prefix generically (minus
 * `BACKUP_EXCLUDED_KEYS`) so later stores and dynamic keys like
 * `deepforge:assistant:<problemId>` travel without edits here.
 */
export const BACKUP_INCLUDED_KEYS = [
  "deepforge:progress:v1",
  "deepforge:daily:v1",
  "deepforge:contests:v1",
  "deepforge:collections:v1",
  "deepforge:interview:v1",
  "deepforge:penpaper:v1",
  "deepforge:labs",
  "deepforge:research:v1",
  "deepforge:reviews:v1",
  "deepforge:explanations:v1",
  "deepforge:explain-prefs:v1",
  "deepforge:concepts:v1",
  "deepforge:bug-hunt:v1",
  "deepforge:agentic-round:v1",
  "deepforge:username:v1",
  "deepforge:notebook:v1",
  "deepforge:playlists:v1",
  "deepforge:certificates:v1",
  "deepforge:reminders:v1",
  "deepforge:readiness-goal:v1",
  "deepforge:placement:v1",
  "deepforge:placement-draft:v1",
  "deepforge:checkpoint-attempts:v1",
  "deepforge:avatar:v1",
  "deepforge:assistant:v1",
  "deepforge:assistant-hidden:v1",
  "deepforge:lab-reviews:v1",
  "deepforge:submissions:v1",
  "deepforge:runs:v1",
  "deepforge:comments:v1",
  "deepforge:forum",
  "deepforge:groups:v1",
  "deepforge:badge-dates:v1",
  "deepforge:xp:v1",
  "deepforge:quests:v1",
] as const;

/**
 * Dynamic key families included by prefix. The assistant keeps per-problem
 * scratch chats under `deepforge:assistant:<problemId>`; the generic prefix
 * sweep exports them like any other key.
 */
export const BACKUP_INCLUDED_KEY_PREFIXES = ["deepforge:assistant:"] as const;

/**
 * `deepforge:` literals in `src/lib` that never name a storage key: the
 * shared prefix itself and in-app event channels that do not end in
 * `-change` (which the inventory test filters separately).
 */
export const BACKUP_NON_STORAGE_LITERALS = [
  "deepforge:",
  "deepforge:reminder",
] as const;

/**
 * Keys deliberately left out of export and import. Each is device-bound
 * state rather than learner data, so carrying it across devices would
 * mislead the restored app:
 *
 * - `deepforge:session:v1` — cached auth session (user id + email only).
 *   supabase-js stores the actual tokens under `sb-<ref>-auth-token`, which
 *   is outside our prefix and never travels in a backup. Restoring the
 *   marker on another device would select the remote backend with no valid
 *   credentials and point sync at the exporting account's user id.
 * - `deepforge:sync:v1` — per-device "last synced" stamp; importing another
 *   device's stamp would misreport sync freshness until the next sync.
 * - `deepforge:pyodide-worker` — manual execution-mode switch (worker vs
 *   main thread); an environment flag, not progress.
 * - `deepforge:pwa-hint-dismissed` — install-hint dismissal written by
 *   `PwaManager.tsx`; device UI state, and a new device should show its own
 *   hint. (Not under `src/lib`, so it only appears in pre-classification
 *   backups.)
 */
export const BACKUP_EXCLUDED_KEYS: Readonly<Record<string, string>> = {
  "deepforge:session:v1":
    "device-bound auth session marker; tokens live outside the backup prefix",
  "deepforge:sync:v1":
    "per-device last-synced stamp, misleading on another device",
  "deepforge:pyodide-worker":
    "manual execution-mode switch, an environment flag not learner data",
  "deepforge:pwa-hint-dismissed":
    "device install-hint dismissal, not learner data",
};

/** True when a key must never be exported or restored. */
export function isBackupExcludedKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(BACKUP_EXCLUDED_KEYS, key);
}

/**
 * Every `deepforge:*` change event a store dispatches, replayed after an
 * import so open views re-read the restored data instead of staying stale.
 *
 * Source of truth: the `new CustomEvent(...)` call sites and `createStore` /
 * sync store specs under `src/lib` (the source-scan test in
 * `tests/backup.test.ts` fails if this list drifts in either direction).
 */
export const PROGRESS_CHANGE_EVENTS = [
  "deepforge:progress-change",
  "deepforge:contest-change",
  "deepforge:collections-change",
  "deepforge:comments-change",
  "deepforge:daily-change",
  "deepforge:penpaper-change",
  "deepforge:interview-change",
  "deepforge:username-change",
  "deepforge:lab-change",
  "deepforge:research-change",
  "deepforge:reviews-change",
  "deepforge:explanation-change",
  "deepforge:forum-change",
  "deepforge:notebook-change",
  "deepforge:assistant-change",
  "deepforge:playlists-change",
  "deepforge:runs-change",
  "deepforge:submissions-change",
  "deepforge:concepts-change",
  "deepforge:certificates-change",
  "deepforge:agentic-change",
  "deepforge:avatar-change",
  "deepforge:readiness-goal-change",
  "deepforge:reminders-change",
  "deepforge:placement-change",
  "deepforge:sync-change",
  "deepforge:groups-change",
  "deepforge:checkpoint-change",
  "deepforge:bug-hunt-change",
  "deepforge:lab-reviews-change",
  "deepforge:assistant-hidden-change",
] as const;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** All "deepforge:" keys, sorted for deterministic output. */
function listKeys(store: Storage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i += 1) {
    try {
      const key = store.key(i);
      if (key !== null && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    } catch {
      /* skip unreadable entries */
    }
  }
  keys.sort();
  return keys;
}

function dispatchChangeEvents(): void {
  if (typeof window === "undefined") return;
  for (const event of PROGRESS_CHANGE_EVENTS) {
    try {
      window.dispatchEvent(new CustomEvent(event));
    } catch {
      /* events unavailable — ignore */
    }
  }
}

/** Build a deterministic JSON backup of every "deepforge:" key. */
export function exportProgress(): string {
  const data: Record<string, string> = {};
  const store = getStorage();
  if (store) {
    for (const key of listKeys(store)) {
      if (isBackupExcludedKey(key)) continue;
      try {
        const value = store.getItem(key);
        if (value !== null) data[key] = value;
      } catch {
        /* skip unreadable entries */
      }
    }
  }
  const backup: ProgressBackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Restore keys from a backup JSON string. Existing keys are preserved
 * unless opts.replace is true. Never throws; returns the number of keys
 * written plus an error message when something was wrong.
 */
export function importProgress(
  json: string,
  opts?: { replace?: boolean },
): ImportResult {
  try {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return { imported: 0, error: "That file is not valid JSON." };
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { imported: 0, error: "Unrecognized backup format." };
    }
    const backup = parsed as Record<string, unknown>;
    if (backup.app !== BACKUP_APP) {
      return { imported: 0, error: "This file is not a DeepForge backup." };
    }
    if (backup.version !== BACKUP_VERSION) {
      return {
        imported: 0,
        error: `Unsupported backup version (${String(backup.version)}).`,
      };
    }
    if (
      typeof backup.data !== "object" ||
      backup.data === null ||
      Array.isArray(backup.data)
    ) {
      return { imported: 0, error: "Backup is missing its data." };
    }

    const entries = Object.entries(backup.data as Record<string, unknown>);
    for (const [, value] of entries) {
      if (typeof value !== "string") {
        return { imported: 0, error: "Backup contains an invalid value." };
      }
    }

    const store = getStorage();
    if (!store) {
      return { imported: 0, error: "Browser storage is not available." };
    }
    const replace = opts?.replace === true;

    let imported = 0;
    let failed = 0;
    for (const [key, value] of entries) {
      if (!key.startsWith(STORAGE_PREFIX)) continue;
      if (isBackupExcludedKey(key)) continue;
      if (!replace) {
        let existing: string | null = null;
        try {
          existing = store.getItem(key);
        } catch {
          existing = null;
        }
        if (existing !== null) continue;
      }
      try {
        store.setItem(key, value as string);
        imported += 1;
      } catch {
        failed += 1;
      }
    }

    if (imported > 0) dispatchChangeEvents();
    if (failed > 0) {
      return {
        imported,
        error: `Imported ${imported} key${imported === 1 ? "" : "s"}, but ${failed} could not be saved (storage may be full).`,
      };
    }
    return { imported, error: null };
  } catch {
    return { imported: 0, error: "Import failed unexpectedly." };
  }
}

/** Remove every "deepforge:" key. Returns how many were removed. */
export function clearAllProgress(): number {
  const store = getStorage();
  if (!store) return 0;
  let removed = 0;
  for (const key of listKeys(store)) {
    try {
      store.removeItem(key);
      removed += 1;
    } catch {
      /* skip entries that cannot be removed */
    }
  }
  if (removed > 0) dispatchChangeEvents();
  return removed;
}
