#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Hono } from "hono";
import { z } from "zod";

// Zod schemas for validation
const SearchItemsSchema = z.object({
  query: z.string().optional(),
  page: z.number().min(1).max(100).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(20),
});

const GetItemSchema = z.object({
  item_id: z.string(),
});

const GetItemsByTagSchema = z.object({
  tag_id: z.string(),
  page: z.number().min(1).max(100).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(20),
});

const GetItemsByUserSchema = z.object({
  user_id: z.string(),
  page: z.number().min(1).max(100).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(20),
});

const GetTagsSchema = z.object({
  page: z.number().min(1).max(100).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(20),
  sort: z.enum(["count", "name"]).optional().default("count"),
});

const GetItemCommentsSchema = z.object({
  item_id: z.string(),
});

const GetUserStocksSchema = z.object({
  user_id: z.string(),
  page: z.number().min(1).max(100).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(20),
});

// Type definitions
type SearchItemsParams = z.infer<typeof SearchItemsSchema>;
type GetItemParams = z.infer<typeof GetItemSchema>;
type GetItemsByTagParams = z.infer<typeof GetItemsByTagSchema>;
type GetItemsByUserParams = z.infer<typeof GetItemsByUserSchema>;
type GetTagsParams = z.infer<typeof GetTagsSchema>;
type GetItemCommentsParams = z.infer<typeof GetItemCommentsSchema>;
type GetUserStocksParams = z.infer<typeof GetUserStocksSchema>;

// Qiita API Client
class QiitaClient {
  private baseUrl: string;
  private accessToken: string | undefined;

  constructor() {
    const teamName = process.env.QIITA_TEAM;
    this.baseUrl = teamName
      ? `https://${teamName}.qiita.com/api/v2`
      : "https://qiita.com/api/v2";
    this.accessToken = process.env.QIITA_ACCESS_TOKEN;
  }

  private async fetch(endpoint: string): Promise<any> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Qiita API error: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    return response.json();
  }

  async searchItems(params: SearchItemsParams): Promise<any[]> {
    const validated = SearchItemsSchema.parse(params);
    const urlParams = new URLSearchParams({
      page: validated.page.toString(),
      per_page: validated.per_page.toString(),
    });

    if (validated.query) {
      urlParams.append("query", validated.query);
    }

    return this.fetch(`/items?${urlParams.toString()}`);
  }

  async getItem(params: GetItemParams): Promise<any> {
    const validated = GetItemSchema.parse(params);
    return this.fetch(`/items/${validated.item_id}`);
  }

  async getItemsByTag(params: GetItemsByTagParams): Promise<any[]> {
    const validated = GetItemsByTagSchema.parse(params);
    const urlParams = new URLSearchParams({
      page: validated.page.toString(),
      per_page: validated.per_page.toString(),
    });

    return this.fetch(`/tags/${validated.tag_id}/items?${urlParams.toString()}`);
  }

  async getItemsByUser(params: GetItemsByUserParams): Promise<any[]> {
    const validated = GetItemsByUserSchema.parse(params);
    const urlParams = new URLSearchParams({
      page: validated.page.toString(),
      per_page: validated.per_page.toString(),
    });

    return this.fetch(`/users/${validated.user_id}/items?${urlParams.toString()}`);
  }

  async getTags(params: GetTagsParams): Promise<any[]> {
    const validated = GetTagsSchema.parse(params);
    const urlParams = new URLSearchParams({
      page: validated.page.toString(),
      per_page: validated.per_page.toString(),
      sort: validated.sort,
    });

    return this.fetch(`/tags?${urlParams.toString()}`);
  }

  async getItemComments(params: GetItemCommentsParams): Promise<any[]> {
    const validated = GetItemCommentsSchema.parse(params);
    return this.fetch(`/items/${validated.item_id}/comments`);
  }

  async getUserStocks(params: GetUserStocksParams): Promise<any[]> {
    const validated = GetUserStocksSchema.parse(params);
    const urlParams = new URLSearchParams({
      page: validated.page.toString(),
      per_page: validated.per_page.toString(),
    });

    return this.fetch(`/users/${validated.user_id}/stocks?${urlParams.toString()}`);
  }
}

