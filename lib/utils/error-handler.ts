/**
 * Error Handler Utility
 * Centralized error handling and formatting
 */

export class ErrorHandler {
  /**
   * Handle and format API errors
   */
  static handleApiError(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    if (error?.message) {
      return error.message
    }
    return "An unexpected error occurred"
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any): string {
    const errorCode = error?.errorCode

    switch (errorCode) {
      case "user_cancelled":
        return "Sign in was cancelled"
      case "access_denied":
        return "Access denied. Please check your credentials"
      case "unknown_error":
        return "An unknown error occurred during authentication"
      default:
        return this.handleApiError(error)
    }
  }

  /**
   * Create error response object
   */
  static createErrorResponse(message: string, statusCode = 500) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Log error safely
   */
  static logError(error: any, context = ""): void {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}]` : ""
    console.error(`${timestamp} ${contextStr}`, error)
  }
}
