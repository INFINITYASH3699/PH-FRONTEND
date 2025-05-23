"use client";

import React from "react";
import { AuthProvider as CustomAuthProvider } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check for existing auth data on initial render when used as a client component
  React.useEffect(() => {
    // Try to get user data from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('ph_user_data');
      const storedToken = localStorage.getItem('ph_auth_token');
    }
  }, []);

  return <CustomAuthProvider>{children}</CustomAuthProvider>;
}
