"use client"

import { Card as TremorCard } from "@tremor/react"
import type { ReactNode } from "react"

interface AtomCardProps {
  children: ReactNode
  className?: string
  variant?: "default" | "elevated"
}

export function AtomCard({ children, className, variant = "default" }: AtomCardProps) {
  const variantClasses = {
    default: "bg-white border border-slate-200",
    elevated: "bg-white shadow-lg border border-slate-200",
  }

  return <TremorCard className={`${variantClasses[variant]} ${className}`}>{children}</TremorCard>
}
