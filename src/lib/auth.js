import { API_BASE_URL } from './config'

const TOKEN_KEY = 'restaurant_auth_token'
const USER_KEY = 'restaurant_user_data'

// Default credentials for automatic authentication
// These credentials will be attempted for automatic login
// You can create an account with these credentials or update them
const DEFAULT_CREDENTIALS = {
  email: 'admin@restaurant.com',
  password: 'Admin@123456'
}

// Flag to control whether authentication is required
const REQUIRE_AUTH = false // Set to true once you've created an account

class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY)
    this.user = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user
  }

  // Get current token
  getToken() {
    return this.token || localStorage.getItem(TOKEN_KEY)
  }

  // Get current user
  getUser() {
    return this.user || JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  }

  // Store authentication data
  storeAuth(token, user) {
    this.token = token
    this.user = user
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  // Clear authentication data
  clearAuth() {
    this.token = null
    this.user = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // Login with credentials
  async login(credentials = DEFAULT_CREDENTIALS) {
    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Login failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.token) {
        this.storeAuth(data.token, data.user)
        console.log('✅ Automatic login successful')
        return data
      } else {
        throw new Error('Login response missing token or success flag')
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message)
      this.clearAuth()
      throw error
    }
  }

  // Automatic authentication - tries to login if not authenticated
  async ensureAuthenticated() {
    if (this.isAuthenticated()) {
      return this.getToken()
    }

    // If authentication is not required, allow requests without token
    if (!REQUIRE_AUTH) {
      console.log('ℹ️ Authentication not required - allowing request without token')
      return null
    }

    try {
      console.log('🔐 No token found, attempting automatic login...')
      await this.login()
      return this.getToken()
    } catch (error) {
      console.error('❌ Automatic authentication failed:', error.message)
      console.log('💡 To fix: Create an account with email "admin@restaurant.com" and password "Admin@123456"')
      console.log('   Or set REQUIRE_AUTH = false in Frontend/src/lib/auth.js')
      throw new Error('Authentication required. Please check your credentials in auth.js')
    }
  }

  // Create a restaurant account (for initial setup)
  async createRestaurantAccount(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username || 'Restaurant Admin',
          email: credentials.email,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Signup failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Restaurant account created successfully')
      return data
    } catch (error) {
      console.error('❌ Account creation failed:', error.message)
      throw error
    }
  }

  // Get authentication headers for API requests
  getAuthHeaders() {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Logout
  logout() {
    this.clearAuth()
    console.log('👋 Logged out successfully')
  }
}

// Create singleton instance
export const authService = new AuthService()

// Helper function for API calls
export async function makeAuthenticatedRequest(url, options = {}) {
  try {
    // Ensure we have a valid token
    await authService.ensureAuthenticated()
    
    // Make request with auth headers
    const response = await fetch(url, {
      ...options,
      headers: {
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
    })

    // Handle token expiration
    if (response.status === 401 || response.status === 403) {
      console.log('🔄 Token expired, retrying with fresh authentication...')
      authService.clearAuth()
      await authService.ensureAuthenticated()
      
      // Retry the request
      return fetch(url, {
        ...options,
        headers: {
          ...authService.getAuthHeaders(),
          ...options.headers,
        },
      })
    }

    return response
  } catch (error) {
    console.error('❌ Authenticated request failed:', error.message)
    throw error
  }
}

export default authService