// API utility functions
const API_BASE_URL = "http://127.0.0.1:8000"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available (only in browser)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.message || data.detail || "API request failed")
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, "Network error")
  }
}

// Public API functions (no auth required)
export async function publicApiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.message || data.detail || "API request failed")
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, "Network error")
  }
}

// Auth API functions
export const authApi = {
  signup: (data: any) =>
    apiRequest("/api/business/signup/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: any) =>
    apiRequest("/api/business/login/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest("/api/business/logout/", {
      method: "POST",
    }),

  getMe: () => apiRequest("/api/business/account/me/"),
}

// Business API functions
export const businessApi = {
  getProfile: () => apiRequest("/api/business/profile/"),
  updateProfile: (data: any) =>
    apiRequest("/api/business/profile/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest("/api/business/account/me/"),
}

// Public booking API functions
export const bookingApi = {
  getBusinessDetails: (slug: string) => publicApiRequest(`/booking/public/business/${slug}/`),
}
