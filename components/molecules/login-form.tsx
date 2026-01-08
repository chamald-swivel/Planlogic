"use client"

import type React from "react"

import { useState } from "react"
import { AtomInput } from "@/components/atoms/input"
import { AtomButton } from "@/components/atoms/button"

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({ email: "", password: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = { email: "", password: "" }

    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"

    setErrors(newErrors)

    if (!newErrors.email && !newErrors.password && onSubmit) {
      onSubmit(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AtomInput
        label="Email"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <AtomInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <AtomButton type="submit" size="md" className="w-full">
        Sign In
      </AtomButton>
    </form>
  )
}
