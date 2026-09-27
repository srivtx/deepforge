/**
 * External-corpus contract — provenance and the separation guarantee.
 *
 * The audit's hardest structural finding is that DeepForge's own corpus and a
 * third party's corpus are the same *kind* of object: both are arrays of
 * `{id, category, difficulty, solution, testCases}` in a JSON file, both are fed
 * to the same analyzer, and both produce the same *shaped* numbers. Nothing in
 * the wire format distinguishes them, so an internal measurement and an external
 * replication can be mistaken for each other in a log, a file name, or a report
 * without anybody noticing. This module is the mechanism that makes that
 * mistake hard rather than easy, in four independent ways:
 *
 *  1. **The format cannot claim to be internal.** `corpus.origin` accepts only
 *     `external` and `synthetic-example`. There is deliberately no value that
 *     means "this is the DeepForge corpus", so no file can be *labelled*
 *     internal. The internal corpus is measured by `bun run verify:bdl`, not by
 *     this tooling.
 *  2. **The internal corpus is positively identified.** `provenance()` loads
 *     the real `src/data/problems` bank once and reports whether the corpus
 *     under test *is* it, or shares byte-identical references with it. A corpus
 *     whose content digest equals the published internal digest is refused
 *     outright by the validator (`provenance/collides-with-deepforge-corpus`).
 *  3. **Overlap is a disclosure, never a filter.** An external corpus that
 *     turns out to contain DeepForge's own exercises is still measured — it is
 *     simply marked as not independent, which forces the comparison's verdict to
 *     `NOT_COMPARABLE`. Silently dropping such a corpus would be a hidden
 *     filter, which is the exact failure mode the audit identified; refusing to
 *     report a verdict is the honest alternative.
 *  4. **The label travels.** Every report, every log line, and every output file
 *     name carries `provenance.label`, which is either
 *     `EXTERNAL CORPUS <id>@<version>` or
 *     `SYNTHETIC EXAMPLE (not a scientific corpus) <id>@<version>`, plus
 *     `notAScientificResult: true` for the synthetic case. There is no code path
 *     that emits a measurement without one of those two.
 *
 * What this cannot establish, and says so in the report itself
 * (`OverlapFinding.doesNotEstablish`): byte-level overlap detection is not
 * plagiarism detection. A corpus that paraphrases, re-implements, or
 * LLM-rewrites DeepForge's exercises shares no bytes with them and would be
 * reported as clean. The independence claim therefore rests on the corpus's own
 * declaration plus its maintainer's honesty, and the report marks the difference.
 */

import { PROBLEMS } from "@/data/problems";
import { canonicalJson, sha256OfText } from "./digest";
import type { OverlapFinding } from "./types";

/**
 * The published internal-corpus digest, as `verify:bdl.ts` serialises it and as
 * `docs/research/reproducibility.md` §3.1 records it. A corpus file that lands
 * on this digest is DeepForge's own corpus and is refused.
 */
export const INTERNAL_CORPUS_SHA256 =
  "3ff60b9e3aa8b5ab8a1cb2e6dfcdffcc6d31774b7f770c3b787a8fdc8a498e31";

/** The internal corpus's measured size, echoed in every finding. */
export const INTERNAL_CORPUS_EXERCISES = 5_730;

/** The exact projection the internal digest is taken over. */
export function internalProjection(): string {
  return JSON.stringify(
    PROBLEMS.map((problem) => ({
      id: problem.id,
      category: problem.category,
      difficulty: problem.difficulty,
      solution: problem.solution,
      testCases: problem.testCases,
    })),
  );
}

/** The internal corpus's digest under that projection. */
export function internalCorpusDigest(): string {
  return sha256OfText(internalProjection());
}

/** Set of SHA-256 digests of every internal reference solution, for overlap. */
let cachedReferenceDigests: ReadonlySet<string> | null = null;
function internalReferenceDigests(): ReadonlySet<string> {
  if (cachedReferenceDigests === null) {
    const out = new Set<string>();
    for (const problem of PROBLEMS) out.add(sha256OfText(problem.solution));
    cachedReferenceDigests = out;
  }
  return cachedReferenceDigests;
}

