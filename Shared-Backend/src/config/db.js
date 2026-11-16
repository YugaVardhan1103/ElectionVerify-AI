
import mongoose from "mongoose";
import { env } from "./environment.js";

let connectionPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log(
        `[Database] MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`
      );

      return mongoose;
    })
    .catch((error) => {
      console.error(
        `[Database Error] MongoDB connection failed: ${error.message}`
      );

      throw error;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    connectionPromise = null;
    console.log("[Database] MongoDB Disconnected.");
  } catch (error) {
    console.error(
      `[Database Error] Disconnection failed: ${error.message}`
    );
  }
}
