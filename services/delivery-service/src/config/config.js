module.exports = {
    port: process.env.PORT || 3004,
    mongoURI: process.env.MONGO_URI || 'mongodb+srv://thevsami:thevin@cluster0.97wyf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    servicesEndpoints: {
      userService: process.env.USER_SERVICE_URL || 'http://localhost:3001/api/v1',
      restaurantService: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002/api/v1',
      orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3003/api/v1',
      notificationService: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006/api/v1'
    }
  };