# treeer MCP server

The MCP server exposes the treeer CLI workflow through one `treeer` tool.

## Run

```sh
npm run build
npm run mcp
```

Configure an MCP client to start `node` with `dist/mcp/server.js` from this project.

The tool accepts a file or directory path, tree text, an optional focus path, extra ignored directory names, an optional positive integer `level` depth limit, JSON output, and AI statistics.
