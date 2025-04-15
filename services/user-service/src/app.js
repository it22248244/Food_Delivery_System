const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-service' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

module.exports = app;