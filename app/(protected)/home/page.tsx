"use client"

import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { type UserProfile, UserService } from "@/services"
import WelcomeSection from "@/components/templates/welcome-template"

export default function HomePage() {
  const isAuthenticated = useIsAuthenticated()
  const { accounts } = useMsal()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadUserProfile = async () => {
      try {
        if (accounts.length > 0) {
          const profile = await UserService.getUserProfile(accounts[0])
          setUserProfile(profile)
        }
      } catch (error) {
        console.error("Failed to load user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [isAuthenticated, accounts, router])

  if (!isAuthenticated || loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <WelcomeSection userProfile={userProfile} />
      </div>
    </div>
  )
}
