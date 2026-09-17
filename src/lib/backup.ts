/**
 * Local backup: export, import, and clear every "deepforge:" localStorage
 * key. All app data lives in the browser under that prefix, so one JSON
 * file is enough to move progress between devices.
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
