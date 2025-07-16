import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in your environment variables');
}

// Use a global variable to cache the connection in development
let cached = global._mongooseCache;

if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
        }).then((mongoose) => mongoose)
            .catch((err) => {
                cached.promise = null;
                throw err;
            });
    }
    try {
        cached.conn = await cached.promise;
        if (process.env.NODE_ENV !== 'production') {
            console.log('MongoDB connected');
        }
        return cached.conn;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}

export default dbConnect;
