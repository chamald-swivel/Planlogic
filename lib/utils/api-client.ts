/**
 * API Client Utility
 * Centralized API request handling
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  statusCode: number
}

export class ApiClient {
  /**
   * GET request
   */
  static async get<T = any>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      method: "GET",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })
    return this.handleResponse(response)
  }

  /**
   * POST request
   */
  static async post<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse(response)
  }

  /**
   * Handle API response
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }
}
