module.exports = {
    port: process.env.PORT || 3006,
    mongoURI: process.env.MONGO_URI || 'mongodb+srv://thevsami:thevin@cluster0.97wyf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    servicesEndpoints: {
      userService: process.env.USER_SERVICE_URL || 'http://localhost:3001/api/v1',
      restaurantService: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002/api/v1',
      orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3003/api/v1',
      deliveryService: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3004/api/v1',
      paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005/api/v1'
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'email@example.com',
        pass: process.env.EMAIL_PASS || 'password'
      }
    },
    sms: {
      apiUrl: process.env.SMS_API_URL || 'https://api.example.com/sms',
      apiKey: process.env.SMS_API_KEY || 'your-api-key',
      senderId: process.env.SMS_SENDER_ID || 'FOODDEL'
    }
  };