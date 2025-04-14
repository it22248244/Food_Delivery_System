const Order = require('../models/Order');
const axios = require('axios');
const config = require('../config/config');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    // Set user ID from authenticated user
    req.body.userId = req.user.id;
    
    // Calculate total amount from items
    const totalAmount = req.body.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    
    // Add delivery fee to total
    const orderData = {
      ...req.body,
      totalAmount: totalAmount + (req.body.deliveryFee || 0)
    };
    
    // Create order
    const newOrder = await Order.create(orderData);
    
    // Notify restaurant service about new order
    try {
      await axios.post(`${config.servicesEndpoints.notificationService}/api/v1/notifications/new-order`, {
        orderId: newOrder._id,
        restaurantId: newOrder.restaurantId,
        type: 'NEW_ORDER'
      });
    } catch (error) {
      console.error('Error notifying restaurant about new order:', error);
      // Continue even if notification fails
    }
    
    // If payment method is not cash, initiate payment
    let redirectUrl = null;
    if (newOrder.paymentMethod !== 'cash') {
      try {
        const paymentResponse = await axios.post(
          `${config.servicesEndpoints.paymentService}/api/v1/payments/initiate`,
          {
            orderId: newOrder._id,
            amount: newOrder.totalAmount,
            paymentMethod: newOrder.paymentMethod,
            userId: newOrder.userId,
            restaurantId: newOrder.restaurantId
          }
        );
        
        // Update order with payment info
        newOrder.paymentId = paymentResponse.data.data.paymentId;
        await newOrder.save();
        
        // Get redirect URL if available
        if (paymentResponse.data.data.redirectUrl) {
          redirectUrl = paymentResponse.data.data.redirectUrl;
        }
      } catch (error) {
        console.error('Error initiating payment:', error);
        // Continue with pending payment status
      }
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
        redirectUrl: redirectUrl
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};
// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all orders for a restaurant
exports.getRestaurantOrders = async (req, res) => {
  try {
    // Verify if user is the restaurant owner
    const restaurantId = req.params.restaurantId;
    
    // TODO: Add restaurant ownership verification
    
    // Get orders by restaurant ID
    const orders = await Order.find({ 
      restaurantId,
      status: { $ne: 'cancelled' }  
    }).sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get a specific order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }
    
    // Check if user has permissions to view this order
    if (
      order.userId.toString() !== req.user.id && 
      req.user.role !== 'admin' &&
      req.user.role !== 'restaurant' &&
      req.user.role !== 'delivery'
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this order'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Status is required'
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }
    
    // Check permissions based on role and requested status change
    if (req.user.role === 'customer' && status !== 'cancelled') {
      return res.status(403).json({
        status: 'fail',
        message: 'Customers can only cancel orders'
      });
    }
    
    if (req.user.role === 'restaurant' && 
        !['confirmed', 'preparing', 'ready_for_pickup', 'cancelled'].includes(status)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid status update for restaurant'
      });
    }
    
    if (req.user.role === 'delivery' && 
        !['out_for_delivery', 'delivered'].includes(status)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid status update for delivery personnel'
      });
    }
    
    // Update order status
    order.status = status;
    
    // If order is confirmed, estimate delivery time
    if (status === 'confirmed') {
      const estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + 45); // 45 minutes from now
      order.estimatedDeliveryTime = estimatedTime;
      
      // Assign delivery person if order is confirmed
      try {
        const deliveryResponse = await axios.post(
          `${config.servicesEndpoints.deliveryService}/api/v1/delivery/assign`,
          {
            orderId: order._id,
            restaurantId: order.restaurantId,
            deliveryAddress: order.deliveryAddress
          }
        );
        
        if (deliveryResponse.data.deliveryPersonId) {
          order.deliveryPersonId = deliveryResponse.data.deliveryPersonId;
        }
      } catch (error) {
        console.error('Error assigning delivery person:', error);
        // Continue even if assignment fails
      }
    }
    
    // If order is cancelled, check if payment should be refunded
    if (status === 'cancelled' && order.paymentStatus === 'paid') {
      try {
        await axios.post(
          `${config.servicesEndpoints.paymentService}/api/v1/payments/refund`,
          {
            paymentId: order.paymentId,
            orderId: order._id
          }
        );
      } catch (error) {
        console.error('Error processing refund:', error);
        // Continue even if refund fails
      }
    }
    
    await order.save();
    
    // Send notification about status update
    try {
      await axios.post(`${config.servicesEndpoints.notificationService}/api/v1/notifications/order-status`, {
        orderId: order._id,
        userId: order.userId,
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      });
    } catch (error) {
      console.error('Error sending status notification:', error);
      // Continue even if notification fails
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }
    
    // Check if user is the order owner
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to cancel this order'
      });
    }
    
    // Check if order can be cancelled (only pending or confirmed orders)
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Order cannot be cancelled in ${order.status} status`
      });
    }
    
    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();
    
    // Process refund if payment was made
    if (order.paymentStatus === 'paid') {
      try {
        await axios.post(
          `${config.servicesEndpoints.paymentService}/api/v1/payments/refund`,
          {
            paymentId: order.paymentId,
            orderId: order._id
          }
        );
      } catch (error) {
        console.error('Error processing refund:', error);
        // Continue even if refund fails
      }
    }
    
    // Notify restaurant and delivery service about cancellation
    try {
      await axios.post(`${config.servicesEndpoints.notificationService}/api/v1/notifications/order-cancelled`, {
        orderId: order._id,
        restaurantId: order.restaurantId,
        deliveryPersonId: order.deliveryPersonId
      });
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
      // Continue even if notification fails
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid order status'
      });
    }
    
    // Find orders with the specified status
    const orders = await Order.find({ status })
      .sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update order with delivery person
exports.updateOrderDeliveryPerson = async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    
    if (!deliveryPersonId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Delivery person ID is required'
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }
    
    // Make sure the order is in a state that can be assigned to a delivery person
    if (!['confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Order cannot be assigned to a delivery person in ${order.status} status`
      });
    }
    
    // Update the order with the delivery person ID
    order.deliveryPersonId = deliveryPersonId;
    
    // If order is not yet marked as out_for_delivery, mark it now
    if (order.status === 'ready_for_pickup') {
      order.status = 'out_for_delivery';
    }
    
    await order.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};