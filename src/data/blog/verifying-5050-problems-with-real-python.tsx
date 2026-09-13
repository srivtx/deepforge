import type { BlogPost } from "./types";
import {
  BlogLink,
  BlogProse,
  Callout,
  CodeBlock,
  DecisionTable,
  Figure,
  Footnote,
  ReferenceItem,
  References,
  SectionHeading,
} from "@/components/blog";
import { VerificationPipeline } from "@/components/blog/diagrams";

export const post: BlogPost = {
  slug: "verifying-5050-problems-with-real-python",
  title: "Verifying 5,050 problems with real Python",
  abstract:
    "Every DeepForge problem ships with a solution and three to five test cases, and every one of the 5,050 is executed in real CPython before it lands. This is what that buys us: structural checks catch typos for free, a 1e-6 deep-equality harness proves the code runs, and neither one can tell you the math is true.",
  date: "2026-08-29",
  readingMinutes: 9,
  tags: ["verification", "python", "testing"],
  authors: ["svx"],
};

const EQUALITY_SOURCE = `def _deep_eq(a, b, tol=1e-6):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)
        except (ValueError, OverflowError):
            return float(a) == float(b)
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_deep_eq(a[k], b[k], tol) for k in a)
    if a is None or b is None:
        return a is b
    return a == b`;

const PROBLEM_INTERFACE = `interface Problem {
  id: string;                    // la-001, al-015, dl-321
  title: string;
  category: Category;            // one of 15
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  starterCode: string;           // the function the learner fills in
  solution: string;              // our reference, pure stdlib Python
  testCases: TestCase[];         // 3-5: { input: any[], expected: any }
  hint?: string;
}`;

