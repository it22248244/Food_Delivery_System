const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const userMiddleware = require('../middleware/user');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const router = express.Router();

// Add a token verification endpoint for other services
router.get('/verify-token', async (req, res) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Send user data
    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }
});

// Protected routes
router.use(authMiddleware.protect);

// Get delivery personnel (accessible to restaurant users)
router.get('/delivery-personnel', 
  authMiddleware.restrictTo('restaurant', 'admin'),
  async (req, res) => {
    try {
      const users = await User.find({ 
        role: 'delivery',
        isAvailable: true 
      }).select('name phone currentLocation vehicleType vehicleNumber rating');
      
      res.status(200).json({
        status: 'success',
        data: {
          users
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
  }
);

// Password update route
router.patch(
  '/updatePassword',
  userMiddleware.validatePassword,
  userMiddleware.verifyCurrentPassword,
  userController.updatePassword
);

// Profile routes
router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);

// Address routes
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userMiddleware.validateAddress, userController.addAddress);
router.patch('/addresses/:addressId', userMiddleware.validateAddress, userMiddleware.checkAddressExists, userController.updateAddress);
router.delete('/addresses/:addressId', userMiddleware.checkAddressExists, userController.deleteAddress);

// Admin routes
const adminRouter = express.Router();
adminRouter.use(authMiddleware.restrictTo('admin'));

// User management routes
adminRouter.get('/users', userController.getAllUsers);
adminRouter.get('/users/:userId', userController.getUser);
adminRouter.patch('/users/:userId', userController.updateUser);
adminRouter.delete('/users/:userId', userController.deleteUser);

// Financial routes
adminRouter.get('/transactions', userController.getTransactions);
adminRouter.get('/transactions/:transactionId', userController.getTransaction);
adminRouter.patch('/transactions/:transactionId/status', userController.updateTransactionStatus);

// Mount admin routes
router.use('/admin', adminRouter);

module.exports = router;