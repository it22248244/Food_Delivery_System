const axios = require('axios');
const config = require('../config/config');

// Authentication middleware that verifies JWT token with the user service
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // Get user role and ID from headers
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    
    if (!userRole || !userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'User role or ID not found in request headers.'
      });
    }
    
    // Set user information
    req.user = {
      id: userId,
      role: userRole
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication failed.'
    });
  }
};

// Restrict access to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};