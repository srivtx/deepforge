import { describe, expect, test } from "bun:test";
import { LEARNING_PATHS } from "@/data/problems/paths";
import type { CapstoneKind, PathCapstone } from "@/data/problems/paths";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { CONTESTS } from "@/data/contests";
import { LABS } from "@/data/labs";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import { PROJECTS } from "@/data/projects";
import {
  capstoneHref,
  capstoneKindLabel,
  cleanCapstone,
  getAllPaths,
  pathExtras,
  resolvePath,
} from "@/lib/paths";
import type { LearningPath } from "@/types/problem";

/** Real artifact titles per kind, straight from the registries. */
const REGISTRY_TITLES: Record<CapstoneKind, Map<string, string>> = {
  project: new Map(PROJECTS.map((project) => [project.id, project.title])),
  lab: new Map(LABS.map((lab) => [lab.id, lab.title])),
  contest: new Map(CONTESTS.map((contest) => [contest.id, contest.title])),
  collection: new Map(
    PREMADE_COLLECTIONS.map((collection) => [collection.id, collection.name]),
  ),
  penpaper: new Map(
    PENPAPER_PROBLEMS.map((problem) => [problem.id, problem.question]),
  ),
};

const KIND_ROUTES: Record<CapstoneKind, string> = {
  project: "/projects",
  lab: "/labs",
  contest: "/contests",
  collection: "/collections/",
  penpaper: "/math",
};

function authoredCapstone(path: LearningPath): PathCapstone | undefined {
  return pathExtras(path).capstone;
}

function legacyPath(
  overrides: Partial<LearningPath> & { capstone?: PathCapstone } = {},
): LearningPath {
  return {
    id: "legacy-path",
    title: "Legacy Path",
    description: "A path written before capstones existed.",
    problemIds: ["la-001", "la-002"],
    estimatedHours: 2,
    ...overrides,
  };
}

describe("path capstones", () => {
  test("every path authors exactly one capstone", () => {
    const missing = LEARNING_PATHS.filter(
      (path) => !authoredCapstone(path),
    ).map((path) => path.id);
    expect(missing).toEqual([]);
    expect(LEARNING_PATHS).toHaveLength(33);
  });

  test("every capstone kind and id resolves against the real registry", () => {
    const dangling: string[] = [];
    for (const path of LEARNING_PATHS) {
      const capstone = authoredCapstone(path);
      if (!capstone) continue;
      const titles = REGISTRY_TITLES[capstone.kind];
      if (!titles || !titles.has(capstone.id)) {
        dangling.push(`${path.id}: ${capstone.kind}/${capstone.id}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  test("authored titles match the registry titles", () => {
    const mismatches: string[] = [];
    for (const path of LEARNING_PATHS) {
      const capstone = authoredCapstone(path);
      if (!capstone || !capstone.title || capstone.kind === "penpaper") {
        continue;
      }
      const registryTitle = REGISTRY_TITLES[capstone.kind].get(capstone.id);
      if (registryTitle && capstone.title !== registryTitle) {
        mismatches.push(
          `${path.id}: "${capstone.title}" != "${registryTitle}"`,
        );
      }
    }
    expect(mismatches).toEqual([]);
  });

  test("no duplicate capstones within a path", () => {
    for (const path of LEARNING_PATHS) {
      const raw = pathExtras(path).capstone;
      const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const keys = list.map((entry) => `${entry.kind}:${entry.id}`);
      expect(new Set(keys).size).toBe(keys.length);
      expect(list.length).toBeLessThanOrEqual(1);
    }
  });

  test("capstone hrefs point at existing routes", () => {
    for (const path of LEARNING_PATHS) {
      const capstone = authoredCapstone(path);
      if (!capstone) continue;
      const href = capstoneHref(capstone.kind, capstone.id);
      const route = KIND_ROUTES[capstone.kind];
      if (capstone.kind === "collection") {
        expect(href).toBe(`${route}${capstone.id}`);
      } else {
        expect(href).toBe(route);
      }
    }
  });

  test("resolvePath carries the authored capstone through", () => {
    const byId = new Map(
      LEARNING_PATHS.map((path) => [path.id, path] as const),
    );
    for (const path of getAllPaths()) {
      const source = byId.get(path.id);
      const authored = source ? authoredCapstone(source) : undefined;
      expect(path.capstone?.kind).toBe(authored?.kind);
      expect(path.capstone?.id).toBe(authored?.id);
      expect(path.capstone?.title).toBeTruthy();
      expect(path.capstone?.href).toBe(
        capstoneHref(authored?.kind as CapstoneKind, authored?.id as string),
      );
    }
  });

  test("capstone notes are short single sentences", () => {
    for (const path of LEARNING_PATHS) {
      const note = authoredCapstone(path)?.note;
      expect(note?.trim()).toBeTruthy();
      expect(note?.length).toBeLessThanOrEqual(140);
    }
  });
});

describe("capstone schema backwards compatibility", () => {
  test("a path without a capstone still resolves", () => {
    const resolved = resolvePath(legacyPath(), "legacy-path");
    expect(resolved.capstone ?? null).toBeNull();
    expect(resolved.problemIds).toEqual(["la-001", "la-002"]);
    expect(resolved.title).toBe("Legacy Path");
    expect(resolved.estimatedHours).toBe(2);
  });

  test("legacy fields keep their shape when a capstone is added", () => {
    const resolved = resolvePath(
      legacyPath({
        capstone: {
          kind: "project",
          id: "gpt",
          title: "Build a GPT from Scratch",
        },
      }),
      "legacy-path",
    );
    expect(resolved.capstone).toEqual({
      kind: "project",
      id: "gpt",
      title: "Build a GPT from Scratch",
      href: "/projects",
    });
    expect(resolved.problemIds).toEqual(["la-001", "la-002"]);
  });

  test("malformed capstones resolve to null instead of throwing", () => {
    const bad: unknown[] = [
      null,
      undefined,
      "project",
      42,
      {},
      { kind: "unknown-kind", id: "gpt" },
      { kind: "project", id: "   " },
      { kind: "project" },
    ];
    for (const value of bad) {
      expect(cleanCapstone(value)).toBeNull();
    }
  });

  test("a capstone without a title falls back to the kind label", () => {
    const resolved = cleanCapstone({ kind: "lab", id: "lab-01" });
    expect(resolved?.title).toBe(capstoneKindLabel("lab"));
    expect(resolved?.href).toBe("/labs");
  });
});
