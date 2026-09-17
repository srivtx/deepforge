import { describe, expect, test } from "bun:test";
import { CONCEPTS, type Concept } from "@/data/concepts";
import {
  buildConceptGraph,
  clampMastery,
  layerConcepts,
  layoutConceptGraph,
  prerequisiteChain,
  routeBetween,
} from "@/lib/conceptGraph";

function synth(
  id: string,
  category: string,
  prerequisites: string[] = [],
): Concept {
  return {
    id,
    title: `Title ${id}`,
    category,
    blurb: `Blurb ${id}`,
    workedExampleId: `${id}-worked`,
    workedSteps: [`Step ${id}`],
    practiceIds: [`${id}-1`, `${id}-2`, `${id}-3`],
    prerequisites,
  };
}

const graph = buildConceptGraph(CONCEPTS);
const layered = layerConcepts(graph);
const layout = layoutConceptGraph(graph);

describe("real concept graph", () => {
  test("builds without issues from the shipped catalogue", () => {
    expect(graph.issues).toEqual([]);
    expect(graph.nodes.length).toBe(CONCEPTS.length);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  test("every edge references known node ids", () => {
    const ids = new Set(graph.nodes.map((node) => node.id));
    for (const edge of graph.edges) {
      const label = `${edge.from} -> ${edge.to}`;
      expect(ids.has(edge.from), label).toBe(true);
      expect(ids.has(edge.to), label).toBe(true);
    }
  });

  test("is acyclic: no cycle issues and every layer is finite", () => {
    expect(layered.issues).toEqual([]);
    for (const node of graph.nodes) {
      expect(Number.isFinite(layered.layers.get(node.id))).toBe(true);
    }
  });

  test("every prerequisite sits on a strictly lower layer than its dependent", () => {
    for (const edge of graph.edges) {
      const label = `${edge.from} -> ${edge.to}`;
      expect(layered.layers.get(edge.from)!, label).toBeLessThan(
        layered.layers.get(edge.to)!,
      );
    }
  });

  test("layout emits only finite numbers", () => {
    expect(Number.isFinite(layout.width)).toBe(true);
    expect(Number.isFinite(layout.height)).toBe(true);
    expect(layout.height).toBeGreaterThan(0);
    for (const node of layout.nodes) {
      expect(
        Number.isFinite(node.x) &&
          Number.isFinite(node.y) &&
          Number.isFinite(node.layer),
      ).toBe(true);
    }
  });

  test("layout is deep-equal across repeated calls", () => {
    expect(layoutConceptGraph(graph)).toEqual(layoutConceptGraph(graph));
  });

  test("layout is independent of the input catalogue order", () => {
    const reversed = buildConceptGraph([...CONCEPTS].reverse());
    expect(layoutConceptGraph(reversed)).toEqual(layout);
  });

  test("layout places every node on its computed layer", () => {
    expect(layout.nodes.length).toBe(graph.nodes.length);
    for (const node of layout.nodes) {
      expect(node.layer).toBe(layered.layers.get(node.id)!);
    }
  });

  test("prerequisiteChain returns ancestors dependencies first", () => {
    expect(prerequisiteChain(graph, "la-eigen-inverse")).toEqual([
      "la-matrix-ops",
      "la-determinants",
    ]);
    expect(prerequisiteChain(graph, "la-vectors")).toEqual([]);
  });

  test("prerequisiteChain returns an empty list for unknown ids", () => {
    expect(prerequisiteChain(graph, "not-a-concept")).toEqual([]);
    expect(prerequisiteChain(buildConceptGraph([]), "not-a-concept")).toEqual(
      [],
    );
  });

  test("routeBetween orders dependencies before dependents", () => {
    const route = routeBetween(graph, "la-vectors", "la-eigen-inverse");
    expect(route).not.toBeNull();
    if (!route) return;
    expect(route).toContain("la-vectors");
    expect(route).toContain("la-eigen-inverse");
    expect(route.indexOf("la-matrix-ops")).toBeLessThan(
      route.indexOf("la-determinants"),
    );
    expect(route.indexOf("la-determinants")).toBeLessThan(
      route.indexOf("la-eigen-inverse"),
    );
  });

  test("routeBetween degrades cleanly for identical or unknown endpoints", () => {
    expect(routeBetween(graph, "la-vectors", "la-vectors")).toEqual([
      "la-vectors",
    ]);
    expect(routeBetween(graph, "nope", "la-vectors")).toBeNull();
    expect(routeBetween(graph, "la-vectors", "nope")).toBeNull();
  });
});

describe("clampMastery", () => {
  test("normalizes non-finite and out-of-range input", () => {
    expect(clampMastery(Number.NaN)).toBe(0);
    expect(clampMastery(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clampMastery(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(clampMastery(2)).toBe(1);
    expect(clampMastery(-1)).toBe(0);
    expect(clampMastery(0)).toBe(0);
    expect(clampMastery(1)).toBe(1);
    expect(clampMastery(0.5)).toBe(0.5);
  });
});

describe("synthetic graphs", () => {
  test("duplicate ids and missing prerequisites become issues, not edges", () => {
    const built = buildConceptGraph([
      synth("a", "Alpha"),
      synth("a", "Alpha"),
      synth("b", "Beta", ["ghost", "a"]),
    ]);
    expect(built.nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(built.edges).toEqual([{ from: "a", to: "b" }]);
    expect(
      built.issues.some((issue) => issue.includes("duplicate")),
    ).toBe(true);
    expect(built.issues.some((issue) => issue.includes("missing"))).toBe(true);
    const nodeB = built.nodes.find((node) => node.id === "b")!;
    expect(nodeB.prerequisites).toEqual(["a"]);
  });

  test("a synthetic chain gets consecutive layers", () => {
    const chain = buildConceptGraph([
      synth("a", "X"),
      synth("b", "X", ["a"]),
      synth("c", "X", ["b"]),
    ]);
    const chainLayers = layerConcepts(chain);
    expect(chainLayers.issues).toEqual([]);
    expect(chainLayers.layers.get("a")).toBe(0);
    expect(chainLayers.layers.get("b")).toBe(1);
    expect(chainLayers.layers.get("c")).toBe(2);
    expect(prerequisiteChain(chain, "c")).toEqual(["a", "b"]);
  });

  test("a cycle terminates, stays finite, and reports an issue", () => {
    const cycle = buildConceptGraph([
      synth("a", "Cycle", ["c"]),
      synth("b", "Cycle", ["a"]),
      synth("c", "Cycle", ["b"]),
    ]);
    const cycleLayers = layerConcepts(cycle);
    expect(cycleLayers.issues.length).toBeGreaterThan(0);
    expect(
      cycleLayers.issues.some((issue) => issue.includes("cycle")),
    ).toBe(true);
    for (const node of cycle.nodes) {
      expect(Number.isFinite(cycleLayers.layers.get(node.id))).toBe(true);
    }
    const cycleLayout = layoutConceptGraph(cycle);
    for (const node of cycleLayout.nodes) {
      expect(Number.isFinite(node.x) && Number.isFinite(node.y)).toBe(true);
    }
    expect(cycleLayout.nodes.length).toBe(cycle.nodes.length);
    expect(layoutConceptGraph(cycle)).toEqual(layoutConceptGraph(cycle));
  });

  test("an empty graph lays out to finite dimensions", () => {
    const empty = buildConceptGraph([]);
    expect(empty.nodes).toEqual([]);
    expect(empty.edges).toEqual([]);
    expect(layerConcepts(empty).issues).toEqual([]);
    const emptyLayout = layoutConceptGraph(empty);
    expect(Number.isFinite(emptyLayout.width)).toBe(true);
    expect(Number.isFinite(emptyLayout.height)).toBe(true);
    expect(emptyLayout.nodes).toEqual([]);
  });
});
