/**
 * Self-verifying credential codes for issued certificate records (phase 1).
 *
 * A code packs the canonical JSON payload and a SHA-256 fingerprint of that
 * payload into one URL-safe string:
 *
 *   dfc1.<base64url(canonical JSON)>.<base32 fingerprint>
 *
 * `/verify/<code>` decodes the payload, recomputes the digest, and compares
 * fingerprints. Verification is deterministic offline math — no account, no
 * server secret, no database lookup. Phase 1 codes are self-attested: the
 * check proves the fields were not altered after issue, not that anyone
 * independently audited the work behind them.
 *
 * Pure module: no storage, no network, no React. Hashing uses WebCrypto
 * (`globalThis.crypto.subtle`), which browsers and Node 18+ provide.
 */

export const CREDENTIAL_VERSION = 1;

/** URL-safe marker that opens every credential code. */
export const CREDENTIAL_PREFIX = "dfc1";

/** Digest bytes carried in the displayed fingerprint. 10 bytes = 16 chars. */
export const FINGERPRINT_BYTES = 10;

/** Crockford base32 characters in a fingerprint. */
export const FINGERPRINT_LENGTH = 16;

/** Maximum accepted lengths for free-text payload fields. */
export const CREDENTIAL_LIMITS = {
  ref: 96,
  title: 120,
  recipient: 80,
} as const;

/** Maximum accepted value for `solved` / `total` / `stepsDone` / `stepsTotal`. */
export const CREDENTIAL_MAX_COUNT = 1_000_000;

/** Maximum accepted magnitude for a numeric measure (`score` / `target`). */
export const CREDENTIAL_MAX_MEASURE = 1_000_000_000_000;

export type CredentialKind =
  | "path"
  | "collection"
  | "category"
  | "lab"
  | "project"
  | "interview";

/**
 * Canonical evidence payload. Field names are deliberately stable: the
 * canonical serialization order is `v, kind, ref, title, recipient, solved,
 * total, issued, score, target, stepsDone, stepsTotal`, and any serializer
 * change would break every issued code. Counts are required for the
 * problem-based kinds (path, collection, category, interview); labs carry
 * `score`/`target` and projects carry `stepsDone`/`stepsTotal`, appended
 * after the fields that existed at the first release. All appended fields
 * stay optional so every v1 code issued before them keeps verifying.
 */
export interface CredentialPayload {
  v: typeof CREDENTIAL_VERSION;
  kind: CredentialKind;
  ref: string;
  title: string;
  recipient: string;
  /** Problems solved — path, collection, category, and interview mock totals. */
  solved?: number;
  /** Problems in scope — path, collection, category, and interview mock totals. */
  total?: number;
  issued: string;
  /** Lab metric value on the held-out set. */
  score?: number;
  /** Lab target the score was compared against. */
  target?: number;
  /** Project steps with solved progress at issue time. */
  stepsDone?: number;
  /** Project steps in total. */
  stepsTotal?: number;
}

export type CredentialStatus = "valid" | "tampered" | "malformed";

export type CredentialErrorReason = "unreadable" | "version";

export interface CredentialVerification {
  status: CredentialStatus;
  reason: CredentialErrorReason | null;
  payload: CredentialPayload | null;
  /** Fingerprint embedded in the code, when it could be read. */
  fingerprint: string | null;
  /** Fingerprint recomputed from the decoded payload, when hashing worked. */
  recomputed: string | null;
}

interface ParsedCredential {
  payload: CredentialPayload;
  canonical: string;
  fingerprint: string;
}

type ParseResult =
  | ({ ok: true } & ParsedCredential)
  | { ok: false; reason: CredentialErrorReason };

/* ─────────────────────────── bytes / encodings ──────────────────────────── */

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

function utf8Bytes(value: string): Uint8Array {
  return ENCODER.encode(value);
}

function utf8Text(bytes: Uint8Array): string | null {
  try {
    return DECODER.decode(bytes);
  } catch {
    return null;
  }
}

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  if (!value || !BASE64URL_PATTERN.test(value)) return null;
  const standard = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = standard + "=".repeat((4 - (standard.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    // Reject non-canonical encodings that set unused trailing bits.
    if (bytesToBase64Url(bytes) !== value) return null;
    return bytes;
  } catch {
    return null;
  }
}

/** Crockford base32: no I, L, O, or U, so hand-copied codes stay unambiguous. */
const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const BASE32_PATTERN = /^[0-9A-HJKMNP-TV-Z]+$/;

function encodeBase32(bytes: Uint8Array): string {
  let out = "";
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(buffer << (5 - bits)) & 31];
  return out;
}

