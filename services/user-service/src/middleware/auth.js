const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ 
        status: 'fail', 
        message: 'You are not logged in. Please log in to get access.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('Decoded JWT:', decoded);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      console.log('User not found for token:', decoded.id);
      return res.status(401).json({ 
        status: 'fail', 
        message: 'The user belonging to this token no longer exists.' 
      });
    }
    
    console.log('Current User:', {
      id: currentUser._id,
      role: currentUser.role,
      email: currentUser.email
    });
    
    // Grant access to protected route
    req.user = {
      id: currentUser._id,
      role: currentUser.role
    };
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Invalid token or authentication failed.' 
    });
  }
};

// Restrict access to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Skip role check for password update and profile routes
    if (req.path === '/updatePassword' || 
        req.path === '/updateMe' || 
        req.path === '/me' || 
        req.path.startsWith('/addresses')) {
      return next();
    }
    
    // For admin routes, check if user has admin role
    if (req.originalUrl.includes('/admin')) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
          status: 'fail', 
          message: 'You do not have permission to perform this action' 
        });
      }
      return next();
    }
    
    // For all other routes, check if user has the required role
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};