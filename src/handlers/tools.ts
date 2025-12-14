/**
 * Tool Handlers
 *
 * Pure business logic for handling tool requests.
 * These handlers validate input, call the API, and format responses.
 */

import { QiitaClient } from "../api/qiita.js";
import {
  SearchItemsSchema,
  GetItemSchema,
  GetItemsByTagSchema,
  GetItemsByUserSchema,
  GetTagsSchema,
  GetItemCommentsSchema,
  GetUserStocksSchema,
  type SearchItemsParams,
  type GetItemParams,
  type GetItemsByTagParams,
  type GetItemsByUserParams,
  type GetTagsParams,
  type GetItemCommentsParams,
  type GetUserStocksParams,
} from "../schemas/tools.js";
import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";

export type ToolResult = CallToolResult;

/**
 * Tool handlers registry
 */
export class ToolHandlers {
  constructor(private readonly qiitaClient: QiitaClient) {}

  /**
   * Search items handler
   */
  async searchItems(args: unknown): Promise<ToolResult> {
    const params = SearchItemsSchema.parse(args || {}) as SearchItemsParams;
    const result = await this.qiitaClient.searchItems({
      query: params.query,
      page: params.page,
      per_page: params.per_page,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    };
  }

  /**
   * Get item handler
   */
  async getItem(args: unknown): Promise<ToolResult> {
    const params = GetItemSchema.parse(args || {}) as GetItemParams;
    const result = await this.qiitaClient.getItem(params.item_id);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    };
  }

  /**
   * Get items by tag handler
   */
  async getItemsByTag(args: unknown): Promise<ToolResult> {
    const params = GetItemsByTagSchema.parse(args || {}) as GetItemsByTagParams;
    const result = await this.qiitaClient.getItemsByTag({
      tagId: params.tag_id,
      page: params.page,
      per_page: params.per_page,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    };
  }

  /**
   * Get items by user handler
   */
  async getItemsByUser(args: unknown): Promise<ToolResult> {
    const params = GetItemsByUserSchema.parse(args || {}) as GetItemsByUserParams;
    const result = await this.qiitaClient.getItemsByUser({
      userId: params.user_id,
      page: params.page,
      per_page: params.per_page,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    };
  }

  /**
   * Get tags handler
   */
  async getTags(args: unknown): Promise<ToolResult> {
    const params = GetTagsSchema.parse(args || {}) as GetTagsParams;
    const result = await this.qiitaClient.getTags({
      page: params.page,
      per_page: params.per_page,
      sort: params.sort,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    };
  }

  /**
   * Get item comments handler
   */
  async getItemComments(args: unknown): Promise<ToolResult> {
    const params = GetItemCommentsSchema.parse(args || {}) as GetItemCommentsParams;
    const result = await this.qiitaClient.getItemComments(params.item_id);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    };
  }

  /**
   * Get user stocks handler
   */
  async getUserStocks(args: unknown): Promise<ToolResult> {
    const params = GetUserStocksSchema.parse(args || {}) as GetUserStocksParams;
    const result = await this.qiitaClient.getUserStocks({
      userId: params.user_id,
      page: params.page,
      per_page: params.per_page,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    };
  }

  /**
   * Execute a tool by name
   */
  async executeTool(name: string, args: unknown): Promise<ToolResult> {
    try {
      switch (name) {
        case "search_items":
          return await this.searchItems(args);
        case "get_item":
          return await this.getItem(args);
        case "get_items_by_tag":
          return await this.getItemsByTag(args);
        case "get_items_by_user":
          return await this.getItemsByUser(args);
        case "get_tags":
          return await this.getTags(args);
        case "get_item_comments":
          return await this.getItemComments(args);
        case "get_user_stocks":
          return await this.getUserStocks(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` } as TextContent],
        isError: true,
      };
    }
  }
}
