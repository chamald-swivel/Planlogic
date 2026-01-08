/**
 * Application Configuration
 * Centralized configuration constants
 */

export const APP_CONFIG = {
  // App metadata
  name: "Modern Dashboard",
  version: "1.0.0",
  description: "A modern dashboard with Microsoft AD SSO",

  // Authentication
  auth: {
    redirectUri: process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI || "http://localhost:3000",
    scopes: ["user.read"],
    silentRequestTimeout: 3000,
  },

  // API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    timeout: 30000,
  },

  // Routes
  routes: {
    login: "/login",
    home: "/home",
    root: "/",
  },

  // Feature flags
  features: {
    microsoftSSO: true,
    darkMode: true,
    notifications: true,
  },
}
