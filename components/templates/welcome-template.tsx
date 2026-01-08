"use client"

import { Card, Text, Title } from "@tremor/react"
import { AtomButton } from "@/components/atoms/button"
import { useMsal } from "@azure/msal-react"
import type { UserProfile } from "@/services"
import { useRouter } from "next/navigation"

interface WelcomeSectionProps {
  userProfile?: UserProfile | null
}

export default function WelcomeSection({ userProfile }: WelcomeSectionProps) {
  const { instance, accounts } = useMsal()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({
        mainWindowRedirectUri: "/login",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const displayName = userProfile?.name || accounts[0]?.name || "User"
  const displayEmail = userProfile?.email || accounts[0]?.username || ""

  return (
    <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 p-8">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-3">
          <Title className="text-4xl font-bold text-slate-900">Welcome back, {displayName}! 👋</Title>
          <Text className="text-lg text-slate-700">{displayEmail}</Text>
        </div>

        {/* Description */}
        <p className="text-slate-700 text-base leading-relaxed">
          You have successfully logged in to your dashboard. You can now access all features and manage your account.
        </p>

        {/* Quick Stats (Placeholder) */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 font-medium">Last Login</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">Today</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 font-medium">Status</p>
            <p className="text-lg font-semibold text-green-600 mt-1">Active</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 font-medium">Account</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">Premium</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <AtomButton variant="primary" size="md">
            Explore Dashboard
          </AtomButton>
          <AtomButton onClick={handleLogout} variant="secondary" size="md">
            Sign Out
          </AtomButton>
        </div>
      </div>
    </Card>
  )
}
