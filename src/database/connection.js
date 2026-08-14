/**
 * Neymar Music™ — Database Connection
 * Developer/Brand: Dark_Alise Development
 */

import mongoose from 'mongoose';

let isConnected = false;

// Attach persistent mongoose event listeners
mongoose.connection.on('error', (err) => {
  console.error('❌ [MONGODB] Connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [MONGODB] Disconnected from MongoDB. In-memory cache mode active.');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 [MONGODB] Reconnected to MongoDB successfully.');
  isConnected = true;
});

export async function connectDatabase() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri === 'mongodb://localhost:27017/neymar_music') {
    console.log('📦 [DATABASE] Running with Memory Cache fallback (Set MONGODB_URI in .env for persistent database).');
    return null;
  }

  try {
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 4000
    });

    isConnected = true;
    console.log('✅ [DATABASE] Connected to MongoDB database successfully.');
    return mongoose.connection;
  } catch (error) {
    console.warn('⚠️ [DATABASE] Could not connect to MongoDB:', error.message);
    console.log('📦 [DATABASE] Running in in-memory mode without interruption.');
    return null;
  }
}

export function getConnectionStatus() {
  return isConnected && mongoose.connection.readyState === 1;
}

export default {
  connectDatabase,
  getConnectionStatus,
  mongoose
};
