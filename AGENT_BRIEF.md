# DeepForge Agent Brief

Read this fully before working. Also read `AGENT_CONTEXT.md` and the existing files you touch.

## Golden rules

1. **Only touch the files you are assigned.** Other agents edit other files in parallel. Editing a shared file (or someone else's file) will be reverted and wastes a whole work package.
2. **Never run `git` commands.** The orchestrator commits.
3. **Verify before you finish.** Your work is not done until the exact verification command in your task prints `ALL GREEN` (and `bunx tsc --noEmit` passes for components).
4. **No new dependencies.** No npm packages, no Python libraries. Pure Python only for solutions (stdlib `math`, `random`, `collections`, `itertools`, `heapq`, `bisect`, `functools` are fine — and only if your solution needs them).
5. **Match the existing design system.** Colors come from CSS variables via Tailwind tokens: `bg-canvas`, `bg-canvas-card`, `bg-canvas-soft`, `border-hairline`, `text-ink`, `text-body`, `text-body-mid`, `text-accent`, `border-accent`, `text-warning`, `text-error`. Inter for text, `font-mono` for code only. No shadows, no gradients, no uppercase eyebrow labels, no `//` markers, 1px borders, `rounded-lg`.

## Problem format

```ts
import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-001",
    title: "Binary Search",
    category: "Algorithms",
    difficulty: "Easy",
    description: "2-4 clear sentences. Use \\n\\n for paragraph breaks.",
    starterCode: `def binary_search(arr, target):
    # Your code here
    pass`,
    solution: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    testCases: [
      { input: [[1, 3, 5, 7], 5], expected: 2 },
      { input: [[1, 3, 5, 7], 2], expected: -1 },
      { input: [[], 1], expected: -1 },
    ],
    hint: "Keep two pointers and halve the search range each step.",
  },
];
```

### Hard rules for problems

- **Every solution must be correct pure Python.** The test runner calls the first `def` in your `solution` with the positional args from `input`, exactly like the browser Pyodide harness (tolerance `1e-6`).
- **Expected values must be JSON-serializable and exactly what the solution returns within tolerance.** Lists (not tuples), numbers (finite — no `nan`, no `inf`), strings, booleans, dicts with **string** keys.
- **Deterministic.** If you use `random`, call `random.seed(...)` inside the function first. Never depend on dict ordering side effects, time, or I/O.
- **3 to 5 test cases** per problem, including edge cases (empty input, single element, zeros, negatives). The verifier *fails* fewer than 3 or more than 6.
- **`starterCode` function name must match `solution` function name.** Starter body ends with `pass`.
- **Never use the characters `` ` `` or `${` inside Python code strings** (they break TS template literals). Python f-strings are fine — `f"{x}"`.
- **No `input()`, no file I/O, no printing inside the solution.** It must return the value.
- **Descriptions:** state the function signature, the formula/algorithm, and any assumptions. 2–4 sentences.
- **IDs:** use exactly the ID range assigned in your task. Never reuse or skip into another task's range.
- **Suggested difficulty mix per batch of 40:** ~14 Easy, ~18 Medium, ~8 Hard. Hard means mathematical derivation or genuinely tricky algorithm, not just long.
- **Uniqueness:** no duplicate titles or near-duplicate problems within your batch, and do not duplicate problems that already exist in the repo (search the category directory first).

### Verify command

```bash
bun run scripts/verify-problems.ts src/data/problems/<category>/<part-file>.ts
```

It runs structural checks (ids, required fields, test-case counts, function-name match) and then **executes every solution in real Python**. Fix every failure until it prints `ALL GREEN`. Write problems in chunks (e.g. 15 at a time) so a truncated write is easy to spot.

## Components

- `"use client"` at the top of any component using hooks/state/browser APIs.
- Use `localStorage` via a small `src/lib/*.ts` store with try/catch and a custom event (`window.dispatchEvent(new CustomEvent("deepforge:..."))`) rather than reading storage in render loops.
- Import data with the `@/` alias.
- Keep components self-contained: **do not edit `src/app/page.tsx`, `src/components/Header.tsx`, or `src/app/globals.css`** unless your task explicitly says so. The orchestrator wires components into the page.
- Accessibility: real `<button>` elements for actions, `aria-label` on icon buttons, keyboard-closeable overlays (Escape), focus states.
- Mobile: everything must work at 375px width. Test class choices mentally; avoid fixed pixel widths.

### Component verification

```bash
bunx tsc --noEmit
npx eslint src/components/<YourFile>.tsx src/lib/<YourFile>.ts
```

Both must pass clean (no errors; warnings about unused vars are not acceptable either).
