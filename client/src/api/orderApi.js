// src/api/orderApi.js
import api from './config';

// Helper function to check authentication
const checkAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  return token;
};

// Helper function to handle API errors
const handleApiError = (error, defaultMessage) => {
  console.error(`API Error: ${defaultMessage}`, error);
  
  if (!error.response) {
    throw {
      status: 0,
      message: 'Network error. Please check your connection.'
    };
  }
  
  if (error.response.status === 401) {
    throw {
      status: 401,
      message: 'Your session has expired. Please log in again.'
    };
  }
  
  throw error.response?.data || { 
    message: defaultMessage
  };
};

export const createOrder = async (orderData) => {
  try {
    checkAuth();
    
    // Transform payment method format if needed
    let paymentMethod = orderData.paymentMethod;
    if (paymentMethod === 'card') {
      paymentMethod = 'credit_card';
    }
    
    // Prepare order data with correct structure for API
    const apiOrderData = {
      restaurantId: orderData.restaurantId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      deliveryFee: orderData.deliveryFee,
      paymentMethod: paymentMethod,
      specialInstructions: orderData.specialInstructions,
      contactNumber: orderData.contactNumber
    };
    
    console.log('Sending order data to API:', apiOrderData);
    
    const response = await api.post('/orders', apiOrderData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to create order. Please try again.');
  }
};

export const getUserOrders = async () => {
  try {
    checkAuth();
    const response = await api.get('/orders/my-orders');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch user orders');
  }
};

export const getOrderById = async (id) => {
  try {
    checkAuth();
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch order details');
  }
};

export const getRestaurantOrders = async (restaurantId) => {
  try {
    checkAuth();
    
    // Use the restaurantId if provided, otherwise fetch orders for the logged-in restaurant owner
    const url = restaurantId
      ? `/orders/restaurant/${restaurantId}`
      : '/orders/restaurant/mine';
      
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch restaurant orders');
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    checkAuth();
    
    // Validate status
    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      throw {
        status: 400,
        message: 'Invalid order status'
      };
    }
    
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to update order status');
  }
};

export const cancelOrder = async (id) => {
  try {
    checkAuth();
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to cancel order');
  }
};

// New function to get order statistics
export const getOrderStatistics = async (restaurantId) => {
  try {
    checkAuth();
    const url = restaurantId
      ? `/orders/statistics/${restaurantId}`
      : '/orders/statistics/mine';
      
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch order statistics');
  }
};

// New function to get orders by date range
export const getOrdersByDateRange = async (startDate, endDate, restaurantId) => {
  try {
    checkAuth();
    
    const params = {
      startDate,
      endDate,
      ...(restaurantId && { restaurantId })
    };
    
    const response = await api.get('/orders/by-date-range', { params });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch orders by date range');
  }
};