const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/FunnelsEye';

const connectDB = async () => {

  try {
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,             // max concurrent sockets
      socketTimeoutMS: 0,          // no socket timeout
      connectTimeoutMS: 30000,     // 30s connection timeout
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS : 10000
    });

    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Initial Connection Failed:', err.message);
    process.exit(1);
  }
};

// Log errors & reconnects
mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected');
});

// Not strictly needed but nice for debugging
mongoose.connection.on('connected', () => {
  console.log('🔌 Mongoose connected to DB');
});

module.exports = { connectDB };
