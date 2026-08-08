import type { TreeNode, TreeStats } from "./types.js";

function countNodes(node: TreeNode): { files: number; directories: number } {
  let files = node.isFile ? 1 : 0;
  let directories = node.isFile ? 0 : 1;

  for (const child of node.children) {
    const result = countNodes(child);
    files += result.files;
    directories += result.directories;
  }

  return { files, directories };
}

function estimateTokens(text: string): number {
  return Math.max(0, Math.round(text.length / 4));
}

export function getStats(original: string, output: string, tree: TreeNode): TreeStats {
  const counts = countNodes(tree);
  const originalTokens = estimateTokens(original);
  const outputTokens = estimateTokens(output);

  return {
    files: counts.files,
    directories: Math.max(0, counts.directories - 1),
    originalLines: original ? original.split(/\r?\n/).length : 0,
    outputLines: output ? output.split(/\r?\n/).length : 0,
    originalTokens,
    outputTokens,
    reductionPercent: originalTokens === 0
      ? 0
      : Math.max(0, ((originalTokens - outputTokens) / originalTokens) * 100),
  };
}

export function formatStats(stats: TreeStats): string {
  return [
    "",
    "AI Stats",
    "────────",
    `Files:              ${stats.files}`,
    `Directories:        ${stats.directories}`,
    `Original lines:     ${stats.originalLines}`,
    `Output lines:       ${stats.outputLines}`,
    `Original tokens:    ~${stats.originalTokens.toLocaleString()}`,
    `Output tokens:      ~${stats.outputTokens.toLocaleString()}`,
    `Reduction:          ${stats.reductionPercent.toFixed(1)}%`,
  ].join("\n");
}