module.exports = {
    port: process.env.PORT || 3001,
    mongoURI: process.env.MONGO_URI || 'mongodb+srv://thevsami:thevin@cluster0.97wyf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    jwtSecret: process.env.JWT_SECRET || 'dedasfgsdfvdcvedfv',
    jwtExpiration: '24h'
  };