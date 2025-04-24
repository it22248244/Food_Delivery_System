const Delivery = require('../models/Delivery');
const axios = require('axios');
const config = require('../config/config');

class DeliveryService {
  // Assign delivery to a delivery person
  async assignDelivery(orderData, deliveryPersonId) {
    try {
      // Create a new delivery record
      const delivery = await Delivery.create({
        orderId: orderData.orderId,
        deliveryPersonId: deliveryPersonId,
        restaurantId: orderData.restaurantId,
        restaurantAddress: orderData.restaurantAddress,
        deliveryAddress: orderData.deliveryAddress,
        status: 'assigned',
        assignedAt: Date.now(),
        estimatedDeliveryTime: this.calculateEstimatedDeliveryTime()
      });
      
      // Notify delivery person
      await this.notifyDeliveryPerson(delivery);
      
      return delivery;
    } catch (error) {
      throw new Error(`Error assigning delivery: ${error.message}`);
    }
  }
  
  // Calculate estimated delivery time
  calculateEstimatedDeliveryTime() {
    // Simple calculation: current time + 45 minutes
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 45);
    return estimatedTime;
  }
  
  // Update delivery status
  async updateDeliveryStatus(id, statusData) {
    try {
      const delivery = await Delivery.findById(id);
      
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      delivery.status = statusData.status;
      
      // Add timestamps based on status
      if (statusData.status === 'picked_up') {
        delivery.pickedUpAt = Date.now();
      } else if (statusData.status === 'delivered') {
        delivery.deliveredAt = Date.now();
      }
      
      // Update location if provided
      if (statusData.currentLocation) {
        delivery.currentLocation = statusData.currentLocation;
      }
      
      await delivery.save();
      
      // Notify customer about status update
      await this.notifyCustomer(delivery);
      
      // Update order status if necessary
      if (['picked_up', 'delivered'].includes(statusData.status)) {
        await this.updateOrderStatus(delivery.orderId, statusData.status);
      }
      
      return delivery;
    } catch (error) {
      throw new Error(`Error updating delivery status: ${error.message}`);
    }
  }
  
  // Notify delivery person about assignment
  async notifyDeliveryPerson(delivery) {
    try {
      await axios.post(`${config.servicesEndpoints.notificationService}/notifications/delivery-assignment`, {
        deliveryId: delivery._id,
        deliveryPersonId: delivery.deliveryPersonId,
        orderId: delivery.orderId
      });
    } catch (error) {
      console.error('Error notifying delivery person:', error);
      // Continue even if notification fails
    }
  }
  
  // Notify customer about delivery status
  async notifyCustomer(delivery) {
    try {
      // Get order details to get userId
      const orderResponse = await axios.get(`${config.servicesEndpoints.orderService}/orders/${delivery.orderId}`);
      const userId = orderResponse.data.data.order.userId;
      
      await axios.post(`${config.servicesEndpoints.notificationService}/notifications/delivery-status`, {
        deliveryId: delivery._id,
        orderId: delivery.orderId,
        userId: userId,
        status: delivery.status,
        currentLocation: delivery.currentLocation
      });
    } catch (error) {
      console.error('Error notifying customer:', error);
      // Continue even if notification fails
    }
  }
  
  // Update order status based on delivery status
  async updateOrderStatus(orderId, deliveryStatus) {
    try {
      let orderStatus;
      
      if (deliveryStatus === 'picked_up') {
        orderStatus = 'out_for_delivery';
      } else if (deliveryStatus === 'delivered') {
        orderStatus = 'delivered';
      }
      
      if (orderStatus) {
        await axios.patch(`${config.servicesEndpoints.orderService}/orders/${orderId}/status`, {
          status: orderStatus
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Continue even if update fails
    }
  }
}

module.exports = new DeliveryService();