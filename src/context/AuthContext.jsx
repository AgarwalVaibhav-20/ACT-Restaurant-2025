import { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Initial state
const initialState = {
  user: null,
  restaurantId: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        restaurantId: action.payload.restaurantId,
        isAuthenticated: !!action.payload.user,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// AuthProvider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      console.log('Auth check - token:', !!token, 'userId:', userId); // Debug log
      
      if (!token || !userId || userId === 'undefined' || userId === 'null') {
        console.log('No valid auth data, clearing storage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      // Verify token and get user profile
      const response = await apiService.getUserProfile(userId);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: {
            user: response.user,
            restaurantId: response.profile?.restaurantId || userId, // Use userId as restaurantId if not set
          },
        });
      } else {
        // Invalid token, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    
    try {
      const response = await apiService.signup(userData);
      
      console.log('Full signup response:', response); // Debug log
      
      // Extract user ID from JWT token since backend doesn't return user ID directly
      let userId = null;
      
      if (response.access_token) {
        try {
          // Decode JWT token to get user ID (without verification for client-side)
          const base64Payload = response.access_token.split('.')[1];
          const payload = JSON.parse(atob(base64Payload));
          userId = payload.id;
          console.log('Extracted userId from JWT:', userId);
        } catch (error) {
          console.error('Failed to decode JWT token:', error);
        }
      }
      
      // Fallback to other possible locations
      if (!userId) {
        userId = response.user?.id || response.user?.userId || response.userId || response.user?._id || response.id;
      }
      
      console.log('Final userId:', userId); // Debug log
      
      if (userId) {
        localStorage.setItem('userId', userId);
      } else {
        console.warn('No valid user ID found in response:', response);
        // Set a temporary ID to prevent undefined errors
        localStorage.setItem('userId', 'temp-user-id');
      }
      
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: {
          user: {
            id: userId,
            username: response.username || response.user?.username,
            email: response.email || response.user?.email,
            isVerified: true, // Skip OTP verification - assume user is verified
          },
          restaurantId: userId, // Use userId as restaurantId initially
        },
      });
      
      return { ...response, isVerified: true, skipOTP: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const signin = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    
    try {
      const response = await apiService.signin(credentials);
      
      if (response.success) {
        // Store user info in localStorage
        localStorage.setItem('userId', response.user.userId);
        
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: {
            user: response.user,
            restaurantId: response.user.restaurantId || response.user.userId,
          },
        });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // OTP verification function (commented out for now)
  // const verifyOtp = async (otpData) => {
  //   dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
  //   dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  //   
  //   try {
  //     const response = await apiService.verifyOtp(otpData);
  //     return response;
  //   } catch (error) {
  //     dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
  //     throw error;
  //   }
  // };
  
  const verifyOtp = async (otpData) => {
    // Skip OTP verification for now
    console.log('OTP verification skipped:', otpData);
    return { success: true, message: 'OTP verification skipped' };
  };

  const logout = () => {
    apiService.removeToken();
    localStorage.removeItem('userId');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    signup,
    signin,
    verifyOtp,
    logout,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}