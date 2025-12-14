#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { Request, Response } from "express";

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

  async searchItems(
    query?: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<any[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (query) {
      params.append("query", query);
    }

    return this.fetch(`/items?${params.toString()}`);
  }

  async getItem(itemId: string): Promise<any> {
    return this.fetch(`/items/${itemId}`);
  }

  async getItemsByTag(
    tagId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<any[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    return this.fetch(`/tags/${tagId}/items?${params.toString()}`);
  }

  async getItemsByUser(
    userId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<any[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    return this.fetch(`/users/${userId}/items?${params.toString()}`);
  }

  async getTags(
    page: number = 1,
    perPage: number = 20,
    sort: string = "count"
  ): Promise<any[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      sort: sort,
    });

    return this.fetch(`/tags?${params.toString()}`);
  }

  async getItemComments(itemId: string): Promise<any[]> {
    return this.fetch(`/items/${itemId}/comments`);
  }

  async getUserStocks(
    userId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<any[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    return this.fetch(`/users/${userId}/stocks?${params.toString()}`);
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

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_items": {
        const result = await qiitaClient.searchItems(
          args?.query as string | undefined,
          args?.page as number | undefined,
          args?.per_page as number | undefined
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_item": {
        if (!args?.item_id) {
          throw new Error("item_id is required");
        }
        const result = await qiitaClient.getItem(args.item_id as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_items_by_tag": {
        if (!args?.tag_id) {
          throw new Error("tag_id is required");
        }
        const result = await qiitaClient.getItemsByTag(
          args.tag_id as string,
          args?.page as number | undefined,
          args?.per_page as number | undefined
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_items_by_user": {
        if (!args?.user_id) {
          throw new Error("user_id is required");
        }
        const result = await qiitaClient.getItemsByUser(
          args.user_id as string,
          args?.page as number | undefined,
          args?.per_page as number | undefined
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_tags": {
        const result = await qiitaClient.getTags(
          args?.page as number | undefined,
          args?.per_page as number | undefined,
          args?.sort as string | undefined
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_item_comments": {
        if (!args?.item_id) {
          throw new Error("item_id is required");
        }
        const result = await qiitaClient.getItemComments(args.item_id as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_user_stocks": {
        if (!args?.user_id) {
          throw new Error("user_id is required");
        }
        const result = await qiitaClient.getUserStocks(
          args.user_id as string,
          args?.page as number | undefined,
          args?.per_page as number | undefined
        );
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

// Start SSE server
async function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  // SSE endpoint
  app.get("/sse", async (req: Request, res: Response) => {
    console.error("Client connecting via SSE...");
    const transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
    console.error("Client connected via SSE");
  });

  // Message endpoint
  app.post("/message", async (req: Request, res: Response) => {
    console.error("Received message from client");
    // The SSEServerTransport handles messages internally
    res.status(200).end();
  });

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.listen(port, () => {
    console.error(`Qiita MCP Server running on http://localhost:${port}`);
    console.error(`SSE endpoint: http://localhost:${port}/sse`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
