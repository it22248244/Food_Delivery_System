const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/config');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to parse body and add logging
router.use(express.json());
router.use((req, res, next) => {
  console.log('==== API Gateway Routing Debug ====');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Original Full URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Actual Path:', req.path);
  console.log('HTTP Method:', req.method);
  
  // Log headers
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  
  // Log body (if exists)
  if (req.body) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: config.rateLimiter.windowMs,
  max: config.rateLimiter.max,
  standardHeaders: true,
  legacyHeaders: false
});
router.use(limiter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date()
  });
});

// Admin route protection middleware - ADD THIS NEW MIDDLEWARE HERE
router.use((req, res, next) => {
  // Check if route is admin route
  if (req.path.includes('/admin')) {
    console.log('Admin route detected, checking authentication');
    
    // Require authentication for all admin routes
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Admin access attempt without authentication');
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required for admin access'
      });
    }
    
    // Verify token here before allowing access to admin endpoints
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Only allow admin role to access admin endpoints
      if (!decoded.role || decoded.role !== 'admin') {
        console.log(`User with role ${decoded.role || 'undefined'} attempted to access admin endpoint`);
        return res.status(403).json({
          status: 'error',
          message: 'Access forbidden: Admin privileges required'
        });
      }
      
      console.log('Admin authentication successful');
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
  }
  
  next();
});

// Dynamic proxy middleware creator
function createServiceProxy(serviceConfig) {
  return createProxyMiddleware({
    target: serviceConfig.url,
    changeOrigin: true,
    pathRewrite: (path) => {
      console.log('==== Proxy Path Rewrite ====');
      console.log('Input Path:', path);
      console.log('Service Prefix:', serviceConfig.prefix);
      
      // Carefully remove /api and the service-specific prefix
      const rewrittenPath = path.replace(`/api${serviceConfig.prefix}`, '') || '/';
      
      console.log('Rewritten Path:', rewrittenPath);
      return rewrittenPath;
    },
    onProxyReq: async (proxyReq, req, res) => {
      console.log('==== Proxy Request Details ====');
      console.log('Target Host:', proxyReq.host);
      console.log('Target Path:', proxyReq.path);
      console.log('Method:', req.method);

      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      console.log('Authorization Header:', authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        console.log('Extracted Token:', token);
        
        try {
          const decoded = jwt.verify(token, config.jwtSecret);
          console.log('JWT Verification Success. Decoded Token:', decoded);
          
          // Add user role and ID to headers
          if (decoded.role) {
            console.log('Role found in JWT:', decoded.role);
            proxyReq.setHeader('X-User-Role', decoded.role);
            proxyReq.setHeader('X-User-ID', decoded.id);
          } else {
            console.log('No role in JWT, attempting to fetch from user service');
            // If role is not in token, try to get it from the user service
            const userService = config.services.userService;
            const userServiceUrl = `${userService.url}/users/${decoded.id}`;
            console.log('Fetching user data from:', userServiceUrl);
            
            try {
              const userResponse = await fetch(userServiceUrl, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              console.log('User service response status:', userResponse.status);
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('User service response data:', userData);
                
                if (userData.data.user.role) {
                  console.log('Role from user service:', userData.data.user.role);
                  proxyReq.setHeader('X-User-Role', userData.data.user.role);
                  proxyReq.setHeader('X-User-ID', decoded.id);
                } else {
                  console.log('No role found in user service response');
                }
              } else {
                console.log('Failed to fetch user data:', await userResponse.text());
              }
            } catch (fetchError) {
              console.error('Error fetching user data:', fetchError);
            }
          }
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError);
        }
      } else {
        console.log('No valid authorization header found');
      }

      // Log final headers being sent to the service
      console.log('Final request headers:', proxyReq.getHeaders());

      // Safely write request body
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('==== Proxy Response ====');
      console.log('Status Code:', proxyRes.statusCode);
      console.log('Headers:', JSON.stringify(proxyRes.headers, null, 2));
    },
    onError: (err, req, res) => {
      console.error('==== Proxy Error ====');
      console.error('URL:', req.originalUrl);
      console.error('Method:', req.method);
      console.error('Error Message:', err.message);
      console.error('Error Code:', err.code);
      
      // Safely send error response only if headers not already sent
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Service proxy error',
          details: {
            message: err.message,
            code: err.code
          }
        });
      }
    },
  });
}

// Custom routing middleware to handle service proxying
router.use((req, res, next) => {
  // Find the matching service based on the path
  const matchedService = Object.entries(config.services).find(([key, service]) => {
    // Check if the path starts with the service's prefix (without /api)
    return req.path.startsWith(service.prefix.replace('/api', ''));
  });

  if (matchedService) {
    const [serviceKey, serviceConfig] = matchedService;
    console.log(`Matched Service: ${serviceKey}`);
    console.log('Service Configuration:', JSON.stringify(serviceConfig, null, 2));
    
    // Create and use the proxy for the matched service
    const proxy = createServiceProxy(serviceConfig);
    return proxy(req, res, next);
  }

  next();
});

// Fallback route handler
router.use((req, res) => {
  console.error('==== No Route Found ====');
  console.error('URL:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Path:', req.path);
  
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    details: 'No matching service proxy found'
  });
});

module.exports = router;