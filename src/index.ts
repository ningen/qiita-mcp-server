#!/usr/bin/env node

/**
 * Qiita MCP Server
 *
 * Entry point for the server.
 * Coordinates the setup of all layers.
 */

import { createQiitaClientFromEnv } from "./api/qiita.js";
import { ToolHandlers } from "./handlers/tools.js";
import { createMcpServer } from "./server/mcp.js";
import { setupHttpServer } from "./server/http.js";

async function main() {
  // Layer 1: API Client (external dependency)
  const qiitaClient = createQiitaClientFromEnv();

  // Layer 2: Business Logic (pure handlers)
  const toolHandlers = new ToolHandlers(qiitaClient);

  // Layer 3: MCP Server (protocol layer)
  const mcpServer = createMcpServer(toolHandlers);

  // Layer 4: HTTP Server (transport layer)
  const port = Number(process.env.PORT) || 3000;
  const httpServer = setupHttpServer(mcpServer, { port });

  // Start the server
  httpServer.listen(port, () => {
    console.error(`Qiita MCP Server running on http://localhost:${port}`);
    console.error(`SSE endpoint: http://localhost:${port}/sse`);
    console.error(`Health check: http://localhost:${port}/health`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
