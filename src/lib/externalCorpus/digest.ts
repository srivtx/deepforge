/**
 * External-corpus contract — digests.
 *
 * This module is the only place in the external-replication path that
 * computes a hash, and it computes two kinds, kept strictly apart:
 *
 *  1. **Content digests** — SHA-256 over a canonical serialization of content:
 *     the corpus file's bytes, the corpus's normalised content, the engine
 *     files' bytes, the per-exercise records, and finally the whole
 *     `reproducible` section of a run report. Every one of these is stable
 *     across time, machines, worker counts, and process invocations. They are
 *     the only digests a report's `resultDigest` covers.
 *
 *  2. **Run metadata** — timestamps, durations, host, CPU count, worker count,
 *     the command line. These are *recorded* and never hashed. The type
 *     `RunMetadata.reproducible` is literally `false` so that no code path can
 *     fold them into a digest by accident, and a unit test mutates every field
 *     in that section and asserts `resultDigest` is unchanged.
 *
 * That split is the direct answer to the audit finding that the existing
 * `manifestSha256` is time-dependent and therefore not reproducible: a digest
 * that covers a timestamp cannot be compared between two runs, so nobody ever
 * checks it.
 *
 * Reuse rather than duplication: the repository already ships two pure
 * primitives that this needs, and both are covered by the repo's own tests —
 * `canonicalJson` (canonical JSON, sorted keys, `-0` normalised, non-finite
 * numbers rejected) in `src/lib/keyfuse/hash.ts` and `sha256Hex` (a pure
 * SHA-256 with published known-answer tests) in `src/lib/reprogpu/sha256.ts`.
 * A third canonicalizer or a third hash in the tree would be a correctness
 * risk, not a style choice, so this module depends on those two and adds
 * nothing of its own beyond UTF-8 encoding and the named digest helpers.
 */

import { canonicalJson } from "@/lib/keyfuse/hash";
import { sha256Hex } from "@/lib/reprogpu/sha256";
import type { CorpusExercise } from "./types";

/** Canonical JSON, re-exported so callers need one import. */
export { canonicalJson };

const ENCODER = new TextEncoder();

/** UTF-8 bytes of a string. */
export function utf8(text: string): Uint8Array {
  return ENCODER.encode(text);
}

/** SHA-256 (hex) of a string's UTF-8 bytes. */
export function sha256OfText(text: string): string {
  return sha256Hex(utf8(text));
}

/** SHA-256 (hex) of a byte array. */
export function sha256OfBytes(bytes: Uint8Array): string {
  return sha256Hex(bytes);
}

/** SHA-256 (hex) of any JSON-serializable value, via the canonical form. */
export function sha256OfCanonical(value: unknown): string {
  return sha256OfText(canonicalJson(value));
}

/**
 * The projection of a corpus that the two engines actually read.
 *
 * This is deliberately the *same* field set the internal BDL gate serialises
 * (`scripts/verify-bdl.ts:474-481`) so the two digests are commensurable: a
 * third party can hand-build this projection and land on the published internal
 * digest if and only if they have re-serialised the same content. Field order
 * in the object literal is irrelevant because `canonicalJson` sorts keys.
 */
export interface CorpusProjectionExercise {
  readonly id: string;
  readonly category: string;
  readonly difficulty: string;
  readonly solution: string;
  readonly testCases: readonly { readonly input: readonly unknown[]; readonly expected: unknown }[];
}

/** Placeholders used where an optional label was absent, for digest purposes
 *  only. A digest computed with a placeholder is a *projection* digest, and the
 *  report says so via `corpusProjectionDeclared`. */
export const UNDECLARED_CATEGORY = "unspecified";
export const UNDECLARED_DIFFICULTY = "unspecified";

/**
 * Project one exercise into the engines' view of it: the five fields
 * `py_bdl_verify._analyze` reads, and nothing else. The entry point is
 * deliberately absent — the engine re-derives it from the source with the same
 * rule the validator mirrors, so putting it here would create a second source
 * of truth for a value both sides already agree on.
 */
export function projectExercise(exercise: CorpusExercise): CorpusProjectionExercise {
  return {
    id: exercise.id,
    category: exercise.category ?? UNDECLARED_CATEGORY,
    difficulty: exercise.difficulty ?? UNDECLARED_DIFFICULTY,
    solution: exercise.reference,
    testCases: exercise.tests.map((test) => ({ input: test.input, expected: test.expected })),
  };
}

/**
 * The content digest of a corpus: SHA-256 over the canonical JSON of
 * `{formatVersion, exercises: [projection…], candidateAlibis: [...]}`.
 *
 * Only the fields the engines read are included, so re-formatting the file,
 * re-indenting the JSON, or editing a human-readable title does not change the
 * digest, while changing a single byte of a reference solution or a test
 * expectation does.
 */
export function corpusContentDigest(args: {
  readonly formatVersion: number;
  readonly exercises: readonly CorpusProjectionExercise[];
  readonly candidateAlibis?: readonly {
    readonly id: string;
    readonly exerciseId: string;
    readonly ghost: string;
    readonly witness: string;
    readonly func: string;
  }[];
}): string {
  return sha256OfCanonical({
    content: "df-corpus-content/1",
    formatVersion: args.formatVersion,
    exercises: args.exercises,
    candidateAlibis: args.candidateAlibis ?? [],
  });
}

/** Short form used in log lines and file names: the first 8 hex characters. */
export function shortDigest(digest: string): string {
  return digest.slice(0, 8);
}
