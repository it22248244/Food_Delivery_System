// src/api/restaurantApi.js
import api from './config';

export const getAllRestaurants = async (params = {}) => {
  try {
    const response = await api.get('/restaurants', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch restaurants' };
  }
};

export const getRestaurantById = async (id) => {
  try {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch restaurant details' };
  }
};

export const createRestaurant = async (restaurantData) => {
  try {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create restaurant' };
  }
};

export const updateRestaurant = async (id, restaurantData) => {
  try {
    const response = await api.patch(`/restaurants/${id}`, restaurantData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update restaurant' };
  }
};

// Menu item operations
export const addMenuItem = async (restaurantId, menuItemData) => {
  try {
    const response = await api.post(`/restaurants/${restaurantId}/menu`, menuItemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add menu item' };
  }
};

export const updateMenuItem = async (restaurantId, menuItemId, menuItemData) => {
  try {
    const response = await api.patch(`/restaurants/${restaurantId}/menu/${menuItemId}`, menuItemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update menu item' };
  }
};

export const deleteMenuItem = async (restaurantId, menuItemId) => {
  try {
    const response = await api.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete menu item' };
  }
};