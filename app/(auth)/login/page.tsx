"use client";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginTemplate from "@/components/templates/login-template";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  const handleMicrosoftLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await instance.loginPopup({
        scopes: ["user.read"],
        prompt: "select_account",
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to sign in with Microsoft";
      setError(errorMessage);
      console.error("Microsoft login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginTemplate
      onLoginWithSSO={handleMicrosoftLogin}
      error={error}
      isLoading={isLoading}
    />
  );
}
