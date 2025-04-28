"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

// Define types
export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  [key: string]: string | undefined;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  profile?: {
    title?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: SocialLinks;
  };
  createdAt?: string;
  updatedAt?: string;
}

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
  getAuthCookieInfo: () => { exists: boolean, length: number };
}

// Helper function to check for cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const isAuthed = await checkAuth();
        if (isMounted) {
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      }
    };

    initAuth();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
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

      // Normalize user data - handle case where API returns 'id' instead of '_id'
      let normalizedUser = { ...currentUser };
      if (!normalizedUser._id && normalizedUser.id) {
        normalizedUser._id = normalizedUser.id;
        // Optionally delete the id property if not needed
        // delete normalizedUser.id;
      }

      setUser(normalizedUser);

      // Store user data in localStorage as a backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('ph_user_data', JSON.stringify(normalizedUser));
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Get auth cookie info for debugging
  const getAuthCookieInfo = (): { exists: boolean, length: number } => {
    const TOKEN_KEY = "ph_auth_token";
    const cookie = getCookie(TOKEN_KEY);
    return {
      exists: !!cookie,
      length: cookie?.length || 0
    };
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Try using both paths for login to handle different apiClient structures
      let response;
      if (apiClient.auth && typeof apiClient.auth.login === 'function') {
        response = await apiClient.auth.login(email, password);
      } else if (typeof apiClient.login === 'function') {
        response = await apiClient.login(email, password);
      } else {
        throw new Error('Login function not available');
      }

      if (response && response.user) {
        // Normalize user data - handle case where API returns 'id' instead of '_id'
        const normalizedUser = { ...response.user };
        if (!normalizedUser._id && normalizedUser.id) {
          normalizedUser._id = normalizedUser.id;
        }

        setUser(normalizedUser);

        // Store user data in localStorage as a backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('ph_user_data', JSON.stringify(normalizedUser));
        }
      } else {
        console.error("Login response is missing user data:", response);
      }
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
      let response;
      if (apiClient.auth && typeof apiClient.auth.register === 'function') {
        response = await apiClient.auth.register(userData);
      } else {
        throw new Error('Register function not available');
      }

      if (response && response.user) {
        // Normalize user data - handle case where API returns 'id' instead of '_id'
        const normalizedUser = { ...response.user };
        if (!normalizedUser._id && normalizedUser.id) {
          normalizedUser._id = normalizedUser.id;
        }
        setUser(normalizedUser);
        // Store user data in localStorage as a backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('ph_user_data', JSON.stringify(normalizedUser));
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {

    // First clear the auth data from the API client
    if (apiClient.auth && typeof apiClient.auth.logout === 'function') {
      apiClient.auth.logout();
    } else if (typeof apiClient.logout === 'function') {
      apiClient.logout();
    }

    // Clear the user state
    setUser(null);

    // Remove user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ph_user_data');
    }

    // For a clean logout, redirect directly to the signin page with a special flag
    // that forces cookie clearing
    window.location.href = "/auth/signin";
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
      let updatedUser;
      if (apiClient.user && typeof apiClient.user.updateProfile === 'function') {
        const response = await apiClient.user.updateProfile(profileData);
        updatedUser = response.user;
      } else {
        // Mock update for demo
        updatedUser = {
          ...user as User,
          ...profileData,
          profile: {
            ...(user?.profile || {}),
            title: profileData.title || user?.profile?.title,
            bio: profileData.bio || user?.profile?.bio,
            location: profileData.location || user?.profile?.location,
            website: profileData.website || user?.profile?.website,
            socialLinks: profileData.socialLinks || user?.profile?.socialLinks,
          }
        };
      }

      // Normalize user data - handle case where API returns 'id' instead of '_id'
      if (updatedUser && !updatedUser._id && updatedUser.id) {
        updatedUser._id = updatedUser.id;
      }

      setUser(updatedUser);

      // Store updated user data in localStorage as a backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('ph_user_data', JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Upload profile picture function
  const uploadProfilePicture = async (file: File): Promise<string> => {
    try {
      // Use the cloudinary client-side upload
      const { uploadFileToCloudinary } = await import('@/lib/cloudinary');
      const result = await uploadFileToCloudinary(file);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload profile picture');
      }

      const profilePictureUrl = result.url;

      // Update the user's profile picture in state
      if (user) {
        const updatedUser = {
          ...user,
          profilePicture: profilePictureUrl
        };
        setUser(updatedUser);

        if (typeof window !== 'undefined') {
          localStorage.setItem('ph_user_data', JSON.stringify(updatedUser));
        }
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
    getAuthCookieInfo,
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
