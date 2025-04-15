const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Please provide address type'],
    enum: ['Home', 'Work', 'Other']
  },
  street: {
    type: String,
    required: [true, 'Please provide street address']
  },
  city: {
    type: String,
    required: [true, 'Please provide city']
  },
  state: {
    type: String,
    required: [true, 'Please provide state']
  },
  postalCode: {
    type: String,
    required: [true, 'Please provide postal code']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant', 'delivery', 'admin'],
    default: 'customer'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  addresses: [addressSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check if the password is correct
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;