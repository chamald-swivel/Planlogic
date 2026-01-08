// Root redirect page - handles unauthenticated users
"use client"

import { useIsAuthenticated } from "@azure/msal-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RootPage() {
  const isAuthenticated = useIsAuthenticated()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home")
    } else {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  return null
}
