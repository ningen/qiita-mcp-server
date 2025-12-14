/**
 * HTTP Server Setup
 *
 * Sets up the HTTP server with SSE support for MCP and Hono routes.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Hono } from "hono";
import { createServer as createNodeHttpServer } from "http";
import type { Server as HttpServer } from "http";

export interface HttpServerConfig {
  port: number;
}

export function setupHttpServer(
  mcpServer: Server,
  config: HttpServerConfig
): HttpServer {
  const app = new Hono();
  const { port } = config;

  // Health check endpoint
  app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Message endpoint (POST)
  app.post("/message", async (c) => {
    return c.text("OK", 200);
  });

  // Create HTTP server that handles both SSE and Hono routes
  const httpServer = createNodeHttpServer(async (req, res) => {
    // Handle SSE endpoint
    if (req.url === "/sse" && req.method === "GET") {
      console.error("Client connecting via SSE...");
      const transport = new SSEServerTransport("/message", res);
      await mcpServer.connect(transport);
      console.error("Client connected via SSE");
      return;
    }

    // Handle other routes with Hono
    const request = new Request(`http://localhost:${port}${req.url}`, {
      method: req.method,
      headers: req.headers as any,
    });

    const response = await app.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  });

  return httpServer;
}