function normalizeBase32(value: string): string | null {
  const upper = value
    .toUpperCase()
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
  if (upper.length !== FINGERPRINT_LENGTH || !BASE32_PATTERN.test(upper)) {
    return null;
  }
  return upper;
}

/* ───────────────────────────── validation ───────────────────────────────── */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function isCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= CREDENTIAL_MAX_COUNT
  );
}

function isMeasure(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Math.abs(value) <= CREDENTIAL_MAX_MEASURE
  );
}

const CREDENTIAL_KINDS: readonly CredentialKind[] = [
  "path",
  "collection",
  "category",
  "lab",
  "project",
  "interview",
];

/** Public kind whitelist shared by the credential code and certificate stores. */
export function isCredentialKind(value: unknown): value is CredentialKind {
  return (
    typeof value === "string" &&
    (CREDENTIAL_KINDS as readonly string[]).includes(value)
  );
}

/**
 * Evidence shape per kind: problem counts, a lab measure pair, or project
 * step counts. Legacy kinds keep the original eight-field payload.
 */
type PayloadShape = "counts" | "measure" | "steps";

function shapeFor(kind: CredentialKind): PayloadShape {
  if (kind === "lab") return "measure";
  if (kind === "project") return "steps";
  return "counts";
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, limit: number, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} must be a string`);
  const text = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!text) throw new Error(`${label} must not be empty`);
  if (text.length > limit) {
    throw new Error(`${label} must be at most ${limit} characters`);
  }
  return text;
}

/** Strict reader for already-canonical decoded values: nothing to coerce. */
function readText(value: unknown, limit: number): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > limit) {
    return null;
  }
  const text = value.normalize("NFC").replace(/\s+/g, " ").trim();
  return text === value ? text : null;
}

const COMMON_KEYS = ["v", "kind", "ref", "title", "recipient", "issued"] as const;
const COUNT_KEYS = ["solved", "total"] as const;
const MEASURE_KEYS = ["score", "target"] as const;
const STEP_KEYS = ["stepsDone", "stepsTotal"] as const;

/** Exact key set a decoded payload must carry for its kind. */
function payloadKeys(kind: CredentialKind): readonly string[] {
  const shape = shapeFor(kind);
  const evidence =
    shape === "measure" ? MEASURE_KEYS : shape === "steps" ? STEP_KEYS : COUNT_KEYS;
  return [...COMMON_KEYS, ...evidence];
}

/* ───────────────────────── canonical serialization ──────────────────────── */

/**
 * Normalize an input payload into the exact shape that gets hashed. Throws on
 * anything malformed so callers can never encode a half-valid credential.
 */
export function normalizeCredential(input: CredentialPayload): CredentialPayload {
  if (!isPlainObject(input) || input.v !== CREDENTIAL_VERSION) {
    throw new Error(`credential version must be ${CREDENTIAL_VERSION}`);
  }
  if (!isCredentialKind(input.kind)) {
    throw new Error(
      "credential kind must be path, collection, category, lab, project, or interview",
    );
  }
  if (!isIsoDate(input.issued)) {
    throw new Error("credential issued date must be YYYY-MM-DD");
  }
  const shape = shapeFor(input.kind);
  const fields = input as unknown as Record<string, unknown>;
  if (hasOwn(fields, "solved") !== (shape === "counts") ||
      hasOwn(fields, "total") !== (shape === "counts")) {
    throw new Error("credential counts must match the kind's evidence shape");
  }
  if (hasOwn(fields, "score") !== (shape === "measure") ||
      hasOwn(fields, "target") !== (shape === "measure")) {
    throw new Error("credential score and target are required for labs");
  }
  if (hasOwn(fields, "stepsDone") !== (shape === "steps") ||
      hasOwn(fields, "stepsTotal") !== (shape === "steps")) {
    throw new Error("credential steps are required for projects");
  }
  const payload: CredentialPayload = {
    v: CREDENTIAL_VERSION,
    kind: input.kind,
    ref: cleanText(input.ref, CREDENTIAL_LIMITS.ref, "ref"),
    title: cleanText(input.title, CREDENTIAL_LIMITS.title, "title"),
    recipient: cleanText(
      input.recipient,
      CREDENTIAL_LIMITS.recipient,
      "recipient",
    ),
    issued: input.issued,
  };
  if (shape === "counts") {
    if (!isCount(input.solved) || !isCount(input.total)) {
      throw new Error("credential counts must be non-negative integers");
    }
    payload.solved = input.solved;
    payload.total = input.total;
  } else if (shape === "measure") {
    if (!isMeasure(input.score) || !isMeasure(input.target)) {
      throw new Error("credential score and target must be finite numbers");
    }
    payload.score = input.score;
    payload.target = input.target;
  } else {
    if (!isCount(input.stepsDone) || !isCount(input.stepsTotal)) {
      throw new Error("credential steps must be non-negative integers");
    }
    payload.stepsDone = input.stepsDone;
    payload.stepsTotal = input.stepsTotal;
  }
  return payload;
}

/**
 * Canonical JSON for a payload: fixed key order, no insignificant whitespace,
 * NFC-normalized and whitespace-collapsed strings. Two payloads that carry the
 * same evidence always serialize to identical bytes, so they hash identically.
 * Fields absent from a payload are skipped without moving the ones that
 * remain, so every code issued before the appended fields still hashes to the
 * same bytes.
 */
export function canonicalize(input: CredentialPayload): string {
  const payload = normalizeCredential(input);
  const parts = [
    `"v":${payload.v}`,
    `"kind":${JSON.stringify(payload.kind)}`,
    `"ref":${JSON.stringify(payload.ref)}`,
    `"title":${JSON.stringify(payload.title)}`,
    `"recipient":${JSON.stringify(payload.recipient)}`,
  ];
  if (payload.solved !== undefined && payload.total !== undefined) {
    parts.push(`"solved":${payload.solved}`);
    parts.push(`"total":${payload.total}`);
  }
  parts.push(`"issued":${JSON.stringify(payload.issued)}`);
  if (payload.score !== undefined && payload.target !== undefined) {
    parts.push(`"score":${payload.score}`);
    parts.push(`"target":${payload.target}`);
  }
  if (payload.stepsDone !== undefined && payload.stepsTotal !== undefined) {
    parts.push(`"stepsDone":${payload.stepsDone}`);
    parts.push(`"stepsTotal":${payload.stepsTotal}`);
  }
  return `{${parts.join(",")}}`;
}

function readPayload(value: unknown): CredentialPayload | null {
  if (!isPlainObject(value)) return null;
  if (value.v !== CREDENTIAL_VERSION || !isCredentialKind(value.kind)) {
    return null;
  }
  const expected = payloadKeys(value.kind);
  const keys = Object.keys(value);
  if (keys.length !== expected.length) return null;
  for (const key of keys) {
    if (!expected.includes(key)) return null;
  }
  if (!isIsoDate(value.issued)) return null;
  const ref = readText(value.ref, CREDENTIAL_LIMITS.ref);
  const title = readText(value.title, CREDENTIAL_LIMITS.title);
  const recipient = readText(value.recipient, CREDENTIAL_LIMITS.recipient);
  if (!ref || !title || !recipient) return null;
  const payload: CredentialPayload = {
    v: CREDENTIAL_VERSION,
    kind: value.kind,
    ref,
    title,
    recipient,
    issued: value.issued,
  };
  const shape = shapeFor(value.kind);
  if (shape === "counts") {
    if (!isCount(value.solved) || !isCount(value.total)) return null;
    payload.solved = value.solved;
    payload.total = value.total;
  } else if (shape === "measure") {
    if (!isMeasure(value.score) || !isMeasure(value.target)) return null;
    payload.score = value.score;
    payload.target = value.target;
  } else {
    if (!isCount(value.stepsDone) || !isCount(value.stepsTotal)) return null;
    payload.stepsDone = value.stepsDone;
    payload.stepsTotal = value.stepsTotal;
  }
  return payload;
}

/* ────────────────────────────── hashing ─────────────────────────────────── */

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const subtle = (globalThis as { crypto?: Crypto }).crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is unavailable in this environment");
  }
  const view = new Uint8Array(bytes.byteLength);
  view.set(bytes);
  const digest = await subtle.digest("SHA-256", view);
  return new Uint8Array(digest);
}

/* ────────────────────────────── code shape ──────────────────────────────── */

function splitCode(code: unknown): { encoded: string; fingerprint: string } | null {
  if (typeof code !== "string") return null;
  const parts = code.trim().split(".");
  if (parts.length !== 3 || parts[0] !== CREDENTIAL_PREFIX) return null;
  const encoded = parts[1];
  const fingerprint = normalizeBase32(parts[2]);
  if (!encoded || !fingerprint) return null;
  return { encoded, fingerprint };
}

function parseDetailed(code: unknown): ParseResult {
  const split = splitCode(code);
  if (!split) return { ok: false, reason: "unreadable" };
  const bytes = base64UrlToBytes(split.encoded);
  if (!bytes) return { ok: false, reason: "unreadable" };
  const text = utf8Text(bytes);
  if (text === null) return { ok: false, reason: "unreadable" };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: "unreadable" };
  }
  if (isPlainObject(raw) && raw.v !== CREDENTIAL_VERSION) {
    return { ok: false, reason: "version" };
  }
  const payload = readPayload(raw);
  if (!payload) return { ok: false, reason: "unreadable" };
  return {
    ok: true,
    payload,
    canonical: canonicalize(payload),
    fingerprint: split.fingerprint,
  };
}

/* ───────────────────────────── public API ───────────────────────────────── */

/**
 * Encode a payload into a self-verifying code. Throws when the payload is
 * malformed or when WebCrypto is unavailable.
 */
export async function encodeCredential(
  input: CredentialPayload,
): Promise<string> {
  const canonical = canonicalize(input);
  const digest = await sha256(utf8Bytes(canonical));
  const fingerprint = encodeBase32(digest.subarray(0, FINGERPRINT_BYTES));
  const encoded = bytesToBase64Url(utf8Bytes(canonical));
  return `${CREDENTIAL_PREFIX}.${encoded}.${fingerprint}`;
}

/** Decode the payload carried by a code. Returns null for malformed codes. */
export function decodeCredential(code: string): CredentialPayload | null {
  const parsed = parseDetailed(code);
  return parsed.ok ? parsed.payload : null;
}

/** Fingerprint embedded in a code, or null when the code is malformed. */
export function fingerprintFromCode(code: string): string | null {
  const split = splitCode(code);
  return split ? split.fingerprint : null;
}

/** `XXXX-XXXX-XXXX-XXXX` display form of a fingerprint. */
export function formatFingerprint(fingerprint: string): string {
  const value = normalizeBase32(fingerprint);
  if (!value) return "";
  return value.match(/.{1,4}/g)?.join("-") ?? value;
}

/** Relative verification URL for a code. */
export function verifyUrl(code: string): string {
  return `/verify/${encodeURIComponent(code.trim())}`;
}

/**
 * Recompute the payload digest and compare it with the embedded fingerprint.
 *
 * - `valid`    — the fingerprint matches; the payload was not altered.
 * - `tampered` — the payload decodes but the fingerprint does not match.
 * - `malformed`— the code cannot be read (shape, encoding, fields, version).
 *
 * Throws only when the environment cannot hash (no WebCrypto).
 */
export async function verifyCredential(
  code: string,
): Promise<CredentialVerification> {
  const parsed = parseDetailed(code);
  if (!parsed.ok) {
    return {
      status: "malformed",
      reason: parsed.reason,
      payload: null,
      fingerprint: null,
      recomputed: null,
    };
  }
  const digest = await sha256(utf8Bytes(parsed.canonical));
  const recomputed = encodeBase32(digest.subarray(0, FINGERPRINT_BYTES));
  if (recomputed === parsed.fingerprint) {
    return {
      status: "valid",
      reason: null,
      payload: parsed.payload,
      fingerprint: recomputed,
      recomputed,
    };
  }
  return {
    status: "tampered",
    reason: null,
    payload: parsed.payload,
    fingerprint: parsed.fingerprint,
    recomputed,
  };
}
