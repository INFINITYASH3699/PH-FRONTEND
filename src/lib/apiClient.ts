import { toast } from "sonner";

// API base URL - use environment variable or default to localhost
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Storage keys
const TOKEN_KEY = "ph_auth_token";
const USER_KEY = "ph_user_data";

// Interface for common API response
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// User interface
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
}

// Auth related interfaces
interface LoginResponse extends ApiResponse<any> {
  token: string;
  user: User;
}

interface RegisterResponse extends ApiResponse<any> {
  token: string;
  user: User;
}

// Get stored token
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

// Get stored user
export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Set auth data
export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Clear auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// For debugging purposes - helps identify when running in middleware vs client
const isServer = typeof window === "undefined";

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  method: string = "GET",
  data?: any,
  requiresAuth: boolean = true
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (requiresAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: "include",
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    // For development - log API requests
    if (process.env.NODE_ENV === "development") {
      console.log(`API Request: ${method} ${url}`, { headers, data, isServer });
    }

    const response = await fetch(url, options);

    // Handle no response or network error
    if (!response) {
      throw new Error("No response from server");
    }

    let responseData;
    const responseText = await response.text();

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Invalid response format");
    }

    if (!response.ok) {
      throw new Error(responseData.message || "Request failed");
    }

    return responseData as T;
  } catch (error: any) {
    console.error(`API error (${endpoint}):`, error);
    throw error;
  }
};

// Auth API calls
export const login = async (email: string, password: string): Promise<User> => {
  try {
    // For debugging
    console.log("Attempting login with:", { email, isServer });

    const response = await apiRequest<LoginResponse>(
      "/auth/login",
      "POST",
      { email, password },
      false
    );

    if (response.success && response.token && response.user) {
      setAuthData(response.token, response.user);
      return response.user;
    }

    throw new Error("Login failed");
  } catch (error: any) {
    throw error;
  }
};

export const register = async (userData: {
  fullName: string;
  username: string;
  email: string;
  password: string;
}): Promise<User> => {
  try {
    // For debugging
    console.log("Attempting registration with:", {
      email: userData.email,
      isServer,
    });

    const response = await apiRequest<RegisterResponse>(
      "/auth/register",
      "POST",
      userData,
      false
    );

    if (response.success && response.token && response.user) {
      setAuthData(response.token, response.user);
      return response.user;
    }

    throw new Error("Registration failed");
  } catch (error: any) {
    throw error;
  }
};

export const logout = (): void => {
  clearAuthData();
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiRequest<{ success: boolean; user: User }>(
      "/auth/me",
      "GET"
    );
    return response.user;
  } catch (error) {
    clearAuthData();
    throw error;
  }
};

// Export the API client
const apiClient = {
  // Auth
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken,
  getUser,

  // Generic request method for other API calls
  request: apiRequest,
};

export default apiClient;
