const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }
  
  // Register new user
  async signup(userData) {
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Create user
      const user = await User.create(userData);
      
      // Generate token
      const token = this.generateToken(user._id);
      
      return {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
  
  // Login user
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Generate token
      const token = this.generateToken(user._id);
      
      return {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  
  // Verify token
  async verifyToken(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { user };
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
}

module.exports = new AuthService();