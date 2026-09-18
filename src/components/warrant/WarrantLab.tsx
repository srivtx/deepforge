"use client";

import { useState } from "react";
import {
  AdmissionError,
  D,
  WARRANT_MAX_GRADE,
  admit,
  assertValue,
  audit,
  canonicalJson,
  cone,
  deriveValue,
  emptyRegistry,
  emptyStore,
  headDigest,
  lambda,
  minGrade,
  registerRoot,
  replaySig,
  rootIdOf,
  submit,
  warrantHash,
  why,
} from "@/lib/warrant";
import type {
  Attempt,
  Grade,
  HeadAnchor,
  Outcome,
  Registry,
  RootId,
  Store,
  ValueId,
} from "@/lib/warrant";
import { BlastRadius } from "./BlastRadius";
import { LedgerPanel } from "./LedgerPanel";
import type { LedgerPanelProps } from "./LedgerPanel";

const AUTHOR = "Demo author";
const SUBMITTER = "demo-challenger";
const VERIFIER = "demo-verifier";
const CONTEXT = "warrant-demo:session";
const STATUS_HEADING_ID = "warrant-status-heading";

const INTRO =
  "Every card below is a claim this platform would normally hand you without evidence: a hint, an explanation, a difficulty label, a prerequisite link. Here each one carries the list of checks run against it and the grade that comes out. Press a button on any card to add a check, see the arithmetic, or audit the bookkeeping — all in this browser tab.";

const SESSION_NOTE =
  "Browser-session only. Nothing is stored or sent. The nine demo claims are built from a frozen fixture when the page loads; your button presses append to this tab's copy only.";

const AUDIT_NOTE =
  "Audit redoes the arithmetic and checks the stored link chain against a frozen head anchor. Because the anchor was frozen before this session, a claim you challenged here is expected to report a head-mismatch.";

const KIND_LABEL: Readonly<Record<string, string>> = {
  hint: "Hint",
  explanation: "Explanation",
  difficulty: "Difficulty",
  prerequisite: "Prerequisite",
};

const NOT_CLAIMED: readonly string[] = [
  "A grade is contestability accounting for one claim, never a badge that the claim is true, confirmed, or beyond doubt.",
  "The lab never grades people: no learner account, result, assessment, or progress is read, written, or reported.",
  "The counts are declared dependency classes (declared check-families), never evidence that the failure modes behind them differ. A shared method or a shared blind spot can still join one class (Knight–Leveson).",
  "The audit re-checks arithmetic against the ledger and the frozen head anchor; hash chains are tamper evidence, not authenticity.",
  "\"No challenge recorded\" is an empty ledger, not a positive warrant: absence of attempts is not survival.",
  "A refutation is recorded against the claim, never the person; nothing here changes a learner's record.",
  "This page makes no learning-outcome claim; the real-problem evidence belongs to the problem, not to this lab.",
];

interface DemoFixture {
  readonly registry: Registry;
  readonly store: Store;
  readonly labels: ReadonlyMap<ValueId, string>;
  readonly order: readonly ValueId[];
  readonly published: ReadonlyMap<ValueId, Grade>;
  readonly anchors: ReadonlyMap<ValueId, HeadAnchor>;
  readonly refuterOfFamily: ReadonlyMap<RootId, RootId>;
  readonly familyLabels: ReadonlyMap<RootId, string>;
  readonly refuterLabels: ReadonlyMap<RootId, string>;
  readonly fallbackFamily: RootId;
}

