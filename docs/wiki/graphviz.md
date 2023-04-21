# Module: graphviz

## Table of contents

### Interfaces

- [GraphVizCluster](../wiki/graphviz.GraphVizCluster)
- [GraphVizClusterStyle](../wiki/graphviz.GraphVizClusterStyle)
- [GraphVizEdge](../wiki/graphviz.GraphVizEdge)
- [GraphVizEdgeStyle](../wiki/graphviz.GraphVizEdgeStyle)
- [GraphVizGraph](../wiki/graphviz.GraphVizGraph)
- [GraphVizNode](../wiki/graphviz.GraphVizNode)
- [GraphVizNodeStyle](../wiki/graphviz.GraphVizNodeStyle)

### Type Aliases

- [GraphVizArrowShape](../wiki/graphviz#graphvizarrowshape)
- [GraphVizClusterId](../wiki/graphviz#graphvizclusterid)
- [GraphVizNodeId](../wiki/graphviz#graphviznodeid)
- [GraphVizNodeShape](../wiki/graphviz#graphviznodeshape)

### Functions

- [generateGraphVizConfig](../wiki/graphviz#generategraphvizconfig)

## Type Aliases

### GraphVizArrowShape

Ƭ **GraphVizArrowShape**: ``"normal"`` \| ``"inv"`` \| ``"dot"`` \| ``"invdot"`` \| ``"odot"`` \| ``"invodot"`` \| ``"none"`` \| ``"tee"`` \| ``"empty"`` \| ``"invempty"`` \| ``"diamond"`` \| ``"odiamond"`` \| ``"ediamond"`` \| ``"crow"`` \| ``"box"`` \| ``"obox"`` \| ``"open"`` \| ``"halfopen"`` \| ``"vee"``

#### Defined in

graphviz.ts:43

___

### GraphVizClusterId

Ƭ **GraphVizClusterId**: `string` & { `_GraphVizClusterId`: ``"GraphVizClusterId"``  }

#### Defined in

graphviz.ts:2

___

### GraphVizNodeId

Ƭ **GraphVizNodeId**: `string` & { `_GraphVizNodeId`: ``"GraphVizNodeId"``  }

#### Defined in

graphviz.ts:1

___

### GraphVizNodeShape

Ƭ **GraphVizNodeShape**: ``"record"`` \| ``"box"`` \| ``"polygon"`` \| ``"ellipse"`` \| ``"oval"`` \| ``"circle"`` \| ``"point"`` \| ``"egg"`` \| ``"triangle"`` \| ``"plaintext"`` \| ``"plain"`` \| ``"diamond"`` \| ``"trapezium"`` \| ``"parallelogram"`` \| ``"house"`` \| ``"pentagon"`` \| ``"hexagon"`` \| ``"septagon"`` \| ``"octogon"`` \| ``"doublecircle"`` \| ``"doubleoctogon"`` \| ``"trippleoctogon"`` \| ``"invtriangle"`` \| ``"invhouse"`` \| ``"Mdiamond"`` \| ``"Msquare"`` \| ``"Mcircle"`` \| ``"rectangle"`` \| ``"squre"`` \| ``"star"`` \| ``"cylinder"`` \| ``"note"`` \| ``"tab"`` \| ``"folder"`` \| ``"box3d"`` \| ``"component"``

#### Defined in

graphviz.ts:6

## Functions

### generateGraphVizConfig

▸ **generateGraphVizConfig**(`graphDescription`): `string`

Given the description of a graph, generate the corresponding config in DOT language

#### Parameters

| Name | Type |
| :------ | :------ |
| `graphDescription` | [`GraphVizGraph`](../wiki/graphviz.GraphVizGraph) |

#### Returns

`string`

#### Defined in

graphviz.ts:144
