import type { TreeNode } from "./types.js";

export function printTree(
  node: TreeNode,
  prefix = "",
  last = true,
  root = true,
): string[] {
  const result: string[] = [];

  if (!root) {
    result.push(`${prefix}${last ? "└── " : "├── "}${node.name}`);
    prefix += last ? "    " : "│   ";
  }

  node.children.forEach((child, index) => {
    result.push(...printTree(child, prefix, index === node.children.length - 1, false));
  });

  return result;
}