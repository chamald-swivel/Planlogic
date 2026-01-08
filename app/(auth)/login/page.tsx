"use client"

import { useMsalAuthentication, useIsAuthenticated } from "@azure/msal-react"
import { InteractionType, InteractionStatus } from "@azure/msal-browser"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LoginTemplate from "@/components/templates/login-template"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const isAuthenticated = useIsAuthenticated()
  const { login, inProgress } = useMsalAuthentication(InteractionType.Redirect, {
    scopes: ["user.read"],
    prompt: "select_account",
  })

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      router.push("/home")
    }
  }, [isAuthenticated, router])

  const handleMicrosoftLogin = async () => {
    try {
      setError(null)
      await login()
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to sign in with Microsoft"
      setError(errorMessage)
      console.error("Microsoft login error:", err)
    }
  }

  const isLoading = inProgress === InteractionStatus.InProgress

  return <LoginTemplate onLoginWithSSO={handleMicrosoftLogin} error={error} isLoading={isLoading} />
}
