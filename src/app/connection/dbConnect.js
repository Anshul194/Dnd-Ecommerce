import mongoose from "mongoose";

async function dbConnect(dbUri) {
  console.log("Connecting to MongoDB...", dbUri);
  const defaultUri = process.env.MONGODB_URI;
  const uri = dbUri || defaultUri;
  console.log("Using URI:", uri);
  if (!uri) {
    const err = new Error("DB not found");
    err.status = 404;
    throw err;
  }
  // Use a cache key per URI to allow multiple connections
  const cacheKey = "_mongooseCache_" + Buffer.from(uri).toString("base64");
  let cached = global[cacheKey];
  if (!cached) {
    cached = global[cacheKey] = { conn: null, promise: null };
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    if (uri === defaultUri) {
      // Use default connection for global DB
      cached.promise = mongoose
        .connect(uri, {
          bufferCommands: false,
          maxPoolSize: 10,
        })
        .then((mongoose) => mongoose.connection)
        .catch((err) => {
          cached.promise = null;
          throw err;
        });
    } else {
      // Use createConnection for tenant DBs
      const conn = mongoose.createConnection(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
      });
      cached.promise = new Promise((resolve, reject) => {
        conn.once("open", () => resolve(conn));
        conn.on("error", (err) => {
          cached.promise = null;
          reject(err);
        });
      });
    }
  }
  try {
    cached.conn = await cached.promise;
    if (process.env.NODE_ENV !== "production") {
      console.log("MongoDB connected:", uri);
    }
    return cached.conn;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export default dbConnect;
