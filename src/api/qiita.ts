/**
 * Qiita API Client
 *
 * Pure API client for Qiita and Qiita Team.
 * No business logic - just HTTP requests and responses.
 */

export interface QiitaConfig {
  accessToken?: string;
  teamName?: string;
  baseUrl?: string;
}

export class QiitaClient {
  private readonly baseUrl: string;
  private readonly accessToken?: string;

  constructor(config: QiitaConfig = {}) {
    this.accessToken = config.accessToken;

    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else if (config.teamName) {
      this.baseUrl = `https://${config.teamName}.qiita.com/api/v2`;
    } else {
      this.baseUrl = "https://qiita.com/api/v2";
    }
  }

  /**
   * Generic fetch method for Qiita API
   */
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

  /**
   * Search items
   */
  async searchItems(params: {
    query?: string;
    page?: number;
    per_page?: number;
  }): Promise<any[]> {
    const urlParams = new URLSearchParams();

    if (params.page !== undefined) {
      urlParams.append("page", params.page.toString());
    }
    if (params.per_page !== undefined) {
      urlParams.append("per_page", params.per_page.toString());
    }
    if (params.query) {
      urlParams.append("query", params.query);
    }

    const queryString = urlParams.toString();
    return this.fetch(`/items${queryString ? `?${queryString}` : ""}`);
  }

  /**
   * Get a specific item
   */
  async getItem(itemId: string): Promise<any> {
    return this.fetch(`/items/${itemId}`);
  }

  /**
   * Get items by tag
   */
  async getItemsByTag(params: {
    tagId: string;
    page?: number;
    per_page?: number;
  }): Promise<any[]> {
    const urlParams = new URLSearchParams();

    if (params.page !== undefined) {
      urlParams.append("page", params.page.toString());
    }
    if (params.per_page !== undefined) {
      urlParams.append("per_page", params.per_page.toString());
    }

    const queryString = urlParams.toString();
    return this.fetch(
      `/tags/${params.tagId}/items${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get items by user
   */
  async getItemsByUser(params: {
    userId: string;
    page?: number;
    per_page?: number;
  }): Promise<any[]> {
    const urlParams = new URLSearchParams();

    if (params.page !== undefined) {
      urlParams.append("page", params.page.toString());
    }
    if (params.per_page !== undefined) {
      urlParams.append("per_page", params.per_page.toString());
    }

    const queryString = urlParams.toString();
    return this.fetch(
      `/users/${params.userId}/items${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get tags
   */
  async getTags(params: {
    page?: number;
    per_page?: number;
    sort?: string;
  }): Promise<any[]> {
    const urlParams = new URLSearchParams();

    if (params.page !== undefined) {
      urlParams.append("page", params.page.toString());
    }
    if (params.per_page !== undefined) {
      urlParams.append("per_page", params.per_page.toString());
    }
    if (params.sort) {
      urlParams.append("sort", params.sort);
    }

    const queryString = urlParams.toString();
    return this.fetch(`/tags${queryString ? `?${queryString}` : ""}`);
  }

  /**
   * Get item comments
   */
  async getItemComments(itemId: string): Promise<any[]> {
    return this.fetch(`/items/${itemId}/comments`);
  }

  /**
   * Get user stocks
   */
  async getUserStocks(params: {
    userId: string;
    page?: number;
    per_page?: number;
  }): Promise<any[]> {
    const urlParams = new URLSearchParams();

    if (params.page !== undefined) {
      urlParams.append("page", params.page.toString());
    }
    if (params.per_page !== undefined) {
      urlParams.append("per_page", params.per_page.toString());
    }

    const queryString = urlParams.toString();
    return this.fetch(
      `/users/${params.userId}/stocks${queryString ? `?${queryString}` : ""}`
    );
  }
}

/**
 * Create a Qiita client from environment variables
 */
export function createQiitaClientFromEnv(): QiitaClient {
  return new QiitaClient({
    accessToken: process.env.QIITA_ACCESS_TOKEN,
    teamName: process.env.QIITA_TEAM,
  });
}
