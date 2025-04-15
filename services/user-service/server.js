const mongoose = require('mongoose');
const app = require('./src/app');
const config = require('./src/config/config');

// Connect to MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
const server = app.listen(config.port, () => {
  console.log(`User service running on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});