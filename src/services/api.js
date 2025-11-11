// API Service Layer for Restaurant Management System
// Base URL resolution:
// - In production, set VITE_API_URL to your backend (e.g., https://api.yourdomain.com)
// - In development, defaults to http://localhost:4000
const getBaseUrl = () => {
  const envUrl = (import.meta?.env?.VITE_API_URL ?? '').toString().trim();
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000';
    }
  }

  // Fallback: use '/api' prefix so hosts can proxy to backend
  // Note: In production on Vercel, add a rewrite for /api/(.*) -> https://your-backend/$1
  return '/api';
};

class ApiService {
  constructor() {
    this.baseURL = getBaseUrl();
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to make requests with auth headers
  async request(endpoint, options = {}) {
    const headers = { ...(options.headers || {}) };

    // Only set Content-Type for non-FormData bodies if not provided
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const config = {
      ...options,
      headers,
    };

    // Add auth token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;

    let response;
    try {
      response = await fetch(url, config);
    } catch (e) {
      throw new Error(`Network error while calling ${url}: ${e.message}`);
    }

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {}

      let message = `Request failed with ${response.status} ${response.statusText}`;
      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          message = parsed?.message || parsed?.error || errorText;
        } catch {
          message = errorText;
        }
      }
      throw new Error(message);
    }

    return response.json();
  }

  // Helper method for public endpoints (no authentication required)
  async publicRequest(endpoint, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    const config = {
      ...options,
      headers,
    };

    const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;

    let response;
    try {
      response = await fetch(url, config);
    } catch (e) {
      throw new Error(`Network error while calling ${url}: ${e.message}`);
    }
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {}

      let message = `Request failed with ${response.status} ${response.statusText}`;
      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          message = parsed?.message || parsed?.error || errorText;
        } catch {
          message = errorText;
        }
      }
      throw new Error(message);
    }

    return response.json();
  }

  // Update token in localStorage and instance
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // === AUTH ENDPOINTS ===
  async signup(userData) {
    const response = await this.request('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async signin(credentials) {
    const response = await this.request('/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyOtp(otpData) {
    const response = await this.request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async forgotPassword(email) {
    return this.request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetData) {
    return this.request('/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  async getUserProfile(userId) {
    return this.request(`/user-profile/${userId}`);
  }

  async getRestaurantProfile(restaurantId) {
    return this.publicRequest(`/rest-profile/${restaurantId}`);
  }

  async getAllUsers() {
    return this.request('/getall/user');
  }

  // === MENU ENDPOINTS ===
  async getMenuItems(restaurantId) {
    // Get restaurantId from localStorage (priority: restaurant_order_restaurant_id > restaurantId)
    let localStorageRestaurantId = null;
    if (typeof window !== 'undefined') {
      localStorageRestaurantId = localStorage.getItem('restaurant_order_restaurant_id') || 
                                  localStorage.getItem('restaurantId');
    }
    
    // Use restaurantId from localStorage or function parameter
    const finalRestaurantId = localStorageRestaurantId || restaurantId;
    
    // Use public route with localStorage restaurantId in query params
    let url = '/menu/public/allmenues';
    if (finalRestaurantId) {
      url += `?restaurantId=${encodeURIComponent(finalRestaurantId)}`;
    }
    
    return this.publicRequest(url);
  }

  async createMenuItem(menuData) {
    // For FormData (with file uploads)
    return this.request('/menu/add', {
      method: 'POST',
      body: menuData, // FormData object
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async updateMenuItem(menuId, menuData) {
    return this.request(`/menu/${menuId}`, {
      method: 'PUT',
      body: menuData,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async deleteMenuItem(menuId) {
    console.log('Attempting to delete menu item with ID:', menuId);
    const response = await this.request(`/menu/delete/${menuId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    console.log('Delete API response:', response);
    return response;
  }

  async updateMenuStatus(statusData) {
    return this.request('/menus/status', {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // === ORDER ENDPOINTS ===
  async createOrder(orderData) {
    return this.publicRequest('/create/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getAllOrders() {
    return this.request('/all/order');
  }

  async getOrderById(orderId) {
    return this.request(`/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getCombinedOrders(data) {
    return this.request('/orders/active-tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/${orderId}`, {
      method: 'DELETE',
    });
  }

  // === RESERVATION ENDPOINTS ===
  async createReservation(reservationData) {
    return this.publicRequest('/reservations/add', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async getAllReservations(restaurantId) {
    return this.request(`/AllByRestaurantId/${restaurantId}`);
  }

  async getReservationsByUser(userId) {
    return this.request(`/user/${userId}`);
  }

  async updateReservation(reservationId, reservationData) {
    return this.request(`/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(reservationData),
    });
  }

  async cancelReservation(reservationId) {
    return this.request(`/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // === CATEGORY ENDPOINTS ===
  async getCategories(restaurantId) {
    // Use public route - backend will use env RESTAURANT_ID automatically
    const url = '/public/categories';
    return this.publicRequest(url);
  }

  async createCategory(categoryData) {
    return this.request('/category', {
      method: 'POST',
      body: categoryData, // FormData for image upload
      headers: {
        Authorization: `Bearer ${this.token}`,
        // Don't set Content-Type for FormData
      },
    });
  }

  async findOrCreateCategory(categoryName, restaurantId) {
    try {
      // Get existing categories
      const response = await this.getCategories();
      const categories = response.data || [];
      
      // Find existing category by name
      const existingCategory = categories.find(
        cat => cat.categoryName.toLowerCase() === categoryName.toLowerCase()
      );
      
      if (existingCategory) {
        return existingCategory;
      }
      
      // Create new category if not found
      const formData = new FormData();
      formData.append('categoryName', categoryName);
      formData.append('description', `${categoryName} items`);
      
      // Create a simple 1x1 pixel image as placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 1, 1);
      
      canvas.toBlob(blob => {
        formData.append('categoryImage', blob, 'placeholder.png');
      });
      
      const newCategory = await this.createCategory(formData);
      return newCategory;
      
    } catch (error) {
      console.error('Error finding/creating category:', error);
      throw error;
    }
  }

  // === CUSTOMER ENDPOINTS ===
  async getCustomers(restaurantId) {
    const url = restaurantId 
      ? `/customers?restaurantId=${restaurantId}` 
      : '/customers';
    return this.request(url);
  }

  async createCustomer(customerData) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }
}

// Export singleton instance
export default new ApiService();

// Export individual methods for easier importing
export const {
  signup,
  signin,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getUserProfile,
  getRestaurantProfile,
  getAllUsers,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuStatus,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getCombinedOrders,
  deleteOrder,
  createReservation,
  getAllReservations,
  getReservationsByUser,
  updateReservation,
  cancelReservation,
  getCategories,
  createCategory,
  getCustomers,
  createCustomer,
} = new ApiService();