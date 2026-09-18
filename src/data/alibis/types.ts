import type { Difficulty, TestCase } from "@/types/problem";

/** One frozen silent-bug puzzle: a ghost program that passes every shipped test. */
export interface AlibiPuzzle {
  /** Source problem id, e.g. "al-353". Unique across the set. */
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly difficulty: Difficulty;
  /** Entry function name; identical in `reference` and `ghost`. */
  readonly func: string;
  /** The reference solution, `ast.unparse`d so text diffs are exactly the edit. */
  readonly reference: string;
  /** The mined alibi: passes every shipped test, diverges from `reference`. */
  readonly ghost: string;
  /** Python literal of positional args at which the two diverge (validated offline). */
  readonly witness: string;
  /**
   * Union-suite resistance (scripts/py_alibi_verify.py v2): the full union is
   * the verifier S2/S3 sequences, a seed grid of the same generators,
   * systematic common-value/boundary edits, and the repository lazy suite
   * uncapped, all built from the visible shipped tests only. A shipped puzzle
   * has ZERO divergent union probes.
   */
  readonly unionProbes?: number;
  /** Held-out suite size (independent seeds and generator mix). Zero divergent probes required. */
  readonly heldOutProbes?: number;
  /** True when the puzzle survived both the union and the held-out suite at selection time. */
  readonly survived?: boolean;
  /**
   * Legacy wave-41 metadata kept for interface compatibility. New bank
   * records omit it; absent means "resistant" (all shipped puzzles are).
   */
  readonly resistanceTier?: "resistant" | "warmup";
  /** Legacy lazy-probe metadata (capped 128-probe suite). */
  readonly probesRun?: number;
  /** Legacy lazy-probe metadata. */
  readonly probesPassed?: number;
  /** Legacy warm-up metadata; never present in the v2 bank. */
  readonly firstDivergentProbe?: number;
  /** The shipped tests, for display ("passes all N of these"). */
  readonly tests: readonly TestCase[];
}
