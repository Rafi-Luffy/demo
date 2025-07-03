import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Enhanced MongoDB configuration for optimal performance
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/charity-platform', {
      // Connection pool optimizations
      maxPoolSize: 20, // Increase pool size for better concurrency
      minPoolSize: 5,  // Maintain minimum connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Timeout optimizations
      serverSelectionTimeoutMS: 10000, // Wait 10 seconds for server selection
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 10000, // Connection timeout
      heartbeatFrequencyMS: 10000, // Heartbeat frequency
      
      // Write concern optimizations
      writeConcern: {
        w: 'majority',
        j: true, // Wait for journal acknowledgment
        wtimeout: 5000
      },
      
      // Read preference for better performance
      readPreference: 'primaryPreferred',
      
      // Buffer commands for better performance
      bufferCommands: false,
      
      // Compression for better network performance
      compressors: ['zlib'],
      zlibCompressionLevel: 6
    });

    console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 MongoDB Connection Pool: Max ${20}, Min ${5}`);

    // Enhanced connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📤 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    mongoose.connection.on('fullsetup', () => {
      console.log('✅ MongoDB replica set connected');
    });

    mongoose.connection.on('timeout', () => {
      console.warn('⏰ MongoDB connection timeout');
    });

    // Performance monitoring
    mongoose.connection.on('open', () => {
      console.log('🚀 MongoDB connection pool ready');
    });

    // Graceful close on app termination
    const gracefulClose = async () => {
      console.log('🔄 Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed gracefully');
      process.exit(0);
    };

    process.on('SIGINT', gracefulClose);
    process.on('SIGTERM', gracefulClose);

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Set mongoose global options for better performance
mongoose.set('strictQuery', true);
mongoose.set('strictPopulate', false);
mongoose.set('bufferCommands', false);

export default connectDB;
