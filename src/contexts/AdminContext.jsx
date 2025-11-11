import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { RESTAURENT_ID } from '../lib/config'

export const AdminContext = createContext()

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    // Return default values instead of throwing error
    console.warn('⚠️ useAdmin called outside AdminProvider, using default values')
    return {
      isAdminMode: false,
      isAuthenticated: false,
      showAuthModal: false,
      restaurantData: null,
      customLayout: null,
      isPreviewMode: false,
      authenticateAdmin: async () => ({ success: false, error: 'Not in AdminProvider' }),
      logout: () => {},
      enterAdminMode: () => {},
      exitAdminMode: () => {},
      setShowAuthModal: () => {},
      saveLayout: async () => ({ success: false }),
      loadCustomLayout: async () => null,
    }
  }
  return context
}

export function AdminProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if we're in preview mode (disable admin controls)
  const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true'
  
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [restaurantData, setRestaurantData] = useState(null)
  const [customLayout, setCustomLayout] = useState(null)

  // Load saved admin state and custom layout on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_authenticated')
    const savedRestaurantId = localStorage.getItem('admin_restaurant_id')
    
    if (savedAuth === 'true' && savedRestaurantId) {
      setIsAuthenticated(true)
      setRestaurantData({ id: savedRestaurantId })
    }
    
    // IMPORTANT: Load layout from backend for ALL users (not just admins)
    // This ensures everyone sees the admin's custom layout
    loadLayoutFromBackend()
  }, [])
  
  // Helper function to load layout from backend
  const loadLayoutFromBackend = async () => {
    try {
      console.log('🌍 Loading custom layout from backend for all users...')
      // Pass RESTAURENT_ID if available, otherwise null (backend will use env RESTAURANT_ID)
      const response = await api.getCustomLayout(RESTAURENT_ID || null)
      
      if (response?.layout) {
        console.log('✅ Custom layout loaded from backend')
        setCustomLayout(response.layout)
      } else {
        console.log('ℹ️ No custom layout found on backend, using default')
      }
    } catch (error) {
      console.warn('⚠️ Failed to load layout from backend:', error.message)
      // Fallback to localStorage only if backend fails
      const savedLayout = localStorage.getItem('custom_layout')
      if (savedLayout) {
        try {
          console.log('📦 Using localStorage fallback')
          setCustomLayout(JSON.parse(savedLayout))
        } catch (e) {
          console.error('Failed to parse saved layout:', e)
        }
      }
    }
  }

  const authenticateAdmin = async (restaurantId) => {
    try {
      // Verify restaurant ID with your backend
      const response = await api.verifyRestaurantAdmin(restaurantId)
      
      if (response.success) {
        setIsAuthenticated(true)
        setRestaurantData(response.restaurant)
        setShowAuthModal(false)
        setIsAdminMode(true)
        
        // Save authentication state
        localStorage.setItem('admin_authenticated', 'true')
        localStorage.setItem('admin_restaurant_id', restaurantId)
        
        // Navigate to admin builder
        navigate('/admin')
        
        return { success: true }
      } else {
        return { success: false, error: 'Invalid restaurant ID' }
      }
    } catch (error) {
      return { success: false, error: error.message || 'Authentication failed' }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setIsAdminMode(false)
    setRestaurantData(null)
    setCustomLayout(null)
    
    // Clear localStorage
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_restaurant_id')
    localStorage.removeItem('custom_layout')
  }

  const enterAdminMode = () => {
    if (isAuthenticated) {
      setIsAdminMode(true)
      navigate('/admin')
    } else {
      // Require manual entry of restaurant ID
      setShowAuthModal(true)
    }
  }

  const exitAdminMode = () => {
    setIsAdminMode(false)
    navigate('/')
  }

  const saveLayout = async (layout) => {
    try {
      // Use authenticated restaurant ID or fall back to configured ID
      const restaurantId = restaurantData?.id || RESTAURENT_ID
      
      console.log('💾 Saving custom layout to backend for restaurant:', restaurantId)
      
      // Save to backend (will also save to localStorage as backup in api.js)
      const result = await api.saveCustomLayout(restaurantId, layout)
      
      if (result.success) {
        console.log('✅ Layout saved to backend successfully')
        setCustomLayout(layout)
        return { success: true }
      } else {
        throw new Error(result.error || 'Save failed')
      }
    } catch (error) {
      console.error('❌ Failed to save layout to backend:', error.message)
      
      // Fallback to localStorage only
      setCustomLayout(layout)
      localStorage.setItem('custom_layout', JSON.stringify(layout))
      console.warn('📦 Layout saved to localStorage only (backend unavailable)')
      
      return { success: false, error: error.message }
    }
  }

  const loadCustomLayout = async () => {
    try {
      // Always load from backend using the configured restaurant ID
      const restaurantId = restaurantData?.id || RESTAURENT_ID
      console.log('🔄 Reloading custom layout from backend...')
      
      const response = await api.getCustomLayout(restaurantId)
      if (response?.layout) {
        console.log('✅ Layout reloaded successfully')
        setCustomLayout(response.layout)
        return response.layout
      }
      
      console.log('ℹ️ No custom layout found')
      return null
    } catch (error) {
      console.warn('⚠️ Layout loading failed:', error.message)
      
      // Try localStorage fallback
      try {
        const savedLayout = localStorage.getItem('custom_layout')
        if (savedLayout) {
          const layout = JSON.parse(savedLayout)
          setCustomLayout(layout)
          return layout
        }
      } catch (e) {
        console.warn('localStorage layout parsing failed:', e.message)
      }
      
      return null
    }
  }

  // Auto-reload layout when authentication changes (for admins)
  useEffect(() => {
    if (isAuthenticated && restaurantData?.id) {
      loadCustomLayout()
    }
  }, [isAuthenticated, restaurantData?.id])

  const value = {
    isAdminMode: isPreviewMode ? false : isAdminMode, // Force admin mode off in preview
    isAuthenticated,
    showAuthModal,
    restaurantData,
    customLayout,
    isPreviewMode, // Expose preview mode state
    authenticateAdmin,
    logout,
    enterAdminMode,
    exitAdminMode,
    setShowAuthModal,
    saveLayout,
    loadCustomLayout,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}