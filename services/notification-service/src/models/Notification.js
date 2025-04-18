const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  type: {
    type: String,
    enum: [
      'ORDER_CONFIRMATION',
      'ORDER_STATUS_UPDATE',
      'PAYMENT_CONFIRMATION',
      'DELIVERY_ASSIGNMENT',
      'DELIVERY_STATUS',
      'ADMIN_ALERT'
    ],
    required: true
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'push'],
    required: true
  },
  content: {
    subject: String,
    message: {
      type: String,
      required: true
    }
  },
  metadata: {
    orderId: mongoose.Schema.Types.ObjectId,
    restaurantId: mongoose.Schema.Types.ObjectId,
    deliveryId: mongoose.Schema.Types.ObjectId,
    paymentId: mongoose.Schema.Types.ObjectId
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  failureReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ 'metadata.orderId': 1 });
notificationSchema.index({ type: 1, status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;