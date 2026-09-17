import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CERT_TRACKS, type CertTrack } from "@/data/certTracks";
import {
  certificateCredentialCode,
  deriveTrackProgress,
  getEligible,
  getTrackProgress,
  issueCertificate,
  listCertificateCandidates,
  payloadFromCertificate,
  verificationCode,
  type CertificateSnapshot,
} from "@/lib/certificates";
import { verifyCredential } from "@/lib/credentials";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { LABS } from "@/data/labs";
import { LEARNING_PATHS } from "@/data/problems/paths";
import { PROJECTS } from "@/data/projects";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { setLabBest } from "@/lib/labs";
import type { ProgressMap } from "@/lib/progress";
import type { CertTrackStep } from "@/data/certTracks";

/* ────────────────────────────── fixture ─────────────────────────────────── */

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
const LABS_KEY = "deepforge:labs";
const RESEARCH_KEY = "deepforge:research:v1";

function solvedMap(ids: string[]): ProgressMap {
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
  stub.setItem(PROGRESS_KEY, JSON.stringify(solvedMap(ids)));
}

function emptySnapshot(): CertificateSnapshot {
  return { progress: {}, labs: {}, interviewBests: {}, baselinesBeaten: 0 };
}

function snapshotWith(ids: string[]): CertificateSnapshot {
  return {
    progress: solvedMap(ids),
    labs: {},
    interviewBests: {},
    baselinesBeaten: 0,
  };
}

function stepResolves(step: CertTrackStep): boolean {
  switch (step.kind) {
    case "path":
      return LEARNING_PATHS.some((entry) => entry.id === step.id);
    case "collection":
      return PREMADE_COLLECTIONS.some((entry) => entry.id === step.id);
    case "lab":
      return LABS.some((entry) => entry.id === step.id);
    case "project":
      return PROJECTS.some((entry) => entry.id === step.id);
    case "interview":
      return INTERVIEW_TRACKS.some((entry) => entry.id === step.id);
    case "research":
      return RESEARCH_CHALLENGES.some((entry) => entry.id === step.id);
    default:
      return false;
  }
}

const syntheticTrack: CertTrack = {
  id: "synthetic-track",
  title: "Synthetic Track",
  blurb: "Fixture covering every step kind.",
  level: "foundation",
  outcome: "Every step kind resolves.",
  steps: [
    { kind: "path", id: "math-foundations" },
    { kind: "collection", id: "linear-algebra-crash-course" },
    { kind: "lab", id: "lab-01" },
    { kind: "project", id: "gpt" },
    { kind: "interview", id: "anthropic" },
    { kind: "research", id: "mini-language-model" },
  ],
};

/* ─────────────────────────────── data ───────────────────────────────────── */

describe("track data", () => {
  test("levels, step counts, surfaces, and labs are valid", () => {
    const ids = new Set<string>();
    for (const track of CERT_TRACKS) {
      expect(track.id.trim().length).toBeGreaterThan(0);
      expect(ids.has(track.id)).toBe(false);
      ids.add(track.id);
      expect(track.title.trim().length).toBeGreaterThan(0);
      expect(track.blurb.trim().length).toBeGreaterThan(0);
      expect(track.outcome.trim().length).toBeGreaterThan(0);
      expect(["foundation", "practitioner", "specialist"]).toContain(
        track.level,
      );
      expect(track.steps.length).toBeGreaterThanOrEqual(3);
      expect(track.steps.length).toBeLessThanOrEqual(5);
      const surfaces = new Set(track.steps.map((step) => step.kind));
      expect(surfaces.size).toBeGreaterThanOrEqual(2);
      expect(surfaces.has("lab")).toBe(true);
    }
  });

  test("every step id resolves in its data module", () => {
    for (const track of CERT_TRACKS) {
      for (const step of track.steps) {
        expect(stepResolves(step)).toBe(true);
      }
    }
  });
});

/* ───────────────────────── pure derivation ──────────────────────────────── */

