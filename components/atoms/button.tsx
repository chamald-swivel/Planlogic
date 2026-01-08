"use client"

import { Button } from "@tremor/react"
import type { ReactNode } from "react"

interface AtomButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "destructive"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AtomButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className,
}: AtomButtonProps) {
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
  }

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        rounded-lg font-medium transition-colors duration-200
      `}
    >
      {children}
    </Button>
  )
}
