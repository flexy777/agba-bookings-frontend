const API_BASE_URL = "https://api.legitbills.com"

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// A more robust helper for making API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}, isPublic = false) => {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  // Define headers as a mutable record
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  // Add Authorization header if it's not a public request and token exists
  if (!isPublic && token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    console.log(`Making API request to: ${url}`)
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.detail || `HTTP error! status: ${response.status}`
      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      throw error
    }

    if (response.status === 204) {
      // No Content
      return null
    }

    return response.json()
  } catch (error) {
    console.error(`API Request Error to ${endpoint}:`, error)
    throw error
  }
}

// --- API Modules ---

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest("/api/business/login/", { method: "POST", body: JSON.stringify(credentials) }, true),
  logout: () => apiRequest("/api/business/logout/", { method: "POST" }),
  register: (userData: any) =>
    apiRequest("/api/business/register/", { method: "POST", body: JSON.stringify(userData) }, true),
  forgotPassword: (email: string) =>
    apiRequest("/api/business/forgot-password/", { method: "POST", body: JSON.stringify({ email }) }, true),
  resetPassword: (token: string, password: string) =>
    apiRequest("/api/business/reset-password/", { method: "POST", body: JSON.stringify({ token, password }) }, true),
}

// Business API (Authenticated)
export const businessApi = {
  getProfile: () => apiRequest("/api/business/account/me/"),
  updateProfile: (profileData: any) =>
    apiRequest("/api/business/profile/", { method: "PUT", body: JSON.stringify(profileData) }),
  getServices: () => apiRequest("/api/business/services/"),
  createService: (serviceData: any) =>
    apiRequest("/api/business/services/", { method: "POST", body: JSON.stringify(serviceData) }),
  updateService: (serviceId: string, serviceData: any) =>
    apiRequest(`/api/business/services/${serviceId}/`, { method: "PUT", body: JSON.stringify(serviceData) }),
  deleteService: (serviceId: string) => apiRequest(`/api/business/services/${serviceId}/`, { method: "DELETE" }),
  getSchedule: () => apiRequest("/api/business/schedule/"),
  updateSchedule: (scheduleData: any) =>
    apiRequest("/api/business/schedule/", { method: "PUT", body: JSON.stringify(scheduleData) }),
  getBookings: () => apiRequest("/api/business/bookings/"),
  updateBooking: (bookingId: string, status: string) =>
    apiRequest(`/api/business/bookings/${bookingId}/`, { method: "PATCH", body: JSON.stringify({ status }) }),
}

// Public Booking API (No Auth)
export const bookingApi = {
  getBusinessDetails: (slug: string) => apiRequest(`/booking/public/business/${slug}/`, {}, true),
  createBooking: (
    slug: string,
    bookingData: {
      booking_date: string
      start_time: string
      end_time: string
      business_id: string
      customer_email: string
      customer_name: string
      customer_phone: string
      notes: string
      service: string
    },
  ) => apiRequest(`/booking/public/book/${slug}/`, { method: "POST", body: JSON.stringify(bookingData) }, true),
  getAvailableSlots: (businessId: string, serviceId: string, date: string) =>
    apiRequest(
      `/booking/public/available-slots/?business_id=${businessId}&service_id=${serviceId}&date=${date}`,
      {},
      true,
    ),
}

// Payment API (Authenticated)
export const paymentApi = {
  initializePayment: (paymentData: any) =>
    apiRequest("/api/business/payment/initialize/", { method: "POST", body: JSON.stringify(paymentData) }),
  verifyPayment: (reference: string) =>
    apiRequest("/api/business/payment/verify/", { method: "POST", body: JSON.stringify({ reference }) }),
  getSubscription: () => apiRequest("/api/business/subscription/"),
  cancelSubscription: () => apiRequest("/api/business/subscription/cancel/", { method: "POST" }),
}

// Onboarding API (Authenticated)
export const onboardingApi = {
  saveBusinessInfo: (businessData: any) =>
    apiRequest("/api/business/onboarding/business-info/", { method: "POST", body: JSON.stringify(businessData) }),
  saveServices: (services: any) =>
    apiRequest("/api/business/onboarding/services/", { method: "POST", body: JSON.stringify({ services }) }),
  saveSchedule: (schedule: any) =>
    apiRequest("/api/business/onboarding/schedule/", { method: "POST", body: JSON.stringify({ schedule }) }),
  completeOnboarding: () => apiRequest("/api/business/onboarding/complete/", { method: "POST" }),
}

export default {
  authApi,
  businessApi,
  bookingApi,
  paymentApi,
  onboardingApi,
}
