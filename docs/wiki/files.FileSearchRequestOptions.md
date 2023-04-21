# Interface: FileSearchRequestOptions

[files](../wiki/files).FileSearchRequestOptions

## Table of contents

### Properties

- [allowGit](../wiki/files.FileSearchRequestOptions#allowgit)
- [allowNodeModules](../wiki/files.FileSearchRequestOptions#allownodemodules)
- [allowedExtensions](../wiki/files.FileSearchRequestOptions#allowedextensions)
- [exclude](../wiki/files.FileSearchRequestOptions#exclude)
- [include](../wiki/files.FileSearchRequestOptions#include)
- [path](../wiki/files.FileSearchRequestOptions#path)

## Properties

### allowGit

• `Optional` **allowGit**: `boolean`

Optional disable the built-in exclusion file for the .git folder

#### Defined in

files.ts:149

___

### allowNodeModules

• `Optional` **allowNodeModules**: `boolean`

Optional disable the built-in exclusion filter for node_modules

#### Defined in

files.ts:145

___

### allowedExtensions

• `Optional` **allowedExtensions**: `string`[]

If provided then only the specified extensions will be returned

#### Defined in

files.ts:153

___

### exclude

• `Optional` **exclude**: [`Transformer`](../wiki/types#transformer)<[`FSNodeDescription`](../wiki/files.FSNodeDescription), `boolean`\> \| [`Transformer`](../wiki/types#transformer)<[`FSNodeDescription`](../wiki/files.FSNodeDescription), `boolean`\>[]

Optional exclusion filters, files failing any filter will be rejected

#### Defined in

files.ts:139

___

### include

• `Optional` **include**: [`Transformer`](../wiki/types#transformer)<[`FSNodeDescription`](../wiki/files.FSNodeDescription), `boolean`\> \| [`Transformer`](../wiki/types#transformer)<[`FSNodeDescription`](../wiki/files.FSNodeDescription), `boolean`\>[]

Optional include filters, files must pass EVERY file to be included

#### Defined in

files.ts:133

___

### path

• **path**: `string`

The path to start searching from

#### Defined in

files.ts:129