function buildDemoFixture(): DemoFixture {
  let registry = emptyRegistry();
  const register = (spec: string, coverage: readonly string[]): RootId => {
    registry = registerRoot(registry, AUTHOR, spec, coverage);
    return rootIdOf(AUTHOR, spec, [...new Set(coverage)].sort());
  };

  const family = {
    F0: register("family:F0", ["f0"]),
    F1: register("family:F1", ["f1"]),
    F2: register("family:F2", ["f2a", "f2b", "f2c", "f2d"]),
    F3: register("family:F3", ["f2a", "f2b", "f2c"]),
  };
  const refuter = {
    r0: register("refuter:r0", []),
    r1: register("refuter:r1", []),
    r2: register("refuter:r2", []),
    r3: register("refuter:r3", []),
  };

  const refuterOfFamily = new Map<RootId, RootId>([
    [family.F0, refuter.r0],
    [family.F1, refuter.r1],
    [family.F2, refuter.r2],
    [family.F3, refuter.r3],
  ]);
  const familyLabels = new Map<RootId, string>([
    [family.F0, "F0"],
    [family.F1, "F1"],
    [family.F2, "F2"],
    [family.F3, "F3"],
  ]);
  const refuterLabels = new Map<RootId, string>([
    [refuter.r0, "r0"],
    [refuter.r1, "r1"],
    [refuter.r2, "r2"],
    [refuter.r3, "r3"],
  ]);

  let store = emptyStore();
  const labels = new Map<ValueId, string>();
  const order: ValueId[] = [];

  const appendAttempt = (
    id: ValueId,
    familyId: RootId,
    refuterId: RootId,
    outcome: Outcome,
  ): void => {
    const value = store.values.get(id);
    if (value === undefined) {
      throw new Error(`demo fixture: unknown value ${id}`);
    }
    const seed = String(value.chain.length);
    const attempt: Attempt = {
      refuter: refuterId,
      family: familyId,
      seed,
      outcome,
      cost: 0,
      witness: warrantHash(canonicalJson({ valueId: id, outcome, seed })),
      submittedBy: SUBMITTER,
    };
    const prev = headDigest(id, value.chain);
    store = admit(
      store,
      registry,
      id,
      submit(attempt, replaySig(VERIFIER, prev, attempt)),
      VERIFIER,
    );
  };

  const addClaim = (label: string, kind: string, statement: string): ValueId => {
    const created = assertValue(store, registry, { claim: label, statement }, kind, CONTEXT);
    store = created.store;
    labels.set(created.id, label);
    order.push(created.id);
    return created.id;
  };

  const addDerived = (
    label: string,
    cites: readonly ValueId[],
    statement: string,
  ): ValueId => {
    const created = deriveValue(
      store,
      registry,
      warrantHash(canonicalJson({ claim: label, statement, op: "derive" })),
      cites,
      CONTEXT,
    );
    store = created.store;
    labels.set(created.id, label);
    order.push(created.id);
    return created.id;
  };

  const hint000 = addClaim(
    "hint-000",
    "hint",
    "A build hint that survived the F0, F1, and F2 declared check-families.",
  );
  const explanation001 = addClaim(
    "explanation-001",
    "explanation",
    "A worked explanation that survived F0, F1, and F2; the frozen anchor points here.",
  );
  const difficulty002 = addClaim(
    "difficulty-002",
    "difficulty",
    "A difficulty estimate with no admitted attempts yet.",
  );
  const prerequisite003 = addClaim(
    "prerequisite-003",
    "prerequisite",
    "A prerequisite link whose single F2 attempt was refuted.",
  );
  const prerequisite004 = addDerived(
    "prerequisite-004",
    [explanation001],
    "A derived prerequisite link that cites explanation-001.",
  );
  const hint005 = addClaim(
    "hint-005",
    "hint",
    "A hint whose F2 and F3 declarations overlap, so one class covers both.",
  );
  const explanation006 = addClaim(
    "explanation-006",
    "explanation",
    "A second explanation that survived F0 and F1.",
  );
  const difficulty007 = addClaim(
    "difficulty-007",
    "difficulty",
    "A difficulty estimate with one inconclusive F1 attempt.",
  );
  const hint008 = addDerived(
    "hint-008",
    [prerequisite004],
    "A derived hint that cites prerequisite-004.",
  );

  appendAttempt(hint000, family.F0, refuter.r0, "survived");
  appendAttempt(hint000, family.F1, refuter.r1, "survived");
  appendAttempt(hint000, family.F2, refuter.r2, "survived");

  appendAttempt(explanation001, family.F0, refuter.r0, "survived");
  appendAttempt(explanation001, family.F1, refuter.r1, "survived");
  appendAttempt(explanation001, family.F2, refuter.r2, "survived");

  appendAttempt(prerequisite003, family.F2, refuter.r2, "refuted");

  appendAttempt(prerequisite004, family.F0, refuter.r0, "survived");
  appendAttempt(prerequisite004, family.F1, refuter.r1, "survived");

  appendAttempt(hint005, family.F2, refuter.r2, "survived");
  appendAttempt(hint005, family.F3, refuter.r3, "survived");

  appendAttempt(explanation006, family.F0, refuter.r0, "survived");
  appendAttempt(explanation006, family.F1, refuter.r1, "survived");

  appendAttempt(difficulty007, family.F1, refuter.r1, "inconclusive");

  appendAttempt(hint008, family.F2, refuter.r2, "survived");
  appendAttempt(hint008, family.F3, refuter.r3, "survived");

  const published = new Map<ValueId, Grade>();
  const anchors = new Map<ValueId, HeadAnchor>();
  for (const id of order) {
    const value = store.values.get(id);
    if (value === undefined) continue;
    const grade = lambda(store, registry, id);
    published.set(id, grade);
    anchors.set(id, {
      valueId: id,
      length: value.chain.length,
      head: headDigest(id, value.chain),
      published: grade,
    });
  }

  return {
    registry,
    store,
    labels,
    order,
    published,
    anchors,
    refuterOfFamily,
    familyLabels,
    refuterLabels,
    fallbackFamily: family.F0,
  };
}

