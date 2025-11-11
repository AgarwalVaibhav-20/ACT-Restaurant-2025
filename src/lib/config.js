// Get API base URL from environment variable
// Defaults to http://localhost:4000 for local development
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

// Get Restaurant ID from environment variable
// This should match the RESTAURANT_ID in backend .env file
export const RESTAURENT_ID = import.meta.env.VITE_RESTAURENT_ID || ''

export function assertEnv() {
  // Don't throw errors, just warn - backend will handle restaurantId from env
  if (!API_BASE_URL) {
    console.warn('⚠️ VITE_API_BASE_URL is not set. Using default: http://localhost:4000')
  }
  // Restaurant ID is optional if backend has RESTAURANT_ID in env
  if (!RESTAURENT_ID) {
    console.warn('⚠️ RESTAURENT_ID is not set in frontend .env file. Backend will use RESTAURANT_ID from env if available.')
  }
  
  console.log('🔧 Frontend Config:', {
    API_BASE_URL: API_BASE_URL || 'http://localhost:4000',
    RESTAURENT_ID: RESTAURENT_ID || 'Not set (will use backend env)'
  })
}
