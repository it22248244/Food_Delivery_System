import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Create an axios instance with default config
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add auth token to requests
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

/**
 * Setup response interceptors for handling common errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle API errors
    if (error.response) {
      // Unauthorized errors - token may be expired
      if (error.response.status === 401) {
        // Clear token if expired
        localStorage.removeItem('token');
      }
      
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Network errors
      return Promise.reject({ 
        message: 'Network error. Please check your internet connection.' 
      });
    } else {
      // Other errors
      return Promise.reject({
        message: 'An unexpected error occurred. Please try again.'
      });
    }
  }
);

/**
 * API service functions
 */
const apiService = {
  /**
   * Authentication calls
   */
  auth: {
    /**
     * Login user
     * @param {Object} credentials - User credentials
     * @returns {Promise} API response
     */
    login: async (credentials) => {
      try {
        const response = await api.post('/auth/login', credentials);
        
        if (response.data && response.data.token) {
          setAuthToken(response.data.token);
        }
        
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise} API response
     */
    register: async (userData) => {
      try {
        const response = await api.post('/auth/register', userData);
        
        if (response.data && response.data.token) {
          setAuthToken(response.data.token);
        }
        
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Logout user
     */
    logout: () => {
      setAuthToken(null);
    }
  },
  
  /**
   * User API calls
   */
  users: {
    /**
     * Get current user profile
     * @returns {Promise} User data
     */
    getCurrentUser: async () => {
      try {
        const response = await api.get('/users/me');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Update user profile
     * @param {Object} userData - Updated user data
     * @returns {Promise} Updated user data
     */
    updateProfile: async (userData) => {
      try {
        const response = await api.put('/users/me', userData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },
  
  /**
   * Restaurant API calls
   */
  restaurants: {
    /**
     * Get all restaurants
     * @param {Object} params - Query parameters
     * @returns {Promise} Restaurants data
     */
    getAll: async (params = {}) => {
      try {
        const response = await api.get('/restaurants', { params });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Get restaurant by ID
     * @param {string} id - Restaurant ID
     * @returns {Promise} Restaurant data
     */
    getById: async (id) => {
      try {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Get restaurant menu
     * @param {string} id - Restaurant ID
     * @returns {Promise} Menu data
     */
    getMenu: async (id) => {
      try {
        const response = await api.get(`/restaurants/${id}/menu`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Create new restaurant (for restaurant owners)
     * @param {Object} restaurantData - Restaurant data
     * @returns {Promise} Created restaurant data
     */
    create: async (restaurantData) => {
      try {
        const response = await api.post('/restaurants', restaurantData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Update restaurant (for restaurant owners)
     * @param {string} id - Restaurant ID
     * @param {Object} updateData - Updated restaurant data
     * @returns {Promise} Updated restaurant data
     */
    update: async (id, updateData) => {
      try {
        const response = await api.put(`/restaurants/${id}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },
  
  /**
   * Order API calls
   */
  orders: {
    /**
     * Create new order
     * @param {Object} orderData - Order data
     * @returns {Promise} Created order data
     */
    create: async (orderData) => {
      try {
        const response = await api.post('/orders', orderData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Get user orders
     * @returns {Promise} User orders
     */
    getUserOrders: async () => {
      try {
        const response = await api.get('/orders');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Get order by ID
     * @param {string} id - Order ID
     * @returns {Promise} Order data
     */
    getById: async (id) => {
      try {
        const response = await api.get(`/orders/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Update order status (for restaurants/admin)
     * @param {string} id - Order ID
     * @param {string} status - New status
     * @returns {Promise} Updated order data
     */
    updateStatus: async (id, status) => {
      try {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },
  
  /**
   * Delivery API calls
   */
  delivery: {
    /**
     * Get assigned deliveries
     * @returns {Promise} Deliveries data
     */
    getAssignedDeliveries: async () => {
      try {
        const response = await api.get('/deliveries/assigned');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Update delivery status
     * @param {string} id - Delivery ID
     * @param {Object} statusData - Status update data
     * @returns {Promise} Updated delivery data
     */
    updateStatus: async (id, statusData) => {
      try {
        const response = await api.patch(`/deliveries/${id}/status`, statusData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },
  
  /**
   * Payment API calls
   */
  payments: {
    /**
     * Process payment
     * @param {Object} paymentData - Payment data
     * @returns {Promise} Payment result
     */
    processPayment: async (paymentData) => {
      try {
        const response = await api.post('/payments/process', paymentData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
};

export default apiService;