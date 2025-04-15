const User = require('../models/User');

// Middleware to get user addresses
exports.getUserAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    req.userAddresses = user.addresses || [];
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Middleware to validate address data
exports.validateAddress = (req, res, next) => {
  const { type, street, city, state, postalCode, isDefault } = req.body;
  
  if (!type || !street || !city || !state || !postalCode) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide all required address fields'
    });
  }
  
  next();
};

// Middleware to check if address exists
exports.checkAddressExists = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addressId = req.params.addressId;
    
    if (!user.addresses || !user.addresses.some(addr => addr._id.toString() === addressId)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Address not found'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Middleware to validate password data
exports.validatePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide both current and new password'
    });
  }
  
  if (newPassword.length < 8) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password must be at least 8 characters long'
    });
  }
  
  next();
};

// Middleware to verify current password
exports.verifyCurrentPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    if (!(await user.correctPassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 