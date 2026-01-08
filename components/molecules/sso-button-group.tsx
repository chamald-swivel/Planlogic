"use client"

import { AtomButton } from "@/components/atoms/button"
import { RiMicrosoftFill } from "@remixicon/react"

interface SSOButtonGroupProps {
  onMicrosoftClick: () => Promise<void> | void
  isLoading?: boolean
}

export function SSOButtonGroup({ onMicrosoftClick, isLoading }: SSOButtonGroupProps) {
  return (
    <div className="space-y-3 w-full">
      <AtomButton
        onClick={onMicrosoftClick}
        disabled={isLoading}
        variant="secondary"
        size="md"
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <RiMicrosoftFill className="w-5 h-5" />
            Sign in with Microsoft
          </>
        )}
      </AtomButton>
    </div>
  )
}
