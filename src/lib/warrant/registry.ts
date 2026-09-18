import { AdmissionError } from "./types";
import type {
  Append,
  Digest,
  Identity,
  Registry,
  RootId,
  RootRecord,
  VersionId,
} from "./types";
import { rootIdOf, versionIdOf } from "./ids";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function normalizeCoverage(declaredDomain: readonly string[]): readonly string[] {
  if (!Array.isArray(declaredDomain)) {
    throw new AdmissionError("malformed-attempt", "coverage must be an array of atoms");
  }
  const atoms: string[] = [];
  for (const atom of declaredDomain) {
    if (typeof atom !== "string" || atom.length === 0 || atom.includes("\u0000")) {
      throw new AdmissionError(
        "malformed-attempt",
        "coverage atoms must be non-empty strings without NUL",
      );
    }
    atoms.push(atom);
  }
  return [...new Set(atoms)].sort();
}

function isCoverageSuperset(candidate: readonly string[], required: readonly string[]): boolean {
  let left = 0;
  let right = 0;
  while (left < candidate.length && right < required.length) {
    if (candidate[left] === required[right]) {
      left += 1;
      right += 1;
    } else if (candidate[left] < required[right]) {
      left += 1;
    } else {
      return false;
    }
  }
  return right === required.length;
}

function uniqueSorted(atoms: readonly string[]): readonly string[] {
  return [...new Set(atoms)].sort();
}

export function emptyRegistry(): Registry {
  return { roots: new Map(), versions: new Map() };
}

export function registerRoot(
  registry: Registry,
  authorRoot: Identity,
  specDigest: Digest,
  declaredDomain: readonly string[],
): Registry {
  if (!isNonEmptyString(authorRoot) || !isNonEmptyString(specDigest)) {
    throw new AdmissionError(
      "malformed-attempt",
      "registerRoot: authorRoot and specDigest must be non-empty strings",
    );
  }
  const coverage = normalizeCoverage(declaredDomain);
  const rootId = rootIdOf(authorRoot, specDigest, coverage);
  if (registry.roots.has(rootId)) {
    return registry;
  }
  const roots = new Map(registry.roots);
  roots.set(rootId, { rootId, authorRoot, specDigest, coverage });
  return { roots, versions: registry.versions };
}

export function registerVersion(
  registry: Registry,
  rootId: RootId,
  authorRoot: Identity,
  specDigest: Digest,
): Registry {
  const record = registry.roots.get(rootId);
  if (record === undefined) {
    throw new AdmissionError("unknown-root", `registerVersion: unknown root ${rootId}`);
  }
  if (authorRoot !== record.authorRoot) {
    throw new AdmissionError(
      "author-mismatch",
      `registerVersion: author ${authorRoot} does not own root ${rootId}`,
    );
  }
  if (!isNonEmptyString(specDigest)) {
    throw new AdmissionError("malformed-attempt", "registerVersion: specDigest must be a non-empty string");
  }
  let seq = 1;
  for (const version of registry.versions.values()) {
    if (version.rootId === rootId) {
      seq += 1;
    }
  }
  const versionId = versionIdOf(rootId, specDigest, seq);
  const versions = new Map(registry.versions);
  versions.set(versionId, { versionId, rootId, specDigest, seq });
  return { roots: registry.roots, versions };
}

export function rootOf(registry: Registry, id: RootId | VersionId): RootId {
  if (registry.roots.has(id)) {
    return id;
  }
  const version = registry.versions.get(id);
  if (version !== undefined) {
    return version.rootId;
  }
  throw new AdmissionError("unknown-root", `unknown root or version ${id}`);
}

export function isRoot(registry: Registry, id: string): id is RootId {
  return registry.roots.has(id);
}

export function recordOf(registry: Registry, rootId: RootId): RootRecord {
  const record = registry.roots.get(rootId);
  if (record === undefined) {
    throw new AdmissionError("unknown-root", `recordOf: unknown root ${rootId}`);
  }
  return record;
}

export function authorOf(registry: Registry, rootId: RootId): Identity {
  return recordOf(registry, rootId).authorRoot;
}

export function rootsByAuthor(registry: Registry, authorRoot: Identity): readonly RootId[] {
  const rootIds: RootId[] = [];
  for (const record of registry.roots.values()) {
    if (record.authorRoot === authorRoot) {
      rootIds.push(record.rootId);
    }
  }
  return rootIds.sort();
}

export function subsumedFamily(
  registry: Registry,
  refuter: RootId,
  family: RootId,
  chain: readonly Append[],
): boolean {
  const target = registry.roots.get(family);
  if (target === undefined || target.coverage.length === 0) {
    return false;
  }
  for (const append of chain) {
    const attempt = append.attempt;
    if (attempt.outcome !== "survived" || attempt.refuter !== refuter || attempt.family === family) {
      continue;
    }
    const prior = registry.roots.get(attempt.family);
    if (prior !== undefined && isCoverageSuperset(prior.coverage, target.coverage)) {
      return true;
    }
  }
  return false;
}

export function overlapRatio(a: readonly string[], b: readonly string[]): number {
  const left = uniqueSorted(a);
  const right = uniqueSorted(b);
  if (left.length === 0 || right.length === 0) {
    return 0;
  }
  let i = 0;
  let j = 0;
  let shared = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      shared += 1;
      i += 1;
      j += 1;
    } else if (left[i] < right[j]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return shared / Math.max(left.length, right.length);
}