// Tool definitions
const tools: Tool[] = [
  {
    name: "search_items",
    description:
      "Search Qiita articles. You can search with a query string or get recent articles without a query.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (optional)",
        },
        page: {
          type: "number",
          description: "Page number (1-100, default: 1)",
          minimum: 1,
          maximum: 100,
        },
        per_page: {
          type: "number",
          description: "Items per page (1-100, default: 20)",
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: "get_item",
    description: "Get a specific Qiita article by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        item_id: {
          type: "string",
          description: "Article ID",
        },
      },
      required: ["item_id"],
    },
  },
  {
    name: "get_items_by_tag",
    description: "Get Qiita articles with a specific tag.",
    inputSchema: {
      type: "object",
      properties: {
        tag_id: {
          type: "string",
          description: "Tag ID (e.g., 'Python', 'JavaScript')",
        },
        page: {
          type: "number",
          description: "Page number (1-100, default: 1)",
          minimum: 1,
          maximum: 100,
        },
        per_page: {
          type: "number",
          description: "Items per page (1-100, default: 20)",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["tag_id"],
    },
  },
  {
    name: "get_items_by_user",
    description: "Get articles written by a specific user.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "User ID",
        },
        page: {
          type: "number",
          description: "Page number (1-100, default: 1)",
          minimum: 1,
          maximum: 100,
        },
        per_page: {
          type: "number",
          description: "Items per page (1-100, default: 20)",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "get_tags",
    description: "Get a list of tags used in Qiita.",
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "number",
          description: "Page number (1-100, default: 1)",
          minimum: 1,
          maximum: 100,
        },
        per_page: {
          type: "number",
          description: "Items per page (1-100, default: 20)",
          minimum: 1,
          maximum: 100,
        },
        sort: {
          type: "string",
          description: "Sort order: 'count' (by item count) or 'name' (default: 'count')",
          enum: ["count", "name"],
        },
      },
    },
  },
  {
    name: "get_item_comments",
    description: "Get comments on a specific article.",
    inputSchema: {
      type: "object",
      properties: {
        item_id: {
          type: "string",
          description: "Article ID",
        },
      },
      required: ["item_id"],
    },
  },
  {
    name: "get_user_stocks",
    description: "Get articles that a user has stocked (bookmarked).",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "User ID",
        },
        page: {
          type: "number",
          description: "Page number (1-100, default: 1)",
          minimum: 1,
          maximum: 100,
        },
        per_page: {
          type: "number",
          description: "Items per page (1-100, default: 20)",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["user_id"],
    },
  },
];

// Create server instance
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

// Initialize Qiita client
const qiitaClient = new QiitaClient();

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler with Zod validation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_items": {
        const result = await qiitaClient.searchItems((args || {}) as any);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_item": {
        const result = await qiitaClient.getItem((args || {}) as any);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_items_by_tag": {
        const result = await qiitaClient.getItemsByTag((args || {}) as any);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_items_by_user": {
        const result = await qiitaClient.getItemsByUser((args || {}) as any);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_tags": {
        const result = await qiitaClient.getTags((args || {}) as any);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_item_comments": {
        const result = await qiitaClient.getItemComments((args || {}) as any);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_user_stocks": {
        const result = await qiitaClient.getUserStocks((args || {}) as any);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// Start server with Hono and SSE support
async function main() {
  const app = new Hono();
  const port = Number(process.env.PORT) || 3000;
  const { createServer } = await import("http");

  // Health check endpoint
  app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Message endpoint (POST)
  app.post("/message", async (c) => {
    return c.text("OK", 200);
  });

  // Create HTTP server that handles both SSE and Hono routes
  const httpServer = createServer(async (req, res) => {
    // Handle SSE endpoint
    if (req.url === "/sse" && req.method === "GET") {
      console.error("Client connecting via SSE...");
      const transport = new SSEServerTransport("/message", res);
      await server.connect(transport);
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
