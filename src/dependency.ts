import {
  GraphVizEdge,
  GraphVizGraph,
  GraphVizNode,
  GraphVizNodeId,
  generateGraphVizConfig,
} from "./graphviz";
import { Transformer } from "./types";

const MAX_UNIQUE_COLORS = 50;

interface DependencyNodeMetaData<DependencyNode> {
  id?: string;
  name: string;
  node: DependencyNode;
  mergedWith?: DependencyNodeMetaData<DependencyNode>;
  mergedFrom?: Set<DependencyNodeMetaData<DependencyNode>>;
  dependsOn: Set<DependencyNodeMetaData<DependencyNode>>;
  dependsFrom: Set<DependencyNodeMetaData<DependencyNode>>;
}

type NodeMap<DependencyNode = unknown> = Map<
  DependencyNode,
  DependencyNodeMetaData<DependencyNode>
>;

type DependencyPair<T = unknown> = { from: T; to: T };

interface TransformProps<DependencyNode> {
  node: DependencyNode;
  meta: Readonly<Pick<DependencyNodeMetaData<DependencyNode>, "id" | "name">>;
}

export type NodeStylizerProps<DependencyNode = unknown> =
  TransformProps<DependencyNode>;
export type NodeStylizerReturn = Omit<GraphVizNode, "id" | "label"> &
  Partial<Pick<GraphVizNode, "label">>;
export type NodeStylizer<DependencyNode = unknown> = Transformer<
  NodeStylizerProps<DependencyNode>,
  NodeStylizerReturn
>;

export type EdgeStylizerProps<DependencyNode = unknown> = DependencyPair<
  TransformProps<DependencyNode>
>;
export type EdgeStylizerReturn = Omit<GraphVizEdge, "from" | "to">;
export type EdgeStylizer<DependencyNode = unknown> = Transformer<
  EdgeStylizerProps<DependencyNode>,
  EdgeStylizerReturn
>;

interface CreateGraphOptions<DependencyNode> {
  includeInboundDependencies?: boolean;
  showSelfDependencies?: boolean;
  nodeStylizer?: NodeStylizer<DependencyNode>;
  edgeStylizer?: EdgeStylizer<DependencyNode>;
}

export function createDependencyGraph<
  DNode = unknown
>(): DependencyGraph<DNode> {
  return new DependencyGraph<DNode>();
}

/**
 * Computes hashcode of a string
 * https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 */
function hashCode(text: string) {
  let result = 0;
  for (let i = 0; i < text.length; i++)
    result = (Math.imul(31, result) + text.charCodeAt(i)) | 0;

  return result;
}

const HSV = (hue: number) => `${round(hue, 0.01)} 1.00 1.00`;

function textToColorIndex(text: string): number {
  const hash = hashCode(text);
  const colorIndex = (Math.abs(hash) % MAX_UNIQUE_COLORS) / MAX_UNIQUE_COLORS;
  return colorIndex;
}

function round(num: number, roundingFactor: number): number {
  return Math.round(num / roundingFactor) * roundingFactor;
}

class DependencyGraph<DependencyNode> {
  #nodeMap: NodeMap<DependencyNode>;
  #colorMap: Map<string, number>;

  constructor() {
    this.#nodeMap = new Map();
    this.#colorMap = new Map();
  }

  defineNode(node: DependencyNode, name: string): void {
    this.#getMetaData(node).name = name;
  }

