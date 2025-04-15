const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService {
  // Get user by ID
  async getUserById(id) {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }
  
  // Update user
  async updateUser(id, userData, currentUserId) {
    try {
      // Only allow users to update their own profile, unless they're an admin
      const currentUser = await User.findById(currentUserId);
      
      if (id !== currentUserId && currentUser.role !== 'admin') {
        throw new Error('You are not authorized to update this user');
      }
      
      // Don't allow role updates unless by admin
      if (userData.role && currentUser.role !== 'admin') {
        delete userData.role;
      }
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }
      
      const user = await User.findByIdAndUpdate(id, userData, {
        new: true,
        runValidators: true
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }
  
  // Get all users (admin only)
  async getAllUsers() {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }
  
  // Delete user (admin only)
  async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
  
  // Update user password
  async updateUserPassword(userId, currentPassword, newPassword) {
    try {
      // Get user with password field
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if current password is correct
      if (!(await user.correctPassword(currentPassword))) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      return user;
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }
}

module.exports = new UserService();