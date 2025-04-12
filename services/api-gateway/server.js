const app = require('./src/app');
const config = require('./src/config/config');

const server = app.listen(config.port, () => {
  console.log(`API Gateway running on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});