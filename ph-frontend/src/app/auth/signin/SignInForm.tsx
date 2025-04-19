"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthContext";
import apiClient from "@/lib/apiClient";

export default function SignInForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Get callbackUrl from URL if available
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Handle forced cookie clearing if specified in URL
  useEffect(() => {
    const forceClear = searchParams.get("forceClear");
    if (forceClear === "true") {
      console.log("Force clearing auth cookies and state");

      // Brutally clear all auth data
      try {
        // Try multiple approaches to clear the auth cookie
        const TOKEN_KEY = 'ph_auth_token';

        // 1. Clear localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('ph_user_data');

        // 2. Clear cookies on all paths
        const paths = ['/', '/auth', '/dashboard', '/profile', '/templates', '/auth/signin', '/auth/signup'];
        paths.forEach(path => {
          document.cookie = `${TOKEN_KEY}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
        });

        // 3. Double-check by calling the API client's clearAuthData
        apiClient.clearAuthData();

        // Remove the forceClear parameter from URL to prevent repeat clearing
        const url = new URL(window.location.href);
        url.searchParams.delete("forceClear");
        window.history.replaceState({}, "", url.toString());

        console.log("Auth state forcibly cleared");
      } catch (error) {
        console.error("Error during force clear:", error);
      }
    }
  }, [searchParams]);

  // Debug auth state on component mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Check if debugAuthState function exists before calling it
      if (apiClient.debugAuthState) {
        try {
          const authState = apiClient.debugAuthState();
          console.log("SignInForm - Auth State:", authState);
        } catch (error) {
          console.error("Error checking auth state:", error);
        }
      } else {
        console.log("SignInForm - Auth State: debugAuthState function not available");
      }
    }
  }, []);

  // If already authenticated, redirect to dashboard or callback
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to:", callbackUrl);
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clear any existing auth data to ensure a clean login
      apiClient.logout();

      // Log the user in
      await login(email, password);

      // Show success message
      toast.success("Signed in successfully");

      // Wait a moment to ensure cookies are set before redirecting
      setTimeout(() => {
        // Force a hard navigation to ensure middleware picks up the new auth state
        console.log("Login successful, redirecting to:", callbackUrl);
        window.location.href = callbackUrl;
      }, 100);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during sign in";
      toast.error(message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </>
  );
}
