// API Client for making requests to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Storage keys
const TOKEN_KEY = "ph_auth_token";
const USER_KEY = "ph_user_data";

// Add debugging to help diagnose connection issues
console.log(`API Client initialized with base URL: ${API_BASE_URL}`);

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Mock data for when the API is unavailable
const MOCK_DATA = {
  templates: [
    {
      _id: 'mock-template-1',
      name: 'Developer Portfolio',
      description: 'Perfect for showcasing coding projects and technical skills',
      category: 'developer',
      previewImage: 'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4',
      isPublished: true,
      isFeatured: true,
      rating: { average: 4.8, count: 120 },
      tags: ['developer', 'coding', 'professional'],
      usageCount: 450,
    },
    {
      _id: 'mock-template-2',
      name: 'Designer Portfolio',
      description: 'Showcase your creative work with style and elegance',
      category: 'designer',
      previewImage: 'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg',
      isPublished: true,
      isFeatured: true,
      rating: { average: 4.7, count: 98 },
      tags: ['designer', 'creative', 'minimalist'],
      usageCount: 380,
    },
    {
      _id: 'mock-template-3',
      name: 'Photographer Portfolio',
      description: 'Highlight your photography with a clean, visual-focused layout',
      category: 'photographer',
      previewImage: 'https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg',
      isPublished: true,
      isFeatured: true,
      rating: { average: 4.9, count: 105 },
      tags: ['photographer', 'visual', 'gallery'],
      usageCount: 410,
    }
  ],
  users: [
    {
      _id: 'mock-user-1',
      fullName: 'Demo User',
      username: 'demouser',
      email: 'demo@example.com',
      role: 'user',
    }
  ],
  portfolios: []
};

/**
 * Helper function to check if a connection error is due to the backend not running
 */
const isConnectionError = (error: any): boolean => {
  return (
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('Network request failed') ||
    error.message?.includes('network error') ||
    error.code === 'ECONNREFUSED' ||
    error.message?.includes('ECONNREFUSED')
  );
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to parse error message from the response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    } catch (e) {
      throw new Error(`API Error: ${response.status}`);
    }
  }

  return response.json();
};

