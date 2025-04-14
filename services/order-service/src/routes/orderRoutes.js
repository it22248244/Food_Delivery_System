// services/order-service/src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// Routes for all authenticated users
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

// Customer can cancel orders
router.post('/:id/cancel', orderController.cancelOrder);

// Restaurant routes
router.get('/restaurant/:restaurantId', 
  authMiddleware.restrictTo('restaurant', 'admin'),
  orderController.getRestaurantOrders
);

// Get orders by status (for delivery personnel to see ready_for_pickup orders)
router.get('/status/:status',
  authMiddleware.restrictTo('delivery', 'admin'),
  orderController.getOrdersByStatus
);

// Update order status route (for restaurants, delivery personnel, and admins)
router.patch('/:id/status',
  authMiddleware.restrictTo('restaurant', 'delivery', 'admin'),
  orderController.updateOrderStatus
);

// New route to assign delivery person to an order
router.patch('/:id/assign-delivery',
  authMiddleware.restrictTo('delivery', 'admin'),
  orderController.updateOrderDeliveryPerson
);

module.exports = router;