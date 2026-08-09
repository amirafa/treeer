import fs from "node:fs";
import path from "node:path";
import type { TreeNode } from "./types.js";
import { DEFAULT_IGNORED_DIRS } from "./constants.js";

function hasExtension(name: string): boolean {
  return path.extname(name).length > 0;
}

export function scanFileSystem(
  target: string,
  ignoredDirs: Set<string> = DEFAULT_IGNORED_DIRS,
): TreeNode {
  let stat;
  const name = path.basename(target);

  try {
    stat = fs.statSync(target);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e && e.code === "ENOENT") {
      return { name, isFile: true, children: [] };
    }
    throw err;
  }

  if (stat.isFile()) {
    return { name, isFile: true, children: [] };
  }

  const node: TreeNode = { name, isFile: false, children: [] };
  const entries = fs.readdirSync(target, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
    node.children.push(scanFileSystem(path.join(target, entry.name), ignoredDirs));
  }

  return node;
}

export function isTreeText(content: string): boolean {
  return content.includes("├──") || content.includes("└──");
}

export function parseTree(lines: string[]): TreeNode {
  const root: TreeNode = { name: ".", isFile: false, children: [] };
  const stack: { depth: number; node: TreeNode }[] = [{ depth: -1, node: root }];

  for (const line of lines) {
    const match = line.match(/^([│\s]*)(├── |└── )(.+)$/);
    if (!match) continue;

    const prefix = match[1];
    const name = match[3].trim();
    const depth = Math.floor(prefix.replaceAll("│", " ").length / 4) + 1;

    const node: TreeNode = {
      name,
      isFile: hasExtension(name),
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1]?.node;
    if (!parent) continue;

    parent.children.push(node);
    stack.push({ depth, node });
  }

  return root;
}