// Auth utilities
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): any | null => {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setAuthData = (token: string, user: any): void => {
  if (typeof window === "undefined") return;

  // Set in localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // Also set in cookies for middleware detection
  // Set cookie to expire in 30 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;

  console.log(`Auth: Token set in localStorage and cookie`);
};

export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;

  // Clear from localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Clear cookie by setting expiry in the past
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;

  console.log(`Auth: Token cleared from localStorage and cookie`);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Main API client implementation
const api = {
  // Generic request method for client components
  request: async <T = any>(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...customHeaders
      };

      // Add auth token if available
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };

      // Add body for non-GET requests
      if (method !== 'GET' && data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      return await handleResponse(response);
    } catch (error) {
      console.error(`API request error (${endpoint}):`, error);

      if (isDev && isConnectionError(error)) {
        console.warn('Using mock data for development (backend connection failed)');

        // Return mock data based on the endpoint
        if (endpoint.startsWith('/templates')) {
          return { success: true, templates: MOCK_DATA.templates } as unknown as T;
        } else if (endpoint.startsWith('/portfolios')) {
          return { success: true, portfolios: MOCK_DATA.portfolios } as unknown as T;
        }
      }

      throw error;
    }
  },

  // Legacy functions to maintain compatibility
  getTemplates: async (category?: string, options?: any) => {
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

    try {
      console.log(`Fetching templates from ${API_BASE_URL}${endpoint}...`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include'
      });

      const data = await handleResponse(response);
      console.log(`Successfully fetched ${data.templates?.length || 0} templates from backend`);
      return data.templates || [];
    } catch (error) {
      console.error('Template API error:', error);

      if (isConnectionError(error)) {
        console.warn('Backend connection failed. Using mock template data as fallback');
      } else {
        console.error('Template fetch failed with unexpected error:', error);
      }

      // Filter mock data based on category if provided
      let templates = MOCK_DATA.templates;
      if (category) {
        templates = templates.filter(t => t.category === category);
      }
      if (options?.featured) {
        templates = templates.filter(t => t.isFeatured);
      }

      return templates;
    }
  },

  getTemplateById: async (id: string) => {
    try {
      console.log(`Fetching template ${id} from ${API_BASE_URL}/templates/${id}`);
      const response = await fetch(`${API_BASE_URL}/templates/${id}`);
      const data = await handleResponse(response);
      console.log(`Successfully fetched template ${id} from backend`);
      return data.template;
    } catch (error) {
      console.error('Template fetch error:', error);

      if (isConnectionError(error)) {
        console.warn('Backend connection failed. Using mock template data as fallback');
      }

      // Return a mock template that matches the ID or the first one
      return MOCK_DATA.templates.find(t => t._id === id) || MOCK_DATA.templates[0];
    }
  },

  isAuthenticated,
  getToken,
  getUser,

  login: async (email: string, password: string) => {
    try {
      console.log(`Attempting login with email ${email} to ${API_BASE_URL}/auth/login`);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await handleResponse(response);
      if (data.token && data.user) {
        setAuthData(data.token, data.user);
      }
      console.log('Login successful with backend');
      return data;
    } catch (error) {
      console.error('Login error:', error);

      if (isConnectionError(error) && isDev) {
        console.warn('Backend connection failed. Using mock login data for development');
        // For demo purposes, create a mock successful login
        const mockUser = MOCK_DATA.users[0];
        const mockToken = 'mock-jwt-token';
        setAuthData(mockToken, mockUser);
        return { token: mockToken, user: mockUser };
      }

      throw error;
    }
  },

  logout: () => {
    clearAuthData();
  },

  getCurrentUser: async () => {
    try {
      console.log(`Fetching current user from ${API_BASE_URL}/auth/me`);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        credentials: 'include'
      });

      const data = await handleResponse(response);
      console.log('Successfully fetched current user from backend');
      return data.user;
    } catch (error) {
      console.error('User fetch error:', error);

      if (isConnectionError(error) && isDev) {
        console.warn('Backend connection failed. Using mock user data for development');
        return MOCK_DATA.users[0]; // Return a mock user
      }

      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });

        const data = await handleResponse(response);
        if (data.token && data.user) {
          setAuthData(data.token, data.user);
        }
        return data;
      } catch (error) {
        console.error('Login error:', error);

        if (isConnectionError(error) && isDev) {
          // For demo purposes, create a mock successful login
          const mockUser = MOCK_DATA.users[0];
          const mockToken = 'mock-jwt-token';
          setAuthData(mockToken, mockUser);
          return { token: mockToken, user: mockUser };
        }

        throw error;
      }
    },

    register: async (userData: any) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        const data = await handleResponse(response);
        if (data.token && data.user) {
          setAuthData(data.token, data.user);
        }
        return data;
      } catch (error) {
        console.error('Registration error:', error);

        if (isConnectionError(error) && isDev) {
          // Mock a successful registration
          const mockUser = {
            _id: 'new-user-id',
            fullName: userData.fullName || 'New User',
            username: userData.username || 'newuser',
            email: userData.email,
            role: 'user'
          };
          const mockToken = 'mock-jwt-token';
          setAuthData(mockToken, mockUser);
          return { token: mockToken, user: mockUser };
        }

        throw error;
      }
    },

    logout: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });

        clearAuthData();
        return handleResponse(response);
      } catch (error) {
        console.error('Logout error:', error);
        clearAuthData();
        return { success: true, message: 'Logged out successfully' };
      }
    },

    forgotPassword: async (email: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Forgot password error:', error);

        if (isConnectionError(error) && isDev) {
          return { success: true, message: 'Password reset instructions sent to your email' };
        }

        throw error;
      }
    },

    resetPassword: async (token: string, password: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password })
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Reset password error:', error);

        if (isConnectionError(error) && isDev) {
          return { success: true, message: 'Password reset successfully' };
        }

        throw error;
      }
    }
  },

  // Template endpoints
  templates: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates`);
        return handleResponse(response);
      } catch (error) {
        console.error('Templates fetch error:', error);

        if (isConnectionError(error) && isDev) {
          return { templates: MOCK_DATA.templates };
        }

        throw error;
      }
    },

    getById: async (id: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates/${id}`);
        return handleResponse(response);
      } catch (error) {
        console.error('Template fetch error:', error);

        if (isConnectionError(error) && isDev) {
          const template = MOCK_DATA.templates.find(t => t._id === id) || MOCK_DATA.templates[0];
          return { template };
        }

        throw error;
      }
    },

    getFavorites: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates/favorites`, {
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Favorites fetch error:', error);

        if (isConnectionError(error) && isDev) {
          return { templates: [MOCK_DATA.templates[0]] }; // Return first template as favorite
        }

        throw error;
      }
    },

    toggleFavorite: async (id: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates/${id}/favorite`, {
          method: 'POST',
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Toggle favorite error:', error);

        if (isConnectionError(error) && isDev) {
          return { success: true, message: 'Template favorite status toggled' };
        }

        throw error;
      }
    }
  },

  // Portfolio endpoints
  portfolios: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolios`, {
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Portfolios fetch error:', error);

        if (isConnectionError(error) && isDev) {
          return { portfolios: [] };
        }

        throw error;
      }
    },

    getById: async (id: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolios/${id}`);
        return handleResponse(response);
      } catch (error) {
        console.error('Portfolio fetch error:', error);

        if (isConnectionError(error) && isDev) {
          return { portfolio: null };
        }

        throw error;
      }
    },

    getByUsername: async (username: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolios/user/${username}`);
        return handleResponse(response);
      } catch (error) {
        console.error('Portfolio fetch error:', error);

        if (isConnectionError(error) && isDev) {
          return { portfolio: null };
        }

        throw error;
      }
    },

    // Save a draft portfolio
    saveDraft: async (portfolioData: any) => {
      try {
        // If the portfolio has an _id and it's not 'new-portfolio', update it
        const isUpdate = portfolioData._id && portfolioData._id !== 'new-portfolio';
        const endpoint = isUpdate
          ? `${API_BASE_URL}/portfolios/${portfolioData._id}`
          : `${API_BASE_URL}/portfolios`;

        const method = isUpdate ? 'PUT' : 'POST';

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...portfolioData,
            status: 'draft'
          }),
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Save draft error:', error);

        if (isConnectionError(error) && isDev) {
          // Create a mock portfolio with an ID
          const mockPortfolio = {
            ...portfolioData,
            _id: portfolioData._id === 'new-portfolio' ? 'mock-portfolio-1' : portfolioData._id,
            isPublished: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return { success: true, portfolio: mockPortfolio };
        }

        throw error;
      }
    },

    // Publish a portfolio
    publish: async (portfolioData: any) => {
      try {
        // If the portfolio has an _id and it's not 'new-portfolio', update it
        const isUpdate = portfolioData._id && portfolioData._id !== 'new-portfolio';
        const endpoint = isUpdate
          ? `${API_BASE_URL}/portfolios/${portfolioData._id}`
          : `${API_BASE_URL}/portfolios`;

        const method = isUpdate ? 'PUT' : 'POST';

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...portfolioData,
            status: 'published'
          }),
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Publish error:', error);

        if (isConnectionError(error) && isDev) {
          // Create a mock published portfolio with an ID
          const mockPortfolio = {
            ...portfolioData,
            _id: portfolioData._id === 'new-portfolio' ? 'mock-portfolio-1' : portfolioData._id,
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subdomain: portfolioData.subdomain || 'demo-portfolio'
          };
          return { success: true, portfolio: mockPortfolio };
        }

        throw error;
      }
    },

    // Delete a portfolio
    delete: async (id: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Delete portfolio error:', error);

        if (isConnectionError(error) && isDev) {
          return { success: true, message: 'Portfolio deleted successfully' };
        }

        throw error;
      }
    }
  },

  // User profile endpoints
  user: {
    getProfile: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Profile fetch error:', error);

        if (isConnectionError(error) && isDev) {
          return { user: MOCK_DATA.users[0] };
        }

        throw error;
      }
    },

    updateProfile: async (profileData: any) => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
          credentials: 'include'
        });

        return handleResponse(response);
      } catch (error) {
        console.error('Profile update error:', error);

        if (isConnectionError(error) && isDev) {
          return {
            success: true,
            user: { ...MOCK_DATA.users[0], profile: profileData }
          };
        }

        throw error;
      }
    }
  }
};

// Server-side utility functions (can be imported directly in server components)
export async function fetchTemplates(category?: string) {
  const url = new URL(`${API_BASE_URL}/templates`);

  if (category && category !== 'all') {
    url.searchParams.append('category', category);
  }

  try {
    console.log(`Server fetching templates from ${url.toString()}`);
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Server-side template fetch error:', error);
    return [];
  }
}

export async function fetchTemplateById(id: string) {
  try {
    console.log(`Server fetching template ${id} from ${API_BASE_URL}/templates/${id}`);
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Server-side template fetch error:', error);
    return null;
  }
}

// Define User type for type safety
export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  profile?: {
    title?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: Record<string, string>;
    skills?: any[];
    education?: any[];
    experience?: any[];
    projects?: any[];
  };
}

// Export both the complete api object and individual functions
export const apiClient = api;
export default api;
