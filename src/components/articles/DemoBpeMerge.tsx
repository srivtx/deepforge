"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "@/lib/articles-demos";

interface CorpusWord {
  word: string;
  count: number;
}

const CORPUS: CorpusWord[] = [
  { word: "low", count: 5 },
  { word: "lower", count: 2 },
  { word: "newest", count: 6 },
  { word: "widest", count: 3 },
];

const COUNTS = CORPUS.map((entry) => entry.count);
const END = "\u00B7";
const MAX_MERGES = 12;
const SENTENCE = "lowest newest widest lower";
const SENTENCE_WORDS = SENTENCE.split(" ");
const SENTENCE_CHARS = SENTENCE.replace(/\s/g, "").length;

interface MergeRule {
  left: string;
  right: string;
  merged: string;
  count: number;
}

function splitWord(word: string): string[] {
  return [...word, END];
}

function applyMerge(words: string[][], rule: MergeRule): string[][] {
  return words.map((symbols) => {
    const next: string[] = [];
    let i = 0;
    while (i < symbols.length) {
      if (
        i + 1 < symbols.length &&
        symbols[i] === rule.left &&
        symbols[i + 1] === rule.right
      ) {
        next.push(rule.merged);
        i += 2;
      } else {
        next.push(symbols[i]);
        i += 1;
      }
    }
    return next;
  });
}

function symbolsFromMerges(rules: MergeRule[]): string[][] {
  let words = CORPUS.map((entry) => splitWord(entry.word));
  for (const rule of rules) words = applyMerge(words, rule);
  return words;
}

function countPairs(words: string[][]): Map<string, MergeRule> {
  const pairs = new Map<string, MergeRule>();
  for (let w = 0; w < words.length; w++) {
    const symbols = words[w];
    for (let i = 0; i + 1 < symbols.length; i++) {
      const key = `${symbols[i]}\u0000${symbols[i + 1]}`;
      const seen = pairs.get(key);
      if (seen) {
        seen.count += COUNTS[w];
      } else {
        pairs.set(key, {
          left: symbols[i],
          right: symbols[i + 1],
          merged: symbols[i] + symbols[i + 1],
          count: COUNTS[w],
        });
      }
    }
  }
  return pairs;
}

function bestPair(pairs: Map<string, MergeRule>): MergeRule | null {
  let best: MergeRule | null = null;
  for (const rule of pairs.values()) {
    if (best === null || rule.count > best.count) best = rule;
  }
  return best;
}

function nextRuleFrom(rules: MergeRule[]): MergeRule | null {
  return bestPair(countPairs(symbolsFromMerges(rules)));
}

function totalTokens(words: string[][]): number {
  return words.reduce(
    (sum, symbols, i) => sum + symbols.length * COUNTS[i],
    0,
  );
}

function vocabulary(words: string[][]): string[] {
  const set = new Set<string>();
  for (const symbols of words) for (const symbol of symbols) set.add(symbol);
  return [...set].sort();
}

function encode(word: string, rules: MergeRule[]): string[] {
  let symbols = splitWord(word);
  for (const rule of rules) symbols = applyMerge([symbols], rule)[0];
  return symbols;
}

function SymbolPill({ symbol, merged }: { symbol: string; merged: boolean }) {
  return (
    <span
      className={
        merged
          ? "rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent"
          : "rounded border border-hairline bg-canvas-soft px-1.5 py-0.5 font-mono text-[11px] text-body"
      }
    >
      {symbol === END ? "\u00B7" : symbol}
    </span>
  );
}

