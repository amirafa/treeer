# treeer

> An AI-friendly project tree generator.

`treeer` converts a directory, file, or existing tree output into a representation of your project structure.

It reduces repetitive filenames while preserving important files and directory structure, making the result easier and cheaper for AI agents to process.

## Features

* 📁 Directory and file input
* 🌳 Existing tree-file input
* 🤖 AI-friendly tree transformation
* 📦 Groups repetitive files by type
* 🔑 Preserves important files
* 🚫 Configurable ignored directories
* 🎯 Focus on a specific path
* 📊 Token/reduction estimates
* 🧾 JSON output
* 💾 Output to a file
* 📚 TypeScript/JavaScript API
* 🔌 MCP server for AI clients

## Installation

### Global

```bash
npm install -g @amirafa/treeer
```

### npx

```bash
npx @amirafa/treeer .
```

### Library

```bash
npm install @amirafa/treeer
```

### MCP server

Run the published MCP server without installing it globally:

```bash
npx --yes --package=@amirafa/treeer treeer-mcp
```

Or install the package globally:

```bash
npm install -g @amirafa/treeer
treeer-mcp
```

The package includes the MCP SDK and `zod` as runtime dependencies.

## Usage

```bash
treeer .
```

Directory:

```bash
treeer ./src
```

Single file:

```bash
treeer ./src/file.ts
```

Existing tree file:

```bash
treeer tree.txt
```

## Example

Before:

```text
.
├── src
│   ├── components
│   │   ├── Button.ext
│   │   ├── Card.ext
│   │   ├── Modal.ext
│   │   └── Input.ext
│   ├── utils
│   │   ├── format.ext
│   │   └── validate.ext
│   └── index.ext
└── config.ext
```

After:

```text
.
├── src
│   ├── components
│   │   └── *.ext (4 files)
│   ├── utils
│   │   └── *.ext (2 files)
│   └── index.ext
└── config.ext
```

This keeps the project structure while removing repetitive filenames.

## Important Files

`treeer` preserves files that are likely to provide useful architectural context.

Common patterns include:

```text
index.*
app.*
main.*
router.*
layout.*
middleware.*
```

It also preserves common configuration and project metadata files.

## Ignoring Directories

Common generated and dependency directories are ignored automatically.

Add your own directories with:

```bash
treeer . --ignore tests,docs,mocks
```

or:

```bash
treeer . -i tests,docs,mocks
```

## Focus

Process only a specific part of a project:

```bash
treeer . --focus src/components
```

or:

```bash
treeer . -f src/components
```

## Depth

Limit output to a number of levels below the selected root. Depth `1` shows its
immediate contents; this is applied after `--focus`, if provided.

```bash
treeer . -l 2
treeer . --level 2 --focus src
```

## Output

Write the result to a file:

```bash
treeer . --output tree.txt
```

or:

```bash
treeer . -o tree.txt
```

## JSON

Generate structured output:

```bash
treeer . --json
```

Save it:

```bash
treeer . --json -o tree.json
```

## Statistics

Show estimated context reduction:

```bash
treeer . --stats
```

Example:

```text
AI Stats
────────
Files:              184
Directories:         31
Original tokens:  ~18,400
Output tokens:     ~1,200
Reduction:           93.5%
```

Token counts are estimates and may vary depending on the AI model.

## CLI Options

```text
treeer <file|directory|tree.txt> [options]

-o, --output <file>     Write output to a file
-f, --focus <path>      Focus on a specific path
-i, --ignore <dirs>     Ignore comma-separated directories
-l, --level <depth>     Limit the tree to this depth
-j, --json              Output JSON
-s, --stats             Show statistics
    --no-stats          Hide statistics
-v, --version           Show version
-h, --help              Show help
```

Options can be combined:

```bash
treeer . -i tests,docs -f src -l 2 -s -o tree.txt
```

## MCP

Configure an MCP client to launch the server with:

```json
{
  "mcpServers": {
    "treeer": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=@amirafa/treeer",
        "treeer-mcp"
      ]
    }
  }
}
```

The server exposes a `treeer` tool with these inputs:

```json
{
  "input": ".",
  "focus": "src",
  "ignore": ["tests", "docs"],
  "level": 2,
  "json": false,
  "stats": true
}
```

`input` can be a file path, directory path, or tree text. Paths are resolved from the MCP client's working directory.

### Use in a project

Create `.vscode/mcp.json` in the project where you want your agent to use treeer:

```json
{
  "servers": {
    "treeer": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=@amirafa/treeer",
        "treeer-mcp"
      ],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

After opening the project in VS Code, start the `treeer` server from the MCP server list. Your agent can then use the `treeer` tool with the project as its working directory:

```text
Use the treeer MCP tool to analyze this project with JSON output and statistics.
```

## Library

`treeer` can also be used programmatically:

```ts
import {
  scanFileSystem,
  transform,
  printTree,
} from "@amirafa/treeer";

const tree = scanFileSystem("./src");

transform(tree);

console.log(printTree(tree).join("\n"));
```

## Why treeer?

Large repositories can contain thousands of files, while AI agents often only need to understand the project's structure.

Instead of:

```text
directory/
├── file-a.ext
├── file-b.ext
├── file-c.ext
├── file-d.ext
├── file-e.ext
└── ...
```

`treeer` can represent it as:

```text
directory/
└── *.ext (many files)
```

Important files and directories remain visible while repetitive information is reduced.

The result uses less context and is easier for AI agents to process.

## Roadmap

* `.gitignore` support
* Configuration file
* Custom grouping rules
* Custom important-file patterns
* Additional output formats
* Git-aware mode
* Changed-files-only mode
* Improved token estimation

## Changelog

### Unreleased

- Add `-l` / `--level <depth>` to limit CLI tree output depth.
- Add the optional `level` input to the MCP `treeer` tool.

### 1.0.3 — 2026-08-15

- Add an MCP server powered by the treeer core functions.
- Add the published `treeer-mcp` executable for MCP clients.
- Document project-local VS Code MCP configuration and usage.

### 1.0.2 — 2026-08-09

- Fix: Handle missing filesystem targets during scanning to avoid crashing on ENOENT (broken symlinks or removed files).