/** Set of internal exercise ids, for overlap. */
let cachedIds: ReadonlySet<string> | null = null;
function internalIds(): ReadonlySet<string> {
  if (cachedIds === null) cachedIds = new Set(PROBLEMS.map((problem) => problem.id));
  return cachedIds;
}

/** What the overlap check establishes and what it cannot. */
export const OVERLAP_LIMITATION =
  "byte-level overlap only: an exercise that paraphrases, re-implements, or " +
  "machine-rewrites a DeepForge exercise shares no bytes with it and would " +
  "read as clean. The independence claim therefore rests on the corpus's own " +
  "declaration plus its maintainer's honesty, not on this check.";

/**
 * The empty finding, used when the internal corpus cannot be loaded (for
 * example in a browser bundle). It is `performed: false`, never a silent
 * "no overlap found".
 */
export function overlapNotPerformed(exercises: number, reason: string): OverlapFinding {
  return {
    performed: false,
    status: "internal-corpus-unavailable",
    sharedReferences: 0,
    exercises,
    sharedIds: 0,
    isTheInternalCorpus: false,
    doesNotEstablish: `${reason}. ${OVERLAP_LIMITATION}`,
  };
}

/**
 * Compare a candidate corpus against the DeepForge internal corpus.
 *
 * `references` are the candidate exercises' reference solutions; `ids` their
 * ids. Returns a finding, never a boolean, so the reason travels with the
 * answer and a caller cannot report "independent" without also reporting what
 * "independent" was measured against.
 */
export function compareWithInternalCorpus(args: {
  readonly ids: readonly string[];
  readonly references: readonly string[];
  /** The candidate's own content digest under the internal projection, when
   *  every exercise declared a category and difficulty. */
  readonly projectionDigest?: string | null;
}): OverlapFinding {
  let referenceSet: ReadonlySet<string>;
  let idSet: ReadonlySet<string>;
  try {
    referenceSet = internalReferenceDigests();
    idSet = internalIds();
  } catch {
    return overlapNotPerformed(
      args.references.length,
      "the DeepForge internal corpus could not be loaded in this process",
    );
  }
  let sharedReferences = 0;
  for (const reference of args.references) {
    if (referenceSet.has(sha256OfText(reference))) sharedReferences += 1;
  }
  let sharedIds = 0;
  for (const id of args.ids) if (idSet.has(id)) sharedIds += 1;
  return {
    performed: true,
    status: "checked",
    sharedReferences,
    exercises: args.references.length,
    sharedIds,
    isTheInternalCorpus: args.projectionDigest === INTERNAL_CORPUS_SHA256,
    doesNotEstablish: OVERLAP_LIMITATION,
  };
}

/** The measured internal digest, for the validator's fatal-overlap rule. */
export function internalDigestForCollisionCheck(): string {
  try {
    return internalCorpusDigest();
  } catch {
    return "";
  }
}

/**
 * Provenance for the validator's own report: what corpus a document claims to
 * be, read defensively. Used only for logging before full validation.
 */
export function declaredProvenance(document: unknown): {
  readonly id: string;
  readonly origin: string;
  readonly independence: string;
  readonly licenseId: string;
  readonly maintainer: string;
} {
  const record = (document ?? {}) as Record<string, unknown>;
  const header = (record.corpus ?? {}) as Record<string, unknown>;
  const prov = (header.provenance ?? {}) as Record<string, unknown>;
  const license = (header.license ?? {}) as Record<string, unknown>;
  return {
    id: typeof header.id === "string" ? header.id : "<no id>",
    origin: typeof header.origin === "string" ? header.origin : "<no origin>",
    independence:
      typeof prov.independence === "string" ? prov.independence : "<undeclared>",
    licenseId: typeof license.id === "string" ? license.id : "<no licence>",
    maintainer: typeof prov.maintainer === "string" ? prov.maintainer : "<no maintainer>",
  };
}

/** The canonical form of a corpus file, for a log line that must be stable. */
export function canonicalFileSummary(value: unknown): string {
  return canonicalJson(value);
}
