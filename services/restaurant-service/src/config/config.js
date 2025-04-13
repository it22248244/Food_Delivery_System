module.exports = {
    port: process.env.PORT || 3002,
    mongoURI: process.env.MONGO_URI || 'mongodb+srv://thevsami:thevin@cluster0.97wyf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001/api/v1'
  };