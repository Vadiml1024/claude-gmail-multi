import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools.js';

// stdout is the JSON-RPC channel — all diagnostics must go to stderr (console.error).
const server = new McpServer({ name: 'gmail-multi', version: '0.1.0' });
registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('gmail-multi MCP server running (stdio)');
