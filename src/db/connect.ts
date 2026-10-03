import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb+srv://abiwolflearn_db_user:RKerhRgN3KW8fCGA@cluster0.3kp5b57.mongodb.net/adey_draw_db?retryWrites=true&w=majority';

let isConnected = false;
let isUsingFallbackStore = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    // Attempt Mongoose connection with 8-second timeout for MongoDB Atlas SSL connection
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log('[Database] Connected to MongoDB Atlas via Mongoose');
  } catch (error) {
    console.warn('[Database] MongoDB connection failed or not reachable. Using in-memory database store as fallback.', error);
    isUsingFallbackStore = true;
    isConnected = true;
  }
}

export function isFallbackStore(): boolean {
  return isUsingFallbackStore;
}
