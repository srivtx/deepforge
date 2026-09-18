export const WARRANT_VERSION = 1;
export const WARRANT_MARK = "__DF_WARRANT__";
export const WARRANT_MAX_GRADE = 3;
export const WARRANT_MAX_CHAIN = 64;
export const WARRANT_MAX_INCONCLUSIVE_PER_PAIR = 1;

export type RootId = string;
export type VersionId = string;
export type ValueId = string;
export type Digest = string;
export type ContextId = string;
export type Seed = string;
export type Identity = string;
export type VerifierId = string;

export type Op = "assert" | "derive";
export type Outcome = "survived" | "refuted" | "inconclusive";
export type LiveGrade = 0 | 1 | 2 | 3;
export type Grade = "dead" | LiveGrade;

export interface Attempt {
  readonly refuter: RootId;
  readonly family: RootId;
  readonly seed: Seed;
  readonly outcome: Outcome;
  readonly cost: number;
  readonly witness: Digest;
  readonly submittedBy: Identity;
}

export interface PendingAttempt {
  readonly attempt: Attempt;
  readonly sig: Digest;
}

export interface Append {
  readonly prev: Digest;
  readonly attempt: Attempt;
  readonly admittedBy: VerifierId;
  readonly sig: Digest;
}

export interface Value {
  readonly id: ValueId;
  readonly op: Op;
  readonly kind: string;
  readonly payload: unknown;
  readonly cites: readonly ValueId[];
  readonly context: ContextId;
  readonly genesis: Digest;
  readonly chain: readonly Append[];
}

export interface RootRecord {
  readonly rootId: RootId;
  readonly authorRoot: Identity;
  readonly specDigest: Digest;
  readonly coverage: readonly string[];
}

export interface VersionRecord {
  readonly versionId: VersionId;
  readonly rootId: RootId;
  readonly specDigest: Digest;
  readonly seq: number;
}

export interface Registry {
  readonly roots: ReadonlyMap<RootId, RootRecord>;
  readonly versions: ReadonlyMap<VersionId, VersionRecord>;
}

export interface Store {
  readonly values: ReadonlyMap<ValueId, Value>;
}

export interface PublishedGrades {
  get(id: ValueId): Grade | undefined;
}

export interface HeadAnchor {
  readonly valueId: ValueId;
  readonly head: Digest;
  readonly length: number;
  readonly published: Grade;
}

export type AuditIssueKind =
  | "grade-mismatch"
  | "identity-mismatch"
  | "malformed-attempt"
  | "broken-prev"
  | "bad-signature"
  | "chain-overflow"
  | "duplicate-inconclusive"
  | "head-mismatch"
  | "unknown-cite"
  | "unknown-root"
  | "cycle";

export interface AuditIssue {
  readonly kind: AuditIssueKind;
  readonly valueId: ValueId;
  readonly index: number | null;
  readonly detail: string;
}

export interface Report {
  readonly valueId: ValueId;
  readonly recomputed: Grade;
  readonly published: Grade | null;
  readonly ok: boolean;
  readonly issues: readonly AuditIssue[];
}

export type AdmissionCode =
  | "unknown-value"
  | "malformed-attempt"
  | "unknown-root"
  | "version-not-root"
  | "author-mismatch"
  | "reserved-payload"
  | "chain-budget"
  | "duplicate-inconclusive"
  | "subsumed-family"
  | "bad-signature"
  | "unknown-cite";

export class AdmissionError extends Error {
  readonly code: AdmissionCode;

  constructor(code: AdmissionCode, detail: string) {
    super(detail);
    this.name = "AdmissionError";
    this.code = code;
  }
}

export class RefusedRemintError extends Error {
  readonly valueId: ValueId;

  constructor(valueId: ValueId) {
    super(`refused to re-mint dead value ${valueId}`);
    this.name = "RefusedRemintError";
    this.valueId = valueId;
  }
}

export function isDead(g: Grade): g is "dead" {
  return g === "dead";
}

export function minGrade(a: Grade, b: Grade): Grade {
  if (isDead(a) || isDead(b)) return "dead";
  return Math.min(a, b) as LiveGrade;
}