const FIXTURE: DemoFixture = buildDemoFixture();

type ClaimCardProps = Pick<LedgerPanelProps, "valueId" | "kindLabel" | "publishedGrade">;

const CARDS: readonly ClaimCardProps[] = FIXTURE.order.map((valueId) => {
  const value = FIXTURE.store.values.get(valueId);
  const label = FIXTURE.labels.get(valueId) ?? valueId;
  const kind = value?.kind ?? "claim";
  return {
    valueId,
    kindLabel: `${KIND_LABEL[kind] ?? kind} · ${label}`,
    publishedGrade: FIXTURE.published.get(valueId) ?? null,
  };
});

function formatGrade(grade: Grade): string {
  return grade === "dead" ? "dead" : String(grade);
}

export function WarrantLab() {
  const { registry, labels, published, anchors, refuterOfFamily, familyLabels, refuterLabels, fallbackFamily } =
    FIXTURE;
  const [store, setStore] = useState<Store>(FIXTURE.store);
  const [auditSummary, setAuditSummary] = useState<string | undefined>();
  const [blast, setBlast] = useState<{
    id: ValueId;
    before: ReadonlyMap<ValueId, Grade>;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const labelOf = (id: ValueId): string => labels.get(id) ?? id;

  const focusStatus = (): void => {
    document.getElementById(STATUS_HEADING_ID)?.focus();
  };

  const onChallenge = (valueId: ValueId, outcome: Outcome): void => {
    const value = store.values.get(valueId);
    if (value === undefined) return;
    const before = new Map<ValueId, Grade>();
    for (const id of cone(store, valueId)) {
      before.set(id, lambda(store, registry, id));
    }
    const survivor = value.chain.find(
      (append) => append.attempt.outcome === "survived",
    );
    const family = survivor?.attempt.family ?? fallbackFamily;
    const refuter = refuterOfFamily.get(family) ?? refuterOfFamily.get(fallbackFamily);
    if (refuter === undefined) return;
    const seed = String(value.chain.length);
    const attempt: Attempt = {
      refuter,
      family,
      seed,
      outcome,
      cost: 0,
      witness: warrantHash(canonicalJson({ valueId, outcome, seed })),
      submittedBy: SUBMITTER,
    };
    const prev = headDigest(valueId, value.chain);
    try {
      const next = admit(
        store,
        registry,
        valueId,
        submit(attempt, replaySig(VERIFIER, prev, attempt)),
        VERIFIER,
      );
      setStore(next);
      setAuditSummary(undefined);
      if (outcome === "refuted") {
        setBlast({ id: valueId, before });
        setMessage(
          `Local refutation admitted for ${labelOf(valueId)}. The blast radius below lists the claims that recompute to dead in this session; the frozen anchor predates the append.`,
        );
      } else if (outcome === "survived") {
        setMessage("Local challenge recorded: this session only.");
      } else {
        setMessage("Local inconclusive challenge recorded: this session only.");
      }
    } catch (error) {
      setAuditSummary(undefined);
      setMessage(
        error instanceof AdmissionError
          ? `Rejected locally: ${error.code} — ${error.message}`
          : error instanceof Error
            ? error.message
            : String(error),
      );
    }
    focusStatus();
  };

  const onWhy = (valueId: ValueId): void => {
    const value = store.values.get(valueId);
    if (value === undefined) return;
    const { chain, cites } = why(store, valueId);
    const grade = lambda(store, registry, valueId);
    const refuted = chain.some((append) => append.attempt.outcome === "refuted");
    const classes = D(chain, registry);
    const cap = Math.min(WARRANT_MAX_GRADE, classes) as Grade;
    const citeRows = cites.map((cite) => ({
      cite,
      label: labelOf(cite),
      grade: lambda(store, registry, cite),
    }));
    const lines: string[] = [
      `γ(${labelOf(valueId)}) = ${formatGrade(grade)}`,
      `Admitted appends: ${chain.length}`,
      `Own declared dependency classes D(chain) = ${classes}; capped min(K = ${WARRANT_MAX_GRADE}, D) = ${cap}`,
    ];
    if (refuted) {
      lines.push("A refuted append is terminal: γ is dead regardless of the fold below.");
    }
    if (chain.length === 0) {
      lines.push("Ledger: no admitted attempts (absence of attempts is not survival).");
    } else {
      lines.push("Ledger:");
      chain.forEach((append, index) => {
        const family = familyLabels.get(append.attempt.family) ?? append.attempt.family;
        const refuter = refuterLabels.get(append.attempt.refuter) ?? append.attempt.refuter;
        lines.push(
          `  ${index}. ${family} · refuter ${refuter} · ${append.attempt.outcome} · seed ${append.attempt.seed}`,
        );
      });
    }
    if (citeRows.length === 0) {
      lines.push("Cites: none");
    } else {
      lines.push("Cites:");
      for (const row of citeRows) {
        lines.push(`  ${row.label} (${row.cite}) γ = ${formatGrade(row.grade)}`);
      }
    }
    if (!refuted) {
      let current: Grade = cap;
      let pinned = `own declared dependency classes (cap ${cap})`;
      for (const row of citeRows) {
        const next = minGrade(current, row.grade);
        if (next !== current) {
          current = next;
          pinned = `${row.label} (γ ${formatGrade(row.grade)})`;
        }
      }
      lines.push(
        `Fold trace: start at own cap ${cap}; γ = ${formatGrade(current)}; pinned by ${pinned}.`,
      );
    }
    setMessage(lines.join("\n"));
    setAuditSummary(undefined);
    focusStatus();
  };

  const onAudit = (valueId: ValueId): void => {
    if (!store.values.has(valueId)) return;
    const report = audit(valueId, store, registry, published, anchors.get(valueId) ?? null);
    const lines: string[] = [
      `Audit of ${labelOf(valueId)} (${valueId})`,
      `ok: ${report.ok ? "yes" : "no"}`,
      `recomputed γ: ${formatGrade(report.recomputed)}`,
      `published γ: ${report.published === null ? "none" : formatGrade(report.published)}`,
      `issues: ${report.issues.length}`,
    ];
    report.issues.forEach((issue, index) => {
      const where = issue.index === null ? "" : ` at append ${issue.index}`;
      lines.push(`${index + 1}. ${issue.kind}${where} — ${issue.detail}`);
    });
    setAuditSummary(lines.join("\n"));
    setMessage(null);
    focusStatus();
  };

  return (
    <section
      aria-label="Warrant Lab"
      className="mx-auto w-full max-w-6xl px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8"
    >
      <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <h2 className="text-sm font-medium text-ink">Warrant Lab</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-body">{INTRO}</p>
        <p className="max-w-3xl text-xs leading-relaxed text-body-mid">{SESSION_NOTE}</p>
      </div>

      <section className="mt-4 rounded-lg border border-hairline bg-canvas-card">
        <div className="border-b border-hairline px-4 py-2.5 sm:px-5">
          <h2
            id={STATUS_HEADING_ID}
            tabIndex={-1}
            className="text-xs font-medium text-body-mid focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            What just happened
          </h2>
        </div>
        <div aria-live="polite" className="flex flex-col gap-3 px-4 py-4 sm:px-5">
          <p className="text-[11px] leading-snug text-mute">{AUDIT_NOTE}</p>
          {message !== null && (
            <pre className="df-scroll max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-body">
              {message}
            </pre>
          )}
          {auditSummary !== undefined && (
            <pre className="df-scroll max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-body">
              {auditSummary}
            </pre>
          )}
          {message === null && auditSummary === undefined && (
            <p className="text-xs leading-snug text-body-mid">
              Nothing yet. Press a button on any claim card below — start with
              &quot;Why this grade?&quot; on Hint · hint-000, or follow the
              three-press tour above.
            </p>
          )}
        </div>
      </section>

      {blast !== null && (
        <div className="mt-4">
          <BlastRadius
            store={store}
            registry={registry}
            challengedId={blast.id}
            before={blast.before}
            onClose={() => setBlast(null)}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {CARDS.map((card) => (
          <LedgerPanel
            key={card.valueId}
            store={store}
            registry={registry}
            valueId={card.valueId}
            kindLabel={card.kindLabel}
            publishedGrade={card.publishedGrade}
            onChallenge={onChallenge}
            onWhy={onWhy}
            onAudit={onAudit}
            auditSummary={auditSummary}
          />
        ))}
      </div>

      <section aria-label="What this is not" className="mt-4">
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink">What this is not</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs leading-relaxed text-body-mid">
            {NOT_CLAIMED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}
