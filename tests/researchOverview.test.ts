import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INVENTIONS, type InventionBlock } from "@/data/inventions";
import {
  CLAIM_CONVENTION,
  METHODS,
  PLANNED_WORK,
  PORTFOLIO_LIMITATIONS,
  REPRO_COMMANDS,
  REPRO_LIMITS,
  RESEARCH_AGENDA,
  RESEARCH_QUESTIONS,
  RESEARCH_SUMMARY,
  REVIEW_LABEL,
  REVIEW_STATEMENT,
  SCALE,
  STATUS_LEGEND,
  WORKS,
  allClaims,
  claimLabel,
  requireWorkEntry,
  statusLabel,
  workShortTitle,
  workTitle,
  type WorkKind,
} from "@/data/researchOverview";
import { statusLine } from "@/lib/inventions";

/**
 * The research surface is a set of claims about this portfolio, so its tests are
 * about discipline rather than layout:
 *
 * - the agenda sentence is exact, so the homepage and the index cannot disagree;
 * - every number on the page is asserted to appear in the paper it is
 *   attributed to, read out of the paper data itself;
 * - the status vocabulary is closed and every published paper is covered once;
 * - every claim is classified as a result or a hypothesis;
 * - no claim uses language a reviewer could not independently support;
 * - every reproduce command exists in package.json.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_SCRIPTS = (
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  }
).scripts;

/** All the prose a paper actually contains, as one searchable string. */
function paperText(slug: string): string {
  const paper = INVENTIONS.find((entry) => entry.slug === slug);
  if (!paper) throw new Error(`no paper "${slug}"`);
  const parts: string[] = [paper.title, paper.abstract, ...paper.keywords];
  const blockText = (block: InventionBlock): string => {
    switch (block.kind) {
      case "paragraph":
        return block.text;
      case "list":
        return block.items.join(" ");
      case "formula":
        return `${block.expression} ${block.label ?? ""} ${block.note ?? ""}`;
      case "code":
        return block.code;
      case "table":
        return [
          block.title ?? "",
          block.caption ?? "",
          block.columns.join(" "),
          block.rows.map((row) => row.join(" ")).join(" "),
        ].join(" ");
      case "figure":
        return [block.figure.title, block.figure.caption].join(" ");
      case "callout":
        return `${block.title} ${block.text}`;
      default:
        return "";
    }
  };
  for (const section of paper.sections) {
    parts.push(section.heading);
    for (const block of section.blocks) parts.push(blockText(block));
  }
  for (const reference of paper.references) {
    parts.push(reference.citation, reference.url);
  }
  return parts.join("\n");
}

/**
 * Every string the research surface can put in front of a reader, labels
 * included.
 */
function overviewStrings(): string[] {
  return [
    ...overviewClaims(),
    ...STATUS_LEGEND.map((entry) => entry.label),
    ...CLAIM_CONVENTION.map((entry) => entry.label),
    ...SCALE.map((entry) => entry.value),
    ...METHODS.map((method) => method.name),
    ...PLANNED_WORK.map((item) => item.title),
    ...RESEARCH_QUESTIONS.map((thread) => thread.title),
    ...REPRO_COMMANDS.map((entry) => entry.command),
  ];
}

/**
 * The prose a reviewer reads as a claim. Labels and titles are excluded on
 * purpose: "External replication" is the name of a planned study, whereas
 * "there is no external replication" is a statement about this portfolio, and
 * only the second is a claim the language rules apply to.
 */
function overviewClaims(): string[] {
  return [
    RESEARCH_AGENDA,
    REVIEW_STATEMENT,
    ...RESEARCH_SUMMARY,
    ...PORTFOLIO_LIMITATIONS,
    ...REPRO_LIMITS,
    ...STATUS_LEGEND.map((entry) => entry.definition),
    ...CLAIM_CONVENTION.map((entry) => entry.definition),
    ...SCALE.map((entry) => entry.label),
    ...METHODS.flatMap((method) => [method.does, method.cannot]),
    ...PLANNED_WORK.flatMap((item) => [item.question, item.state]),
    ...RESEARCH_QUESTIONS.flatMap((thread) => [thread.question, thread.detail]),
    ...REPRO_COMMANDS.map((entry) => entry.what),
    ...WORKS.flatMap((work) => [
      work.note,
      ...work.established.map((claim) => claim.text),
      ...work.hypotheses.map((claim) => claim.text),
    ]),
  ];
}

