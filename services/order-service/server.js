const app = require('./src/app');
const config = require('./src/config/config');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log('Connected to MongoDB for Order Service');
    
    // Start the server
    const server = app.listen(config.port, () => {
      console.log(`Order Service running on port ${config.port}`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });