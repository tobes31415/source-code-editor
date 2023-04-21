# Module: files

## Table of contents

### Interfaces

- [FSNodeDescription](../wiki/files.FSNodeDescription)
- [FileSearchRequestOptions](../wiki/files.FileSearchRequestOptions)

### Type Aliases

- [LineEndings](../wiki/files#lineendings)

### Functions

- [RecursiveFileSearch](../wiki/files#recursivefilesearch)
- [excludeByName](../wiki/files#excludebyname)
- [excludeGitFolder](../wiki/files#excludegitfolder)
- [excludeNodeModules](../wiki/files#excludenodemodules)
- [includeFilesByExtension](../wiki/files#includefilesbyextension)
- [listAllFiles](../wiki/files#listallfiles)
- [listAllFilesAsGenerator](../wiki/files#listallfilesasgenerator)
- [makeCombinedFilter](../wiki/files#makecombinedfilter)
- [readTextFile](../wiki/files#readtextfile)
- [readTextFileLines](../wiki/files#readtextfilelines)
- [writeTextFile](../wiki/files#writetextfile)
- [writeTextFileLines](../wiki/files#writetextfilelines)

## Type Aliases

### LineEndings

Ƭ **LineEndings**: ``"\n"`` \| ``"\r"`` \| ``"\r\n"``

The supported kinds of line endings

#### Defined in

files.ts:18

## Functions

### RecursiveFileSearch

▸ **RecursiveFileSearch**(`filePath`, `options?`): `Generator`<[`FSNodeDescription`](../wiki/files.FSNodeDescription)\>

Performs a recursive file search and returns an iterator to extract the results

#### Parameters

| Name | Type |
| :------ | :------ |
| `filePath` | `string` |
| `options?` | `RFSOptions` |

#### Returns

`Generator`<[`FSNodeDescription`](../wiki/files.FSNodeDescription)\>

#### Defined in

files.ts:284

___

### excludeByName

▸ **excludeByName**(`name`): (`node`: [`FSNodeDescription`](../wiki/files.FSNodeDescription)) => `boolean`

Excludes node if the name matched

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | the name to look for |

#### Returns

`fn`

true if the node should b filtered out of the list

▸ (`node`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`FSNodeDescription`](../wiki/files.FSNodeDescription) |

##### Returns

`boolean`

#### Defined in

files.ts:161

___

### excludeGitFolder

▸ **excludeGitFolder**(`node`): `boolean`

Excludes the node_modules folder

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`FSNodeDescription`](../wiki/files.FSNodeDescription) |

#### Returns

`boolean`

#### Defined in

files.ts:161

___

### excludeNodeModules

▸ **excludeNodeModules**(`node`): `boolean`

Excludes the node_modules folder

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`FSNodeDescription`](../wiki/files.FSNodeDescription) |

#### Returns

`boolean`

#### Defined in

files.ts:161

___

### includeFilesByExtension

▸ **includeFilesByExtension**(`extensions`): (`node`: [`FSNodeDescription`](../wiki/files.FSNodeDescription)) => `boolean`

Includes files only if they match one of the specified file extensions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `extensions` | `string`[] | the extensions to match |

#### Returns

`fn`

true if the file should be included

▸ (`node`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`FSNodeDescription`](../wiki/files.FSNodeDescription) |

##### Returns

`boolean`

#### Defined in

files.ts:178

___

### listAllFiles

▸ **listAllFiles**(`request`): [`FSNodeDescription`](../wiki/files.FSNodeDescription)[]

Recursively lists all files in the specified path

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | [`FileSearchRequestOptions`](../wiki/files.FileSearchRequestOptions) | the parameters of the file search |

#### Returns

[`FSNodeDescription`](../wiki/files.FSNodeDescription)[]

an array with all of the matching files

#### Defined in

files.ts:222

___

### listAllFilesAsGenerator

▸ **listAllFilesAsGenerator**(`request`): `Generator`<[`FSNodeDescription`](../wiki/files.FSNodeDescription)\>

Recursively lists all files in the specified path

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | [`FileSearchRequestOptions`](../wiki/files.FileSearchRequestOptions) | the parameters of the file search |

#### Returns

`Generator`<[`FSNodeDescription`](../wiki/files.FSNodeDescription)\>

a generator to fetch your files as you need them

#### Defined in

files.ts:198

___

### makeCombinedFilter

▸ **makeCombinedFilter**<`T`\>(`include`, `exclude`): [`Transformer`](../wiki/types#transformer)<`T`, `boolean`\>

Combines multiple inclusion/exclusion filters into a single function call

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `include` | [`Transformer`](../wiki/types#transformer)<`T`, `boolean`\>[] | inclusion filters (Must pass all to be included) |
| `exclude` | [`Transformer`](../wiki/types#transformer)<`T`, `boolean`\>[] | exclusion filters (Must fail all to be included) |

#### Returns

[`Transformer`](../wiki/types#transformer)<`T`, `boolean`\>

true if the item should be included

#### Defined in

files.ts:234

___

### readTextFile

▸ **readTextFile**(`file`, `encoding?`): `string`

Reads a text file and returns the contents

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `file` | `string` | `undefined` | the file to be read |
| `encoding` | `BufferEncoding` | `"utf8"` | (optional) the text encoding to be used - default: utf8 |

#### Returns

`string`

the contents of the file

#### Defined in

files.ts:11

___

### readTextFileLines

▸ **readTextFileLines**(`file`, `encoding?`): `FileLinesContent`

Reads a text file and parses the contents as lines

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `string` | the file to be read |
| `encoding?` | `BufferEncoding` | (optional) the text encoding to be used - default: utf8 |

#### Returns

`FileLinesContent`

an object containing the lines and the detected line ending

#### Defined in

files.ts:31

___

### writeTextFile

▸ **writeTextFile**(`file`, `content`, `encoding?`): `void`

Writes text to a file

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `file` | `string` | `undefined` | the file to be replaced |
| `content` | `string` | `undefined` | the content to be written |
| `encoding` | `BufferEncoding` | `"utf8"` | (optional) the text encoding to be used - default: utf8 |

#### Returns

`void`

#### Defined in

files.ts:49

___

### writeTextFileLines

▸ **writeTextFileLines**(`file`, `content`, `encoding?`): `void`

Writes lines back to a file using LF line ending

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `string` | the file to be replaced |
| `content` | `string`[] | the lines to be written |
| `encoding?` | `BufferEncoding` | (optional) the text encoding to be used - default: utf8 |

#### Returns

`void`

#### Defined in

files.ts:63

▸ **writeTextFileLines**(`file`, `content`, `encoding?`): `void`

Writes lines back to a file using the specified line ending

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `string` | the file to be replaced |
| `content` | `FileLinesContent` | the lines to be written |
| `encoding?` | `BufferEncoding` | (optional) the text encoding to be used - default: utf8 |

#### Returns

`void`

#### Defined in

files.ts:74