describe("deriveTrackProgress", () => {
  test("an empty snapshot leaves every step undone with display strings", () => {
    const progress = deriveTrackProgress(syntheticTrack, emptySnapshot());
    expect(progress.done).toBe(0);
    expect(progress.total).toBe(syntheticTrack.steps.length);
    expect(progress.complete).toBe(false);
    expect(progress.steps).toHaveLength(syntheticTrack.steps.length);
    for (const step of progress.steps) {
      expect(step.done).toBe(false);
      expect(step.label.trim().length).toBeGreaterThan(0);
      expect(step.href.startsWith("/")).toBe(true);
      expect(step.progress.trim().length).toBeGreaterThan(0);
    }
    expect(progress.steps[0].progress).toBe("0/25");
    expect(progress.steps[2].progress).toBe("not attempted");
    expect(progress.steps[4].progress).toBe("0/5 mock");
    expect(progress.steps[5].progress).toBe("0/5 baselines");
  });

  test("a completed snapshot marks every step done and the track complete", () => {
    const path = LEARNING_PATHS.find((entry) => entry.id === "math-foundations")!;
    const collection = PREMADE_COLLECTIONS.find(
      (entry) => entry.id === "linear-algebra-crash-course",
    )!;
    const project = PROJECTS.find((entry) => entry.id === "gpt")!;
    const snapshot = snapshotWith([
      ...path.problemIds,
      ...collection.problemIds,
      ...project.steps.map((step) => step.id),
    ]);
    snapshot.labs = {
      "lab-01": { best: 0.9, attempts: 1, passed: true },
    };
    snapshot.interviewBests = { anthropic: { solved: 4, total: 5 } };
    snapshot.baselinesBeaten = RESEARCH_CHALLENGES.length;

    const progress = deriveTrackProgress(syntheticTrack, snapshot);
    expect(progress.done).toBe(6);
    expect(progress.total).toBe(6);
    expect(progress.complete).toBe(true);
    for (const step of progress.steps) {
      expect(step.done).toBe(true);
    }
    expect(progress.steps[2].progress).toBe("best 0.900 vs target 0.850");
    expect(progress.steps[4].progress).toBe("4/5 mock");
    expect(progress.steps[5].progress).toBe("5/5 baselines");
  });

  test("a research step needs every baseline, not just its own id", () => {
    const track = CERT_TRACKS.find(
      (entry) => entry.id === "llm-nlp-engineer",
    )!;
    const snapshot = emptySnapshot();
    snapshot.baselinesBeaten = RESEARCH_CHALLENGES.length - 1;
    const partial = deriveTrackProgress(track, snapshot);
    const researchStep = partial.steps.find(
      (step) => step.step.kind === "research",
    )!;
    expect(researchStep.done).toBe(false);
    expect(researchStep.progress).toBe(
      `${RESEARCH_CHALLENGES.length - 1}/${RESEARCH_CHALLENGES.length} baselines`,
    );

    snapshot.baselinesBeaten = RESEARCH_CHALLENGES.length;
    const complete = deriveTrackProgress(track, snapshot);
    expect(
      complete.steps.find((step) => step.step.kind === "research")!.done,
    ).toBe(true);
  });

  test("an interview step needs 80% of the stored mock", () => {
    const snapshot = emptySnapshot();
    snapshot.interviewBests = { anthropic: { solved: 3, total: 5 } };
    const progress = deriveTrackProgress(syntheticTrack, snapshot);
    expect(progress.steps[4].done).toBe(false);
    expect(progress.steps[4].progress).toBe("3/5 mock");

    snapshot.interviewBests = { anthropic: { solved: 4, total: 5 } };
    expect(deriveTrackProgress(syntheticTrack, snapshot).steps[4].done).toBe(
      true,
    );
  });
});

/* ────────────────────────── live store reads ────────────────────────────── */

