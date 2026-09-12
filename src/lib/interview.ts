/**
 * localStorage-backed interview session results.
 *
 * One result records a single timed interview attempt for a track. The
 * score is computed by the UI as solved * 10 - seconds / 60, floored at 0.
 */

const STORAGE_KEY = "deepforge:interview:v1";

export const INTERVIEW_CHANGE_EVENT = "deepforge:interview-change";

export interface InterviewResult {
  trackId: string;
  solved: number;
  total: number;
  seconds: number;
  completedAt: string;
}

function read(): InterviewResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InterviewResult[]) : [];
  } catch {
    return [];
  }
}

function write(results: InterviewResult[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    window.dispatchEvent(new CustomEvent(INTERVIEW_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function getInterviewResults(): InterviewResult[] {
  try {
    return read();
  } catch {
    return [];
  }
}

/**
 * Persist one completed session. Returns the stored result with its
 * completion timestamp.
 */
export function saveInterviewResult(
  result: Omit<InterviewResult, "completedAt">,
): InterviewResult {
  const stored: InterviewResult = {
    trackId: result.trackId,
    solved: Math.max(0, Math.round(result.solved)),
    total: Math.max(0, Math.round(result.total)),
    seconds: Math.max(0, Math.round(result.seconds)),
    completedAt: new Date().toISOString(),
  };
  try {
    const all = read();
    all.push(stored);
    write(all);
  } catch {
    /* storage unavailable — still return the result for the UI */
  }
  return stored;
}

/**
 * Best attempt for a track: most solved, then fastest, then most recent.
 */
export function getBestInterviewResult(trackId: string): InterviewResult | null {
  try {
    const results = read().filter((r) => r.trackId === trackId);
    if (results.length === 0) return null;
    return results.reduce((best, r) => {
      if (r.solved > best.solved) return r;
      if (r.solved === best.solved && r.seconds < best.seconds) return r;
      if (
        r.solved === best.solved &&
        r.seconds === best.seconds &&
        r.completedAt > best.completedAt
      ) {
        return r;
      }
      return best;
    });
  } catch {
    return null;
  }
}

export function clearInterviewResults(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(INTERVIEW_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}
