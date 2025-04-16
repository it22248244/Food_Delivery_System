const Restaurant = require('../models/Restaurant');

// Add menu item
exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    
    // Check if restaurant exists
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found with that ID'
      });
    }
    
    // Check if user is the owner or admin
    if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this restaurant'
      });
    }
    
    // Add new menu item
    restaurant.menu.push(req.body);
    await restaurant.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        menuItem: restaurant.menu[restaurant.menu.length - 1]
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    
    // Check if restaurant exists
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found with that ID'
      });
    }
    
    // Check if user is the owner or admin
    if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this restaurant'
      });
    }
    
    // Find menu item
    const menuItemIndex = restaurant.menu.findIndex(
      item => item._id.toString() === req.params.menuItemId
    );
    
    if (menuItemIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'No menu item found with that ID'
      });
    }
    
    // Update menu item fields
    Object.keys(req.body).forEach(key => {
      restaurant.menu[menuItemIndex][key] = req.body[key];
    });
    
    await restaurant.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        menuItem: restaurant.menu[menuItemIndex]
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    
    // Check if restaurant exists
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found with that ID'
      });
    }
    
    // Check if user is the owner or admin
    if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this restaurant'
      });
    }
    
    // Find menu item
    const menuItemIndex = restaurant.menu.findIndex(
      item => item._id.toString() === req.params.menuItemId
    );
    
    if (menuItemIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'No menu item found with that ID'
      });
    }
    
    // Remove menu item
    restaurant.menu.splice(menuItemIndex, 1);
    await restaurant.save();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};