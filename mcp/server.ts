#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  applyFocus,
  formatStats,
  getStats,
  isTreeText,
  parseTree,
  printTree,
  scanFileSystem,
  transform,
} from "../core/index.js";
import { DEFAULT_IGNORED_DIRS } from "../core/constants.js";
import type { TreeNode } from "../core/types.js";

const server = new McpServer({
  name: "treeer",
  version: "1.0.3",
});

server.registerTool(
  "treeer",
  {
    description: "Generate an AI-optimized project tree from a file, directory, or tree text.",
    inputSchema: {
      input: z.string().describe("Path to a file or directory, or tree text to parse."),
      focus: z.string().optional().describe("Path within the tree to return."),
      ignore: z.array(z.string()).optional().describe("Directory names to ignore in addition to defaults."),
      json: z.boolean().optional().describe("Return the tree as JSON instead of text."),
      stats: z.boolean().optional().describe("Append AI token and reduction statistics."),
    },
  },
  async ({ input, focus, ignore, json, stats }) => {
    try {
      const ignoredDirs = new Set(DEFAULT_IGNORED_DIRS);
      for (const directory of ignore ?? []) ignoredDirs.add(directory);

      let original = "";
      let tree: TreeNode;

      if (fs.existsSync(input)) {
        const fileStats = fs.statSync(input);
        if (fileStats.isDirectory()) {
          tree = scanFileSystem(input, ignoredDirs);
          original = printTree(tree).join("\n");
        } else {
          original = fs.readFileSync(input, "utf8");
          tree = isTreeText(original)
            ? parseTree(original.split(/\r?\n/))
            : { name: path.basename(input), isFile: true, children: [] };
        }
      } else if (isTreeText(input)) {
        original = input;
        tree = parseTree(input.split(/\r?\n/));
      } else {
        throw new Error(`Target does not exist: ${input}`);
      }

      tree = applyFocus(tree, focus);
      if (!tree.isFile) transform(tree);

      let result = json
        ? JSON.stringify(tree, null, 2)
        : tree.isFile ? tree.name : printTree(tree).join("\n");

      if (stats) result += formatStats(getStats(original, result, tree));

      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        }],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);