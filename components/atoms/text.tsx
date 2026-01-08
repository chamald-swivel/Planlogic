"use client"

import { Text as TremorText } from "@tremor/react"
import type { ReactNode } from "react"

interface AtomTextProps {
  children: ReactNode
  variant?: "body" | "caption" | "subtitle"
  className?: string
}

export function AtomText({ children, variant = "body", className }: AtomTextProps) {
  const variantClasses = {
    body: "text-base text-slate-700",
    caption: "text-sm text-slate-600",
    subtitle: "text-lg font-semibold text-slate-800",
  }

  return <TremorText className={`${variantClasses[variant]} ${className}`}>{children}</TremorText>
}
