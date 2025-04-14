module.exports = {
  port: process.env.PORT || 3003,
  mongoURI: process.env.MONGO_URI || 'mongodb+srv://thevsami:thevin@cluster0.97wyf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  servicesEndpoints: {
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3001/api/v1',
    restaurantService: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002/api/v1',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005/api/v1',
    notificationService: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006/api/v1',
    deliveryService: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3004/api/v1'
  }
};