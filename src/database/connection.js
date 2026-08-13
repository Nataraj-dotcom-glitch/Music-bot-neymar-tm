/**
 * Neymar Music™ — Database Connection
 * Developer/Brand: Dark_Alise Development
 */

import mongoose from 'mongoose';

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return mongoose.connection;
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/neymar_music';
  
  try {
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully to Neymar Music™ database.');
    return mongoose.connection;
  } catch (error) {
    console.warn('⚠️ MongoDB connection warning (falling back to memory cache mode if offline):', error.message);
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
