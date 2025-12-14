/**
 * MCP Server Setup
 *
 * Sets up the Model Context Protocol server with tool handlers.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { tools } from "../schemas/tools.js";
import { ToolHandlers } from "../handlers/tools.js";

export function createMcpServer(toolHandlers: ToolHandlers): Server {
  const server = new Server(
    {
      name: "qiita-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return await toolHandlers.executeTool(name, args);
  });

  return server;
}
