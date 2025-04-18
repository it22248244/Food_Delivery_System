const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const axios = require('axios');
const config = require('../config/config');

// Send order confirmation notifications
exports.sendOrderConfirmation = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Order ID is required'
      });
    }
    
    // Fetch order details
    let orderData;
    try {
      const orderResponse = await axios.get(`${config.servicesEndpoints.orderService}/api/v1/orders/${orderId}`);
      orderData = orderResponse.data.data.order;
    } catch (error) {
      console.error('Error fetching order data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }
    
    // Fetch user details
    let userData;
    try {
      const userResponse = await axios.get(`${config.servicesEndpoints.userService}/api/v1/users/${orderData.userId}`);
      userData = userResponse.data.data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Send email notification
    try {
      const emailResult = await emailService.sendOrderConfirmation(orderData, userData);
      
      // Create notification record
      await Notification.create({
        userId: userData._id,
        type: 'ORDER_CONFIRMATION',
        channel: 'email',
        content: {
          subject: `Order Confirmation - Order #${orderData._id}`,
          message: `Your order #${orderData._id} has been received and is being processed.`
        },
        metadata: {
          orderId: orderData._id,
          restaurantId: orderData.restaurantId
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      // Continue even if email fails
    }
    
    // Send SMS notification
    try {
      const smsResult = await smsService.sendOrderConfirmation(orderData, userData);
      
      // Create notification record
      await Notification.create({
        userId: userData._id,
        type: 'ORDER_CONFIRMATION',
        channel: 'sms',
        content: {
          message: `Your order #${orderData._id} has been received and is being processed. Total: LKR ${orderData.totalAmount.toFixed(2)}. Track your order in the app.`
        },
        metadata: {
          orderId: orderData._id,
          restaurantId: orderData.restaurantId
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending order confirmation SMS:', error);
      // Continue even if SMS fails
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Order confirmation notifications sent'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Send order status update notifications
exports.sendOrderStatusUpdate = async (req, res) => {
  try {
    const { orderId, userId, status, estimatedDeliveryTime } = req.body;
    
    if (!orderId || !userId || !status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Order ID, user ID, and status are required'
      });
    }
    
    // Fetch order details
    let orderData;
    try {
      const orderResponse = await axios.get(`${config.servicesEndpoints.orderService}/api/v1/orders/${orderId}`);
      orderData = orderResponse.data.data.order;
    } catch (error) {
      // Use the provided data if order fetch fails
      orderData = {
        _id: orderId,
        userId,
        status,
        estimatedDeliveryTime
      };
    }
    
    // Fetch user details
    let userData;
    try {
      const userResponse = await axios.get(`${config.servicesEndpoints.userService}/api/v1/users/${userId}`);
      userData = userResponse.data.data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Send email notification
    try {
      const emailResult = await emailService.sendOrderStatusUpdate(orderData, userData);
      
      // Create notification record
      await Notification.create({
        userId: userData._id,
        type: 'ORDER_STATUS_UPDATE',
        channel: 'email',
        content: {
          subject: `Order Status Update - Order #${orderData._id}`,
          message: `Your order status has been updated to: ${status}`
        },
        metadata: {
          orderId: orderData._id,
          restaurantId: orderData.restaurantId
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending order status update email:', error);
      // Continue even if email fails
    }
    
    // Send SMS notification
    try {
      const smsResult = await smsService.sendOrderStatusUpdate(orderData, userData);
      
      // Create notification record
      await Notification.create({
        userId: userData._id,
        type: 'ORDER_STATUS_UPDATE',
        channel: 'sms',
        content: {
          message: `Your order #${orderData._id} status has been updated to: ${status.toUpperCase()}.`
        },
        metadata: {
          orderId: orderData._id,
          restaurantId: orderData.restaurantId
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending order status update SMS:', error);
      // Continue even if SMS fails
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Order status update notifications sent'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Send payment confirmation notifications
exports.sendPaymentConfirmation = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;
    
    if (!paymentId || !orderId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment ID and Order ID are required'
      });
    }
    
    // Fetch payment details
    let paymentData;
    try {
      const paymentResponse = await axios.get(`${config.servicesEndpoints.paymentService}/api/v1/payments/${paymentId}`);
      paymentData = paymentResponse.data.data.payment;
    } catch (error) {
      console.error('Error fetching payment data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Payment not found'
      });
    }
    
    // Fetch order details
    let orderData;
    try {
      const orderResponse = await axios.get(`${config.servicesEndpoints.orderService}/api/v1/orders/${orderId}`);
      orderData = orderResponse.data.data.order;
    } catch (error) {
      console.error('Error fetching order data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }
    
    // Fetch user details
    let userData;
    try {
      const userResponse = await axios.get(`${config.servicesEndpoints.userService}/api/v1/users/${paymentData.userId}`);
      userData = userResponse.data.data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Send email notification
    try {
      const emailResult = await emailService.sendPaymentConfirmation(paymentData, userData, orderData);
      
      // Create notification record
      await Notification.create({
        userId: userData._id,
        type: 'PAYMENT_CONFIRMATION',
        channel: 'email',
        content: {
          subject: `Payment Confirmation - Order #${orderData._id}`,
          message: `Your payment of LKR ${paymentData.amount.toFixed(2)} for order #${orderData._id} has been confirmed.`
        },
        metadata: {
          orderId: orderData._id,
          paymentId: paymentData._id
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      // Continue even if email fails
    }
    
    // Send SMS notification
    try {
      const smsResult = await smsService.sendPaymentConfirmation(paymentData, userData, orderData);
      
      // Create notification record
      await Notification.create({
        userId: userData._id,
        type: 'PAYMENT_CONFIRMATION',
        channel: 'sms',
        content: {
          message: `Your payment of LKR ${paymentData.amount.toFixed(2)} for order #${orderData._id} has been confirmed. Thank you!`
        },
        metadata: {
          orderId: orderData._id,
          paymentId: paymentData._id
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending payment confirmation SMS:', error);
      // Continue even if SMS fails
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Payment confirmation notifications sent'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Send delivery assignment notifications
exports.sendDeliveryAssignment = async (req, res) => {
  try {
    const { deliveryId, deliveryPersonId, orderId } = req.body;
    
    if (!deliveryId || !deliveryPersonId || !orderId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Delivery ID, delivery person ID, and order ID are required'
      });
    }
    
    // Fetch delivery details
    let deliveryData;
    try {
      const deliveryResponse = await axios.get(`${config.servicesEndpoints.deliveryService}/api/v1/deliveries/${deliveryId}`);
      deliveryData = deliveryResponse.data.data.delivery;
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Delivery not found'
      });
    }
    
    // Fetch order details
    let orderData;
    try {
      const orderResponse = await axios.get(`${config.servicesEndpoints.orderService}/api/v1/orders/${orderId}`);
      orderData = orderResponse.data.data.order;
    } catch (error) {
      console.error('Error fetching order data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }
    
    // Fetch delivery person details
    let deliveryPersonData;
    try {
      const deliveryPersonResponse = await axios.get(`${config.servicesEndpoints.userService}/api/v1/users/${deliveryPersonId}`);
      deliveryPersonData = deliveryPersonResponse.data.data.user;
    } catch (error) {
      console.error('Error fetching delivery person data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Delivery person not found'
      });
    }
    
    // Send email notification
    try {
      const emailResult = await emailService.sendDeliveryAssignment(deliveryData, deliveryPersonData, orderData);
      
      // Create notification record
      await Notification.create({
        userId: deliveryPersonId,
        type: 'DELIVERY_ASSIGNMENT',
        channel: 'email',
        content: {
          subject: `New Delivery Assignment - Order #${orderData._id}`,
          message: `You have been assigned a new delivery for order #${orderData._id}.`
        },
        metadata: {
          orderId: orderData._id,
          deliveryId: deliveryData._id
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending delivery assignment email:', error);
      // Continue even if email fails
    }
    
    // Send SMS notification
    try {
      const smsResult = await smsService.sendDeliveryAssignment(deliveryData, deliveryPersonData, orderData);
      
      // Create notification record
      await Notification.create({
        userId: deliveryPersonId,
        type: 'DELIVERY_ASSIGNMENT',
        channel: 'sms',
        content: {
          message: `New delivery assignment for order #${orderData._id}. Please check the app for details.`
        },
        metadata: {
          orderId: orderData._id,
          deliveryId: deliveryData._id
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending delivery assignment SMS:', error);
      // Continue even if SMS fails
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Delivery assignment notifications sent'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Send delivery status notifications
exports.sendDeliveryStatusUpdate = async (req, res) => {
  try {
    const { deliveryId, orderId, userId, status, currentLocation } = req.body;
    
    if (!deliveryId || !orderId || !userId || !status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Delivery ID, order ID, user ID, and status are required'
      });
    }
    
    // Fetch delivery details
    let deliveryData;
    try {
      const deliveryResponse = await axios.get(`${config.servicesEndpoints.deliveryService}/api/v1/deliveries/${deliveryId}`);
      deliveryData = deliveryResponse.data.data.delivery;
    } catch (error) {
      // Use provided data if fetch fails
      deliveryData = {
        _id: deliveryId,
        orderId,
        status,
        currentLocation
      };
    }
    
    // Fetch user details
    let userData;
    try {
      const userResponse = await axios.get(`${config.servicesEndpoints.userService}/api/v1/users/${userId}`);
      userData = userResponse.data.data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Send SMS notification
    try {
      const smsResult = await smsService.sendDeliveryUpdate(deliveryData, userData);
      
      // Create notification record
      await Notification.create({
        userId,
        type: 'DELIVERY_STATUS',
        channel: 'sms',
        content: {
          message: `Order #${orderId}: Your delivery status has been updated to ${status.toUpperCase()}.`
        },
        metadata: {
          orderId,
          deliveryId
        },
        status: 'sent',
        sentAt: Date.now()
      });
    } catch (error) {
      console.error('Error sending delivery status SMS:', error);
      // Continue even if SMS fails
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Delivery status notifications sent'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};