const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const restaurantService = require('../services/restaurantService');

// Get menu for a restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const restaurant = await restaurantService.getRestaurantById(req.params.restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Restaurant not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        menu: restaurant.menu || []
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add menu item (restaurant owner only)
router.post('/:restaurantId', protect, async (req, res) => {
  try {
    const menuItem = await restaurantService.addMenuItem(
      req.params.restaurantId,
      req.body,
      req.user._id
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        menuItem
      }
    });
  } catch (error) {
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update menu item (restaurant owner only)
router.patch('/:restaurantId/:menuItemId', protect, async (req, res) => {
  try {
    const menuItem = await restaurantService.updateMenuItem(
      req.params.restaurantId,
      req.params.menuItemId,
      req.body,
      req.user._id
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        menuItem
      }
    });
  } catch (error) {
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete menu item (restaurant owner only)
router.delete('/:restaurantId/:menuItemId', protect, async (req, res) => {
  try {
    await restaurantService.deleteMenuItem(
      req.params.restaurantId,
      req.params.menuItemId,
      req.user._id
    );
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;