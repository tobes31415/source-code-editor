# Module: types

## Table of contents

### Type Aliases

- [Callback](../wiki/types#callback)
- [Transformer](../wiki/types#transformer)

## Type Aliases

### Callback

Ƭ **Callback**<`T`\>: (`value`: `T`) => `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`value`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

##### Returns

`void`

#### Defined in

types.ts:6

___

### Transformer

Ƭ **Transformer**<`TI`, `TO`\>: (`value`: `TI`) => `TO`

#### Type parameters

| Name |
| :------ |
| `TI` |
| `TO` |

#### Type declaration

▸ (`value`): `TO`

Synchronously transforms one value into another

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `TI` |

##### Returns

`TO`

#### Defined in

types.ts:4
