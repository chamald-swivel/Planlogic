"use client";

import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/auth/msal-config";
import type { ReactNode } from "react";

interface MsalProviderProps {
  children: ReactNode;
}

/**
 * MSAL Provider Component
 * Wraps the application with Microsoft Authentication Library context
 */
export default function MsalProvider({ children }: MsalProviderProps) {
  return (
    <MsalReactProvider instance={msalInstance}>{children}</MsalReactProvider>
  );
}
