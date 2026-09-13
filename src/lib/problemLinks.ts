const MAX_PATH_LENGTH = 200;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

const BACK_LABELS: [prefix: string, label: string][] = [
  ["/paths/", "Back to path"],
  ["/collections/", "Back to collection"],
  ["/projects", "Back to projects"],
  ["/speedrun", "Back to Speedrun"],
  ["/contests", "Back to contests"],
  ["/interview", "Back to interview prep"],
  ["/daily", "Back to daily challenge"],
  ["/labs", "Back to labs"],
  ["/sims", "Back to sims"],
  ["/math", "Back to math"],
  ["/research", "Back to research"],
  ["/leaderboard", "Back to leaderboard"],
  ["/discuss", "Back to discuss"],
  ["/playlists", "Back to playlists"],
];

export function safeInternalPath(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") return null;
  if (value.length === 0 || value.length > MAX_PATH_LENGTH) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("://")) return null;
  if (value.includes("\\") || CONTROL_CHARS.test(value)) return null;
  return value;
}

export function problemHref(id: string, from?: string | null): string {
  const safeFrom = safeInternalPath(from);
  if (!safeFrom) return `/problems/${id}`;
  return `/problems/${id}?from=${encodeURIComponent(safeFrom)}`;
}

export function backTarget(fromParam: string | null | undefined): {
  href: string;
  label: string;
} {
  const from = safeInternalPath(fromParam);
  if (from) {
    for (const [prefix, label] of BACK_LABELS) {
      const base = prefix.replace(/\/$/, "");
      if (from === base || from.startsWith(`${base}/`)) {
        return { href: from, label };
      }
    }
  }
  return { href: "/problems", label: "All problems" };
}
