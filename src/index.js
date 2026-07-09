#!/usr/bin/env node
// roost-mcp · MCP stdio server wrapping roost-sdk · MIT · AI-Native Solutions
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'roost-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

const TOOLS = [
  { name: 'roost_ping', description: 'Sanity ping', inputSchema: { type: 'object' }, handler: async () => ({ ok: true, tool: 'roost' }) }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ handler, ...rest }) => rest)
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const t = TOOLS.find(x => x.name === req.params.name);
  if (!t) throw new Error('unknown tool: ' + req.params.name);
  const result = await t.handler(req.params.arguments || {});
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});

await server.connect(new StdioServerTransport());
console.error('roost-mcp v1.0.0 · stdio ready');
