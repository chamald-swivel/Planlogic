import type { AccountInfo } from "@azure/msal-browser"

/**
 * Authentication Service
 * Handles all authentication-related operations and API calls
 */

export class AuthService {
  /**
   * Get user info from token claims
   */
  static getUserInfo(account: AccountInfo) {
    return {
      id: account.homeAccountId,
      email: account.username,
      name: account.name,
      localAccountId: account.localAccountId,
    }
  }

  /**
   * Extract scopes from configuration
   */
  static getScopes(): string[] {
    return ["user.read"]
  }

  /**
   * Validate token expiry
   */
  static isTokenValid(expiresOn: number): boolean {
    const now = Date.now() / 1000
    return expiresOn > now + 300 // 5 minute buffer
  }

  /**
   * Format error message
   */
  static formatError(error: any): string {
    if (typeof error === "string") {
      return error
    }
    if (error?.errorCode) {
      return `Error (${error.errorCode}): ${error.errorDescription}`
    }
    if (error?.message) {
      return error.message
    }
    return "An unexpected error occurred"
  }
}
