const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    // Create a transporter for sending emails
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });
  }
  
  async sendEmail(to, subject, html) {
    try {
      // In a real implementation, you would actually send the email
      // For this mock implementation, we'll just log the details
      
      console.log(`Sending email to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${html}`);
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return success
      return {
        success: true,
        messageId: `${Date.now()}_${Math.floor(Math.random() * 1000)}`
      };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
  
  async sendOrderConfirmation(orderData, userData) {
    const subject = `Order Confirmation - Order #${orderData._id}`;
    
    // Create HTML content for the email
    const html = `
      <h1>Your Order Has Been Received</h1>
      <p>Hello ${userData.name},</p>
      <p>Thank you for your order. We've received your order and will process it as soon as possible.</p>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> ${orderData._id}</p>
      <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</p>
      <p><strong>Total Amount:</strong> LKR ${orderData.totalAmount.toFixed(2)}</p>
      <h3>Items</h3>
      <ul>
        ${orderData.items.map(item => `
          <li>${item.name} x ${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}</li>
        `).join('')}
      </ul>
      <p>You can track your order status in the app.</p>
      <p>Thank you for choosing our service!</p>
    `;
    
    return this.sendEmail(userData.email, subject, html);
  }
  
  async sendOrderStatusUpdate(orderData, userData) {
    const subject = `Order Status Update - Order #${orderData._id}`;
    
    // Create HTML content for the email
    const html = `
      <h1>Your Order Status Has Been Updated</h1>
      <p>Hello ${userData.name},</p>
      <p>Your order status has been updated to: <strong>${orderData.status}</strong></p>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> ${orderData._id}</p>
      <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</p>
      ${orderData.estimatedDeliveryTime ? `
        <p><strong>Estimated Delivery Time:</strong> ${new Date(orderData.estimatedDeliveryTime).toLocaleString()}</p>
      ` : ''}
      <p>Thank you for choosing our service!</p>
    `;
    
    return this.sendEmail(userData.email, subject, html);
  }
  
  async sendPaymentConfirmation(paymentData, userData, orderData) {
    const subject = `Payment Confirmation - Order #${orderData._id}`;
    
    // Create HTML content for the email
    const html = `
      <h1>Payment Confirmation</h1>
      <p>Hello ${userData.name},</p>
      <p>We've received your payment for Order #${orderData._id}.</p>
      <h2>Payment Details</h2>
      <p><strong>Amount:</strong> LKR ${paymentData.amount.toFixed(2)}</p>
      <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
      <p><strong>Transaction ID:</strong> ${paymentData.transactionId || 'N/A'}</p>
      <p><strong>Date:</strong> ${new Date(paymentData.updatedAt).toLocaleString()}</p>
      <p>Thank you for your payment!</p>
    `;
    
    return this.sendEmail(userData.email, subject, html);
  }
  
  async sendDeliveryAssignment(deliveryData, deliveryPersonData, orderData) {
    const subject = `New Delivery Assignment - Order #${orderData._id}`;
    
    // Create HTML content for the email
    const html = `
      <h1>New Delivery Assignment</h1>
      <p>Hello ${deliveryPersonData.name},</p>
      <p>You have been assigned a new delivery.</p>
      <h2>Delivery Details</h2>
      <p><strong>Order ID:</strong> ${orderData._id}</p>
      <p><strong>Pickup Location:</strong> ${deliveryData.restaurantAddress.street}, ${deliveryData.restaurantAddress.city}</p>
      <p><strong>Delivery Location:</strong> ${deliveryData.deliveryAddress.street}, ${deliveryData.deliveryAddress.city}</p>
      <p><strong>Assigned At:</strong> ${new Date(deliveryData.assignedAt).toLocaleString()}</p>
      ${deliveryData.estimatedDeliveryTime ? `
        <p><strong>Estimated Delivery Time:</strong> ${new Date(deliveryData.estimatedDeliveryTime).toLocaleString()}</p>
      ` : ''}
      <p>Please check the app for more details.</p>
    `;
    
    return this.sendEmail(deliveryPersonData.email, subject, html);
  }
}

module.exports = new EmailService();