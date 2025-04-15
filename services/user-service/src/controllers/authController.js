const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Generate JWT token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiration
  });
};

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address
    });
    
    // Generate JWT token
    const token = signToken(newUser._id, newUser.role);
    
    // Remove password from output
    newUser.password = undefined;
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }
    
    // Find user and check if password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }
    
    // If everything is ok, send token to client
    const token = signToken(user._id, user.role);
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      token,
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