describe("the agenda", () => {
  test("is the exact approved sentence, so both surfaces carry the same words", () => {
    expect(RESEARCH_AGENDA).toBe(
      "Reliable and evidence-based programming education in the age of generative AI.",
    );
  });

  test("is a programme statement with a summary, not a claim of a finished theory", () => {
    expect(RESEARCH_AGENDA.endsWith(".")).toBe(true);
    expect(RESEARCH_SUMMARY.length).toBeGreaterThan(0);
    for (const paragraph of RESEARCH_SUMMARY) {
      expect(paragraph.trim().length).toBeGreaterThan(40);
    }
  });

  test("the review state is declared in the open, and denies submission too", () => {
    expect(REVIEW_STATEMENT.toLowerCase()).toContain("has been peer reviewed");
    expect(REVIEW_STATEMENT.toLowerCase()).toContain("no venue");
    expect(REVIEW_STATEMENT.toLowerCase()).toContain("submission");
    expect(REVIEW_LABEL).toBe("Not peer reviewed");
  });
});

describe("status vocabulary", () => {
  test("is closed: the legend and the kinds actually used are the same set", () => {
    const legendKinds = [...STATUS_LEGEND.map((entry) => entry.kind)].sort();
    const usedKinds = [
      ...new Set([
        ...WORKS.flatMap((work) => [...work.kinds]),
        ...PLANNED_WORK.flatMap((item) => [...item.kinds]),
      ]),
    ].sort();
    expect(usedKinds).toEqual(legendKinds);
    expect(new Set(legendKinds).size).toBe(legendKinds.length);
  });

  test("planned work is labelled unpublished, never as a result", () => {
    for (const item of PLANNED_WORK) {
      expect([...item.kinds], item.id).toEqual(["unpublished"]);
    }
  });

  test("names the four states the surface promises to distinguish", () => {
    expect(STATUS_LEGEND.map((entry) => entry.kind).sort()).toEqual([
      "artifact",
      "preprint",
      "technical-report",
      "unpublished",
    ]);
  });

  test("defines every label, and every label denies review or submission", () => {
    for (const entry of STATUS_LEGEND) {
      expect(entry.label.trim().length, entry.kind).toBeGreaterThan(0);
      expect(entry.definition.trim().length, entry.kind).toBeGreaterThan(40);
      expect(
        /not been submitted|not submitted|not a research contribution|unreviewed|planned or in-progress/i.test(
          entry.definition,
        ),
        entry.kind,
      ).toBe(true);
      expect(statusLabel(entry.kind)).toBe(entry.label);
    }
  });
});

