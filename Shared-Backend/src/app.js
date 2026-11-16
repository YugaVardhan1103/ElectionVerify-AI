
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/environment.js";
import { connectDB } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Trust the Vercel reverse proxy.
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*")
      ) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS policy violation: Origin not allowed.")
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request logger
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(
  "/api",
  async (req, res, next) => {
    // Health and metadata endpoints do not require MongoDB.
    if (
      env.NODE_ENV === "test" ||
      req.path === "/health" ||
      req.path === "/meta"
    ) {
      return next();
    }

    try {
      await connectDB();
      next();
    } catch (error) {
      next(error);
    }
  },
  apiLimiter,
  apiRoutes
);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
