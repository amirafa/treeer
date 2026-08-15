import path from "node:path";
import type { TreeNode } from "./types.js";
import { ASSET_EXTENSIONS, IMPORTANT_FILES, KEEP_PATTERN } from "./constants.js";

function isImportantFile(name: string): boolean {
  return IMPORTANT_FILES.has(name) || KEEP_PATTERN.test(name);
}

export function transform(node: TreeNode, isRoot = true): void {
  if (node.isFile) return;

  const remove = new Set<TreeNode>();
  const groups = new Map<string, TreeNode[]>();
  const assets = new Map<string, number>();

  for (const child of node.children) {
    if (!child.isFile || isRoot || isImportantFile(child.name)) continue;

    const ext = path.extname(child.name);

    if (ASSET_EXTENSIONS.has(ext)) {
      assets.set(ext, (assets.get(ext) ?? 0) + 1);
      remove.add(child);
      continue;
    }

    const type = ext.slice(1);
    if (!type) continue;

    const group = groups.get(type) ?? [];
    group.push(child);
    groups.set(type, group);
  }

  for (const [ext, files] of groups) {
    files.forEach((file) => remove.add(file));
    node.children.push({
      name: `*.${ext} (${files.length} files)`,
      isFile: true,
      children: [],
    });
  }

  for (const [ext, count] of assets) {
    node.children.push({
      name: `*${ext} (${count} files)`,
      isFile: true,
      children: [],
    });
  }

  node.children = node.children.filter((child) => !remove.has(child));
  node.children.sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  node.children.forEach((child) => transform(child, false));
}

export function applyFocus(root: TreeNode, focus?: string): TreeNode {
  if (!focus) return root;

  let current = root;
  for (const part of focus.split("/").filter(Boolean)) {
    const next = current.children.find((child) => child.name === part);
    if (!next) throw new Error(`Focus path not found: ${focus}`);
    current = next;
  }
  return current;
}