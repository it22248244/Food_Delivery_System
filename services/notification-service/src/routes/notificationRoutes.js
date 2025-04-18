const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Routes for sending notifications
router.post('/order-confirmation', notificationController.sendOrderConfirmation);
router.post('/order-status', notificationController.sendOrderStatusUpdate);
router.post('/payment-confirmation', notificationController.sendPaymentConfirmation);
router.post('/delivery-assignment', notificationController.sendDeliveryAssignment);
router.post('/delivery-status', notificationController.sendDeliveryStatusUpdate);

module.exports = router;