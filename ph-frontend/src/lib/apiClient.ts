// API Client for making requests to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Storage keys
const TOKEN_KEY = "ph_auth_token";
const USER_KEY = "ph_user_data";

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
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

const apiClient = {
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include'
    });

    const data = await handleResponse(response);
    return data.templates || [];
  },

  getTemplateById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`);
    const data = await handleResponse(response);
    return data.template;
  },

  isAuthenticated,
  getToken,
  getUser,
  logout: () => {
    clearAuthData();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    return data.user;
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
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
    },

    register: async (userData: any) => {
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
    },

    logout: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      clearAuthData();
      return handleResponse(response);
    },

    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      return handleResponse(response);
    },

    resetPassword: async (token: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      return handleResponse(response);
    }
  },

  // Template endpoints
  templates: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/templates`);
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`);
      return handleResponse(response);
    },

    getFavorites: async () => {
      const response = await fetch(`${API_BASE_URL}/templates/favorites`, {
        credentials: 'include'
      });

      return handleResponse(response);
    },

    toggleFavorite: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/templates/${id}/favorite`, {
        method: 'POST',
        credentials: 'include'
      });

      return handleResponse(response);
    }
  },

  // Portfolio endpoints
  portfolios: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/portfolios`, {
        credentials: 'include'
      });

      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/portfolios/${id}`);
      return handleResponse(response);
    },

    getByUsername: async (username: string) => {
      const response = await fetch(`${API_BASE_URL}/portfolios/user/${username}`);
      return handleResponse(response);
    },

    // Save a draft portfolio
    saveDraft: async (portfolioData: any) => {
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
    },

    // Publish a portfolio
    publish: async (portfolioData: any) => {
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
    },

    // Delete a portfolio
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      return handleResponse(response);
    }
  },

  // User profile endpoints
  user: {
    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        credentials: 'include'
      });

      return handleResponse(response);
    },

    updateProfile: async (profileData: any) => {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });

      return handleResponse(response);
    }
  }
};

export { apiClient };
export default apiClient;