describe("work coverage", () => {
  test("every published paper has exactly one overview entry, and no extras", () => {
    const slugs = INVENTIONS.map((paper) => paper.slug);
    expect(WORKS.map((work) => work.slug).sort()).toEqual([...slugs].sort());
    for (const slug of slugs) {
      const entry = requireWorkEntry(slug);
      expect(entry.slug).toBe(slug);
      expect(entry.kinds.length, slug).toBeGreaterThan(0);
      expect(entry.note.trim().length, slug).toBeGreaterThan(40);
    }
  });

  test("every kind a work carries is a real label, with no duplicates", () => {
    for (const work of WORKS) {
      const kinds: WorkKind[] = [...work.kinds];
      expect(new Set(kinds).size, work.slug).toBe(kinds.length);
      for (const kind of kinds) {
        expect(statusLabel(kind).length).toBeGreaterThan(0);
      }
    }
  });

  test("an unknown slug fails loudly instead of rendering a blank status", () => {
    let message = "";
    try {
      requireWorkEntry("not-a-paper");
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain("not-a-paper");
  });

  test("titles are read from the paper registry, so a rename cannot go stale", () => {
    for (const work of WORKS) {
      const paper = INVENTIONS.find((entry) => entry.slug === work.slug);
      expect(paper, work.slug).toBeTruthy();
      expect(workTitle(work.slug)).toBe(paper?.title ?? "");
      expect(workShortTitle(work.slug).length).toBeGreaterThan(0);
      expect(workShortTitle(work.slug).length).toBeLessThanOrEqual(
        (paper?.title.length ?? 0),
      );
    }
  });

  test("the three flagship works are the three research questions, in order", () => {
    const flagship = WORKS.filter((work) => work.role === "flagship").map(
      (work) => work.slug,
    );
    expect(flagship).toEqual([
      "alibi-distance",
      "behavioral-delta-ledger",
      "refutation-ledgers",
    ]);
    expect(flagship).toEqual(RESEARCH_QUESTIONS.map((thread) => thread.paper));
  });

  test("every research question points at a flagship work and a real route", () => {
    const flagshipSlugs = new Set(
      WORKS.filter((work) => work.role === "flagship").map((work) => work.slug),
    );
    for (const thread of RESEARCH_QUESTIONS) {
      expect(flagshipSlugs.has(thread.paper), thread.id).toBe(true);
      expect(thread.href.startsWith("/"), thread.id).toBe(true);
      expect(thread.question.trim().endsWith("?"), thread.id).toBe(true);
    }
  });

  test("every method names works that exist", () => {
    for (const method of METHODS) {
      expect(method.works.length, method.id).toBeGreaterThan(0);
      for (const slug of method.works) {
        expect(
          WORKS.some((work) => work.slug === slug),
          `${method.id}:${slug}`,
        ).toBe(true);
      }
    }
  });
});

describe("the result / hypothesis convention", () => {
  test("defines exactly two marks", () => {
    expect(CLAIM_CONVENTION.map((entry) => entry.kind)).toEqual([
      "result",
      "hypothesis",
    ]);
    expect(CLAIM_CONVENTION.map((entry) => entry.label)).toEqual([
      "Result",
      "Hypothesis",
    ]);
    expect(claimLabel("result")).toBe("Result");
    expect(claimLabel("hypothesis")).toBe("Hypothesis");
  });

  test("every work separates its results from its hypotheses", () => {
    for (const work of WORKS) {
      expect(work.established.length, `${work.slug} results`).toBeGreaterThan(0);
      expect(work.hypotheses.length, `${work.slug} hypotheses`).toBeGreaterThan(0);
      for (const claim of work.established) {
        expect(claim.kind, work.slug).toBe("result");
      }
      for (const claim of work.hypotheses) {
        expect(claim.kind, work.slug).toBe("hypothesis");
      }
    }
  });

  test("every claim is non-empty, unique, and long enough to be a claim", () => {
    const seen = new Set<string>();
    for (const { slug, claim } of allClaims()) {
      expect(claim.text.trim().length, slug).toBeGreaterThan(60);
      expect(
        seen.has(claim.text),
        `${slug}: ${claim.text.slice(0, 40)}`,
      ).toBe(false);
      seen.add(claim.text);
    }
  });

  test("a hypothesis never opens by asserting a finding of its own", () => {
    for (const work of WORKS) {
      for (const claim of work.hypotheses) {
        expect(
          /^(we |this paper )?(show|demonstrate|prove|proves|found|establishes)/i.test(
            claim.text,
          ),
          `${work.slug}: ${claim.text.slice(0, 50)}`,
        ).toBe(false);
      }
    }
  });
});

describe("traceability", () => {
  test("every scale figure appears literally in the paper it is attributed to", () => {
    for (const entry of SCALE) {
      expect(
        paperText(entry.paper).includes(entry.token),
        `${entry.value} (${entry.paper}) not in paper: ${entry.token}`,
      ).toBe(true);
      expect(entry.label.trim().length).toBeGreaterThan(10);
    }
  });

  test("the scale covers every published work", () => {
    const covered = new Set(SCALE.map((entry) => entry.paper));
    for (const work of WORKS) {
      expect(covered.has(work.slug), work.slug).toBe(true);
    }
  });

  test("every reproduce command exists in package.json", () => {
    expect(REPRO_COMMANDS.length).toBeGreaterThan(0);
    for (const entry of REPRO_COMMANDS) {
      const name = entry.command.replace(/^bun run /, "").replace(/^bun /, "");
      expect(PACKAGE_SCRIPTS[name], entry.command).toBeTruthy();
      expect(entry.what.trim().length, entry.command).toBeGreaterThan(20);
    }
  });

  test("reproducibility says what a gate is not", () => {
    expect(REPRO_LIMITS.length).toBeGreaterThan(2);
    const joined = REPRO_LIMITS.join(" ").toLowerCase();
    expect(joined).toContain("drift alarm");
    expect(joined).toContain("outside this repository");
  });
});

describe("planned work", () => {
  test("is listed, question-bearing, and explicitly unrun", () => {
    expect(PLANNED_WORK.length).toBeGreaterThan(0);
    for (const item of PLANNED_WORK) {
      expect(item.title.trim().length, item.id).toBeGreaterThan(3);
      expect(item.question.trim().endsWith("?"), item.id).toBe(true);
      expect(item.state.trim().length, item.id).toBeGreaterThan(60);
      // Unpublished work carries no result figure.
      expect(item.state, item.id).not.toContain("%");
      expect(
        /not started|no data|no protocol|not been run|has not happened/i.test(
          item.state,
        ),
        item.id,
      ).toBe(true);
    }
  });

  test("the portfolio admits that no generative-AI experiment exists", () => {
    const joined = PORTFOLIO_LIMITATIONS.join(" ").toLowerCase();
    expect(joined).toContain("no human-participant data");
    expect(joined).toContain("no external replication");
    expect(joined).toContain("generative-ai tutor");
    expect(joined).toContain("no work in this portfolio has been peer reviewed");
  });
});

describe("the paper status line", () => {
  test("names the kind and the review state, and is stable", () => {
    for (const work of WORKS) {
      const first = statusLine(work.slug);
      expect(first, work.slug).toBe(statusLine(work.slug));
      expect(first, work.slug).toContain(REVIEW_LABEL);
      for (const kind of work.kinds) {
        expect(first, work.slug).toContain(statusLabel(kind));
      }
    }
  });

  test("a preprint reads as a preprint and an artifact as an artifact", () => {
    expect(statusLine("alibi-distance")).toBe(
      `Preprint  \u00B7  Artifact  \u00B7  ${REVIEW_LABEL}`,
    );
    expect(statusLine("reprogpu")).toBe(
      `Technical report  \u00B7  Artifact  \u00B7  ${REVIEW_LABEL}`,
    );
  });
});

describe("language discipline", () => {
  /** Review, replication, and generalisation are the three claims that must
   *  always appear inside a negation on this surface. */
  const NEGATION =
    /\b(no|not|none|nothing|never|nowhere|unreviewed|untested|denied)\b/;

  const FORBIDDEN = [
    "novel",
    "state-of-the-art",
    "sota",
    "revolutionary",
    "groundbreaking",
    "first-ever",
    "first ever",
    "unprecedented",
    "breakthrough",
    "cutting-edge",
    "best-in-class",
    "world-class",
    "blazing",
    "seamless",
    "unmatched",
    "the first ",
    "unique",
  ];

  test("no claim uses language a reviewer could not independently support", () => {
    for (const text of overviewStrings()) {
      const lower = text.toLowerCase();
      for (const word of FORBIDDEN) {
        expect(lower.includes(word), `"${word}" in: ${text}`).toBe(false);
      }
    }
  });

  test("review, replication, and generalisation are only ever denied", () => {
    for (const text of overviewClaims()) {
      const lower = text.toLowerCase();
      for (const claim of [
        /peer[- ]review/,
        /\bexternal(ly)? (valid|replic|generaliz)/,
        /\bgeneralis(z|s)able\b/,
      ]) {
        if (!claim.test(lower)) continue;
        expect(
          NEGATION.test(lower),
          `claimed without a negation (${claim}): ${text}`,
        ).toBe(true);
      }
    }
  });

  test("no claim of publication in or acceptance by a venue", () => {
    for (const text of overviewClaims()) {
      const lower = text.toLowerCase();
      expect(
        /published in a (journal|venue|conference|proceedings)/.test(lower),
        text,
      ).toBe(false);
      expect(/accepted (at|by) a (venue|conference|journal)/.test(lower), text).toBe(
        false,
      );
    }
  });
});