describe("getTrackProgress", () => {
  test("a fresh profile reports 0 done for every curated track", () => {
    for (const track of CERT_TRACKS) {
      const progress = getTrackProgress(track);
      expect(progress.done).toBe(0);
      expect(progress.total).toBe(track.steps.length);
      expect(progress.complete).toBe(false);
      for (const step of progress.steps) {
        expect(step.label.trim().length).toBeGreaterThan(0);
        expect(step.href.startsWith("/")).toBe(true);
        expect(step.progress.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("catalog track candidates follow the same progress", () => {
    const candidates = listCertificateCandidates().filter(
      (candidate) => candidate.kind === "track",
    );
    expect(candidates).toHaveLength(CERT_TRACKS.length);
    for (const candidate of candidates) {
      const track = CERT_TRACKS.find((entry) => entry.id === candidate.refId)!;
      const progress = getTrackProgress(track);
      expect(candidate.solved).toBe(progress.done);
      expect(candidate.total).toBe(progress.total);
      expect(candidate.eligible).toBe(progress.complete);
    }
  });

  test("partially solved work leaves the track claim locked", () => {
    const track = CERT_TRACKS.find((entry) => entry.id === "ml-foundations")!;
    const path = LEARNING_PATHS.find((entry) => entry.id === "math-foundations")!;
    seedSolved(path.problemIds);

    const progress = getTrackProgress(track);
    expect(progress.done).toBe(1);
    expect(progress.total).toBe(3);
    expect(progress.complete).toBe(false);
    expect(progress.steps[0].done).toBe(true);
    expect(progress.steps[1].done).toBe(false);
    expect(
      getEligible().some(
        (entry) => entry.kind === "track" && entry.refId === track.id,
      ),
    ).toBe(false);
  });

  test("a completed track issues a kind track certificate that verifies", async () => {
    const track = CERT_TRACKS.find((entry) => entry.id === "ml-foundations")!;
    const path = LEARNING_PATHS.find((entry) => entry.id === "math-foundations")!;
    const collection = PREMADE_COLLECTIONS.find(
      (entry) => entry.id === "linear-algebra-crash-course",
    )!;
    const lab = LABS.find((entry) => entry.id === "lab-01")!;

    seedSolved([...path.problemIds, ...collection.problemIds]);
    setLabBest(lab.id, lab.target);

    const progress = getTrackProgress(track);
    expect(progress.complete).toBe(true);
    expect(progress.done).toBe(track.steps.length);

    const entry = getEligible().find(
      (candidate) => candidate.kind === "track" && candidate.refId === track.id,
    );
    expect(entry).toBeTruthy();
    expect(entry!.title).toBe(track.title);
    expect(entry!.solved).toBe(track.steps.length);
    expect(entry!.total).toBe(track.steps.length);

    const cert = issueCertificate(entry!);
    expect(cert.kind).toBe("track");
    expect(cert.id).toBe(`track:${track.id}`);
    expect(verificationCode(cert)).toMatch(/^[0-9A-Z]{8}$/);

    const payload = payloadFromCertificate(cert);
    expect(payload.kind).toBe("track");
    expect(payload.solved).toBe(track.steps.length);
    expect(payload.total).toBe(track.steps.length);
    expect(payload.score).toBeUndefined();
    expect(payload.stepsDone).toBeUndefined();

    const code = await certificateCredentialCode(cert);
    const result = await verifyCredential(code);
    expect(result.status).toBe("valid");
    expect(result.payload?.kind).toBe("track");
    expect(result.payload?.solved).toBe(track.steps.length);
    expect(result.payload?.total).toBe(track.steps.length);
    expect(result.recomputed).toBe(result.fingerprint);
  });

  test("malformed stores never break track progress", () => {
    stub.setItem(PROGRESS_KEY, "{not json");
    stub.setItem(LABS_KEY, "42");
    stub.setItem(RESEARCH_KEY, JSON.stringify([1, 2, 3]));
    for (const track of CERT_TRACKS) {
      const progress = getTrackProgress(track);
      expect(progress.done).toBe(0);
      expect(progress.complete).toBe(false);
    }
  });
});
