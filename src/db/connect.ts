import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/number-draw-db';

let isConnected = false;
let isUsingFallbackStore = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    // Attempt Mongoose connection with 3-second timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('[Database] Connected to MongoDB via Mongoose');
  } catch (error) {
    console.warn('[Database] MongoDB connection failed or not available. Using in-memory database store for sandbox environment.');
    isUsingFallbackStore = true;
    isConnected = true;
  }
}

export function isFallbackStore(): boolean {
  return isUsingFallbackStore;
}
