# Equalizing the User Interface MCP plugin

One local **TypeScript/Node.js MCP server over stdio** with two tools:

- `figma_extract_design_tokens` — read a Figma file and return solid-fill colors and text styles observed in its document tree.
- `ui_generate_contract` — return a provider-neutral TypeScript message/status/provider contract, including async streaming and cancellation.

The server is read-only: it does not edit Figma, write generated files, call AI providers, or change application UI. Review extracted values against the source design before using them as design tokens; this MVP extracts observed values, not Figma Variables collections.

## Requirements and run

- Node.js 20+
- A Figma personal access token with access to the target file for the Figma tool.

```sh
cd mcp
npm install
npm test
npm run build
FIGMA_ACCESS_TOKEN=your_token npm start
```

Set `FIGMA_ACCESS_TOKEN` in the MCP client's server environment instead of committing it. The server never prints the token. To use only contract generation, the token is not required until the Figma tool is called.

## Client setup

Build first and substitute the absolute path to this repository's `mcp/dist/server.js` for `/absolute/path/to/repo/mcp/dist/server.js`. Configure the environment variable using your client's secure/local settings. These are illustrative stdio configurations; consult the client version's documentation for exact file locations and schema.

### Claude Desktop / Cursor / VS Code

The common `mcpServers` shape is:

```json
{
  "mcpServers": {
    "equalizing-the-user-interface": {
      "command": "node",
      "args": ["/absolute/path/to/repo/mcp/dist/server.js"],
      "env": { "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}" }
    }
  }
}
```

For VS Code, use the configuration location and `servers`/`mcpServers` schema supported by your installed version; workspace configurations commonly live in `.vscode/mcp.json`. Do not check real tokens into workspace settings.

### OpenCode

Use the installed version's MCP config format; an illustrative local server entry is:

```json
{
  "mcp": {
    "equalizing-the-user-interface": {
      "type": "local",
      "command": ["node", "/absolute/path/to/repo/mcp/dist/server.js"],
      "environment": { "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}" },
      "enabled": true
    }
  }
}
```

### Codex

In the Codex MCP TOML configuration, use an entry equivalent to:

```toml
[mcp_servers.equalizing-the-user-interface]
command = "node"
args = ["/absolute/path/to/repo/mcp/dist/server.js"]

[mcp_servers.equalizing-the-user-interface.env]
FIGMA_ACCESS_TOKEN = "${FIGMA_ACCESS_TOKEN}"
```

### Gemini CLI

Use the Gemini CLI MCP server configuration format supported by your version. An illustrative JSON entry is:

```json
{
  "mcpServers": {
    "equalizing-the-user-interface": {
      "command": "node",
      "args": ["/absolute/path/to/repo/mcp/dist/server.js"],
      "env": { "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}" }
    }
  }
}
```

Client config formats and environment-variable interpolation differ by product/version. If interpolation is unsupported, use the client's secret/environment mechanism or launch it with the variable already set; do not put a real token in committed config.

## Tool behavior and limitations

- Figma API requests use `GET https://api.figma.com/v1/files/{file_key}` with `X-Figma-Token`; requests time out after 15 seconds.
- Solid fills and text style properties present in the returned document tree are extracted. Gradients, component variables, and Figma Variables endpoints are not currently handled.
- The contract tool returns source text only. Save/review it yourself and adapt it to the existing UI; the tool intentionally does not write into projects.
- API token permissions and file access are controlled by Figma. No provider AI credentials are used.

## Development

```sh
npm test
```

Tests cover document traversal, token validation, the Figma auth header, and generated contract essentials.
