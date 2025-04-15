const User = require('../models/User');
const userService = require('../services/userService');
const Transaction = require('../models/Transaction');

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update current user profile
exports.updateMe = async (req, res) => {
  try {
    // Check if user is trying to update password
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updatePassword.'
      });
    }
    
    // Filter unwanted fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'phone');
    
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users'
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating user'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting user'
    });
  }
};

// Helper function to filter objects
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get user addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    
    res.status(200).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const { type, street, city, state, postalCode, isDefault } = req.body;
    
    // If setting as default, unset other default addresses
    if (isDefault) {
      await User.updateOne(
        { _id: req.user.id },
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { addresses: { type, street, city, state, postalCode, isDefault } } },
      { new: true, runValidators: true }
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { type, street, city, state, postalCode, isDefault } = req.body;
    const addressId = req.params.addressId;
    
    // If setting as default, unset other default addresses
    if (isDefault) {
      await User.updateOne(
        { _id: req.user.id },
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }
    
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, 'addresses._id': addressId },
      {
        $set: {
          'addresses.$.type': type,
          'addresses.$.street': street,
          'addresses.$.city': city,
          'addresses.$.state': state,
          'addresses.$.postalCode': postalCode,
          'addresses.$.isDefault': isDefault
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Address not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    // Update password using save() to trigger password hashing middleware
    req.user.password = newPassword;
    await req.user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to update password'
    });
  }
};

// Financial Transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .populate('restaurantId', 'name');
      
    res.status(200).json({
      status: 'success',
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching transactions'
    });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('userId', 'name email')
      .populate('restaurantId', 'name');
      
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching transaction'
    });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.transactionId,
      { status: req.body.status },
      { new: true }
    ).populate('userId', 'name email')
     .populate('restaurantId', 'name');
     
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating transaction status'
    });
  }
};