import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is missing. Please set it in your .env file.');
}

let cachedConnection = null;
let cachedPromise = null;

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
    };
    
    console.log('Connecting to MongoDB...');
    cachedPromise = mongoose.connect(MONGODB_URI, opts).then((db) => {
      console.log('MongoDB connected successfully');
      cachedConnection = db;
      return db;
    }).catch((error) => {
      console.error('Error connecting to MongoDB:', error.message);
      cachedPromise = null;
      throw error;
    });
  }

  return cachedPromise;
}
