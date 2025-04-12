module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dedasfgsdfvdcvedfv',
  services: {
    userService: {
      url: process.env.USER_SERVICE_URL || 'http://user-service:3001',
      prefix: '/api/v1/users'
    },
    authService: {
      url: process.env.USER_SERVICE_URL || 'http://user-service:3001',
      prefix: '/api/v1/auth'
    },
    restaurantService: {
      url: process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:3002',
      prefix: '/api/v1/restaurants'
    },
    orderService: {
      url: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
      prefix: '/api/v1/orders'
    },
    deliveryService: {
      url: process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:3004',
      prefix: '/api/v1/deliveries'
    },
    paymentService: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005',
      prefix: '/api/v1/payments'
    },
    notificationService: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
      prefix: '/api/v1/notifications'
    }
  },
  rateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};