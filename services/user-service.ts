import type { AccountInfo } from "@azure/msal-browser"

/**
 * User Service
 * Handles user profile and related operations
 */

export interface UserProfile {
  id: string
  email: string
  name: string
  lastLogin?: Date
}

export class UserService {
  /**
   * Get user profile from account
   */
  static async getUserProfile(account: AccountInfo): Promise<UserProfile> {
    return {
      id: account.homeAccountId,
      email: account.username,
      name: account.name || "User",
      lastLogin: new Date(),
    }
  }

  /**
   * Update user profile (stub for future API integration)
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    // TODO: Implement API call to update user profile
    console.log("Updating user profile:", userId, updates)
    return { id: userId } as UserProfile
  }

  /**
   * Get user preferences (stub for future API integration)
   */
  static async getUserPreferences(userId: string) {
    // TODO: Implement API call to fetch user preferences
    return {
      theme: "light",
      notifications: true,
      language: "en",
    }
  }
}
