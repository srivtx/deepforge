# Article Style Guide

How the interactive articles in `src/data/articles.ts` are written. The goal is
simple: a smart reader with zero machine-learning background should understand
every paragraph. Read this before editing article prose.

## 1. Teach from first principles

- Explain **why** a concept exists before **how** it works. Start with the
  human problem (a model must pick among 50,000 words; a cache never stops
  growing), build the idea in plain words, and only then introduce the math.
- Introduce every symbol on first use, in words. Example: "temperature is a
  number we divide the logits by", "β (beta) is a positive number that
  controls how far the model may drift", "the double bars `‖a‖` mean the
  length of a".
- Never use a term before explaining it. If a sentence needs *embedding*,
  *logit*, *gradient*, *epoch*, *tensor*, *entropy*, or *inertia*, define it
  first or say it in ordinary language.
- Prefer a concrete analogy from everyday life before the abstraction:
  standing on a hill in fog, a budget of attention, a ranked list of
  candidates.

## 2. Language rules

- Short sentences. One idea per sentence.
- Numbers with units and scale: "512 kilobytes for a single token",
  "about 12 bytes per parameter", "English runs about 1.3 tokens per word".
- No unexplained jargon, no "obviously", no "as we all know", no "famously",
  no "it can be shown that". No marketing voice ("powerful", "blazing fast").
- Write like a patient teacher at a whiteboard. Address the reader as "you"
  when describing a demo.
- Keep the math that earns its place, but every formula must be readable as a
  sentence: put the words first, then the symbols, then a worked number.

## 3. Structure is locked

Only prose text may change. When rewriting an article you MUST NOT change:

- `id`, `slug`, `title`, `category`, `readMinutes`, `problemIds`, `dek`
  meaning;
- the section sequence: same number of sections, in the same order, with the
  same kinds (`prose` / `demo` / `figure`);
- demo/figure wiring: `demo`, `params`, `figure` values are fixed;
- figure captions must stay non-empty (they are prose and may be rewritten).

Splitting or merging paragraphs inside a prose section is allowed when it
improves comprehension. Splitting a section into two sections is not.

## 4. Don't bloat

Simpler, not longer. If a rewrite grows the word count by more than roughly
20%, cut something. Plainness is the goal, not volume. Remove filler such as
"it is worth noting", "in order to", "the fact that".

## 5. Checklist for a rewrite pass

- [ ] Does each section open with the problem or purpose, not a definition?
- [ ] Is every symbol defined in words at first use?
- [ ] Can a reader who has never trained a model follow every sentence?
- [ ] Are numbers concrete and comparable (units, scale, an example)?
- [ ] Is the structure byte-identical (kinds, order, ids, demos, figures)?
- [ ] Does `bunx tsc --noEmit`, `npx eslint src/data/articles.ts`, and
      `bun test` stay green?
