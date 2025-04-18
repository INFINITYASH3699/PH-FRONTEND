"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient, { User, SocialLinks, UserProfile } from "@/lib/apiClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  updateProfile: (profileData: {
    fullName?: string;
    profilePicture?: string;
    title?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: SocialLinks;
  }) => Promise<User>;
  uploadProfilePicture: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };

    initAuth();
  }, []);

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!apiClient.isAuthenticated()) {
        setUser(null);
        setIsLoading(false);
        return false;
      }

      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const user = await apiClient.login(email, password);
      setUser(user);
      // Navigation is handled in the SignInForm component
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      const user = await apiClient.register(userData);
      setUser(user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    apiClient.logout();
    setUser(null);
    router.push("/auth/signin");
  };

  // Update profile function
  const updateProfile = async (profileData: {
    fullName?: string;
    profilePicture?: string;
    title?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: SocialLinks;
  }): Promise<User> => {
    try {
      const updatedUser = await apiClient.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Upload profile picture function
  const uploadProfilePicture = async (file: File): Promise<string> => {
    try {
      const profilePictureUrl = await apiClient.uploadProfilePicture(file);

      // Update the user's profile picture in state
      if (user) {
        const updatedUser = {
          ...user,
          profilePicture: profilePictureUrl
        };
        setUser(updatedUser);
      }

      return profilePictureUrl;
    } catch (error) {
      console.error("Profile picture upload error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    uploadProfilePicture,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
