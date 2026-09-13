const MAX_PATH_LENGTH = 200;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

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
  if (from?.startsWith("/paths/")) {
    return { href: from, label: "Back to path" };
  }
  if (from?.startsWith("/collections/")) {
    return { href: from, label: "Back to collection" };
  }
  return { href: "/problems", label: "All problems" };
}
