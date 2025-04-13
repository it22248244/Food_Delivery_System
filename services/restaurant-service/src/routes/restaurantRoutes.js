const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurant);

// Protected routes
router.use(authMiddleware.protect);

// Get restaurant by owner ID
router.get('/owner/:ownerId', 
  authMiddleware.restrictTo('restaurant', 'admin'),
  restaurantController.getRestaurantByOwner
);

// Restrict restaurant creation to restaurant owners and admins
router.post('/', 
  authMiddleware.restrictTo('restaurant', 'admin'),
  restaurantController.createRestaurant
);

// Restaurant management routes
router.patch('/:id', 
  authMiddleware.restrictTo('restaurant', 'admin'),
  restaurantController.updateRestaurant
);
router.delete('/:id', restaurantController.deleteRestaurant);

// Admin verification routes
router.patch('/:id/verify',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  restaurantController.updateVerificationStatus
);

// Menu management routes
router.post('/:restaurantId/menu', menuController.addMenuItem);
router.patch('/:restaurantId/menu/:menuItemId', menuController.updateMenuItem);
router.delete('/:restaurantId/menu/:menuItemId', menuController.deleteMenuItem);

module.exports = router;