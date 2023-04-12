import {
  GraphVizEdge,
  GraphVizGraph,
  GraphVizNode,
  GraphVizNodeId,
  generateGraphVizConfig,
} from "./graphviz";
import { Transformer } from "./types";

interface DependencyNodeMetaData {
  id?: string;
  name?: string;
  node: unknown;
  mergedWith?: DependencyNodeMetaData;
  mergedFrom?: Set<DependencyNodeMetaData>;
  dependsOn: Set<DependencyNodeMetaData>;
  dependsFrom: Set<DependencyNodeMetaData>;
}

type NodeMap<DependencyNode = unknown> = Map<
  DependencyNode,
  DependencyNodeMetaData
>;

type DependencyPair<T = unknown> = { from: T; to: T };

function getMetaData(nodeMap: NodeMap, node: unknown): DependencyNodeMetaData {
  if (!node) {
    throw new Error("Node null or undefined");
  }
  if (!nodeMap.has(node)) {
    nodeMap.set(node, {
      node,
      dependsOn: new Set(),
      dependsFrom: new Set(),
    });
  }
  const result: DependencyNodeMetaData = nodeMap.get(node)!;
  return grabLatest(result);
}

function grabLatest(node: DependencyNodeMetaData): DependencyNodeMetaData {
  let result = node;
  while (result.mergedWith) {
    result = result.mergedWith;
  }
  return result;
}

function addDependency(nodeMap: NodeMap, { from, to }: DependencyPair): void {
  if (!from) {
    throw new Error("from is missing");
  }
  if (!to) {
    throw new Error("to is missing");
  }
  const _from = getMetaData(nodeMap, from);
  const _to = getMetaData(nodeMap, to);
  if (_from === _to) {
    return;
  }
  _from.dependsOn.add(_to);
  _to.dependsFrom.add(_from);
}

function removeDependency(
  nodeMap: NodeMap,
  { from, to }: DependencyPair
): void {
  if (!from) {
    throw new Error("from is missing");
  }
  if (!to) {
    throw new Error("to is missing");
  }
  const _from = getMetaData(nodeMap, from);
  const _to = getMetaData(nodeMap, to);
  _from.dependsOn.delete(_to);
  _to.dependsFrom.delete(_from);
}

function populateNodeIds(nodes: DependencyNodeMetaData[]): void {
  const knownIds: Set<string> = new Set();
  nodes.forEach((md) => {
    if (md.id) {
      if (knownIds.has(md.id)) {
        throw new Error(`Duplicate Id detected: ${md.id}`);
      }
      knownIds.add(md.id);
    }
  });
  nodes.forEach((md) => {
    if (!md.id) {
      let suggest = ("" + (md.name || "")).replaceAll(/[^a-zA-Z0-9]/g, "");
      if (knownIds.has(suggest) || suggest === "") {
        for (let i = 2; i < 999999; i++) {
          const suggest2 = suggest + "_" + i;
          if (!knownIds.has(suggest2)) {
            suggest = suggest2;
            break;
          }
        }
      }
      md.id = suggest;
      knownIds.add(suggest);
    }
  });
}

function mergeNodes(
  nodeMap: NodeMap,
  mergedName: string,
  nodes: unknown[]
): { name: string } {
  const [...pruned] = nodes;
  const result = { name: mergedName };
  const resultMD = getMetaData(nodeMap, result);
  resultMD.name = mergedName;
  const allPruned = new Set<DependencyNodeMetaData>();
  pruned.forEach((node) => {
    const md = getMetaData(nodeMap, node);
    if (md.mergedFrom) {
      for (const mf of md.mergedFrom) {
        console.log(`Considering previous merges ${mf.name}`);
        allPruned.add(mf);
      }
    }
    console.log(`Considering the merge of ${md.name}`);
    allPruned.add(md);
  });
  allPruned.forEach((willBePrunedMD) => {
    willBePrunedMD.mergedWith = resultMD;
    willBePrunedMD.mergedFrom?.clear();
  });
  console.log(`Merging ${allPruned.size} nodes`);
  allPruned.forEach((nodeBeingPruned) => {
    const cloneDependOn = Array.from(nodeBeingPruned.dependsOn);
    const cloneDependsFrom = Array.from(nodeBeingPruned.dependsFrom);
    cloneDependOn.forEach((other) => {
      console.log(
        `Migrating outbound dependendcy ${nodeBeingPruned.name} -> ${other.name} to result `
      );
      other.dependsFrom.delete(nodeBeingPruned);
      other.dependsFrom.add(resultMD);
      resultMD.dependsOn.add(grabLatest(other));
    });
    cloneDependsFrom.forEach((other) => {
      console.log(
        `Migrating inbound dependendcy ${other.name} -> ${nodeBeingPruned.name} to result `
      );
      other.dependsOn.delete(nodeBeingPruned);
      other.dependsOn.add(resultMD);
      resultMD.dependsFrom.add(grabLatest(other));
    });
    nodeBeingPruned.dependsFrom.clear();
    nodeBeingPruned.dependsOn.clear();
  });

  return result;
}