export function BpeMergeDemo(_props: DemoProps) {
  const [merges, setMerges] = useState<MergeRule[]>([]);

  const wordsNow = useMemo(() => symbolsFromMerges(merges), [merges]);
  const next = useMemo(() => nextRuleFrom(merges), [merges]);
  const tokenCount = totalTokens(wordsNow);
  const vocab = vocabulary(wordsNow);

  const sentenceTokens = useMemo(
    () => SENTENCE_WORDS.flatMap((word) => encode(word, merges)),
    [merges],
  );
  const charsPerToken =
    sentenceTokens.length > 0 ? SENTENCE_CHARS / sentenceTokens.length : 0;

  const step = (times: number) => {
    setMerges((prev) => {
      let current = prev;
      for (let i = 0; i < times && current.length < MAX_MERGES; i++) {
        const rule = nextRuleFrom(current);
        if (!rule) break;
        current = [...current, rule];
      }
      return current;
    });
  };

  const last = merges.length > 0 ? merges[merges.length - 1] : null;
  const status =
    last === null
      ? "Nothing merged yet. The corpus holds 16 word instances and 95 tokens. The pair e+s appears 9 times — more than any other pair."
      : `Step ${merges.length}: merged ${last.left}+${last.right} (seen ${last.count} times). ` +
        `The corpus is now ${tokenCount} tokens across ${vocab.length} distinct symbols. ` +
        (next
          ? `Next: ${next.left}+${next.right} \u00D7${next.count}.`
          : "No pairs left — every word is a single token.");

  const isNextPair = (symbols: string[], i: number) =>
    next !== null &&
    i + 1 < symbols.length &&
    symbols[i] === next.left &&
    symbols[i + 1] === next.right;

  const buttonPrimary =
    "min-h-11 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40 sm:min-h-0";
  const buttonSecondary =
    "min-h-11 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50 sm:min-h-0";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Merge the most frequent pair
        </span>
        <span className="font-mono text-[11px] text-body-mid">
          low&times;5 &middot; lower&times;2 &middot; newest&times;6 &middot;
          widest&times;3
        </span>
      </figcaption>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[10px] text-mute">merges</span>
        {merges.length === 0 && (
          <span className="text-[11px] text-mute">none yet</span>
        )}
        {merges.map((rule, i) => (
          <span
            key={`${rule.merged}-${i}`}
            className="rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent"
          >
            #{i + 1} {rule.left}+{rule.right}
          </span>
        ))}
        {next && (
          <span className="rounded-full border border-dashed border-info/60 px-2 py-0.5 font-mono text-[10px] text-info">
            next: {next.left}+{next.right} &times;{next.count}
          </span>
        )}
      </div>

      <ul className="mt-3 space-y-1.5">
        {CORPUS.map((entry, w) => (
          <li key={entry.word} className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="w-16 shrink-0 font-mono text-[11px] text-body-mid">
              {entry.word} &times;{entry.count}
            </span>
            {wordsNow[w].map((symbol, i) => (
              <span
                key={`${w}-${i}`}
                className={
                  isNextPair(wordsNow[w], i)
                    ? "rounded border border-dashed border-info/70 px-1.5 py-0.5"
                    : undefined
                }
              >
                <SymbolPill symbol={symbol} merged={symbol.length > 1} />
              </span>
            ))}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-body-mid">
        <span>
          corpus tokens <span className="text-ink">{tokenCount}</span>
        </span>
        <span>
          vocabulary <span className="text-ink">{vocab.length}</span>
        </span>
        <span>
          merges{" "}
          <span className="text-ink">
            {merges.length}/{MAX_MERGES}
          </span>
        </span>
        <span className="text-mute">dashed = merged on the next step</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => step(1)}
          disabled={next === null || merges.length >= MAX_MERGES}
          className={buttonPrimary}
        >
          Merge next pair
        </button>
        <button
          type="button"
          onClick={() => step(5)}
          disabled={next === null || merges.length >= MAX_MERGES}
          className={buttonSecondary}
        >
          Merge 5
        </button>
        <button
          type="button"
          onClick={() => setMerges([])}
          disabled={merges.length === 0}
          className={buttonSecondary}
        >
          Reset
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-hairline bg-canvas px-3 py-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] text-mute">
            encode &ldquo;{SENTENCE}&rdquo;
          </span>
          <span className="font-mono text-[10px] text-body-mid">
            <span className="text-ink">{sentenceTokens.length}</span> tokens
            &middot; {charsPerToken.toFixed(2)} chars/token
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {SENTENCE_WORDS.map((word, w) => (
            <span key={`${word}-${w}`} className="inline-flex flex-wrap items-center gap-1">
              {encode(word, merges).map((symbol, i) => (
                <SymbolPill key={`${w}-${i}`} symbol={symbol} merged={symbol.length > 1} />
              ))}
            </span>
          ))}
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {status}
      </p>
    </figure>
  );
}