  addDependency(dependency: DependencyPair<DependencyNode>): void {
    this.#addDependency(dependency);
  }
  removeDependency(dependency: DependencyPair<DependencyNode>): void {
    this.#removeDependency(dependency);
  }
  clear(): void {
    this.#nodeMap.clear();
    this.#colorMap.clear();
  }
  mergeNodes(newName: string, nodes: DependencyNode[]): void {
    this.#mergeNodes(newName, nodes);
  }
  toGraphViz(options?: CreateGraphOptions<DependencyNode>): string;
  toGraphViz(
    nodes: DependencyNode[],
    options?: CreateGraphOptions<DependencyNode>
  ): string;
  toGraphViz(
    maybeNodes?: DependencyNode[] | CreateGraphOptions<DependencyNode>,
    options?: CreateGraphOptions<DependencyNode>
  ): string {
    const nodesToInclude = Array.isArray(maybeNodes)
      ? maybeNodes
      : Array.from(this.#nodeMap.keys());
    const optionsToUse = Array.isArray(maybeNodes) ? options : maybeNodes;

    const graph = this.#createGraph(nodesToInclude, optionsToUse);
    return generateGraphVizConfig(graph);
  }

  #getMetaData(node: DependencyNode): DependencyNodeMetaData<DependencyNode> {
    if (!node) {
      throw new Error("Node null or undefined");
    }
    if (!this.#nodeMap.has(node)) {
      this.#nodeMap.set(node, {
        node,
        name: "??",
        dependsOn: new Set(),
        dependsFrom: new Set(),
      });
    }
    const result: DependencyNodeMetaData<DependencyNode> =
      this.#nodeMap.get(node)!;
    return this.#grabLatest(result);
  }

  #grabLatest(
    node: DependencyNodeMetaData<DependencyNode>
  ): DependencyNodeMetaData<DependencyNode> {
    let result = node;
    while (result.mergedWith) {
      result = result.mergedWith;
    }
    return result;
  }

  #addDependency({ from, to }: DependencyPair<DependencyNode>): void {
    if (!from) {
      throw new Error("from is missing");
    }
    if (!to) {
      throw new Error("to is missing");
    }
    const _from = this.#getMetaData(from);
    const _to = this.#getMetaData(to);
    if (_from === _to) {
      return;
    }
    _from.dependsOn.add(_to);
    _to.dependsFrom.add(_from);
  }

  #removeDependency({ from, to }: DependencyPair<DependencyNode>): void {
    if (!from) {
      throw new Error("from is missing");
    }
    if (!to) {
      throw new Error("to is missing");
    }
    const _from = this.#getMetaData(from);
    const _to = this.#getMetaData(to);
    _from.dependsOn.delete(_to);
    _to.dependsFrom.delete(_from);
  }

  #populateNodeIds(nodes: DependencyNodeMetaData<DependencyNode>[]): void {
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

  #mergeNodes(mergedName: string, nodes: DependencyNode[]): void {
    const [...pruned] = nodes;
    const result = { name: mergedName };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultMD = this.#getMetaData(result as any);
    resultMD.name = mergedName;
    const allPruned = new Set<DependencyNodeMetaData<DependencyNode>>();
    pruned.forEach((node) => {
      const md = this.#getMetaData(node);
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
        resultMD.dependsOn.add(this.#grabLatest(other));
      });
      cloneDependsFrom.forEach((other) => {
        console.log(
          `Migrating inbound dependendcy ${other.name} -> ${nodeBeingPruned.name} to result `
        );
        other.dependsOn.delete(nodeBeingPruned);
        other.dependsOn.add(resultMD);
        resultMD.dependsFrom.add(this.#grabLatest(other));
      });
      nodeBeingPruned.dependsFrom.clear();
      nodeBeingPruned.dependsOn.clear();
    });
  }

  #createGraph(
    nodes: DependencyNode[],
    options?: CreateGraphOptions<DependencyNode>
  ): GraphVizGraph {
    const {
      includeInboundDependencies = true,
      showSelfDependencies = false,
      nodeStylizer,
      edgeStylizer,
    } = options ?? {};
    const allNodes = new Set<DependencyNodeMetaData<DependencyNode>>();
    const toBeWalked: DependencyNodeMetaData<DependencyNode>[] = [];
    nodes.forEach((node) => {
      const md = this.#getMetaData(node);
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
    this.#populateNodeIds(allNodesArray);
    const graphNodes = allNodesArray.map((node) => {
      const styleProps = {
        node: node.node,
        meta: { id: node.id, name: node.name },
      };
      const defaultStyle = this.#DefaultNodeStylizer(styleProps);
      const nodeStyle = nodeStylizer ? nodeStylizer(styleProps) : {};
      return {
        id: node.id as GraphVizNodeId,
        label: node.name,
        ...defaultStyle,
        ...nodeStyle,
      };
    });
    const graphEdges = allNodesArray.flatMap((from) => {
      return Array.from(from.dependsOn).map((to) => {
        if (to === from && !showSelfDependencies) {
          return;
        }
        const styleProps = {
          from: { node: from.node, meta: { id: from.id, name: from.name } },
          to: { node: to.node, meta: { id: to.id, name: to.name } },
        };
        const defaultStyle = this.#DefaultEdgeStylizer(styleProps);
        const edgeStyle = edgeStylizer ? edgeStylizer(styleProps) : {};
        return {
          from: from.id as GraphVizNodeId,
          to: to.id as GraphVizNodeId,
          ...defaultStyle,
          ...edgeStyle,
        };
      });
    });
    const result: GraphVizGraph = {
      nodes: graphNodes,
      edges: filterDefined(graphEdges),
    };
    return result;
  }

  #uniqueColorsForText(text: string): string {
    if (!this.#colorMap.has(text)) {
      let keepGoing = true;
      let suggestedColor = textToColorIndex(text);
      while (keepGoing) {
        keepGoing =
          this.#colorMap.size < MAX_UNIQUE_COLORS &&
          Array.from(this.#colorMap.values()).includes(suggestedColor);
        if (keepGoing) {
          suggestedColor = (suggestedColor + 7) % MAX_UNIQUE_COLORS;
        }
      }
      this.#colorMap.set(text, suggestedColor);
    }
    return HSV(this.#colorMap.get(text)!);
  }

  #DefaultEdgeStylizer({ from }: EdgeStylizerProps): EdgeStylizerReturn {
    return {
      color: this.#uniqueColorsForText(from.meta.name),
    };
  }

  #DefaultNodeStylizer(node: NodeStylizerProps): NodeStylizerReturn {
    return {
      shape: "record",
      color: this.#uniqueColorsForText(node.meta.name),
    };
  }
}

function filterDefined<T>(list: (T | undefined)[]): T[] {
  return list.filter((i) => i !== undefined) as T[];
}