function EqualityLadder() {
  const rows = [
    {
      cond: "bool?",
      result: "a == b",
      note: "checked first — True never equals 1",
    },
    {
      cond: "int | float?",
      result: "isclose(rel 1e-6, abs 1e-6)",
      note: "the tolerance window, both directions",
    },
    {
      cond: "list | tuple?",
      result: "len equal · itemwise",
      note: "a list result may match a tuple expected",
    },
    {
      cond: "dict?",
      result: "keys equal · itemwise",
      note: "key sets must match exactly",
    },
    {
      cond: "None?",
      result: "a is b",
      note: "None only ever matches None",
    },
    {
      cond: "fallback",
      result: "a == b",
      note: "strings, sets, objects with __eq__",
    },
  ];

  return (
    <svg
      viewBox="0 0 760 320"
      role="img"
      aria-labelledby="equality-title equality-desc"
      className="h-auto w-full"
    >
      <title id="equality-title">Deep equality check order</title>
      <desc id="equality-desc">
        The harness walks type checks in order: booleans compare exactly,
        numbers with a 1e-6 relative and absolute tolerance, lists and tuples
        itemwise, dictionaries by key set, None by identity, and everything
        else with Python equality.
      </desc>
      <text x="40" y="42" className="fill-body-mid text-[11px] font-medium">
        deep equality — first match wins, top to bottom
      </text>
      {rows.map((row, i) => {
        const top = 64 + i * 40;
        return (
          <g key={row.cond}>
            <path
              d={`M40 ${top}H720`}
              fill="none"
              strokeWidth={1}
              className="stroke-hairline"
            />
            <text
              x="40"
              y={top + 24}
              className="fill-accent text-[10px] font-mono"
            >
              {row.cond}
            </text>
            <text
              x="220"
              y={top + 24}
              className="fill-body text-[10px] font-mono"
            >
              {`\u2192 ${row.result}`}
            </text>
            <text x="470" y={top + 24} className="fill-mute text-[10px]">
              {row.note}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Content() {
  return (
    <BlogProse>
      <p>
        DeepForge is a practice platform: you get a function signature and
        write the implementation from scratch, in the browser, against real
        Python. That means the product is only as good as its problem bank, and
        the bank is large — 5,050 problems, 21,165 test cases, 15 categories.
        Every single solution is asserted by execution before it ships.
      </p>

      <SectionHeading n={1}>Structural checks are cheap, and not enough</SectionHeading>
      <p>
        The first gate is shape. <code>scripts/verify-problems.ts</code> walks
        the TypeScript dataset and checks that every problem has an id matching{" "}
        <code>^[a-z]+-\d&#123;3,4&#125;$</code> with a known category prefix,
        that ids are unique, that the category and difficulty are valid, that
        there are three to five test cases, that inputs are arrays and expected
        values are present, and that the function in <code>starterCode</code>{" "}
        has the same name as the function in <code>solution</code>.
      </p>
      <p>
        This pass runs in milliseconds over the entire dataset and catches the
        boring failures: a copy-pasted id, a renamed helper, a missing
        expected. What it cannot do is run the code. A solution can satisfy
        every structural rule and still be wrong — an off-by-one in a sliding
        window, a transposed matrix, a return type that is a list of lists
        where a list of tuples was expected. Structure is necessary; execution
        is the proof.
      </p>

      <Figure label="Fig 1." caption="Every problem takes the same path: shape checks first, then real CPython, then a tolerance-aware equality check. Failures loop back to the author and re-run the whole suite.">
        <VerificationPipeline />
      </Figure>

      <SectionHeading n={2}>The contract: one function, 3–5 cases, JSON in</SectionHeading>
      <p>
        The data model is deliberately boring. A problem is one function, a
        handful of cases, and metadata — nothing the verifier has to interpret.
      </p>
      <CodeBlock
        title="src/types/problem.ts"
        language="TypeScript"
        code={PROBLEM_INTERFACE}
      />
      <p>
        Test cases are serialized to JSON and read back with Python&apos;s{" "}
        <code>json</code> module. Numbers stay numbers, lists stay lists,
        booleans stay booleans, and nothing is evaluated. There is no{" "}
        <code>eval</code>, no pickle, no fixture format to document. The input
        array is splatted positionally; the expected value is compared. That is
        the entire protocol.
      </p>
      <DecisionTable
        caption="Why the verifier runs Python instead of re-implementing the check"
        rows={[
          {
            option: "Structural checks only",
            chosen: false,
            why: "Catches typos in milliseconds, but never proves a formula runs or returns the right value.",
          },
          {
            option: "Re-implement the check in JavaScript",
            chosen: false,
            why: "The browser runs CPython through Pyodide. A JS verifier would slowly drift from the semantics learners actually experience.",
          },
          {
            option: "Execute every solution in real CPython",
            chosen: true,
            why: "Same interpreter generation as Pyodide, same deep-equality function, and cheap enough — the full bank runs in under a second.",
          },
        ]}
      />

      <SectionHeading n={3}>The Python harness</SectionHeading>
      <p>
        <code>scripts/py_verify.py</code> receives JSON and, for each problem,
        compiles and executes the solution in a fresh namespace, extracts the
        first <code>def</code>, calls it once per test case, and records
        reprs for anything that failed. The TypeScript side prints the first 60
        failures with their inputs, then the per-category counts, then a
        one-line summary. A run either ends in <code>ALL GREEN</code> or with
        the exact case that broke.
      </p>
      <p>
        The interesting part is the equality semantics, because they are
        shared: the same function body lives in the browser harness in{" "}
        <code>src/lib/pyodide.ts</code>. If CI grades a solution with 1e-6
        tolerance, the browser does too — there is no second opinion.
      </p>
      <CodeBlock
        title="scripts/py_verify.py · _deep_eq"
        code={EQUALITY_SOURCE}
      />
      <Figure label="Fig 2." caption="The equality ladder. Order matters: booleans are tested before numbers, which is why a solution returning True never passes a case expecting 1.">
        <EqualityLadder />
      </Figure>
      <p>
        Three choices matter. Booleans compare exactly and before numbers, so{" "}
        <code>True</code> is not <code>1</code>. Numbers get both relative and
        absolute tolerance. Sequences compare itemwise and ignore
        list-versus-tuple — a learner returning a list where the reference
        returned a tuple is not the bug we are hunting. Everything is
        recursive, so nested structures get the same treatment at every depth.
      </p>

      <SectionHeading n={4}>Seeded randomness is a problem contract</SectionHeading>
      <p>
        Randomness is the classic way to make a verifier flaky, so the dataset
        treats it as part of the problem statement. 104 of the 5,050 solutions
        import <code>random</code>, and every one of them takes an explicit{" "}
        <code>seed</code> argument: 67 call <code>random.seed(seed)</code>{" "}
        first, and 37 use a local <code>random.Random(seed)</code> instance.
        The verifier itself seeds nothing.
      </p>
      <p>
        Determinism is the problem&apos;s responsibility, not the runner&apos;s
        convenience. A bootstrap percentile interval, a Monte Carlo estimate, a
        Gibbs sweep, or inverted dropout is still a pure function of its
        inputs when the seed is an input. The same reasoning gives the browser
        the same numbers: a learner who re-runs the tests sees identical
        results, and so does CI.
      </p>

      <SectionHeading n={5}>Failure modes the suite catches</SectionHeading>
      <p>
        In practice the harness finds three families of bugs. Structural
        failures — unknown id prefixes, duplicate ids, a starter function named
        differently from the solution, fewer than three cases — are caught
        before Python even starts. Runtime failures surface on edge cases:
        empty lists, single elements, division by zero, a dict lookup that only
        exists for the happy path. Equality failures show up as floating-point
        drift outside 1e-6 or as a container mismatch.
      </p>
      <p>
        Dataset invariants Python cannot see live in{" "}
        <code>tests/data.test.ts</code>: unique titles across all 15
        categories, counts per difficulty, category totals. More than one
        batch landed with duplicate titles (softmax jacobian, variance
        reduction, effective sample size) and was cleaned up in a follow-up
        pass.
      </p>

      <SectionHeading n={6}>What it still cannot catch</SectionHeading>
      <p>
        The uncomfortable truth is that the verifier proves agreement, not
        correctness. If an expected value was authored with the same
        misunderstanding as the solution, the two agree and the suite is green
        with a wrong problem in it. Test cases are the spec, and the spec is
        written by the same batch that writes the code. For numeric problems
        the 1e-6 window is a useful lie detector; for algorithmic problems the
        cases themselves are the only definition of right.
      </p>
      <p>
        Coverage is the second limit. Three to five fixed cases cannot prove a
        function over its input space; boundary discipline — empty inputs,
        single elements, negative numbers, duplicate keys — is manual work.
        And nothing statically bans an unseeded random call; it would surface
        as an intermittent failure eventually. We rely on the seed convention
        and review, which is cheaper than an AST rule across 5,050 snippets.
      </p>
      <Callout variant="tradeoff" title="Where the real risk sits">
        <p>
          The harness is fast, deterministic, and strict about what it can see.
          The residual risk is authoring: a wrong expected value paired with a
          wrong solution passes both gates. That risk is managed by review and
          by the fact that every problem also ships a hint and a starter
          signature that a human can sanity-check — not by the verifier.
        </p>
      </Callout>

      <SectionHeading n={7}>Running it</SectionHeading>
      <p>
        The whole bank verifies in well under a second on a laptop, which is
        the strategic point: the check is cheap enough that it is never
        optional.<Footnote n={1} /> It runs alongside the TypeScript compiler,
        ESLint, and 252 unit tests, and a red run prints the exact case,
        input, actual, and expected for the first 60 failures.
      </p>
      <CodeBlock
        title="Terminal"
        language="Shell"
        code={`$ bun run scripts/verify-problems.ts
Loaded 5050 problem(s).
...
Structural errors: 0   Runtime failures: 0   Passed: 5050/5050
ALL GREEN`}
      />
      <p>
        If you want to see the bank without running anything,{" "}
        <BlogLink href="/problems">browse the problems</BlogLink> — every one
        of them is the artifact this pipeline produces.
      </p>

      <References>
        <ReferenceItem n={1}>
          <code>scripts/verify-problems.ts</code>,{" "}
          <code>scripts/py_verify.py</code>, and{" "}
          <code>src/lib/pyodide.ts</code> — the structural pass, the CPython
          harness, and the browser harness that shares its <code>_deep_eq</code>{" "}
          semantics. The dataset lives in <code>src/data/problems/</code> and is
          typed by <code>src/types/problem.ts</code>.
        </ReferenceItem>
      </References>
    </BlogProse>
  );
}
