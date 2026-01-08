"use client"

import { Card } from "@tremor/react"
import { AtomText } from "@/components/atoms/text"
import { SSOButtonGroup } from "@/components/molecules/sso-button-group"
import { LoginForm } from "@/components/molecules/login-form"

interface LoginTemplateProps {
  onLoginWithSSO: () => Promise<void> | void
  error?: string | null
  isLoading?: boolean
}

export default function LoginTemplate({ onLoginWithSSO, error, isLoading }: LoginTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="space-y-6 p-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Welcome</h1>
            <AtomText variant="caption" className="text-slate-600">
              Sign in to your account to continue
            </AtomText>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">Sign in failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* SSO Section */}
          <div className="space-y-3">
            <SSOButtonGroup onMicrosoftClick={onLoginWithSSO} isLoading={isLoading} />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-600">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Login */}
          <LoginForm />

          {/* Footer */}
          <p className="text-center text-xs text-slate-600">Protected by Microsoft Azure AD</p>
        </div>
      </Card>
    </div>
  )
}
