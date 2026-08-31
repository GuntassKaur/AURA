import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

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
  // If no URI is configured, skip DB (demo/offline mode)
  if (!MONGODB_URI) {
    console.warn('[EcoSphere] MONGODB_URI not set — running in offline/demo mode. DB features disabled.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log(`[EcoSphere] Connecting to MongoDB...`);
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('[EcoSphere] MongoDB connected successfully.');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('[EcoSphere] MongoDB connection failed:', e);
    return null; // graceful fallback — don't crash the server
  }

  return cached.conn;
}

export default dbConnect;
