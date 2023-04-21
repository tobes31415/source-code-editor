import fs from "node:fs";
import path from "node:path";
import { Transformer } from "./types";

/**
 * Reads a text file and returns the contents
 * @param file the file to be read
 * @param encoding (optional) the text encoding to be used - default: utf8
 * @returns the contents of the file
 */
export function readTextFile(file: string, encoding: BufferEncoding = "utf8") {
  return fs.readFileSync(file, { encoding });
}

/**
 * The supported kinds of line endings
 */
export type LineEndings = "\n" | "\r" | "\r\n";

interface FileLinesContent {
  lines: string[];
  lineEnding: LineEndings;
}

/**
 * Reads a text file and parses the contents as lines
 * @param file the file to be read
 * @param encoding (optional) the text encoding to be used - default: utf8
 * @returns an object containing the lines and the detected line ending
 */
export function readTextFileLines(
  file: string,
  encoding?: BufferEncoding
): FileLinesContent {
  const text = readTextFile(file, encoding);
  const hasCRLF = text.includes("\r\n");
  const hasCR = !hasCRLF && text.includes("\r");
  const lineEnding = hasCRLF ? "\r\n" : hasCR ? "\r" : "\n";
  const lines = text.split(lineEnding);
  return { lines, lineEnding };
}

/**
 * Writes text to a file
 * @param file the file to be replaced
 * @param content the content to be written
 * @param encoding (optional) the text encoding to be used - default: utf8
 */
export function writeTextFile(
  file: string,
  content: string,
  encoding: BufferEncoding = "utf8"
) {
  fs.writeFileSync(file, content, { encoding });
}

/**
 * Writes lines back to a file using LF line ending
 * @param file the file to be replaced
 * @param content the lines to be written
 * @param encoding (optional) the text encoding to be used - default: utf8
 */
export function writeTextFileLines(
  file: string,
  content: string[],
  encoding?: BufferEncoding
): void;
/**
 * Writes lines back to a file using the specified line ending
 * @param file  the file to be replaced
 * @param content the lines to be written
 * @param encoding (optional) the text encoding to be used - default: utf8
 */
export function writeTextFileLines(
  file: string,
  content: FileLinesContent,
  encoding?: BufferEncoding
): void;
export function writeTextFileLines(
  file: string,
  content: FileLinesContent | string[],
  encoding?: BufferEncoding
): void {
  if (Array.isArray(content)) {
    writeTextFile(file, content.join("\n"), encoding);
  } else {
    writeTextFile(file, content.lines.join(content.lineEnding), encoding);
  }
}

/**
 * A description of a file or folder in your file system
 */
interface FSNodeDescription {
  /**
   * The name of the node
   */
  name: string;
  /***
   * The full name of the node's parent
   */
  parent: string;
  /**
   * True if this node represents a file
   */
  isFile: boolean;
  /**
   * True if this node represents a folder
   */
  isFolder: boolean;
  /**
   * The full name of the node
   */
  fullName: string;
  /**
   * The size of the file in bytes
   */
  size: number;
  /**
   * When the file was last modified
   */
  lastModified: Date;
}

interface FileSearchRequestOptions {
  /**
   * The path to start searching from
   */
  path: string;
  /**
   * Optional include filters, files must pass EVERY file to be included
   */
  include?:
    | Transformer<FSNodeDescription, boolean>
    | Transformer<FSNodeDescription, boolean>[];
  /**
   * Optional exclusion filters, files failing any filter will be rejected
   */
  exclude?:
    | Transformer<FSNodeDescription, boolean>
    | Transformer<FSNodeDescription, boolean>[];
  /**
   * Optional disable the built-in exclusion filter for node_modules
   */
  allowNodeModules?: boolean;
  /**
   * Optional disable the built-in exclusion file for the .git folder
   */
  allowGit?: boolean;
  /**
   * If provided then only the specified extensions will be returned
   */
  allowedExtensions?: string[];
}

/**
 * Excludes node if the name matched
 * @param name the name to look for
 * @returns true if the node should b filtered out of the list
 */
export const excludeByName = (name: string) => (node: FSNodeDescription) =>
  node.name.includes(name);
/**
 * Excludes the node_modules folder
 */
export const excludeNodeModules = excludeByName("node_modules");
/**
 * Excludes the node_modules folder
 */
export const excludeGitFolder = excludeByName(".git");

/**
 * Includes files only if they match one of the specified file extensions
 * @param extensions the extensions to match
 * @returns true if the file should be included
 */
