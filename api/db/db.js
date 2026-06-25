import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://srujanakulawar_db_user:tcU31htRRb8UYg5V@swastiksarees.xbuihtq.mongodb.net/swastiksarees?retryWrites=true&w=majority&appName=swastiksarees';

let cachedConnection = null;

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const opts = {
      bufferCommands: false,
    };
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const db = await mongoose.connect(MONGODB_URI, opts);
    console.log('MongoDB connected successfully');
    cachedConnection = db;
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
}
