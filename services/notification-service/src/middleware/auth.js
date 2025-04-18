const axios = require('axios');
const config = require('../config/config');

// Protect routes - verify JWT token via User Service
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // Forward token to User Service for verification
    try {
      const response = await axios.get(`${config.servicesEndpoints.userService}/api/v1/users/verify-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Set user data from the response
      req.user = response.data.user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token or token expired. Please log in again.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during authentication.'
    });
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};