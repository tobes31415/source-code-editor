# Module: rsync

## Table of contents

### Interfaces

- [RSyncInstruction](../wiki/rsync.RSyncInstruction)

### Functions

- [rsync](../wiki/rsync#rsync)
- [rsyncDryRun](../wiki/rsync#rsyncdryrun)

## Functions

### rsync

▸ **rsync**(`srcFolder`, `destFolder`, `excludedFiles?`): `void`

Mimicks the functionality of rsync using node (cross platform)

#### Parameters

| Name | Type |
| :------ | :------ |
| `srcFolder` | `string` |
| `destFolder` | `string` |
| `excludedFiles?` | `FilterFn` |

#### Returns

`void`

#### Defined in

rsync.ts:22

___

### rsyncDryRun

▸ **rsyncDryRun**(`srcFolder`, `destFolder`, `excludedFiles?`): [`RSyncInstruction`](../wiki/rsync.RSyncInstruction)[]

Compares two folders to generate a list of sync instructions

#### Parameters

| Name | Type |
| :------ | :------ |
| `srcFolder` | `string` |
| `destFolder` | `string` |
| `excludedFiles?` | `FilterFn` |

#### Returns

[`RSyncInstruction`](../wiki/rsync.RSyncInstruction)[]

#### Defined in

rsync.ts:48
