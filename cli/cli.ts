#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  applyFocus, formatStats, getStats, isTreeText, limitDepth, parseTree,
  printTree, scanFileSystem, transform,
} from "../core/index.js";
import { DEFAULT_IGNORED_DIRS } from "../core/constants.js";
import type { TreeNode } from "../core/types.js";

const VERSION = "1.0.3";

function help(): void {
  console.log(`
treeer ${VERSION}

Usage:
  treeer <file|directory|tree.txt> [options]

Options:
  -o, --output <file>   Write output to a file
  -f, --focus <path>    Focus on a path
  -i, --ignore <dirs>   Comma-separated directories to ignore
  -l, --level <depth>   Limit the tree to this depth
  -j, --json            Output JSON
  -s, --stats           Show AI statistics
      --no-stats        Hide statistics
  -v, --version         Show version
  -h, --help            Show help

Examples:
  treeer .
  treeer ./src
  treeer tree.txt
  treeer . -o ai-tree.txt
  treeer . --ignore tests,docs
  treeer . --focus src/components
  treeer . -l 2
  treeer . --json
  treeer . --stats
`);
}

function option(args: string[], names: string[]): string | undefined {
  for (let i = 0; i < args.length; i++) {
    if (names.includes(args[i])) {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`Missing value for ${args[i]}`);
      }
      return value;
    }
  }
  return undefined;
}

function flag(args: string[], names: string[]): boolean {
  return args.some((arg) => names.includes(arg));
}

function positionalInput(args: string[]): string | undefined {
  const valueOptions = new Set([
    "-o", "--output", "-f", "--focus", "-i", "--ignore", "-l", "--level",
  ]);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("-")) {
      if (valueOptions.has(args[i])) i++;
      continue;
    }
    return args[i];
  }
  return undefined;
}

try {
  const args = process.argv.slice(2);

  if (flag(args, ["-h", "--help"])) {
    help();
    process.exit(0);
  }

  if (flag(args, ["-v", "--version"])) {
    console.log(VERSION);
    process.exit(0);
  }

  const input = positionalInput(args);
  if (!input) {
    help();
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    throw new Error(`Target does not exist: ${input}`);
  }

  const outputFile = option(args, ["-o", "--output"]);
  const focus = option(args, ["-f", "--focus"]);
  const ignoreArg = option(args, ["-i", "--ignore"]);
  const levelArg = option(args, ["-l", "--level"]);
  const maxDepth = levelArg === undefined ? undefined : Number(levelArg);
  if (maxDepth !== undefined && (!Number.isInteger(maxDepth) || maxDepth < 1)) {
    throw new Error("Depth must be a positive integer");
  }

  const ignoredDirs = new Set(DEFAULT_IGNORED_DIRS);
  for (const dir of ignoreArg?.split(",").map((x) => x.trim()) ?? []) {
    if (dir) ignoredDirs.add(dir);
  }

  let original = "";
  let tree: TreeNode;
  const stat = fs.statSync(input);

  if (stat.isDirectory()) {
    tree = scanFileSystem(input, ignoredDirs);
    original = printTree(tree).join("\n");
  } else {
    original = fs.readFileSync(input, "utf8");
    tree = isTreeText(original)
      ? parseTree(original.split(/\r?\n/))
      : { name: path.basename(input), isFile: true, children: [] };
  }

  tree = applyFocus(tree, focus);
  if (maxDepth !== undefined) limitDepth(tree, maxDepth);
  if (!tree.isFile) transform(tree);

  let result = tree.isFile ? tree.name : printTree(tree).join("\n");

  if (flag(args, ["-j", "--json"])) {
    result = JSON.stringify(tree, null, 2);
  }

  if (flag(args, ["-s", "--stats"]) && !flag(args, ["--no-stats"])) {
    result += formatStats(getStats(original, result, tree));
  }

  if (outputFile) {
    fs.writeFileSync(outputFile, `${result}\n`, "utf8");
    console.log(`Saved: ${outputFile}`);
  } else {
    console.log(result);
  }
} catch (error) {
  console.error(`treeer: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