export const includeFilesByExtension =
  (extensions: string[]) => (node: FSNodeDescription) =>
    node.isFolder || extensions.some((ext) => node.name.endsWith(ext));

/**
 * Normalizes a value of type: T | T[] | undefined to type T[]
 * @param list the value to normalize
 * @returns the normalized array
 */
function singleOrArrayToArray<T>(list?: T | T[]): T[] {
  if (!list) {
    return [];
  }
  return Array.isArray(list) ? list : [list];
}

/**
 * Recursively lists all files in the specified path
 * @param request the parameters of the file search
 * @returns a generator to fetch your files as you need them
 */
export function listAllFilesAsGenerator(
  request: FileSearchRequestOptions
): Generator<FSNodeDescription> {
  const include = singleOrArrayToArray(request.include);
  const exclude = singleOrArrayToArray(request.exclude);
  if (!request.allowNodeModules) {
    exclude.unshift(excludeNodeModules);
  }
  if (!request.allowGit) {
    exclude.unshift(excludeGitFolder);
  }
  if (request.allowedExtensions) {
    include.push(includeFilesByExtension(request.allowedExtensions));
  }

  const filter = makeCombinedFilter<FSNodeDescription>(include, exclude);
  return RecursiveFileSearch(request.path, { filter });
}

/**
 * Recursively lists all files in the specified path
 * @param request the parameters of the file search
 * @returns an array with all of the matching files
 */
export function listAllFiles(
  request: FileSearchRequestOptions
): FSNodeDescription[] {
  return Array.from(listAllFilesAsGenerator(request));
}

/**
 * Combines multiple inclusion/exclusion filters into a single function call
 * @param include inclusion filters (Must pass all to be included)
 * @param exclude exclusion filters (Must fail all to be included)
 * @returns true if the item should be included
 */
export function makeCombinedFilter<T>(
  include: Transformer<T, boolean>[],
  exclude: Transformer<T, boolean>[]
): Transformer<T, boolean> {
  return (node: T) => {
    if (include.length && !include.every((filter) => filter(node))) {
      return false;
    }
    if (exclude.length && exclude.some((filter) => filter(node))) {
      return false;
    }
    return true;
  };
}

/**
 * The algorithm used to search throw a tree of nodes
 */
enum RecursiveSearchMode {
  /**
   * Performs a depth first search
   */
  DFS = 0,
  /**
   * Performs a breadth first search
   */
  BFS = 1,
}

/**
 * Optios for how to perform a recursive file search
 */
interface RFSOptions {
  /**
   * A filter to prune undesired nodes before they are emitted
   */
  filter?: Transformer<FSNodeDescription, boolean>;
  /**
   * The recursive search algorithm to apply (default: Depth first search)
   */
  searchMode?: RecursiveSearchMode;
  /**
   * If folders should be emitted from the final output (Default false)
   */
  emitFolders?: boolean;
}

/***
 * Performs a recursive file search and returns an iterator to extract the results
 */
export function* RecursiveFileSearch(
  filePath: string,
  options?: RFSOptions
): Generator<FSNodeDescription> {
  const {
    filter,
    emitFolders,
    searchMode = RecursiveSearchMode.DFS,
  } = options || {};
  const nodesToProcess: FSNodeDescription[] = [];
  const processNodes = (nodes: FSNodeDescription[]) => {
    nodes.forEach((node) => {
      if (filter && !filter(node)) {
        return;
      }
      if (node.isFolder) {
        if (searchMode === RecursiveSearchMode.DFS) {
          nodesToProcess.unshift(node);
        } else {
          nodesToProcess.push(node);
        }
      } else {
        if (searchMode === RecursiveSearchMode.DFS) {
          nodesToProcess.push(node);
        } else {
          nodesToProcess.unshift(node);
        }
      }
    });
  };
  const readDir = (folderPath: string) => {
    const localNodes = fs.readdirSync(folderPath);
    const describedNodes = localNodes.map((node) =>
      describeNode(folderPath, node)
    );
    processNodes(describedNodes);
  };

  readDir(filePath);
  while (nodesToProcess.length > 0) {
    const next = nodesToProcess.shift()!;
    if (next?.isFolder) {
      readDir(next.fullName);
      if (emitFolders) {
        yield next;
      }
    } else {
      yield next;
    }
  }
}

function describeNode(parent: string, name: string): FSNodeDescription {
  const fullName = path.join(parent, name);
  const stats = fs.statSync(fullName);
  const isFile = stats.isFile();
  return {
    name,
    parent,
    fullName,
    isFile,
    isFolder: !isFile,
    size: stats.size,
    lastModified: stats.mtime,
  };
}
