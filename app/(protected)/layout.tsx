"use client"

import { useIsAuthenticated } from "@azure/msal-react"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  const isAuthenticated = useIsAuthenticated()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
