import mongoose from "mongoose";
import { env } from "./environment.js";

/**
 * Connect to MongoDB instance using Mongoose.
 *
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // If in test or development without MongoDB running, provide clear advice
    if (env.NODE_ENV === "development") {
      console.warn(
        "[Database Warning] Make sure MongoDB is running locally or specify a valid MONGODB_URI in your .env file."
      );
    }
    throw error;
  }
}

/**
 * Disconnect from MongoDB instance.
 */
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("[Database] MongoDB Disconnected.");
  } catch (error) {
    console.error(`[Database Error] Disconnection failed: ${error.message}`);
  }
}
