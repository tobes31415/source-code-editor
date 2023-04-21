import fs from "node:fs";
import path from "node:path";
import { FSNodeDescription, listAllFiles } from "./files";
import { Transformer } from "./types";

type FilterFn = (file: RsyncFSNodeDescription) => boolean;

interface RsyncFSNodeDescription extends FSNodeDescription {
  effectivePath: string;
  effectiveParent: string;
}

export interface RSyncInstruction {
  op: "mkdir" | "delete" | "copy";
  src?: string;
  dest: string;
}

/**
 * Mimicks the functionality of rsync using node (cross platform)
 */
export function rsync(
  srcFolder: string,
  destFolder: string,
  excludedFiles?: FilterFn
) {
  const instructions = rsyncDryRun(srcFolder, destFolder, excludedFiles);
  instructions.forEach(performInstruction);
}

function decorateEffectivePath(
  root: string
): Transformer<FSNodeDescription, RsyncFSNodeDescription> {
  return (file) => ({
    ...file,
    effectiveParent: file.parent.startsWith(root)
      ? file.parent.substring(root.length + 1)
      : file.parent,
    effectivePath: file.fullName.startsWith(root)
      ? file.fullName.substring(root.length + 1)
      : file.fullName,
  });
}

/**
 * Compares two folders to generate a list of sync instructions
 */
export function rsyncDryRun(
  srcFolder: string,
  destFolder: string,
  excludedFiles?: FilterFn
): RSyncInstruction[] {
  const allSrcFiles = listAllFiles({ path: srcFolder })
    .map(decorateEffectivePath(srcFolder))
    .filter(excludedFiles ?? (() => true));

  const allDestFiles = listAllFiles({ path: destFolder }).map(
    decorateEffectivePath(destFolder)
  );

  const newFiles = allSrcFiles.filter(
    (srcFile) =>
      !allDestFiles.some(
        (destFile) => destFile.effectivePath === srcFile.effectivePath
      )
  );
  const extraFiles = allDestFiles.filter(
    (destFile) =>
      !allSrcFiles.some(
        (srcFile) => srcFile.effectivePath === destFile.effectivePath
      )
  );
  const updatedFiles = allSrcFiles
    .filter((srcFile) =>
      allDestFiles.some(
        (destFile) => destFile.effectivePath === srcFile.effectivePath
      )
    )
    .filter((srcFile) => {
      const destFile = allDestFiles.find(
        (destFile) => destFile.effectivePath === srcFile.effectivePath
      )!;
      return srcDiffers(srcFile, destFile);
    });
  const makeFolders = new Set<string>();
  newFiles
    .map((file) => path.join(destFolder, file.effectiveParent))
    .filter((folder) => !fs.existsSync(folder))
    .forEach((folder) => makeFolders.add(folder));

  const instructions: RSyncInstruction[] = [];
  const makeFoldersSorted = Array.from(makeFolders);
  makeFoldersSorted.sort();
  makeFoldersSorted.forEach((folder) => {
    instructions.push({ op: "mkdir", dest: folder });
  });
  extraFiles.forEach((file) =>
    instructions.push({ op: "delete", dest: file.fullName })
  );
  newFiles.forEach((file) =>
    instructions.push({
      op: "copy",
      src: file.fullName,
      dest: path.join(destFolder, file.effectivePath),
    })
  );
  updatedFiles.forEach((file) =>
    instructions.push({
      op: "copy",
      src: file.fullName,
      dest: path.join(destFolder, file.effectivePath),
    })
  );

  return instructions;
}

/**
 * returns true if the file size is different or if the destination file is newer
 */
function srcDiffers(src: RsyncFSNodeDescription, dest: RsyncFSNodeDescription) {
  return src.size !== dest.size || src.lastModified > dest.lastModified;
}

/**
 * Performs a single file operation such as making a folder, deleting a file, or copying a file
 */
function performInstruction(instruction: RSyncInstruction) {
  switch (instruction.op) {
    case "mkdir":
      fs.mkdirSync(instruction.dest, { recursive: true });
      return;
    case "delete":
      fs.unlinkSync(instruction.dest);
      return;
    case "copy":
      if (!instruction.src) {
        throw new Error("src is missing");
      }
      fs.copyFileSync(instruction.src, instruction.dest);
      return;
  }
}
