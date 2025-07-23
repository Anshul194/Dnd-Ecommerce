import mongoose from 'mongoose';

async function dbConnect(dbUri) {
    const uri = dbUri || process.env.MONGODB_URI;
    if (!uri) {
        const err = new Error('DB not found');
        err.status = 404;
        throw err;
    }
    // Use a cache key per URI to allow multiple connections
    const cacheKey = '_mongooseCache_' + Buffer.from(uri).toString('base64');
    let cached = global[cacheKey];
    if (!cached) {
        cached = global[cacheKey] = { conn: null, promise: null };
    }
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
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
            console.log('MongoDB connected:', uri);
        }
        return cached.conn;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}

export default dbConnect;
