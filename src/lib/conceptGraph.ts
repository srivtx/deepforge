import type { Concept } from "@/data/concepts";

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  prerequisites: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface ConceptGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  issues: string[];
}

export interface LayeredGraph {
  layers: Map<string, number>;
  issues: string[];
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  layer: number;
}

export interface ConceptLayout {
  nodes: LayoutNode[];
  width: number;
  height: number;
}

export const LAYOUT_WIDTH = 1200;
export const LAYOUT_LAYER_GAP = 120;
const LAYOUT_MARGIN_X = 56;

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareNodes(
  a: { id: string; category: string },
  b: { id: string; category: string },
): number {
  return compareText(a.category, b.category) || compareText(a.id, b.id);
}

export function buildConceptGraph(concepts: readonly Concept[]): ConceptGraph {
  const issues: string[] = [];
  const nodes: GraphNode[] = [];
  const nodeById = new Map<string, GraphNode>();
  const duplicates = new Set<string>();

  for (const concept of concepts) {
    if (nodeById.has(concept.id)) {
      duplicates.add(concept.id);
      issues.push(`duplicate concept id "${concept.id}"`);
      continue;
    }
    const node: GraphNode = {
      id: concept.id,
      title: concept.title,
      category: concept.category,
      prerequisites: [],
    };
    nodes.push(node);
    nodeById.set(node.id, node);
  }

  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();

  for (const concept of concepts) {
    if (duplicates.has(concept.id)) continue;
    const node = nodeById.get(concept.id);
    if (!node) continue;
    const declared = new Set<string>();
    for (const prerequisite of concept.prerequisites) {
      if (declared.has(prerequisite)) continue;
      declared.add(prerequisite);
      if (!nodeById.has(prerequisite)) {
        issues.push(
          `missing prerequisite "${prerequisite}" for "${concept.id}"`,
        );
        continue;
      }
      node.prerequisites.push(prerequisite);
      const key = `${prerequisite}\u0000${concept.id}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({ from: prerequisite, to: concept.id });
    }
  }

  return { nodes, edges, issues };
}

export function layerConcepts(graph: ConceptGraph): LayeredGraph {
  const issues: string[] = [];
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const node of graph.nodes) {
    const prerequisites = node.prerequisites.filter((id) => nodeById.has(id));
    indegree.set(node.id, prerequisites.length);
    for (const prerequisite of prerequisites) {
      const list = dependents.get(prerequisite);
      if (list) list.push(node.id);
      else dependents.set(prerequisite, [node.id]);
    }
  }

  const ready = graph.nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id)
    .sort((a, b) => compareNodes(nodeById.get(a)!, nodeById.get(b)!));

  const layers = new Map<string, number>();
  let maxLayer = -1;

  while (ready.length > 0) {
    const id = ready.shift()!;
    const node = nodeById.get(id)!;
    let layer = 0;
    for (const prerequisite of node.prerequisites) {
      const prerequisiteLayer = layers.get(prerequisite);
      if (
        prerequisiteLayer !== undefined &&
        prerequisiteLayer + 1 > layer
      ) {
        layer = prerequisiteLayer + 1;
      }
    }
    layers.set(id, layer);
    if (layer > maxLayer) maxLayer = layer;

    for (const dependent of dependents.get(id) ?? []) {
      const remaining = (indegree.get(dependent) ?? 1) - 1;
      indegree.set(dependent, remaining);
      if (remaining === 0) {
        ready.push(dependent);
        ready.sort((a, b) => compareNodes(nodeById.get(a)!, nodeById.get(b)!));
      }
    }
  }

  const unresolved = graph.nodes
    .filter((node) => !layers.has(node.id))
    .map((node) => node.id)
    .sort((a, b) => compareNodes(nodeById.get(a)!, nodeById.get(b)!));

  if (unresolved.length > 0) {
    const fallbackLayer = maxLayer + 1;
    for (const id of unresolved) layers.set(id, fallbackLayer);
    issues.push(
      `cycle detected among ${unresolved.length} concept(s): ${unresolved.join(", ")}`,
    );
  }

  return { layers, issues };
}

export function layoutConceptGraph(graph: ConceptGraph): ConceptLayout {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const { layers } = layerConcepts(graph);

  const idsByLayer = new Map<number, string[]>();
  for (const node of graph.nodes) {
    const layer = layers.get(node.id) ?? 0;
    const list = idsByLayer.get(layer);
    if (list) list.push(node.id);
    else idsByLayer.set(layer, [node.id]);
  }

  const xById = new Map<string, number>();
  const ordered: LayoutNode[] = [];
  let maxLayer = -1;
  const layerNumbers = Array.from(idsByLayer.keys()).sort((a, b) => a - b);

  for (const layer of layerNumbers) {
    const ids = idsByLayer.get(layer)!;
    ids.sort((a, b) => compareNodes(nodeById.get(a)!, nodeById.get(b)!));

    const step = (LAYOUT_WIDTH - 2 * LAYOUT_MARGIN_X) / ids.length;
    const initialX = new Map<string, number>();
    ids.forEach((id, index) => {
      initialX.set(id, LAYOUT_MARGIN_X + step * (index + 0.5));
    });

    const ranked = ids.map((id) => {
      const node = nodeById.get(id)!;
      const prerequisiteXs = node.prerequisites
        .map((prerequisite) => xById.get(prerequisite))
        .filter((x): x is number => x !== undefined);
      const barycenter =
        prerequisiteXs.length > 0
          ? prerequisiteXs.reduce((sum, x) => sum + x, 0) /
            prerequisiteXs.length
          : initialX.get(id)!;
      return { id, barycenter };
    });

    ranked.sort(
      (a, b) =>
        a.barycenter - b.barycenter ||
        compareNodes(nodeById.get(a.id)!, nodeById.get(b.id)!),
    );

    ranked.forEach(({ id }, index) => {
      const x = LAYOUT_MARGIN_X + step * (index + 0.5);
      const y = layer * LAYOUT_LAYER_GAP;
      xById.set(id, x);
      ordered.push({ id, x, y, layer });
    });

    if (layer > maxLayer) maxLayer = layer;
  }

  return {
    nodes: ordered,
    width: LAYOUT_WIDTH,
    height: maxLayer >= 0 ? (maxLayer + 1) * LAYOUT_LAYER_GAP : 0,
  };
}

export function prerequisiteChain(graph: ConceptGraph, id: string): string[] {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const start = nodeById.get(id);
  if (!start) return [];

  const ordered: string[] = [];
  const visited = new Set<string>([id]);

  const visit = (current: string) => {
    if (visited.has(current)) return;
    visited.add(current);
    const node = nodeById.get(current);
    if (!node) return;
    const prerequisites = node.prerequisites
      .filter((prerequisite) => nodeById.has(prerequisite))
      .sort((a, b) => compareNodes(nodeById.get(a)!, nodeById.get(b)!));
    for (const prerequisite of prerequisites) visit(prerequisite);
    ordered.push(current);
  };

  const roots = start.prerequisites
    .filter((prerequisite) => nodeById.has(prerequisite))
    .sort((a, b) => compareNodes(nodeById.get(a)!, nodeById.get(b)!));
  for (const prerequisite of roots) visit(prerequisite);

  return ordered;
}

/**
 * Study route between two concepts: the union of each endpoint's
 * prerequisite closure plus the endpoints themselves, deduped and ordered so
 * dependencies come before dependents (by layer, then category, then id).
 * This is a review plan across the graph, not a shortest edge path. Returns
 * null when either id is unknown.
 */
export function routeBetween(
  graph: ConceptGraph,
  fromId: string,
  toId: string,
): string[] | null {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  if (!nodeById.has(fromId) || !nodeById.has(toId)) return null;
  const { layers } = layerConcepts(graph);
  const ids = new Set<string>([
    ...prerequisiteChain(graph, fromId),
    fromId,
    ...prerequisiteChain(graph, toId),
    toId,
  ]);
  return Array.from(ids).sort((a, b) => {
    const layerA = layers.get(a) ?? 0;
    const layerB = layers.get(b) ?? 0;
    if (layerA !== layerB) return layerA - layerB;
    return compareNodes(nodeById.get(a)!, nodeById.get(b)!);
  });
}

export function clampMastery(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
