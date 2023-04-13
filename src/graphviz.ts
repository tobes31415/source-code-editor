export type GraphVizNodeId = string & { _GraphVizNodeId: "GraphVizNodeId" };
export type GraphVizClusterId = string & {
  _GraphVizClusterId: "GraphVizClusterId";
};

export type GraphVizNodeShape =
  | "record"
  | "box"
  | "polygon"
  | "ellipse"
  | "oval"
  | "circle"
  | "point"
  | "egg"
  | "triangle"
  | "plaintext"
  | "plain"
  | "diamond"
  | "trapezium"
  | "parallelogram"
  | "house"
  | "pentagon"
  | "hexagon"
  | "septagon"
  | "octogon"
  | "doublecircle"
  | "doubleoctogon"
  | "trippleoctogon"
  | "invtriangle"
  | "invhouse"
  | "Mdiamond"
  | "Msquare"
  | "Mcircle"
  | "rectangle"
  | "squre"
  | "star"
  | "cylinder"
  | "note"
  | "tab"
  | "folder"
  | "box3d"
  | "component";
export type GraphVizArrowShape =
  | "normal"
  | "inv"
  | "dot"
  | "invdot"
  | "odot"
  | "invodot"
  | "none"
  | "tee"
  | "empty"
  | "invempty"
  | "diamond"
  | "odiamond"
  | "ediamond"
  | "crow"
  | "box"
  | "obox"
  | "open"
  | "halfopen"
  | "vee";

interface GraphVizSharedStyle {
  dashed?: boolean;
  dotted?: boolean;
  solid?: boolean;
  invis?: boolean;
  bold?: boolean;
}

export interface GraphVizNodeStyle extends GraphVizSharedStyle {
  filled?: boolean;
  striped?: boolean;
  wedged?: boolean;
  rounded?: boolean;
  diagonals?: boolean;
}

export interface GraphVizEdgeStyle extends GraphVizSharedStyle {
  tapered?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GraphVizClusterStyle extends GraphVizSharedStyle {}

export interface GraphVizNode {
  id: GraphVizNodeId;
  shape?: GraphVizNodeShape;
  label: string;
  color?: string;
  fillColor?: string;
  fontColor?: string;
  fontName?: string;
  fontSize?: string;
  target?: string;
  url?: string;
  style?: GraphVizNodeStyle;
}

export interface GraphVizEdge {
  from: GraphVizNodeId;
  to: GraphVizNodeId;
  color?: string;
  arrowHead?: GraphVizArrowShape;
  arrowSize?: number;
  target?: string;
  url?: string;
  style?: GraphVizEdgeStyle;
}

export interface GraphVizCluster {
  id?: GraphVizClusterId;
  style?: GraphVizClusterStyle;
  color?: string;
  label?: string;
  nodes: GraphVizNodeId[];
}

export interface GraphVizGraph {
  nodes: GraphVizNode[];
  edges: GraphVizEdge[];
  clusters?: GraphVizCluster[];
}

function propsToAttributes(obj: object): string {
  const result: string[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    if (value) {
      if (typeof value === "object") {
        const commaSeperated = Object.keys(value).join(", ");
        result.push(`${key.toLowerCase()} = "${commaSeperated}"`);
      } else {
        result.push(`${key.toLowerCase()} = "${value}"`);
      }
    }
  });
  return result.length > 0 ? `[${result.join(" ")}]` : "";
}

/**
 * Given the description of a graph, generate the corresponding config in DOT language
 */
export function generateGraphVizConfig(
  graphDescription: GraphVizGraph
): string {
  const clusterNodes = new Set<GraphVizNodeId>();
  const multiClusterNodes = new Set<GraphVizNodeId>();
  graphDescription.clusters?.forEach((cluster) => {
    cluster.nodes.forEach((node) => {
      if (clusterNodes.has(node)) {
        multiClusterNodes.add(node);
      }
      clusterNodes.add(node);
    });
  });
  const rootNodes = new Set<GraphVizNodeId>(
    graphDescription.nodes
      .map((node) => node.id)
      .filter((id) => !clusterNodes.has(id) || multiClusterNodes.has(id))
  );

  const renderTheseNodes = (nodeIds: GraphVizNodeId[]) => {
    nodeIds.forEach((id) => {
      const node = graphDescription.nodes.find((node) => node.id === id);
      if (node) {
        let nodeAttributes: string;
        if (node.id === node.label) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, label, ...rest } = node;
          nodeAttributes = propsToAttributes(rest);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = node;
          nodeAttributes = propsToAttributes(rest);
        }
        sb.push(`        "${id}" ${nodeAttributes}`);
      }
    });
  };

  const sb = [];
  sb.push(`digraph graphname`);
  sb.push(`{`);
  sb.push(`    subgraph root {`);
  renderTheseNodes(Array.from(rootNodes));
  sb.push(`    }`);
  sb.push("");
  graphDescription.clusters?.forEach((cluster, index) => {
    const { id, nodes, ...styleProps } = cluster;
    sb.push(`    subgraph cluster_${id ?? index} {`);
    const styleAttributes = propsToAttributes(styleProps).replaceAll(
      /^\[|\]$/g,
      ""
    );
    sb.push(`        ${styleAttributes}`);
    renderTheseNodes(nodes);
    sb.push(`    }`);
    sb.push("");
  });
  graphDescription.edges.forEach(({ from, to, ...edge }) => {
    const edgeAtributes = propsToAttributes(edge);
    sb.push(`    "${from}" -> "${to}" ${edgeAtributes}`);
  });

  sb.push(`}`);
  return sb.join("\n");
}
