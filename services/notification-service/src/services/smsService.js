const axios = require('axios');
const config = require('../config/config');

class SmsService {
  constructor() {
    // Configure SMS gateway settings
    this.apiUrl = config.sms.apiUrl;
    this.apiKey = config.sms.apiKey;
    this.senderId = config.sms.senderId;
  }
  
  async sendSms(to, message) {
    try {
      // In a real implementation, you would call the SMS API
      // For this mock implementation, we'll just log the details
      
      console.log(`Sending SMS to: ${to}`);
      console.log(`Message: ${message}`);
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return success
      return {
        success: true,
        messageId: `${Date.now()}_${Math.floor(Math.random() * 1000)}`
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }
  
  async sendOrderConfirmation(orderData, userData) {
    const message = `Your order #${orderData._id} has been received and is being processed. Total: LKR ${orderData.totalAmount.toFixed(2)}. Track your order in the app.`;
    
    return this.sendSms(userData.phone, message);
  }
  
  async sendOrderStatusUpdate(orderData, userData) {
    const message = `Your order #${orderData._id} status has been updated to: ${orderData.status.toUpperCase()}. ${orderData.estimatedDeliveryTime ? `Estimated delivery: ${new Date(orderData.estimatedDeliveryTime).toLocaleTimeString()}.` : ''}`;
    
    return this.sendSms(userData.phone, message);
  }
  
  async sendPaymentConfirmation(paymentData, userData, orderData) {
    const message = `Your payment of LKR ${paymentData.amount.toFixed(2)} for order #${orderData._id} has been confirmed. Thank you!`;
    
    return this.sendSms(userData.phone, message);
  }
  
  async sendDeliveryAssignment(deliveryData, deliveryPersonData, orderData) {
    const message = `New delivery assignment for order #${orderData._id}. Please check the app for details.`;
    
    return this.sendSms(deliveryPersonData.phone, message);
  }
  
  async sendDeliveryUpdate(deliveryData, userData) {
    const statusMessages = {
      picked_up: 'Your order has been picked up by the delivery person.',
      in_transit: 'Your order is on the way to your location.',
      delivered: 'Your order has been delivered. Enjoy!'
    };
    
    const message = `Order #${deliveryData.orderId}: ${statusMessages[deliveryData.status] || 'Status updated to ' + deliveryData.status}`;
    
    return this.sendSms(userData.phone, message);
  }
}

module.exports = new SmsService();