interface CreateGraphOptions<DependencyNode = unknown> {
  includeInboundDependencies?: boolean;
  nodeStylizer?: Transformer<DependencyNode, Omit<GraphVizNode, "id">>;
  edgeStylizer?: Transformer<
    { from: DependencyNode; to: DependencyNode },
    Omit<GraphVizEdge, "from" | "to">
  >;
}

function createGraph<DependencyNode = unknown>(
  nodeMap: NodeMap,
  nodes: DependencyNode[],
  options?: CreateGraphOptions
): GraphVizGraph {
  const {
    includeInboundDependencies = false,
    nodeStylizer,
    edgeStylizer,
  } = options ?? {};
  const allNodes = new Set<DependencyNodeMetaData>();
  const toBeWalked: DependencyNodeMetaData[] = [];
  nodes.forEach((node) => {
    const md = getMetaData(nodeMap, node);
    toBeWalked.push(md);
    if (includeInboundDependencies) {
      md.dependsFrom.forEach((other) => {
        if (!toBeWalked.includes(other)) {
          toBeWalked.push(other);
        }
      });
    }
  });
  while (toBeWalked.length > 0) {
    const next = toBeWalked.shift()!;
    allNodes.add(next);
    for (const d of next.dependsOn.values()) {
      if (!allNodes.has(d) && !toBeWalked.includes(d)) {
        toBeWalked.push(d);
      }
    }
    if (includeInboundDependencies) {
      for (const d of next.dependsFrom.values()) {
        if (!allNodes.has(d) && !toBeWalked.includes(d)) {
          toBeWalked.push(d);
        }
      }
    }
  }
  const allNodesArray = Array.from(allNodes);
  populateNodeIds(allNodesArray);
  const graphNodes = allNodesArray.map((node) => {
    const nodeStyle = nodeStylizer ? nodeStylizer(node.node) : {};
    return {
      id: node.id as GraphVizNodeId,
      label: node.name || "??",
      ...nodeStyle,
    };
  });
  const graphEdges = allNodesArray.flatMap((from) => {
    return Array.from(from.dependsOn).map((to) => {
      const edgeStyle = edgeStylizer
        ? edgeStylizer({ from: from.node, to: to.node })
        : {};
      return {
        from: from.id as GraphVizNodeId,
        to: to.id as GraphVizNodeId,
        ...edgeStyle,
      };
    });
  });
  const result: GraphVizGraph = {
    nodes: graphNodes,
    edges: graphEdges,
  };
  return result;
}

export function createDependencyGraph<
  DNode = unknown
>(): DependencyGraph<DNode> {
  return new DependencyGraph<DNode>();
}

class DependencyGraph<DependencyNode> {
  #nodeMap: NodeMap<DependencyNode>;

  constructor() {
    this.#nodeMap = new Map();
  }

  defineNode(node: DependencyNode, name: string): void {
    getMetaData(this.#nodeMap, node).name = name;
  }

  addDependency(dependency: DependencyPair<DependencyNode>): void {
    addDependency(this.#nodeMap, dependency);
  }
  removeDependency(dependency: DependencyPair<DependencyNode>): void {
    removeDependency(this.#nodeMap, dependency);
  }
  clear(): void {
    this.#nodeMap.clear();
  }
  mergeNodes(newName: string, nodes: DependencyNode[]): void {
    mergeNodes(this.#nodeMap, newName, nodes);
  }
  toGraphViz(options?: CreateGraphOptions): string;
  toGraphViz(nodes: DependencyNode[], options?: CreateGraphOptions): string;
  toGraphViz(
    maybeNodes?: DependencyNode[] | CreateGraphOptions,
    options?: CreateGraphOptions
  ): string {
    const nodesToInclude = Array.isArray(maybeNodes)
      ? maybeNodes
      : Array.from(this.#nodeMap.keys());
    const optionsToUse = Array.isArray(maybeNodes) ? options : maybeNodes;

    const graph = createGraph(this.#nodeMap, nodesToInclude, optionsToUse);
    return generateGraphVizConfig(graph);
  }
}
