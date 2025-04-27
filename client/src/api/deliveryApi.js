// src/api/deliveryApi.js
import api from './config';

/**
 * Get all deliveries assigned to the current delivery person
 * @returns {Promise} API response with deliveries data
 */
export const getMyDeliveries = async () => {
  try {
    const response = await api.get('/deliveries/my-deliveries');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch delivery assignments' };
  }
};

/**
 * Get delivery details for a specific order
 * @param {string} orderId - Order ID 
 * @returns {Promise} API response with delivery details
 */
export const getDeliveryByOrder = async (orderId) => {
  try {
    const response = await api.get(`/deliveries/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch delivery details' };
  }
};

/**
 * Update delivery status
 * @param {string} id - Delivery ID
 * @param {Object} statusData - Status update data
 * @param {string} statusData.status - New status
 * @returns {Promise} API response
 */
export const updateDeliveryStatus = async (id, statusData) => {
  try {
    const response = await api.patch(`/deliveries/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update delivery status' };
  }
};

/**
 * Update delivery location
 * @param {Object} locationData - Location data with latitude and longitude
 * @returns {Promise} API response
 */
export const updateDeliveryLocation = async (locationData) => {
  try {
    const response = await api.patch('/deliveries/location', locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update location' };
  }
};

/**
 * Accept a ready for pickup order
 * @param {string} orderId - Order ID to accept
 * @param {string} restaurantId - Restaurant ID for the order
 * @param {string} deliveryPersonId - ID of the delivery person accepting the order
 * @returns {Promise} API response
 */
export const acceptDeliveryOrder = async (orderId, restaurantId, deliveryPersonId) => {
  try {
    console.log('Accept delivery function called with:', { 
      orderId, 
      restaurantId, 
      deliveryPersonId 
    });
    
    // Validate parameters
    if (!orderId || orderId === 'undefined') {
      throw new Error('Invalid order ID provided');
    }
    
    if (!restaurantId || restaurantId === 'undefined') {
      throw new Error('Invalid restaurant ID provided');
    }
    
    if (!deliveryPersonId || deliveryPersonId === 'undefined') {
      throw new Error('Invalid delivery person ID provided');
    }
    
    // Make sure we send the right headers with the token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // First update the order status to out_for_delivery
    const orderResponse = await api.patch(`/orders/${orderId}/status`, {
      status: 'out_for_delivery'
    });
    
    console.log('Order status updated to out_for_delivery:', orderResponse);
    
    // Then create a delivery assignment
    const deliveryResponse = await api.post('/deliveries/assign', {
      orderId: orderId,
      restaurantId: restaurantId,
      deliveryPersonId: deliveryPersonId
    });
    
    console.log('Delivery assignment created:', deliveryResponse);
    
    return {
      order: orderResponse.data,
      delivery: deliveryResponse.data
    };
  } catch (error) {
    console.error('Error in acceptDeliveryOrder:', error);
    throw error.response?.data || { message: 'Failed to accept order: ' + (error.message || 'Unknown error') };
  }
};

/**
 * Get all orders with "ready_for_pickup" status
 * @returns {Promise} API response with orders data
 */
export const getReadyForPickupOrders = async () => {
  try {
    const response = await api.get('/orders', {
      params: {
        status: 'ready_for_pickup'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch available orders' };
  }
};