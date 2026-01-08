"use client"

import { TextInput } from "@tremor/react"
import type { InputHTMLAttributes } from "react"

interface AtomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function AtomInput({ label, error, helperText, className, ...props }: AtomInputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
      <TextInput {...props} className={`w-full ${className}`} error={!!error} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-slate-500">{helperText}</p>}
    </div>
  )
}
