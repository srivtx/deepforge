import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  buildCertificateText,
  CATEGORY_MILESTONE_RATIO,
  certificateCredentialCode,
  FALLBACK_RECIPIENT,
  formatCertificateDate,
  formatMeasure,
  getEligible,
  getIssued,
  INTERVIEW_MOCK_RATIO,
  issueCertificate,
  payloadFromCertificate,
  revokeCertificate,
  verificationCode,
  type Certificate,
  type CertificateEntry,
} from "@/lib/certificates";
import { verifyCredential } from "@/lib/credentials";
import { CATEGORIES, LEARNING_PATHS, PROBLEMS } from "@/data/problems";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { LABS } from "@/data/labs";
import { PROJECTS } from "@/data/projects";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { setLabBest } from "@/lib/labs";
import type { ProgressMap } from "@/lib/progress";

function createStorageStub(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

const globalScope = globalThis as unknown as { window?: unknown };
let originalWindow: unknown;
let hadWindow = false;
let stub: Storage;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

const PROGRESS_KEY = "deepforge:progress:v1";
const CERTIFICATES_KEY = "deepforge:certificates:v1";
const USERNAME_KEY = "deepforge:username:v1";
const LABS_KEY = "deepforge:labs";
const INTERVIEW_KEY = "deepforge:interview:v1";
const RESEARCH_KEY = "deepforge:research:v1";

function solvedProgress(ids: string[]): ProgressMap {
  const map: ProgressMap = {};
  for (const id of ids) {
    map[id] = {
      attempted: true,
      solved: true,
      solvedAt: "2026-01-14T12:00:00.000Z",
    };
  }
  return map;
}

function seedSolved(ids: string[]): void {
  stub.setItem(PROGRESS_KEY, JSON.stringify(solvedProgress(ids)));
}

/**
 * Seed the research store. `beatenIds` get the sticky `beatenBaseline` flag;
 * `scores` optionally carry a `bestScore` to exercise the score comparison.
 */
function seedResearch(
  beatenIds: string[],
  scores: Record<string, number> = {},
): void {
  const beaten = new Set(beatenIds);
  const state: Record<string, unknown> = {};
  for (const challenge of RESEARCH_CHALLENGES) {
    state[challenge.id] = {
      bestScore: scores[challenge.id] ?? null,
      bestAt: scores[challenge.id] === undefined ? null : "2026-01-14T12:00:00.000Z",
      beatenBaseline: beaten.has(challenge.id),
      attempts: [],
    };
  }
  stub.setItem(RESEARCH_KEY, JSON.stringify(state));
}

function beatingScore(index: number): number {
  const challenge = RESEARCH_CHALLENGES[index];
  return challenge.higherIsBetter
    ? challenge.baselineScore + 0.01
    : challenge.baselineScore - 0.01;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function referenceCode(cert: Certificate): string {
  const base = `${cert.kind}|${cert.refId}|${cert.recipient}|${cert.issuedAt}`;
  const first = fnv1a(base).toString(36);
  const second = fnv1a(`${base}#verify`).toString(36);
  return `${first}${second}`.slice(0, 8).padEnd(8, "0").toUpperCase();
}

const demoEntry: CertificateEntry = {
  kind: "path",
  refId: "demo-path",
  title: "Demo Path",
  detail: "3 of 3 problems · Demo Path path",
  total: 3,
  solved: 3,
};

const demoCertificate: Certificate = {
  id: "collection:demo",
  kind: "collection",
  refId: "demo-collection",
  title: "Demo Collection",
  recipient: "Ada Lovelace",
  issuedAt: "2026-01-14T12:00:00.000Z",
  detail: "7 of 7 problems · Demo Collection collection",
};

const RESEARCH_TOTAL = RESEARCH_CHALLENGES.length;

const researchEntry: CertificateEntry = {
  kind: "research",
  refId: "research-baselines",
  title: `Research Challenges — ${RESEARCH_TOTAL}/${RESEARCH_TOTAL} baselines beaten`,
  detail: `${RESEARCH_TOTAL} of ${RESEARCH_TOTAL} baselines beaten · research challenges`,
  total: RESEARCH_TOTAL,
  solved: RESEARCH_TOTAL,
};

describe("eligibility", () => {
  test("empty progress unlocks nothing", () => {
    expect(getEligible()).toEqual([]);
    expect(getIssued()).toEqual([]);
  });

  test("a fully solved learning path is eligible", () => {
    const path = LEARNING_PATHS[0];
    seedSolved([...path.problemIds]);

    const entry = getEligible().find(
      (candidate) => candidate.kind === "path" && candidate.refId === path.id,
    );
    expect(entry).toBeTruthy();
    const total = new Set(path.problemIds).size;
    expect(entry!.title).toBe(path.title);
    expect(entry!.total).toBe(total);
    expect(entry!.solved).toBe(total);
    expect(entry!.detail).toContain(`${total} of ${total} problems`);
  });

  test("a learning path missing one problem is not eligible", () => {
    const path = LEARNING_PATHS[0];
    const unique = [...new Set(path.problemIds)];
    seedSolved(unique.slice(0, -1));

    expect(
      getEligible().some(
        (candidate) => candidate.kind === "path" && candidate.refId === path.id,
      ),
    ).toBe(false);
  });

  test("a fully solved collection is eligible, a partial one is not", () => {
    const collection = PREMADE_COLLECTIONS[0];
    const unique = [...new Set(collection.problemIds)];

    seedSolved(unique);
    const entry = getEligible().find(
      (candidate) =>
        candidate.kind === "collection" && candidate.refId === collection.id,
    );
    expect(entry).toBeTruthy();
    expect(entry!.title).toBe(collection.name);
    expect(entry!.solved).toBe(unique.length);
    expect(entry!.total).toBe(unique.length);

    seedSolved(unique.slice(0, -1));
    expect(
      getEligible().some(
        (candidate) =>
          candidate.kind === "collection" && candidate.refId === collection.id,
      ),
    ).toBe(false);
  });

  test("a category is eligible at exactly 80% and not below", () => {
    const category = CATEGORIES[0];
    const categoryProblems = PROBLEMS.filter(
      (problem) => problem.category === category.name,
    );
    const threshold = Math.ceil(
      categoryProblems.length * CATEGORY_MILESTONE_RATIO,
    );
    const refId = slugify(category.name);

    seedSolved(categoryProblems.slice(0, threshold).map((p) => p.id));
    const entry = getEligible().find(
      (candidate) => candidate.kind === "category" && candidate.refId === refId,
    );
    expect(entry).toBeTruthy();
    expect(entry!.title).toBe(`${category.name} Milestone`);
    expect(entry!.solved).toBe(threshold);
    expect(entry!.total).toBe(categoryProblems.length);

    seedSolved(categoryProblems.slice(0, threshold - 1).map((p) => p.id));
    expect(
      getEligible().some(
        (candidate) =>
          candidate.kind === "category" && candidate.refId === refId,
      ),
    ).toBe(false);
  });

  test("a lab at its target is eligible and one step below is not", () => {
    const lab = LABS.find((entry) => entry.higherIsBetter)!;
    setLabBest(lab.id, lab.target);

    const entry = getEligible().find(
      (candidate) => candidate.kind === "lab" && candidate.refId === lab.id,
    );
    expect(entry).toBeTruthy();
    expect(entry!.title).toBe(`Application — ${lab.title}`);
    expect(entry!.score).toBe(lab.target);
    expect(entry!.target).toBe(lab.target);
    expect(entry!.metric).toBe(lab.metric);
    expect(entry!.detail).toContain(
      `target ${formatMeasure(lab.metric, lab.target)}`,
    );
  });

  test("a higher-is-better lab below target is not eligible", () => {
    const lab = LABS.find((entry) => entry.higherIsBetter)!;
    setLabBest(lab.id, lab.target - 0.01);
    expect(
      getEligible().some(
        (candidate) => candidate.kind === "lab" && candidate.refId === lab.id,
      ),
    ).toBe(false);
  });

  test("a lower-is-better lab is eligible at target and not above it", () => {
    const lab = LABS.find((entry) => !entry.higherIsBetter)!;
    setLabBest(lab.id, lab.target);
    expect(
      getEligible().some(
        (candidate) => candidate.kind === "lab" && candidate.refId === lab.id,
      ),
    ).toBe(true);

    stub.removeItem(LABS_KEY);
    setLabBest(lab.id, lab.target + 0.01);
    expect(
      getEligible().some(
        (candidate) => candidate.kind === "lab" && candidate.refId === lab.id,
      ),
    ).toBe(false);
  });

  test("a project with every step solved is eligible, one missing is not", () => {
    const project = PROJECTS[0];
    const ids = project.steps.map((step) => step.id);

    seedSolved(ids);
    const entry = getEligible().find(
      (candidate) =>
        candidate.kind === "project" && candidate.refId === project.id,
    );
    expect(entry).toBeTruthy();
    expect(entry!.title).toBe(`Build — ${project.title}`);
    expect(entry!.solved).toBe(ids.length);
    expect(entry!.total).toBe(ids.length);
    expect(entry!.detail).toContain(`${ids.length} of ${ids.length} steps`);

    seedSolved(ids.slice(0, -1));
    expect(
      getEligible().some(
        (candidate) =>
          candidate.kind === "project" && candidate.refId === project.id,
      ),
    ).toBe(false);
  });

  test("an interview mock at 80% is eligible and one below is not", () => {
    const track = INTERVIEW_TRACKS[0];
    const total = track.mockProblemIds.length;
    const threshold = Math.ceil(total * INTERVIEW_MOCK_RATIO);
    expect(threshold).toBeGreaterThan(0);

    const seed = (solved: number) => {
      stub.setItem(
        INTERVIEW_KEY,
        JSON.stringify([
          {
            trackId: track.id,
            solved,
            total,
            seconds: 600,
            completedAt: "2026-01-14T12:00:00.000Z",
          },
        ]),
      );
    };

    seed(threshold);
    const entry = getEligible().find(
      (candidate) =>
        candidate.kind === "interview" && candidate.refId === track.id,
    );
    expect(entry).toBeTruthy();
    expect(entry!.title).toBe(`Interview — ${track.title}`);
    expect(entry!.solved).toBe(threshold);
    expect(entry!.total).toBe(total);

    seed(threshold - 1);
    expect(
      getEligible().some(
        (candidate) =>
          candidate.kind === "interview" && candidate.refId === track.id,
      ),
    ).toBe(false);
  });
});

describe("issuing and revoking", () => {
  test("issueCertificate is idempotent per kind and refId", () => {
    const first = issueCertificate(demoEntry);
    expect(first.id).toBe("path:demo-path");
    expect(first.recipient).toBe(FALLBACK_RECIPIENT);
    expect(first.detail).toBe(demoEntry.detail);

    const second = issueCertificate(demoEntry);
    expect(second).toEqual(first);
    expect(getIssued()).toHaveLength(1);
    expect(getIssued()[0]).toEqual(first);
  });

  test("issueCertificate uses the stored username when one is set", () => {
    stub.setItem(USERNAME_KEY, "  Ada Lovelace  ");
    const cert = issueCertificate({ ...demoEntry, refId: "named-path" });
    expect(cert.recipient).toBe("Ada Lovelace");
  });

  test("issuing a lab entry stores its score and target evidence", () => {
    const lab = LABS[0];
    const cert = issueCertificate({
      kind: "lab",
      refId: lab.id,
      title: `Application — ${lab.title}`,
      detail: `Accuracy ${lab.target} vs target ${lab.target} · ${lab.title} lab`,
      score: lab.target,
      target: lab.target,
    });
    expect(cert.score).toBe(lab.target);
    expect(cert.target).toBe(lab.target);
    expect(cert.solved).toBeUndefined();
    expect(cert.total).toBeUndefined();
    expect(getIssued()).toEqual([cert]);
  });

  test("issuing a project entry stores its step counts", () => {
    const project = PROJECTS[0];
    const total = project.steps.length;
    const cert = issueCertificate({
      kind: "project",
      refId: project.id,
      title: `Build — ${project.title}`,
      detail: `${total} of ${total} steps · ${project.title} project`,
      solved: total,
      total,
    });
    expect(cert.solved).toBe(total);
    expect(cert.total).toBe(total);
    expect(getIssued()).toEqual([cert]);
  });

  test("revokeCertificate removes exactly once", () => {
    const issued = issueCertificate(demoEntry);
    expect(revokeCertificate(issued.id)).toBe(true);
    expect(getIssued()).toEqual([]);
    expect(revokeCertificate(issued.id)).toBe(false);
  });

  test("malformed certificate storage never throws", () => {
    stub.setItem(CERTIFICATES_KEY, "{oops");
    expect(getIssued()).toEqual([]);

    stub.setItem(CERTIFICATES_KEY, "42");
    expect(getIssued()).toEqual([]);

    stub.setItem(
      CERTIFICATES_KEY,
      JSON.stringify([{ id: "x" }, null, 7, demoCertificate]),
    );
    expect(getIssued()).toEqual([demoCertificate]);

    stub.setItem(CERTIFICATES_KEY, "not json");
    expect(revokeCertificate("anything")).toBe(false);
  });

  test("malformed progress storage never throws", () => {
    stub.setItem(PROGRESS_KEY, "{not json");
    expect(getEligible()).toEqual([]);

    stub.setItem(PROGRESS_KEY, JSON.stringify([1, 2, 3]));
    expect(getEligible()).toEqual([]);

    stub.setItem(PROGRESS_KEY, "42");
    expect(getEligible()).toEqual([]);
  });
});

describe("verification and text", () => {
  test("verificationCode matches an independent FNV-1a implementation", () => {
    expect(verificationCode(demoCertificate)).toBe(
      referenceCode(demoCertificate),
    );
    expect(verificationCode(demoCertificate)).toBe(
      verificationCode({ ...demoCertificate }),
    );
    expect(verificationCode(demoCertificate)).toHaveLength(8);
    expect(verificationCode(demoCertificate)).toMatch(/^[0-9A-Z]{8}$/);

    const unicode: Certificate = {
      ...demoCertificate,
      recipient: "Ünïcode 日本語",
    };
    expect(verificationCode(unicode)).toBe(referenceCode(unicode));
  });

  test("formatCertificateDate reduces ISO timestamps to the date", () => {
    expect(formatCertificateDate("2026-01-14T12:00:00.000Z")).toBe(
      "2026-01-14",
    );
    expect(formatCertificateDate("not-a-date")).toBe("not-a-date");
  });

  test("buildCertificateText contains the recipient, title, and code", () => {
    const text = buildCertificateText(demoCertificate);
    expect(text).toContain("DEEPFORGE CERTIFICATE OF COMPLETION");
    expect(text).toContain(demoCertificate.title);
    expect(text).toContain(`Awarded to ${demoCertificate.recipient}`);
    expect(text).toContain(demoCertificate.detail);
    expect(text).toContain(
      `Verification code: ${verificationCode(demoCertificate)}`,
    );
    expect(text).toContain(`Issued ${formatCertificateDate(demoCertificate.issuedAt)}`);
    expect(text).toContain("DeepForge");
  });
});

describe("research certificates", () => {
  test("four of five baselines leaves the research certificate locked", () => {
    seedResearch(
      RESEARCH_CHALLENGES.slice(0, -1).map((challenge) => challenge.id),
    );

    expect(getEligible().some((entry) => entry.kind === "research")).toBe(
      false,
    );
  });

  test("all five baselines unlock the research certificate", () => {
    seedResearch(RESEARCH_CHALLENGES.map((challenge) => challenge.id));

    const entry = getEligible().find(
      (candidate) => candidate.kind === "research",
    );
    expect(entry).toBeTruthy();
    expect(entry!.title).toBe(
      `Research Challenges — ${RESEARCH_TOTAL}/${RESEARCH_TOTAL} baselines beaten`,
    );
    expect(entry!.detail).toBe(
      `${RESEARCH_TOTAL} of ${RESEARCH_TOTAL} baselines beaten · research challenges`,
    );
    expect(entry!.solved).toBe(RESEARCH_TOTAL);
    expect(entry!.total).toBe(RESEARCH_TOTAL);
  });

  test("a beating best score counts even without the sticky flag", () => {
    const rest = RESEARCH_CHALLENGES.slice(1);
    seedResearch(
      rest.map((challenge) => challenge.id),
      { [RESEARCH_CHALLENGES[0].id]: beatingScore(0) },
    );

    expect(
      getEligible().some((entry) => entry.kind === "research"),
    ).toBe(true);
  });

  test("issue, code, and verify round-trip with kind research", async () => {
    seedResearch(RESEARCH_CHALLENGES.map((challenge) => challenge.id));
    const eligible = getEligible().find(
      (candidate) => candidate.kind === "research",
    );
    expect(eligible).toBeTruthy();

    const cert = issueCertificate(eligible!);
    expect(cert.kind).toBe("research");
    expect(cert.id).toBe("research:research-baselines");
    expect(cert.solved).toBe(RESEARCH_TOTAL);
    expect(cert.total).toBe(RESEARCH_TOTAL);
    expect(verificationCode(cert)).toBe(referenceCode(cert));
    expect(verificationCode(cert)).toMatch(/^[0-9A-Z]{8}$/);

    const payload = payloadFromCertificate(cert);
    expect(payload.kind).toBe("research");
    expect(payload.solved).toBe(RESEARCH_TOTAL);
    expect(payload.total).toBe(RESEARCH_TOTAL);
    expect(payload.score).toBeUndefined();
    expect(payload.stepsDone).toBeUndefined();

    const code = await certificateCredentialCode(cert);
    const result = await verifyCredential(code);
    expect(result.status).toBe("valid");
    expect(result.payload?.kind).toBe("research");
    expect(result.payload?.solved).toBe(RESEARCH_TOTAL);
    expect(result.payload?.total).toBe(RESEARCH_TOTAL);
    expect(result.recomputed).toBe(result.fingerprint);
  });

  test("a revoked research certificate is dropped from the issued list", async () => {
    seedResearch(RESEARCH_CHALLENGES.map((challenge) => challenge.id));
    const eligible = getEligible().find(
      (candidate) => candidate.kind === "research",
    );
    const cert = issueCertificate(eligible!);
    const code = await certificateCredentialCode(cert);
    expect((await verifyCredential(code)).status).toBe("valid");

    expect(revokeCertificate(cert.id)).toBe(true);
    expect(getIssued().some((candidate) => candidate.id === cert.id)).toBe(
      false,
    );
    expect(revokeCertificate(cert.id)).toBe(false);
  });
});
