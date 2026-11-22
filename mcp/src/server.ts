import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fetchFigmaTokens } from './figma.js';
import { generateUiContract } from './contract.js';

const server = new McpServer({ name: 'equalizing-the-user-interface', version: '0.1.0' });

server.registerTool('figma_extract_design_tokens', {
  title: 'Extract Figma design values',
  description: 'Read a Figma file and return observed solid-fill colors and text styles. Requires FIGMA_ACCESS_TOKEN. Read-only; does not modify Figma or UI files.',
  inputSchema: { file_key: z.string().min(1).describe('Figma file key from its URL') }
}, async ({ file_key }) => {
  try {
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;
    if (!accessToken) throw new Error('FIGMA_ACCESS_TOKEN is not configured in the MCP server environment.');
    const tokens = await fetchFigmaTokens(file_key, accessToken);
    return { content: [{ type: 'text', text: JSON.stringify({ fileKey: file_key, count: tokens.length, tokens }, null, 2) }] };
  } catch (error) {
    return { isError: true, content: [{ type: 'text', text: error instanceof Error ? error.message : 'Unexpected Figma integration error.' }] };
  }
});

server.registerTool('ui_generate_contract', {
  title: 'Generate UI contract',
  description: 'Return a provider-neutral TypeScript UI contract for messages, status, streaming, and cancellation. Does not write files or modify existing UI.',
  inputSchema: {}
}, async () => ({ content: [{ type: 'text', text: generateUiContract() }] }));

const transport = new StdioServerTransport();
await server.connect(transport);
