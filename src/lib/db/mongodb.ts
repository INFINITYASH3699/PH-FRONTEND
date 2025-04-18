import mongoose from 'mongoose';

// Use MONGODB_URI_AUTH for authentication or fallback to MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI_AUTH || process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI_AUTH or MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Check if we're using placeholder MongoDB URI
  if (MONGODB_URI.includes('placeholder')) {
    console.warn('Using placeholder MongoDB URI. Database operations will be mocked.');
    return { connection: { readyState: 1 } }; // Fake connected state
  }

  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10, // Limit the maximum number of connections in the pool
      serverSelectionTimeoutMS: 10000, // Give up initial connection after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
