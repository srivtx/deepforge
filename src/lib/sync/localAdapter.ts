/**
 * Thin, SSR-safe wrapper over `window.localStorage`. Every call fails soft:
 * storage being unavailable (SSR, private mode, quota) yields null / no-op
 * and never throws.
 */

export function readRaw(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeRaw(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    /* quota exceeded or storage unavailable — silently ignore */
  }
}

export function removeRaw(key: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable — silently ignore */
  }
}
