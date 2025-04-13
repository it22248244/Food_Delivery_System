const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

class RestaurantService {
  // Get all restaurants with filtering options
  async getAllRestaurants(filters = {}) {
    try {
      let query = {};
      
      // Apply filters
      if (filters.cuisine) {
        query.cuisine = { $regex: filters.cuisine, $options: 'i' };
      }
      
      if (filters.isOpen === 'true') {
        query.isOpen = true;
      }
      
      if (filters.city) {
        query['address.city'] = { $regex: filters.city, $options: 'i' };
      }
      
      // Execute query
      const restaurants = await Restaurant.find(query)
        .select('name cuisine description rating address images isOpen')
        .sort({ rating: -1 });
      
      return restaurants;
    } catch (error) {
      throw new Error(`Error fetching restaurants: ${error.message}`);
    }
  }
  
  // Get restaurant by ID
  async getRestaurantById(id) {
    try {
      const restaurant = await Restaurant.findById(id);
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      return restaurant;
    } catch (error) {
      throw new Error(`Error fetching restaurant: ${error.message}`);
    }
  }
  
  // Create new restaurant
  async createRestaurant(restaurantData, userId) {
    try {
      const restaurant = await Restaurant.create({
        ...restaurantData,
        owner: userId
      });
      
      return restaurant;
    } catch (error) {
      throw new Error(`Error creating restaurant: ${error.message}`);
    }
  }
  
  // Update restaurant
  async updateRestaurant(id, restaurantData, userId) {
    try {
      const restaurant = await Restaurant.findById(id);
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      // Ensure user is the owner or an admin
      if (restaurant.owner.toString() !== userId && userData.role !== 'admin') {
        throw new Error('You are not authorized to update this restaurant');
      }
      
      // Update fields
      Object.keys(restaurantData).forEach(key => {
        if (key !== 'owner') { // Prevent owner change
          restaurant[key] = restaurantData[key];
        }
      });
      
      await restaurant.save();
      
      return restaurant;
    } catch (error) {
      throw new Error(`Error updating restaurant: ${error.message}`);
    }
  }
  
  // Add menu item
  async addMenuItem(restaurantId, menuItemData, userId) {
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      // Ensure user is the owner or an admin
      if (restaurant.owner.toString() !== userId && userData.role !== 'admin') {
        throw new Error('You are not authorized to update this restaurant');
      }
      
      // Add new menu item
      const menuItem = {
        _id: new mongoose.Types.ObjectId(),
        ...menuItemData
      };
      
      restaurant.menu.push(menuItem);
      await restaurant.save();
      
      return menuItem;
    } catch (error) {
      throw new Error(`Error adding menu item: ${error.message}`);
    }
  }
  
  // Update menu item
  async updateMenuItem(restaurantId, menuItemId, menuItemData, userId) {
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      // Ensure user is the owner or an admin
      if (restaurant.owner.toString() !== userId && userData.role !== 'admin') {
        throw new Error('You are not authorized to update this restaurant');
      }
      
      // Find menu item
      const menuItemIndex = restaurant.menu.findIndex(
        item => item._id.toString() === menuItemId
      );
      
      if (menuItemIndex === -1) {
        throw new Error('Menu item not found');
      }
      
      // Update menu item fields
      Object.keys(menuItemData).forEach(key => {
        restaurant.menu[menuItemIndex][key] = menuItemData[key];
      });
      
      await restaurant.save();
      
      return restaurant.menu[menuItemIndex];
    } catch (error) {
      throw new Error(`Error updating menu item: ${error.message}`);
    }
  }
  
  // Delete menu item
  async deleteMenuItem(restaurantId, menuItemId, userId) {
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      // Ensure user is the owner or an admin
      if (restaurant.owner.toString() !== userId && userData.role !== 'admin') {
        throw new Error('You are not authorized to update this restaurant');
      }
      
      // Remove menu item
      restaurant.menu = restaurant.menu.filter(
        item => item._id.toString() !== menuItemId
      );
      
      await restaurant.save();
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting menu item: ${error.message}`);
    }
  }
}

module.exports = new RestaurantService();