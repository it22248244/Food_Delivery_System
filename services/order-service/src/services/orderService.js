const Order = require('../models/Order');
const axios = require('axios');
const config = require('../config/config');

class OrderService {
  // Create a new order
  async createOrder(orderData) {
    try {
      // Verify restaurant and menu items
      await this.verifyRestaurantAndItems(orderData);
      
      // Create order
      const order = await Order.create({
        userId: orderData.userId,
        restaurantId: orderData.restaurantId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        deliveryFee: orderData.deliveryFee || 150,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentMethod === 'cash' ? 'pending' : 'pending',
        specialInstructions: orderData.specialInstructions,
        status: 'pending'
      });
      
      // Notify restaurant about new order
      await this.notifyRestaurant(order);
      
      // Send confirmation to customer
      await this.sendOrderConfirmation(order);
      
      return order;
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }
  
  // Verify restaurant and menu items with restaurant service
  async verifyRestaurantAndItems(orderData) {
    try {
      // Get restaurant details
      const restaurantResponse = await axios.get(`${config.servicesEndpoints.restaurantService}/restaurants/${orderData.restaurantId}`);
      const restaurant = restaurantResponse.data.data.restaurant;
      
      if (!restaurant.isOpen) {
        throw new Error('Restaurant is currently closed');
      }
      
      // Verify menu items and calculate total
      const menu = restaurant.menu || [];
      let calculatedTotal = 0;
      
      for (const orderItem of orderData.items) {
        const menuItem = menu.find(item => item._id.toString() === orderItem.menuItemId.toString());
        
        if (!menuItem) {
          throw new Error(`Menu item ${orderItem.menuItemId} not found`);
        }
        
        if (!menuItem.isAvailable) {
          throw new Error(`${menuItem.name} is currently unavailable`);
        }
        
        calculatedTotal += menuItem.price * orderItem.quantity;
      }
      
      // Add delivery fee
      calculatedTotal += orderData.deliveryFee || 150;
      
      // Verify total amount
      if (Math.abs(calculatedTotal - orderData.totalAmount) > 1) {
        throw new Error('Total amount mismatch');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Validation error: ${error.message}`);
    }
  }
  
  // Notify restaurant about new order
  async notifyRestaurant(order) {
    try {
      await axios.post(`${config.servicesEndpoints.notificationService}/notifications/order-confirmation`, {
        orderId: order._id
      });
    } catch (error) {
      console.error('Error notifying restaurant:', error);
      // Continue even if notification fails
    }
  }
  
  // Send order confirmation to customer
  async sendOrderConfirmation(order) {
    try {
      await axios.post(`${config.servicesEndpoints.notificationService}/notifications/order-confirmation`, {
        orderId: order._id
      });
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      // Continue even if notification fails
    }
  }
  
  // Update order status
  async updateOrderStatus(id, status) {
    try {
      const order = await Order.findById(id);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      order.status = status;
      
      // If order is confirmed, set estimated delivery time
      if (status === 'confirmed') {
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + 45);
        order.estimatedDeliveryTime = estimatedTime;
      }
      
      // If order is ready for pickup, assign delivery person
      if (status === 'ready_for_pickup') {
        await this.assignDelivery(order);
      }
      
      await order.save();
      
      // Notify customer about status update
      await this.sendStatusUpdate(order);
      
      return order;
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }
  
  // Assign delivery
  async assignDelivery(order) {
    try {
      // Get restaurant address
      const restaurantResponse = await axios.get(`${config.servicesEndpoints.restaurantService}/restaurants/${order.restaurantId}`);
      const restaurantAddress = restaurantResponse.data.data.restaurant.address;
      
      // Create delivery request
      await axios.post(`${config.servicesEndpoints.deliveryService}/deliveries/assign`, {
        orderId: order._id,
        restaurantId: order.restaurantId,
        restaurantAddress: restaurantAddress,
        deliveryAddress: order.deliveryAddress
      });
    } catch (error) {
      console.error('Error assigning delivery:', error);
      // Continue even if assignment fails
    }
  }
  
  // Send status update to customer
  async sendStatusUpdate(order) {
    try {
      await axios.post(`${config.servicesEndpoints.notificationService}/notifications/order-status`, {
        orderId: order._id,
        userId: order.userId,
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      });
    } catch (error) {
      console.error('Error sending status update:', error);
      // Continue even if notification fails
    }
  }
}

module.exports = new OrderService();