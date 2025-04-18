import { toast } from "sonner";

// API base URL - use environment variable or default to the backend URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; // Updated to port 5000 based on backend code

// Storage keys
const TOKEN_KEY = "ph_auth_token";
const USER_KEY = "ph_user_data";

// Interface for common API response
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Social links interface
export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  [key: string]: string | undefined;
}

// User profile interface
export interface UserProfile {
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
}

// User interface
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
  role: string;
  profile?: UserProfile;
}

// Template interface
export interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  defaultStructure: Record<string, any>;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Portfolio interface
export interface Portfolio {
  _id: string;
  title: string;
  subtitle?: string;
  subdomain: string;
  templateId?: string | Template;
  content: Record<string, any>;
  isPublished: boolean;
  viewCount: number;
  customDomain?: string;
  headerImage?: {
    url: string;
    publicId: string;
  };
  galleryImages?: Array<{
    url: string;
    publicId: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
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

interface ProfileUpdateResponse extends ApiResponse<any> {
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

  // Set a cookie with the same name as localStorage for middleware to detect
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${30 * 24 * 60 * 60};`;
};

// Clear auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Clear the cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0;`;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

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
      credentials: "include", // Important for cookie handling
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    // For development - log API requests
    if (process.env.NODE_ENV === "development") {
      console.log(`API Request: ${method} ${url}`, data);
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
    console.log("Attempting login with:", { email });

    const response = await apiRequest<LoginResponse>(
      "/auth/login",
      "POST",
      { email, password },
      false
    );

    if (response.success && response.token && response.user) {
      setAuthData(response.token, response.user);
      console.log("Login successful, token and user set");
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
    console.log("Attempting registration with:", {
      email: userData.email,
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

// Profile API calls
export const updateProfile = async (profileData: {
  fullName?: string;
  profilePicture?: string;
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
}): Promise<User> => {
  try {
    const response = await apiRequest<ProfileUpdateResponse>(
      "/auth/profile",
      "PUT",
      profileData
    );

    if (response.success && response.user) {
      // Update the stored user data
      const token = getToken() as string;
      setAuthData(token, response.user);
      return response.user;
    }

    throw new Error("Profile update failed");
  } catch (error: any) {
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    const url = `${API_BASE_URL}/auth/profile/upload-image`;
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      credentials: "include",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload profile picture");
    }

    const data = await response.json();
    return data.profilePicture;
  } catch (error: any) {
    console.error("Upload profile picture error:", error);
    throw error;
  }
};

// Template-related functions
async function getTemplates(category?: string): Promise<Template[]> {
  try {
    const endpoint = category ? `/templates?category=${category}` : '/templates';
    const response = await apiRequest<{ success: boolean; templates: Template[] }>(endpoint);
    return response.templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

async function getTemplateById(id: string): Promise<Template> {
  try {
    const response = await apiRequest<{ success: boolean; template: Template }>(`/templates/${id}`);
    return response.template;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

// Portfolio-related functions
async function createPortfolio(data: {
  title: string;
  subtitle?: string;
  subdomain: string;
  templateId: string;
  content?: Record<string, any>;
}): Promise<Portfolio> {
  try {
    const response = await apiRequest<{ success: boolean; portfolio: Portfolio }>(
      '/portfolios',
      'POST',
      data
    );
    return response.portfolio;
  } catch (error) {
    console.error('Error creating portfolio:', error);
    throw error;
  }
}

async function updatePortfolioContent(
  portfolioId: string,
  content: Record<string, any>
): Promise<Portfolio> {
  try {
    // For content updates, we need to determine if this is a full portfolio update
    // or just updating a section
    let endpoint = `/portfolios/${portfolioId}`;
    let method = 'PUT';
    let updateData: any = {};

    // Check if we're updating specific section content or the entire portfolio
    const isFullUpdate = 'title' in content || 'subtitle' in content || 'isPublished' in content;

    if (isFullUpdate) {
      // This is a full portfolio update
      updateData = content;
    } else {
      // This is a section content update
      updateData = { content };
    }

    const response = await apiRequest<{ success: boolean; portfolio: Portfolio }>(
      endpoint,
      method,
      updateData
    );

    return response.portfolio;
  } catch (error) {
    console.error('Error updating portfolio content:', error);
    throw error;
  }
}

async function uploadImage(
  file: File,
  type: 'profile' | 'portfolio' | 'project',
  portfolioId?: string
): Promise<{ url: string; publicId: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (portfolioId) {
      formData.append('portfolioId', portfolioId);
    }

    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    // Use the backend upload endpoint
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to upload image');
    }

    return {
      url: data.url || data.secure_url || '',
      publicId: data.publicId || data.public_id || '',
    };
  } catch (error) {
    console.error('Error uploading image:', error);

    // Fallback for development
    if (process.env.NODE_ENV === 'development') {
      // Return a placeholder image URL
      console.warn('Using placeholder image in development');
      const placeholderUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
      return {
        url: placeholderUrl,
        publicId: 'placeholder_id',
      };
    }

    throw error;
  }
}

// API client object
const apiClient = {
  // Auth
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken,
  getUser,

  // Profile
  updateProfile,
  uploadProfilePicture,

  // Templates
  getTemplates,
  getTemplateById,

  // Portfolios
  createPortfolio,
  updatePortfolioContent,
  uploadImage,

  // Generic request method for other API calls
  request: apiRequest,
};

// Export the API client
export default apiClient;
