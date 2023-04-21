# Module: dependency

## Table of contents

### Type Aliases

- [ClusterStylizer](../wiki/dependency#clusterstylizer)
- [ClusterStylizerProps](../wiki/dependency#clusterstylizerprops)
- [ClusterStylizerReturn](../wiki/dependency#clusterstylizerreturn)
- [EdgeStylizer](../wiki/dependency#edgestylizer)
- [EdgeStylizerProps](../wiki/dependency#edgestylizerprops)
- [EdgeStylizerReturn](../wiki/dependency#edgestylizerreturn)
- [NodeStylizer](../wiki/dependency#nodestylizer)
- [NodeStylizerProps](../wiki/dependency#nodestylizerprops)
- [NodeStylizerReturn](../wiki/dependency#nodestylizerreturn)

### Functions

- [createDependencyGraph](../wiki/dependency#createdependencygraph)

## Type Aliases

### ClusterStylizer

Ƭ **ClusterStylizer**: [`Transformer`](../wiki/types#transformer)<[`ClusterStylizerProps`](../wiki/dependency#clusterstylizerprops), [`ClusterStylizerReturn`](../wiki/dependency#clusterstylizerreturn)\>

#### Defined in

dependency.ts:58

___

### ClusterStylizerProps

Ƭ **ClusterStylizerProps**: `string`

#### Defined in

dependency.ts:55

___

### ClusterStylizerReturn

Ƭ **ClusterStylizerReturn**: `Omit`<[`GraphVizCluster`](../wiki/graphviz.GraphVizCluster), ``"id"`` \| ``"label"``\> & `Partial`<`Pick`<[`GraphVizCluster`](../wiki/graphviz.GraphVizCluster), ``"label"``\>\>

#### Defined in

dependency.ts:56

___

### EdgeStylizer

Ƭ **EdgeStylizer**<`DependencyNode`\>: [`Transformer`](../wiki/types#transformer)<[`EdgeStylizerProps`](../wiki/dependency#edgestylizerprops)<`DependencyNode`\>, [`EdgeStylizerReturn`](../wiki/dependency#edgestylizerreturn)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `DependencyNode` | `unknown` |

#### Defined in

dependency.ts:50

___

### EdgeStylizerProps

Ƭ **EdgeStylizerProps**<`DependencyNode`\>: `DependencyPair`<`TransformProps`<`DependencyNode`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `DependencyNode` | `unknown` |

#### Defined in

dependency.ts:46

___

### EdgeStylizerReturn

Ƭ **EdgeStylizerReturn**: `Omit`<[`GraphVizEdge`](../wiki/graphviz.GraphVizEdge), ``"from"`` \| ``"to"``\>

#### Defined in

dependency.ts:49

___

### NodeStylizer

Ƭ **NodeStylizer**<`DependencyNode`\>: [`Transformer`](../wiki/types#transformer)<[`NodeStylizerProps`](../wiki/dependency#nodestylizerprops)<`DependencyNode`\>, [`NodeStylizerReturn`](../wiki/dependency#nodestylizerreturn)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `DependencyNode` | `unknown` |

#### Defined in

dependency.ts:41

___

### NodeStylizerProps

Ƭ **NodeStylizerProps**<`DependencyNode`\>: `TransformProps`<`DependencyNode`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `DependencyNode` | `unknown` |

#### Defined in

dependency.ts:37

___

### NodeStylizerReturn

Ƭ **NodeStylizerReturn**: `Omit`<[`GraphVizNode`](../wiki/graphviz.GraphVizNode), ``"id"`` \| ``"label"``\> & `Partial`<`Pick`<[`GraphVizNode`](../wiki/graphviz.GraphVizNode), ``"label"``\>\>

#### Defined in

dependency.ts:39

## Functions

### createDependencyGraph

▸ **createDependencyGraph**<`DNode`\>(): `DependencyGraph`<`DNode`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `DNode` | `unknown` |

#### Returns

`DependencyGraph`<`DNode`\>

#### Defined in

dependency.ts:71
