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
* ⚡ Zero runtime dependencies

## Installation

### Global

```bash
npm install -g treeer
```

### npx

```bash
npx treeer .
```

### Library

```bash
npm install treeer
```

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
-j, --json              Output JSON
-s, --stats             Show statistics
    --no-stats          Hide statistics
-v, --version           Show version
-h, --help              Show help
```

Options can be combined:

```bash
treeer . -i tests,docs -f src -s -o tree.txt
```

## Library

`treeer` can also be used programmatically:

```ts
import {
  scanFileSystem,
  transform,
  printTree,
} from "treeer";

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
* Maximum depth
* Additional output formats
* Git-aware mode
* Changed-files-only mode
* Improved token estimation
