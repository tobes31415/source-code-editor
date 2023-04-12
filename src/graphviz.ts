export type GraphVizNodeId = string & { _GraphVizNodeId: "GraphVizNodeId" };

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

export interface GraphVizGraph {
  nodes: GraphVizNode[];
  edges: GraphVizEdge[];
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
  const sb = [];
  sb.push(`digraph graphname`);
  sb.push(`{`);
  graphDescription.nodes.forEach(({ id, ...node }) => {
    const nodeAttributes = propsToAttributes(node);
    sb.push(`    "${id}" ${nodeAttributes}`);
  });
  sb.push(`    subgraph Rel1 {`);
  graphDescription.edges.forEach(({ from, to, ...edge }) => {
    const edgeAtributes = propsToAttributes(edge);
    sb.push(`        "${from}" -> "${to}" ${edgeAtributes}`);
  });
  sb.push(`    }`);
  sb.push(`}`);
  return sb.join("\n");
}
