export interface TreeNode {
  name: string;
  isFile: boolean;
  children: TreeNode[];
}

export interface TreeStats {
  files: number;
  directories: number;
  originalLines: number;
  outputLines: number;
  originalTokens: number;
  outputTokens: number;
  reductionPercent: number;
}