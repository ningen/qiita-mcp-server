import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Zod schemas for validation with descriptions
export const SearchItemsSchema = z.object({
  query: z.string().optional().describe("Search query (optional)"),
  page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(1)
    .describe("Page number (1-100, default: 1)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Items per page (1-100, default: 20)"),
});

export const GetItemSchema = z.object({
  item_id: z.string().describe("Article ID"),
});

export const GetItemsByTagSchema = z.object({
  tag_id: z.string().describe("Tag ID (e.g., 'Python', 'JavaScript')"),
  page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(1)
    .describe("Page number (1-100, default: 1)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Items per page (1-100, default: 20)"),
});

export const GetItemsByUserSchema = z.object({
  user_id: z.string().describe("User ID"),
  page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(1)
    .describe("Page number (1-100, default: 1)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Items per page (1-100, default: 20)"),
});

export const GetTagsSchema = z.object({
  page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(1)
    .describe("Page number (1-100, default: 1)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Items per page (1-100, default: 20)"),
  sort: z
    .enum(["count", "name"])
    .optional()
    .default("count")
    .describe("Sort order: 'count' (by item count) or 'name' (default: 'count')"),
});

export const GetItemCommentsSchema = z.object({
  item_id: z.string().describe("Article ID"),
});

export const GetUserStocksSchema = z.object({
  user_id: z.string().describe("User ID"),
  page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(1)
    .describe("Page number (1-100, default: 1)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Items per page (1-100, default: 20)"),
});

// Type definitions
export type SearchItemsParams = z.infer<typeof SearchItemsSchema>;
export type GetItemParams = z.infer<typeof GetItemSchema>;
export type GetItemsByTagParams = z.infer<typeof GetItemsByTagSchema>;
export type GetItemsByUserParams = z.infer<typeof GetItemsByUserSchema>;
export type GetTagsParams = z.infer<typeof GetTagsSchema>;
export type GetItemCommentsParams = z.infer<typeof GetItemCommentsSchema>;
export type GetUserStocksParams = z.infer<typeof GetUserStocksSchema>;

// Helper function to convert Zod schema to MCP tool input schema
function zodToMcpSchema(schema: z.ZodType<any>): any {
  const jsonSchema = zodToJsonSchema(schema, { $refStrategy: "none" });
  // Remove $schema field as MCP doesn't need it
  const { $schema, ...rest } = jsonSchema as any;
  return rest;
}

// Tool definitions generated from Zod schemas
export const tools: Tool[] = [
  {
    name: "search_items",
    description:
      "Search Qiita articles. You can search with a query string or get recent articles without a query.",
    inputSchema: zodToMcpSchema(SearchItemsSchema),
  },
  {
    name: "get_item",
    description: "Get a specific Qiita article by its ID.",
    inputSchema: zodToMcpSchema(GetItemSchema),
  },
  {
    name: "get_items_by_tag",
    description: "Get Qiita articles with a specific tag.",
    inputSchema: zodToMcpSchema(GetItemsByTagSchema),
  },
  {
    name: "get_items_by_user",
    description: "Get articles written by a specific user.",
    inputSchema: zodToMcpSchema(GetItemsByUserSchema),
  },
  {
    name: "get_tags",
    description: "Get a list of tags used in Qiita.",
    inputSchema: zodToMcpSchema(GetTagsSchema),
  },
  {
    name: "get_item_comments",
    description: "Get comments on a specific article.",
    inputSchema: zodToMcpSchema(GetItemCommentsSchema),
  },
  {
    name: "get_user_stocks",
    description: "Get articles that a user has stocked (bookmarked).",
    inputSchema: zodToMcpSchema(GetUserStocksSchema),
  },
];
