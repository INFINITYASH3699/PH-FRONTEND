import { toast } from "sonner";

// API base URL - use environment variable or default to the backend URL 
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api' // In production, use the relative /api path which gets rewritten in vercel.json
    : 'http://localhost:5000/api'); // Use localhost for development

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
  // New fields
  isFeatured?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  reviews?: Array<{
    userId: string;
    userName?: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  tags?: string[];
  usageCount?: number;
  previewImages?: string[];
  customizationOptions?: {
    colorSchemes?: Array<{
      name: string;
      primary: string;
      secondary: string;
      background: string;
      text: string;
    }>;
    fontPairings?: Array<{
      name: string;
      heading: string;
      body: string;
    }>;
    layouts?: string[];
  };
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
  if (!token || token.trim() === '') {
    console.error("Attempted to set empty auth token");
    return;
  }

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set a cookie with the same name as localStorage for middleware to detect
    // Use secure flags when in production
    const secure = process.env.NODE_ENV === 'production' ? '; secure; samesite=strict' : '';
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${30 * 24 * 60 * 60}${secure}`;

  } catch (error) {
    console.error("Error setting auth data:", error);
  }
};

// Clear auth data - completely rewritten for more targeted auth cookie clearing
export const clearAuthData = (): void => {
  try {
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);


    // Only try to clear the specific auth cookie, not all cookies
    // This is the cookie that middleware is checking

    // Get the current cookie string
    const cookiesBeforeClear = document.cookie;

    // Only focus on clearing the auth token cookie
    const paths = ['/', '/auth', '/dashboard', '/profile', '/templates', '/auth/signin', '/auth/signup'];

    // Clear the cookie from all possible paths
    paths.forEach(path => {
      document.cookie = `${TOKEN_KEY}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
    });

    // Check if the cookie was cleared
    const hasCookieAfterClear = document.cookie.includes(TOKEN_KEY);

    if (hasCookieAfterClear) {
      console.warn("Failed to clear auth cookie using standard methods");

      // Try a more aggressive approach to find and remove the specific cookie
      const cookieParts = document.cookie.split(';');
      for (let i = 0; i < cookieParts.length; i++) {
        const cookiePart = cookieParts[i].trim();
        if (cookiePart.startsWith(TOKEN_KEY + '=')) {
          const path = cookiePart.includes('path=') ?
            cookiePart.split('path=')[1].split(';')[0] : '/';
          document.cookie = `${TOKEN_KEY}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
        }
      }
    }

    return;
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const isAuth = !!token && token.trim() !== '';


  return isAuth;
};

// Debug function to inspect auth state
export const debugAuthState = (): {
  isAuthenticated: boolean;
  token: string | null;
  hasUser: boolean;
  cookies: string;
} => {
  const token = getToken();
  const user = getUser();
  return {
    isAuthenticated: !!token && token.trim() !== '',
    token: token ? `${token.substring(0, 10)}...` : null,
    hasUser: !!user,
    cookies: document.cookie,
  };
};

// Generic API request function with improved error handling
const apiRequest = async <T>(
  endpoint: string,
  method: string = "GET",
  data?: any,
  requiresAuth: boolean = true,
  showErrorToast: boolean = true
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
    if (showErrorToast) {
      toast.error(error.message || 'An error occurred');
    }
    throw error;
  }
};

// Auth API calls
export const login = async (email: string, password: string): Promise<User> => {
  try {
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

// Logout with additional cookie clearing safeguards
export const logout = (): void => {
  clearAuthData();

  // Force reload if needed to ensure state is cleared
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      // Check if cookies are really cleared
      if (document.cookie.includes(TOKEN_KEY)) {
        console.warn("Cookie still exists after logout, forcing page reload");
        window.location.href = '/auth/signin?forceClear=true';
      } else {
      }
    }, 100);
  }
};

// Get current user
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
async function getTemplates(category?: string, options?: { sort?: string; tags?: string[]; featured?: boolean }): Promise<Template[]> {
  try {
    let endpoint = '/templates';
    const queryParams = [];

    if (category) {
      queryParams.push(`category=${category}`);
    }

    if (options?.sort) {
      queryParams.push(`sort=${options.sort}`);
    }

    if (options?.featured) {
      queryParams.push('featured=true');
    }

    if (options?.tags && options.tags.length > 0) {
      queryParams.push(`tags=${options.tags.join(',')}`);
    }

    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }

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

// New template-related functions
async function rateTemplate(templateId: string, rating: number, comment?: string): Promise<Template> {
  try {
    const response = await apiRequest<{ success: boolean; template: Template }>(
      `/templates/${templateId}/rate`,
      'POST',
      { rating, comment }
    );
    return response.template;
  } catch (error) {
    console.error('Error rating template:', error);
    throw error;
  }
}

async function favoriteTemplate(templateId: string, isFavorite: boolean): Promise<{ success: boolean }> {
  try {
    const response = await apiRequest<{ success: boolean }>(
      `/templates/${templateId}/favorite`,
      'POST',
      { isFavorite }
    );
    return response;
  } catch (error) {
    console.error('Error toggling template favorite:', error);
    throw error;
  }
}

async function getFavoriteTemplates(): Promise<Template[]> {
  try {
    const response = await apiRequest<{ success: boolean; templates: Template[] }>(
      '/templates/favorites'
    );
    return response.templates;
  } catch (error) {
    console.error('Error fetching favorite templates:', error);
    throw error;
  }
}

async function getTemplateReviews(templateId: string): Promise<Template['reviews']> {
  try {
    const response = await apiRequest<{ success: boolean; reviews: Template['reviews'] }>(
      `/templates/${templateId}/reviews`
    );
    return response.reviews || [];
  } catch (error) {
    console.error('Error fetching template reviews:', error);
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

// New function to get portfolio by subdomain
async function getPortfolioBySubdomain(subdomain: string): Promise<Portfolio> {
  try {
    const response = await apiRequest<{ success: boolean; portfolio: Portfolio }>(
      `/portfolios/subdomain/${subdomain}`,
      'GET'
    );
    return response.portfolio;
  } catch (error) {
    console.error('Error fetching portfolio by subdomain:', error);
    throw error;
  }
}

// Delete a portfolio
async function deletePortfolio(portfolioId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(
      `/portfolios/${portfolioId}`,
      'DELETE'
    );
    return response;
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    throw error;
  }
}

// Increment template usage with improved error handling
async function incrementTemplateUsage(templateId: string): Promise<boolean> {
  try {
    await apiRequest<{ success: boolean; message: string }>(
      `/templates/${templateId}/use`,
      'POST',
      undefined,
      true,
      false // Set to false to suppress error toast
    );
    return true;
  } catch (error) {
    console.warn('Template usage tracking failed - continuing anyway:', error);
    // Return true since this is a non-critical operation
    return true;
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
  debugAuthState, // Add the debug function to the exported object

  // Profile
  updateProfile,
  uploadProfilePicture,

  // Templates
  getTemplates,
  getTemplateById,
  rateTemplate,
  favoriteTemplate,
  getFavoriteTemplates,
  getTemplateReviews,
  incrementTemplateUsage, // Add the new method

  // Portfolios
  createPortfolio,
  updatePortfolioContent,
  uploadImage,
  getPortfolioBySubdomain,
  deletePortfolio, // Add the deletePortfolio function to the exported object

  // Generic request method for other API calls
  request: apiRequest,
};

// Export the API client
export default apiClient;
